# Panduan pengembangan

## Setup lokal

Gunakan Node >=22.12.0 (`.tool-versions` menetapkan 22.12.0) dan npm.
Repository memakai ESM, TypeScript strict, JSX `react-jsx` dengan source Preact.

```bash
npm ci
cp .env.example .env
npm run dev
```

`npm ci` memakai lockfile pada checkout bersih. Bila dependencies sudah terpasang
dan tidak berubah, tidak perlu reinstall. `.env.example` berisi placeholder
key/password; **kosongkan** OPENAI_API_KEY dan GMAIL_APP_PASSWORD bila ingin
fixture gratis tanpa email. Cek keberadaan `.env.local` dan environment shell
tanpa menampilkan secret; nilai dari sana dapat tetap mengaktifkan layanan nyata.

Dev default `http://localhost:4321`. Tanpa OpenAI key di dev, Plan/Mockup memakai
fixture. Tanpa Gmail password di dev, order sukses hanya mencatat log dan tidak
mengirim email. `QUOTE_SECRET` dapat diisi string lokal untuk reference stabil.
Optional Turnstile sebaiknya tidak diaktifkan pada fixture lokal.

## Commands dan apa yang dibuktikan

| Command | Tujuan | Batas |
| --- | --- | --- |
| `npm run dev` | Astro dev + dynamic API | Bisa memakai integrasi nyata jika env terisi |
| `npm run test` | Vitest engine harga, katalog, promo | Bukan API/AI/SMTP/browser integration test |
| `npm run check` | Astro/TS diagnostics | Tidak menjamin rekomendasi AI tepat |
| `npm run build` | Prerender + bundle fungsi Vercel | Tidak mengirim request AI/email atau deploy |
| `npm run preview` | Command Astro preview yang tercantum di package | Jangan anggap emulator Vercel API; dukungan adapter perlu dicek |
| `node scripts/e2e-consult.mjs <base> <en\|id> <width>` | Walkthrough sampai order + screenshots | Memerlukan fixture dan promo khusus; lihat bawah |
| `node scripts/shots.mjs <base> <paths...>` | Responsive screenshot/overflow | Exit nonzero saat horizontal overflow |

Build menulis `dist/` serta `.vercel/output/`. CLI Vercel bukan dependency npm
proyek ini. Validasi deployment/functions dilakukan di environment Vercel yang
sebenarnya atau emulator yang dikonfigurasi terpisah.

## Browser verification

Script memakai playwright-core dan Chrome lokal di `/usr/bin/google-chrome`.
Set `CHROME_PATH` bila executable berbeda. Tidak ada browser Playwright bundled
atau download otomatis melalui package ini.

Untuk fixture E2E: kosongkan key AI/password SMTP dan Turnstile, lalu set env
promo server `PROMO_CODES=KENALANCEO=20` agar lookup yang diharapkan script tersedia.
Nilai ini adalah fixture publik dari script, bukan kode promo production yang
harus dipertahankan.

```bash
node scripts/e2e-consult.mjs http://localhost:4321 en 1440
node scripts/e2e-consult.mjs http://localhost:4321 id 375
node scripts/shots.mjs http://localhost:4321 / /id/ /consult/ /id/konsultasi/
```

E2E memilih kesiapan konten, fitur/suggestion, menjawab pertanyaan, revisi,
tema/desain, mockup, kode salah/kode valid, invalid contact form, lalu **POST
order** dengan `client@example.com`. Jalankan terhadap instance fixture lokal.
Jika local env sungguhan diperlukan untuk development, gunakan checkout/salinan
terisolasi tanpa `.env*` untuk walkthrough otomatis.

Script E2E memakai waitForSelector/click flow dan log screenshot, bukan suite
assertion bisnis lengkap. Page error/console error dicatat tetapi tidak otomatis
membuat exit gagal; overflow juga hanya dicatat oleh script E2E. Script shots
memiliki exit flag overflow. Hasil yang lulus tidak membuktikan delivery SMTP
atau AI semantik benar.

Pengaturan shots: `WIDTHS` default `375,768,1440`, `OUT` default `.shots`,
`NO_SHOTS=1` hanya cek overflow, `VIEWPORT_ONLY=1` capture viewport. Bila browser
menjalankan redirect bahasa, pakai `skyland-lang`/locale yang sesuai untuk
memastikan halaman EN yang ingin diperiksa benar-benar EN.

## Recipe perubahan

### Harga, multiplier, dan diskon

1. Edit angka eksplisit di JSON atau public override env yang relevan.
2. Bila hourly rate berubah, hitung ulang base/feature/extra_page; engine tidak
   menerapkan rate baru secara otomatis.
3. Selaraskan reference cases dan anchor Tegak jika pemilik memang mengubah
   kebijakan harga. Jangan mengganti expected hanya untuk menyembunyikan bug.
4. Jalankan unit test; periksa fixed/range/discuss, unit halaman/item,
   inclusion, pembulatan, minimum, stack diskon, dan estimasi hari kerja.
5. Periksa live UI, marketing demo, rincian result, dan email pada konfigurasi
   yang sama. PUBLIC env memerlukan build/deploy baru.

Jangan menaruh kode promo di JSON, menambahkan rumus harga terpisah dalam UI,
atau mengirim harga ke prompt AI.

### Fitur katalog baru

1. Tambahkan ID unik, kategori yang ada, label, est_hours, price ID/GLOBAL,
   dan unit bila diperlukan di `features` JSON.
2. Tambahkan `FEATURE_COPY` EN/ID berisi nama dan manfaat plain; per-item juga
   memerlukan label unit. Deskripsi plain EN ikut membentuk katalog AI.
