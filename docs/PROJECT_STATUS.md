# Snapshot proyek dan temuan

Tanggal audit: **4 Oktober 2026**, konteks pengguna Asia/Tokyo.
Basis Git saat audit: `5293f34` (`Expand feature catalog and sharpen the AI
website plan`) **ditambah perubahan working tree yang sudah ada**. Dokumentasi
merepresentasikan kode lokal tersebut, bukan hanya isi commit dasar.

Dokumen ini adalah baseline untuk agent berikutnya. Temuan di bawah tidak
otomatis menjadi backlog yang disetujui pemilik dan belum diperbaiki dalam
tugas penyusunan dokumentasi ini.

## Pembaruan 10 Oktober 2026 — rekalibrasi harga

Riset harga lima dokumen selesai dan **fase 0–4-nya diimplementasikan**.
Lihat [peta riset](README.md#riset-harga-oktober-2026) dan D-11…D-15 di
[DECISIONS.md](DECISIONS.md). Ringkasan perubahan:

| Area | Sebelum | Sesudah |
| --- | --- | --- |
| Pasar harga | ID, GLOBAL | **ID, JP, GLOBAL**, masing-masing dengan tabel sendiri |
| Harga katalog | di-hand-tune, rasio ID/GLOBAL 6,6–8,9x | `est_hours x hourly_rate`, diuji sebagai invariant |
| Pengali desain | 1 / 1,2 / 1,4 pada seluruh subtotal | 0,9 / 1,0 / 1,15 pada bagian desain saja |
| `max_multiplier` | tidak diterapkan (hingga 2,268x) | diterapkan, batas 1,6 |
| Status quote | nominal + ada customRequests | **risiko domain lebih dulu**, lalu nominal |
| `MAX_PAGES` | memotong 24 halaman diam-diam | ditandai, memaksa `discuss` |
| Copywriting saat `content: none` | ditagih ganda | tidak ditagih |
| Diskon | founding + promo aditif hingga 40% | satu diskon, cap 10%, ID tanpa diskon |
| DP | 0% | 30% |
| `npm run test` | 53 lulus / **4 gagal** | **78 lulus / 0 gagal** |

Gap di bawah yang sudah tertutup oleh pembaruan ini ditandai pada entrinya.
Yang **belum** dikerjakan: snapshot/expiry quote bertanda tangan, estimator
work-package, discovery AI adaptif, dan eval AI. Tiga angka bisnis masih
memblokir perhitungan lantai biaya: biaya waktu per jam pemilik yang sebenarnya,
kapasitas jam riil per minggu, dan margin minimum yang diterima.

## Pembaruan 10 Oktober 2026 — pintu masuk harga lewat konsep

Halaman konsep berharga ditambahkan sebagai jalur kedua ke harga. Lihat
D-16…D-19 di [DECISIONS.md](DECISIONS.md).

| Area | Sebelum | Sesudah |
| --- | --- | --- |
| Layar sampai harga | 4 (konsultasi AI) | **2** lewat halaman konsep |
| Panggilan AI di jalur konsep | — | **0** (mockup ditulis tangan) |
| Scope konsep | tersebar di test, docs, dan i18n | satu sumber: `src/lib/samples/specs.ts` |
| Pertanyaan step 1 | 3 (lokasi, konten, kecepatan) | **2** — pasar dideteksi |
| Pasar JP | tidak terjangkau dari locale | otomatis dari timezone/bahasa |
| Arden | `custom_web_app`, selalu `discuss` | `company_profile`, katalog berharga |
| Fitur langganan pihak ketiga | tidak ditandai | `external_dependency`; keluar dari scope konsep kecuali `payment` |
| `npm run test` | 78 lulus | **86 lulus / 0 gagal** |

Diverifikasi di browser (Chrome lokal, 390px dan 1440px, EN dan ID): jalur konsep
sampai layar hasil **tanpa satu pun request `/api/*`**; harga berubah saat fitur
dicentang dan kembali persis saat dibatalkan; deteksi pasar konsisten antara
pemilih mata uang dan harga pada timezone Tokyo/Jakarta/New York/Berlin; audit
responsif 8 halaman konsep × 6 lebar bersih.

**Tidak** diverifikasi: tidak ada panggilan OpenAI sungguhan (kredensial ada di
`.env.local`, jadi `devMode()` tidak aktif dan memanggilnya akan menagih biaya),
tidak ada pengiriman SMTP/order, tidak ada eval kualitas AI. Langkah konsultan
diuji memakai fixture Plan/Mockup yang dihasilkan dari spec konsep, bukan dari model.

### Evaluasi setelah implementasi

Diukur, bukan diperkirakan.

**1. Keputusan yang wajib diambil user sebelum melihat harga**

| Jalur | Keputusan wajib | Layar sampai harga |
| --- | ---: | ---: |
| Halaman konsep | **0** — harga ada di layar pertama | **2** |
| Konsultasi AI | 1 (menulis brief) | 4 |

Pasar, mata uang, tema, tingkat desain, dan kesiapan konten semuanya sudah
ditentukan sistem atau punya default di jalur konsep. Step 1 konsultasi turun
dari 3 pertanyaan menjadi 2 setelah pertanyaan lokasi dihapus.

**2. Esensial bukan harga umpan**

| Konsep | Esensial (ID) | Scope penuh (ID) | Esensial = % dari penuh |
| --- | ---: | ---: | ---: |
| Tegak | Rp5,45 jt | Rp6,80 jt | 80% |
| Lembar | Rp10,10 jt | Rp13,20 jt | 77% |
| Kurohane | Rp11,25 jt | Rp12,80 jt | 88% |
| Arden | Rp7,45 jt | Rp10,85 jt | 69% |

Semua di atas 60%, dan test menjaganya. Artinya angka headline tidak melompat
jauh ketika klien mencentang sampai benar-benar bisa dipakai. Lembar tetap bisa
menerima pembayaran dan mengonfirmasi pesanan pada tier esensial; Kurohane tetap
bisa menerima booking dan mengirim pengingat.

**3. Kerapihan di layar kecil**

Daftar tambahan dilipat secara default: Arden turun dari 8 ke 7 layar gulir di
390px, Lembar dan Kurohane dari 7 ke 6. Baris yang terlihat pertama kali hanya
yang esensial (9–12), bukan 13–18. Total harga tetap terlihat saat menggulir
lewat bar bawah yang menempel. Audit responsif 8 halaman konsep × 6 lebar bersih.

**4. Pilihan yang masih bisa dipertimbangkan untuk dihapus**

`design_level` dan `timeline` masih ditanyakan di jalur konsultasi AI (di jalur
konsep keduanya sudah dipreset). Keduanya tidak bisa disimpulkan sistem, jadi
tidak bisa dihilangkan begitu saja — tetapi **`timeline` ditanyakan di step 1,
sebelum klien tahu scope maupun harganya**, dan itu urutan yang terbalik.
Memindahkannya ke layar hasil, di sebelah angka yang akan berubah karenanya,
akan lebih masuk akal. Belum dikerjakan karena di luar lingkup yang diminta.

**5. Temuan sampingan yang ikut diperbaiki**

- Pemilih mata uang pernah menunjuk USD sementara harganya sudah yen: Preact
  `hydrate()` tidak men-diff atribut, jadi `aria-checked` versi server bertahan.
- `.cs-actions .fine { flex: 1 1 260px }` menjadi basis **tinggi** 260px ketika
  `.col` membalik sumbu, meninggalkan ruang kosong besar di panel harga.
- Nama fitur panjang terpotong di 320px pada step rencana konsultan — bug lama
  yang baru terlihat setelah ada fixture untuk mengaudit step tersebut.

## Yang sudah tersedia

- Website bilingual EN/ID: home, konsultasi, privacy/terms, 8 layanan per bahasa.
- SEO canonical/hreflang/OG/JSON-LD/sitemap/robots.
- Konsultasi create → edit/revise → tema → mockup/harga → order → reference.
- 8 paket, 55 fitur, 10 kategori, 36 page types.
- Page/section distinction, visibility berdasarkan fitur, area member/admin,
  unit page/item, package inclusion, harga deterministik, fixed/range/discuss.
- Founding offer, kode promo server, cap aditif, minimum regional.
- SMTP pemilik/klien dengan lampiran HTML/JSON, draft localStorage, dev fixtures.
- Portfolio yang ditampilkan dan empat demo konsep terpisah.
- Tooling test/check/build, responsive capture, dan walkthrough browser.

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Node/npm lokal | Node 22.12.0, npm 10.9.0 |
| `npm run test` | Saat audit: 2 file, 53 lulus / 4 gagal. **Setelah rekalibrasi 10 Okt 2026: 78 lulus / 0 gagal**; keempat kegagalan mengunci anchor harga lama dan ditulis ulang |
| `npm run check` | **0 error, 0 warning, 5 hints**, 84 file. Diulang 10 Okt 2026: tetap 0 error |
| `npm run build` | Berhasil; 24 halaman utama + robots, assets, sitemap, fungsi Vercel. Diulang 10 Okt 2026: tetap berhasil |
| E2E EN 1.440px | Sampai done/reference, invalid contact dan lookup promo berjalan |
| E2E ID 375px | Sampai done/reference, invalid contact dan lookup promo berjalan |
| Responsive 320–1.440px | `/`, `/id/`, `/samples/arden/`, `/samples/kurohane/` × 6 width: bersih |
| Responsive demo lama | `/samples/tegak/`, `/samples/lembar/` × 6 width: **11 view bermasalah** (lihat G-17) |

Route responsive: `/`, `/id/`, `/consult/`, `/id/konsultasi/`, dan halaman company
profile EN/ID. Ini bukan audit visual/accessibility menyeluruh seluruh layanan.
Lima hint berasal dari unused NS di sample Lembar dan `window.React` pada empat
salinan `support.js` demo (satu per konsep). Pemeriksa merendernya sebagai
diagnostic hint; ringkasan akhir check tidak menghitungnya sebagai warning/error.
Jumlah ini bertambah satu untuk setiap konsep baru yang membawa `support.js`.

E2E dijalankan memakai salinan sementara source tanpa `.env*` dan tanpa
kredensial AI/SMTP/Turnstile, dengan promo fixture `KENALANCEO=20`. Tidak ada
panggilan AI berbayar atau pengiriman email sungguhan. Chrome lokal 149 dipakai.
Salinan menggunakan node_modules yang sama; Vite fs allow pada salinan disesuaikan
agar font/dev toolbar dapat diakses melalui symlink. Ini penyesuaian harness
sementara, bukan perubahan konfigurasi aplikasi.

Screenshot E2E disimpan di `.shots/` yang diabaikan Git. E2E saat ini merupakan
walkthrough berbasis selector/log, bukan suite assertion integrasi penuh.

## Perubahan lokal sebelum dokumentasi

Saat audit dimulai sudah ada modifikasi pada README.md, data/pricing.json,
Consultant.tsx, PlanStep.tsx, consult.css, i18n/catalog.ts, i18n/consult.ts,
demo.ts, dev-fixtures.ts, mail.ts, openai.ts, pricing.ts, schemas.ts, dan
tests/pricing.test.ts. Jangan memakai snapshot ini sebagai alasan membuang
perubahan lokal pada sesi lain; periksa `git status` saat itu.

Tugas dokumentasi menambah AGENTS.md, CLAUDE.md, docs/*, dan navigasi docs pada
README. Tidak ada perubahan perilaku aplikasi sebagai bagian audit ini.

## Gap yang dibuktikan dari implementasi

### G-01 — Metadata katalog legacy tidak sama dengan runtime

**Bukti:** `pricing.json.rules.always` meminta harga selalu RANGE;
`meta.note`/pricing_basis menyebut LLM menghitung; region_detection berisi
heuristik; calculation step 6 meminta confidence dari reference cases;
output_schema mempunyai field/harga contoh lama. `pricing.ts`/`schemas.ts`/
`openai.ts` tidak memakai kontrak itu. Runtime mengenal fixed/range/discuss,
region dari UI, dan AI tidak menerima harga. Metadata positioning juga berkata
belum ada portfolio riil sementara copy menampilkan karya.

**Dampak:** agent yang hanya membaca JSON bisa mengimplementasikan perilaku
salah.

**Sebagian besar ditutup 10 Okt 2026.** `rules`, `output_schema`,
`region_detection`, dan `reference_cases` dihapus dari `data/pricing.json`;
`calculation.steps` ditulis ulang mengikuti runtime; `pricing_basis` kini
benar-benar menjadi sumber harga dan diuji. **Yang masih berlaku:**
`meta.positioning` tetap menyebut belum ada portfolio riil sementara copy
menampilkan karya konsep — itu keputusan marketing, bukan ketidaksesuaian kode.

### G-02 — Mockup cache tidak mencakup semua perubahan konten

**Bukti:** `Consultant.tsx.planKey` hanya serviceId, nama halaman, ID fitur,
theme. Description, purpose/sections, quantity, flow, summary tidak termasuk.
**Dampak:** preview dapat dipakai ulang setelah perubahan yang relevan untuk
copy homepage. **Arah:** tentukan input minimum yang harus menginvalidasi cache
dan tambahkan regression verification ketika masalah ini dikerjakan.

### G-03 — Satu revisi AI adalah pembatas UI

**Bukti:** `revisionUsed` di State/PlanStep; `/api/plan` revise tidak memeriksa
kuota per konsultasi. **Dampak:** kebijakan jumlah revisi tidak dijamin backend.
Rate limit memory yang ada tidak ekuivalen dengan satu revisi per sesi.

### G-04 — Edit fitur manual belum menjaga kelengkapan screen/flow

**Bukti:** PlanStep toggle/answer/dropdown mengubah feature arrays; tidak
menambahkan page type untuk fitur baru. applyPatch tidak menyusun ulang flows,
questions/summary; schema covers tidak diperiksa terhadap flow nyata.
**Dampak:** Plan dapat shape-valid tetapi tidak lengkap sebagai scope pembangunan.
Dev fixture bahkan mempunyai flow pemilik kelola menu sementara cms_admin
masih suggestion, sehingga screen terkait awalnya tersembunyi.

### G-05 — Toggle inclusion paket memberi sinyal yang dapat membingungkan

**Bukti:** UI memperbolehkan memindah feature included ke suggestions;
activeFeatureIds selalu menambahkan service.includes. **Dampak:** toggle off
tidak menghapus capability/halaman inclusion atau mengurangi harga paket.
Pertimbangkan membedakan capability paket dari add-on yang dapat dimatikan.

### G-06 — Batas halaman UI vs parsing server dapat berbeda

**Bukti:** PlanStep.addPage tidak menerapkan MAX_PAGES; PlanSchema memotong
array ke 24 saat API menerima. **Dampak:** draft browser dengan >24 halaman
dapat dihitung berbeda dari Plan yang diterima server.

**Sebagian ditutup 10 Okt 2026.** Pemotongan tidak lagi senyap: `PlanSchema`
menandai `scopeTruncated` dan `quote()` memaksa status `discuss`, sehingga scope
yang hilang tidak pernah mendapat harga. **Yang masih berlaku:** `PlanStep.addPage`
tetap tidak membatasi di UI, jadi klien bisa menambah halaman sampai melewati 24
dan baru melihat akibatnya pada hasil quote.

### G-07 — Pemulihan localStorage belum memvalidasi seluruh State

**Bukti:** load() memparse Plan saja dan menyebarkan field State lain; storage
satu key lintas EN/ID, tanpa TTL. Restore done hanya mengubah step ke describe.
**Dampak:** choices/mockup/step lama yang tidak valid dapat memicu error; konten
bahasa lama atau kontak masih dapat terbawa. Form consent juga dipersist.

### G-08 — Server menghitung ulang tetapi tidak menyimpan quote yang disepakati

**Bukti:** order menerima Plan/Choices/Mockup client dan menghitung dengan
katalog/env sekarang; tidak ada record/signed payload konsultasi sebelumnya.
**Dampak:** harga baru, promo berubah, atau slot offer habis dapat berbeda
dari draft lama. Kebijakan 14 hari belum menjadi lock/expiry teknis.
Hitung ulang mencegah total browser arbitrer, bukan menjamin scope berasal AI.

### G-09 — Reference HMAC memakai fallback secret di production

**Bukti:** quote-id.ts memakai `env('QUOTE_SECRET') || 'dev-secret'` tanpa guard
DEV. **Dampak:** production missing secret tetap menghasilkan ID dengan nilai
default. ID juga hanya 8 hex tanpa timestamp/storage; jangan pakai sebagai
otorisasi, bukti expiry, atau unique order ID mutlak.

### G-10 — Delivery order synchronous, tanpa idempotency/retry

**Bukti:** SMTP dipanggil langsung; email owner dahulu, konfirmasi klien catch
dan log. **Dampak:** SMTP lambat/gagal menghambat API; request retry dapat
mengirim duplikat; success tidak menjamin konfirmasi klien diterima. Inbox
adalah satu-satunya penyimpanan order di aplikasi ini.

### G-11 — Guard bersifat terbatas per instance

**Bukti:** Map memory satu jam; Origin hanya diperiksa saat kedua header ada;
Turnstile hanya create; mockup tidak memakai honeypot/Turnstile.
**Dampak:** bukan kontrol terdistribusi atau autentikasi. Tidak ada enforcement
per sesi atas step sebelumnya. Body dibaca penuh sebelum panjang diperiksa.

### G-12 — Error/parameter AI belum ditangani untuk seluruh variasi provider

**Bukti:** effort dipilih lewat prefix regex, timeout 55s, parse langsung
choices[0]/JSON, tanpa retry atau mapping timeout khusus. **Dampak:** pergantian
model/format upstream dapat gagal; abort/parse dapat menjadi generic 500.
Fixture tidak menangkap masalah ini.

### G-13 — Janji pembayaran tidak seluruhnya mengikuti payment_terms

**Bukti:** LegalPage, mail, dan result membaca payment_terms; hero checks,
why.promises, dan FAQ no-deposit berada dalam copy tetap EN/ID.
**Dampak:** mengubah down_payment_percent dari 0 memerlukan perubahan copy
tambahan. Nilai data saja tidak membuat seluruh marketing mengikuti DP baru.

**Ditutup 10 Okt 2026** dengan perubahan DP menjadi 30%: hero checks,
`why.promises`, dan FAQ pembayaran EN/ID sudah ditulis ulang. Catatan: copy itu
masih **tetap**, bukan diturunkan dari `payment_terms`, jadi mengubah DP lagi
tetap memerlukan penyuntingan copy. `paymentNoDeposit` dipertahankan sebagai
fallback bila DP dikembalikan ke 0.

### G-14 — Fallback domain dan catatan lokasi lama

**Bukti:** astro.config punya fallback domain Vercel, SITE.url tidak;
README checklist lama masih menyebut area Bandung, sementara SITE/legal/copy
menyebut Kanagawa. **Dampak:** konfigurasi PUBLIC_SITE_URL yang tidak eksplisit
atau mengikuti checklist lama dapat membuat metadata/konteks bisnis salah.

### G-15 — Preview dan demo memiliki dependency eksternal sendiri

**Bukti:** renderMockup memuat Google Fonts; sample support memuat React CDN
dan new Function; Tegak memuat gambar eksternal dari images.unsplash.com.
Arden dan Kurohane menyimpan fotonya sendiri di `public/samples/<key>/img/`
sehingga dependency eksternalnya tinggal Google Fonts dan React CDN.
**Dampak:** artifact konsep tidak sepenuhnya offline; strategi CSP/hosting
offline harus memperhitungkan runtime sample terpisah dari Astro/Preact.

### G-17 — Demo Tegak dan Lembar belum lolos audit responsif

**Bukti:** `scripts/audit-responsive.mjs` kini ikut menjalankan keempat demo
konsep. Arden dan Kurohane bersih di 320/375/414/768/1.024/1.440px; Tegak dan
Lembar menghasilkan 11 view bermasalah — overflow horizontal di Lembar pada 320px
(+12px) dan 1.024px (+97px), elemen keluar layar dan teks terpotong di Tegak pada
1.024/1.440px, serta sejumlah target sentuh di bawah 32px pada keduanya.
**Dampak:** temuan ini sudah ada sebelum penambahan Arden/Kurohane dan hanya
menjadi terlihat karena cakupan audit diperluas. Perbaikannya belum dikerjakan.

### G-16 — Cakupan test dan observability belum penuh

**Bukti:** satu file unit test domain; E2E log error/overflow tanpa assertion
lengkap; tidak ada API/patch/renderer/mail test atau analytics funnel utama.
**Dampak:** 52 test lulus membuktikan invariants yang diuji, bukan semua alur
production atau kualitas AI. Tambahkan test bernilai ketika fitur/bug relevan
dikerjakan, bukan sekadar menaikkan jumlah test.

## Hal yang belum diketahui

- Domain/deployment production aktif, env platform, inbox delivery nyata.
- Konfigurasi spend limit, firewall, volume traffic, dan biaya AI aktual.
- Kualitas model pada brief beragam, terutama online store/LMS/web app kompleks.
- Detail bukti proyek/testimoni serta kebijakan scope custom terbaru pemilik.
- Prioritas roadmap, target omzet/conversion, rencana CRM/portal/persistensi.

Tidak ada klaim bahwa hal tersebut gagal atau belum dikerjakan di luar
repository. Agent perlu meminta konteks hanya ketika tugasnya bergantung
informasi itu, sambil tetap melanjutkan bagian yang sudah jelas.

## Urutan tindak lanjut yang masuk akal jika diminta

1. Selaraskan kontrak/konsistensi yang mudah menyebabkan scope/harga berbeda:
   metadata legacy, cache, batas halaman, feature-screen flow, dan copy pembayaran.
2. Sesuaikan kebutuhan operasional nyata: secret validation, order idempotency,
   quote validity, observability, abuse control.
3. Baru evaluasi persistensi, dashboard, atau metrics funnel bila kebutuhan
   produk/volume lead memang memerlukannya.

Ini usulan berdasarkan temuan kode, bukan keputusan roadmap atau perubahan
stack yang telah disetujui.
