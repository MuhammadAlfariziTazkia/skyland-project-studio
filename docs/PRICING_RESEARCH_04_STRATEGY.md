# 4 — Strategi scope dan estimator

Usulan: **8 Oktober 2026**. **Revisi kalibrasi: 10 Oktober 2026, Asia/Tokyo.**
Status: **usulan desain scope/estimator, sebagian sudah diotorisasi untuk
diimplementasikan.** Basis: [pasar/scope](PRICING_RESEARCH_01_MARKET.md),
[simulasi](PRICING_RESEARCH_02_SIMULATION.md),
[akar penyebab](PRICING_RESEARCH_03_EVALUATION.md), commit `243a9d4`.
Keputusan komersial (bauran pasar, termin pembayaran, diskon, apa yang tidak
dijual) ada di [dokumen 5](PRICING_RESEARCH_05_COMMERCIAL.md).

## Apa yang berubah pada revisi 10 Oktober 2026

Rancangan scope dan estimator versi pertama **dipertahankan**: pemisahan
Configure/Extend/Custom, capability variant berbatas, gate risiko yang lepas dari
nominal, charge ownership, dan quote snapshot semuanya tetap. Empat hal diperbaiki:

1. **Cost floor dipindahkan ke yen.** Versi pertama memakai asumsi biaya internal
   Rp55.000/jam. Itu keliru untuk pemilik yang membayar sewa, pajak, dan pensiun
   dalam yen — ia menyatakan biaya terlalu rendah sekitar 2,5x. Lantai biaya
   sekarang didenominasi JPY dan diturunkan ke pasar lain, bukan sebaliknya.
2. **Rate card diganti.** Versi pertama mengakui rate card-nya di-reverse-engineer
   dari empat anchor yang sama yang dipakai untuk memvalidasinya — sirkular.
   Rate card baru diturunkan dari lantai biaya yen dan keputusan bauran pasar
   pemilik, lalu diuji terhadap harga vendor nyata.
3. **Penumpukan reserve dihapus.** Versi pertama menambahkan cadangan 10-25% di
   atas jam yang sudah berisi UAT/runbook/load test kelas agency. Itu
   double-count risiko yang dokumen ini sendiri melarang di bagian 6.
4. **Urutan implementasi dibalik sebagian.** Membangun estimator work-package
   lengkap lebih dulu adalah urutan terbalik, karena dokumen ini mengakui
   kalibrasinya tidak sah tanpa jam aktual. Guardrail murah dikerjakan dulu;
   estimator menunggu data dari proyek nyata.
## Keputusan utama yang disarankan

Bangun **estimator scope dan effort yang terstruktur**, dengan AI sebagai
pewawancara/penerjemah kebutuhan dan kalkulator deterministik sebagai otoritas
biaya. Pertahankan pengalaman konsultasi sederhana; detail teknis berada dalam
spesifikasi internal dan breakdown yang dapat dibuka bila dibutuhkan.

Sistem yang baik harus mampu mengatakan “harga pasti”, “rentang dengan asumsi
terbatas”, atau “bagian ini perlu discovery”. Kemampuan menolak kepastian palsu
adalah keberhasilan fitur harga, bukan kegagalan AI.

Jangan langsung menaikkan semua angka, mengganti model AI, atau menyerahkan
penetapan nominal ke model. Jangan menjadikan empat sample satu-satunya acuan:
mereka berguna sebagai kasus kalibrasi awal, belum mewakili semua calon klien.

## 1. Pisahkan tiga jenis layanan yang secara bisnis berbeda

| Jalur | Definisi | Cara harga | Cocok untuk |
| --- | --- | --- | --- |
| Configure | Template/platform matang, konfigurasi dan styling terbatas | Paket terikat batas + addon terdefinisi | Website sederhana, store theme, booking SaaS |
| Extend | Platform/library matang + UI dan workflow tertentu dibuat khusus | Work package terukur + fit-gap integrasi | Lembar; sebagian Kurohane |
| Custom | Model data/proses bisnis inti dibuat khusus | Discovery → estimate effort/risk → penawaran | Kurohane custom; Arden |

“Full version” dapat memakai platform matang. Kepemilikan kode, hak lisensi,
fitur yang dapat diubah dan biaya bulanan harus ditulis eksplisit. Pilihan jalur
tidak boleh menyembunyikan pengurangan scope. Referensi harga subscription dan
fee custom telah dipisahkan pada dokumen 1.

Paket marketing seperti company_profile/online_store/booking tetap berguna
untuk navigasi. Di estimator, paket menjadi kumpulan work package beserta
batasnya, bukan base besar yang ditambah item overlap tanpa jejak.

## 2. Model data harga yang disarankan

