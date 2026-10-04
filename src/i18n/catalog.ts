// Client-facing copy for every id in data/pricing.json (the JSON holds numbers; this holds words).
// `plain` explains the benefit without jargon; the English `plain` also feeds the AI catalog.
// tests/pricing.test.ts fails if an id in pricing.json has no copy here.
import type { Locale } from '../lib/schemas';

type Copy = Record<Locale, { name: string; plain: string }>;
/** `unit` labels the quantity of a per-item feature, e.g. "language" in "+Rp 550rb / language". */
type FeatureCopy = Record<Locale, { name: string; plain: string; unit?: string }>;

export const SERVICE_COPY: Record<string, Copy> = {
  company_profile: {
    en: { name: 'Company Profile', plain: 'Business website that builds trust: about, services, portfolio, contact.' },
    id: { name: 'Company Profile', plain: 'Website bisnis yang membangun kepercayaan: profil, layanan, portofolio, kontak.' },
  },
  landing_page: {
    en: { name: 'Landing Page', plain: 'One focused page for a product, campaign, event or sign-ups.' },
    id: { name: 'Landing Page', plain: 'Satu halaman fokus untuk produk, kampanye, acara, atau pendaftaran.' },
  },
  online_store: {
    en: { name: 'Online Store', plain: 'Sell products online with cart, checkout, online payment and an admin.' },
    id: { name: 'Toko Online', plain: 'Jualan online dengan keranjang, checkout, pembayaran online, dan admin.' },
  },
  personal_portfolio: {
    en: { name: 'Personal Portfolio', plain: 'Showcase one person\'s work, skills and contact.' },
    id: { name: 'Portofolio Pribadi', plain: 'Menampilkan karya, keahlian, dan kontak satu orang.' },
  },
  online_course: {
    en: { name: 'Online Course (LMS)', plain: 'Courses and lessons for logged-in students, managed from an admin.' },
    id: { name: 'Kursus Online (LMS)', plain: 'Kursus dan materi untuk siswa yang login, dikelola dari admin.' },
  },
  booking_reservation: {
    en: { name: 'Booking & Reservation', plain: 'Customers book appointments, tables or slots; you manage them in an admin.' },
    id: { name: 'Booking & Reservasi', plain: 'Pelanggan memesan jadwal, meja, atau slot; Anda kelola dari admin.' },
  },
  custom_web_app: {
    en: { name: 'Custom Web App', plain: 'Software with its own business logic: dashboards, portals, internal tools, SaaS.' },
    id: { name: 'Aplikasi Web Custom', plain: 'Aplikasi dengan alur bisnis sendiri: dashboard, portal, sistem internal, SaaS.' },
  },
  blog_media: {
    en: { name: 'Blog & Media', plain: 'Articles or news published regularly from an admin.' },
    id: { name: 'Blog & Media', plain: 'Artikel atau berita yang rutin diterbitkan dari admin.' },
  },
};

