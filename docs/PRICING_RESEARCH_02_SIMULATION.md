# 2 — Simulasi mesin harga Skyland saat ini

Simulasi: **8 Oktober 2026, Asia/Tokyo**. Commit basis:
`243a9d4db4a211a4cfc58fd68faacafd56a1ff3e`.
**Re-verifikasi independen: 10 Oktober 2026.**
Prasyarat: [scope dan pembanding pasar tahap 1](PRICING_RESEARCH_01_MARKET.md).
Berikutnya: [evaluasi](PRICING_RESEARCH_03_EVALUATION.md),
[strategi scope](PRICING_RESEARCH_04_STRATEGY.md), dan
[strategi komersial](PRICING_RESEARCH_05_COMMERCIAL.md).

## Status re-verifikasi 10 Oktober 2026

Seluruh klaim yang dapat diperiksa pada dokumen ini **dikonfirmasi ulang** pada
checkout yang sama. Dokumen ini tidak dirombak; hanya catatan di bawah ditambahkan.

| Klaim dokumen | Hasil pemeriksaan ulang |
| --- | --- |
| `npm run test` 53 lulus / 4 gagal (57 total, 2 file) | **Terkonfirmasi**, keempat kegagalan identik |
| `PlanSchema` memotong ke 24 halaman diam-diam | **Terkonfirmasi**: `MAX_PAGES = 24` di `src/lib/schemas.ts:20`, diterapkan `schemas.ts:81` |
| `max_multiplier: 2` tidak dijalankan `quote()` | **Terkonfirmasi**: tidak ada referensi `max_multiplier` di `src/lib/pricing.ts` |
| `hourly_rate` tidak dibaca untuk menghitung harga | **Terkonfirmasi**: hanya metadata `pricing_basis` |
| Copywriting tetap ditagih saat `content: 'none'` | **Terkonfirmasi** lewat probe dokumen ini |
| `region:'JP'` ditolak schema | **Terkonfirmasi**: `REGIONS = ['ID', 'GLOBAL']` di `schemas.ts:9` |

Dua temuan **tambahan** yang tidak tertangkap dokumen ini maupun dokumen 3,
diperiksa langsung di `data/pricing.json`:

1. **Batas region tidak koheren 9,8×.** `ID.max_price` Rp22 juta setara **$1.229**
   pada kurs Oktober 2026, sedangkan `GLOBAL.max_price` adalah **$12.000**.
   Inilah sebab sesungguhnya Arden ID jatuh ke `discuss` sementara Arden GLOBAL
   tetap `range` untuk scope yang identik. Minimum juga meleset: Rp750.000 = $42
   versus $250.
2. **Rasio base ID/GLOBAL tidak konsisten antar paket:** company_profile 6,6×
   (Rp1,75 juta vs $650), sedangkan online_store dan custom_web_app 8,9×,
   padahal `pricing_basis.hourly_rate` menyiratkan 6,5× (Rp55.000 = $3,07 vs $20).
   Harga katalog jelas di-hand-tune lepas dari basis jamnya.

## Apa yang benar-benar disimulasikan

Saya menulis empat **fixture Plan manual**, memparse dengan `PlanSchema`, lalu
menjalankan fungsi `quote()` asli menggunakan JSON harga repository sebagai
parameter `data`. Tidak ada salinan formula yang menggantikan engine.
Vite SSR memuat TypeScript dengan `configFile:false` dan direktori env kosong
di `/tmp`; tidak membaca `.env`/`.env.local` proyek. Hasil merepresentasikan
**default katalog**, bukan override promo deployment yang belum diketahui.

Ini simulasi deterministik pemetaan scope → katalog → quote, **bukan hasil
panggilan AI live**. Rekomendasi model dapat berbeda dan memerlukan eval tersendiri.
Tidak ada request OpenAI, SMTP, endpoint order atau browser E2E. Fixture bukan
spesifikasi lengkap delivery: flow/covers disederhanakan, layar ada yang digabung,
dan keterbatasan model Plan dijelaskan terbuka.