**Revisi 10 Okt 2026 — apa yang dikirim sekarang.** Delapan lapisan di bawah
adalah bentuk akhir yang dituju, bukan pekerjaan satu rilis. Studio ini belum
punya klien; membangun seluruh model data harga lebih dulu menunda hal yang
benar-benar menaikkan penghasilan. Yang dikirim pada tahap pertama hanya tiga:

| Lapisan | Dikirim sekarang? | Alasan |
| --- | --- | --- |
| MarketPolicy | **Ya** | Tanpa ini Jepang tidak bisa diquote sama sekali, dan batas ID/GLOBAL tetap meleset 9,8x |
| QuotePolicy (gate risiko + lantai biaya) | **Ya** | Mencegah harga pasti untuk pekerjaan berisiko; manfaat terbesar per jam kerja |
| QuoteSnapshot | **Ya** | Murah, dan tanpanya harga bisa berubah diam-diam antara quote dan order |
| Capability + variant/limit | Sebagian | Batas tertulis diperlukan sekarang; resolver penuh belum |
| ScopeParameters | Belum | Perlu tahu parameter mana yang benar-benar mengubah jam; butuh data aktual |
| ScreenTemplate | Belum | Model halaman saat ini sudah cukup setelah truncation diperbaiki |
| Workflow | Belum | Berharga, tetapi tidak memblokir harga yang benar |
| WorkPackage (effort band) | Belum | **Kalibrasinya tidak sah tanpa jam aktual dari 5+ proyek** |

Lapisan yang ditunda tetap didokumentasikan di bawah supaya keputusan desainnya
tidak hilang, bukan supaya dikerjakan sekarang.


Pisahkan **scope katalog**, **usaha pengerjaan**, dan **kebijakan komersial**.
Tidak harus menjadi banyak layanan/server; bisa tetap beberapa JSON/TS di
repository yang sama. Bentuk berikut rancangan kontrak, bukan kode produksi.

| Lapisan | Field minimum | Tanggung jawab |
| --- | --- | --- |
| MarketPolicy | market ID/JP/US/GLOBAL_OTHER, currency, rounding, validity, rate version | Lokalitas bisnis; GLOBAL lama jangan otomatis dianggap AS |
| Capability | stable id, variant/tier, included outcomes, exclusions, requires, conflicts | Apa yang dijanjikan; bukan hanya nama fitur |
| ScopeParameters | typed values, source user/inferred/default, confirmed, blockingUnknowns | Skala dan kedalaman yang mengubah pekerjaan |
| ScreenTemplate | purpose, actor, template family, complexity, ownerWorkPackage | Desain/layout; records tidak menjadi halaman baru |
| Workflow | actor, trigger, states, success, failure, admin recovery | Pekerjaan bisnis termasuk exception |
| WorkPackage | owned outcomes, baseline hours low/likely/high, unit, quantity bands, dependencies | Estimasi effort dan mencegah double counting |
| QuotePolicy | fixed eligibility, risk gates, rate card, cost floor, promo budget | Menentukan apakah bisa berkomitmen dan nominalnya |
| QuoteSnapshot | scopeHash, catalogVersion, quoteVersion, market/currency, choices, issuedAt/expiresAt | Konsistensi UI, order, email dan masa berlaku |

Parameter penting yang belum tersedia:

| Domain | Parameter yang harus diketahui | Jangan gunakan sebagai tarif linear secara buta |
| --- | --- | --- |
| Konten | Template unik, panjang/tipe konten, assets ready, bahasa, siapa input | 100 artikel dalam satu template bukan 100 desain halaman |
| CMS | Model data, relasi, publish rules, role matrix, approval, bulk actions | Setiap screen CRUD tidak selalu perlu modul berbayar sendiri |
| Commerce | Platform, gateway, varian, SKU, stock rules, preorder, refund, shipping, import quality | 100 SKU tidak selalu 10× effort 10 SKU bila CSV bersih |
| Booking | Cabang, staff, resource coupling, durasi, buffer, cutoff, cuti, nominasi, cancellation, guest/member | 4 vs 5 staff pada engine sama bisa tanpa tambahan dev |
| Integrasi | Provider, scope endpoint, satu/dua arah, webhook, auth, retries, sandbox, migration | Dua provider tidak selalu dua kali pekerjaan yang identik |
| Operasional | Volume target, concurrency, data sensitivity, recovery, audit, support level | Uptime/SLA bukan checkbox berharga sama untuk semua proyek |
| Lelang | Model bid, tie/close/extension rules, eligibility, deposit, operator, dokumentasi, dispute workflow | Tidak boleh direduksi menjadi catalog+payment |

Gunakan band yang punya perubahan teknik nyata. Misalnya satu cabang/maksimal
5 staff dengan satu resource per appointment termasuk konfigurasi standar;
multi resource yang harus tersedia bersamaan adalah variant berbeda. Biaya per
staff hanya untuk pekerjaan setup/input yang memang dilakukan per staff.

