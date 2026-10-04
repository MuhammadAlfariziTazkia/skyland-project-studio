# Domain, katalog, dan mesin harga

## Sumber dan tipe

`data/pricing.json` memuat katalog numerik; `src/i18n/catalog.ts` memuat nama dan
penjelasan EN/ID; `src/lib/schemas.ts` membentuk kontrak input/output; dan
`src/lib/pricing.ts` menjalankan aturan. Test menghubungkan keempatnya agar
ID baru tidak kehilangan copy, kategori, atau referensi paket.

`$schema_version: 2.1.0` adalah metadata file data, bukan versi HTTP API atau
schema JSON yang otomatis divalidasi. Beberapa field prose legacy tidak dipakai
runtime; lihat [status proyek](PROJECT_STATUS.md).

## Model konsultasi

| Model | Field penting | Makna |
| --- | --- | --- |
| `Plan` | serviceId, projectName, business, summary, audience | Website klien yang direkomendasikan |
| `Flow` | who, does | Kemampuan pengguna website klien; actor visitor/member/owner |
| `Page` | type, name, area, feature, covers, purpose, sections | Satu layar/URL, dengan blok konten di dalamnya |
| `Feature` di Plan | id, reason, quantity | Item katalog yang aktif atau masih suggestion |
| `CustomRequest` | name, description | Kebutuhan yang tidak terwakili katalog |
| `Question` | question, options[].label/add/remove | Jawaban yang mengaktifkan/menonaktifkan ID fitur |
| `Choices` | region, design, content, timeline, promoCode | Pilihan harga dari klien, tidak ditentukan AI |
| `Mockup` | brandName, accent, nav, hero, highlights, sections, footerNote | Konten terstruktur untuk homepage konsep |
| `Contact` | name, email, whatsapp, company, notes, consent | Data order; consent harus true |
| `Quote` | status, lines, price, total, discounts, workdays | Hasil hitungan, bukan record database |

`flows[].who` adalah aktor; `pages[].covers` adalah indeks 0-based ke array flow.
AI diarahkan menutup seluruh flow, tetapi Zod tidak memeriksa cakupan/relasi
secara menyeluruh. `features` aktif, `suggestions` tidak dihitung selama belum
dipindahkan ke features. `customRequests` mengubah status quote, bukan menambah
biaya spesifik yang sudah diketahui.

## Halaman, section, dan visibility

`page_types` mendefinisikan 36 jenis halaman. Bila `type` valid, `PageSchema`
menurunkan `area` dan `feature` dari katalog, menimpa nilai yang dikirim caller.
Plan lama tanpa type masih memakai field/default area dan feature.

- **Content page**: public tanpa feature, misalnya home/about/contact. Satu-satunya
  jenis yang dihitung terhadap kuota paket dan biaya halaman tambahan.
- **Feature page**: public dengan feature, misalnya product detail, cart, article.
  Harga sudah di fitur; halaman muncul hanya saat fitur aktif.
- **Member/admin screen**: mengikuti fitur dan tidak dibebankan sebagai halaman konten.
- **Section**: blok dalam halaman, seperti cerita singkat, lokasi, testimoni;
  tidak menambah hitungan halaman.
- **Template page**: detail produk/artikel/materi dihitung satu layar jenis
  template, bukan satu per produk/artikel.

Helpers yang dipakai bersama:

```text
activeFeatureIds = plan.features ∪ service.includes
visiblePages    = halaman yang dapat tampil dengan fitur aktif
publicPages     = visiblePages dengan area public
contentPages    = publicPages tanpa feature
```

Member tanpa feature mempunyai fallback `user_login`/`member_area`; admin tanpa
feature fallback `cms_admin`. Untuk type baru gunakan mapping eksplisit agar
perilaku tidak bergantung fallback. Feature dimatikan berarti halaman terkait
tersembunyi dari UI/email, bukan dihapus dari array Plan; mengaktifkan kembali
bisa memunculkan halaman yang tersimpan. Manual toggle tidak menciptakan
halaman baru yang belum ada.

Fitur dalam `includes` paket selalu aktif. Memindahkannya ke suggestions tidak
menghapus inclusion paket dan tidak membuat paket lebih murah.

## Snapshot paket default

Angka berikut sebelum multiplier/diskon. Gunakan JSON untuk angka terbaru.