export const FEATURE_COPY: Record<string, FeatureCopy> = {
  whatsapp_button: {
    en: { name: 'WhatsApp chat button', plain: 'Visitors can message you on WhatsApp in one tap.' },
    id: { name: 'Tombol chat WhatsApp', plain: 'Pengunjung bisa langsung chat Anda lewat WhatsApp sekali klik.' },
  },
  google_maps: {
    en: { name: 'Location map', plain: 'A map so customers can find your place and get directions.' },
    id: { name: 'Peta lokasi', plain: 'Peta agar pelanggan mudah menemukan lokasi Anda dan dapat petunjuk arah.' },
  },
  analytics: {
    en: { name: 'Visitor statistics', plain: 'See how many people visit, where they come from and what they click.' },
    id: { name: 'Statistik pengunjung', plain: 'Lihat berapa banyak pengunjung, dari mana asalnya, dan apa yang mereka klik.' },
  },
  contact_form: {
    en: { name: 'Contact form to your email', plain: 'Visitors fill in a short form and the message lands in your inbox.' },
    id: { name: 'Form kontak ke email', plain: 'Pengunjung mengisi form singkat dan pesannya masuk ke email Anda.' },
  },
  gallery: {
    en: { name: 'Photo / product gallery', plain: 'Show your photos, products or past work in a neat gallery.' },
    id: { name: 'Galeri foto / produk', plain: 'Tampilkan foto, produk, atau hasil kerja Anda dalam galeri yang rapi.' },
  },
  copywriting: {
    en: { name: 'We write the text for you', plain: 'We write clear, persuasive text for each page, so you do not have to.' },
    id: { name: 'Kami tuliskan teksnya', plain: 'Kami menulis teks yang jelas dan meyakinkan untuk setiap halaman.' },
  },
  seo_basic: {
    en: { name: 'Google-ready & fast loading', plain: 'Set up so Google can find and show your site, and pages open quickly.' },
    id: { name: 'Siap tampil di Google & cepat dibuka', plain: 'Disiapkan agar mudah ditemukan Google dan halaman terbuka dengan cepat.' },
  },
  multilang: {
    en: { name: 'Extra language', plain: 'Visitors can switch the whole site to another language. Priced per extra language.', unit: 'language' },
    id: { name: 'Bahasa tambahan', plain: 'Pengunjung bisa mengganti seluruh isi website ke bahasa lain. Dihitung per bahasa tambahan.', unit: 'bahasa' },
  },
  custom_animation: {
    en: { name: 'Custom animations', plain: 'Smooth, eye-catching motion that makes the site feel premium.' },
    id: { name: 'Animasi khusus', plain: 'Gerakan halus yang menarik perhatian dan membuat website terasa premium.' },
  },
  cms_admin: {
    en: { name: 'Update the site yourself', plain: 'A simple admin page to change text, photos and items without a developer.' },
    id: { name: 'Update isi website sendiri', plain: 'Halaman admin sederhana untuk mengganti teks, foto, dan item tanpa developer.' },
  },
  user_login: {
    en: { name: 'Customer accounts & login', plain: 'Customers sign up and log in to see their own content or orders.' },
    id: { name: 'Akun & login pelanggan', plain: 'Pelanggan bisa daftar dan login untuk melihat konten atau pesanan mereka.' },
  },
  payment: {
    en: { name: 'Online payments', plain: 'Accept payments on the site (bank transfer, e-wallet or card).' },
    id: { name: 'Terima pembayaran online', plain: 'Terima pembayaran langsung di website (transfer, e-wallet, atau kartu).' },
  },

  // Contact & communication
  live_chat: {
    en: { name: 'Live chat', plain: 'A chat bubble so visitors can ask questions and you answer in real time.' },
    id: { name: 'Live chat', plain: 'Gelembung chat agar pengunjung bisa bertanya dan Anda jawab langsung.' },
  },
  newsletter: {
    en: { name: 'Newsletter sign-up', plain: 'Collect email addresses so you can send news and promos later.' },
    id: { name: 'Daftar newsletter', plain: 'Kumpulkan email pengunjung untuk kirim kabar dan promo nanti.' },
  },
  multi_step_form: {
    en: { name: 'Step-by-step form', plain: 'A longer form split into easy steps, for registrations, surveys or project briefs.' },
    id: { name: 'Form bertahap', plain: 'Form panjang yang dibagi beberapa langkah, untuk pendaftaran, survei, atau brief.' },
  },
  email_notifications: {
    en: { name: 'Automatic emails', plain: 'Customers and your team get an email automatically, e.g. after an order or sign-up.' },
    id: { name: 'Email otomatis', plain: 'Pelanggan dan tim Anda otomatis dapat email, misalnya setelah pesan atau daftar.' },
  },
  whatsapp_notifications: {
    en: { name: 'Automatic WhatsApp messages', plain: 'Send order or booking updates to customers on WhatsApp automatically. The WhatsApp API fee is paid separately.' },
    id: { name: 'Pesan WhatsApp otomatis', plain: 'Kirim info pesanan atau jadwal ke pelanggan lewat WhatsApp secara otomatis. Biaya API WhatsApp dibayar terpisah.' },
  },

  // Content & presentation
  blog_section: {
    en: { name: 'Blog / news', plain: 'Publish articles or news with categories, so the site stays fresh and gets found.' },
    id: { name: 'Blog / berita', plain: 'Terbitkan artikel atau berita berkategori agar website tetap segar dan mudah ditemukan.' },
  },
  portfolio_filter: {
    en: { name: 'Filterable portfolio / catalog', plain: 'Show many items with filters and a detail page for each one.' },
    id: { name: 'Portofolio / katalog berfilter', plain: 'Tampilkan banyak item dengan filter dan halaman detail untuk masing-masing.' },
  },
  search: {
    en: { name: 'Site search', plain: 'Visitors can search your products, articles or pages.' },
    id: { name: 'Pencarian', plain: 'Pengunjung bisa mencari produk, artikel, atau halaman di website Anda.' },
  },
  events_calendar: {
    en: { name: 'Events calendar', plain: 'List upcoming events or classes with dates, details and a sign-up link.' },
    id: { name: 'Kalender acara', plain: 'Tampilkan acara atau kelas mendatang lengkap dengan tanggal, detail, dan link daftar.' },
  },
  content_migration: {
    en: { name: 'Move content from your old site', plain: 'We carry over the text, photos and articles from your current website.' },
    id: { name: 'Pindahkan konten website lama', plain: 'Kami pindahkan teks, foto, dan artikel dari website Anda yang sekarang.' },
  },

  // Marketing & SEO
  seo_advanced: {
    en: { name: 'Advanced Google optimization', plain: 'Keyword research and in-depth optimization of every page to rank for the searches that matter.' },
    id: { name: 'Optimasi Google lanjutan', plain: 'Riset kata kunci dan optimasi mendalam tiap halaman agar muncul di pencarian yang penting.' },
  },
  conversion_tracking: {
    en: { name: 'Ad tracking', plain: 'Measure which ads on Meta, Google or TikTok bring real customers.' },
    id: { name: 'Tracking iklan', plain: 'Ukur iklan mana di Meta, Google, atau TikTok yang benar-benar mendatangkan pelanggan.' },
  },
  popup_promo: {
    en: { name: 'Promo pop-up', plain: 'A pop-up for a promo, voucher or free download that turns visitors into leads.' },
    id: { name: 'Pop-up promo', plain: 'Pop-up promo, voucher, atau unduhan gratis yang mengubah pengunjung jadi calon pelanggan.' },
  },
  social_feed: {
    en: { name: 'Instagram feed', plain: 'Your latest social media posts appear on the site automatically.' },
    id: { name: 'Feed Instagram', plain: 'Postingan media sosial terbaru Anda tampil otomatis di website.' },
  },

  // Accounts & users
  social_login: {
    en: { name: 'Sign in with Google', plain: 'Users log in with one tap using their Google account.' },
    id: { name: 'Login dengan Google', plain: 'Pengguna bisa login sekali klik memakai akun Google mereka.' },
  },
  roles_permissions: {
    en: { name: 'User roles & permissions', plain: 'Different access for admins, staff and members, so each sees only what they should.' },
    id: { name: 'Peran & hak akses', plain: 'Akses berbeda untuk admin, staf, dan member, sehingga masing-masing hanya melihat yang perlu.' },
  },
  member_area: {
    en: { name: 'Member area', plain: 'A personal dashboard with each member\'s history and members-only content.' },
    id: { name: 'Area member', plain: 'Dashboard pribadi berisi riwayat masing-masing member dan konten khusus member.' },
  },

  // Admin & management
  reports_dashboard: {
    en: { name: 'Reports & charts', plain: 'See sales, sign-ups or bookings at a glance with simple charts.' },
    id: { name: 'Laporan & grafik', plain: 'Lihat penjualan, pendaftaran, atau booking sekilas lewat grafik sederhana.' },
  },
  data_export: {
    en: { name: 'Export to Excel', plain: 'Download your data (orders, members, leads) as an Excel or CSV file.' },
    id: { name: 'Export ke Excel', plain: 'Unduh data Anda (pesanan, member, kontak) dalam file Excel atau CSV.' },
  },
  file_upload: {
    en: { name: 'File uploads', plain: 'Customers can upload documents or photos, e.g. a CV, design file or ID.' },
    id: { name: 'Upload file', plain: 'Pelanggan bisa mengunggah dokumen atau foto, misalnya CV, file desain, atau KTP.' },
  },

  // Store & payments
  manual_payment: {
    en: { name: 'Bank transfer with confirmation', plain: 'Customers pay by transfer, upload the receipt, and you confirm it in the admin.' },
    id: { name: 'Transfer manual + konfirmasi', plain: 'Pelanggan bayar via transfer, unggah bukti, lalu Anda konfirmasi di admin.' },
  },
  product_catalog: {
    en: { name: 'Product catalog', plain: 'Products organized in categories with filters and a page for each product.' },
    id: { name: 'Katalog produk', plain: 'Produk tersusun per kategori dengan filter dan halaman untuk tiap produk.' },
  },
  shopping_cart: {
    en: { name: 'Cart & checkout', plain: 'Customers add products to a cart and order them in a few steps.' },
    id: { name: 'Keranjang & checkout', plain: 'Pelanggan memasukkan produk ke keranjang lalu memesan dalam beberapa langkah.' },
  },
  product_variants: {
    en: { name: 'Product options & stock', plain: 'Sizes, colors and stock per option, so customers never order what is sold out.' },
    id: { name: 'Varian produk & stok', plain: 'Ukuran, warna, dan stok per varian, agar pelanggan tidak memesan barang yang habis.' },
  },
  shipping_calculator: {
    en: { name: 'Automatic shipping cost', plain: 'Shipping is calculated from the courier and the customer\'s address.' },
    id: { name: 'Ongkir otomatis', plain: 'Ongkos kirim dihitung otomatis dari kurir dan alamat pelanggan.' },
  },
  discount_voucher: {
    en: { name: 'Discount codes', plain: 'Create voucher codes for promos, with limits and end dates.' },
    id: { name: 'Kode diskon / voucher', plain: 'Buat kode voucher untuk promo, lengkap dengan batas pemakaian dan tanggal berakhir.' },
  },
  invoice_pdf: {
    en: { name: 'Automatic invoices', plain: 'A PDF invoice or receipt is created and sent for every order.' },
    id: { name: 'Invoice otomatis', plain: 'Invoice atau kuitansi PDF dibuat dan dikirim untuk setiap pesanan.' },
  },
  subscription_billing: {
    en: { name: 'Subscriptions', plain: 'Charge customers monthly or yearly for a membership or service.' },
    id: { name: 'Langganan berulang', plain: 'Tagih pelanggan bulanan atau tahunan untuk membership atau layanan.' },
  },

  // Booking & scheduling
  booking_calendar: {
    en: { name: 'Booking calendar', plain: 'Customers pick a free date and time slot and book it themselves.' },
    id: { name: 'Kalender booking', plain: 'Pelanggan memilih tanggal dan jam yang kosong lalu booking sendiri.' },
  },
  booking_reminder: {
    en: { name: 'Appointment reminders', plain: 'Customers get a reminder before their appointment, so fewer no-shows.' },
    id: { name: 'Pengingat jadwal', plain: 'Pelanggan dapat pengingat sebelum jadwalnya, sehingga lebih sedikit yang tidak datang.' },
  },
  multi_staff_schedule: {
    en: { name: 'Schedules per staff / branch', plain: 'Each staff member or branch has its own hours and bookings.' },
    id: { name: 'Jadwal per staf / cabang', plain: 'Setiap staf atau cabang punya jam kerja dan booking masing-masing.' },
  },
  calendar_sync: {
    en: { name: 'Google Calendar sync', plain: 'New bookings appear in your Google Calendar automatically.' },
    id: { name: 'Sinkron Google Calendar', plain: 'Booking baru otomatis muncul di Google Calendar Anda.' },
  },

  // Courses & membership
  course_player: {
    en: { name: 'Course lessons', plain: 'Courses organized in modules with video and text lessons.' },
    id: { name: 'Materi kursus', plain: 'Kursus tersusun per modul dengan materi video dan teks.' },
  },
  progress_tracking: {
    en: { name: 'Learning progress', plain: 'Students see how far they are, and you see who is falling behind.' },
    id: { name: 'Progres belajar', plain: 'Siswa melihat sejauh mana progresnya, dan Anda tahu siapa yang tertinggal.' },
  },
  quiz: {
    en: { name: 'Quizzes & scores', plain: 'Quizzes that are graded automatically, with scores saved per student.' },
    id: { name: 'Kuis & nilai', plain: 'Kuis yang dinilai otomatis, dengan nilai tersimpan per siswa.' },
  },
  certificate: {
    en: { name: 'Certificates', plain: 'A certificate is generated automatically when a student completes a course.' },
    id: { name: 'Sertifikat', plain: 'Sertifikat dibuat otomatis saat siswa menyelesaikan kursus.' },
  },

  // Integrations & AI
  api_integration: {
    en: { name: 'Connect another service', plain: 'Link the site to a tool you already use, such as accounting, CRM or a marketplace. Priced per service.', unit: 'service' },
    id: { name: 'Hubungkan layanan lain', plain: 'Sambungkan website ke aplikasi yang sudah Anda pakai, seperti akuntansi, CRM, atau marketplace. Dihitung per layanan.', unit: 'layanan' },
  },
  sheets_sync: {
    en: { name: 'Google Sheets sync', plain: 'Form entries or orders are added to a Google Sheet automatically.' },
    id: { name: 'Sinkron Google Sheets', plain: 'Isian form atau pesanan otomatis masuk ke Google Sheets.' },
  },
  ai_chatbot: {
    en: { name: 'AI chatbot', plain: 'An assistant that answers common questions 24/7 using your own information. AI usage fees are paid separately.' },
    id: { name: 'Chatbot AI', plain: 'Asisten yang menjawab pertanyaan umum 24 jam memakai informasi bisnis Anda. Biaya pemakaian AI dibayar terpisah.' },
  },
  ai_generator: {
    en: { name: 'Custom AI feature', plain: 'An AI tool built for your business, such as a content generator or product recommendations. AI usage fees are paid separately.' },
    id: { name: 'Fitur AI khusus', plain: 'Fitur AI yang dibuat untuk bisnis Anda, seperti pembuat konten atau rekomendasi produk. Biaya pemakaian AI dibayar terpisah.' },
  },

  // Security, legal & performance
  spam_protection: {
    en: { name: 'Spam protection', plain: 'Stops bots from flooding your forms with spam.' },
    id: { name: 'Anti-spam', plain: 'Mencegah bot membanjiri form Anda dengan spam.' },
  },
  legal_pages: {
    en: { name: 'Privacy, terms & cookie notice', plain: 'Privacy policy and terms pages plus a cookie notice, so you meet basic legal requirements.' },
    id: { name: 'Halaman privasi, syarat & cookie', plain: 'Halaman kebijakan privasi dan syarat, plus pemberitahuan cookie, untuk memenuhi aturan dasar.' },
  },
  pwa: {
    en: { name: 'Installable on phones', plain: 'Visitors can add the site to their home screen and open it like an app.' },
    id: { name: 'Bisa di-install di HP', plain: 'Pengunjung bisa menambahkan website ke layar HP dan membukanya seperti aplikasi.' },
  },
};