## 3. Ubah katalog dari label menjadi janji yang bisa diperiksa

Contoh batas produk untuk versi pertama estimator:

| Capability/variant | Termasuk | Yang memicu estimate ulang |
| --- | --- | --- |
| cms.standard | Maksimal 3 model sederhana, satu editor role, CRUD/media/draft, platform admin siap | Model berelasi kompleks, approval bertingkat, audit khusus |
| commerce.standard | Satu merchant/currency/gateway, cart, server total, webhook idempotent, order/refund standar platform | Split payments, subscription, ERP, preorder lintas shipment |
| booking.standard | Satu lokasi, ≤5 staff, variable duration, holidays/buffer, guest link, cancel/reschedule, email, anti overlap | Multi-resource, multi-location capacity, external two-way sync |
| integration.standard | Provider yang telah diuji, satu arah, dokumentasi+test account siap, retry/logging dasar | Undocumented API, custom reconciliation, sync conflict handling |
| auction.core | Timed auction dengan kontrak bid/closing/audit tertulis | **Selalu discovery/manual review pada versi pertama** |

Batas di atas adalah **usulan commercial scope**, bukan klaim semua pekerjaan
dapat diselesaikan dalam satu harga lama. Basic security, akses data sesuai
pemilik, validasi server, error handling dan test alur kritis termasuk definition
of done; klien tidak membeli keamanan dasar sebagai opsi terpisah.

Pemisahan charge ownership:

- Payment module memiliki gateway/webhook/refund standar; jangan menagih
  `api_integration` kedua kali untuk gateway yang sama.
- CMS memiliki admin CRUD standar; modul domain hanya menagih tambahan model
  dan workflow yang belum dimiliki CMS.
- Auth pelanggan dan login admin punya kebutuhan berbeda; role matrix menjadi
  satu dependency bersama, bukan auth berulang untuk setiap fitur.
- Template product detail dimiliki storefront work package; jumlah buku
  memengaruhi import/QA data, bukan jumlah template.
- Full custom design hanya memengaruhi UI hours. Animasi standar sudah dimiliki
  desain; motion khusus di luar batas diberi paket terpisah.
- Content none membuat work package penulisan/input yang eksplisit;
  tidak ada multiplier konten atas payment/booking backend.

Resolver deterministik membentuk union work packages dari fitur + dependency.
Setiap outcome hanya mempunyai satu pemilik biaya. Dependency yang sama
dimasukkan satu kali. Fitur included tetap aktif dan ditampilkan sebagai
included yang tidak bisa dimatikan tanpa mengganti paket/variant.

## 4. Alur konsultasi baru

| Tahap | Tindakan | Kriteria lanjut |
| --- | --- | --- |
| A. Brief | Pengguna menjelaskan bisnis; pilih negara pasar, bahasa website, tujuan | Negara tidak disimpulkan dari bahasa chat |
| B. Draft scope | AI ekstrak actor, flow, capability, kandidat jalur, fakta/dugaan/unknown | Tidak memuat nominal atau “harga cocok budget” |
| C. Pertanyaan adaptif | Tanya sedikit per putaran berdasarkan dampak effort/risiko | Blocking unknown terjawab atau dialihkan discovery |
| D. Normalisasi | Kode resolve dependency, coverage, duplicate, limits, risk flags | Scope valid secara bisnis, bukan hanya JSON valid |
| E. Scope review | Tampilkan hasil yang didapat, batas, asumsi dan biaya berulang | Pengguna mengonfirmasi kebutuhan utama |
| F. Estimasi | Kode hitung effort/rate/floor/status; opsional alternatif SaaS | Status sesuai tingkat kepastian |
| G. Preview | Homepage menggambarkan scope publik; beri batas preview | Mockup tidak dianggap bukti seluruh fitur sudah berjalan |
| H. Quote/order | Gunakan scope snapshot yang sama; validate promo di server | Versi/expiry dicek; perubahan harga tampil sebelum order |

Tetap dua atau tiga pertanyaan singkat per layar untuk mengurangi beban,
tetapi jangan mengunci **total seluruh konsultasi** pada dua pertanyaan.
Jumlah putaran dapat dibatasi dengan menawarkan discovery, bukan mengarang
jawaban yang kritis. Pengguna bisa memilih “belum tahu”; itu menjadi unknown
yang ditangani sistem secara eksplisit.

Contoh pertanyaan berdampak tinggi:

- Tegak: “Siapa yang memperbarui proyek dan artikel?”; “Konten awal disiapkan
  tim Anda atau perlu kami tulis?”; “Peta hanya menampilkan area atau perlu
  pencarian lokasi interaktif?”
