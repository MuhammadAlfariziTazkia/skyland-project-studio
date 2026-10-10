# 3 — Evaluasi akurasi dan akar penyebab selisih harga

Analisis: **8 Oktober 2026**. **Revisi kalibrasi: 10 Oktober 2026, Asia/Tokyo.**
Basis: commit `243a9d4`. Disusun setelah [riset pasar](PRICING_RESEARCH_01_MARKET.md)
dan [eksekusi simulasi](PRICING_RESEARCH_02_SIMULATION.md).
Rekomendasi: [strategi scope](PRICING_RESEARCH_04_STRATEGY.md) dan
[strategi komersial](PRICING_RESEARCH_05_COMMERCIAL.md).

## Apa yang berubah pada revisi 10 Oktober 2026

Analisis akar penyebab versi pertama **dipertahankan hampir seluruhnya** — sembilan
sebab di bawah diperiksa ulang di source dan terkonfirmasi. Yang dibatalkan adalah
**besaran selisihnya**, karena versi pertama membandingkan dua hal yang tidak setara:

- Output mesin dihitung dari fixture **scope maksimal** (18–27 layar), sementara
  pembandingnya adalah fee untuk **scope maksimal dengan jam kelas agency**.
- Target itu sendiri cacat: ia membayar di bawah upah minimum Kanagawa
  (lihat [dokumen 1](PRICING_RESEARCH_01_MARKET.md)).

Revisi ini menjalankan mesin yang **sama dan belum diubah** pada fixture
**scope v1** lalu membandingkannya dengan target v1. Hasilnya membalik kesimpulan
arah selisih, dan justru **memperkuat putusan utama dokumen ini**: masalahnya
representasi scope dan kalibrasi bisnis, bukan aritmetika yang salah.

## Putusan

**Masalah utamanya adalah representasi scope, koherensi antar region, dan
kalibrasi bisnis — bukan AI mengarang angka atau kesalahan penjumlahan.**
AI memilih paket/fitur/halaman; `quote()` menghitung nominal secara deterministik.
Mekanisme ini layak dipertahankan.

Tiga koreksi terhadap putusan versi pertama:

1. **Mesin tidak underpriced secara umum. Ia overpriced di GLOBAL dan underpriced
   di ID.** Pada scope v1, GLOBAL meleset +19% sampai +68% di atas target,
   sementara ID bergerak dari minus 13% sampai plus 32%.
2. **Distorsi dominan adalah jurang ID versus GLOBAL**, bukan estimasi per fitur.
   Pada harga list mesin, pekerjaan ID membayar **di bawah upah minimum Kanagawa**
   sementara pekerjaan GLOBAL membayar **4-5,6x** di atasnya untuk scope sama.
3. **Mesin hampir tidak sensitif terhadap scope.** Memangkas Tegak dari scope
   maksimal ke v1 hanya menurunkan harga list ID dari Rp10,1 juta ke Rp8,6 juta
   (turun 15%), walaupun jumlah layar turun dari 18 ke 13 dan satu fitur dicabut.
   Screen admin gratis dan fitur berbiaya tetap membuat harga tidak mengikuti scope.

Yang tetap benar dari versi pertama: daftar capability yang terlalu umum bisa
menghasilkan harga pasti untuk pekerjaan yang belum cukup didefinisikan; Arden
tidak layak diberi rentang otomatis; dan **menambah semua harga dengan faktor
yang sama bukan solusi**.

## Besar selisih, diukur ulang pada scope yang setara

Fixture v1 sesuai [dokumen 1](PRICING_RESEARCH_01_MARKET.md), dijalankan pada
`quote()` commit `243a9d4` tanpa perubahan apa pun. `full_custom` + `content: ready`
+ `timeline: normal`, tanpa customRequests. `selisih = (mesin / target - 1) x 100%`.

| Kasus v1 | Halaman berbayar | Subtotal | List mesin | Target v1 | List vs target | Setelah founding 20% | vs target |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Tegak ID | 7 | Rp6,15 jt | Rp8,60 jt | Rp6,5 jt | **+32,3%** | Rp6,90 jt | +6,2% |
| Tegak GLOBAL | 7 | $2.280 | $3.200 | $1.900 | **+68,4%** | $2.550 | +34,2% |
| Lembar ID | 5 | Rp9,65 jt | Rp13,50 jt | Rp13 jt | +3,8% | Rp10,80 jt | -16,9% |
| Lembar GLOBAL | 5 | $4.115 | $5.750 | $3.800 | **+51,3%** | $4.600 | +21,1% |
| Kurohane ID | 8 | Rp7,45 jt | Rp10,45 jt | Rp12 jt | **-12,9%** | Rp8,35 jt | -30,4% |
| Kurohane GLOBAL | 8 | $3.080 | $4.300 | $3.600 | +19,4% | $3.450 | -4,2% |