/** Groups for the feature catalog (order comes from feature_categories in pricing.json). */
export const CATEGORY_COPY: Record<string, Record<Locale, string>> = {
  contact: { en: 'Contact & communication', id: 'Kontak & komunikasi' },
  content: { en: 'Content & presentation', id: 'Konten & tampilan' },
  marketing: { en: 'Marketing & Google', id: 'Marketing & Google' },
  accounts: { en: 'Accounts & users', id: 'Akun & pengguna' },
  admin: { en: 'Admin & management', id: 'Admin & pengelolaan' },
  commerce: { en: 'Store & payments', id: 'Toko & pembayaran' },
  booking: { en: 'Booking & scheduling', id: 'Booking & jadwal' },
  learning: { en: 'Courses & membership', id: 'Kursus & membership' },
  integration: { en: 'Integrations & AI', id: 'Integrasi & AI' },
  trust: { en: 'Security, legal & performance', id: 'Keamanan, legal & performa' },
};

/** Short names for each page type in pricing.json (page_types), shown when the AI's own page name is missing. */
export const PAGE_COPY: Record<string, Record<Locale, string>> = {
  home: { en: 'Home', id: 'Beranda' },
  about: { en: 'About', id: 'Tentang' },
  services: { en: 'Services / Products', id: 'Layanan / Produk' },
  service_detail: { en: 'Service details', id: 'Detail layanan' },
  team: { en: 'Team', id: 'Tim' },
  pricing: { en: 'Pricing', id: 'Harga & paket' },
  faq: { en: 'FAQ', id: 'FAQ' },
  contact: { en: 'Contact & location', id: 'Kontak & lokasi' },
  custom: { en: 'Content page', id: 'Halaman konten' },
  product_list: { en: 'Product list', id: 'Daftar produk' },
  product_detail: { en: 'Product page', id: 'Detail produk' },
  cart: { en: 'Cart', id: 'Keranjang' },
  checkout: { en: 'Checkout', id: 'Checkout' },
  blog_list: { en: 'Articles', id: 'Daftar artikel' },
  article: { en: 'Article page', id: 'Halaman artikel' },
  project_list: { en: 'Portfolio', id: 'Portofolio' },
  project_detail: { en: 'Project page', id: 'Detail proyek' },
  booking: { en: 'Booking', id: 'Booking' },
  events: { en: 'Events', id: 'Acara' },
  search_results: { en: 'Search results', id: 'Hasil pencarian' },
  legal: { en: 'Privacy & terms', id: 'Privasi & syarat' },
  course_list: { en: 'Courses', id: 'Daftar kursus' },
  login: { en: 'Log in / Sign up', id: 'Masuk / Daftar' },
  account: { en: 'My account', id: 'Akun saya' },
  my_orders: { en: 'My orders', id: 'Pesanan saya' },
  my_bookings: { en: 'My bookings', id: 'Booking saya' },
  my_courses: { en: 'My courses', id: 'Kursus saya' },
  lesson: { en: 'Lesson', id: 'Materi kursus' },
  member_content: { en: 'Members-only content', id: 'Konten member' },
  custom_member: { en: 'Member screen', id: 'Layar member' },
  manage_content: { en: 'Manage content', id: 'Kelola konten' },
  manage_products: { en: 'Manage products', id: 'Kelola produk' },
  orders: { en: 'Orders', id: 'Pesanan' },
  manage_bookings: { en: 'Manage bookings', id: 'Kelola booking' },
  reports: { en: 'Reports', id: 'Laporan' },
  custom_admin: { en: 'Admin screen', id: 'Layar admin' },
};

