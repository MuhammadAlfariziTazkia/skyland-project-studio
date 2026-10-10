# 5 — Strategi komersial: bauran pasar, risiko, dan urutan

Tanggal: **10 Oktober 2026, Asia/Tokyo**. Status: **usulan kebijakan bisnis;
keputusan bauran pasar sudah diambil pemilik, sisanya menunggu konfirmasi.**
Basis: [pasar/scope](PRICING_RESEARCH_01_MARKET.md),
[simulasi](PRICING_RESEARCH_02_SIMULATION.md),
[akar penyebab](PRICING_RESEARCH_03_EVALUATION.md),
[scope/estimator](PRICING_RESEARCH_04_STRATEGY.md).

## Mengapa dokumen ini ada

Dokumen 4 merancang **mesin scope dan estimator** dengan baik. Tetapi ia
memperlakukan ID/JP/US sebagai tiga rate card yang tinggal dikonfigurasi, dan ia
tidak membahas empat hal yang dampaknya ke penghasilan pemilik lebih besar
daripada presisi estimator mana pun:

1. ke pasar mana usaha akuisisi diarahkan;
2. apakah pemilik dibayar sebelum bekerja;
3. berapa diskon yang boleh menumpuk;
4. pekerjaan apa yang sebaiknya ditolak.

Keempatnya adalah keputusan kebijakan, bukan pekerjaan rekayasa. Semuanya bisa
diputuskan minggu ini dan tidak satu pun memerlukan estimator baru.

## 1. Bauran pasar adalah tuas terbesar

Keputusan pemilik: **klien Indonesia memakai harga Indonesia; klien Jepang
memakai harga yang dinaikkan sampai murah di mata pasar Jepang; selain itu
memakai harga global/AS.**

Konsekuensi aritmetiknya harus terlihat, bukan tersembunyi:

| Pasar | Tarif/jam | Dalam yen | vs UMR Kanagawa ¥1.279 | Satu proyek Kurohane (130 jam) |
| --- | ---: | ---: | ---: | ---: |
| ID | Rp93.000 | kira-kira ¥808 | **0,63x** | kira-kira ¥104.000 |
| JP | ¥3.150 | ¥3.150 | 2,46x | ¥420.000 |
| Global/AS | $27 | kira-kira ¥4.212 | 3,29x | kira-kira ¥562.000 |

**Satu proyek global bernilai sekitar 5,4 proyek Indonesia** untuk jumlah jam yang
sama. Itu bukan argumen meninggalkan Indonesia — itu argumen agar Indonesia
diperlakukan sebagai apa yang memang dipilih pemilik: **pasar portfolio dan
referral, bukan sumber pendapatan utama.**

### Kebijakan yang mengikuti keputusan itu

- **Harga Indonesia berada di bawah lantai biaya pemilik, secara sadar.**
  Dokumen harus menyebutnya subsidi pemasaran berjangka, bukan margin aman.
  Jangan menambah diskon apa pun di atas harga Indonesia.
- **Batasi eksposurnya.** Usul: maksimal 3-4 proyek Indonesia pada periode
  portfolio, atau batas jam Indonesia per kuartal. Subsidi tanpa batas bukan
  strategi masuk pasar, melainkan kebiasaan.
- **Arahkan akuisisi ke tempat uangnya.** Bila waktu pemasaran terbatas, porsi
  terbesar diarahkan ke klien di luar Indonesia dan Jepang, lalu Jepang.
  Indonesia dilayani lewat referral dan jaringan yang sudah ada, yang biaya
  akuisisinya mendekati nol.

### Jalur kenaikan harga

Harga masuk yang rendah sah sebagai strategi, tetapi klien awal menjadi anchor
reputasi dan harga sulit dinaikkan belakangan. Karena itu jalurnya ditetapkan
**sekarang**, bukan nanti saat sudah terasa rugi:

| Pemicu | Tindakan |
| --- | --- |
| 3 proyek selesai + 2 testimoni publik | ID +15%, JP +25%, Global +15% |
| 5 proyek + satu studi kasus terukur | Tinjau ulang terhadap lantai biaya aktual; hentikan subsidi ID bila kapasitas penuh |
| Kapasitas penuh 2 bulan berturut-turut | Naikkan harga, jangan tambah jam kerja |

**Kurohane adalah paket yang paling dulu layak naik.** Menurut
[dokumen 1](PRICING_RESEARCH_01_MARKET.md), booking jatuh 48-72% di bawah
pembanding tipe P, jauh lebih dalam daripada Tegak (41%) dan Lembar (39-51%).
Itu konsekuensi tarif yang dijaga konsisten lintas paket, dan arah kenaikan
pertama harus diarahkan ke sana.