Status seluruh kasus v1 adalah `fixed` — termasuk Kurohane, yang berisi engine
scheduling dengan kewajiban anti-overlap dan timezone. **Scope berisiko mendapat
harga pasti otomatis hanya karena tidak ada `customRequests`.** Itu temuan yang
lebih penting daripada besaran selisih mana pun di tabel ini.

Catatan metodologi: Kurohane menghitung **8** halaman berbayar, bukan 7, karena
layar "Manage guest booking" memakai type `custom` sehingga ditagih sebagai
halaman konten walaupun secara domain ia layar fungsional booking. Lihat sebab #7.

### Uji lantai biaya: distorsi yang sebenarnya

Pendapatan kotor per jam pada **harga list mesin**, dengan jam tengah v1,
dibandingkan upah minimum Kanagawa **¥1.279/jam** (¥1 kira-kira Rp115, $1 kira-kira ¥156):

| Kasus v1 | Jam tengah | Per jam | Dalam yen | vs UMR Kanagawa |
| --- | ---: | ---: | ---: | ---: |
| Tegak ID | 70 | Rp122.857 | ¥1.068 | **0,84x - di bawah** |
| Tegak GLOBAL | 70 | $45,71 | ¥7.131 | 5,57x |
| Lembar ID | 140 | Rp96.429 | ¥838 | **0,66x - di bawah** |
| Lembar GLOBAL | 140 | $41,07 | ¥6.407 | 5,01x |
| Kurohane ID | 130 | Rp80.385 | ¥699 | **0,55x - di bawah** |
| Kurohane GLOBAL | 130 | $33,08 | ¥5.160 | 4,03x |

Setelah founding 20%, ID turun lagi: Tegak ¥857 (0,67x), Kurohane ¥559 (0,44x).
Dengan founding+promo 40%, Kurohane ID menjadi ¥420/jam — **sepertiga upah
minimum prefektur tempat pemilik tinggal**.

**Inilah kesimpulan kuantitatif utama dokumen ini.** Untuk scope yang identik,
mesin saat ini menetapkan tarif efektif yang berbeda **6-7 kali** antara ID dan
GLOBAL. Tidak ada estimasi jam per fitur yang bisa memperbaiki itu, karena
penyebabnya bukan jam — melainkan dua tabel harga yang disusun lepas satu dari
yang lain.

### Jepang: kekurangan model regional

Tidak ada hasil JPY asli; `ChoicesSchema` menolak `region:'JP'`. Bila klien
Jepang hari ini dilayani memakai pilihan GLOBAL (satu-satunya yang tersedia),
pada kurs $1 kira-kira ¥156 hasilnya **jauh di atas** target JP v1:

| Proyek | GLOBAL list ke yen | Target JP v1 | Selisih | Setelah founding | Selisih |
| --- | ---: | ---: | ---: | ---: | ---: |
| Tegak | ¥499.200 | ¥220.000 | **+127%** | ¥397.800 | +81% |
| Lembar | ¥897.000 | ¥440.000 | **+104%** | ¥717.600 | +63% |
| Kurohane | ¥670.800 | ¥420.000 | **+60%** | ¥538.200 | +28% |

Versi pertama dokumen ini menyimpulkan Jepang **underpriced** (minus 47% sampai
minus 72%). Itu salah, dan sebabnya dua: ia memakai target JP kelas agency, dan
ia memakai asumsi kurs ¥150 ketika angka terbaru yang andal adalah sekitar 156.
Arah selisihnya terbalik. Kesimpulan yang tetap berlaku: **diperlukan kebijakan
JP tersendiri dengan daftar harga JPY sendiri; tidak ada satu koefisien FX yang
akan mengoreksi seluruh katalog.** Pada ¥140-170 pun arah selisih tidak berubah.

### Dua temuan yang terlewat versi pertama

Keduanya diperiksa langsung di `data/pricing.json`:

1. **Batas region tidak koheren 9,8x.** `ID.max_price` Rp22 juta setara **$1.229**,
   sedangkan `GLOBAL.max_price` **$12.000**. Inilah sebab sesungguhnya Arden ID
   jatuh ke `discuss` sementara Arden GLOBAL tetap `range` untuk scope identik —
   sebab #6 di bawah melihat gejalanya tanpa melihat angka ini. Minimum juga
   meleset: Rp750.000 = $42 versus $250.
