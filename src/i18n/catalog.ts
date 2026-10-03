// Client-facing copy for every id in data/pricing.json (the JSON holds numbers; this holds words).
// `plain` explains the benefit without jargon; the English `plain` also feeds the AI catalog.
// tests/pricing.test.ts fails if an id in pricing.json has no copy here.
import type { Locale } from '../lib/schemas';

type Copy = Record<Locale, { name: string; plain: string }>;

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

export const FEATURE_COPY: Record<string, Copy> = {
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
    en: { name: 'Two languages', plain: 'Visitors can switch the whole site between two languages.' },
    id: { name: 'Dua bahasa', plain: 'Pengunjung bisa mengganti seluruh isi website ke dua bahasa.' },
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
