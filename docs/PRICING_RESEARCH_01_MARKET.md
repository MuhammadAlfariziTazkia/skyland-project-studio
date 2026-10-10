# 1 — Scope sample dan riset harga pasar

Riset awal: **8 Oktober 2026**. **Revisi kalibrasi: 10 Oktober 2026, Asia/Tokyo.**
Basis source: commit `243a9d4db4a211a4cfc58fd68faacafd56a1ff3e`.
Status: estimasi konsultatif, bukan penawaran vendor.

Urutan kajian: **dokumen ini** → [simulasi mesin saat ini](PRICING_RESEARCH_02_SIMULATION.md)
→ [evaluasi penyebab](PRICING_RESEARCH_03_EVALUATION.md)
→ [strategi scope/estimator](PRICING_RESEARCH_04_STRATEGY.md)
→ [strategi komersial](PRICING_RESEARCH_05_COMMERCIAL.md).

## Apa yang berubah pada revisi 10 Oktober 2026

Versi pertama dokumen ini mengandung satu kesalahan ekonomi yang menjalar ke
dokumen 3 dan 4. Perbaikannya dicatat terbuka, bukan ditulis ulang diam-diam.

1. **Jam dihitung ulang.** Versi lama memakai estimasi kelas agency (Kurohane
   220–360 jam untuk situs booking barbershop, termasuk UAT, race test, runbook,
   dan backup/restore drill). Itu bukan realita solo AI-assisted. Jam v1 sekarang
   55–85 / 110–170 / 100–160, dengan **scope v1 yang dibatasi eksplisit** supaya
   angka yang lebih kecil itu jujur, bukan optimistis.
2. **Uji cost floor berbasis yen ditambahkan.** Pemilik tinggal di Kanagawa dan
   membayar sewa, pajak, serta pensiun dalam yen. Semua target wajib dilaporkan
   dalam yen per jam dan dibandingkan dengan upah minimum Kanagawa.
3. **Metodologi acuan diperbaiki.** Versi lama membangun titik tengah dari blog
   "panduan harga" vendor (tipe G), padahal halaman harga vendor sungguhan
   (tipe P) di tabel yang sama memberi angka lebih rendah. Klaim "41–47% di bawah
   titik tengah" sebagian adalah artefak anchor pemasaran dan sudah dihitung ulang.
4. **Tiga pasar dipisahkan**: ID (IDR), JP (JPY), Global/US (USD). Versi lama
   hanya punya ID dan GLOBAL, dan GLOBAL diperlakukan seolah-olah sama dengan AS.
5. **Arden dikeluarkan dari daftar yang ditawarkan.** Platform lelang bukan
   pekerjaan yang pantas diambil solo tanpa portfolio. Yang ditawarkan hanya
   discovery berbayar.

### Kesalahan versi lama, dinyatakan apa adanya

Dengan kurs 10 Oktober 2026 dan upah minimum Kanagawa **¥1.279/jam** (berlaku
1 Oktober 2026), seluruh target Indonesia versi lama membayar di bawah upah
minimum Jepang:

| Target versi lama | Per jam | Dalam yen | vs UMR Kanagawa |
| --- | ---: | ---: | ---: |
| Tegak Rp9 jt / 130 jam | Rp69.231 | ¥602 | 47% |
| Lembar Rp20 jt / 240 jam | Rp83.333 | ¥725 | 57% |
| Kurohane Rp26 jt / 290 jam | Rp89.655 | ¥780 | 61% |
| Arden Rp110 jt / 900 jam | Rp122.222 | ¥1.063 | 83% |

Versi lama menyebut risiko ini satu kalimat, lalu tetap menerbitkan tabelnya
sebagai rekomendasi. Akibat gabungan scope maksimal + fee "di bawah pasar"
adalah harga yang **terlalu mahal untuk ditutup freelancer tanpa portfolio di
Indonesia dan sekaligus di bawah biaya hidup pemilik**. Dua masalah sekaligus.

## Kurs dan lantai biaya yang dipakai

Diakses 10 Oktober 2026. Kurs dipakai **hanya untuk uji kelayakan biaya**, bukan
untuk menetapkan harga: tiap pasar punya daftar harga sendiri.

| Besaran | Nilai | Sumber |
| --- | ---: | --- |
| USD/IDR | ≈ 17.900 | Databoks/Katadata, spot 6 Okt 2026 (17.901) |
| USD/JPY | ≈ 156 | Bloomberg Línea, 17 Sep 2026 (156,23) |
| JPY/IDR turunan | ¥1 ≈ Rp115 | 17.900 / 156 |
| Upah minimum Kanagawa | **¥1.279/jam** | Pref. Kanagawa, berlaku 1 Okt 2026 (naik ¥54) |

