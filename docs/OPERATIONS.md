# Konfigurasi dan operasional

## Model environment

`.env.example` mendokumentasikan seluruh nama setting. Jangan salin nilai
`.env`, `.env.local`, key, atau SMTP password ke dokumentasi/handoff.

`src/lib/env.ts` membaca secret dengan urutan process.env → import.meta.env →
string kosong. Public settings dibaca via literal `import.meta.env.PUBLIC_*`
agar Vite bisa meng-inline ke browser. PUBLIC berarti nilai boleh terlihat
pengunjung, **bukan** tempat menyimpan secret. Perubahan public setting perlu
build/redeploy; dev perlu restart bila env berubah.

## Environment reference

| Setting | Jenis/waktu | Perilaku/default |
| --- | --- | --- |
| OPENAI_API_KEY | Server runtime | Wajib untuk AI production; dev kosong → fixture |
| OPENAI_MODEL | Server runtime | Default gpt-5-mini; dukungan parameter harus sesuai model |
| OPENAI_REASONING_EFFORT | Server runtime | Default low untuk plan; revisi/mockup gpt-5 dipaksa minimal |
| GMAIL_USER | Server runtime | Pengirim SMTP; diperlukan bila transport nyata dipakai |
| GMAIL_APP_PASSWORD | Server runtime | Password aplikasi Gmail, whitespace dibuang; dev kosong → skip email |
| OWNER_EMAIL | Server runtime | Tujuan order, fallback GMAIL_USER |
| QUOTE_SECRET | Server runtime | Secret HMAC; kode fallback dev-secret bila kosong, bahkan production |
| PROMO_CODES | Server runtime | KODE=persen dipisah koma; kosong → tanpa kode valid |
| PUBLIC_FOUNDING_PERCENT | Public build | Default data.founding_offer.percent (20) |
| PUBLIC_FOUNDING_SPOTS | Public build | Default spots_total (5) |
| PUBLIC_FOUNDING_TAKEN | Public build | Default spots_taken (0); update manual setelah deal |
| PUBLIC_MAX_DISCOUNT_PERCENT | Public build | Default data.max_discount_percent (40) |
| PUBLIC_SITE_URL | Public build | Domain final tanpa trailing slash untuk SEO/URL |
| PUBLIC_WHATSAPP_NUMBER | Public build | Nomor kontak publik; non-digit dibuang oleh SITE |
| PUBLIC_CONTACT_EMAIL | Public build | Footer/schema/legal contact; default kosong |
| PUBLIC_GSC_VERIFICATION | Public build | Optional token meta Search Console |
| PUBLIC_TURNSTILE_SITE_KEY | Public build | Optional widget browser |
| TURNSTILE_SECRET_KEY | Server runtime | Optional verifikasi server hanya plan create |

Untuk production, isi OpenAI key, Gmail user/password, QUOTE_SECRET kuat, serta
public domain/kontak yang benar. Tidak ada validator startup terpusat yang
menolak semua konfigurasi incomplete. Build berhasil bukan bukti secret benar.

Turnstile sebaiknya diisi sebagai pasangan site key + secret. Hanya site key
membuat UI menunggu token tetapi tidak mengaktifkan verifikasi server; hanya
secret membuat create gagal karena UI tidak menyediakan widget/token.

Astro config menentukan site dari PUBLIC_SITE_URL → VERCEL_PROJECT_PRODUCTION_URL
→ localhost:4321. `SITE.url` hanya memakai PUBLIC_SITE_URL atau localhost.
Karena fallback dua tempat berbeda, tetapkan PUBLIC_SITE_URL secara eksplisit
untuk menghindari metadata/URL yang tidak seragam.

Nama/founder/lokasi/sosial dikelola di `src/config/site.ts`, bukan env. Link
sosial kosong disembunyikan; lokasi sekarang Kanagawa/JP.

## Deployment

Target kode saat ini Vercel dengan adapter `maxDuration:60`. Tidak ada file
Sites hosting, Docker, CI workflow, atau provider deploy kedua di repository.
Production nyata/domain aktif tidak diperiksa dalam audit dokumentasi.

Urutan operasional pada perubahan yang memang akan dideploy:

1. Jalankan test/check/build pada checkout yang akan dikirim.
2. Siapkan project Vercel dan environment Production/Preview yang sesuai.
3. Pastikan domain final/kontak/public promo ada sebelum build.
4. Deploy melalui workflow yang dipakai pemilik; artefak `.vercel/output/`
   hasil build lokal bukan bukti deploy sudah dilakukan.
5. Periksa halaman EN/ID, sitemap-index.xml, robots.txt, canonical/hreflang,
   file sample dan API pada environment tujuan.
6. Pada uji integrasi yang memang diotorisasi, pastikan email pemilik diterima
   dan lampiran bisa dibuka. Catat bila konfirmasi klien gagal walau API sukses.

Halaman SEO/maketing tetap statis, bukan dihasilkan ulang saat request. Perubahan
harga, founding offer, copy, assets, dan PUBLIC env memerlukan deployment baru.
Secret runtime di platform juga harus tersedia bagi fungsi versi yang dipakai.

## Jalur order dan email

Order memparse full Plan/Choices/Mockup/Contact, memvalidasi promo ulang,
menghitung Quote, membuat HMAC reference, serta merender mockup konsep.