- Lembar: “Sudah memakai platform toko tertentu?”; “Apakah preorder boleh
  bercampur barang ready stock dalam satu pengiriman?”; “Data buku sudah ada
  dalam CSV yang rapi?”
- Kurohane: “Satu booking menggunakan satu barber saja atau beberapa resource?”;
  “Pelanggan boleh ubah/batal sampai kapan?”; “Booking telepon ikut memblokir
  kalender yang sama?”
- Arden: “Bidding dilakukan di platform ini atau provider lain?”; “Timed online
  saja atau live auction?”; “Siapa menyetujui peserta dan mengelola deposit?”

Jangan menampilkan seluruh daftar pertanyaan teknis ini sekaligus. Pilih
pertanyaan yang dapat memindahkan variant, membuka blocker, atau mengubah
estimasi paling besar.

## 5. Tanggung jawab prompt dan validator

Arah prompt: **website terkecil yang lengkap untuk operasi yang disepakati**.
Hindari asumsi bahwa kemampuan operasional yang tidak disebut pengguna berarti
tidak perlu dibangun. Pisahkan requested, required dependency, optional, dan
unknown. Setiap asumsi punya alasan dan status konfirmasi.

AI harus mengembalikan referensi fakta brief untuk klaim penting dan menyebut
kebutuhan yang katalog belum dukung. Beri contoh yang sengaja membedakan
“tombol booking eksternal” dari “scheduling engine”, serta “katalog properti”+dari “auction engine”. Ringkas tampilan bagi klien; simpan detail internal.

Validator kode minimal:

1. Semua actor action wajib punya capability dan screen/workflow yang relevan.
2. Semua transaksi punya success, failure dan admin recovery yang masuk scope.
3. Dependency terpenuhi; pilihan konflik ditolak atau ditanya ulang.
4. Quantity/units sesuai domain; tidak diam-diam reset nilai penting menjadi 1.
5. Tidak ada scope terpotong diam-diam. Bila melampaui kapasitas model output,
   pecah ringkasan/detail atau ubah status menjadi needs_discovery dengan alasan.
6. Custom atau critical workflow tidak menjadi fixed hanya karena field
   customRequests kosong. Sinyal dari brief dan hasil validasi ikut memblokir.
7. Perubahan manual fitur menjalankan resolver yang sama dengan output AI.
   Menghapus parent/dependency harus menjelaskan dampak sebelum scope dikomit.
8. Revisi membawa canonical scope berikut parameter, bukan hanya ID/nama;
   hitung ulang coverage, estimate dan scope hash.

Structured Outputs tetap bermanfaat untuk shape, tetapi tidak membuktikan
kelengkapan requirement. Pertahankan AI tanpa harga. Prompt injection yang
meminta nominal murah tidak boleh mengubah rate/floor/promo.

## 6. Formula harga yang dapat diaudit

Work package memiliki `hoursLow`, `hoursLikely`, `hoursHigh`, evidence dan
assumption. Estimasi jam **sudah memasukkan AI/reuse yang benar-benar terbukti**,
QA, komunikasi, deploy, dan garansi bug. Tidak ada “AI discount” kedua.

```text
H          = jumlah jam work package unik sesuai parameter (low / likely / high)
Rate       = tarif jual pasar yang dipilih kebijakan, bukan oleh AI
KnownBuild = H_likely x Rate
PrePromo   = round(KnownBuild + biaya langsung yang menjadi fee studio)
CostFloor  = (biaya waktu terlindungi + biaya langsung) / (1 - margin_min)
PromoAllowed = max(0, min(promo_budget, PrePromo - CostFloor))
Final      = max(rounded_cost_floor, round(PrePromo - PromoAllowed))
```

**Revisi 10 Okt 2026: tidak ada suku `Reserve` terpisah.** Versi pertama
menambahkan cadangan 10-25% di atas `KnownBuild`, padahal jam low/high sudah
memuat ketidakpastian pekerjaan yang diketahui dan jam itu sendiri sudah berisi
QA serta komunikasi. Menaikkan jam, lalu menambah contingency, lalu menambah
rentang universal 20% adalah menagih risiko yang sama tiga kali — persis yang
dilarang paragraf di bawah. Risiko yang **belum** masuk jam high bukan urusan
cadangan persen: ia membuat statusnya `range` atau `needs_discovery`.

Biaya provider yang dibayar langsung klien terpisah dalam daftar recurring/
pass-through dan tidak dikenai markup/diskon tersembunyi. Jika studio menanggung
biaya tertentu, tampilkan sebagai line item dan jelaskan apakah dapat didiskon.

**Cost floor bukan tambahan di atas harga**, melainkan batas minimum. Hitung
biaya internal aktual pemilik—waktu delivery dan nonbillable, tools, kebutuhan
review/subcontractor—dalam mata uang pembukuannya. Untuk invoice lintas mata
uang, tetapkan kurs internal konservatif/masa berlaku; jangan menganggap tarif
murah Indonesia aman bagi biaya hidup Jepang.