type Option = Record<Locale, { label: string; hint: string }>;

/** Copy for the three price multipliers the client picks in the consultation. */
export const MULTIPLIER_COPY: Record<'design_level' | 'content_readiness' | 'timeline', { question: Record<Locale, string>; options: Record<string, Option> }> = {
  design_level: {
    question: { en: 'How unique should the design be?', id: 'Seberapa unik desainnya?' },
    options: {
      template: { en: { label: 'Clean & proven', hint: 'A polished layout in your colors and content' }, id: { label: 'Rapi & teruji', hint: 'Tata letak rapi dengan warna dan konten Anda' } },
      semi_custom: { en: { label: 'Tailored to your brand', hint: 'Layout and details shaped around your brand' }, id: { label: 'Sesuai brand Anda', hint: 'Tata letak dan detail disesuaikan dengan brand' } },
      full_custom: { en: { label: 'One of a kind', hint: 'Designed from scratch with signature motion' }, id: { label: 'Benar-benar unik', hint: 'Didesain dari nol dengan animasi khas' } },
    },
  },
  content_readiness: {
    question: { en: 'Are your text & photos ready?', id: 'Teks & foto sudah siap?' },
    options: {
      ready: { en: { label: 'All ready', hint: '' }, id: { label: 'Sudah semua', hint: '' } },
      partial: { en: { label: 'Some of it', hint: '' }, id: { label: 'Sebagian', hint: '' } },
      none: { en: { label: 'Not yet', hint: '' }, id: { label: 'Belum ada', hint: '' } },
    },
  },
  timeline: {
    question: { en: 'When do you need it online?', id: 'Kapan perlu online?' },
    options: {
      normal: { en: { label: 'Normal pace', hint: '' }, id: { label: 'Normal', hint: '' } },
      priority: { en: { label: 'Sooner', hint: '' }, id: { label: 'Lebih cepat', hint: '' } },
      rush: { en: { label: 'ASAP', hint: '' }, id: { label: 'Secepatnya', hint: '' } },
    },
  },
};

export const RECURRING_COPY: Record<string, Record<Locale, { name: string; billing: string }>> = {
  maintenance_basic: { en: { name: 'Care plan: backups, security updates, 1 small fix', billing: 'month' }, id: { name: 'Perawatan: backup, update keamanan, 1 perbaikan kecil', billing: 'bulan' } },
  maintenance_plus: { en: { name: 'Care plan plus: also up to 3 content updates', billing: 'month' }, id: { name: 'Perawatan plus: termasuk 3 update konten', billing: 'bulan' } },
};

/** Costs the client pays to someone else, so they are never part of a Skyland quote. */
export const NOT_INCLUDED_COPY: Record<string, Record<Locale, { name: string; billing: string; note: string }>> = {
  hosting_domain: {
    en: {
      name: 'Hosting & domain',
      billing: 'year',
      note: 'You choose the provider and plan, and pay them directly so the accounts stay in your name. Setting it all up is on us, free.',
    },
    id: {
      name: 'Hosting & domain',
      billing: 'tahun',
      note: 'Anda pilih provider dan paketnya, lalu bayar langsung ke mereka agar akunnya atas nama Anda. Setup-nya kami yang kerjakan, gratis.',
    },
  },
};
