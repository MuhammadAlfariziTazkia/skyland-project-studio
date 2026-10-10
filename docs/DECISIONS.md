# Keputusan arsitektur yang tercermin dalam kode

Catatan berikut direkonstruksi dari implementasi dan komentar pada 4 Oktober
2026. Ini bukan klaim bahwa ADR formal atau persetujuan historis pernah dibuat.
Status seluruh keputusan di bawah: **pola yang digunakan saat audit**.

## D-01 — Marketing statis dengan island konsultan

**Implementasi:** Astro output static, API opt-out prerender, Preact client:load
hanya di ConsultPage; adapter Vercel. Halaman layanan dibuat dengan static paths.

**Alasan yang tercermin:** konten bisnis dan SEO dapat dirender cepat tanpa
aplikasi client penuh; konsultasi tetap interaktif. **Konsekuensi:** perubahan
copy/harga/public env membutuhkan build; tidak ada router/state aplikasi global.
Pertimbangkan ulang bila kebutuhan menjadi aplikasi akun dinamis yang dominan,
bukan karena kebiasaan provider agent.

## D-02 — AI mengklasifikasi, kode menghitung harga

**Implementasi:** katalog prompt tanpa harga, Zod ID enum, satu engine harga
browser/server. **Alasan:** total konsisten dan item biaya tidak diarang AI.
**Konsekuensi:** kualitas scope tetap bergantung AI dan relasi halaman/fitur;
valid ID tidak menjamin scope lengkap. Penambahan kebutuhan harus memperbarui
katalog/copy dan pengujian, bukan prompt untuk menebak harga baru.

## D-03 — Halaman fitur mengikuti harga fitur

**Implementasi:** page_types menurunkan area/feature; hanya contentPages dikenai
kuota/extra page. **Alasan:** cart/checkout/member/admin tidak dihitung ganda
dengan fitur yang sudah membawanya. **Konsekuensi:** visibility mengikuti fitur;
paket includes tetap aktif; toggle manual belum menyediakan screen baru otomatis.

## D-04 — Kontrak structured JSON, rendering dikontrol kode

**Implementasi:** fetch Chat Completions + strict JSON Schema + Zod; AI mockup
menghasilkan copy, `renderMockup()` menghasilkan HTML/CSS. **Alasan:** shape
terkontrol, biaya/context lebih kecil, renderer aman digunakan ulang.
**Konsekuensi:** mockup terbatas pada template homepage, bukan generator app
multi-page; JSON Schema provider dan Zod harus dijaga sinkron.

## D-05 — Revisi sebagai patch

**Implementasi:** PATCH_JSON_SCHEMA dan applyPatch dengan current plan ringkas.
**Alasan:** perubahan lebih kecil dan token lebih sedikit daripada regenerasi
Plan penuh. **Konsekuensi:** flow/summary/questions tidak ikut disusun ulang;
model tidak melihat seluruh sections/quantity saat ini. Satu revisi merupakan
kebijakan UI, belum kuota backend.

## D-06 — Tanpa database, draft browser dan order inbox

**Implementasi:** localStorage untuk seluruh State, SMTP langsung di request,
lampiran JSON sebagai hasil lengkap. **Alasan yang tampak:** operasional awal
ringan dan tidak memerlukan sistem akun/admin. **Konsekuensi:** tidak ada
cross-device, quote retrieval, expiry, idempotency, slot counting otomatis,
atau data terpusat. Jika kebutuhan tersebut nyata, desain persistensi dapat
dibahas sebagai perubahan produk tersendiri.

## D-07 — Bilingual dengan routing eksplisit

**Implementasi:** EN default, ID prefix; pasangan route untuk hreflang/sitemap;
dictionary TS dan locale props. **Alasan:** halaman SEO kedua bahasa tetap
independen dan dapat ditautkan. **Konsekuensi:** konten harus diselaraskan di
beberapa file; locale dan region bukan satu variabel; auto-redirect hanya browser.

## D-08 — Promo secret, offer publik

**Implementasi:** PROMO_CODES hanya server, public percent/slot/cap di-inline
Vite; lookup ulang saat order. **Alasan:** iklan diskon transparan tetapi tabel
kode tidak bocor melalui JSON/bundle. **Konsekuensi:** offer butuh redeploy,
jumlah slot manual, promo hasil lookup lama dapat stale, batas minimum membatasi
penghematan riil.