H low/high mewakili ketidakpastian estimate pekerjaan yang diketahui.
Pilih satu cara mengalokasikan tiap risiko dan dokumentasikan; jangan menaikkan
jam, menambah contingency, lalu menambah universal range 20% untuk risiko yang
sama. Selama scope belum terkunci, gunakan range berbasis low/high work package;
probabilitas P50/P80 baru boleh disebut setelah ada kalibrasi historis. Sebelum
itu labeli low/likely/high sebagai estimasi, bukan interval statistik.

Harga visual berasal dari UI work packages; konten dari writing/import packages.
Jumlah halaman tetap dapat dipakai sebagai input template sederhana, tetapi
bukan satu-satunya ukuran usaha. Rush memerlukan kapasitas dan critical path
yang mendukung; jika tidak feasible, opsi tidak ditawarkan. Premium rush bukan
alasan menghapus QA atau membagi semua timeline menjadi setengah.

## 7. Rate card dan lantai biaya

Rate card diturunkan dari **lantai biaya dalam yen**, bukan dari empat sample.
Urutannya: tentukan biaya internal pemilik di Kanagawa, tetapkan lantai, lalu
tetapkan harga jual per pasar yang melewati lantai itu — kecuali pasar yang
pemilik putuskan untuk disubsidi secara sadar.

### Lantai biaya pemilik

Dihitung dalam yen karena di situlah biaya hidup benar-benar terjadi. Upah
minimum Kanagawa **¥1.279/jam** berlaku 1 Oktober 2026.

```text
Jam terlindungi   = jam proyek x 1,2        (rework dan komunikasi tak terduga)
Beban nonbillable = /0,65                    (akuisisi, admin, belajar, idle)
Biaya waktu       = jam terlindungi x biaya waktu per jam / 0,65
CostFloor         = (biaya waktu + biaya langsung) / (1 - margin_min)
```

Nilai yang **harus dikonfirmasi pemilik** sebelum dipakai: biaya waktu per jam
yang sebenarnya (sewa, asuransi, pensiun, pajak, tools, dibagi jam kerja riil),
kapasitas jam riil per minggu, dan margin minimum yang diterima. Angka di bawah
adalah **ilustrasi dengan asumsi ¥1.500/jam biaya waktu dan margin minimum 20%**,
bukan pembuktian biaya aktual.

### Tarif jual per pasar

Mengikuti keputusan bauran pasar pemilik: klien Indonesia memakai harga
Indonesia; klien Jepang memakai harga yang dinaikkan sampai **murah di mata pasar
Jepang** namun tetap melewati lantai; selain itu memakai harga global/AS.

| Pasar | Tarif jual/jam | Dalam yen | vs UMR Kanagawa | Lolos lantai? |
| --- | ---: | ---: | ---: | --- |
| ID | Rp93.000 | kira-kira ¥808 | 0,63x | **Tidak — disubsidi secara sadar** |
| JP | ¥3.150 | ¥3.150 | 2,46x | Ya |
| Global/AS | $27 | kira-kira ¥4.212 | 3,29x | Ya |

Tarif dijaga **konsisten lintas paket** dalam satu pasar. Itu pilihan sadar:
ia lebih mudah dipertahankan dalam negosiasi daripada tarif berbeda per paket,
dan ia membuat jelas paket mana yang paling jauh di bawah pasar sehingga paling
dulu layak naik harga.

### Kalibrasi terhadap sample

`harga = jam tengah v1 x tarif pasar`, dibulatkan. Tidak ada cadangan tambahan:
risiko residual sudah berada dalam rentang jam low/high, sesuai bagian 6.

| Kasus | Jam v1 | ID | JP | Global/AS | Status yang diharapkan |
| --- | ---: | ---: | ---: | ---: | --- |
| Tegak | 55-85 (70) | Rp6,5 jt | ¥220.000 | $1.900 | Fixed setelah parameter CMS disepakati |
| Lembar | 110-170 (140) | Rp13 jt | ¥440.000 | $3.800 | Range sampai platform/gateway/impor jelas |
| Kurohane | 100-160 (130) | Rp12 jt | ¥420.000 | $3.600 | Range sampai aturan scheduling diterima |
| Arden | 700-1.100 | **tidak dijual** | **tidak dijual** | **tidak dijual** | Discovery berbayar saja |

Kalibrasi ini **bukan validasi independen**: ia memakai tiga sample yang sama
yang dipakai menyusun jamnya. Yang membuatnya lebih kuat daripada versi pertama
adalah tarifnya tidak lagi diturunkan dari target yang hendak divalidasi — ia
diturunkan dari lantai biaya dan keputusan pasar, lalu diuji terhadap harga
vendor nyata (lihat tabel tipe P di dokumen 1). Tetap perlu holdout cases,
jam aktual, dan data konversi.