Kurs rupiah bergerak jauh sepanjang 2026 (terendah 16.675 pada 1 Januari,
tertinggi sekitar 18.175). Angka USD/JPY terbaru yang andal berasal dari
pertengahan September, jadi perlakukan 156 sebagai perkiraan, bukan kurs invoice.
**Jangan mengunci harga pada kurs.** Untuk invoice lintas mata uang, tetapkan
kurs internal konservatif dengan masa berlaku.

Upah minimum Kanagawa dipakai sebagai **lantai kelayakan paling lunak yang masih
bermakna**: pekerjaan yang membayar di bawahnya lebih buruk daripada kerja paruh
waktu di prefektur tempat pemilik tinggal. Ia bukan target penghasilan. Target
yang sehat berada beberapa kali di atasnya karena ada waktu nonbillable,
akuisisi, pajak, pensiun, tools, dan periode tanpa proyek.

## Hasil yang direkomendasikan

Fee pembangunan satu kali untuk **scope v1 yang dibatasi di bawah**, bukan untuk
scope maksimal yang mungkin dibaca dari mockup. Ini **list price**; kebijakan
diskon ada di [dokumen 5](PRICING_RESEARCH_05_COMMERCIAL.md).

| Proyek | Jam v1 | Indonesia | Jepang | Global/AS |
| --- | ---: | ---: | ---: | ---: |
| Tegak — company profile + CMS | 55–85 | **Rp6,5 juta** | **¥220.000** | **US$1.900** |
| Lembar — toko buku operasional | 110–170 | **Rp13 juta** | **¥440.000** | **US$3.800** |
| Kurohane — satu studio + reservasi | 100–160 | **Rp12 juta** | **¥420.000** | **US$3.600** |
| Arden — platform lelang | — | **tidak ditawarkan** | **tidak ditawarkan** | **tidak ditawarkan** |

Tarif jual yang dihasilkan, dan uji lantai biaya:

| Pasar | Tarif/jam pada jam tengah | Pada jam tertinggi | Dalam yen (tengah) | vs UMR Kanagawa |
| --- | ---: | ---: | ---: | ---: |
| ID | Rp92.300–92.900 | Rp75.000–76.500 | ≈ ¥807 | **0,63× — di bawah** |
| JP | ¥3.143–3.231 | ¥2.588–2.625 | ¥3.143 | 2,46× — lolos |
| Global/AS | $27,14–27,69 | $22,35–22,50 | ≈ ¥4.234 | 3,31× — lolos |

### Apa yang benar-benar dihasilkan mesin setelah implementasi

Fee di atas adalah **target**. Katalog diturunkan dari jam x tarif, jadi hasil
mesin mendekatinya tanpa persis sama. Diukur pada fixture v1 yang sama,
`full_custom` + `content: ready` + `normal`, list price sebelum diskon:

| Kasus v1 | ID | JP | Global/AS | Status |
| --- | --- | --- | --- | --- |
| Tegak | Rp6,60 jt (+1,5%) | ¥220.000 (0%) | $1.900 (0%) | fixed |
| Lembar | Rp13,65 jt (+5,0%) | ¥465.000 (+5,7%) | $3.950 (+3,9%) | range |
| Kurohane | Rp12,80 jt (+6,7%) | ¥430.000 (+2,4%) | $3.700 (+2,8%) | fixed |

Semuanya dalam 7%, dan Tegak JP/AS mendarat tepat. Toleransi yang diuji adalah
10%; lihat `tests/pricing.test.ts`. Lembar berstatus `range`, bukan `fixed`,
karena `payment` bertier elevated: pekerjaan yang bergantung pada provider yang
belum diuji tidak mendapat harga pasti otomatis.

**Harga Indonesia tetap di bawah lantai biaya pemilik.** Itu keputusan sadar
pemilik: Indonesia diperlakukan sebagai pasar portfolio dan referral, bukan
sumber pendapatan utama. Dokumen ini mencatatnya sebagai **subsidi pemasaran
berjangka dengan jalur kenaikan**, bukan sebagai margin yang aman. Jangan
menambahkan diskon lagi di atas harga Indonesia.

### Arden: yang ditawarkan hanya discovery

Platform lelang menuntut audit bid yang tidak bisa diubah diam-diam, urutan bid
atomik, aturan anti-sniping, eligibility, penanganan deposit, dan recovery saat
gagal. Konsekuensi kesalahan adalah uang dan sengketa hukum pihak ketiga.
Itu bukan pekerjaan yang pantas dipikul solo tanpa portfolio, berapa pun feenya.