Pilihan seragam: `full_custom`, `ready`, `normal`; satu bahasa per website;
semua quantity = 1. Dasar ini cocok dengan tahap 1: desain mengikuti sample,
materi klien siap. Copywriting, multilang, rush, hosting, maintenance dan biaya
provider tidak ditambahkan. Founding default 20% aktif; promo tambahan hanya
untuk uji sensitivitas, bukan kode promo yang benar-benar tersedia.

## Hasil utama per negara

| Sample | Indonesia: output IDR | Jepang: output yang tersedia | AS: output GLOBAL/USD |
| --- | ---: | ---: | ---: |
| Tegak | Rp8.100.000–9.700.000 (`range`) | US$3.000–3.600 (`range`) | US$3.000–3.600 (`range`) |
| Lembar | Rp10.800.000–12.950.000 (`range`) | US$4.600–5.525 (`range`) | US$4.600–5.525 (`range`) |
| Kurohane | Rp8.550.000–10.300.000 (`range`) | US$3.550–4.250 (`range`) | US$3.550–4.250 (`range`) |
| Arden | **Perlu diskusi** (`discuss`); tidak ada angka headline | US$9.150–11.000 (`range`) | US$9.150–11.000 (`range`) |

**Jepang tidak mempunyai region/JPY dalam sistem.** `ChoicesSchema` menolak
`region:'JP'`. **Catatan 10 Okt 2026: seluruh pembahasan "Jepang memakai pilihan
GLOBAL" di bawah menjadi _superseded_ begitu region JP ditambahkan** sesuai
[dokumen 1](PRICING_RESEARCH_01_MARKET.md) dan
[dokumen 4](PRICING_RESEARCH_04_STRATEGY.md). Ia dipertahankan sebagai rekaman
perilaku commit `243a9d4`, bukan sebagai deskripsi sistem yang dituju. Tabel Jepang memakai pilihan GLOBAL yang tersedia di UI; tidak
ada kalkulasi harga Jepang tersembunyi. Angka yen asli mesin tidak dapat
disimulasikan tanpa mengubah implementasi. Locale Jepang juga belum tersedia;
locale EN/ID hanya mengubah label, bukan harga. Delapan eksekusi unik cukup
untuk 12 sel negara karena Jepang dan AS memakai input region sama.

Arden ID tetap mempunyai angka internal Rp20.950.000–25.150.000 dalam objek
Quote, tetapi `quotePriceText()` mengembalikan string kosong untuk `discuss`.
Angka internal ini **bukan fee final yang ditawarkan UI**. API order masih
mengembalikan `total` numerik bersama `status`.

## Data aktual versus dokumentasi lama

Sumber otoritatif: [pricing.json](../data/pricing.json),
[pricing.ts](../src/lib/pricing.ts), [schemas.ts](../src/lib/schemas.ts),
[catalog.ts](../src/i18n/catalog.ts), [openai.ts](../src/lib/openai.ts),
[order.ts](../src/pages/api/order.ts), dan [mail.ts](../src/lib/mail.ts).

`docs/DOMAIN_PRICING.md` adalah snapshot sebelumnya. Beberapa nilainya sudah
berbeda dari checkout ini; dokumen lama tidak diubah karena tugas tahap riset
hanya membuat dokumen penelitian. **Catatan 10 Okt 2026:** `DOMAIN_PRICING.md`
akan diperbarui bersama implementasi katalog baru, sehingga tabel di bawah
berhenti menjadi perbandingan "aktual vs dokumen lama" dan menjadi rekaman
sejarah commit `243a9d4`.

| Parameter | Source aktual | Snapshot dokumen lama |
| --- | ---: | ---: |
| Base GLOBAL online_store | $2.200 | $1.600 |
| Base GLOBAL booking_reservation | $1.600 | $1.275 |
| Base GLOBAL custom_web_app | $5.000 | $3.600 |
| Base GLOBAL online_course | $3.400 | $2.400 |
| Maksimum otomatis GLOBAL | $12.000 | $9.000 |
| full_custom | 1,4 | 1,45 |
| content none | 1,2 | 1,25 |
| rush | 1,35 | 1,5 |