Jangan mengimplementasikan lookup nama "Tegak/Lembar/Kurohane" sebagai estimator;
hasil harus muncul dari scope yang sama walaupun nama bisnis diganti.

### Ruang diskon yang sebenarnya tersedia

Karena harga jual sekarang mendekati lantai di pasar yang tidak disubsidi,
**ruang diskon kecil, dan itu memang benar.** Ilustrasi Kurohane JP dengan asumsi
di atas:

```text
Jam terlindungi   = 130 x 1,2 = 156 jam
Biaya waktu       = 156 x 1.500 / 0,65 = ¥360.000
Biaya langsung    = ¥15.000
CostFloor         = 375.000 / 0,8 = ¥468.750
Harga jual        = ¥420.000  -> DI BAWAH LANTAI
```

Pada asumsi ilustratif ini, bahkan harga JP tanpa diskon **tidak melewati lantai**.
Itu bukan alasan menaikkan harga JP sampai ¥470.000 secara otomatis — pemilik
memilih masuk pasar Jepang dengan harga rendah. Ia adalah alasan untuk:

1. **Memverifikasi biaya waktu per jam yang sebenarnya.** Bila biaya waktu riil
   ¥1.200/jam, lantai menjadi ¥378.750 dan ¥420.000 lolos.
2. **Tidak memberi diskon apa pun di atas harga JP dan ID.**
3. Menjadwalkan kenaikan harga setelah portfolio ada, bukan menunggu rugi terbukti.

**Cost floor bukan tambahan di atas harga, melainkan batas minimum.** Bila harga
jual berada di bawahnya, sistem tidak boleh diam: ia harus menandainya kepada
pemilik. Untuk invoice lintas mata uang, tetapkan kurs internal konservatif
dengan masa berlaku; jangan menganggap tarif murah Indonesia aman bagi biaya
hidup Jepang.

Untuk menjual "founding" sambil tetap melewati lantai, publikasikan **harga
pengenalan yang memang berlaku** beserta periode/kuotanya, bukan list yang
digelembungkan supaya ada diskon semu. Hindari founding+promo 40%: pada Kurohane
ID itu menghasilkan ¥420/jam, sepertiga upah minimum Kanagawa.


## 8. Kebijakan status yang baru

| Status | Syarat | Tampilan dan tindakan |
| --- | --- | --- |
| Fixed | Seluruh outcome tercakup variant teruji, parameter penting dikonfirmasi, dependency valid, tidak ada blocker, floor lolos | Satu angka + scope/exclusions + expiry |
| Range | Semua pekerjaan penting sudah teridentifikasi; ketidakpastian terbatas dapat dihitung sebagai low/high | Rentang + 2–3 penyebab ketidakpastian + asumsi |
| Discuss / needs_discovery | Unknown kritis, unsupported core, risk tinggi, scope loss, provider belum feasible, kapasitas tidak cocok | Tampilkan bagian terhitung sebagai indikasi terpisah jika berguna; jangan menyebut total final |

Nominal maksimum regional boleh tetap menjadi batas wewenang otomatis, namun
secondary terhadap risk gate. Kebutuhan Arden harus discuss di ID/JP/US
walaupun budget atau promo berubah. Status tidak boleh membaik karena custom
label dihapus tanpa menyelesaikan blocker domain.

Penurunan desain full custom → template tidak boleh mengubah critical auction
menjadi low risk. Pergantian market/currency juga tidak menghapus blocker yang
sama. Transparansi output meliputi scope yang dihitung, yang belum dihitung,
excluded recurring, cara mempersempit range, dan kapan manusia memutuskan harga.

## 9. Timeline dan komitmen penawaran

Pisahkan jam usaha dari durasi kalender:

```text
delivery capacity weeks = protected effort hours / real available hours per week
calendar duration = dependency schedule + review/provider waits + capacity plan
```

Gunakan contoh kapasitas25 jam/minggu dari dokumen1 hanya untuk planning;
pemilik harus menentukan kapasitas riil. Proyek lain, administrasi, bahasa
komunikasi klien dan dukungan pasca-launch ikut memengaruhi waktu.
Jangan mengasumsikan semua jam teknis dapat dijalankan paralel oleh satu orang.

Quote immutable harus mencakup hash scope, catalog/rate version, currency,
discount valid, total, issuedAt/expiresAt. Server memverifikasi snapshot dan
tetap menghitung/mengecek promo sesuai kebijakan. Bila promo expired atau katalog
berubah, tentukan apakah quote lama dihormati hingga expiry atau perlu requote;
jangan mengubah diam-diam di order.

