# Skyland Project Studio

Landing page + **konsultan AI dengan harga pasti** untuk jasa pembuatan website.
Bilingual (EN di `/`, ID di `/id/`), USD untuk EN dan IDR untuk ID, tanpa database, siap deploy ke Vercel.

**Stack:** Astro 5 (static, SEO-first) · Preact (hanya untuk konsultan) · OpenAI Chat Completions + Structured Outputs (via `fetch`, tanpa SDK) · Nodemailer + Gmail SMTP · Vercel serverless (hanya `/api/*`).

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
| `node scripts/e2e-consult.mjs http://localhost:4321 id 375` | Menjalankan seluruh alur konsultasi di browser |
| `node scripts/make-assets.mjs` | Membuat ulang gambar OG, apple-touch-icon, dan `public/founder.jpg` |
| `node scripts/make-hero.mjs` | Membuat ulang mockup company profile di laptop hero (EN + ID). Teks & desain ada di dalam script |
| `node scripts/capture-portfolio.mjs` | Mengambil ulang screenshot desktop + HP semua proyek portofolio |

Script screenshot memakai Chrome lokal (`/usr/bin/google-chrome`); ganti lewat `CHROME_PATH` bila perlu.

## Environment variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✓ | API key OpenAI |
| `OPENAI_MODEL` | | Default `gpt-5-mini`. Model apa pun yang mendukung Structured Outputs (`json_schema`) |
| `OPENAI_REASONING_EFFORT` | | `minimal`/`low`/`medium` untuk model reasoning (gpt-5*, o*). **Kosongkan** untuk gpt-4.x |
| `GMAIL_USER` | ✓ | Alamat Gmail pengirim |
| `GMAIL_APP_PASSWORD` | ✓ | App Password Gmail (lihat di bawah) |
| `OWNER_EMAIL` | | Tujuan order baru (default: `GMAIL_USER`) |
| `QUOTE_SECRET` | ✓ | String acak, mis. `openssl rand -hex 24` |
| `PUBLIC_SITE_URL` | ✓ | Domain final, mis. `https://skyland.id` (dipakai untuk canonical, sitemap, OG) |
| `PUBLIC_WHATSAPP_NUMBER` | ✓ | Format internasional tanpa `+`, mis. `6281234567890` |
| `PUBLIC_CONTACT_EMAIL` | | Email publik di footer & JSON-LD |
| `PUBLIC_GSC_VERIFICATION` | | Token verifikasi Google Search Console (metode HTML tag) |
| `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | | Opsional: Cloudflare Turnstile (gratis) untuk memblokir bot |

**Gmail App Password:** aktifkan 2-Step Verification di akun Google → Google Account → Security → *App passwords* → buat untuk "Mail" → salin 16 karakternya ke `GMAIL_APP_PASSWORD`.

## Mengubah harga dan konten

- **`data/pricing.json`** adalah knowledge base harga Anda:
  - `projectTypes`: harga dasar, jumlah halaman termasuk, fitur termasuk, estimasi minggu, dan kisaran harga yang tampil di website.
  - `extraPage`: harga halaman tambahan per kompleksitas.
  - `features`: katalog fitur, masing-masing dengan harga IDR **dan** USD. Menambah fitur baru cukup menambah entri; AI otomatis bisa memilihnya.
  - `customTiers`: harga S/M/L untuk kebutuhan di luar katalog. Tier L membuat penawaran ditandai "perlu call".
  - `foundingOffer`: diskon klien pertama. **Naikkan `spotsTaken` setiap kali dapat klien**; badge dan diskon otomatis hilang saat slot habis (set `active: false` untuk mematikan).
  - `guardrails.maxAutoQuote`: di atas angka ini, harga ditampilkan sebagai estimasi.
  - Setelah mengubah harga, jalankan `npm run test` (beberapa test mengasumsikan nilai default).
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