2. **Rasio base ID/GLOBAL tidak konsisten antar paket:** company_profile 6,6x
   (Rp1,75 juta vs $650); online_store dan custom_web_app 8,9x; padahal
   `pricing_basis.hourly_rate` menyiratkan 6,5x (Rp55.000 = $3,07 vs $20).
   Harga katalog di-hand-tune lepas dari basis jamnya, dan itulah mekanisme
   yang menghasilkan jurang 6-7x pada tabel lantai biaya di atas.

## Analisis penyebab berdasarkan bukti

### 1. Scope tidak mempunyai parameter kedalaman

**Terbukti di source:** fitur `cms_admin`, `roles_permissions`, `payment`,
`multi_staff_schedule`, `booking_calendar` adalah biaya satu kali dengan jam
tetap. `quantity` hanya memengaruhi fitur dengan unit item (misalnya bahasa
atau API). Menetapkan quantity=4 pada multi_staff_schedule tidak membuat biaya
empat staff. Tidak ada jumlah model data, workflow, state transaksi, concurrency,
jenis integrasi, kualitas sumber data, atau target reliabilitas.

| Label katalog | Cakupan sederhana yang mungkin sesuai harganya | Kebutuhan sample yang perlu batas tambahan |
| --- | --- | --- |
| cms_admin, 16 jam | Konfigurasi beberapa CRUD standar | Model data berelasi, izin per role, filter/status, audit, bulk import |
| payment, 20 jam | Satu gateway dengan flow standar | Deposit eligibility, refund/reconciliation dan state lelang |
| multi_staff_schedule, 12 jam | Setup jadwal beberapa staf | Durasi berbeda, buffer, nominasi, cuti, walk-in dan reschedule yang berkonflik |
| product_variants, 8 jam | Varian dan stock pada engine matang | Concurrency checkout, preorder, fulfilment exception |
| api_integration, 20 jam/item | Satu API terdokumentasi dengan flow sempit | Webhook/retry, pagination, mapping, sync dua arah, sandbox buruk |

Ini **tidak membuktikan harga setiap fitur salah**. Sebagian masuk akal untuk
konfigurasi platform teruji. Yang salah adalah menganggap ID tersebut cukup
untuk membatasi pekerjaan apa pun yang punya nama sama.

### 2. CustomRequest diberi label, tetapi tidak diberi effort

**Terbukti:** customRequests hanya memengaruhi `status`; upper selalu
`price ×1,2`, baik custom-nya peta sederhana maupun engine bidding.
Tidak ada per-request jam, minimum, risk tier, unknown blocker, atau mandatory
human review. Source menerima maksimum tiga request dan memotong sisanya.

Pada Arden GLOBAL, mesin menghitung $9.150–11.000, padahal fee pemula acuan
$35.000. Menambah upper universal menjadi 2× atau 4× hanya menutup gejala:
proyek kecil akan mendapat rentang terlalu lebar dan klien tetap tidak tahu
pekerjaan apa yang dihargai. Kebutuhan yang belum bisa dihitung harus dinyatakan
belum terhitung, bukan dianggap berada dalam tambahan 20%.

### 3. Paket included tidak mempunyai acceptance criteria atau batas skala

**Terbukti:** online_store memasukkan payment/CMS/catalog/cart, booking
memasukkan calendar/CMS/email/form, custom app memasukkan login/CMS.
Engine tepat menghindari tagihan ulang untuk inclusion. Namun tidak ada aturan
yang menyatakan berapa tipe konten, provider, role, atau exception tercakup.

Akibatnya, CMS sederhana dan admin operasional lengkap bisa sama-sama “included”.
UI juga bisa memindahkan included feature ke suggestions, tetapi capability
tetap aktif karena `activeFeatureIds` menyatukan package includes. Ini masalah
kejelasan kontrak dan UI, bukan alasan mulai menagih semua screen admin per URL.

### 4. Tarif awal + diskon memperkecil margin, terutama Indonesia

JSON pricing_basis menyebut ID Rp55.000/jam dan GLOBAL $20/jam; paket besar
GLOBAL memakai tarif efektif lebih tinggi. Field hourly_rate merupakan acuan
penyusunan angka, **tidak dibaca `quote()` untuk menghitung ulang tarif**.
Mengubah field itu saja tidak mengubah satu pun fee.

