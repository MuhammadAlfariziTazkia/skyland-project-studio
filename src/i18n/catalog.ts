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
    ja: { name: '会社案内サイト', plain: '信頼を築くビジネスサイト。会社概要、サービス、実績、問い合わせ。' },
  },
  landing_page: {
    en: { name: 'Landing Page', plain: 'One focused page for a product, campaign, event or sign-ups.' },
    id: { name: 'Landing Page', plain: 'Satu halaman fokus untuk produk, kampanye, acara, atau pendaftaran.' },
    ja: { name: 'ランディングページ', plain: '商品・キャンペーン・イベント・申し込みに絞った1ページ。' },
  },
  online_store: {
    en: { name: 'Online Store', plain: 'Sell products online with cart, checkout, online payment and an admin.' },
    id: { name: 'Toko Online', plain: 'Jualan online dengan keranjang, checkout, pembayaran online, dan admin.' },
    ja: { name: 'オンラインストア', plain: 'カート、決済、オンライン支払い、管理画面つきで商品を販売。' },
  },
  personal_portfolio: {
    en: { name: 'Personal Portfolio', plain: 'Showcase one person\'s work, skills and contact.' },
    id: { name: 'Portofolio Pribadi', plain: 'Menampilkan karya, keahlian, dan kontak satu orang.' },
    ja: { name: '個人ポートフォリオ', plain: '個人の作品、スキル、連絡先を見せるサイト。' },
  },
  online_course: {
    en: { name: 'Online Course (LMS)', plain: 'Courses and lessons for logged-in students, managed from an admin.' },
    id: { name: 'Kursus Online (LMS)', plain: 'Kursus dan materi untuk siswa yang login, dikelola dari admin.' },
    ja: { name: 'オンライン講座（LMS）', plain: 'ログインした受講者向けの講座と教材を、管理画面から運営。' },
  },
  booking_reservation: {
    en: { name: 'Booking & Reservation', plain: 'Customers book appointments, tables or slots; you manage them in an admin.' },
    id: { name: 'Booking & Reservasi', plain: 'Pelanggan memesan jadwal, meja, atau slot; Anda kelola dari admin.' },
    ja: { name: '予約システム', plain: 'お客様が予約を取り、あなたは管理画面で把握できます。' },
  },
  custom_web_app: {
    en: { name: 'Custom Web App', plain: 'Software with its own business logic: dashboards, portals, internal tools, SaaS.' },
    id: { name: 'Aplikasi Web Custom', plain: 'Aplikasi dengan alur bisnis sendiri: dashboard, portal, sistem internal, SaaS.' },
    ja: { name: 'カスタムWebアプリ', plain: '独自の業務フローを持つソフトウェア。ダッシュボード、ポータル、社内システム、SaaS。' },
  },
  blog_media: {
    en: { name: 'Blog & Media', plain: 'Articles or news published regularly from an admin.' },
    id: { name: 'Blog & Media', plain: 'Artikel atau berita yang rutin diterbitkan dari admin.' },
    ja: { name: 'ブログ・メディア', plain: '記事やお知らせを管理画面から定期的に公開。' },
  },
};