Email pertama ke OWNER_EMAIL (fallback pengirim), dengan replyTo klien:

- Kontak, locale/region, tema, pilihan, timeline, brief/revisi, ringkasan,
  flow, halaman terlihat, fitur/custom/asumsi, rincian harga dan diskon.
- `mockup-SKY-XXXXXXXX.html`: homepage konsep, watermark reference.
- `consultation-SKY-XXXXXXXX.json`: quoteId, createdAt ISO, seluruh order input,
  dan Quote hasil server. Ini mencakup data pribadi klien.

Email pemilik berbahasa Indonesia; konfirmasi klien mengikuti locale dan hanya
membawa HTML mockup sebagai lampiran. Angka/label Quote dihitung menggunakan
locale order, sehingga beberapa label rincian email pemilik dapat mengikuti
bahasa klien. Nomor WhatsApp klien pada email mengubah awalan 0 menjadi 62;
nomor internasional sebaiknya memakai format dengan kode negara.

Jika email pemilik gagal, request gagal. Jika email konfirmasi klien gagal,
error dicatat tetapi request tetap sukses karena pemilik sudah menerima order.
Tidak ada transaksi, outbox, retry worker, idempotency key, atau deduplication.
Retry setelah koneksi terputus dapat menghasilkan email ganda walaupun reference
sama. Reference hanya membantu follow-up manual; tidak dapat di-query dari API.

## Penanganan penawaran secara bisnis

Pemilik meninjau lampiran, memastikan Plan dan mockup masuk akal, mengonfirmasi
custom/range/discuss, lalu melanjutkan komunikasi di luar aplikasi. Masa berlaku
default 14 hari ditampilkan kepada klien; API tidak menyimpan tanggal quote
atau menegakkan expiry. Catalog/pricing baru saat submit dapat berbeda dari
konsultasi yang disimpan browser lama.

Deal tidak dicatat aplikasi. Setelah benar-benar deal, pemilik memperbarui
PUBLIC_FOUNDING_TAKEN atau default JSON dan redeploy. Submit order sendiri tidak
menghabiskan slot, dan tidak ada reservasi slot atomik untuk request bersamaan.

## Log, data, dan pembatasan

Kode mencatat penggunaan token AI, detail error upstream, exception API,
failure konfirmasi klien, serta email/reference saat skip dev. Tidak ada
structured observability, request correlation ID, cost dashboard, atau audit
trail database. Hindari menyalin log yang mengandung data klien ke issue publik.

Draft tersimpan di localStorage termasuk kontak/consent yang diisi, tanpa TTL.
Order ada di inbox dan lampiran. Penghapusan data harus mempertimbangkan browser,
inbox, lampiran yang diunduh, dan log operasional. Tidak ada endpoint delete data.

Rate limiter memory membantu instance lokal tetapi tidak memberi kuota yang
reliable lintas instance. Pengendalian biaya/traffic pada dashboard penyedia
harus ditangani sebagai konfigurasi deployment; audit ini tidak memastikan
spend cap atau firewall rule telah aktif.

## Troubleshooting berdasarkan jalur kode

| Gejala | Pemeriksaan awal |
| --- | --- |
| Fixture tidak muncul / ada biaya AI | Pastikan DEV, key kosong termasuk .env.local/shell; devMode hanya untuk tanpa key |
| AI 503 | OPENAI_API_KEY kosong dalam fungsi production |
| AI 502 | Log upstream, model/parameter, output terpotong, token budget |
| AI 500 setelah sekitar 55s | Timeout fetch; abort belum dipetakan menjadi error khusus |
| Plan tidak lengkap tapi request sukses | Prompt/cakupan flow, schema clipping, page-feature visibility |
| Order 500 | Log SMTP, GMAIL_USER/password, tujuan owner; tidak ada retry otomatis |
| API sukses tetapi klien tidak menerima email | Log confirmation failure; pemilik bisa sudah menerima |
| Promo valid sebelumnya tetapi tidak dipakai saat order | Env PROMO_CODES berubah/invalid, cap/minimum, server lookup ulang |
| Diskon/badge belum berubah | PUBLIC settings perlu rebuild; founding flag active dan slot tersisa |
| Harga browser vs server berbeda | Deploy/public env, katalog versi lama, state >24 pages, promo stale |
| Preview tidak mengikuti perubahan brief/section | planKey hanya mencakup subset field |
| Form create menunggu verifikasi | Pasangan Turnstile setting, token expire/widget render |
| API 429 | Map satu jam instance; shared label ai, header IP/proxy |
| EN selalu berpindah ke ID | Bahasa/zona browser, skyland-lang; pilih bahasa secara manual |
| URL /samples/nama/ gagal di dev | Middleware samples-dir-index dan nama folder |
| Demo/font tidak tampil | Font Google, image/CDN React eksternal, support.js; terpisah dari app utama |
| Canonical/domain salah | PUBLIC_SITE_URL dan build baru; perbedaan fallback config/SITE |
| Chrome script gagal diluncurkan | CHROME_PATH dan executable lokal; playwright-core tidak membawa browser |

Dokumen ini menjelaskan implementasi lokal. Klaim layanan SMTP/model, harga
hosting, batas akun, atau konfigurasi firewall terbaru perlu diverifikasi ke
provider saat tugas operasional tersebut dilakukan.