| ID | Base IDR | Base USD | Halaman konten | Hari kerja dasar |
| --- | ---: | ---: | ---: | --- |
| company_profile | 1.750.000 | 650 | 5 | 5–9 |
| landing_page | 900.000 | 325 | 1 | 2–4 |
| online_store | 4.400.000 | 1.600 | 6 | 12–21 |
| personal_portfolio | 1.100.000 | 400 | 4 | 3–6 |
| online_course | 6.600.000 | 2.400 | 7 | 18–30 |
| booking_reservation | 3.500.000 | 1.275 | 5 | 10–16 |
| custom_web_app | 10.000.000 | 3.600 | 6 | 20–40 |
| blog_media | 2.200.000 | 800 | 5 | 6–10 |

| Paket dengan inclusion | ID fitur gratis di paket tersebut |
| --- | --- |
| online_store | payment, cms_admin, product_catalog, shopping_cart |
| online_course | user_login, cms_admin, course_player, progress_tracking |
| booking_reservation | contact_form, cms_admin, booking_calendar, email_notifications |
| custom_web_app | user_login, cms_admin |
| blog_media | cms_admin, blog_section, search |

Katalog fitur: 55 item dalam contact, content, marketing, accounts, admin,
commerce, booking, learning, integration, trust. Item tanpa unit adalah biaya
satu kali per proyek; `unit: page` dikali **contentPages**; `unit: item` dikali
quantity 1–10. Duplicate ID fitur hanya dihitung pertama kali.

## Formula runtime yang presisi

`quote(plan, choices, locale, data?, promo?)` tidak menjalankan parsing Zod
sendiri. API terlebih dahulu memparse body; UI menjaga shape Plan melalui
state/callback. Caller baru harus mempertahankan kontrak input.

1. `pagesCount = contentPages(plan).length`.
2. `extraPages = max(0, pagesCount - service.pages_included)`.
3. `subtotal = service.base[region] + extraPages × extra_page.price[region] +
   featureCost`. Extra page default Rp200.000 / $75, 4 jam per halaman.
4. Inclusion paket dihitung Rp0/$0; fitur aktif lain mengikuti unit/quantity.
   Suggestions tidak dihitung. Engine mencatat jam tambahan dari extra pages
   dan fitur yang tidak included.
5. Terapkan multiplier berurutan **design → content → timeline**. Untuk tiap
   multiplier: `adjust = Math.round(running × (value - 1))`, lalu tambahkan ke
   running. Karena adjustment dibulatkan tiap langkah, gunakan engine sebagai
   otoritas, bukan kalkulasi float baru di UI.
6. `price = Math.round(running / round_to) × round_to`, kemudian minimal region.
   Ini pembulatan terdekat, bukan selalu pembulatan ke atas.
7. `priceHigh = roundTo(price × range_upper)`; default range_upper 1,2.
8. Tentukan status menggunakan **price sebelum diskon**: di atas max → discuss;
   selain itu ada customRequests → range; selebihnya fixed.
9. Terapkan diskon dan batas minimum ke masing-masing price/priceHigh.
   `total = price - savings`, `totalHigh` dihitung tersendiri.

| Region | Currency | Round step | Minimum total | Maksimum price otomatis |
| --- | --- | ---: | ---: | ---: |
| ID | IDR | 50.000 | 750.000 | 22.000.000 |
| GLOBAL | USD | 25 | 250 | 9.000 |

Region dari `Choices.region`; locale hanya memilih bahasa label. Tidak ada
konversi mata uang atau deteksi region AI di engine saat ini.

## Multiplier dan timeline

| Pilihan | Value harga | Pengaruh khusus waktu |
| --- | --- | --- |
| template / semi_custom / full_custom | 1 / 1,2 / 1,45 | Value yang sama menaikkan effort |
| ready / partial / none | 1 / 1,1 / 1,25 | Value yang sama menaikkan effort |
| normal / priority / rush | 1 / 1,25 / 1,5 | time_factor 1 / 0,7 / 0,5 |

```text
extraDays = ceil(total jam tambahan / 6)
effort = multiplier design × multiplier content
days(dasar) = max(1, ceil((dasar + extraDays) × effort × time_factor))
```