JSON juga menyebut `max_multiplier:2` dan copywriting tidak ditagih ketika
content none. `quote()` saat ini **tidak menjalankan kedua ketentuan itu**.
Metadata tentang LLM menghitung harga/range selalu bukan perilaku runtime.

## Formula yang dijalankan

```text
C = jumlah public pages tanpa feature setelah parsing/visibility
E = max(0, C - pages_included)
S = base_region + E × extra_page_region + Σ fitur non-included
R = S, lalu setiap adjustment: R += round(R × (multiplier - 1))
P = max(min_region, round_to_step(R))
PH = round_to_step(P × 1,2)
status = P > max_region ? discuss : ada customRequests ? range : fixed
total = P - discount(P); totalHigh = PH - discount(PH)
```

Discount founding dan promo bersifat aditif atas P, cap 40%; setiap potongan
dibulatkan terpisah dan tidak boleh menjatuhkan total di bawah minimum region.
Status memakai P **sebelum diskon**, bukan total atau PH. Pembulatan ke nilai
terdekat: ID Rp50.000; GLOBAL $25. Minimum ID Rp750.000/GLOBAL $250;
maksimum ID Rp22 juta/GLOBAL $12 ribu.

Jam/timeline: `extraDays=ceil((4×E + Σ jam fitur non-included)/6)`;
`days=ceil((workdays_base + extraDays) × design × content × pace)`.
Untuk baseline: design 1,4, content 1, pace 1. Base est_hours bukan input
langsung perhitungan workdays.

## Pemetaan scope yang dipakai

Fixture lengkap dan runnable ada di lampiran. Ringkasan berikut menjelaskan
perbedaan hitungan layar produksi dan halaman yang ditagih:

| Proyek | Paket | Input layar → setelah parse | Halaman berbayar | Kuota / tambahan | CustomRequest |
| --- | --- | ---: | ---: | ---: | ---: |
| Tegak | company_profile | 18 → 18 | 9 | 5 / 4 | 2 |
| Lembar | online_store | 21 → 21 | 5 | 6 / 0 | 2 |
| Kurohane | booking_reservation | 17 → 17 | 9 | 5 / 4 | 2 |
| Arden | custom_web_app | 27 → 24 | 9 | 6 / 3 | 3 |

- Tegak: home/about/services/service detail/capabilities/certifications/coverage/
  contact/careers adalah sembilan halaman berbayar. Privacy+terms menjadi legal
  feature screen; portfolio dan blog mengikuti fitur. CMS konten/proyek/lead/staff
  menggunakan empat screen admin. Peta interaktif dan workflow CMS/lead custom
  belum mempunyai ukuran effort sendiri. Analytics dasar dimasukkan untuk
  pengukuran situs; gallery untuk media perusahaan, portfolio_filter untuk proyek.
- Lembar: home/about/contact/FAQ/shipping-return berbayar; catalog/detail/cart/
  checkout/search/legal/login/order/admin mengikuti fitur. Wishlist tidak ada ID
  khusus; diwakili custom_member + custom request. Collection/preorder, impor
  CSV awal, tracking dan exception refund tidak mempunyai batas harga eksplisit.
  `content_migration` tidak dipilih: datanya CSV baru, bukan migrasi situs lama.
- Kurohane: delapan halaman konten dari scope tahap 1 ditambah layar public
  **manage guest booking** menjadi sembilan. Layar terakhir memakai type custom
  karena type my_bookings mengharuskan user_login; sistem menagihnya sebagai
  halaman walaupun secara domain ia layar fungsional booking. portfolio_filter
  dipakai sebagai proksi filter/detail style, gallery untuk foto studio.
  `user_login` tidak ditambahkan pada pelanggan yang seharusnya guest.