3. Bila kategori baru, tambahkan `feature_categories` dan `CATEGORY_COPY`.
4. Tentukan inclusion paket dan page type terkait. Cek bahwa toggle manual
   belum otomatis membuat screen; perubahan itu perlu implementasi sendiri
   jika diinginkan.
5. ID enum schema dan grouped dropdown berasal dari JSON, bukan hardcoded
   daftar tambahan. Jalankan test katalog/harga, check, build, dan UI relevan.

### Jenis halaman baru

Tambahkan `page_types` dengan id/area/sections dan feature bila feature-backed;
tambahkan `PAGE_COPY` EN/ID. Prompt otomatis memasukkan jenis baru. Pastikan
feature ada dalam katalog dan aturan contentPages/visiblePages tidak berubah
tanpa sengaja. Gunakan PlanSchema untuk menguji area/feature hasil transform.

### Layanan atau route baru

Layanan membutuhkan lebih banyak wiring daripada fitur: JSON services,
SERVICE_COPY, SERVICE_KEYS/SLUGS, SERVICE_PRICING_ID, `services_list` kedua
bahasa, ilustrasi/visual layanan, serta helper SEO. StaticPaths/sitemap mengikuti
service keys. Cari seluruh penggunaan key sebelum menambah/menghapus ID:

```bash
rg 'SERVICE_KEYS|SERVICE_SLUGS|SERVICE_PRICING_ID|services_list' src tests
```

### UI konsultan dan storage

State utama ada di Consultant.tsx; PlanStep/OrderStep menerima props/callback.
Gunakan hook Preact dari `preact/hooks`; jangan impor React hook.

Jika kontrak berubah, periksa request Zod, output model, callback edit manual,
restoration storage lama, mockup cache, server order, dan email. Bila mengganti
storage key, tentukan apakah data lama dimigrasi atau direset; jangan menyatakan
migrasi ada tanpa kode. Uji back navigation, refresh, pilihan bahasa/region,
busy/error recovery, revisi, dan mockup yang sebelumnya dicache.

### Prompt/model AI

Edit schema JSON provider dan parsing Zod bersama-sama bila shape berubah.
Pertahankan separation kebutuhan vs harga, brief untrusted, bahasa output,
dan katalog ID. Fixture tidak menguji prompt; perubahan kualitas AI memerlukan
brief uji beragam dan integrasi nyata saat memang menjadi scope tugas.
Catat model/env, kasus yang dicoba, status HTTP, dan penggunaan token tanpa secret.

### Konten, SEO, dan janji bisnis

- `en.ts` mendefinisikan Dict; `id.ts` mengikuti tipenya. `consult.ts` memiliki
  struktur strings EN/ID konsultan; `catalog.ts` untuk nama/manfaat katalog.
- Beberapa copy berada langsung di ConsultPage/LegalPage, bukan dictionary.
- Ganti URL melalui routes.ts dan halaman wrapper; cek canonical, hreflang,
  sitemap, links footer/header, redirect bahasa.
- Jangan mengubah pembayaran/support/ownership hanya pada satu copy. Cari
  landing, FAQ, legal, result, dan mail.
- Jangan mengubah label konsep menjadi karya klien tanpa bukti dari pemilik.

### Portfolio dan aset

Project nyata: perlu memperluas union ProjectCopy.key di en.ts, entries kedua
bahasa, URL capture script, import/map Work.astro, dan screenshot desktop/mobile.
Konsep: ConceptCopy.key, entries kedua bahasa, demo public, map Concepts.astro,
capture script, dan screenshot tinggi.

| Script | Input | Output/dampak |
| --- | --- | --- |
| `make-assets.mjs` | favicon.svg, src/assets/founder.jpg, copy di script | Menimpa OG EN/ID, apple icon, logo.png, public/founder.jpg |
| `make-hero.mjs` | Template/copy EN/ID di script | Menimpa src/assets/hero-site-en.png dan hero-site-id.png |
| `capture-portfolio.mjs [key...]` | URL project/demo, Chrome, BASE_URL | Menimpa src/assets/work/*.png |
| `split-shot.py file.png height` | Screenshot panjang, Python + Pillow | Potongan file -pN.png |

Capture portfolio tanpa key juga membuka proyek eksternal. Script memerlukan
site konsep lokal untuk Tegak/Lembar, default BASE_URL localhost:4321. Hindari
regenerasi massal saat tugas hanya copy teks; aset hasil capture dapat berbeda
karena sumber eksternal atau browser.

## Konvensi UI dan style

Gunakan token global (`--blue`, `--ink`, `--line`, font, gutter), scoped Astro
CSS untuk bagian marketing, dan consult.css untuk komponen konsultan. Tidak ada
formatter/linter script tersendiri; ikuti format sekitar (single quote, semicolon,
komponen kecil, type eksplisit pada boundary).

Pertahankan label form, aria state, keyboard focus, reduced motion, alt gambar,
dan layout pada 375/768/1440. Harga panjang/range IDR memerlukan perhatian pada
sticky actions mobile. Preview iframe diskalakan, bukan sekadar disempitkan.

Main site mengoptimasi aset lewat `astro:assets`; aset public digunakan ketika
URL stabil diperlukan. SVG/kode ilustrasi tetap lebih mudah dipelihara melalui
kode daripada menggantinya dengan bitmap tanpa alasan produk.

## Menutup sesi

Update dokumen yang perilakunya berubah. Laporkan file, alasan, hasil test,
dan batas yang belum diverifikasi. Untuk task berlanjut gunakan
[template handoff](HANDOFF_TEMPLATE.md), sebutkan dirty tree milik pengguna,
dan next step yang spesifik. Commit/deploy sesuai scope instruksi pemilik;
menyusun dokumentasi tidak berarti semua gap harus ikut diperbaiki.