Waktu paket sudah mencakup fitur included. Base est_hours bukan dihitung ulang
untuk timeline; engine memakai rentang workdays paket. Estimasi tidak memiliki
kalender tanggal, kapasitas pemilik, hari libur, atau jam antrean.

## Status dan output

| Status | Trigger | Tampilan harga | Follow-up |
| --- | --- | --- | --- |
| fixed | Scope katalog dan price <= max | `total` satu angka | Konfirmasi scope |
| range | Ada customRequests, price <= max | `total`–`totalHigh` | Diskusi kebutuhan custom |
| discuss | price > max | Tidak tampil angka utama | Scoping manual |

`Quote.lines` memiliki kind base/pages/feature/adjust. Jumlah amount baris sama
dengan price sebelum diskon; discounts terpisah. `featuresCount` menghitung ID
unik di plan.features, bukan seluruh implicit inclusion. `pagesCount` adalah
halaman konten, bukan seluruh public/member/admin screens. `validDays` default 14.

Status discuss tidak menghapus angka dari objek Quote; helper `quotePriceText`
mengembalikan string kosong. API order masih mengirim numeric total. Jangan
menganggap angka internal discuss otomatis merupakan harga final ke klien.

## Diskon

`PRICING = withEnv(raw, publicOverrides)` mengoverride percent, spots_total,
spots_taken, dan max_discount_percent. Helper harga dan badge marketing memakai
nilai effective yang sama. Override invalid/negatif/kosong kembali ke default.
PUBLIC env di-inline Vite saat build; menggantinya perlu rebuild/redeploy.

Founding aktif jika flag active, percent >0, dan slot tersisa. Default 20% /
5 slot / 0 terpakai. Slot tidak terisi otomatis saat order, karena order belum
berarti deal. Pemilik menaikkan taken secara manual setelah deal.

Kode promo berada di env server `PROMO_CODES`, dinormalisasi trim + uppercase +
hapus whitespace, lalu dicari ulang saat order. `choices.promoCode` sendiri
tidak mengubah hasil quote; argument `promo` yang sudah divalidasi diperlukan.

Diskon founding lalu promo memakai persentase **aditif** dari harga asli,
dibatasi cap default 40%. Founding mendapat jatah cap lebih dahulu. Masing-masing
amount dibulatkan ke round step, lalu dibatasi room di atas minimum region.
`savingsPercent` melaporkan penghematan riil dibulatkan ke integer, sehingga
tidak selalu sama dengan penjumlahan label percent.

## Contoh yang teruji

- Company profile 5 halaman, template, konten ready, waktu normal, tanpa fitur
  tambahan: Rp1.750.000 normal, Rp1.400.000 dengan founding default, Rp1.050.000
  dengan founding 20% + promo 20%.
- Anchor Tegak: company profile 5 halaman, gallery/contact_form/custom_animation/
  seo_basic/analytics/google_maps/whatsapp_button, full_custom + partial + normal:
  subtotal Rp3.150.000 → price Rp5.000.000 → founding Rp4.000.000.
  Versi GLOBAL subtotal $1.185 → price $1.900.
- Tiga halaman konten ditambah product_list/product_detail/cart/checkout hanya
  memakai kuota **3** halaman. Biaya katalog dan cart ada di fitur, bukan empat
  extra pages.

Empat `reference_cases` divalidasi oleh test dengan susunan Plan/Choices yang
ditulis di test. Mengubah description saja tidak mengubah input test otomatis.
Rate basis Rp55.000/$20 per jam adalah panduan penentuan tabel dan diuji dengan
toleransi rasio fitur; mengubah hourly_rate saja tidak memperbarui base/price.

## ID penawaran dan biaya lain

`quoteId()` memakai HMAC-SHA256 dari JSON `{plan, choices, total, status}` dengan
QUOTE_SECRET, mengambil 8 hex pertama dan menambahkan prefix SKY. Referensi
bersifat deterministik untuk payload sama, bukan ID database/nomor urut.
Ia tidak membawa timestamp, expiry, atau pemeriksaan tanda tangan quote lama.
Masa berlaku 14 hari saat ini berupa janji bisnis, bukan enforcement API.

Hosting/domain di not_included dan maintenance di recurring ditampilkan
terpisah; tidak ditambahkan ke total pembangunan. Default pembayaran 0/100
dibaca oleh copy/legal/email, bukan diproses sebagai transaksi di aplikasi.