- Arden: delapan halaman konten ditambah results custom menjadi sembilan.
  product_catalog hanya proksi katalog lot, **tidak berarti fitur lelang
  sudah tercakup**. events_calendar bukan bidding engine. payment hanya proksi
  integrasi deposit; manual_payment tidak ditambahkan lagi agar alur rekonsiliasi
  deposit yang sama tidak sengaja ditagih dua kali. Engine, governance, audit
  dan recovery berada di tiga customRequest.

Pada Arden, tiga layar terakhir—Auction operations, Reports, Audit log—**hilang
karena batas 24 dan transform slice**. Fitur reports_dashboard tetap aktif dan
ditagih. Ini reproduksi batas kontrak saat ini, bukan klaim scope full version
muat dalam 24 layar. Karena ketiganya admin, subtotal contoh tidak berubah;
informasi delivery tetap hilang. Dengan urutan input lain, konten berbayar bisa
terpotong sehingga harga ikut berubah.

Custom requests bukan daftar seluruh keamanan/QA yang seharusnya dijual sebagai
add-on. Ia digunakan untuk menunjukkan batas cakupan katalog; baseline security
dan correctness tetap kewajiban delivery. Penjelasan seperti “atomik” diperlukan
di spesifikasi internal, tidak harus menjadi istilah yang dibaca calon klien.

## Ledger kalkulasi

Semua angka ID dalam rupiah; GLOBAL dalam dolar. Fitur included tidak ditagih
ulang. Penjelasan unit dan seluruh ID yang dipilih tersedia dalam lampiran.

| Proyek / region | Base | Extra pages | Fitur berbayar | Subtotal S | +40% desain | Pembulatan | P |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Tegak ID | 1.750.000 | 800.000 | 4.650.000 | 7.200.000 | 2.880.000 | +20.000 | 10.100.000 |
| Tegak GLOBAL | 650 | 300 | 1.720 | 2.670 | 1.068 | +12 | 3.750 |
| Lembar ID | 4.400.000 | 0 | 5.250.000 | 9.650.000 | 3.860.000 | −10.000 | 13.500.000 |
| Lembar GLOBAL | 2.200 | 0 | 1.915 | 4.115 | 1.646 | −11 | 5.750 |
| Kurohane ID | 3.500.000 | 800.000 | 3.350.000 | 7.650.000 | 3.060.000 | −10.000 | 10.700.000 |
| Kurohane GLOBAL | 1.600 | 300 | 1.255 | 3.155 | 1.262 | +8 | 4.425 |
| Arden ID | 10.000.000 | 600.000 | 8.100.000 | 18.700.000 | 7.480.000 | +20.000 | 26.200.000 |
| Arden GLOBAL | 5.000 | 225 | 2.955 | 8.180 | 3.272 | −2 | 11.450 |

| Proyek / region | P–PH tanpa diskon | Founding: total–totalHigh | Founding+promo20: total–totalHigh | Status baseline |
| --- | --- | --- | --- | --- |
| Tegak ID | 10.100.000–12.100.000 | 8.100.000–9.700.000 | 6.100.000–7.300.000 | range |
| Tegak GLOBAL | 3.750–4.500 | 3.000–3.600 | 2.250–2.700 | range |
| Lembar ID | 13.500.000–16.200.000 | 10.800.000–12.950.000 | 8.100.000–9.700.000 | range |
| Lembar GLOBAL | 5.750–6.900 | 4.600–5.525 | 3.450–4.150 | range |
| Kurohane ID | 10.700.000–12.850.000 | 8.550.000–10.300.000 | 6.400.000–7.750.000 | range |
| Kurohane GLOBAL | 4.425–5.300 | 3.550–4.250 | 2.675–3.200 | range |
| Arden ID | 26.200.000–31.450.000 | 20.950.000–25.150.000 | 15.700.000–18.850.000 | **discuss: semua angka internal** |
| Arden GLOBAL | 11.450–13.750 | 9.150–11.000 | 6.850–8.250 | range |