## D-09 — Reference HMAC pendek tanpa record quote

**Implementasi:** SKY + 8 hex dari HMAC payload Plan/Choices/total/status.
**Alasan:** referensi deterministik yang praktis di email/WhatsApp tanpa database.
**Konsekuensi:** bukan token validasi sesi, tidak unik secara absolut, tidak
menegakkan expiry, dan tidak mencegah kirim ulang order. Secret production
harus eksplisit walau implementasi mempunyai fallback dev-secret.

## D-10 — Demo konsep mandiri

**Implementasi:** HTML public hasil desain dengan support runtime React CDN,
capture screenshot ke assets, tampil terpisah dari project nyata.
**Alasan yang tampak:** desain eksplorasi bisa dipamerkan tanpa ditulis ulang
sebagai komponen Astro. **Konsekuensi:** dependensi/font/image eksternal dan
runtime berbeda; perubahan CSP/runtime harus memperhitungkan demo tersebut.

## D-11 — Tiga pasar harga, bukan dua, dan bukan konversi kurs

Region `ID` dan `GLOBAL` menjadi `ID`, `JP`, `GLOBAL`, masing-masing dengan
daftar harga, mata uang, pembulatan, dan batas min/max sendiri di
`data/pricing.json`.

**Mengapa.** Pemilik tinggal di Kanagawa dan membayar biaya hidup dalam yen,
tetapi klien Jepang sebelumnya hanya bisa dilayani memakai harga USD. Lebih
buruk, batas kedua region tidak sebanding: `ID.max_price` Rp22 juta setara
sekitar $1.229 sementara `GLOBAL.max_price` $12.000, sehingga scope yang sama
mendapat status berbeda hanya karena tabel regionnya.

**Konsekuensi.** Tidak ada locale `ja`, jadi pasar JP hanya bisa datang dari
pemilih pasar eksplisit; `regionFor(locale)` tetap sekadar default. Bahasa UI,
bahasa website pesanan, pasar harga, dan mata uang adalah empat pilihan terpisah.
Setiap item katalog baru wajib punya nilai ID, JP, dan GLOBAL. Harga ID berada
di bawah lantai biaya pemilik secara sadar; lihat
[riset harga 05](PRICING_RESEARCH_05_COMMERCIAL.md).

## D-12 — Harga katalog diturunkan dari jam, dan diuji

Setiap `base` dan `features[].price` = `est_hours x pricing_basis.hourly_rate[pasar]`,
dibulatkan. Sebuah test invariant menjaganya.

**Mengapa.** `hourly_rate` dulu hanya metadata yang tidak dibaca `quote()`,
sehingga harga di-hand-tune dan menyimpang: rasio ID/GLOBAL berjalan 6,6x–8,9x
antar paket padahal basis jamnya menyiratkan 6,5x. Akibatnya scope yang sama
membayar tarif efektif yang berbeda 6–7 kali antar pasar.

**Konsekuensi.** Mengubah `est_hours` tanpa meregenerasi harga menggagalkan test.
Menambah fitur berarti memilih jamnya, bukan menebak harganya. Paket dibulatkan
ke `round_to` supaya rencana yang pas tidak memunculkan baris pembulatan; fitur
ke `catalog_round` yang lebih halus.

## D-13 — Pengali desain hanya menyentuh kerja desain

`design_level` dan `content_readiness` dikalikan pada `designPart`
(`base x design_share` + halaman tambahan + fitur `design_bearing`), bukan pada
seluruh subtotal. `timeline` tetap menyentuh seluruhnya.

**Mengapa.** `full_custom 1,4` dulu menaikkan **semua** baris, sehingga memilih
desain custom menaikkan harga payment gateway dan matriks hak akses sebesar 40%.
Karena `est_hours` mengasumsikan `semi_custom`, nilainya kini 0,9 / 1,0 / 1,15.

**Konsekuensi.** `template` adalah pengurangan, bukan netral. Test yang ingin
"base saja" harus memakai `semi_custom`. `calculation.max_multiplier` kini
benar-benar diterapkan; kombinasi penuh dulu mencapai 2,268x tanpa batas.

