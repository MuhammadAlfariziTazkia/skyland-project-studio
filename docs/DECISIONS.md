# Keputusan arsitektur yang tercermin dalam kode

Catatan berikut direkonstruksi dari implementasi dan komentar pada 4 Oktober
2026. Ini bukan klaim bahwa ADR formal atau persetujuan historis pernah dibuat.
Status seluruh keputusan di bawah: **pola yang digunakan saat audit**.

## D-01 — Marketing statis dengan island konsultan

**Implementasi:** Astro output static, API opt-out prerender, Preact client:load
hanya di ConsultPage; adapter Vercel. Halaman layanan dibuat dengan static paths.

**Alasan yang tercermin:** konten bisnis dan SEO dapat dirender cepat tanpa
aplikasi client penuh; konsultasi tetap interaktif. **Konsekuensi:** perubahan
copy/harga/public env membutuhkan build; tidak ada router/state aplikasi global.
Pertimbangkan ulang bila kebutuhan menjadi aplikasi akun dinamis yang dominan,
bukan karena kebiasaan provider agent.

## D-02 — AI mengklasifikasi, kode menghitung harga

**Implementasi:** katalog prompt tanpa harga, Zod ID enum, satu engine harga
browser/server. **Alasan:** total konsisten dan item biaya tidak diarang AI.
**Konsekuensi:** kualitas scope tetap bergantung AI dan relasi halaman/fitur;
valid ID tidak menjamin scope lengkap. Penambahan kebutuhan harus memperbarui
katalog/copy dan pengujian, bukan prompt untuk menebak harga baru.

## D-03 — Halaman fitur mengikuti harga fitur

**Implementasi:** page_types menurunkan area/feature; hanya contentPages dikenai
kuota/extra page. **Alasan:** cart/checkout/member/admin tidak dihitung ganda
dengan fitur yang sudah membawanya. **Konsekuensi:** visibility mengikuti fitur;
paket includes tetap aktif; toggle manual belum menyediakan screen baru otomatis.

## D-04 — Kontrak structured JSON, rendering dikontrol kode

**Implementasi:** fetch Chat Completions + strict JSON Schema + Zod; AI mockup
menghasilkan copy, `renderMockup()` menghasilkan HTML/CSS. **Alasan:** shape
terkontrol, biaya/context lebih kecil, renderer aman digunakan ulang.
**Konsekuensi:** mockup terbatas pada template homepage, bukan generator app
multi-page; JSON Schema provider dan Zod harus dijaga sinkron.

## D-05 — Revisi sebagai patch

**Implementasi:** PATCH_JSON_SCHEMA dan applyPatch dengan current plan ringkas.
**Alasan:** perubahan lebih kecil dan token lebih sedikit daripada regenerasi
Plan penuh. **Konsekuensi:** flow/summary/questions tidak ikut disusun ulang;
model tidak melihat seluruh sections/quantity saat ini. Satu revisi merupakan
kebijakan UI, belum kuota backend.

## D-06 — Tanpa database, draft browser dan order inbox

**Implementasi:** localStorage untuk seluruh State, SMTP langsung di request,
lampiran JSON sebagai hasil lengkap. **Alasan yang tampak:** operasional awal
ringan dan tidak memerlukan sistem akun/admin. **Konsekuensi:** tidak ada
cross-device, quote retrieval, expiry, idempotency, slot counting otomatis,
atau data terpusat. Jika kebutuhan tersebut nyata, desain persistensi dapat
dibahas sebagai perubahan produk tersendiri.

## D-07 — Bilingual dengan routing eksplisit

**Implementasi:** EN default, ID prefix; pasangan route untuk hreflang/sitemap;
dictionary TS dan locale props. **Alasan:** halaman SEO kedua bahasa tetap
independen dan dapat ditautkan. **Konsekuensi:** konten harus diselaraskan di
beberapa file; locale dan region bukan satu variabel; auto-redirect hanya browser.

## D-08 — Promo secret, offer publik

**Implementasi:** PROMO_CODES hanya server, public percent/slot/cap di-inline
Vite; lookup ulang saat order. **Alasan:** iklan diskon transparan tetapi tabel
kode tidak bocor melalui JSON/bundle. **Konsekuensi:** offer butuh redeploy,
jumlah slot manual, promo hasil lookup lama dapat stale, batas minimum membatasi
penghematan riil.

## D-09 — Reference HMAC pendek tanpa record quote

**Implementasi:** SKY + 8 hex dari HMAC payload Plan/Choices/total/status.
**Alasan:** referensi deterministik yang praktis di email/WhatsApp tanpa database.
**Konsekuensi:** bukan token validasi sesi, tidak unik secara absolut, tidak
menegakkan expiry, dan tidak mencegah kirim ulang order. Secret production
harus eksplisit walau implementasi mempunyai fallback dev-secret.

## D-10 — Demo konsep mandiri

**Implementasi:** HTML public hasil desain dengan support runtime React CDN,
capture screenshot ke assets, tampil terpisah dari project nyata.
**Alasan yang tampak:** desain eksplorasi bisa dipamerkan tanpa ditulis ulang
sebagai komponen Astro. **Konsekuensi:** dependensi/font/image eksternal dan
runtime berbeda; perubahan CSP/runtime harus memperhitungkan demo tersebut.

## Menambahkan keputusan baru

Gunakan ID berikutnya dengan: tanggal, status (usulan/diterapkan/diganti),
masalah pemicu, pilihan, alasan, alternatif penting, konsekuensi, serta file
dan validasi terkait. Jangan menulis usulan sebagai keputusan yang sudah
diimplementasikan. Bila keputusan lama diganti, hubungkan ke keputusan pengganti.