Untuk pekerjaan yang benar-benar sesuai estimasi katalog, founding mengubah
Rp55.000 menjadi sekitar Rp44.000 per jam; promo total40% menjadikannya sekitar
Rp33.000, sebelum biaya usaha. Rate efektif nyata bisa jauh lebih rendah saat
scope belum tercakup. Penerapan multiplier desain bukan pengganti analisis margin.

**Revisi 10 Okt 2026:** tabel tarif per jam versi pertama memakai jam kelas
agency dan sudah digantikan oleh tabel uji lantai biaya di bagian "Besar selisih"
di atas. Kesimpulan yang bertahan: `hourly_rate` memang tidak dibaca `quote()`,
sehingga mengubah field itu tidak mengubah satu pun fee — dan karena harga
katalog disusun lepas dari basis jamnya, tarif efektif antar region menyimpang
sampai 6-7x untuk scope yang sama.

Yang **tidak** lagi didukung bukti: klaim bahwa effort katalog kurang untuk
semua paket. Pada scope v1, jam diagnostik katalog justru di atas estimasi
independen untuk Tegak dan Lembar; hanya Kurohane yang benar-benar di bawah.
Jadi "semua effort kurang" salah, dan "semua harga harus naik" lebih salah lagi.

Ini dekomposisi indikatif, bukan persentase kausal tepat: jam katalog bukan
timesheet, komponen overlap tidak terukur, dan fee acuan memasukkan risiko.

### 5. Prompt dapat menghilangkan kebutuhan penting — hipotesis yang beralasan

Prompt aktual meminta website **“SMALLEST”**, fewest pages, dan menyebut
statistics/SEO/legal/spam protection/invoices sebagai nice-to-have jika tidak
diminta. Pendekatan ini bagus untuk menghindari upsell. Namun pelanggan biasanya
menjelaskan hasil bisnis, bukan menyebut antispam, webhook idempotency, atau
hak akses. Correctness/security dasar tidak boleh menunggu permintaan eksplisit.

Prompt juga meminta customRequests “at most 3, usually none” serta memakai
fitur katalog bila kombinasi fitur dianggap menutup kebutuhan. Pada domain
lelang, ini berisiko memetakan auction ke catalog+payment+member_area tanpa
menandai logic bidding. Pertanyaan hanya dua dan hanya mengubah ID add/remove;
tidak bisa menangkap jumlah staf, aturan durasi, skala, platform, atau jumlah
workflow secara struktural. Revisi tidak membawa semua quantity/acceptance
detail, dan tidak menyusun ulang flow secara lengkap.

**Yang belum dibuktikan:** seberapa sering model live benar-benar melakukan
kesalahan tersebut. Simulasi manual sudah menandai custom dengan sengaja;
angka gap bukan hasil pengukuran kualitas model. Mengganti model atau menaikkan
reasoning belum bisa direkomendasikan sebagai solusi utama tanpa eval.

### 6. Status quote mengikuti nominal, bukan risiko domain

Arden ID masuk discuss karena P Rp26,2 juta > Rp22 juta. Arden GLOBAL masuk
range karena P $11.450 ≤ $12.000. Scope dan risiko yang sama mendapat perlakuan
berbeda hanya karena tabel regional. PH bahkan bisa melewati max tanpa review.

Menghapus customRequest mengubah Arden GLOBAL menjadi fixed $9.150, tanpa
perubahan fitur atau pemeriksaan terhadap brief. `custom_web_app.note` di JSON
yang menyarankan human discussion tidak dipaksakan oleh engine. Guard nominal
berguna sebagai kontrol bisnis tambahan, tetapi tidak boleh menjadi guard
utama untuk lelang, unknown integration, atau workflow berisiko tinggi.

### 7. Model halaman sudah punya ide baik, tetapi belum lengkap

Tidak menagih setiap produk/artikel sebagai halaman baru adalah keputusan benar.
Tidak menagih feature screen dua kali juga benar. Namun service_detail tanpa
feature dihitung sebagai satu content page, sedangkan project_detail mengikuti
portfolio_filter. Template berbeda belum memiliki bobot effort berbeda.

Kurohane guest manage link tidak cocok dengan my_bookings yang dipetakan ke
user_login; memakai custom membuatnya berbayar. Arden results juga menjadi
custom berbayar. Sementara menambah screen admin berapa pun tidak mengubah harga
jika fitur sudah aktif. Jumlah URL dengan demikian bukan proksi effort konsisten.

