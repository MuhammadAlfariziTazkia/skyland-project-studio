# Kontrak API dan integrasi AI

## Konvensi

Empat endpoint POST menerima JSON dan mengirim JSON dengan `cache-control:
no-store`. Tidak ada autentikasi/session server, endpoint GET untuk quote, atau
API version prefix. Definisi lengkap field ada di `src/lib/schemas.ts`; contoh
berikut hanya membentuk kontrak dan tidak menggantikan schema.

`readJson()` membaca body sebagai text, membatasi panjang 64 × 1.024 karakter,
dan memparse JSON. Bila Origin dan Host tersedia, host Origin harus sama.
Tidak ada kewajiban Origin, pemeriksaan Content-Type, atau auth token.

## Endpoint

| Endpoint | Request inti | Response sukses | Guard khusus |
| --- | --- | --- | --- |
| `/api/plan` create | mode=create, locale, description, reference? | `{plan}` | ai rate bucket, honeypot, optional Turnstile |
| `/api/plan` revise | mode=revise, locale, description, plan, instruction | `{plan,note}` | ai rate bucket, honeypot |
| `/api/mockup` | locale, plan, theme, description | `{mockup}` | ai rate bucket |
| `/api/promo` | code | `{ok:true,code,percent}` atau `{ok:false}` | promo rate bucket |
| `/api/order` | locale, choices, description, revision?, plan, theme, mockup, contact | `{ok:true,quoteId,total,currency,status}` | order rate bucket, honeypot |

Field honeypot bernama `website`; harus kosong. `turnstileToken` tersedia pada
request plan tetapi verifikasi hanya dijalankan saat create.

Contoh request pertama:

```json
{
  "mode": "create",
  "locale": "id",
  "description": "Saya punya kedai kopi. Pelanggan perlu melihat menu dan lokasi lalu pesan melalui WhatsApp.",
  "reference": "",
  "website": ""
}
```

Contoh Choices order:

```json
{
  "region": "ID",
  "design": "semi_custom",
  "content": "partial",
  "timeline": "normal",
  "promoCode": ""
}
```

Order membawa seluruh Plan dan Mockup hasil konsultasi, bukan quote ID yang
pernah diterbitkan server. Tidak ada field total client yang dipakai. Server
parse → lookup promo → quote → HMAC ID → render HTML → email → response.
Region tidak wajib sama dengan locale. Plan/theme/mockup tidak dibandingkan
dengan sesi AI sebelumnya karena tidak ada sesi persisten.

## Validation dan compatibility

| Input | Batas/perilaku |
| --- | --- |
| locale / region / theme | en atau id / ID atau GLOBAL / minimal,elegant,futuristic,vibrant |
| description create | trim, minimal 20, maksimal 1.500; reject jika tidak sesuai |
| instruction revisi | trim, minimal 3, maksimal 800; reject |
| reference | trim dan clip 200; tidak di-fetch sebagai website |
| halaman | minimal 1; setelah parse dipotong ke 24 |
| flow | maksimal 12, actor invalid fallback visitor |
| page | name 60, purpose 240, maksimal 10 sections × 120; type menentukan area/feature |
| covers | maksimal 12 indeks integer 0–30; tidak diperiksa terhadap panjang flows |
| features/suggestions | ID enum katalog; jumlah dipotong ke panjang katalog |
| quantity | integer 1–10; invalid/missing fallback 1 |
| customRequests/questions/assumptions | maksimal 3 / 2 / 6 |
| projectName/summary/audience/business | clip 80 / 600 / 300 / 240 |
| promoCode | optional default kosong, trim, maksimal 32 |
| contact | nama 2–80, email valid <=120, WhatsApp regex 8–20 karakter, consent literal true |
| company/notes | optional, clip 100 / 1.000 |
| accent mockup | hex 6 digit; invalid fallback #2563eb |

Tidak semua batas adalah rejection. Helper text/list memang melakukan clipping
agar output AI sedikit verbose tetap diterima. Unknown field objek Zod umumnya
dibuang. Default/catch pada area/feature/business/flows/quantity membantu Plan
lama tetap terbaca. Perubahan schema perlu memeriksa request, model output,
state lokal, renderer, email, dan test secara bersamaan.

Zod memastikan shape dan beberapa enum, belum memastikan relasi bisnis seperti
cakupan flow, kelengkapan screen setelah fitur ditambah, atau uniqueness type.

## Guard dan error

Bucket memory menggunakan window **satu jam**, dihitung per key/IP instance:

| Key | Limit | Dipakai |
| --- | ---: | --- |
| ai:IP | 12 | plan create/revise dan mockup |
| order:IP | 5 | order |
| promo:IP | 20 | lookup promo |

AI bucket memakai label key yang sama; jangan memperlakukannya sebagai kuota
global yang reliable di Vercel. Fungsi/instance berbeda dapat memiliki map
berbeda, cold start menghapus state. IP berasal dari x-forwarded-for pertama,
lalu x-real-ip, lalu local; proxy/deployment harus menyediakan header tepercaya.

| HTTP | Sumber | Body |
| --- | --- | --- |
| 200 | Sukses termasuk promo tidak dikenal | Kontrak endpoint |
| 400 | JSON invalid, Zod, Turnstile gagal/missing | `{error}`; Zod menambah `issues` |
| 403 | Host Origin berbeda | `{error:"Forbidden"}` |
| 413 | Text body melewati batas | `{error:"Request too large"}` |
| 422 | Refusal model | Pesan rephrase brief |
| 429 | Memory rate limit | Pesan coba lagi nanti |
| 502 | Upstream OpenAI non-OK atau output terpotong/kosong | Pesan AI busy/cut off |
| 503 | OpenAI belum dikonfigurasi di mode non-fixture | Pesan konfigurasi belum tersedia |
| 500 | Error lain | Generic error; detail dicatat ke console server |

