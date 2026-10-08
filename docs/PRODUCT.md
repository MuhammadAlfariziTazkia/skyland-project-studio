# Produk dan konteks bisnis

## Identitas dan tujuan

**Skyland Project Studio** adalah studio jasa pengembangan website milik
Muhammad Alfarizi Tazkia. Konfigurasi dan copy saat ini menyebut Kanagawa,
Jepang, dengan layanan remote untuk Indonesia dan pasar global.

Repository ini menjadi pintu masuk penjualan: menjelaskan layanan, menunjukkan
hasil karya dan konsep, membantu calon klien menyusun kebutuhan, serta mengirim
penawaran yang cukup lengkap untuk ditindaklanjuti pemilik lewat email/WhatsApp.
Pendapatan berasal dari pengerjaan proyek website dan maintenance opsional.
Konsultasi AI gratis, tanpa akun dan tanpa komitmen pembelian.

Masalah yang disasar: calon klien nonteknis sulit menerjemahkan ide bisnis
menjadi halaman/fitur, tidak tahu perkiraan biaya, dan ingin melihat arah desain
sebelum memesan. Studio mendapat brief terstruktur sehingga diskusi awal lebih
terarah dan scope/harga lebih konsisten.

## Pengguna

| Pengguna | Kebutuhan | Output aplikasi |
| --- | --- | --- |
| Pemilik UMKM/bisnis | Kredibilitas online, informasi layanan, calon pelanggan | Scope website, preview, penawaran |
| Penjual/penyelenggara layanan | Katalog, penjualan, booking atau kursus | Rekomendasi paket dan fitur yang relevan |
| Profesional/kreator | Portfolio, personal brand, konten | Rencana portfolio/blog |
| Pemilik Skyland | Brief dan kontak yang bisa segera ditindaklanjuti | Email order + HTML mockup + JSON konsultasi |

Actor `visitor`, `member`, dan `owner` di dalam sebuah Plan adalah pengguna
**website yang akan dibangun untuk klien**. Mereka bukan role autentikasi di
Skyland; aplikasi Skyland sendiri tidak memiliki login/member/admin dashboard.

## Posisi dan janji layanan

Copy memposisikan Skyland sebagai studio baru yang bekerja langsung dengan
builder, dengan harga transparan, kepemilikan penuh, dan risiko awal rendah.

- Rencana, mockup homepage, dan kalkulasi harga tersedia sebelum order.
- Harga pasti untuk scope katalog yang masuk batas otomatis.
- Kebutuhan custom menghasilkan rentang; proyek besar perlu diskusi.
- Konfigurasi saat ini: tanpa DP, pelunasan 100% setelah website selesai dan
  disetujui, sebelum launch/serah terima ke domain klien.
- Dua putaran revisi desain dan 30 hari support setelah launch.
- Hosting/domain dan biaya pihak ketiga dibayar klien ke provider; setup
  hosting, domain, dan SSL termasuk layanan pembangunan.
- Source code, konten, domain, dan akun menjadi milik klien setelah pelunasan.
- Diskon founding client saat ini default 20% untuk 5 slot; jumlah terpakai
  dikelola manual oleh pemilik. Kode promo dapat menambah potongan hingga cap.

Janji tersebut sebagian berupa proses bisnis manual, bukan workflow yang
diimplementasikan dalam aplikasi. Misalnya persetujuan desain, pembayaran,
handover, support, dan target follow-up dalam satu hari kerja dilakukan pemilik.
Mengubah janji perlu menyelaraskan landing, FAQ, legal, konsultan, dan email.

## Layanan yang dijual

| Nama produk | ID paket harga | Key konten/routing |
| --- | --- | --- |
| Company Profile | `company_profile` | `company_profile` |
| Landing Page | `landing_page` | `landing` |
| Online Store | `online_store` | `online_store` |
| Personal Portfolio | `personal_portfolio` | `portfolio` |
| Online Course / LMS | `online_course` | `lms` |
| Booking & Reservation | `booking_reservation` | `booking` |
| Custom Web App | `custom_web_app` | `web_app` |
| Blog & Media | `blog_media` | `blog` |

Paket/fitur seperti pembayaran, login, admin, LMS, dan booking adalah scope
yang dapat **dijual**. Keberadaan ID di katalog tidak berarti fitur tersebut
telah dibangun sebagai bagian aplikasi Skyland.

## Perjalanan pengguna

1. **Mengenal studio.** Home berisi hero, layanan, demo cara kerja, portfolio,
   alasan memilih Skyland, FAQ, founding offer, kontak. Delapan halaman layanan
   per bahasa memberi penjelasan lebih spesifik dan pintu masuk SEO.
2. **Describe.** Pengguna mengisi kebutuhan 20–1.500 karakter, referensi opsional,
   region harga, kesiapan konten, dan kecepatan pengerjaan.