Lebih serius, `PlanSchema` memotong ke 24 halaman secara diam-diam: tiga screen
operasional Arden hilang. Menambah batas saja memperbaiki kehilangan data tetapi
tidak membuat effort audit log atau auction closing ikut terhitung.

### 8. Multiplier dan biaya ganda dapat menyesatkan ke kedua arah

full_custom 1,4 menaikkan **seluruh** subtotal, termasuk payment dan role rules,
bukan hanya pekerjaan desain. content partial/none menaikkan backend juga.
Sementara custom_animation masih ditagih terpisah walaupun label full_custom
menyebut animasi khas. gallery dan portfolio_filter juga perlu batas ownership
agar foto/detail yang sama tidak tertagih dua kali. Pada fixture, gallery
dipisahkan untuk media perusahaan/studio; itu asumsi, bukan batas katalog.

JSON mengatakan content none sudah mencakup copywriting, tetapi runtime tetap
menagih keduanya. Cap multiplier2 juga belum diterapkan; kombinasi penuh 2,268.
Ini potensi **overpricing**, bukan penyebab underpricing Arden. Jangan menyebut
semua mismatch sebagai faktor yang menurunkan harga.

Rush menambah uang tetapi otomatis membagi waktu menjadi separuh tanpa mengecek
kapasitas, dependensi vendor atau bagian proses yang tidak dapat dipercepat.
Estimasi waktu customRequests nol juga membuat timeline berisiko terlalu optimistis.

### 9. Konsistensi harga lintas sesi belum merupakan komitmen scope

Order server menghitung ulang dan promo divalidasi ulang; ini fondasi yang baik.
Namun body Plan berasal dari client dan schema hanya memeriksa shape. Tidak ada
scope fingerprint yang disahkan, catalog version lock, atau enforcement masa
berlaku14 hari. Draft lama/promo berubah bisa mengubah quote sebelum order.

Masalah ini tidak menyebabkan selisih aritmetika fixture, tetapi penting bagi
keandalan fitur inti: “server menghitung ulang” tidak sama dengan “server
memastikan kebutuhan lengkap dan harga yang disepakati tetap berlaku”.

## Prioritas penyebab

| Prioritas | Penyebab | Bukti | Efek dominan | Obat utama |
| --- | --- | --- | --- | --- |
| P0 | Custom scope tanpa estimasi dan gate risiko | Source + probe | Harga pasti/range palsu untuk Arden | Classify supported/unknown; block automatic commitment |
| P0 | Fitur generik tanpa tier/parameter/acceptance | Schema/katalog | Kurohane/Arden terlalu murah | Scope model berbasis capability dan workflow |
| P0 | Pemotongan scope, hilangnya dependency | Parse Arden + UI source | Quote atas kebutuhan tidak lengkap | Validasi semantic dan lossless handling |
| P1 | Tarif/diskon/floor belum dikalibrasi | Ledger + hourly cross-check | Lembar ID dan margin keseluruhan | Regional rate card, floor biaya, promo budget |
| P1 | Tidak ada JP/JPY atau AS khusus | Enum/region source | Tidak bisa quote lokal Jepang | Pisahkan market, currency, language |
| P1 | Prompt terlalu menekan scope | Instruksi prompt; live belum diuji | Risiko false fixed | Discovery dan eval, bukan sekadar prompt lebih panjang |
| P1 | Overlap/multiplier global/legacy rules | Source + probes + test gagal | Over/underpricing campuran | Charge ownership dan formula tersegmentasi |
| P2 | Version/expiry/quote commitment | Order source | Harga berubah atau scope kehilangan provenance | Snapshot atau payload bertanda tangan |

Faktor koreksi yang diperlukan untuk memaksa **list** mesin ke target v1:
ID 0,76x / 0,96x / 1,15x; GLOBAL 0,59x / 0,66x / 0,84x untuk
Tegak/Lembar/Kurohane. Perhatikan **arahnya berlawanan antar region** — GLOBAL
harus turun 16-41% sementara Kurohane ID harus naik 15%. Ini membuktikan lebih
kuat daripada versi pertama bahwa **satu pengali umum bukan solusi**, dan bahwa
pengali tunggal ke atas justru akan memperburuk GLOBAL.

Urutan perbaikan yang disarankan karena itu berubah: **koherensi region dan gate
risiko lebih dulu, kalibrasi effort per fitur kemudian.** Strategi berikutnya
harus membedakan pekerjaan yang diketahui, pekerjaan kompleks yang bisa
diestimasi, dan pekerjaan yang belum cukup diketahui untuk dijanjikan harganya.