## D-14 — Risiko domain menentukan status, bukan nominal

`quote()` mengembalikan `risk` dan memaksa `discuss` bila teks Plan menyentuh
`blocking_domains`, bila `service.risk_tier` adalah `review`, atau bila scope
terpotong — terlepas dari besar harga, pasar, dan promo.

**Mengapa.** Status dulu hanya melihat nominal dan keberadaan `customRequests`.
Menghapus tiga label custom mengubah platform lelang menjadi `fixed $9.150` tanpa
perubahan kebutuhan bisnis, dan `MAX_PAGES` memotong halaman diam-diam sehingga
engine memberi harga atas scope yang sebagian hilang.

**Konsekuensi.** Pencocokan kata kunci sengaja longgar: salah menahan harga
berarti satu percakapan, salah memberi harga pasti berarti proyek yang tidak bisa
dikerjakan. Bidang yang ditolak perlu copy sendiri (`discussBlocked`), karena
brief yang diblokir bisa saja kecil. Daftarnya adalah keputusan bisnis, bukan
teknis; lihat [riset harga 05](PRICING_RESEARCH_05_COMMERCIAL.md) bagian 4.

## D-15 — Satu diskon, dan DP 30%

Founding dan promo tidak lagi menumpuk: yang dipakai adalah persentase terbesar,
dibatasi `max_discount_percent` 10. Pasar dalam `no_discount_markets` tidak
mendapat diskon. `down_payment_percent` menjadi 30.

**Mengapa.** Founding 20% + promo 20% = 40% menghasilkan sekitar sepertiga upah
minimum Kanagawa per jam pada proyek booking Indonesia. Dan DP 0% berarti pemilik
bisa mengerjakan 130 jam lintas negara tanpa jalur penagihan praktis lalu tidak
dibayar sama sekali — risiko finansial yang lebih besar daripada galat harga
mana pun.

**Konsekuensi.** Copy "Tanpa DP" di `en.ts`/`id.ts` diganti; argumen kepercayaan
berpindah ke harga yang dikunci tertulis dan desain yang disetujui lebih dulu.
`paymentNoDeposit` tetap ada sebagai fallback bila DP dikembalikan ke 0. List
price tidak boleh digelembungkan untuk menciptakan diskon semu.


## D-16 — Pintu masuk kedua: halaman konsep berharga

Tiap konsep di `public/samples/` punya halaman detail dengan harga dan rincian
fitur yang bisa dicentang (`/concepts/<slug>/`, `/id/konsep/<slug>/`). Dari situ
klien melompat **langsung ke layar hasil** konsultan, melewati step 2 dan 3.

**Mengapa.** Satu-satunya jalan ke harga dulu adalah konsultasi AI: empat layar
sebelum ada angka. Orang yang membuka demo Kurohane dan merasa cocok terpaksa
mendeskripsikan ulang bisnisnya dari nol. Halaman konsep **menjadi** step 2,
jadi fitur tidak dipilih dua kali — itu risiko kebingungan terbesar kalau step 2
tetap dilewati. Step 3 tidak perlu karena layar hasil sudah punya pemilih gaya
ringkas yang merender ulang mockup secara lokal.

**Konsekuensi.** Jalur ini **tidak memanggil AI sama sekali**: mockup tiap konsep
ditulis tangan di `src/lib/samples/mockups.ts`, mengikuti pola `SAMPLE_MOCKUP`.
Serah-terima lewat `localStorage['skyland-consult-v2']`, mekanisme yang sudah
dipakai `scripts/audit-responsive.mjs`. `planKey()` karena itu pindah ke
`src/lib/samples/plan.ts` dan dipakai bersama: kalau dua implementasinya berbeda,
layar hasil akan meminta mockup yang sebenarnya sudah ada. Konsultasi yang sedang
berjalan dikonfirmasi dulu sebelum ditimpa.

## D-17 — Scope konsep punya satu sumber kebenaran

`src/lib/samples/specs.ts` memegang scope tiap konsep: service, halaman, fitur,
dan seberapa dibutuhkan tiap fitur. Halaman konsep, mesin harga, dan test
kalibrasi membacanya.

