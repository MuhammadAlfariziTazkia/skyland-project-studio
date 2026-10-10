# Domain, katalog, dan mesin harga

## Sumber dan tipe

`data/pricing.json` memuat katalog numerik; `src/i18n/catalog.ts` memuat nama dan
penjelasan EN/ID; `src/lib/schemas.ts` membentuk kontrak input/output; dan
`src/lib/pricing.ts` menjalankan aturan. Test menghubungkan keempatnya agar
ID baru tidak kehilangan copy, kategori, atau referensi paket.

`$schema_version: 3.0.0` adalah metadata file data, bukan versi HTTP API atau
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

`page_types` mendefinisikan 37 jenis halaman. Bila `type` valid, `PageSchema`
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

`manage_booking` adalah layar publik yang dibawa `booking_calendar`: pelanggan
tamu membuka booking-nya lewat tautan aman tanpa login. Sebelum type ini ada,
layar itu harus memakai type `custom` sehingga **ditagih sebagai halaman konten**,
padahal secara domain ia bagian dari fitur booking. Gunakan mapping eksplisit
seperti ini untuk layar fungsional baru, bukan `custom`.

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
Setiap `base` = `est_hours x pricing_basis.hourly_rate[region]`, dibulatkan ke
`regions[].round_to`, dan itu **diuji sebagai invariant**: mengubah `est_hours`
tanpa meregenerasi harga menggagalkan `tests/pricing.test.ts`.

| ID | Jam | Base IDR | Base JPY | Base USD | Halaman | Hari kerja | design_share | risk_tier |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| company_profile | 24 | 2.250.000 | 75,000 | 650 | 5 | 5-9 | 0.75 | standard |
| landing_page | 12 | 1.100.000 | 40,000 | 325 | 1 | 2-4 | 0.85 | standard |
| online_store | 85 | 7.900.000 | 270,000 | 2300 | 6 | 12-21 | 0.35 | elevated |
| personal_portfolio | 16 | 1.500.000 | 50,000 | 425 | 4 | 3-6 | 0.80 | standard |
| online_course | 95 | 8.850.000 | 300,000 | 2575 | 7 | 18-30 | 0.35 | elevated |
| booking_reservation | 92 | 8.550.000 | 290,000 | 2475 | 5 | 10-16 | 0.35 | elevated |
| custom_web_app | 130 | 12.100.000 | 410,000 | 3500 | 6 | 20-40 | 0.30 | review |
| blog_media | 30 | 2.800.000 | 95,000 | 800 | 5 | 6-10 | 0.60 | standard |

`design_share` adalah porsi base yang benar-benar kerja desain; hanya porsi itu
yang disentuh pengali desain/konten. `risk_tier: review` berarti paket itu
**tidak pernah** mendapat status fixed otomatis.

| Paket dengan inclusion | ID fitur gratis di paket tersebut |
| --- | --- |
| online_store | payment, cms_admin, product_catalog, shopping_cart |
| online_course | user_login, cms_admin, course_player, progress_tracking |
| booking_reservation | contact_form, cms_admin, booking_calendar, email_notifications |
| custom_web_app | user_login, cms_admin |
| blog_media | cms_admin, blog_section, search |

Fitur dalam `includes` paket selalu aktif. Memindahkannya ke suggestions tidak
menghapus inclusion paket dan tidak membuat paket lebih murah.

Katalog fitur: 55 item dalam contact, content, marketing, accounts, admin,
commerce, booking, learning, integration, trust. Item tanpa unit adalah biaya
satu kali per proyek; `unit: page` dikali **contentPages**; `unit: item` dikali
quantity 1–10. Duplicate ID fitur hanya dihitung pertama kali. Setiap fitur
punya `design_bearing`; hanya yang `true` disentuh pengali desain/konten.

## Formula runtime yang presisi

`quote(plan, choices, locale, data?, promo?)` tidak menjalankan parsing Zod
sendiri. API terlebih dahulu memparse body; UI menjaga shape Plan melalui
state/callback. Caller baru harus mempertahankan kontrak input.

1. `pagesCount = contentPages(plan).length`.
2. `extraPages = max(0, pagesCount - service.pages_included)`.
3. `subtotal = service.base[region] + extraPages x extra_page.price[region] +
   featureCost`.
4. Inclusion paket dihitung Rp0; fitur aktif lain mengikuti unit/quantity.
   Suggestions tidak dihitung. `copywriting` **tidak** ditagih saat
   `content: 'none'`, karena pengali konten sudah mencakup penulisan.
5. **Pisahkan subtotal menjadi dua bagian.** `designPart` =
   `base x service.design_share` + seluruh biaya halaman tambahan + fitur dengan
   `design_bearing: true` (kategori `content` dan `marketing`). Sisanya flat.
