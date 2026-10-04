# Snapshot proyek dan temuan

Tanggal audit: **4 Oktober 2026**, konteks pengguna Asia/Tokyo.
Basis Git saat audit: `5293f34` (`Expand feature catalog and sharpen the AI
website plan`) **ditambah perubahan working tree yang sudah ada**. Dokumentasi
merepresentasikan kode lokal tersebut, bukan hanya isi commit dasar.

Dokumen ini adalah baseline untuk agent berikutnya. Temuan di bawah tidak
otomatis menjadi backlog yang disetujui pemilik dan belum diperbaiki dalam
tugas penyusunan dokumentasi ini.

## Yang sudah tersedia

- Website bilingual EN/ID: home, konsultasi, privacy/terms, 8 layanan per bahasa.
- SEO canonical/hreflang/OG/JSON-LD/sitemap/robots.
- Konsultasi create → edit/revise → tema → mockup/harga → order → reference.
- 8 paket, 55 fitur, 10 kategori, 36 page types.
- Page/section distinction, visibility berdasarkan fitur, area member/admin,
  unit page/item, package inclusion, harga deterministik, fixed/range/discuss.
- Founding offer, kode promo server, cap aditif, minimum regional.
- SMTP pemilik/klien dengan lampiran HTML/JSON, draft localStorage, dev fixtures.
- Portfolio yang ditampilkan dan dua demo konsep terpisah.
- Tooling test/check/build, responsive capture, dan walkthrough browser.

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Node/npm lokal | Node 22.12.0, npm 10.9.0 |
| `npm run test` | 1 file, **52 test lulus** |
| `npm run check` | **0 error, 0 warning, 3 hints**, 76 file |
| `npm run build` | Berhasil; 24 halaman utama + robots, assets, sitemap, fungsi Vercel |
| E2E EN 1.440px | Sampai done/reference, invalid contact dan lookup promo berjalan |
| E2E ID 375px | Sampai done/reference, invalid contact dan lookup promo berjalan |
| Responsive 375/768/1.440px | 6 route × 3 width: tidak ada horizontal overflow |

Route responsive: `/`, `/id/`, `/consult/`, `/id/konsultasi/`, dan halaman company
profile EN/ID. Ini bukan audit visual/accessibility menyeluruh seluruh layanan.
Tiga hint berasal dari unused NS di sample Lembar dan window.React di kedua
support.js demo. Pemeriksa merendernya sebagai diagnostic hint; ringkasan
akhir check tidak menghitungnya sebagai warning/error.

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
salah. **Tindak lanjut yang dapat dipilih:** bersihkan/tandai metadata legacy
tanpa mengubah kontrak runtime; dokumentasi baru sudah menjelaskan perbedaannya.

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
dapat dihitung berbeda dari Plan yang diterima server. Pembatas/normalisasi
perlu konsisten bila masalah ini diperbaiki.

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

### G-14 — Fallback domain dan catatan lokasi lama

**Bukti:** astro.config punya fallback domain Vercel, SITE.url tidak;
README checklist lama masih menyebut area Bandung, sementara SITE/legal/copy
menyebut Kanagawa. **Dampak:** konfigurasi PUBLIC_SITE_URL yang tidak eksplisit
atau mengikuti checklist lama dapat membuat metadata/konteks bisnis salah.

### G-15 — Preview dan demo memiliki dependency eksternal sendiri

**Bukti:** renderMockup memuat Google Fonts; sample support memuat React CDN
dan new Function; Tegak memuat gambar eksternal. **Dampak:** artifact konsep
tidak sepenuhnya offline; strategi CSP/hosting offline harus memperhitungkan
runtime sample terpisah dari Astro/Preact.

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