Yang ditawarkan: **discovery berbayar Rp3–5 juta / ¥250.000–400.000 / US$2.000–3.000**
untuk scoping 2–3 minggu yang menghasilkan spesifikasi, model data, aturan lelang
tertulis, dan proposal fixed-price — yang boleh dikerjakan pihak lain. Pemilik
dibayar untuk keahlian analisisnya tanpa menanggung risiko delivery platform.

Analisis scope dan effort Arden di bawah **dipertahankan** sebagai bahan
discovery dan sebagai kalibrasi batas kemampuan, bukan sebagai paket berharga.

## Metode dan batas bukti

1. Baca HTML dan JavaScript empat sample untuk membedakan interaksi nyata di
   browser, placeholder, dan proses bisnis yang tersirat.
2. Tetapkan dua tingkat scope: **v1 terbatas** (yang dijual) dan **maksimal**
   (tafsir terlengkap mockup, disimpan sebagai tier atas dan bahan negosiasi).
3. Cari penawaran publik penyedia jasa. **Bobot utama pada halaman harga vendor
   (tipe P); blog panduan harga (tipe G) hanya pembanding sekunder.**
4. Normalisasi menjadi fee implementasi sekali bayar, satu negara, satu bahasa,
   desain setara arah visual sample, konten disediakan klien, dua putaran revisi,
   deploy, dokumentasi, pelatihan singkat, dan garansi bug 30 hari.
5. Estimasi jam bottom-up untuk scope v1, lalu **uji terhadap lantai biaya yen**.
6. Tentukan harga di bawah titik tengah pembanding tipe P, lalu periksa apakah
   tarif efektifnya masih melewati lantai.

**Tidak tersedia dataset transaksi representatif untuk menghitung rata-rata
nasional yang sahih.** Harga publik adalah asking price dan sering berlabel
"mulai dari"; jumlah transaksi, diskon deal, mutu delivery, dan keuntungan vendor
tidak diketahui. "Acuan pasar" di sini adalah **rentang estimasi yang
dinormalisasi untuk scope**; titik tengah adalah `(bawah+atas)/2`, bukan mean
statistik hasil survei. Jangan memasarkan angka ini sebagai rata-rata resmi.
Tidak ada vendor yang dihubungi atau order dikirim.

Harga IDR, JPY, USD merupakan strategi pasar masing-masing; bukan hasil konversi
kurs. "Global/AS" tidak mewakili seluruh pasar dunia; ia adalah daftar harga
default untuk klien di luar Indonesia dan Jepang. "Di bawah pasar" berarti di
bawah segmen jasa sebanding yang dipilih, **bukan lebih murah daripada semua
penjual**. Ada penyedia sangat murah yang mengklaim fitur lengkap, termasuk AI
assisted; keberadaan mereka tetap diperhitungkan sebagai tekanan kompetisi.

Biaya di luar fee: pajak yang berlaku, domain/hosting, lisensi engine/plugin,
payment/messaging fees, produksi foto/video, terjemahan profesional, penulisan
dokumen hukum, pemasaran, input data massal, dan maintenance setelah garansi.
Tabel vendor bisa termasuk pajak atau hosting; angka mentah tetap diberi konteks
dan tidak dijumlahkan langsung. Penilaian kewajiban hukum tiap negara di luar
kajian ini.

## Bukti dari sample, scope v1, dan scope maksimal

### Tegak Prima Konstruksi

Bukti: [index.html](../public/samples/tegak/index.html), terutama `servicesRaw`,
`projectsRaw`, `regionsRaw`, dan handler `submit`; serta
[footprint-map.js](../public/samples/tegak/footprint-map.js).
Demo memiliki enam jenis layanan, portfolio/case study, capability, sertifikasi,
area operasi, insight, animasi scroll, peta interaktif, dan form dengan file.
Handler submit hanya mengubah state `sent`; bukan pengiriman lead produksi.
Angka 120+ proyek adalah copy fiktif, bukan 120 halaman yang sudah dibuat.

| Kelompok | **Scope v1 (dijual)** | Scope maksimal (tier atas) |
| --- | --- | --- |
| Konten publik | Home, about, services, capabilities, coverage, contact, privacy/terms: **7 halaman** | + certifications, careers: 10 halaman |
| Data dinamis | Template detail layanan ×6 record; daftar/detail proyek | + daftar/detail insight |
| CMS | Login owner, CRUD layanan/proyek, upload media, draft/publish | + artikel/sertifikat, editor role, audit |
| Lead | Form enquiry, satu lampiran berbatas, antispam, email, daftar lead | + scoring, assignment, SLA |
| Desain | Arah visual industrial custom, animasi responsif, **peta cakupan statis** | + peta interaktif dengan pencarian lokasi |
| Isi awal | 6 layanan, 12 proyek; data/foto siap dari klien | + 6 artikel, 6 sertifikat |
| Kualitas | SEO teknis dasar, keyboard/form accessibility, mobile QA, uji delivery form | + backup CMS terjadwal, training formal |