6. Pengali **desain** dan **konten** hanya menyentuh `designPart`; masing-masing
   `adjust = round(runningDesign x (value - 1))`, lalu ditambahkan ke keduanya.
   Pengali **timeline** menyentuh seluruh running, karena ia premi kapasitas.
7. Terapkan `calculation.max_multiplier` sebagai batas nyata: bila
   `running > subtotal x max_multiplier`, tambahkan baris `cap` yang menurunkannya.
8. `price = round(running / round_to) x round_to`, kemudian minimal region.
9. `priceHigh = roundTo(price x range_upper)`.
10. **Status ditentukan risiko lebih dulu, nominal kemudian** (lihat di bawah).
11. Terapkan **satu** diskon terbesar yang berlaku; tidak menumpuk; tidak di
    pasar yang ada di `discount_policy.no_discount_markets`.

Karena `est_hours` dan harga katalog mengasumsikan `semi_custom`, nilai pengali
desain adalah `template 0,9 / semi_custom 1,0 / full_custom 1,15`. Sebelumnya
`full_custom 1,4` menaikkan **seluruh** subtotal, sehingga desain custom
menaikkan harga payment gateway dan role matrix.

## Scope konsep (pintu masuk kedua)

`src/lib/samples/specs.ts` memegang scope tiap konsep studio sebagai satu sumber
kebenaran: halaman konsep, mesin harga, dan test kalibrasi membacanya. Tidak ada
jalur harga kedua — semuanya tetap lewat `quote()`.

| Field `SampleSpec` | Arti |
| --- | --- |
| `serviceId` | Paket di `pricing.json` |
| `theme`, `design` | Preset, supaya klien tidak ditanya |
| `contentPages` | Halaman publik tanpa fitur: satu-satunya yang ditagih |
| `featurePages` | Layar yang dibawa fitur; muncul hanya saat fiturnya aktif |
| `features[].need` | `core` = sektornya tidak bisa jalan tanpanya, `nice` = benar-benar opsional |
| `notOffered` | Kemampuan yang sengaja di luar scope, ditampilkan ke klien |
| `caveats` | Hal yang harus klien tahu sebelum memesan |

Helper di `src/lib/samples/plan.ts`:

- `toPlan(spec, selected, locale)` — fitur terpilih menjadi `features`, sisanya
  `suggestions`, persis seperti `PlanStep` saat klien mematikan satu toggle.
- `orderedFeatures(spec, region)` — **urut menurut kebutuhan dulu, lalu harga
  menaik.** Itu menghasilkan keempat tier pemilik (dibutuhkan+murah →
  dibutuhkan+mahal → opsional+murah → opsional+mahal) tanpa ambang "murah" yang
  dikarang, dan menaruh pekerjaan bernilai tinggi berbiaya rendah di puncak daftar.
- `planKey(plan)` — **dipakai bersama `Consultant.tsx`.** Layar hasil memakai ini
  sebagai cache key mockup; kalau keduanya berbeda, state yang di-seed halaman
  konsep akan dianggap basi dan memanggil `/api/mockup` yang tidak perlu.

Harga esensial sengaja di bawah scope penuh: esensial adalah harga masuk, dan
target fee di [riset 01](PRICING_RESEARCH_01_MARKET.md) adalah scope v1 penuh.
Test menjaga keduanya: scope penuh dalam 10% target, dan esensial di atas 60%
scope penuh supaya bukan harga umpan.

| Konsep | Paket | Esensial ID | Scope penuh ID | Selisih |
| --- | --- | ---: | ---: | ---: |
| Tegak | company_profile | Rp5,45 jt | Rp6,80 jt | +25% |
| Lembar | online_store | Rp10,10 jt | Rp13,20 jt | +31% |
| Kurohane | booking_reservation | Rp11,25 jt | Rp12,80 jt | +14% |
| Arden | company_profile | Rp7,45 jt | Rp10,85 jt | +46% |

Lembar berstatus `range`, bukan `fixed`, karena `payment` bertier elevated.

### Ketergantungan pihak ketiga

Fitur dengan `external_dependency: true` menuntut akun atau langganan pihak
ketiga. Studio ini satu orang dan menjual sekali beli putus, jadi scope konsep
**tidak memakainya** kecuali `payment`, yang juga ditandai `crucial` karena toko
tidak bisa menerima uang tanpanya. Konsekuensi nyata: Lembar tidak memakai
`shipping_calculator`, sehingga ongkir memakai tarif flat/zona yang diatur di
panel admin — dan itu ditulis sebagai `caveat` di halamannya.

## Gate risiko

`quote()` mengembalikan `risk: { blocking, elevated, truncated }`.