3. **Plan.** AI menentukan layanan, konteks bisnis, tindakan pengguna website,
   halaman beserta section, fitur utama, saran opsional, asumsi, dan pertanyaan.
   Pengguna bisa menambah/menghapus halaman konten, mengaktifkan fitur, mengubah
   kuantitas item, menjawab pertanyaan, dan memakai satu revisi AI lewat UI.
   Harga dan estimasi waktu berubah langsung tanpa panggilan AI tambahan.
4. **Theme.** Pilih Minimal, Elegan, Futuristik, atau Ceria serta tingkat desain
   template/semi custom/full custom. Tema dan tingkat desain adalah dua hal berbeda.
5. **Result.** AI menulis konten homepage; renderer kode menghasilkan preview
   desktop/mobile. Pengguna melihat fixed/range/discuss, rincian biaya, waktu,
   diskon, biaya di luar harga, maintenance, dan dapat memasukkan kode promo.
6. **Order.** Isi nama, email, WhatsApp, perusahaan/catatan opsional, dan persetujuan
   privasi. Server memvalidasi, menghitung ulang, membuat ID penawaran, dan email.
7. **Done.** Tampilkan ID `SKY-XXXXXXXX` serta link WhatsApp pemilik jika dikonfigurasi.
   Pemilik meninjau scope dan melanjutkan pengerjaan secara manual.

Empat indikator langkah di UI menggabungkan result/order/done menjadi langkah
keempat. Secara internal terdapat enam state. Progress disimpan di browser agar
refresh bisa melanjutkan, bukan sinkronisasi akun/perangkat.

## Bahasa dan pasar

EN adalah default `/`; ID berada di `/id/`. Pemilihan bahasa EN menginisialisasi
region GLOBAL/USD, ID menginisialisasi ID/IDR. Pengguna dapat mengganti region
sendiri tanpa mengganti bahasa. Harga USD adalah tabel pasar global tersendiri,
bukan konversi kurs saat ini.

Browser Indonesia dapat diarahkan EN → halaman ID yang setara berdasarkan
zona waktu/bahasa browser. Pilihan manual bahasa disimpan dan mengalahkan deteksi.
Redirect ini berbeda dari penentuan region harga.

## Portfolio dan konsep

- FikrMate dan Rumah Belajar Bunsky ditampilkan sebagai karya yang sudah dikirim,
  berdasarkan copy repository. Detail kepemilikan, metrik hasil, atau kontrak
  eksternal tidak diverifikasi oleh audit ini.
- Tegak Prima Konstruksi, Lembar Toko Buku, Arden Property Auction, dan
  黒羽 Kurohane Barber Studio diberi label **konsep studio**, bukan karya klien.
  Keempat demo aktif di `public/samples/`. Arden berbahasa Inggris dan Kurohane
  berbahasa Jepang; keduanya memperlihatkan jangkauan di luar pasar Indonesia.
- Seluruh nama perusahaan, harga, orang, alamat, dan tanggal dalam keempat demo
  adalah fiktif dan diberi keterangan demikian di halamannya.
- Foto pada demo Arden dan Kurohane berasal dari Pexels (bebas pakai komersial
  tanpa atribusi). Sumber tiap berkas tercatat di `public/samples/<key>/CREDITS.md`.
- Demo pada bagian How It Works merupakan presentasi lokal memakai contoh
  dan engine harga; bukan konsultasi AI live.

## Batas produk dan kriteria keberhasilan

Belum ada database lead/order, payment processing, customer portal, dashboard
admin Skyland, CRM, job queue, atau generator website produksi untuk klien.
Mockup adalah satu homepage dengan link placeholder dan desain template;
pesanan berarti permintaan follow-up, bukan transaksi pembayaran.

Kriteria fungsional yang dapat diperiksa: pengguna EN/ID bisa menyelesaikan
konsultasi, perubahan scope tercermin pada harga, order menghitung ulang harga,
dan email pemilik membawa konteks lengkap. Halaman marketing tetap bisa dibaca
tanpa hidrasi konsultan. UI konsultan memerlukan JavaScript.

Metrik bisnis yang berguna nantinya: kunjungan → konsultasi dimulai → plan →
mockup → order → deal, waktu follow-up, biaya AI per lead, dan scope yang perlu
diskusi. Ini **usulan pengukuran**, belum terdapat instrumentasi analytics
funnel dalam kode utama. Fitur `analytics` di katalog adalah layanan untuk
website klien, bukan bukti tracking funnel Skyland sudah terpasang.

Sumber: `src/config/site.ts`, copy EN/ID, `LegalPage.astro`, `Consultant.tsx`,
`data/pricing.json`, `src/pages/api/order.ts`, `src/lib/mail.ts`.