v1: 7 halaman konten + 2 jenis template + 3 screen admin. Record tidak dihitung
sebagai template baru. Tidak termasuk BIM, manajemen proyek konstruksi,
procurement, portal klien, estimasi RAB, HR/ATS, atau penulisan 120 case study.
Kompleksitas **menengah**: desain dan struktur konten dominan; risiko transaksi rendah.

### Lembar Toko Buku

Bukti: [index.html](../public/samples/lembar/index.html), `B`, `add`, `checkout`,
`toggleWish`, `demoOnly`. Ada 14 buku contoh, pencarian, kategori/koleksi,
detail buku, variasi format, wishlist, cart, newsletter, dan order confirmation.
Checkout demo langsung membuat ID acak dan ongkir lokal; tidak ada otorisasi
pembayaran, validasi stok server, maupun fulfilment.

| Kelompok | **Scope v1 (dijual)** | Scope maksimal (tier atas) |
| --- | --- | --- |
| Konten | Home, about, contact, FAQ, shipping/returns, privacy/terms: **6 halaman** | + kurasi editorial, blog |
| Storefront | Daftar/filter/sort; detail buku; kategori/koleksi via template bersama; pencarian | + penerbit/penulis sebagai dimensi sendiri, wishlist |
| Transaksi | Varian paperback/hardcover, cart, guest checkout, **satu** gateway regional, webhook idempotent, gagal/expired | + retry otomatis, refund parsial, preorder lintas shipment |
| Operasi | Stok per SKU, reservasi stok saat checkout, pesanan, status kirim, **satu** integrasi ongkir | + tracking dua arah, CSV ekspor terjadwal |
| Member | Login/reset, alamat, order history; checkout tidak wajib akun | + poin, langganan |
| Merchandising | Kupon sederhana, staff picks manual, newsletter via satu layanan | + bestseller otomatis dari penjualan, preorder bertanggal |
| CMS/admin | Kelola buku, varian, stok, kategori, pesanan, konten, kupon | + refund workflow, pelanggan, staff roles |
| Isi awal | **≤200 SKU dari CSV bersih** | + pembersihan data, penulisan deskripsi |
| Kualitas | Test total server, race stok, webhook ganda, hak akses, transaksi sandbox | + monitoring, backup drill, load test |

v1 memakai **jalur Extend**: engine commerce yang matang dengan storefront custom.
**Tidak membangun commerce engine dari nol.** Untuk tiap negara, satu mata uang
dan provider domestik; QRIS adalah contoh Indonesia, bukan kewajiban checkout
Jepang/AS. Tidak termasuk marketplace multi seller, POS/ERP sync, ebook DRM,
subscription, loyalty kompleks, atau penjualan internasional multi-tax.
Kompleksitas **menengah–tinggi**; risiko utama uang, stok, dan konsistensi order.

### Kurohane Barber Studio

Bukti: [index.html](../public/samples/kurohane/index.html), `bkConfirm`, `mine`;
[kurohane-data.js](../public/samples/kurohane/kurohane-data.js), `slotsFor`,
`genDay`, `loadSession`. Demo memiliki 9 layanan, 4 barber, 11 gaya, jam kerja,
istirahat, hari libur, pilihan barber/tanpa preferensi, durasi berbeda,
biaya penunjukan, kalender 60 hari, konfirmasi dan pembatalan.
Data booking ada di sessionStorage dan jadwal lain dihasilkan deterministik;
itu tidak mencegah dua orang di perangkat berbeda memesan slot sama.

| Kelompok | **Scope v1 (dijual)** | Scope maksimal (tier atas) |
| --- | --- | --- |
| Konten | Home, philosophy, first visit, access/contact, FAQ, privacy/cancellation: **6 halaman** | + kebijakan panjang terpisah |
| Katalog | Menu/harga/durasi, barber, galeri gaya dengan filter | + detail gaya per halaman |
| Reservasi | **Satu cabang, ≤5 barber**, durasi 30–120 menit, jam/istirahat/cuti, fee nominasi, tanpa nominasi, buffer dan cutoff eksplisit | + multi cabang, multi resource bersamaan |
| Pelanggan | Guest booking, identitas/kontak, **tautan aman** untuk lihat/ubah/batal | + akun member, riwayat gaya |
| Operasi | Kalender staff, buat booking telepon/walk-in, reschedule, owner vs staff permissions | + no-show scoring, catatan pelanggan kaya, shift planning |
| Notifikasi | Email konfirmasi/perubahan/reminder dengan delivery retry; satu provider | + WhatsApp/LINE API, SMS |
| Kualitas | **Server menjadi sumber jadwal**; transaksi atomik anti overlap, timezone, race test | + backup/restore drill, load test, monitoring |