Rentang high tidak berarti ada pekerjaan tambahan yang dihitung. Misalnya
Arden GLOBAL PH $13.750 melewati max $12.000, tetapi status tetap range karena
hanya P $11.450 yang dibandingkan dengan max. Ketika content menjadi partial,
P naik di atas max dan status menjadi discuss.

| Proyek | Jam tambahan katalog | (base est_hours + tambahan) ×1,4, diagnostik | Workdays engine |
| --- | ---: | ---: | --- |
| Tegak | 100 | 184,8 jam | 31–37 hari kerja |
| Lembar | 94 | 243,6 jam | 40–52 hari kerja |
| Kurohane | 77 | 197,4 jam | 33–41 hari kerja |
| Arden | 158 | 473,2 jam | 66–94 hari kerja |

Kolom jam diagnostik bukan output Quote atau kalender delivery. Ia dipakai
untuk menelaah sumber selisih, karena base workdays dan base est_hours tidak
selalu berbanding tepat 6 jam/hari. Estimasi tidak mencakup jam customRequest.

## Sensitivitas yang dieksekusi

Angka berikut adalah total low setelah founding. Status tetap baseline kecuali
yang ditandai. Semuanya memakai Plan yang sama; hanya Choices berubah.

| Kasus | Tegak ID / USD | Lembar ID / USD | Kurohane ID / USD | Arden ID / USD |
| --- | --- | --- | --- | --- |
| Baseline full_custom+ready | Rp8,10 jt / $3.000 | Rp10,80 jt / $4.600 | Rp8,55 jt / $3.550 | internal Rp20,95 jt / $9.150 |
| semi_custom+ready | Rp6,90 jt / $2.550 | Rp9,30 jt / $3.950 | Rp7,35 jt / $3.025 | internal Rp17,95 jt / $7.850 |
| full_custom+partial | Rp8,90 jt / $3.275 | Rp11,90 jt / $5.050 | Rp9,45 jt / $3.875 | internal Rp23,05 jt / **internal $10.075 (discuss)** |

Menghapus seluruh customRequests tidak mengubah low, high, atau timeline;
hanya range menjadi fixed. Arden ID tetap discuss. Arden GLOBAL bisa berubah
menjadi **fixed $9.150** hanya dengan menghilangkan tiga deskripsi custom,
meskipun requirement bisnis lelang belum berubah. Ini merupakan uji kegagalan
representasi scope, bukan klaim model live pasti melakukan hal tersebut.

## Pemeriksaan aktual dan keterbatasan

- Delapan kalkulasi baseline asli selesai; assertion ledger sum = P,
  P−savings = total, no-discount total = P, dan locale EN/ID tidak mengubah
  total lulus (32 assertion). Skenario tambahan pada lampiran juga dieksekusi.
- `region:'JP'` ditolak schema, sesuai daftar region yang hanya ID/GLOBAL.
- Probe satu halaman company_profile + copywriting, full_custom+none+rush:
  S Rp1,9 juta, multiplier efektif **2,268**, P Rp4,3 juta. Copywriting
  Rp150.000 tetap ditagih. Jadi cap multiplier dan dedup copywriting dalam
  prose JSON tidak berlaku di engine.
- `npm run test`: **53 lulus, 4 gagal (57 total, 2 file)**. Tidak ada perubahan
  aplikasi atau test sebelum command; kegagalan adalah baseline checkout ini.
- Tidak menjalankan build/check/browser: perubahan hanya Markdown, dan tidak
  ada klaim verifikasi UI, email, provider, deployment atau kualitas AI live.

| Test gagal | Ekspektasi test | Hasil source aktual |
| --- | --- | --- |
| GLOBAL LMS reference case | 5.000–6.000 | 5.025–6.025 |
| Anchor Tegak ID, 5 halaman/fitur terbatas | Rp5.000.000 | Rp4.850.000 |
| Anchor Tegak GLOBAL yang sama | $1.900 | $1.825 |
| Booking GLOBAL, 2 extra pages + map | $1.450 | $1.775 |

