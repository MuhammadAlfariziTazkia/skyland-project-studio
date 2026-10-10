import type { ConceptKey } from '../../i18n/routes';
import type { Locale, ThemeId } from '../schemas';

/**
 * Scope of each studio concept as a full production build, in one place.
 *
 * The demos in `public/samples/` are mockups: most of what they imply is not wired up. This file is the
 * answer to "what would this cost for real", and it is the ONLY answer — the concept detail page, the
 * pricing engine and the calibration test in `tests/pricing.test.ts` all read it, so a price shown to a
 * client cannot drift from the figures in `docs/PRICING_RESEARCH_01_MARKET.md`.
 *
 * Nothing here is a price. Prices come from `data/pricing.json` via `quote()`, exactly as they do for a
 * plan the AI produced.
 */

/**
 * How badly this business sector needs the feature — a judgement about the sector, never about the price.
 * `core` means the business cannot operate without it, so it is pre-selected; `nice` is a real extra.
 * Ordering is need first, then price ascending (see `orderedFeatures`), which is what puts the
 * needed-and-cheap items at the top of the list.
 */
export type Need = 'core' | 'nice';

export interface SampleFeature {
  id: string;
  need: Need;
}

export interface SamplePage {
  type: string;
  name: Record<Locale, string>;
}

export interface SampleSpec {
  key: ConceptKey;
  /** id in pricing.json services[] */
  serviceId: string;
  /** Preset visual style, so the client is not asked. Changeable later on the result screen. */
  theme: ThemeId;
  /** Preset design level. The concepts are bespoke designs, so this is full_custom. */
  design: string;
  /** Public pages with no feature behind them: the only ones billed against the package quota. */
  contentPages: SamplePage[];
  /** Screens a feature brings. Not billed as pages; they appear only while that feature is on. */
  featurePages: SamplePage[];
  features: SampleFeature[];
  /** Capabilities deliberately out of scope, shown to the client rather than quietly dropped. */
  notOffered?: { label: Record<Locale, string>; why: Record<Locale, string> }[];
  /** A caveat the client must read before ordering, e.g. how shipping is handled without a courier API. */
  caveats?: Record<Locale, string>[];
}

const p = (type: string, en: string, id: string): SamplePage => ({ type, name: { en, id } });
const core = (...ids: string[]): SampleFeature[] => ids.map((id) => ({ id, need: 'core' as const }));
const nice = (...ids: string[]): SampleFeature[] => ids.map((id) => ({ id, need: 'nice' as const }));