v1: 6 halaman konten + layar booking + manage-guest + 3–4 screen admin.
UI custom dan domain scheduling terkontrol; library auth/email/scheduling dipakai
ulang. Pembayaran dilakukan di toko, sesuai konteks demo; payment online/deposit,
POS, multi cabang, loyalty, marketplace salon, dan sinkronisasi dua arah dengan
banyak platform tidak termasuk. Kompleksitas **tinggi** walaupun halaman publik
lebih sedikit daripada Tegak — **ini paket dengan rasio risiko terhadap jumlah
halaman tertinggi di antara yang ditawarkan.**

### Arden Property Auction — analisis, bukan paket

Bukti: [index.html](../public/samples/arden/index.html), `signedIn: false`,
`demoOnly`, pencarian dan tab; [arden-data.js](../public/samples/arden/arden-data.js),
`lots`, `notifications`, `toggleWatch`. Demo menyiratkan lot detail, register to
bid, deposit, dokumen, inspeksi, outbid alert, kalender, hasil, penjual dan
layanan korporat. Watchlist disimpan lokal. Homepage tidak mengimplementasikan
auction room atau adjudikasi pemenang. Link artefak `.dc.html` bukan bukti
route produksi sudah ada.

| Kelompok | Versi produksi yang diperlukan |
| --- | --- |
| Konten | Home, about, how to buy, how to sell, corporate services, contact, trust, FAQ, terms, privacy: 10 halaman |
| Katalog | Lot/list/detail/filter, event/list/detail/calendar, hasil, insight, file dokumen lot dengan akses terkontrol |
| Bidder | Daftar/login/reset, profil, upload dokumen, persetujuan kelayakan manual, watchlist, riwayat bid/hasil |
| Lelang | Timed ascending auction, reserve, increment, anti-sniping, server clock, validasi eligibility, urutan bid atomik, reconnect, closing job idempotent |
| Deposit | Satu provider/bank flow untuk status deposit/refund; rekonsiliasi operator; tidak menyimpan uang sendiri |
| Seller/inspection | Form appraisal/sell enquiry dan pengajuan jadwal inspeksi; approval admin |
| Admin | Kelola lot/event/dokumen, bidder approval, deposit/refund, pencabutan lot dengan audit, hasil, laporan, konten |
| Notifikasi | Registration, reminder, outbid, perubahan dokumen dan hasil; delivery retry dan logging |
| Kualitas | Audit bid yang tidak bisa diedit diam-diam, RBAC, rate limits, backup+restore drill, race/load tests, monitoring, runbook |
| Batas kapasitas | 100 lot aktif, 500 akun, target uji 100 bidder terkoneksi/10 bid per detik agregat |

Sekitar 26–34 template/screen. Estimasi effort **700–1.100 jam** (timed auction),
**900–1.500 jam** bila mode "Hybrid" pada demo harus benar-benar beroperasi
(console auctioneer, bid dari ruang fisik dan online dengan urutan sama, kontrol
pause/reopen, integrasi video, uji reconnect/latency). Angka ini dipertahankan
sebagai **ukuran mengapa pekerjaan ini ditolak**, bukan sebagai harga.

Tidak termasuk dalam pertimbangan apa pun: live video simulcast, multi operator
tenancy, escrow, settlement jual beli properti, integrasi registri tanah,
automated KYC/AML, aplikasi mobile native, atau SLA 24/7.

## Bukti pasar yang dipakai

Jenis bukti: **P** = harga penawaran publik vendor (**bobot utama**);
**G** = panduan harga oleh penyedia, bukan data transaksi (**bobot sekunder**);
**S** = subscription/produk yang tidak setara dengan fee custom (**konteks saja**).
Halaman tanpa tanggal terbit ditandai n.d.; masih dapat diakses saat riset,
tetapi tanggal perubahan harga tidak diketahui.