export const FEATURE_COPY: Record<string, FeatureCopy> = {
  whatsapp_button: {
    en: { name: 'WhatsApp chat button', plain: 'Visitors can message you on WhatsApp in one tap.' },
    id: { name: 'Tombol chat WhatsApp', plain: 'Pengunjung bisa langsung chat Anda lewat WhatsApp sekali klik.' },
    ja: { name: 'WhatsApp チャットボタン', plain: 'ワンタップで WhatsApp からメッセージを送れます。' },
  },
  google_maps: {
    en: { name: 'Location map', plain: 'A map so customers can find your place and get directions.' },
    id: { name: 'Peta lokasi', plain: 'Peta agar pelanggan mudah menemukan lokasi Anda dan dapat petunjuk arah.' },
    ja: { name: '地図の埋め込み', plain: '店舗や事務所の場所と経路を地図で案内します。' },
  },
  analytics: {
    en: { name: 'Visitor statistics', plain: 'See how many people visit, where they come from and what they click.' },
    id: { name: 'Statistik pengunjung', plain: 'Lihat berapa banyak pengunjung, dari mana asalnya, dan apa yang mereka klik.' },
    ja: { name: 'アクセス解析', plain: '訪問数、流入元、クリックされた箇所がわかります。' },
  },
  contact_form: {
    en: { name: 'Contact form to your email', plain: 'Visitors fill in a short form and the message lands in your inbox.' },
    id: { name: 'Form kontak ke email', plain: 'Pengunjung mengisi form singkat dan pesannya masuk ke email Anda.' },
    ja: { name: 'メールに届く問い合わせフォーム', plain: '短いフォームに入力すると、内容がそのまま受信箱に届きます。' },
  },
  gallery: {
    en: { name: 'Photo / product gallery', plain: 'Show your photos, products or past work in a neat gallery.' },
    id: { name: 'Galeri foto / produk', plain: 'Tampilkan foto, produk, atau hasil kerja Anda dalam galeri yang rapi.' },
    ja: { name: '写真・商品ギャラリー', plain: '写真や商品、過去の実績を整った見た目で並べます。' },
  },
  copywriting: {
    en: { name: 'We write the text for you', plain: 'We write clear, persuasive text for each page, so you do not have to.' },
    id: { name: 'Kami tuliskan teksnya', plain: 'Kami menulis teks yang jelas dan meyakinkan untuk setiap halaman.' },
    ja: { name: '原稿の作成代行', plain: '各ページの文章を、伝わる言葉でこちらが書きます。' },
  },
  seo_basic: {
    en: { name: 'Google-ready & fast loading', plain: 'Set up so Google can find and show your site, and pages open quickly.' },
    id: { name: 'Siap tampil di Google & cepat dibuka', plain: 'Disiapkan agar mudah ditemukan Google dan halaman terbuka dengan cepat.' },
    ja: { name: 'Google対策と高速表示', plain: 'Googleに見つけてもらえる設定と、速く開くページ。' },
  },
  multilang: {
    en: { name: 'Extra language', plain: 'Visitors can switch the whole site to another language. Priced per extra language.', unit: 'language' },
    id: { name: 'Bahasa tambahan', plain: 'Pengunjung bisa mengganti seluruh isi website ke bahasa lain. Dihitung per bahasa tambahan.', unit: 'bahasa' },
    ja: { name: '追加言語', plain: 'サイト全体を別の言語に切り替えられます。言語ごとの料金です。', unit: '言語' },
  },
  custom_animation: {
    en: { name: 'Custom animations', plain: 'Smooth, eye-catching motion that makes the site feel premium.' },
    id: { name: 'Animasi khusus', plain: 'Gerakan halus yang menarik perhatian dan membuat website terasa premium.' },
    ja: { name: 'オリジナルのアニメーション', plain: '目を引く滑らかな動きで、上質な印象に仕上げます。' },
  },
  cms_admin: {
    en: { name: 'Update the site yourself', plain: 'A simple admin page to change text, photos and items without a developer.' },
    id: { name: 'Update isi website sendiri', plain: 'Halaman admin sederhana untuk mengganti teks, foto, dan item tanpa developer.' },
    ja: { name: '自分で更新できる管理画面', plain: '文章・写真・掲載項目を、開発者を通さず変更できる管理ページ。' },
  },
  user_login: {
    en: { name: 'Customer accounts & login', plain: 'Customers sign up and log in to see their own content or orders.' },
    id: { name: 'Akun & login pelanggan', plain: 'Pelanggan bisa daftar dan login untuk melihat konten atau pesanan mereka.' },
    ja: { name: '会員登録とログイン', plain: 'お客様が登録・ログインして、自分の情報や注文を見られます。' },
  },
  payment: {
    en: { name: 'Online payments', plain: 'Accept payments on the site (bank transfer, e-wallet or card).' },
    id: { name: 'Terima pembayaran online', plain: 'Terima pembayaran langsung di website (transfer, e-wallet, atau kartu).' },
    ja: { name: 'オンライン決済', plain: 'サイト上で支払いを受け取れます（銀行振込・電子マネー・カード）。' },
  },

  // Contact & communication
  live_chat: {
    en: { name: 'Live chat', plain: 'A chat bubble so visitors can ask questions and you answer in real time.' },
    id: { name: 'Live chat', plain: 'Gelembung chat agar pengunjung bisa bertanya dan Anda jawab langsung.' },
    ja: { name: 'ライブチャット', plain: 'チャットの吹き出しから質問を受け、その場で答えられます。' },
  },
  newsletter: {
    en: { name: 'Newsletter sign-up', plain: 'Collect email addresses so you can send news and promos later.' },
    id: { name: 'Daftar newsletter', plain: 'Kumpulkan email pengunjung untuk kirim kabar dan promo nanti.' },
    ja: { name: 'メール登録フォーム', plain: 'メールアドレスを集めて、後からお知らせや特典を送れます。' },
  },
  multi_step_form: {
    en: { name: 'Step-by-step form', plain: 'A longer form split into easy steps, for registrations, surveys or project briefs.' },
    id: { name: 'Form bertahap', plain: 'Form panjang yang dibagi beberapa langkah, untuk pendaftaran, survei, atau brief.' },
    ja: { name: 'ステップ式フォーム', plain: '長めの入力を数ステップに分けたフォーム。申し込みやアンケートに。' },
  },
  email_notifications: {
    en: { name: 'Automatic emails', plain: 'Customers and your team get an email automatically, e.g. after an order or sign-up.' },
    id: { name: 'Email otomatis', plain: 'Pelanggan dan tim Anda otomatis dapat email, misalnya setelah pesan atau daftar.' },
    ja: { name: '自動メール送信', plain: '注文や登録のあとに、お客様と社内へ自動でメールが届きます。' },
  },
  whatsapp_notifications: {
    en: { name: 'Automatic WhatsApp messages', plain: 'Send order or booking updates to customers on WhatsApp automatically. The WhatsApp API fee is paid separately.' },
    id: { name: 'Pesan WhatsApp otomatis', plain: 'Kirim info pesanan atau jadwal ke pelanggan lewat WhatsApp secara otomatis. Biaya API WhatsApp dibayar terpisah.' },
    ja: { name: 'WhatsApp の自動通知', plain: '注文や予約の更新を WhatsApp で自動送信します。WhatsApp API の費用は別途です。' },
  },

  // Content & presentation
  blog_section: {
    en: { name: 'Blog / news', plain: 'Publish articles or news with categories, so the site stays fresh and gets found.' },
    id: { name: 'Blog / berita', plain: 'Terbitkan artikel atau berita berkategori agar website tetap segar dan mudah ditemukan.' },
    ja: { name: 'ブログ・お知らせ', plain: 'カテゴリつきで記事を公開し、サイトを新鮮に保って検索にも強くします。' },
  },
  portfolio_filter: {
    en: { name: 'Filterable portfolio / catalog', plain: 'Show many items with filters and a detail page for each one.' },
    id: { name: 'Portofolio / katalog berfilter', plain: 'Tampilkan banyak item dengan filter dan halaman detail untuk masing-masing.' },
    ja: { name: '絞り込みつき実績・カタログ', plain: '多くの項目を絞り込みで探せて、それぞれに詳細ページがあります。' },
  },
  search: {
    en: { name: 'Site search', plain: 'Visitors can search your products, articles or pages.' },
    id: { name: 'Pencarian', plain: 'Pengunjung bisa mencari produk, artikel, atau halaman di website Anda.' },
    ja: { name: 'サイト内検索', plain: '商品・記事・ページを検索して探せます。' },
  },
  events_calendar: {
    en: { name: 'Events calendar', plain: 'List upcoming events or classes with dates, details and a sign-up link.' },
    id: { name: 'Kalender acara', plain: 'Tampilkan acara atau kelas mendatang lengkap dengan tanggal, detail, dan link daftar.' },
    ja: { name: 'イベントカレンダー', plain: '今後のイベントや講座を日付・詳細・申込リンクつきで一覧表示。' },
  },
  content_migration: {
    en: { name: 'Move content from your old site', plain: 'We carry over the text, photos and articles from your current website.' },
    id: { name: 'Pindahkan konten website lama', plain: 'Kami pindahkan teks, foto, dan artikel dari website Anda yang sekarang.' },
    ja: { name: '今のサイトから移行', plain: '現在のサイトの文章・写真・記事を引き継ぎます。' },
  },

  // Marketing & SEO
  seo_advanced: {
    en: { name: 'Advanced Google optimization', plain: 'Keyword research and in-depth optimization of every page to rank for the searches that matter.' },
    id: { name: 'Optimasi Google lanjutan', plain: 'Riset kata kunci dan optimasi mendalam tiap halaman agar muncul di pencarian yang penting.' },
    ja: { name: '本格的なGoogle対策', plain: 'キーワード調査と全ページの作り込みで、狙った検索で上位を取ります。' },
  },
  conversion_tracking: {
    en: { name: 'Ad tracking', plain: 'Measure which ads on Meta, Google or TikTok bring real customers.' },
    id: { name: 'Tracking iklan', plain: 'Ukur iklan mana di Meta, Google, atau TikTok yang benar-benar mendatangkan pelanggan.' },
    ja: { name: '広告の効果測定', plain: 'Meta・Google・TikTok のどの広告が実際に客を連れてくるか測れます。' },
  },
  popup_promo: {
    en: { name: 'Promo pop-up', plain: 'A pop-up for a promo, voucher or free download that turns visitors into leads.' },
    id: { name: 'Pop-up promo', plain: 'Pop-up promo, voucher, atau unduhan gratis yang mengubah pengunjung jadi calon pelanggan.' },
    ja: { name: 'ポップアップ告知', plain: 'キャンペーンやクーポン、資料請求のポップアップで見込み客を獲得。' },
  },
  social_feed: {
    en: { name: 'Instagram feed', plain: 'Your latest social media posts appear on the site automatically.' },
    id: { name: 'Feed Instagram', plain: 'Postingan media sosial terbaru Anda tampil otomatis di website.' },
    ja: { name: 'Instagram フィード', plain: '最新の SNS 投稿がサイトに自動で表示されます。' },
  },

  // Accounts & users
  social_login: {
    en: { name: 'Sign in with Google', plain: 'Users log in with one tap using their Google account.' },
    id: { name: 'Login dengan Google', plain: 'Pengguna bisa login sekali klik memakai akun Google mereka.' },
    ja: { name: 'Google でログイン', plain: 'Google アカウントでワンタップでログインできます。' },
  },
  roles_permissions: {
    en: { name: 'User roles & permissions', plain: 'Different access for admins, staff and members, so each sees only what they should.' },
    id: { name: 'Peran & hak akses', plain: 'Akses berbeda untuk admin, staf, dan member, sehingga masing-masing hanya melihat yang perlu.' },
    ja: { name: '権限とロール管理', plain: '管理者・スタッフ・会員で見える範囲を分けられます。' },
  },
  member_area: {
    en: { name: 'Member area', plain: 'A personal dashboard with each member\'s history and members-only content.' },
    id: { name: 'Area member', plain: 'Dashboard pribadi berisi riwayat masing-masing member dan konten khusus member.' },
    ja: { name: '会員ページ', plain: '会員ごとの専用ダッシュボード。' },
  },

  // Admin & management
  reports_dashboard: {
    en: { name: 'Reports & charts', plain: 'See sales, sign-ups or bookings at a glance with simple charts.' },
    id: { name: 'Laporan & grafik', plain: 'Lihat penjualan, pendaftaran, atau booking sekilas lewat grafik sederhana.' },
    ja: { name: 'レポートとグラフ', plain: '売上・登録・予約の状況をシンプルなグラフで把握。' },
  },
  data_export: {
    en: { name: 'Export to Excel', plain: 'Download your data (orders, members, leads) as an Excel or CSV file.' },
    id: { name: 'Export ke Excel', plain: 'Unduh data Anda (pesanan, member, kontak) dalam file Excel atau CSV.' },
    ja: { name: 'Excel への書き出し', plain: '注文・会員・問い合わせのデータを Excel や CSV で取り出せます。' },
  },
  file_upload: {
    en: { name: 'File uploads', plain: 'Customers can upload documents or photos, e.g. a CV, design file or ID.' },
    id: { name: 'Upload file', plain: 'Pelanggan bisa mengunggah dokumen atau foto, misalnya CV, file desain, atau KTP.' },
    ja: { name: 'ファイルのアップロード', plain: 'お客様が書類や写真を送れます。履歴書、デザインデータ、本人確認書類など。' },
  },

  // Store & payments
  manual_payment: {
    en: { name: 'Bank transfer with confirmation', plain: 'Customers pay by transfer, upload the receipt, and you confirm it in the admin.' },
    id: { name: 'Transfer manual + konfirmasi', plain: 'Pelanggan bayar via transfer, unggah bukti, lalu Anda konfirmasi di admin.' },
    ja: { name: '振込＋確認フロー', plain: 'お客様が振込して控えを添付し、管理画面で入金確認します。' },
  },
  product_catalog: {
    en: { name: 'Product catalog', plain: 'Products organized in categories with filters and a page for each product.' },
    id: { name: 'Katalog produk', plain: 'Produk tersusun per kategori dengan filter dan halaman untuk tiap produk.' },
    ja: { name: '商品カタログ', plain: 'カテゴリと絞り込みで整理し、商品ごとにページを用意します。' },
  },
  shopping_cart: {
    en: { name: 'Cart & checkout', plain: 'Customers add products to a cart and order them in a few steps.' },
    id: { name: 'Keranjang & checkout', plain: 'Pelanggan memasukkan produk ke keranjang lalu memesan dalam beberapa langkah.' },
    ja: { name: 'カートと購入手続き', plain: 'カートに入れて数ステップで注文できます。' },
  },
  product_variants: {
    en: { name: 'Product options & stock', plain: 'Sizes, colors and stock per option, so customers never order what is sold out.' },
    id: { name: 'Varian produk & stok', plain: 'Ukuran, warna, dan stok per varian, agar pelanggan tidak memesan barang yang habis.' },
    ja: { name: '商品オプションと在庫', plain: 'サイズ・色ごとの在庫管理で、売り切れを注文されません。' },
  },
  shipping_calculator: {
    en: { name: 'Automatic shipping cost', plain: 'Shipping is calculated from the courier and the customer\'s address.' },
    id: { name: 'Ongkir otomatis', plain: 'Ongkos kirim dihitung otomatis dari kurir dan alamat pelanggan.' },
    ja: { name: '送料の自動計算', plain: '配送業者とお届け先から送料を自動で計算します。' },
  },
  discount_voucher: {
    en: { name: 'Discount codes', plain: 'Create voucher codes for promos, with limits and end dates.' },
    id: { name: 'Kode diskon / voucher', plain: 'Buat kode voucher untuk promo, lengkap dengan batas pemakaian dan tanggal berakhir.' },
    ja: { name: 'クーポンコード', plain: '利用上限や期限つきのクーポンを発行できます。' },
  },
  invoice_pdf: {
    en: { name: 'Automatic invoices', plain: 'A PDF invoice or receipt is created and sent for every order.' },
    id: { name: 'Invoice otomatis', plain: 'Invoice atau kuitansi PDF dibuat dan dikirim untuk setiap pesanan.' },
    ja: { name: '請求書・領収書の自動発行', plain: '注文ごとに PDF の請求書・領収書を作って送ります。' },
  },
  subscription_billing: {
    en: { name: 'Subscriptions', plain: 'Charge customers monthly or yearly for a membership or service.' },
    id: { name: 'Langganan berulang', plain: 'Tagih pelanggan bulanan atau tahunan untuk membership atau layanan.' },
    ja: { name: 'サブスクリプション課金', plain: '月額・年額で会費やサービス料を継続課金します。' },
  },

  // Booking & scheduling
  booking_calendar: {
    en: { name: 'Booking calendar', plain: 'Customers pick a free date and time slot and book it themselves.' },
    id: { name: 'Kalender booking', plain: 'Pelanggan memilih tanggal dan jam yang kosong lalu booking sendiri.' },
    ja: { name: '予約カレンダー', plain: '空いている日時をお客様自身が選んで予約できます。' },
  },
  booking_reminder: {
    en: { name: 'Appointment reminders', plain: 'Customers get a reminder before their appointment, so fewer no-shows.' },
    id: { name: 'Pengingat jadwal', plain: 'Pelanggan dapat pengingat sebelum jadwalnya, sehingga lebih sedikit yang tidak datang.' },
    ja: { name: '予約リマインド', plain: '来店前にリマインドが届くので、無断キャンセルが減ります。' },
  },
  multi_staff_schedule: {
    en: { name: 'Schedules per staff / branch', plain: 'Each staff member or branch has its own hours and bookings.' },
    id: { name: 'Jadwal per staf / cabang', plain: 'Setiap staf atau cabang punya jam kerja dan booking masing-masing.' },
    ja: { name: 'スタッフ・店舗ごとの予定', plain: 'スタッフや店舗ごとに営業時間と予約枠を持てます。' },
  },
  calendar_sync: {
    en: { name: 'Google Calendar sync', plain: 'New bookings appear in your Google Calendar automatically.' },
    id: { name: 'Sinkron Google Calendar', plain: 'Booking baru otomatis muncul di Google Calendar Anda.' },
    ja: { name: 'Google カレンダー連携', plain: '新しい予約が Google カレンダーに自動で入ります。' },
  },

  // Courses & membership
  course_player: {
    en: { name: 'Course lessons', plain: 'Courses organized in modules with video and text lessons.' },
    id: { name: 'Materi kursus', plain: 'Kursus tersusun per modul dengan materi video dan teks.' },
    ja: { name: '講座の教材', plain: '動画とテキストの教材をモジュール単位で構成します。' },
  },
  progress_tracking: {
    en: { name: 'Learning progress', plain: 'Students see how far they are, and you see who is falling behind.' },
    id: { name: 'Progres belajar', plain: 'Siswa melihat sejauh mana progresnya, dan Anda tahu siapa yang tertinggal.' },
    ja: { name: '学習の進捗', plain: '受講者は進み具合を確認でき、あなたは遅れている人を把握できます。' },
  },
  quiz: {
    en: { name: 'Quizzes & scores', plain: 'Quizzes that are graded automatically, with scores saved per student.' },
    id: { name: 'Kuis & nilai', plain: 'Kuis yang dinilai otomatis, dengan nilai tersimpan per siswa.' },
    ja: { name: '小テストと採点', plain: '自動採点のテストで、受講者ごとに点数を保存します。' },
  },
  certificate: {
    en: { name: 'Certificates', plain: 'A certificate is generated automatically when a student completes a course.' },
    id: { name: 'Sertifikat', plain: 'Sertifikat dibuat otomatis saat siswa menyelesaikan kursus.' },
    ja: { name: '修了証の自動発行', plain: '講座を修了すると修了証が自動で作られます。' },
  },

  // Integrations & AI
  api_integration: {
    en: { name: 'Connect another service', plain: 'Link the site to a tool you already use, such as accounting, CRM or a marketplace. Priced per service.', unit: 'service' },
    id: { name: 'Hubungkan layanan lain', plain: 'Sambungkan website ke aplikasi yang sudah Anda pakai, seperti akuntansi, CRM, atau marketplace. Dihitung per layanan.', unit: 'layanan' },
    ja: { name: '外部サービス連携', plain: '会計・CRM・モールなど、今お使いのツールとつなぎます。サービスごとの料金です。', unit: 'サービス' },
  },
  sheets_sync: {
    en: { name: 'Google Sheets sync', plain: 'Form entries or orders are added to a Google Sheet automatically.' },
    id: { name: 'Sinkron Google Sheets', plain: 'Isian form atau pesanan otomatis masuk ke Google Sheets.' },
    ja: { name: 'Google スプレッドシート連携', plain: 'フォームの回答や注文が自動でスプレッドシートに追記されます。' },
  },
  ai_chatbot: {
    en: { name: 'AI chatbot', plain: 'An assistant that answers common questions 24/7 using your own information. AI usage fees are paid separately.' },
    id: { name: 'Chatbot AI', plain: 'Asisten yang menjawab pertanyaan umum 24 jam memakai informasi bisnis Anda. Biaya pemakaian AI dibayar terpisah.' },
    ja: { name: 'AI チャットボット', plain: '自社の情報をもとに、よくある質問に24時間答えるアシスタント。AI の利用料は別途です。' },
  },
  ai_generator: {
    en: { name: 'Custom AI feature', plain: 'An AI tool built for your business, such as a content generator or product recommendations. AI usage fees are paid separately.' },
    id: { name: 'Fitur AI khusus', plain: 'Fitur AI yang dibuat untuk bisnis Anda, seperti pembuat konten atau rekomendasi produk. Biaya pemakaian AI dibayar terpisah.' },
    ja: { name: 'オリジナルのAI機能', plain: '文章生成やおすすめ表示など、事業に合わせて作る AI 機能。AI の利用料は別途です。' },
  },

  // Security, legal & performance
  spam_protection: {
    en: { name: 'Spam protection', plain: 'Stops bots from flooding your forms with spam.' },
    id: { name: 'Anti-spam', plain: 'Mencegah bot membanjiri form Anda dengan spam.' },
    ja: { name: 'スパム対策', plain: 'ボットによるフォームの大量送信を防ぎます。' },
  },
  legal_pages: {
    en: { name: 'Privacy, terms & cookie notice', plain: 'Privacy policy and terms pages plus a cookie notice, so you meet basic legal requirements.' },
    id: { name: 'Halaman privasi, syarat & cookie', plain: 'Halaman kebijakan privasi dan syarat, plus pemberitahuan cookie, untuk memenuhi aturan dasar.' },
    ja: { name: 'プライバシー・規約・Cookie表示', plain: 'プライバシーポリシーと利用規約、Cookie のお知らせで最低限の法令対応をします。' },
  },
  pwa: {
    en: { name: 'Installable on phones', plain: 'Visitors can add the site to their home screen and open it like an app.' },
    id: { name: 'Bisa di-install di HP', plain: 'Pengunjung bisa menambahkan website ke layar HP dan membukanya seperti aplikasi.' },
    ja: { name: 'スマホにインストール可能', plain: 'ホーム画面に追加して、アプリのように開けます。' },
  },
};

