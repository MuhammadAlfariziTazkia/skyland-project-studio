# Panduan agent — Skyland Project Studio

Panduan lintas provider. Berlaku untuk seluruh repository; `CLAUDE.md` mengimpor
file ini. Baca pada awal sesi, termasuk setelah konteks chat berganti.

## Orientasi cepat

Skyland adalah website jasa pembuatan website milik Muhammad Alfarizi Tazkia,
studio remote dari Kanagawa, Jepang untuk Indonesia dan pasar global.
Produk repository ini: landing page bilingual, halaman layanan SEO, dan
konsultan AI gratis → rencana website → mockup homepage → penawaran → email order.
Pembangunan website pesanan klien berlangsung di luar aplikasi ini.

- Astro 5 + TypeScript strict; halaman utama diprerender.
- Preact hanya untuk konsultan (`client:load`); bukan aplikasi React/Next.js.
- Empat API POST di `src/pages/api/` berjalan sebagai fungsi Vercel.
- OpenAI Chat Completions via `fetch`, Structured Outputs; tanpa SDK.
- Nodemailer/Gmail SMTP; tanpa database, auth, payment checkout, atau queue.
- EN `/`, ID `/id/`. Bahasa dan region harga dapat dipilih berbeda.
- Kode harga isomorphic; server menghitung ulang saat order.

## Urutan membaca

1. [Peta dokumentasi](docs/README.md).
2. [Produk](docs/PRODUCT.md) dan [arsitektur](docs/ARCHITECTURE.md).
3. [Status, hasil verifikasi, dan gap](docs/PROJECT_STATUS.md).
4. Dokumen sesuai tugas: [domain/harga](docs/DOMAIN_PRICING.md),
   [API/AI](docs/API_AI.md), [pengembangan](docs/DEVELOPMENT.md),
   [operasional](docs/OPERATIONS.md).
5. [Keputusan arsitektur](docs/DECISIONS.md) bila hendak mengubah pola utama.

Dokumentasi adalah peta. Baca implementasi terkait sebelum mengubahnya.
Jika bertentangan, jelaskan perbedaannya: kode + test menentukan perilaku saat
ini; instruksi terbaru pemilik menentukan perilaku yang diinginkan.

## Invariant produk dan teknis

- AI tidak menerima atau membuat harga. `data/pricing.json` + `quote()` dalam
  `src/lib/pricing.ts` menentukan harga, diskon, serta estimasi hari kerja.
- Jangan menerima total/percent diskon dari browser sebagai otoritas order.
  `src/lib/promo.ts` memvalidasi kode promo lagi di server.
- Gunakan `PRICING`/helper harga untuk nilai yang dipengaruhi override env;
  impor JSON mentah hanya untuk katalog/default yang memang tidak dioverride.
- Halaman konten publik tanpa `feature` adalah satu-satunya halaman berbayar.
  Halaman fitur, member, admin sudah mengikuti harga fitur; section bukan halaman.
- Paket `includes` tetap aktif tanpa harus ada di `plan.features`.
- `fixed`, `range`, dan `discuss` mempunyai makna berbeda. Jangan selalu
  menampilkan harga pasti untuk kebutuhan di luar katalog/di atas batas.
- UI, preview, email, dan konten marketing harus konsisten dengan harga.
- Perubahan teks/katalog harus menjaga pasangan EN dan ID serta mapping ID/slug.
- Gunakan renderer mockup yang sama di browser dan server; escape teks klien/AI.
- `PlanSchema` menerima rencana lama melalui default/transform. Pertimbangkan
  migrasi `skyland-consult-v2` sebelum mengganti ID atau kontrak state.
- Secret hanya di server: `env.ts`, `openai.ts`, `mail.ts`, `promo.ts`,
  `quote-id.ts`. Jangan impor modul tersebut ke island/browser.

## Peta perubahan

| Tugas | Titik awal |
| --- | --- |
| Harga/paket/diskon | `data/pricing.json`, `src/lib/pricing.ts`, `tests/pricing.test.ts` |
| Fitur/jenis halaman baru | JSON → `src/i18n/catalog.ts` → schema/prompt → UI/test |
| State/alur konsultasi | `src/components/consult/Consultant.tsx`, `PlanStep.tsx` |
| Prompt/respons AI | `src/lib/openai.ts`, `src/lib/schemas.ts` |
| Email/order | `src/pages/api/order.ts`, `src/lib/mail.ts`, `src/lib/quote-id.ts` |
| Landing/konten | `src/components/landing/`, `src/i18n/en.ts`, `src/i18n/id.ts` |
| URL/SEO | `src/i18n/routes.ts`, `Seo.astro`, `src/lib/jsonld.ts` |
| Tema/mockup | `src/lib/mockup/themes.ts`, `render.ts`, `MockupFrame.tsx` |
| Styling | `src/styles/global.css`, `src/components/consult/consult.css`, scoped Astro CSS |
| Konsep portfolio | `public/samples/`, `Concepts.astro`, `scripts/capture-portfolio.mjs`, `scripts/fetch-sample-photos.mjs` |

`public/samples/*` adalah demo HTML terpisah dengan runtime React 18 dari CDN.
Jangan menganggap runtime itu bagian dari konsultan Preact. File `*.dc.html` di
root adalah artefak desain/referensi; rute aktif berasal dari `src/pages/` dan
`public/`. `dist/`, `.astro/`, `.vercel/`, `.shots/` adalah hasil generasi.

## Cara bekerja dan memverifikasi

1. Periksa `git status --short`; pertahankan perubahan lokal yang bukan milik tugas.
2. Baca dokumen dan kode jalur yang diubah; tentukan dampak harga/bahasa/state/API.
3. Buat perubahan terfokus mengikuti pola repository yang sudah ada.
4. Node >=22.12, npm + `package-lock.json`; gunakan `npm ci` pada checkout baru.
5. Jalankan pemeriksaan yang relevan: `npm run test`, `npm run check`,
   `npm run build`. Perubahan alur/visual juga diverifikasi di browser EN/ID.
6. Script `scripts/e2e-consult.mjs` **mengirim order**. Gunakan dev fixture tanpa
   kredensial OpenAI/SMTP untuk uji otomatis; `.env.local` dapat mengalahkan `.env`.
7. Laporkan hasil aktual dan batas verifikasi. Jangan menyebut log screenshot
   sebagai assertion lengkap atau fixture sebagai pengujian OpenAI/SMTP nyata.
8. Perbarui dokumen yang terkena perubahan; catat konteks lanjutan menggunakan
   [template handoff](docs/HANDOFF_TEMPLATE.md). Jangan menaruh progres sesi di sini.

Jangan menyalin isi `.env*` berisi secret ke chat/dokumentasi/commit. Gunakan
`.env.example` untuk nama dan contoh konfigurasi. Tidak perlu mengubah stack,
menambah database, atau membuat abstraksi baru hanya untuk memenuhi kebiasaan agent.
Ikuti scope dan instruksi pemilik; dokumen ini bukan backlog yang harus langsung dikerjakan.