Timeout fetch OpenAI, JSON content invalid, atau shape upstream tak terduga
dapat jatuh ke generic 500. Tidak ada retry/backoff bawaan. Response Zod invalid
dari AI juga melalui errorResponse; status 400 tersebut tidak selalu berarti
user menulis brief invalid.

## Pipeline AI

Implementasi berada di `src/lib/openai.ts`, menggunakan `POST
https://api.openai.com/v1/chat/completions` dengan native fetch, bearer key,
`response_format.type=json_schema`, `strict:true`, required seluruh property,
dan `additionalProperties:false`. Setelah model mengembalikan JSON, schema
Zod mengubah/menormalisasi hasil sebelum dikirim ke browser.

| Use case | Schema | Completion budget | Effort kode saat ini |
| --- | --- | ---: | --- |
| Rencana baru | PLAN_JSON_SCHEMA | 6.000 | OPENAI_REASONING_EFFORT atau low |
| Revisi | PATCH_JSON_SCHEMA | 2.000 | minimal untuk model dengan prefix gpt-5 |
| Mockup | MOCKUP_JSON_SCHEMA | 3.000 | minimal untuk model dengan prefix gpt-5 |

Default OPENAI_MODEL adalah `gpt-5-mini`. Regex `^(gpt-5|o\d)` menentukan apakah
reasoning_effort dikirim. Untuk model reasoning selain gpt-5, use case light
tetap memakai env/default low. Ini perilaku kode, bukan jaminan semua model
OpenAI menerima parameter tersebut. Pergantian model perlu memeriksa kontrak
provider dan uji nyata; jangan mengandalkan prefix saja.

Timeout request 55 detik, maxDuration adapter 60 detik. Token budget mencakup
completion model; output bisa terpotong. Kode mencatat usage prompt/completion
dan cached tokens saat tersedia. Tidak ada penyimpanan biaya per konsultasi.

### Katalog tanpa harga

`catalogText()` mengambil ID paket, jumlah halaman included, included features,
deskripsi plain EN fitur, kategori, unit, dan page types beserta section lazim.
Harga, aturan diskon, dan reference cases tidak dikirim. Prompt system statis,
locale/tema/brief di user message sehingga struktur memungkinkan prompt caching.
Jumlah token katalog tidak menjadi kontrak stabil setelah katalog diperluas.

Reference website diteruskan hanya sebagai string. Tidak ada browsing/scraping
referensi oleh backend. AI tidak mendapat data Contact kecuali pengguna sendiri
menuliskannya di description atau field plan/revision.

### Rencana

Urutan field diarahkan sebagai proses reasoning: layanan → bisnis → flow →
fitur → halaman → custom/pertanyaan/asumsi → ringkasan/audience. Prompt meminta
website terkecil yang memenuhi flow, tidak upsell, memindahkan nice-to-have ke
suggestions, menggabungkan informasi pendek sebagai section, serta memasukkan
screen pemilik/member yang diperlukan. Bahasa human-readable mengikuti locale;
ID katalog tidak diterjemahkan.

Instruksi jumlah flow/saran/cakupan/type unik sebagian hanya berada di prompt.
Output structured tidak otomatis berarti rekomendasi produk lengkap atau benar.

### Revisi patch

Model menerima brief, ringkasan nama/type halaman, ID fitur aktif, dan nama
customRequests; bukan seluruh Plan atau quantity/reason/section terkini.
Patch dapat mengubah serviceId, menambah/menghapus halaman, menambah section,
menambah/menghapus fitur/customRequest, dan memberi note.

`applyPatch()` mencocokkan nama case-insensitive setelah trim, mengganti fitur
yang ID-nya ditambahkan ulang, menghapus suggestions yang baru aktif, menjaga
field lain lewat spread, lalu memparse Plan final. Flows, questions, assumptions,
summary, audience tidak disusun ulang oleh patch. Note dipotong 240 karakter.
Batas satu revisi per konsultasi hanya di `revisionUsed` UI, bukan API.

### Konten mockup dan rendering

Brief mockup berisi public pages, sections, dan flow selain owner. Model
menghasilkan nama brand, menu, hex accent, hero, tiga selling points, section
jenis cards/split/steps/stats/quote/cta, dan footer. Prompt meminta penutup CTA;
schema tidak memaksa urutan/jumlah tepat seperti prose prompt.

Model tidak menghasilkan HTML/CSS bebas. `renderMockup()` mengescape teks,
membatasi icon, memeriksa accent lagi, serta menyisipkan stylesheet tema yang
ditentukan kode. Renderer yang sama dipakai preview dan attachment order;
server menambahkan watermark `Concept · SKY-...`. Preview iframe tidak mengizinkan
script. Mockup tidak memuat halaman lain atau mengimplementasikan fitur plan.

## Mode development

`devMode() = import.meta.env.DEV && !env('OPENAI_API_KEY')`. Create/revise/mockup
menggunakan fixture Kopi Senja; revise fixture mengganti dengan Plan contoh
revised, bukan mensimulasikan patch bebas. Email dilewati di dev hanya ketika
GMAIL_APP_PASSWORD kosong. Mode production tidak memakai fallback fixture.

Konfigurasi lokal dengan key/password sungguhan akan memanggil layanan nyata.
Jangan menjalankan E2E order terhadap instance itu secara tak sengaja. Hasil
fixture memverifikasi aplikasi/browser, bukan kualitas AI atau delivery SMTP.