/** Groups for the feature catalog (order comes from feature_categories in pricing.json). */
export const CATEGORY_COPY: Record<string, Record<Locale, string>> = {
  contact: { en: 'Contact & communication', id: 'Kontak & komunikasi', ja: '問い合わせ・連絡' },
  content: { en: 'Content & presentation', id: 'Konten & tampilan', ja: 'コンテンツ・見せ方' },
  marketing: { en: 'Marketing & Google', id: 'Marketing & Google', ja: '集客・Google' },
  accounts: { en: 'Accounts & users', id: 'Akun & pengguna', ja: 'アカウント・会員' },
  admin: { en: 'Admin & management', id: 'Admin & pengelolaan', ja: '管理・運用' },
  commerce: { en: 'Store & payments', id: 'Toko & pembayaran', ja: 'ストア・決済' },
  booking: { en: 'Booking & scheduling', id: 'Booking & jadwal', ja: '予約・スケジュール' },
  learning: { en: 'Courses & membership', id: 'Kursus & membership', ja: '講座・会員制' },
  integration: { en: 'Integrations & AI', id: 'Integrasi & AI', ja: '外部連携・AI' },
  trust: { en: 'Security, legal & performance', id: 'Keamanan, legal & performa', ja: 'セキュリティ・法務・表示速度' },
};