export const SAMPLE_SPECS: Record<ConceptKey, SampleSpec> = {
  /** General contractor. Leads are the whole point, and the project catalogue is the credibility. */
  tegak: {
    key: 'tegak',
    serviceId: 'company_profile',
    theme: 'corporate',
    design: 'full_custom',
    contentPages: [
      p('home', 'Home', 'Beranda'),
      p('about', 'About the company', 'Tentang perusahaan'),
      p('services', 'Services', 'Layanan'),
      p('service_detail', 'Service detail', 'Detail layanan'),
      p('custom', 'Capabilities', 'Kapabilitas'),
      p('custom', 'Coverage area', 'Area layanan'),
      p('custom', 'Certifications', 'Sertifikasi'),
      p('contact', 'Contact', 'Kontak'),
    ],
    featurePages: [
      p('legal', 'Privacy & terms', 'Privasi & syarat'),
      p('project_list', 'Projects', 'Proyek'),
      p('project_detail', 'Project detail', 'Detail proyek'),
      p('manage_content', 'Manage content', 'Kelola konten'),
      p('custom_admin', 'Manage projects', 'Kelola proyek'),
      p('custom_admin', 'Enquiries', 'Pengajuan masuk'),
    ],
    features: [
      ...core('whatsapp_button', 'google_maps', 'legal_pages', 'spam_protection', 'gallery', 'contact_form', 'seo_basic', 'portfolio_filter', 'cms_admin'),
      ...nice('analytics', 'file_upload', 'custom_animation', 'roles_permissions'),
    ],
  },

  /** Independent bookshop. The package already includes the commerce engine, so the extras stay small. */
  lembar: {
    key: 'lembar',
    serviceId: 'online_store',
    theme: 'editorial',
    design: 'full_custom',
    contentPages: [
      p('home', 'Home', 'Beranda'),
      p('about', 'About the shop', 'Tentang toko'),
      p('contact', 'Contact', 'Kontak'),
      p('faq', 'FAQ', 'Tanya jawab'),
      p('custom', 'Shipping & returns', 'Pengiriman & pengembalian'),
    ],
    featurePages: [
      p('legal', 'Privacy & terms', 'Privasi & syarat'),
      p('product_list', 'Books', 'Daftar buku'),
      p('product_detail', 'Book detail', 'Detail buku'),
      p('cart', 'Cart', 'Keranjang'),
      p('checkout', 'Checkout', 'Checkout'),
      p('search_results', 'Search results', 'Hasil pencarian'),
      p('login', 'Sign in', 'Masuk'),
      p('account', 'My account', 'Akun saya'),
      p('my_orders', 'My orders', 'Pesanan saya'),
      p('manage_products', 'Manage books', 'Kelola buku'),
      p('orders', 'Orders', 'Pesanan'),
      p('manage_content', 'Manage content', 'Kelola konten'),
      p('custom_admin', 'Vouchers', 'Voucher'),
    ],
    features: [
      // payment, cms_admin, product_catalog and shopping_cart come free with the package.
      ...core('payment', 'cms_admin', 'product_catalog', 'shopping_cart', 'legal_pages', 'spam_protection', 'seo_basic', 'search', 'email_notifications', 'product_variants'),
      ...nice('data_export', 'invoice_pdf', 'discount_voucher', 'custom_animation', 'roles_permissions', 'user_login'),
    ],
    caveats: [
      {
        en: 'Shipping is charged with flat or zone rates set in the admin panel, not a live courier API — that keeps the build free of a courier subscription.',
        id: 'Ongkir dihitung dengan tarif flat atau per zona yang Anda atur sendiri di panel admin, bukan API kurir langsung — supaya tidak ada langganan kurir yang harus dibayar terus.',
      },
    ],
  },

  /** Barber studio. The package includes the booking engine; per-barber scheduling is what the concept is about. */
  kurohane: {
    key: 'kurohane',
    serviceId: 'booking_reservation',
    theme: 'elegant',
    design: 'full_custom',
    contentPages: [
      p('home', 'Home', 'Beranda'),
      p('about', 'Philosophy', 'Filosofi'),
      p('services', 'Menu & prices', 'Menu & harga'),
      p('team', 'Barbers', 'Barber'),
      p('custom', 'First visit', 'Kunjungan pertama'),
      p('faq', 'FAQ', 'Tanya jawab'),
      p('contact', 'Access & hours', 'Lokasi & jam buka'),
    ],
    featurePages: [
      p('legal', 'Privacy & cancellation', 'Privasi & pembatalan'),
      p('booking', 'Book an appointment', 'Pesan jadwal'),
      p('manage_booking', 'Manage your booking', 'Kelola booking Anda'),
      p('manage_bookings', 'Booking calendar', 'Kalender booking'),
      p('manage_content', 'Manage content', 'Kelola konten'),
      p('custom_admin', 'Staff & shifts', 'Staf & jadwal kerja'),
    ],
    features: [
      // contact_form, cms_admin, booking_calendar and email_notifications come free with the package.
      ...core('contact_form', 'cms_admin', 'booking_calendar', 'email_notifications', 'google_maps', 'legal_pages', 'spam_protection', 'gallery', 'booking_reminder', 'seo_basic', 'multi_staff_schedule'),
      ...nice('portfolio_filter', 'custom_animation', 'roles_permissions'),
    ],
  },

  /**
   * Property auction house — catalogue only. Bidding and payment do not happen on the website, so this is a
   * showcase and lead site rather than a transaction platform. That is why it is priced as a company
   * profile and not as a custom web app (whose `risk_tier: review` would pin it to `discuss` forever).
   */
  arden: {
    key: 'arden',
    serviceId: 'company_profile',
    theme: 'luxury',
    design: 'full_custom',
    contentPages: [
      p('home', 'Home', 'Beranda'),
      p('about', 'About the house', 'Tentang kami'),
      p('custom', 'How to buy', 'Cara membeli'),
      p('custom', 'How to sell', 'Cara menjual'),
      p('services', 'Corporate services', 'Layanan korporat'),
      p('custom', 'Trust & compliance', 'Kepatuhan & kepercayaan'),
      p('faq', 'FAQ', 'Tanya jawab'),
      p('contact', 'Contact', 'Kontak'),
    ],
    featurePages: [
      p('legal', 'Privacy & terms', 'Privasi & syarat'),
      p('project_list', 'Lots for auction', 'Daftar lot lelang'),
      p('project_detail', 'Lot detail & documents', 'Detail lot & dokumen'),
      p('events', 'Auction calendar', 'Kalender lelang'),
      p('search_results', 'Search results', 'Hasil pencarian'),
      p('blog_list', 'Market insight', 'Insight pasar'),
      p('article', 'Insight article', 'Artikel insight'),
      p('login', 'Sign in', 'Masuk'),
      p('account', 'My account', 'Akun saya'),
      p('member_content', 'Registered buyer area', 'Area peminat terdaftar'),
      p('manage_content', 'Manage content', 'Kelola konten'),
      p('manage_products', 'Manage lots', 'Kelola lot'),
      p('custom_admin', 'Documents & enquiries', 'Dokumen & pengajuan'),
    ],
    features: [
      ...core('legal_pages', 'spam_protection', 'gallery', 'contact_form', 'file_upload', 'seo_basic', 'search', 'portfolio_filter', 'events_calendar', 'multi_step_form', 'roles_permissions', 'cms_admin'),
      ...nice('analytics', 'data_export', 'custom_animation', 'blog_section', 'member_area', 'user_login'),
    ],
    notOffered: [
      {
        label: { en: 'Live online bidding', id: 'Bidding online real-time' },
        why: {
          en: 'Bidding stays off the website. A real-time bid engine needs atomic bid ordering, anti-sniping rules and a tamper-proof audit trail, and a mistake there becomes a legal dispute with a third party.',
          id: 'Penawaran tetap dilakukan di luar website. Mesin bid real-time menuntut urutan bid atomik, aturan anti-sniping, dan jejak audit yang tidak bisa diubah — dan kesalahan di situ menjadi sengketa hukum dengan pihak ketiga.',
        },
      },
      {
        label: { en: 'Deposits and settlement', id: 'Deposit dan penyelesaian pembayaran' },
        why: {
          en: 'No money moves through the site. Deposits, refunds and settlement are handled by your existing process, and the site only publishes what bidders must know.',
          id: 'Tidak ada uang yang lewat website. Deposit, pengembalian, dan pelunasan tetap memakai proses Anda yang sekarang; website hanya menerbitkan informasi yang perlu diketahui peserta.',
        },
      },
    ],
  },
};

export const sampleSpec = (key: ConceptKey): SampleSpec => SAMPLE_SPECS[key];