## 2. Termin pembayaran: risiko finansial terbesar

`payment_terms.down_payment_percent` saat ini **0**. Artinya pemilik dapat
mengerjakan 130 jam untuk Kurohane, lalu klien menghilang, dan pemilik tidak
menerima apa pun.

Mengapa ini lebih besar daripada galat harga mana pun:

- Galat harga 30% pada satu proyek merugikan 30% dari satu proyek.
  **Klien yang tidak membayar merugikan 100% dari satu proyek**, plus biaya
  peluang seluruh jamnya.
- Penagihan lintas negara Jepang ke Indonesia tidak praktis: biaya hukumnya
  melebihi nilai proyek v1 mana pun di tabel harga ID.
- Pemula tidak punya leverage kontrak, tidak punya nama yang bisa dirugikan
  klien, dan tidak punya pipeline yang membuatnya mampu menolak klien buruk.
- Risikonya **paling besar justru di pasar yang disubsidi**, karena di situ
  harganya paling rendah sehingga insentif pemilik untuk menuntut paling kecil.

Dokumen 4 menyebut hal ini hanya sambil lalu, untuk Arden.

### Usul kebijakan

| Nilai proyek | Termin |
| --- | --- |
| Di bawah ambang kecil | DP 30%, pelunasan sebelum pemindahan ke domain klien |
| Menengah | 30% / 40% pada persetujuan desain / 30% sebelum pemindahan |
| Discovery berbayar | 100% di depan; nilainya kecil dan hasilnya dokumen |

Kebijakan "tanpa DP" boleh dipertahankan **sebagai keputusan sadar untuk paket
terkecil saja** bila pemilik menilai daya tariknya sepadan. Untuk paket di atas
40 jam, tanpa DP berarti pemilik memberi kredit tanpa jaminan kepada orang yang
belum dikenalnya.

Perubahan ini menyentuh copy, legal, dan email EN+ID — bukan mesin harga.
Itu membuatnya salah satu perbaikan termurah dengan dampak terbesar.

## 3. Hentikan penumpukan diskon

Keadaan sekarang: `founding_offer.percent` 20 dan `max_discount_percent` 40,
aditif. Pada Kurohane ID, diskon 40% menghasilkan **¥420/jam — sepertiga upah
minimum prefektur tempat pemilik tinggal.**

| Kasus | List | Founding 20% | Founding+promo 40% | Per jam pada 40% |
| --- | ---: | ---: | ---: | ---: |
| Tegak ID | Rp6,5 jt | Rp5,2 jt | Rp3,9 jt | kira-kira ¥485 |
| Kurohane ID | Rp12 jt | Rp9,6 jt | Rp7,2 jt | kira-kira ¥481 |
| Kurohane JP | ¥420.000 | ¥336.000 | ¥252.000 | ¥1.938 |

### Usul kebijakan

1. **Founding 10%, bukan 20%.** Harga list sudah 39-72% di bawah pembanding
   tipe P; diskon besar di atasnya tidak lagi diperlukan untuk terlihat murah.
2. **Hapus penumpukan.** Satu diskon berlaku, yang terbesar. `max_discount_percent`
   menjadi 10.
3. **Tidak ada diskon di atas harga ID.** Harga itu sudah subsidi.
4. **Jangan menggelembungkan list untuk menciptakan diskon semu.** Publikasikan
   harga pengenalan yang memang berlaku beserta periode dan kuotanya.
5. **Lantai biaya memblokir diskon**, bukan sekadar memperingatkan.

Konsekuensi yang harus diterima: daya tarik promosi jangka pendek berkurang.
Imbalannya adalah harga yang tidak perlu dibohongi dan tidak perlu dinaikkan
diam-diam nanti.

## 4. Pekerjaan yang tidak dikerjakan

Dokumen 4 menangani Arden dengan **gate discovery**. Itu benar secara mekanis
tetapi salah secara bisnis: membangun alur discovery untuk pekerjaan yang memang
tidak boleh diambil solo berarti membayar biaya rekayasa untuk mempertahankan
pilihan yang seharusnya ditutup.

Yang lebih murah, lebih kredibel, dan lebih melindungi: **daftar publik berisi
pekerjaan yang tidak dikerjakan.**