/** Short names for each page type in pricing.json (page_types), shown when the AI's own page name is missing. */
export const PAGE_COPY: Record<string, Record<Locale, string>> = {
  home: { en: 'Home', id: 'Beranda', ja: 'ホーム' },
  about: { en: 'About', id: 'Tentang', ja: '会社概要' },
  services: { en: 'Services / Products', id: 'Layanan / Produk', ja: 'サービス / 商品' },
  service_detail: { en: 'Service details', id: 'Detail layanan', ja: 'サービス詳細' },
  team: { en: 'Team', id: 'Tim', ja: 'チーム' },
  pricing: { en: 'Pricing', id: 'Harga & paket', ja: '料金・プラン' },
  faq: { en: 'FAQ', id: 'FAQ', ja: 'よくある質問' },
  contact: { en: 'Contact & location', id: 'Kontak & lokasi', ja: '問い合わせ・所在地' },
  custom: { en: 'Content page', id: 'Halaman konten', ja: 'コンテンツページ' },
  product_list: { en: 'Product list', id: 'Daftar produk', ja: '商品一覧' },
  product_detail: { en: 'Product page', id: 'Detail produk', ja: '商品詳細' },
  cart: { en: 'Cart', id: 'Keranjang', ja: 'カート' },
  checkout: { en: 'Checkout', id: 'Checkout', ja: 'ご購入手続き' },
  blog_list: { en: 'Articles', id: 'Daftar artikel', ja: '記事一覧' },
  article: { en: 'Article page', id: 'Halaman artikel', ja: '記事ページ' },
  project_list: { en: 'Portfolio', id: 'Portofolio', ja: '実績' },
  project_detail: { en: 'Project page', id: 'Detail proyek', ja: '実績詳細' },
  booking: { en: 'Booking', id: 'Booking', ja: '予約' },
  events: { en: 'Events', id: 'Acara', ja: 'イベント' },
  search_results: { en: 'Search results', id: 'Hasil pencarian', ja: '検索結果' },
  legal: { en: 'Privacy & terms', id: 'Privasi & syarat', ja: 'プライバシー・規約' },
  course_list: { en: 'Courses', id: 'Daftar kursus', ja: '講座一覧' },
  login: { en: 'Log in / Sign up', id: 'Masuk / Daftar', ja: 'ログイン / 新規登録' },
  account: { en: 'My account', id: 'Akun saya', ja: 'マイアカウント' },
  my_orders: { en: 'My orders', id: 'Pesanan saya', ja: '注文履歴' },
  manage_booking: { en: 'Manage your booking', id: 'Kelola booking Anda', ja: 'ご予約の確認・変更' },
  my_bookings: { en: 'My bookings', id: 'Booking saya', ja: 'マイ予約' },
  my_courses: { en: 'My courses', id: 'Kursus saya', ja: '受講中の講座' },
  lesson: { en: 'Lesson', id: 'Materi kursus', ja: '教材' },
  member_content: { en: 'Members-only content', id: 'Konten member', ja: '会員限定コンテンツ' },
  custom_member: { en: 'Member screen', id: 'Layar member', ja: '会員画面' },
  manage_content: { en: 'Manage content', id: 'Kelola konten', ja: 'コンテンツ管理' },
  manage_products: { en: 'Manage products', id: 'Kelola produk', ja: '商品管理' },
  orders: { en: 'Orders', id: 'Pesanan', ja: '注文管理' },
  manage_bookings: { en: 'Manage bookings', id: 'Kelola booking', ja: '予約管理' },
  reports: { en: 'Reports', id: 'Laporan', ja: 'レポート' },
  custom_admin: { en: 'Admin screen', id: 'Layar admin', ja: '管理画面' },
};