Anchor Tegak test **bukan** versi lengkap Tegak tahap 1: tanpa CMS/blog/lead
workflow yang ditetapkan di riset ini. Jangan memakai angka Rp4,85 juta untuk
menyimpulkan full version dapat selesai pada harga itu.

## Lampiran A — Harga fitur yang digunakan

T=Tegak, L=Lembar, K=Kurohane, A=Arden; `(inc)` berarti sudah dalam paket,
tidak menambah fee atau jam. Semua fitur di tabel ini satu kali per proyek;
tidak ada item quantity atau per-page feature dalam baseline.

| ID fitur | Jam | IDR | USD | Digunakan |
| --- | ---: | ---: | ---: | --- |
| `whatsapp_button` | 0 | 0 | 0 | T |
| `google_maps` | 1 | 50.000 | 25 | T, K |
| `contact_form` | 3 | 150.000 | 60 | T, K (inc), A |
| `newsletter` | 3 | 150.000 | 60 | L |
| `multi_step_form` | 8 | 450.000 | 160 | A |
| `email_notifications` | 6 | 350.000 | 120 | L, K (inc), A |
| `gallery` | 3 | 150.000 | 60 | T, K |
| `custom_animation` | 10 | 600.000 | 225 | T, L, K, A |
| `blog_section` | 12 | 650.000 | 240 | T, A |
| `portfolio_filter` | 8 | 450.000 | 160 | T, K |
| `search` | 6 | 350.000 | 120 | L, A |
| `events_calendar` | 8 | 450.000 | 160 | A |
| `analytics` | 2 | 100.000 | 40 | T |
| `seo_basic` | 6 | 350.000 | 125 | T, L, K, A |
| `user_login` | 16 | 900.000 | 325 | L, A (inc) |
| `roles_permissions` | 12 | 650.000 | 240 | T, L, K, A |
| `member_area` | 12 | 650.000 | 240 | A |
| `cms_admin` | 16 | 900.000 | 325 | T, L (inc), K (inc), A (inc) |
| `reports_dashboard` | 16 | 900.000 | 325 | A |
| `data_export` | 4 | 200.000 | 80 | L, A |
| `file_upload` | 6 | 350.000 | 120 | T, A |
| `payment` | 20 | 1.100.000 | 400 | L (inc), A |
| `product_catalog` | 12 | 650.000 | 240 | L (inc), A |
| `shopping_cart` | 16 | 900.000 | 325 | L (inc) |
| `product_variants` | 8 | 450.000 | 160 | L |
| `shipping_calculator` | 10 | 550.000 | 200 | L |
| `discount_voucher` | 8 | 450.000 | 160 | L |
| `booking_calendar` | 20 | 1.100.000 | 400 | K (inc) |
| `booking_reminder` | 4 | 200.000 | 80 | K |
| `multi_staff_schedule` | 12 | 650.000 | 240 | K |
| `spam_protection` | 2 | 100.000 | 40 | T, L, K, A |
| `legal_pages` | 3 | 150.000 | 60 | T, L, K, A |

## Lampiran B — Reproduksi tanpa mengubah aplikasi

Jalankan dari root repository dengan dependency yang sudah terpasang.
Salin blok berikut ke `/tmp/skyland-pricing-research-20261008/simulate.mjs`
(buat direktorinya dahulu), lalu jalankan:

```sh
node /tmp/skyland-pricing-research-20261008/simulate.mjs
```

Script memakai source pada checkout aktif. Hasil hanya identik bila katalog
dan engine belum berubah. Output JSON sementara berisi fixture/quote publik,
tidak memuat environment atau kredensial. Semua pilihan input tersimpan di
blok di bawah sehingga reproduksi tidak bergantung berkas `/tmp` sesi ini.