| Pemicu | Sumber | Akibat |
| --- | --- | --- |
| Kata kunci domain yang ditolak | `blocking_domains` dicocokkan ke teks Plan | `discuss` |
| `service.risk_tier: 'review'` | `custom_web_app` | `discuss` |
| `plan.scopeTruncated` | input melebihi `MAX_PAGES` 24 | `discuss` |
| `price > max_price` | batas pasar | `discuss` |
| `feature.risk_tier: 'elevated'` | payment, api_integration, dll | `range` |
| `customRequests` tidak kosong | plan | `range` |

`blockingDomains()` mencocokkan `projectName`, `summary`, `business`, `audience`,
nama flow, nama halaman, dan customRequests. Pencocokan **sengaja longgar**:
salah menahan harga berarti satu percakapan tambahan, salah memberi harga pasti
berarti proyek yang tidak bisa dikerjakan.

**Kecuali untuk lelang, yang dipersempit 10 Okt 2026.** Kata kunci dulu memuat
`lelang`, `auction`, dan `bid` tunggal, sehingga situs **katalog** untuk rumah
lelang ikut terblokir — padahal itu pekerjaan yang sah dijual dan kini menjadi
konsep Arden. Kata kuncinya sekarang menyebut mekanismenya (`bidding online`,
`live bidding`, `proxy bid`, `penawaran real-time`, …), jadi mesin penawaran
tetap ditolak sementara katalognya lolos. Keduanya diuji.

Status **tidak** membaik karena label custom dihapus, desain diturunkan, pasar
diganti, atau promo berubah. Sebelumnya menghapus tiga customRequest mengubah
Arden GLOBAL menjadi `fixed $9.150` tanpa perubahan kebutuhan bisnis apa pun.


| Pasar | Currency | Round harga | Round katalog | Minimum | Maksimum otomatis | Tarif/jam |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| ID | IDR | 50,000 | 25,000 | 750,000 | 20,000,000 | 93,000 |
| JP | JPY | 5,000 | 1,000 | 30,000 | 700,000 | 3,150 |
| GLOBAL | USD | 25 | 5 | 250 | 6,000 | 27 |

Batas minimum/maksimum ditetapkan **per pasar**, bukan dikonversi dari kurs.
Sebelumnya `ID.max_price` Rp22 juta setara sekitar $1.229 sementara GLOBAL $12.000,
sehingga scope yang sama bisa `discuss` di ID dan `range` di GLOBAL. Lihat
[riset harga 03](PRICING_RESEARCH_03_EVALUATION.md).

Pasar **dideteksi dari perangkat**, bukan ditanyakan. `marketFromClient()` di
`src/lib/pricing.ts` membaca pilihan tersimpan (`localStorage['skyland-market']`),
lalu timezone (`Asia/Tokyo` → JP, zona Indonesia → ID), lalu
`navigator.languages`, dan jatuh ke default locale di luar browser. Klien bisa
mengoreksinya lewat pemilih mata uang kecil di panel harga; `regionFor(locale)`
tetap menjadi nilai yang dipakai HTML prerender.

Deteksi dijalankan di `useEffect`, **bukan** di initial state: Preact `hydrate()`
tidak men-diff atribut pada DOM yang sudah ada, jadi render klien pertama yang
berbeda dari server akan meninggalkan `aria-checked` versi server dan pemilih
mata uang bisa menunjuk USD sementara harganya sudah yen. Biayanya satu paint
tambahan bagi pengunjung yang pasarnya berbeda dari locale-nya.

Locale hanya memilih bahasa label. Tidak ada konversi mata uang maupun deteksi pasar oleh AI. Tidak
ada locale `ja`, jadi pasar JP **hanya** bisa datang dari pemilih pasar eksplisit
di `Consultant.tsx` — bahasa UI, bahasa website pesanan, pasar harga, dan mata
uang adalah empat pilihan terpisah.

## Multiplier dan timeline

| Pilihan | Value harga | Menyentuh | Pengaruh waktu |
| --- | ---: | --- | --- |
| template / semi_custom / full_custom | 0,9 / 1,0 / 1,15 | `designPart` saja | Value yang sama menaikkan effort |
| ready / partial / none | 1,0 / 1,05 / 1,12 | `designPart` saja | Value yang sama menaikkan effort |
| normal / priority / rush | 1,0 / 1,2 / 1,3 | seluruh subtotal | time_factor 1 / 0,75 / 0,6 |

```text
extraDays = ceil(total jam tambahan / 6)
effort    = multiplier design x multiplier content
days      = max(1, ceil((dasar + extraDays) x effort x time_factor))
```