type Option = Record<Locale, { label: string; hint: string }>;

/** Copy for the three price multipliers the client picks in the consultation. */
export const MULTIPLIER_COPY: Record<'design_level' | 'content_readiness' | 'timeline', { question: Record<Locale, string>; options: Record<string, Option> }> = {
  design_level: {
    question: { en: 'How unique should the design be?', id: 'Seberapa unik desainnya?', ja: 'デザインはどこまで独自にしますか？' },
    options: {
      template: { en: { label: 'Clean & proven', hint: 'A polished layout in your colors and content' }, id: { label: 'Rapi & teruji', hint: 'Tata letak rapi dengan warna dan konten Anda' }, ja: { label: '整った実績ある型', hint: 'お好みの色と内容で仕上げた、完成度の高いレイアウト' } },
      semi_custom: { en: { label: 'Tailored to your brand', hint: 'Layout and details shaped around your brand' }, id: { label: 'Sesuai brand Anda', hint: 'Tata letak dan detail disesuaikan dengan brand' }, ja: { label: 'ブランドに合わせる', hint: 'レイアウトと細部をブランドに合わせて調整' } },
      full_custom: { en: { label: 'One of a kind', hint: 'Designed from scratch with signature motion' }, id: { label: 'Benar-benar unik', hint: 'Didesain dari nol dengan animasi khas' }, ja: { label: '完全オリジナル', hint: 'ゼロから設計し、独自の動きまで作り込みます' } },
    },
  },
  content_readiness: {
    question: { en: 'Are your text & photos ready?', id: 'Teks & foto sudah siap?', ja: '文章と写真は揃っていますか？' },
    options: {
      ready: { en: { label: 'All ready', hint: '' }, id: { label: 'Sudah semua', hint: '' }, ja: { label: 'すべて揃っている', hint: '' } },
      partial: { en: { label: 'Some of it', hint: '' }, id: { label: 'Sebagian', hint: '' }, ja: { label: '一部だけ', hint: '' } },
      none: { en: { label: 'Not yet', hint: '' }, id: { label: 'Belum ada', hint: '' }, ja: { label: 'まだない', hint: '' } },
    },
  },
  timeline: {
    question: { en: 'When do you need it online?', id: 'Kapan perlu online?', ja: '公開はいつ頃が希望ですか？' },
    options: {
      normal: { en: { label: 'Normal pace', hint: '' }, id: { label: 'Normal', hint: '' }, ja: { label: '通常のペース', hint: '' } },
      priority: { en: { label: 'Sooner', hint: '' }, id: { label: 'Lebih cepat', hint: '' }, ja: { label: 'やや急ぎ', hint: '' } },
      rush: { en: { label: 'ASAP', hint: '' }, id: { label: 'Secepatnya', hint: '' }, ja: { label: 'できるだけ早く', hint: '' } },
    },
  },
};

export const RECURRING_COPY: Record<string, Record<Locale, { name: string; billing: string }>> = {
  maintenance_basic: { en: { name: 'Care plan: backups, security updates, 1 small fix', billing: 'month' }, id: { name: 'Perawatan: backup, update keamanan, 1 perbaikan kecil', billing: 'bulan' }, ja: { name: '保守プラン：バックアップ、セキュリティ更新、軽微な修正1件', billing: '月' } },
  maintenance_plus: { en: { name: 'Care plan plus: also up to 3 content updates', billing: 'month' }, id: { name: 'Perawatan plus: termasuk 3 update konten', billing: 'bulan' }, ja: { name: '保守プラン プラス：上記＋コンテンツ更新3件まで', billing: '月' } },
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
    ja: {
      name: 'サーバーとドメイン',
      billing: '年',
      note: '提供事業者とプランはお客様が選び、直接お支払いいただきます。アカウントがお客様名義のまま残るようにするためです。設定作業は無料でこちらが行います。',
    },
  },
};