```js
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const { createServer } = await import(pathToFileURL(root + '/node_modules/vite/dist/node/index.js'));
const server = await createServer({root, configFile:false, envDir:'/tmp/skyland-pricing-research-20261008', server:{middlewareMode:true}, appType:'custom'});
try {
const {quote, contentPages, quotePriceText} = await server.ssrLoadModule('/src/lib/pricing.ts');
const {PlanSchema, ChoicesSchema} = await server.ssrLoadModule('/src/lib/schemas.ts');
const data=JSON.parse(fs.readFileSync('data/pricing.json','utf8'));
const specs = [
 {id:'tegak', service:'company_profile',
 content:['home:Home','about:About','services:Services','service_detail:Service detail','custom:Capabilities','custom:Certifications','custom:Coverage','contact:Contact','custom:Careers'],
 screens:['legal:Privacy and terms','project_list:Projects','project_detail:Project detail','blog_list:Insights','article:Article','manage_content:Content','custom_admin:Projects and services','custom_admin:Leads','custom_admin:Staff'],
 features:'whatsapp_button google_maps contact_form gallery custom_animation blog_section portfolio_filter cms_admin file_upload roles_permissions seo_basic analytics spam_protection legal_pages',
 custom:['Interactive coverage map','Lead workflow and scoped CMS models']},
 {id:'lembar', service:'online_store',
 content:['home:Home','about:About','contact:Contact','faq:FAQ','custom:Shipping and returns'],
 screens:['legal:Privacy and terms','product_list:Books and collections','product_detail:Book detail','cart:Cart','checkout:Checkout and status','search_results:Search','login:Login','account:Account','my_orders:Orders','custom_member:Wishlist','manage_products:Products','orders:Orders admin','manage_content:Content','custom_admin:Coupons','custom_admin:Customers','custom_admin:Imports and refunds'],
 features:'payment cms_admin product_catalog shopping_cart product_variants shipping_calculator discount_voucher user_login search newsletter email_notifications roles_permissions data_export seo_basic spam_protection legal_pages custom_animation',
 custom:['Wishlist and preorder rules','CSV import, fulfilment tracking and refund exceptions']},
 {id:'kurohane', service:'booking_reservation',
 content:['home:Home','about:Philosophy','custom:First visit','contact:Access','faq:FAQ','services:Menu','team:Barbers','custom:Style gallery'],
 screens:['legal:Privacy and cancellation','booking:Book and confirm','custom:Manage guest booking','manage_bookings:Booking calendar','manage_content:Content','custom_admin:Staff and shifts','custom_admin:Customers','custom_admin:Service rules','custom_admin:Notifications'],
 features:'contact_form cms_admin booking_calendar email_notifications multi_staff_schedule booking_reminder roles_permissions gallery portfolio_filter google_maps seo_basic spam_protection legal_pages custom_animation',
 custom:['Guest manage link and booking exceptions','Atomic scheduling, nomination rules and customer notes']},
 {id:'arden', service:'custom_web_app',
 content:['home:Home','about:About','custom:How to buy','custom:How to sell','services:Corporate services','contact:Contact','custom:Trust','faq:FAQ'],
 screens:['legal:Privacy and terms','product_list:Lots','product_detail:Lot documents and inspection','events:Events and calendar','custom:Auction results','blog_list:Insights','article:Insight','search_results:Search','login:Register and login','account:Account','custom_member:Bid room and history','custom_member:Watchlist and alerts','manage_products:Lots and events','manage_content:Content','custom_admin:Bidder approval','custom_admin:Deposits and refunds','custom_admin:Auction operations','reports:Reports','custom_admin:Audit log'],
 features:'user_login cms_admin product_catalog search events_calendar blog_section member_area roles_permissions file_upload payment email_notifications reports_dashboard data_export contact_form multi_step_form seo_basic spam_protection legal_pages custom_animation',
 custom:['Auction engine and race-safe closing','Eligibility, deposit and document governance','Audit, recovery and operational controls']}
];
const make = s => PlanSchema.parse({serviceId:s.service,projectName:s.id,summary:'Manual full-scope pricing fixture; see research document 01',audience:'',business:'',flows:[],styles:[],pages:[...s.content,...s.screens].map(x=>{const [type,name]=x.split(':');return {type,name,purpose:'Scope fixture',sections:[],covers:[]}}),features:s.features.split(' ').map(id=>({id,reason:'Explicit baseline scope',quantity:1})),suggestions:[],customRequests:s.custom.map(name=>({name,description:'Not fully bounded by current catalog'})),questions:[],assumptions:[]});
const out=[];
for(const s of specs){const p=make(s);for(const region of ['ID','GLOBAL']){
 const c=ChoicesSchema.parse({region,design:'full_custom',content:'ready',timeline:'normal',promoCode:''});
 const q=quote(p,c,'id',data);
 const no=quote(p,c,'id',{...data,founding_offer:{...data.founding_offer,active:false}});
 const promo=quote(p,c,'id',data,{code:'RESEARCH_ONLY',percent:20});
 const omitted=quote({...p,customRequests:[]},c,'id',data);
 const semi=quote(p,{...c,design:'semi_custom'},'id',data);
 const partial=quote(p,{...c,content:'partial'},'id',data);
 assert.equal(q.lines.reduce((a,x)=>a+x.amount,0),q.price);
 assert.equal(q.price-q.savings,q.total);
 assert.equal(quote(p,c,'en',data).total,q.total);
 assert.equal(no.total,q.price);
 const svc=data.services.find(x=>x.id===s.service);
 const extraHours=Math.max(0,q.pagesCount-svc.pages_included)*data.extra_page.est_hours + p.features.reduce((a,f)=>a+(svc.includes?.includes(f.id)?0:data.features.find(x=>x.id===f.id).est_hours),0);
 out.push({id:s.id,region,inputPages:s.content.length+s.screens.length,parsedPages:p.pages.length,dropped:[...s.content,...s.screens].slice(p.pages.length),content:contentPages(p,data).map(x=>x.name),extraHours,catalogHours:(svc.est_hours+extraHours)*1.4,q,noDiscount:{low:no.total,high:no.totalHigh},promo:{low:promo.total,high:promo.totalHigh},omitted:{total:omitted.total,status:omitted.status},semi:{total:semi.total,high:semi.totalHigh,status:semi.status},partial:{total:partial.total,high:partial.totalHigh,status:partial.status},headline:quotePriceText(q)});
}}
const tiny=PlanSchema.parse({serviceId:'company_profile',projectName:'probe',summary:'',audience:'',pages:[{type:'home',name:'Home',purpose:'',sections:[]}],features:[{id:'copywriting',reason:'',quantity:1}],suggestions:[],customRequests:[],questions:[],assumptions:[]});
const probe=quote(tiny,{region:'ID',design:'full_custom',content:'none',timeline:'rush',promoCode:''},'id',data);
const discountOnly=quote({...tiny,features:[]},{region:'ID',design:'template',content:'ready',timeline:'normal',promoCode:''},'id',data);
const jp=ChoicesSchema.safeParse({region:'JP',design:'full_custom',content:'ready',timeline:'normal',promoCode:''});
const result={specs,out,probe,discountOnly,jpAccepted:jp.success};
fs.writeFileSync('/tmp/skyland-pricing-research-20261008/results.json',JSON.stringify(result,null,2));
for(const x of out) console.log(JSON.stringify({id:x.id,region:x.region,pages:[x.inputPages,x.parsedPages,x.q.pagesCount],extraHours:x.extraHours,catalogHours:x.catalogHours,subtotal:x.q.subtotal,price:x.q.price,priceHigh:x.q.priceHigh,total:x.q.total,high:x.q.totalHigh,status:x.q.status,days:x.q.workdays,promo:x.promo,omitted:x.omitted,semi:x.semi,partial:x.partial,dropped:x.dropped}));
console.log('PROBES',JSON.stringify({jpAccepted:jp.success,compound:1.4*1.2*1.35,probePrice:probe.price,probeSubtotal:probe.subtotal,copyLine:probe.lines.find(x=>x.label==='Penulisan teks'),copyFeatureCharged:probe.lines.filter(x=>x.kind==='feature'),discountOnly:discountOnly.total}));
} finally {await server.close()}
```
