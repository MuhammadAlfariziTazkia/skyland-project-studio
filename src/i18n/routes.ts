import { LOCALES, type Locale } from '../lib/schemas';

export const SERVICE_KEYS = ['company_profile', 'landing', 'online_store', 'portfolio', 'lms', 'booking', 'web_app', 'blog'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

/** The four studio concepts in `public/samples/`. Each one also has a priced detail page. */
export const CONCEPT_KEYS = ['tegak', 'lembar', 'kurohane', 'arden'] as const;
export type ConceptKey = (typeof CONCEPT_KEYS)[number];

export const SERVICE_SLUGS: Record<ServiceKey, Record<Locale, string>> = {
  company_profile: { en: 'company-profile-website', id: 'jasa-pembuatan-website-company-profile' },
  landing: { en: 'landing-page-development', id: 'jasa-pembuatan-landing-page' },
  online_store: { en: 'ecommerce-website-development', id: 'jasa-pembuatan-toko-online' },
  portfolio: { en: 'portfolio-website', id: 'jasa-pembuatan-website-portofolio' },
  lms: { en: 'online-course-lms-website', id: 'jasa-pembuatan-website-kursus-online-lms' },
  booking: { en: 'booking-reservation-website', id: 'jasa-pembuatan-website-booking-reservasi' },
  web_app: { en: 'custom-web-app-development', id: 'jasa-pembuatan-aplikasi-web' },
  blog: { en: 'blog-website', id: 'jasa-pembuatan-website-blog' },
};

export const CONCEPT_SLUGS: Record<ConceptKey, Record<Locale, string>> = {
  tegak: { en: 'construction-company-website', id: 'contoh-website-perusahaan-konstruksi' },
  lembar: { en: 'bookstore-online-store', id: 'contoh-website-toko-buku-online' },
  kurohane: { en: 'barbershop-booking-website', id: 'contoh-website-booking-barbershop' },
  arden: { en: 'property-auction-catalogue', id: 'contoh-website-katalog-lelang-properti' },
};

export const ROUTES = {
  home: { en: '/', id: '/id/' },
  consult: { en: '/consult/', id: '/id/konsultasi/' },
  privacy: { en: '/privacy/', id: '/id/privasi/' },
  terms: { en: '/terms/', id: '/id/syarat-ketentuan/' },
} satisfies Record<string, Record<Locale, string>>;
export type RouteKey = keyof typeof ROUTES;

/**
 * URL shape per locale. A lookup rather than a `locale === 'id'` ternary so adding a third locale
 * is a row here instead of an edit in every path helper.
 */
const SEGMENTS: Record<Locale, { base: string; services: string; concepts: string }> = {
  en: { base: '', services: 'services', concepts: 'concepts' },
  id: { base: '/id', services: 'layanan', concepts: 'konsep' },
};

export const servicePath = (key: ServiceKey, locale: Locale) =>
  `${SEGMENTS[locale].base}/${SEGMENTS[locale].services}/${SERVICE_SLUGS[key][locale]}/`;

export const conceptPath = (key: ConceptKey, locale: Locale) =>
  `${SEGMENTS[locale].base}/${SEGMENTS[locale].concepts}/${CONCEPT_SLUGS[key][locale]}/`;

const pairOf = (path: (locale: Locale) => string) => Object.fromEntries(LOCALES.map((l) => [l, path(l)])) as Record<Locale, string>;

/** Every localized page as path pairs — the single source for hreflang and sitemap alternates. */
export function allPagePairs(): Record<Locale, string>[] {
  return [
    ...Object.values(ROUTES),
    ...SERVICE_KEYS.map((k) => pairOf((l) => servicePath(k, l))),
    ...CONCEPT_KEYS.map((k) => pairOf((l) => conceptPath(k, l))),
  ];
}

const norm = (p: string) => (p.endsWith('/') ? p : p + '/');

export function pairFor(pathname: string): Record<Locale, string> | undefined {
  const p = norm(pathname);
  return allPagePairs().find((pair) => LOCALES.some((l) => pair[l] === p));
}

export function alternatesFor(pathname: string, site: string) {
  const pair = pairFor(pathname);
  if (!pair) return undefined;
  return [...LOCALES.map((lang) => ({ lang, url: site + pair[lang] })), { lang: 'x-default', url: site + pair.en }];
}