Versi awal dapat memakai signed payload yang memuat snapshot lengkap dan expiry
tanpa database. Reference HMAC pendek saat ini bukan pengganti snapshot.
Database/quote ledger opsional jika kelak perlu pencarian, audit perubahan,
revocation, funnel metrics atau banyak operator. Kebutuhan pricing sendiri tidak
memaksa mengganti Astro/Preact atau memasang backend baru.

Janji tanpa DP dapat dipertahankan untuk paket kecil bila pemilik memilihnya.
Untuk Arden yang 700–1.100 jam, pertimbangkan discovery berbayar dan milestone
sesudah scope disetujui. Ini usulan perubahan komersial, **belum keputusan**;
jika diadopsi, legal/copy/email EN/ID harus selaras dengan payment_terms.

## 10. Urutan implementasi

Urutan ini **dibalik sebagian** dari versi pertama. Alasannya ada di bagian 7:
estimator work-package tidak bisa dikalibrasi tanpa jam aktual, jadi membangunnya
lebih dulu berarti menyetel angka terhadap asumsi sendiri.

| Fase | Pekerjaan | Selesai bila |
| --- | --- | --- |
| **0. Keputusan pemilik** | Biaya waktu per jam riil, kapasitas, platform yang dikuasai, margin minimum, kebijakan diskon dan termin | Lantai biaya dapat dihitung dari angka nyata, bukan ilustrasi |
| **1. Guardrail murah** | Gate risiko lepas dari nominal; hapus silent truncation; terapkan `max_multiplier`; hentikan tagihan ganda copywriting; lantai biaya; hentikan penumpukan diskon; termin pembayaran | Scope berisiko tidak pernah `fixed`; scope tidak pernah hilang diam-diam; tidak ada diskon di bawah lantai |
| **2. Koherensi pasar** | Pasar JP + JPY; batas min/max per pasar, bukan hasil konversi FX; katalog diturunkan dari jam x tarif | Jepang bisa diquote; tarif efektif antar pasar tidak lagi berbeda 6-7x untuk scope sama |
| **3. Kontrak katalog** | Variant/parameter/dependency/ownership; bersihkan metadata legacy; sinkronkan test | Tidak ada double charge; setiap base punya definition of done |
| **4. Integritas quote** | Snapshot/version/expiry; order dan email memakai snapshot sama | Requote transparan; server tetap otoritas |
| **5. Discovery AI + UI** | Pertanyaan adaptif, source/assumption, validasi semantic, resolver untuk edit manual | User dapat meninjau scope lengkap; dua bahasa UI konsisten |
| **6. Estimator effort** | WorkPackage, effort band, segmented design/content, capacity timeline | **Hanya setelah ada jam aktual dari 5+ proyek** |
| **7. Shadow + pilot** | Jalankan estimator baru bersama review manual | Actuals, error, dan conversion cukup untuk memperluas fixed eligibility |

Fase 1 dan 2 memberi hampir seluruh manfaat perlindungan dan koherensi harga,
dan keduanya adalah pekerjaan hari, bukan bulan. Fase 6 adalah pekerjaan terbesar
dan manfaat marginalnya paling kecil sebelum ada klien. **Jangan merilis
estimator baru dengan gate risiko tertinggal.**

Area source yang terkena:

- `data/pricing.json`, `src/lib/pricing.ts`, `src/lib/schemas.ts` untuk kontrak
  dan kalkulator; test pricing disusun ulang berdasarkan behavior desired.
- `src/i18n/consult.ts` untuk copy region EN/ID; `src/i18n/catalog.ts` untuk
  katalog price-free; `src/lib/openai.ts` untuk prompt.
- `Consultant.tsx`, `PlanStep.tsx` dan komponen result/order untuk pemilih pasar,
  scope review, breakdown, dan status; `skyland-consult-v2` perlu migrasi.
- `src/pages/api/order.ts`, `promo.ts`, `quote-id.ts`, `mail.ts` untuk snapshot,
  promo, expiry, dan konsistensi email; modul secret tetap server-only.
- Copy EN/ID, halaman layanan/FAQ/legal dan dokumen domain/API/operasional untuk
  janji harga baru. Jangan mengubah slug/ID katalog tanpa migration map.

Pasar JP dan JPY **tidak** otomatis berarti meluncurkan UI berbahasa Jepang.
Bahasa UI, bahasa website pesanan, pasar harga, dan mata uang adalah empat
pilihan berbeda. Tidak ada locale `ja`, jadi pasar JP hanya boleh berasal dari
pemilih pasar eksplisit — bukan disimpulkan dari bahasa chat. UI Jepang bisa
menjadi pekerjaan produk terpisah.


## 11. Verifikasi yang harus mendahului rollout

### Golden cases dan holdout