Waktu paket sudah mencakup fitur included. Engine memakai rentang `workdays`
paket, bukan menghitung ulang dari `est_hours`. Estimasi tidak memiliki kalender
tanggal, kapasitas pemilik, hari libur, atau jam antrean. Rush memberi 0,6 waktu,
bukan 0,5: separuh waktu bukan janji yang bisa dipenuhi untuk semua scope.

## Status dan output

| Status | Trigger | Tampilan harga | Follow-up |
| --- | --- | --- | --- |
| fixed | Tidak ada pemicu risiko dan price <= max | `total` satu angka | Konfirmasi scope |
| range | Fitur elevated atau customRequests | `total`–`totalHigh` | Diskusi kebutuhan |
| discuss | Blocking domain, risk_tier review, scope terpotong, atau price > max | Tidak ada angka utama | Scoping manual |

`Quote.lines` memiliki kind base/pages/feature/adjust. Jumlah amount baris sama
dengan price sebelum diskon. `featuresCount` menghitung ID unik di plan.features.
`pagesCount` adalah halaman konten. `validDays` default 14.

Status discuss tidak menghapus angka dari objek Quote; `quotePriceText`
mengembalikan string kosong. API order masih mengirim numeric total. Jangan
menganggap angka internal discuss otomatis merupakan harga final ke klien.

Untuk blocking domain, UI memakai `t.result.discussBlocked(areas)` yang menyebut
bidang yang ditolak dan menawarkan scoping berbayar — bukan `discussNote` yang
mengatakan rencananya "lebih besar dari yang bisa dihitung otomatis", karena
brief yang diblokir bisa saja kecil.

## Diskon

`PRICING = withEnv(raw, publicOverrides)` mengoverride percent, spots_total,
spots_taken, dan max_discount_percent. Override invalid/negatif/kosong kembali
ke default. PUBLIC env di-inline Vite saat build.

Founding aktif jika flag active, percent > 0, dan slot tersisa. Default
**10% / 5 slot / 0 terpakai**. Slot tidak terisi otomatis saat order.

Kode promo berada di env server `PROMO_CODES`, dinormalisasi trim + uppercase,
lalu dicari ulang saat order. `choices.promoCode` sendiri tidak mengubah quote;
argument `promo` yang sudah divalidasi diperlukan.

**Satu diskon, tidak menumpuk.** Yang berlaku adalah persentase terbesar antara
founding dan promo, dibatasi `max_discount_percent` (default **10**). Pasar dalam
`discount_policy.no_discount_markets` (saat ini `ID`) tidak mendapat diskon sama
sekali, karena harga list-nya sudah disubsidi di bawah lantai biaya pemilik.

Sebelumnya founding dan promo bersifat aditif hingga 40%. Pada proyek booking
Indonesia itu menghasilkan sekitar sepertiga upah minimum Kanagawa per jam;
lihat [riset harga 05](PRICING_RESEARCH_05_COMMERCIAL.md) bagian 3.
`savingsPercent` melaporkan penghematan riil dibulatkan, sehingga pada proyek
kecil bisa satu poin di atas persentase label karena pembulatan ke round step.

## Contoh yang teruji

Tiga sample riset menjadi golden case di `tests/pricing.test.ts`, dengan toleransi
10% terhadap fee yang didokumentasikan di
[riset harga 01](PRICING_RESEARCH_01_MARKET.md). Hasil aktual:

| Kasus v1 | ID | JP | Global/AS |
| --- | --- | --- | --- |
| Tegak (70 jam) | Rp6,60 jt (+1,5%) | ¥220.000 (0%) | $1.900 (0%) |
| Lembar (140 jam) | Rp13,65 jt (+5,0%) | ¥465.000 (+5,7%) | $3.950 (+3,9%) |
| Kurohane (130 jam) | Rp12,80 jt (+6,7%) | ¥430.000 (+2,4%) | $3.700 (+2,8%) |

Lembar berstatus `range`, bukan `fixed`, karena `payment` bertier elevated.
Jangan mengimplementasikan lookup nama bisnis: hasil harus muncul dari scope.


## ID penawaran dan biaya lain

`quoteId()` memakai HMAC-SHA256 dari JSON `{plan, choices, total, status}` dengan
QUOTE_SECRET, mengambil 8 hex pertama dan menambahkan prefix SKY. Referensi
bersifat deterministik untuk payload sama, bukan ID database/nomor urut.
Ia tidak membawa timestamp, expiry, atau pemeriksaan tanda tangan quote lama.
Masa berlaku 14 hari saat ini berupa janji bisnis, bukan enforcement API.

Hosting/domain di not_included dan maintenance di recurring ditampilkan
terpisah; tidak ditambahkan ke total pembangunan. Default pembayaran 0/100
dibaca oleh copy/legal/email, bukan diproses sebagai transaksi di aplikasi.
