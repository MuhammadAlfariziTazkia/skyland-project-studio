# Skyland Project Studio

Landing page + **konsultan AI dengan harga pasti** untuk jasa pembuatan website.
Bilingual (EN di `/`, ID di `/id/`), USD untuk EN dan IDR untuk ID, tanpa database, siap deploy ke Vercel.

**Stack:** Astro 5 (static, SEO-first) · Preact (hanya untuk konsultan) · OpenAI Chat Completions + Structured Outputs (via `fetch`, tanpa SDK) · Nodemailer + Gmail SMTP · Vercel serverless (hanya `/api/*`).

## Dokumentasi produk, teknis, dan AI agent

Mulai dari **[docs/README.md](docs/README.md)** untuk peta dokumentasi dan urutan
catch up. Panduan lintas agent ada di **[AGENTS.md](AGENTS.md)**; Claude Code
membacanya melalui **[CLAUDE.md](CLAUDE.md)**.

- [Produk dan konteks bisnis](docs/PRODUCT.md)
- [Arsitektur dan stack](docs/ARCHITECTURE.md)
- [Domain dan aturan harga](docs/DOMAIN_PRICING.md)
- [Kontrak API dan integrasi AI](docs/API_AI.md)
- [Panduan pengembangan](docs/DEVELOPMENT.md) dan [operasional](docs/OPERATIONS.md)
- [Keputusan arsitektur](docs/DECISIONS.md)
- [Status terverifikasi dan gap](docs/PROJECT_STATUS.md)
- [Template handoff antar chat/provider](docs/HANDOFF_TEMPLATE.md)

Dokumen tersebut menjelaskan implementasi working tree per 4 Oktober 2026,
termasuk batasan serta perbedaan antara metadata lama dan perilaku runtime.

## Alur konsultasi

1. User menceritakan kebutuhan website → `POST /api/plan` → AI menyusun jenis website, halaman (beserta isinya), dan fitur.
2. User meninjau: hapus/tambah halaman & fitur secara manual (gratis, tanpa AI) + **1× revisi AI**.
3. User memilih tema (Minimal / Elegan / Futuristik / Ceria).
4. `POST /api/mockup` → AI menulis konten homepage → dirender jadi mockup HTML responsif + **harga pasti**.
5. "Ya, buatkan website ini" → form kontak (nama, email, WhatsApp) → `POST /api/order` → email ke Anda (rincian lengkap + lampiran `mockup.html` & `consultation.json`) + email konfirmasi ke klien.

**Harga tidak pernah ditebak AI.** AI hanya memilih item dari `data/pricing.json`, lalu `src/lib/pricing.ts` menghitung totalnya secara deterministik. Server menghitung ulang saat order, jadi total dari browser tidak bisa dimanipulasi. Setiap penawaran punya ID (`SKY-XXXXXXXX`, HMAC dari `QUOTE_SECRET`).

## Menjalankan lokal

```bash
# Node >= 22.12 (lihat .tool-versions)
npm install
cp .env.example .env    # lalu isi nilainya
npm run dev             # http://localhost:4321
```

Kalau `OPENAI_API_KEY` / `GMAIL_APP_PASSWORD` kosong saat `npm run dev`, konsultan memakai data contoh dan email hanya dicatat di log, jadi seluruh alur tetap bisa dicoba. Di production, keduanya wajib diisi.

| Perintah | Fungsi |
| --- | --- |
| `npm run test` | Unit test mesin harga |
| `npm run check` | Type-check Astro/TS |
| `npm run build` | Build production (output Vercel) |
| `node scripts/shots.mjs http://localhost:4321 / /id/ /consult/` | Screenshot 375/768/1440px + cek horizontal overflow |
| `node scripts/audit-responsive.mjs http://localhost:4321` | Audit responsif semua halaman + tiap langkah konsultasi di 320–1440px: horizontal overflow, elemen keluar layar, target sentuh < 32px, teks terpotong. Tambahkan `--shots` untuk screenshot |
| `node scripts/e2e-consult.mjs http://localhost:4321 id 375` | Menjalankan seluruh alur konsultasi di browser |
| `node scripts/make-assets.mjs` | Membuat ulang gambar OG, apple-touch-icon, dan `public/founder.jpg` |
| `node scripts/make-hero.mjs` | Membuat ulang mockup company profile di laptop hero (EN + ID). Teks & desain ada di dalam script |
| `node scripts/capture-portfolio.mjs [key]` | Mengambil ulang screenshot desktop + HP proyek portofolio. Konsep (`public/samples/*`, mis. `tegak`) diambil dari `npm run dev` sebagai satu screenshot tinggi |