| ID | Sumber dan tanggal publikasi bila tersedia | Angka mentah dan relevansi |
| --- | --- | --- |
| ID1 | [Etzal, harga website](https://www.etzalgroup.com/id/services/pembuatan-website/harga), n.d., **P** | Company profile 3–5 halaman Rp3,5 juta; Business Pro Rp11 juta mencakup CMS/blog. Hosting/domain termasuk. **Anchor utama Tegak** |
| ID2 | [Hypothesis Digital, 7 Apr 2026](https://hypothesisdigital.com/id/blog/harga-jasa-pembuatan-website-2026), G | Custom company profile Rp3–8 juta; ecommerce Rp8–25 juta. Open langsung gagal; isi dari hasil pencarian. Bobot rendah |
| ID3 | [Erista, 31 Jul 2026](https://www.erista.id/blog/biaya-pembuatan-website-indonesia-2026-rincian-per-jenis-fitur), G | Ecommerce standar Rp20–80 juta; custom app Rp100 juta ke atas. Pembanding studio/agency, bukan bukti median |
| ID4 | [Velnafa, 26 Apr 2026](https://velnafa.com/blog/harga-jasa-pembuatan-website-2026), G | Company profile Rp5–20 juta, ecommerce Rp15–75 juta, custom app Rp30–200 juta+ |
| ID5 | [Sentrasoft, kalkulator](https://sentrasoft.co.id/kalkulator-biaya-website.html), n.d., **P** | Store mulai Rp7,5 juta, custom Rp17 juta, tambahan booking Rp4,5 juta. **Anchor utama Lembar/Kurohane** |
| ID6 | [doIT, sistem booking](https://www.doit.co.id/jasa-pembuatan-sistem-booking), n.d., P tanpa harga | Scope scheduling, staff dan konflik; waktu dasar 4–6 minggu, menengah 8–12 minggu. Cross-check effort saja |
| JP1 | [D.A.C, price list](https://dac-inc.co.jp/price.html), n.d., **P** | Custom TOP+5–9 halaman mulai ¥450.000; 10+ halaman ¥650.000. **Anchor utama Tegak JP** |
| JP2 | [YOUTOWN, web/EC](https://youtown.co.jp/service/web), n.d., **P** | Corporate ¥300.000+, EC light ¥400.000+, standard ¥980.000+; sebelum pajak |
| JP3 | [Eyes of C, EC](https://www.eyesofc.co.jp/special/ec/), n.d., **P** | EC original ~10 halaman ¥800.000+; CMS ¥1 juta+; ~20 halaman ¥2 juta+. Layanan cart dibayar terpisah |
| JP4 | [Mocamoco, booking](https://corporate.mocamoco.com/service/entrusted_development/booking-payment/), n.d., **P** | Booking+admin ¥1 juta+, dengan pembayaran ¥3 juta+, full custom ¥5 juta+ |
| JP5 | [GeekBridge, booking cost](https://www.geek-bridge.com/column/booking-system-development-cost), 2026, G | CMS/low-code ¥0,8–3 juta; full scratch ¥5–20 juta+ |
| JP6 | [ripla, auction process](https://www.ripla.co.jp/blog/system/auction-system-process/), 2026, G | Paket kecil ¥1,5–2 juta; full scratch ¥9 juta+; besar ¥20 juta+ |
| US1 | [GetWebSmart, California](https://www.getwebsmart.com/), n.d., **P** | 5 halaman US$499; 10 halaman US$1.299; 15 halaman US$1.999. Segmen murah AS, berbasis template |
| US2 | [FineWright, pricing](https://finewright.com/pricing), n.d., **P** | Satu halaman US$599, multi page US$1.499, store/besar mulai US$2.999 |
| US3 | [Progression, salon website](https://progressionagency.com/salon-website-design), n.d., G | WordPress custom 15–30 halaman dengan booking embed US$7–14 ribu; **embed, bukan engine sendiri** |
| US4 | [YantraCore, booking 2026](https://www.yantracore.com/blog/how-much-booking-website-cost-2026), G | Custom scheduling US$10–30 ribu+ |
| US5 | [Bidvantic, pricing](https://www.bidvantic.com/pricing), n.d., P | Focused platform US$10–30 ribu; business US$40–60 ribu; licence+implementation |
| US6 | [AuctionMethod, custom pricing](https://www.auctionmethod.com/custom-auction-software-development/pricing-explained), n.d., P | Dev sebelum launch US$8–15 ribu modest, US$20–45 ribu moderate, US$60–120 ribu+ complex |
| X1 | [PINCLER, 29 Agu 2026](https://www.pincler.com/blog/booking-system-development-cost), P | Mengklaim booking custom AI assisted US$900–2.000, 10–16 hari. Kompetitor lintas negara; klaim cakupan/kualitas belum diverifikasi |
| X2 | [WebX360, ecommerce](https://www.webx360.com/ecommerce-web-design-for-small-business/), n.d., S | Setup US$299 + US$49/99/299 per bulan; komitmen setahun. Core programming tetap milik vendor |
| X3 | [UNO, booking plans](https://uno-web.jp/plan/), n.d., S | Setup STORES ¥110.000+ (termasuk pajak); paket booking internal bisa ¥0 awal + ¥10.780/bulan |

Tidak ada sumber harga lelang Indonesia yang cocok dengan Arden dengan rincian
publik memadai. Karena Arden tidak lagi ditawarkan, celah ini tidak lagi menjadi
risiko penetapan harga.

## Efek AI: diterapkan pada effort, tidak sebagai diskon

Studi Microsoft atas tiga eksperimen lapangan/4.867 developer melaporkan
kenaikan tugas selesai sekitar 26,08%; itu bukan pengurangan biaya proyek
sebesar 26,08% dan bukan studi khusus website freelance.
[Sumber penelitian Microsoft](https://www.microsoft.com/en-us/research/publication/the-effects-of-generative-ai-on-high-skilled-work-evidence-from-three-field-experiments-with-software-developers/?lang=fr-ca).

METR menemukan perlambatan 19% pada konteks repository matang awal 2025.
Update 24 Februari 2026 mengingatkan adanya bias seleksi yang membuat besar
percepatan terbaru tidak dapat diukur andal. Memakai studi lama itu untuk
mengklaim "AI selalu lambat" juga keliru.
[Update penelitian METR](https://metr.org/blog/2026-02-24-uplift-update/).

AI diasumsikan membantu scaffolding, CSS, CRUD, draf test, dan dokumentasi.
Jam di bawah **sudah AI assisted** dan memakai komponen/library matang.
Tidak ada diskon AI tambahan sesudahnya. Efisiensi produksi UI tidak menghapus
discovery, persetujuan desain, pengecekan konten, review authorization,
race condition, acceptance testing, dan tanggung jawab launch.

**Inilah pembenaran utama penurunan jam dari versi lama.** Versi lama mengklaim
jamnya "sudah AI assisted" tetapi tetap menyusun paket pekerjaan kelas agency
(UAT formal, runbook kegagalan, backup/restore drill, load test) yang memang
diperlukan tim yang melayani klien dengan proses procurement — bukan satu orang
yang melayani UMKM. Scope v1 membatasi janjinya, sehingga jamnya ikut turun
secara jujur, bukan karena optimisme.

## Estimasi effort bottom-up untuk scope v1

Jam orang efektif, termasuk komunikasi/delivery; bukan durasi agent berjalan.
Asumsi builder sudah mampu memakai stack yang dipilih.

### Tegak v1 — 55–85 jam

| Paket pekerjaan | Jam |
| --- | ---: |
| Discovery, acceptance criteria | 6–10 |
| Desain + frontend responsif: 7 halaman konten + 2 template | 20–30 |
| Model data, CMS, 3 screen admin, hak akses | 14–22 |
| Form lead, lampiran, antispam, email | 4–7 |
| QA, SEO teknis, mobile, accessibility dasar | 7–11 |
| Deploy, dokumentasi, handover, cadangan garansi | 4–5 |
| **Total** | **55–85** |

### Lembar v1 — 110–170 jam

| Paket pekerjaan | Jam |
| --- | ---: |
| Discovery + fit-gap platform commerce | 10–16 |
| Storefront custom + template produk/kategori | 26–38 |
| Konfigurasi commerce: varian, stok, pesanan, kupon | 22–34 |
| Satu gateway + webhook idempotent + satu integrasi ongkir | 16–24 |
| Akun pelanggan + guest checkout | 10–14 |
| Impor CSV ≤200 SKU + QA data | 8–12 |
| QA transaksi, sandbox, race stok, hak akses | 12–20 |
| Deploy, dokumentasi, training, cadangan garansi | 6–12 |
| **Total** | **110–170** |

### Kurohane v1 — 100–160 jam

| Paket pekerjaan | Jam |
| --- | ---: |
| Discovery + aturan scheduling tertulis | 8–14 |
| Desain + frontend: 6 halaman konten, menu, barber, galeri | 22–32 |
| Booking engine: 1 lokasi, ≤5 staf, durasi variabel, buffer, cuti | 28–44 |
| Guest manage link, pembatalan, reschedule | 10–16 |
| Email konfirmasi/reminder + delivery retry | 8–12 |
| Kalender staf, walk-in, roles | 12–20 |
| QA: anti-overlap, timezone, race test | 8–14 |
| Deploy, dokumentasi, training, cadangan garansi | 4–8 |
| **Total** | **100–160** |

Minggu kapasitas pada 25 jam efektif/minggu: Tegak 2,2–3,4; Lembar 4,4–6,8;
Kurohane 4–6,4. Hari tunggu konten, review klien, dan persetujuan provider
menambah kalender di luar angka ini. Pembagian kerja bisa mengurangi kalender,
tidak otomatis mengurangi jam orang. Penggunaan ulang kode demo memerlukan audit;
demo **tidak** dinilai sebagai backend siap produksi.

## Normalisasi pasar dan penetapan fee

Rentang berikut adalah **penilaian analis** atas scope v1, dengan **bobot utama
pada sumber tipe P**. Segmen pembanding: freelancer berpengalaman/studio kecil
dengan desain custom dan delivery tuntas. Batas atas bukan enterprise global,
batas bawah bukan promo template termurah.

| Proyek / pasar | Acuan tipe P yang sebanding | Titik tengah | Fee Skyland | Di bawah titik tengah |
| --- | ---: | ---: | ---: | ---: |
| Tegak / ID | Rp8–14 jt (ID1 Business Pro Rp11 jt) | Rp11 jt | Rp6,5 jt | 41% |
| Tegak / JP | ¥300–450 rb (JP1, JP2) | ¥375 rb | ¥220 rb | 41% |
| Tegak / AS | $2.500–4.000 (US2 store+ tier) | $3.250 | $1.900 | 42% |
| Lembar / ID | Rp15–28 jt (ID5 custom + store) | Rp21,5 jt | Rp13 jt | 40% |
| Lembar / JP | ¥700 rb–1,1 jt (JP2, JP3) | ¥900 rb | ¥440 rb | 51% |
| Lembar / AS | $4.500–8.000 (US2 $2.999+) | $6.250 | $3.800 | 39% |
| Kurohane / ID | Rp18–28 jt (ID5 Rp17 jt + Rp4,5 jt) | Rp23 jt | Rp12 jt | 48% |
| Kurohane / JP | ¥1–2 jt (JP4) | ¥1,5 jt | ¥420 rb | **72%** |
| Kurohane / AS | $7–14 rb (US3, US4) | $10,5 rb | $3.600 | **66%** |

Cara membangun acuan: Tegak melampaui paket 5 halaman karena CMS beberapa jenis
konten, form berkas, dan desain custom (ID1, JP1/JP2, US2). Lembar berada di
segmen commerce menengah karena storefront custom di atas engine matang, bukan
theme installation (ID5, JP2/JP3, US2). Kurohane memakai anchor custom scheduling,
bukan harga embed (ID5, JP4, US3/US4).

**Temuan penting dari tabel ini:** karena tarif per jam dijaga konsisten lintas
paket, Kurohane jatuh 48–72% di bawah pembanding, jauh lebih dalam daripada
Tegak dan Lembar. Artinya **booking adalah paket yang paling underpriced relatif
pasar, dan paling dulu layak naik harga** setelah ada portfolio. Itu konsekuensi
yang sehat dari tarif konsisten, bukan kesalahan — tetapi harus dicatat supaya
kenaikan harga berikutnya diarahkan ke tempat yang benar. Lihat jalur kenaikan
di [dokumen 5](PRICING_RESEARCH_05_COMMERCIAL.md).

Uji sensitivitas sebelum deal: jam +25% menurunkan tarif efektif 20%; konten
belum siap, integrasi nonstandar, atau multi bahasa perlu estimate terpisah.
Keyakinan: Tegak **menengah**, Lembar **menengah**, Kurohane **menengah–rendah**.
Rentang bukan confidence interval statistik.

## Alternatif ekonomis tanpa menyamakan scope

Jika calon klien menolak harga v1, tawarkan produksi berbasis platform.
Berikut **estimasi analis**, bukan harga vendor terverifikasi:

| Alternatif | ID / JP / AS | Konsekuensi |
| --- | --- | --- |
| Tegak lebih sederhana, CMS/template siap | Rp3–5 jt / ¥100–170 rb / $900–1.400 | Gerak/peta/layout dibatasi, konten dan template lebih sedikit |
| Lembar theme commerce + plugin standar | Rp6–9 jt / ¥200–300 rb / $1.700–2.600 | Styling mengikuti platform; custom logic dan impor disederhanakan; lisensi terpisah |
| Kurohane website + scheduling SaaS | Rp4–7 jt / ¥140–240 rb / $1.200–2.000 | Pelanggan bisa booking nyata; aturan/UI dibatasi SaaS; subscription bukan fee development |
| Arden katalog + integrasi platform lelang | — | **Tidak ditawarkan.** Arahkan ke discovery berbayar lalu vendor spesialis |

Jangan memilih jalur alternatif lalu menyatakan semua kebutuhan custom tercakup.
Buat matriks fit-gap dengan provider sebelum mengunci harga.

Temuan utama untuk tahap berikutnya: pembanding harus membawa **scope, cara
pembangunan, batas operasi, dan tingkat kepastian**, bukan hanya jenis website.
Dan **setiap harga harus lulus uji lantai biaya dalam mata uang tempat pemilik
benar-benar hidup**, bukan hanya terlihat kompetitif di pasar tujuan.