**Mengapa.** Scope itu sebelumnya ada di tiga tempat yang tidak saling tahu:
fixture di `tests/pricing.test.ts`, tabel di `docs/PRICING_RESEARCH_01_MARKET.md`,
dan `ConceptCopy` di `src/i18n/en.ts`. Harga yang ditampilkan ke klien jadi bisa
menyimpang dari angka yang diteliti tanpa ada yang menyadarinya.

**Konsekuensi.** Target fee doc 01 dijaga test yang sama dengan yang memberi harga
halaman, jadi keduanya tidak bisa berpisah. Urutan fitur memakai aturan pemilik:
**kebutuhan sektor dulu, lalu harga menaik** — itu menghasilkan keempat tier
(dibutuhkan+murah → dibutuhkan+mahal → opsional+murah → opsional+mahal) tanpa
ambang "murah" yang dikarang. Esensial = yang tanpanya bisnis tidak bisa
beroperasi, bukan yang membuat angka headline terkecil.

## D-18 — Arden dijual sebagai katalog; fitur berlangganan pihak ketiga dihindari

Arden dipetakan ke `company_profile`, bukan `custom_web_app`, dan dijual sebagai
situs katalog rumah lelang. Bidding dan pembayaran tidak terjadi di website.
Fitur dengan `external_dependency: true` tidak dipakai di scope konsep mana pun
kecuali `payment`, yang juga ditandai `crucial`.

**Mengapa.** Pemilik memutuskan tidak mengimplementasikan lelang atau pembayaran
untuk Arden, jadi yang tersisa adalah katalog dan lead — dan `custom_web_app`
bertier `review` yang akan memaksa `discuss` selamanya. Studio ini satu orang dan
menjual sekali beli putus, sehingga integrasi berlangganan adalah kewajiban yang
terus berjalan setelah proyek selesai.

**Konsekuensi.** `blocking_domains.auction` dipersempit ke mekanismenya
(`bidding online`, `live bidding`, `proxy bid`, …). Kata tunggal `lelang`,
`auction`, dan `bid` dibuang karena ikut memblokir situs katalog yang justru
sah dijual. Gate tetap menolak mesin penawaran sungguhan — diuji. Konsekuensi
lain: link "Layanan serupa" Arden di landing sekarang menunjuk company profile,
dan `shipping_calculator` keluar dari Lembar sehingga ongkir memakai tarif
flat/zona — ditulis sebagai catatan di halamannya, bukan didiamkan.

## D-19 — Pasar harga dideteksi, bukan ditanyakan

Pertanyaan "Di mana bisnis Anda?" dihapus dari step 1. Pasar ditentukan
`marketFromClient()` dari timezone dan `navigator.languages`, lalu tampil sebagai
pemilih mata uang kecil yang bisa dikoreksi di panel harga.

**Mengapa.** Lokasi adalah hal yang sistem bisa simpulkan, jadi menanyakannya
membebani klien tanpa menambah akurasi. Ini juga membuat pasar JP akhirnya
terjangkau: `regionFor()` tidak pernah bisa menghasilkan JP karena tidak ada
locale `ja`.

**Konsekuensi.** Deteksi dijalankan di `useEffect`, bukan di initial state.
**Preact `hydrate()` tidak men-diff atribut pada DOM yang sudah ada**, jadi render
klien pertama yang berbeda dari server meninggalkan `aria-checked` versi server —
pemilih mata uang pernah menunjuk USD sementara harganya sudah yen. Mulai dari
nilai server lalu memperbaruinya memakan satu paint tambahan bagi pengunjung yang
pasarnya berbeda dari locale-nya, dan itu harga yang pantas. Pilihan eksplisit
disimpan di `localStorage['skyland-market']` dan menang atas deteksi. Tidak ada
geo-IP: halaman ini `output: 'static'`, jadi itu menuntut edge middleware atau
round-trip tambahan.


## Menambahkan keputusan baru

Gunakan ID berikutnya dengan: tanggal, status (usulan/diterapkan/diganti),
masalah pemicu, pilihan, alasan, alternatif penting, konsekuensi, serta file
dan validasi terkait. Jangan menulis usulan sebagai keputusan yang sudah
diimplementasikan. Bila keputusan lama diganti, hubungkan ke keputusan pengganti.