Script screenshot memakai Chrome lokal (`/usr/bin/google-chrome`); ganti lewat `CHROME_PATH` bila perlu.

## Environment variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✓ | API key OpenAI |
| `OPENAI_MODEL` | | Default `gpt-5-mini`. Model apa pun yang mendukung Structured Outputs (`json_schema`) |
| `OPENAI_REASONING_EFFORT` | | Untuk langkah **rencana** saja (default `low`; `minimal` ±40% lebih hemat tapi lebih sering salah pilih fitur). Revisi & mockup otomatis memakai `minimal` di model gpt-5. Diabaikan untuk model non-reasoning (gpt-4.x) |
| `GMAIL_USER` | ✓ | Alamat Gmail pengirim |
| `GMAIL_APP_PASSWORD` | ✓ | App Password Gmail (lihat di bawah) |
| `OWNER_EMAIL` | | Tujuan order baru (default: `GMAIL_USER`) |
| `QUOTE_SECRET` | ✓ | String acak, mis. `openssl rand -hex 24` |
| `PROMO_CODES` | | Kode promo, format `KODE=persen` dipisah koma, mis. `KENALANCEO=20`. Divalidasi di server saja |
| `PUBLIC_FOUNDING_PERCENT` | | Diskon klien pertama (default dari `pricing.json`). `0` mematikan promonya |
| `PUBLIC_FOUNDING_SPOTS` | | Jumlah slot klien pertama |
| `PUBLIC_FOUNDING_TAKEN` | | Slot yang sudah terpakai. Naikkan tiap satu klien deal |
| `PUBLIC_MAX_DISCOUNT_PERCENT` | | Batas atas total diskon (founding + kode promo) |
| `PUBLIC_SITE_URL` | ✓ | Domain final, mis. `https://skyland.id` (dipakai untuk canonical, sitemap, OG) |
| `PUBLIC_WHATSAPP_NUMBER` | ✓ | Format internasional tanpa `+`, mis. `6281234567890` |
| `PUBLIC_CONTACT_EMAIL` | | Email publik di footer & JSON-LD |
| `PUBLIC_GSC_VERIFICATION` | | Token verifikasi Google Search Console (metode HTML tag) |
| `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | | Opsional: Cloudflare Turnstile (gratis) untuk memblokir bot |

**Gmail App Password:** aktifkan 2-Step Verification di akun Google → Google Account → Security → *App passwords* → buat untuk "Mail" → salin 16 karakternya ke `GMAIL_APP_PASSWORD`.

## Mengubah harga dan konten

- **`data/pricing.json`** adalah knowledge base harga Anda. Angka dihitung oleh `src/lib/pricing.ts`; AI hanya memilih id.
  - `regions`: mata uang, pembulatan, harga minimum & maksimum per region (ID / GLOBAL).
  - `services`: 8 paket — `base` (harga dasar), `pages_included`, `workdays`, dan `includes` (fitur yang sudah termasuk paket, jadi gratis di paket itu).
  - `extra_page`: harga per halaman di atas jatah paket.
  - `feature_categories` + `features`: katalog 55 fitur dalam 10 kategori. Setiap fitur punya `id`, `category`, `label`, `est_hours`, `price` (ID & GLOBAL), dan opsional `unit`:
    - `"page"` → harga × jumlah halaman (mis. copywriting);
    - `"item"` → harga × kuantitas yang dipilih klien/AI, 1–10 (mis. bahasa tambahan, layanan yang diintegrasikan).
    Harga fitur mengikuti `est_hours × pricing_basis.hourly_rate` (dibulatkan); test memastikan selisihnya wajar.
  - `multipliers`: pengali desain, kesiapan konten, dan kecepatan yang dipilih klien.
  - `page_types`: katalog jenis halaman (±36). **Halaman** = 1 layar dengan URL & tujuan sendiri, berisi beberapa section. **Section** = blok konten di dalam halaman; konten pendek (cerita, lokasi, testimoni, FAQ singkat) digabung jadi section, bukan halaman. Setiap jenis punya `area` (public / member / admin), `sections` lazim (panduan AI & engineer), dan opsional `feature`:
    - tanpa `feature` → **halaman konten** (Beranda, Tentang, Layanan, Kontak…), dihitung ke `pages_included` / `extra_page`;
    - dengan `feature` → halaman yang **ikut fitur** (keranjang, detail produk, artikel, booking, layar admin/member), gratis karena sudah termasuk harga fitur, dan hanya muncul kalau fiturnya aktif.
    Halaman template (detail produk, artikel) dihitung 1. AI hanya memilih `type`; area & fitur diturunkan oleh kode. Menambah jenis halaman: tambah entri di `page_types` + label EN/ID di `PAGE_COPY` (`src/i18n/catalog.ts`).
  - `founding_offer`: diskon klien pertama. **Naikkan `spots_taken` setiap kali dapat klien** (atau env `PUBLIC_FOUNDING_TAKEN`). Kode promo ada di env `PROMO_CODES`, bukan di file ini.
  - **Menambah fitur:** tambahkan objek di `features` (id baru, kategori yang ada), lalu tambahkan nama & penjelasan EN/ID di `FEATURE_COPY` pada `src/i18n/catalog.ts` (untuk `unit: "item"` sertakan juga label `unit`, mis. "bahasa"). AI otomatis bisa memilihnya, dan dropdown di konsultan otomatis mengelompokkannya.
  - Setelah mengubah harga, jalankan `npm run test` (test memeriksa copy, kategori, `includes`, dan kewajaran harga).
- **Gaya mockup (12 tema):** `src/lib/mockup/themes.ts`. Setiap tema berisi warna, font (Google Fonts, hanya yang dipakai), dan karakter visual: gaya kartu (`soft`/`outline`/`hard`/`glass`/`flat`), bentuk hero, pola latar, `bento`, `rules`, dan `accentLock` (tema yang selalu memakai warnanya sendiri). Konsultan menampilkan 4 gaya yang disarankan AI untuk bisnis klien (field `styles` di rencana, dengan fallback per layanan di `SERVICE_STYLES`); sisanya ada di balik "Lihat semua gaya". Teks mockup tidak bergantung pada tema, jadi klien bisa mengganti gaya di langkah Mockup tanpa panggilan AI baru.
- **Teks website:** `src/i18n/en.ts` & `src/i18n/id.ts` (landing + halaman layanan), `src/i18n/consult.ts` (UI konsultan).
- **Logo:** mark ada di `src/components/Logo.astro` (header/footer), `public/favicon.svg` (ikon), dan `public/logo.svg` (logo lengkap untuk dipakai di luar website). Setelah mengubah logo, jalankan `node scripts/make-assets.mjs` agar favicon PNG, `logo.png`, dan gambar OG ikut diperbarui.
- **Kontak & sosial media:** `src/config/site.ts`. Link sosial yang kosong otomatis disembunyikan.
- **Portofolio** (`work.projects` di `en.ts`/`id.ts`): teks tantangan dan hasil disusun dari isi website masing-masing. Mohon dicek ulang agar sesuai dengan yang benar-benar Anda kerjakan. Menambah proyek baru:
  1. Tambahkan entri di `work.projects` pada **kedua** file bahasa (dan key-nya di tipe `ProjectCopy` di `en.ts`).
  2. Tambahkan URL-nya di `scripts/capture-portfolio.mjs`, lalu jalankan script tersebut.
  3. Import dua screenshot-nya dan tambahkan warna panelnya di map `visuals` pada `src/components/landing/Work.astro`.

## Deploy ke Vercel

1. Push ke GitHub → di Vercel pilih **Add New → Project** → import repo (framework Astro terdeteksi otomatis).
2. Isi semua environment variables di atas (Production), terutama `PUBLIC_SITE_URL` = domain final.
3. Deploy. Hubungkan domain sendiri di **Settings → Domains**, lalu redeploy agar sitemap/canonical memakai domain itu.
4. **Batasi biaya:** set *monthly budget* di dashboard OpenAI (Project → Limits), dan tambahkan aturan rate-limit di **Vercel → Firewall** untuk path `/api/*` (mis. 20 request/menit per IP). Rate limit bawaan kode hanya best-effort karena tanpa database.

Perkiraan biaya: hosting Vercel Hobby gratis, Gmail gratis. Satu konsultasi lengkap = 3 panggilan AI (rencana, revisi, mockup), dengan `gpt-5-mini` biasanya di bawah $0,01.

## SEO: yang sudah ada

- HTML statis untuk semua halaman (cepat, mudah di-crawl), 1 H1 per halaman, gambar AVIF/WebP responsif, font self-hosted.
- 8 halaman layanan per bahasa yang menarget keyword seperti "jasa pembuatan website company profile", "jasa pembuatan toko online", "jasa pembuatan aplikasi web", dll.
- `hreflang` EN/ID/x-default, canonical, Open Graph & Twitter card (gambar OG per bahasa), sitemap dengan alternate bahasa, `robots.txt`.
- JSON-LD: `ProfessionalService` + `OfferCatalog` (kisaran harga), `Person`, `WebSite`, `FAQPage`, `Service`, `BreadcrumbList`.

## Checklist setelah online

- [ ] Verifikasi domain di **Google Search Console** → submit `https://domain-anda/sitemap-index.xml`.
- [ ] Buat **Google Business Profile** (kategori "Website designer", area Bandung + layanan online). Ini sangat berpengaruh untuk pencarian lokal "jasa pembuatan website bandung".
- [ ] Isi link LinkedIn/GitHub/Instagram di `src/config/site.ts` (memperkuat `sameAs` di JSON-LD).
- [ ] Minta review Google dari klien pertama, lalu tambahkan portofolio baru.
- [ ] Dapatkan backlink awal: direktori bisnis, profil Sribulancer/Projects.co.id/Upwork, GitHub README, artikel di LinkedIn/Medium.
- [ ] Uji halaman di [Rich Results Test](https://search.google.com/test/rich-results) dan PageSpeed Insights.

## Harga, diskon, dan promo

Semua angka ada di `data/pricing.json`; `src/lib/pricing.ts` yang menghitung, AI tidak pernah menyentuh harga.

- **Patokan tabel harga.** Seluruh tabel diturunkan dari tarif per jam di `pricing_basis.hourly_rate` (Rp 55.000 / $20) dikali `est_hours` tiap item, lalu dibulatkan ke `round_to`. Untuk menaikkan harga nanti, ubah tarifnya lalu hitung ulang tabelnya. Patokan yang dipakai: proyek sekelas contoh **Tegak** (company profile, desain custom penuh, animasi, konten sebagian dibantu) = **Rp 5.000.000** harga normal, dan ada test yang menjaga angka ini (`tests/pricing.test.ts`).
- **`reference_cases` adalah test**, bukan sekadar catatan. Kalau mengubah harga, keempatnya ikut dihitung ulang atau `npm run test` gagal.

- **Diskon klien pertama.** `founding_offer.spots_total` slot dengan diskon `percent`. Bisa diatur tanpa menyentuh file, lewat `PUBLIC_FOUNDING_PERCENT`, `PUBLIC_FOUNDING_SPOTS`, dan `PUBLIC_FOUNDING_TAKEN` (angka di `pricing.json` jadi nilai default). Naikkan `PUBLIC_FOUNDING_TAKEN` setiap satu klien deal lalu deploy ulang; begitu sama dengan jumlah slot, diskon, badge hero, dan section Offer hilang sendiri. `PERCENT=0` atau `SPOTS=0` mematikannya.
- **Kode promo.** Hanya dari env `PROMO_CODES` (`KODE=persen`, dipisah koma), tidak pernah di `pricing.json` karena file itu ikut terkirim ke browser dan repo ini publik. Browser hanya tahu persennya lewat `POST /api/promo`; saat order, server memvalidasi ulang kodenya.
- **Penumpukan diskon bersifat aditif** (20% + 20% = 40%), dibatasi `max_discount_percent` (env: `PUBLIC_MAX_DISCOUNT_PERCENT`) dan tidak pernah menurunkan total di bawah `regions[].min_price`. Kalau batas ini lebih kecil dari penjumlahan diskon, potongan kode promo yang dipangkas.
- Nilai `PUBLIC_*` memang ikut terkirim ke browser, dan itu disengaja: persentasenya diiklankan di website, sementara **kode promonya** tetap hanya di server.
- **Pembayaran** mengikuti `payment_terms`. `down_payment_percent: 0` berarti tanpa DP, dan seluruh copy di website ikut menyesuaikan.
- **Hosting & domain** ada di `not_included`: dibayar klien langsung ke providernya, setup oleh Skyland tanpa biaya.

## Bahasa otomatis

Pengunjung dari Indonesia yang membuka halaman Inggris dialihkan ke padanan Bahasa Indonesia-nya (`/consult/` → `/id/konsultasi/`), lewat skrip inline di `src/layouts/Base.astro`.

- Halaman statis dan di-cache CDN, jadi pengalihan dilakukan di browser, bukan di server.
- Sinyalnya zona waktu Indonesia atau bahasa browser `id`. Hanya satu arah (EN → ID); pengunjung `/id/` tidak pernah dipaksa ke Inggris.
- Begitu pengunjung menekan tombol ganti bahasa (`data-lang-switch`), pilihannya disimpan di `localStorage` dan pengalihan otomatis berhenti selamanya.
- Bot dilewati supaya halaman Inggris tetap terindeks; `hreflang` tetap jadi sinyal resmi untuk mesin pencari.