Gunakan empat scope riset ini sebagai kalibrasi, lalu minimal12 scope lain
yang tidak dipakai menyetel tarif: landing sederhana, template company profile,
blog, portfolio, booking SaaS, custom resource booking, standard commerce,
preorder kompleks, LMS, multi bahasa, integrasi sulit, dan internal tool.
Buat versi ID/EN brief dengan kebutuhan sama dan variasi cara pengguna menulis.

Untuk evaluasi AI, rencana versi pertama adalah 3 pengulangan x 16 scope x 2 bahasa
= 96 output. **Revisi 10 Okt 2026: itu terlalu besar sebagai prasyarat rilis.**
Eval sebesar itu masuk akal sebelum memperluas `fixed` eligibility, bukan sebelum
memasang gate risiko. Untuk fase 1-2, yang wajib lulus adalah assertion
deterministik di tabel bawah — semuanya dapat diuji tanpa memanggil model.

Eval AI penuh menjadi prasyarat **fase 5-7**, dengan budget dan data uji yang
disepakati. Review manusia menetapkan expected capability dan risk status;
jangan memakai model yang sama sebagai satu-satunya penilai.

| Kelompok | Assertion bermakna |
| --- | --- |
| Kelengkapan scope | Wajib ada checkout failure/refund untuk scope terkait; owner workflow tidak hilang; setiap mandatory outcome terhubung |
| Risiko | Auction/unknown critical selalu discovery; remove label/ubah negara/promo tidak membuat false fixed |
| Deduplikasi | Included tidak ditagih ulang, satu provider tidak ditagih API kedua kali, shared auth/CRUD dihitung sekali |
| Monotonicity | Tambah outcome tidak menurunkan effort/fee dengan kebijakan sama, kecuali bundling eksplisit; hapus optional tidak menaikkan fee secara misterius |
| Unit | Records vs templates, staff vs resource complexity, multilingual per localized work, data volume bands |
| Numerik | Ledger sums, rounding tiap currency, bounded discount, tidak menembus floor, total UI=server=email |
| State | Draft lama dimigrasi atau requote dengan pesan jelas, page limit tidak memotong, perubahan scope menginvalidasi quote |
| AI | Parafrasa kebutuhan sama memberi cakupan/status stabil; price injection tidak memengaruhi nominal kebijakan |
| Browser | EN/ID mobile/desktop; region ID/JP/US; unknown→pertanyaan→scope→quote→order fixture |

Kriteria pilot yang disarankan: nol false-fixed pada seluruh kasus critical;
mandatory capability recall minimal95% pada corpus review; fee kasus bounded
dalam ±20% estimate reviewer independen dengan alasan untuk outlier; 100%
ledger/server consistency dan floor enforcement. Angka95% bukan izin melewatkan
satu requirement kritis: setiap omission kritis memblokir kasus tersebut.

Untuk delivery pilot, catat jam per work package, rework, perubahan scope,
keuntungan kotor sesudah biaya langsung, penyebab range meleset, dan quote→deal.
Jangan mengklaim interval80% terkalibrasi dari tiga proyek; mulai dengan
10–20 proyek/review estimate terstruktur lalu laporkan keterbatasan sampel.
Tinjau rate/effort tiap kuartal dan saat kemampuan reuse/AI terbukti berubah.

Uji otomatis order wajib memakai fixture tanpa kredensial OpenAI/SMTP sesuai
AGENTS.md. Eval AI nyata merupakan tahap terpisah dengan budget dan data uji
yang disepakati; tidak perlu mengirim email order sungguhan untuk menguji harga.

## Status dokumen ini

**Revisi 10 Oktober 2026.** Riset selesai dan **fase 0-4 sudah diotorisasi
pemilik untuk diimplementasikan**, termasuk perubahan `data/pricing.json` dan
mesin harganya. Fase 5-7 belum.

Yang telah diverifikasi pada riset dan revisinya: source empat sample;
harga/schema/prompt/order terkait; riset web dengan source register; delapan
quote baseline scope maksimal plus enam quote baseline scope v1 via engine asli,
dengan sensitivity dan probe; unit suite 53 lulus / 4 gagal sebagai baseline
commit `243a9d4`; kurs dan upah minimum Kanagawa diperiksa pada 10 Oktober 2026.

**Tidak** diverifikasi: tidak ada panggilan AI live, tidak ada SMTP atau order
sungguhan, tidak ada eval kualitas model, tidak ada uji deployment. Script
reproduksi ada di [dokumen 2](PRICING_RESEARCH_02_SIMULATION.md).

Pertanyaan bisnis yang masih terbuka dan **memblokir fase 1 lantai biaya**:
biaya waktu per jam pemilik yang sebenarnya, kapasitas jam riil per minggu, dan
margin minimum yang diterima. Angka lantai biaya di bagian 7 adalah ilustrasi
sampai ketiganya dikonfirmasi.