| Tidak dikerjakan | Alasan |
| --- | --- |
| Lelang, bidding, penawaran kompetitif real-time | Urutan bid atomik, anti-sniping, audit yang tak bisa diubah; konsekuensi kesalahan adalah sengketa hukum pihak ketiga |
| Marketplace multi-seller | Payout, perselisihan, kewajiban pajak pihak ketiga |
| Fintech, pinjaman, pembayaran tersimpan | Perizinan dan kewajiban kepatuhan |
| Rekam medis atau data kesehatan | Kewajiban hukum khusus di setiap yurisdiksi |
| Escrow atau kustodi dana klien | Memegang uang orang lain |
| KYC/AML otomatis | Kewajiban regulasi yang tidak bisa dipenuhi satu orang |

Daftar ini **menaikkan kredibilitas**, bukan menurunkannya. Penyedia yang
menyatakan batasnya terbaca lebih profesional daripada yang mengaku bisa semua.
Ia juga menghemat waktu: calon klien yang tidak cocok menyaring dirinya sendiri.

Yang tetap ditawarkan untuk kebutuhan di daftar itu: **discovery berbayar**
(Rp3-5 juta / ¥250.000-400.000 / $2.000-3.000) yang menghasilkan spesifikasi,
model data, aturan tertulis, dan proposal fixed-price yang boleh dikerjakan
pihak lain. Pemilik dibayar untuk analisisnya tanpa menanggung risiko delivery.

Di kode, daftar ini menjadi `blocking_domains`: kena satu saja, status menjadi
`discuss` **apa pun** nominalnya, pasarnya, promonya, atau walau `customRequests`
kosong. Lihat [dokumen 3](PRICING_RESEARCH_03_EVALUATION.md) sebab #6: saat ini
seluruh kasus v1 — termasuk Kurohane dengan engine scheduling — berstatus `fixed`
hanya karena tidak ada label custom.

## 5. Urutan: guardrail sekarang, estimator nanti

Dokumen 4 versi pertama mengusulkan membangun estimator work-package lengkap
sebagai bagian awal. Itu urutan terbalik, dengan alasan yang dokumen 4 sendiri
nyatakan: kalibrasinya tidak sah tanpa jam aktual.

| Sekarang (hari, bukan bulan) | Nanti (setelah 5+ proyek) |
| --- | --- |
| Gate risiko lepas dari nominal | WorkPackage effort band |
| Hapus silent truncation 24 halaman | ScopeParameters typed |
| Pasar JP + JPY; batas min/max per pasar | Workflow model |
| Lantai biaya; hentikan penumpukan diskon | P50/P80 dan interval terkalibrasi |
| Termin pembayaran | Eval AI 96 output |
| Katalog diturunkan dari jam x tarif | Shadow mode dan pilot |

Yang harus dicatat sejak proyek pertama, karena tanpanya kolom kanan tidak akan
pernah bisa dikerjakan: **jam aktual per paket pekerjaan, rework, perubahan
scope, keuntungan kotor setelah biaya langsung, penyebab estimate meleset, dan
rasio quote ke deal.** Mulai dari spreadsheet; ia tidak perlu masuk aplikasi.

Jangan mengklaim interval terkalibrasi dari tiga proyek. Mulai dengan 10-20
proyek atau review estimate terstruktur, lalu laporkan keterbatasan sampelnya.
Tinjau tarif dan effort tiap kuartal, dan setiap kali kemampuan reuse berubah.

## 6. Keputusan yang masih menunggu pemilik

Tiga angka ini **memblokir** perhitungan lantai biaya, dan tidak ada dokumen
yang bisa menebaknya:

1. **Biaya waktu per jam yang sebenarnya** — sewa, asuransi, pensiun, pajak,
   tools, dibagi jam kerja riil per bulan.
2. **Kapasitas jam riil per minggu** untuk pekerjaan klien, setelah administrasi,
   pemasaran, dan belajar.
3. **Margin minimum yang diterima** sebelum sebuah proyek layak ditolak.

Sampai ketiganya ada, seluruh angka lantai biaya di
[dokumen 4](PRICING_RESEARCH_04_STRATEGY.md) bagian 7 adalah ilustrasi.
Harga jual di dokumen 1 tidak bergantung padanya dan sudah dapat dipakai —
tetapi apakah harga itu benar-benar menguntungkan belum terbukti, dan dokumen
ini tidak mengklaim sebaliknya.

Pertanyaan terbuka lain yang tidak memblokir: platform commerce dan scheduling
mana yang benar-benar dikuasai pemilik (menentukan apakah jalur Extend realistis),
dan apakah pemilik bersedia menolak proyek yang tidak melewati lantai.
