import type { Locale } from '../lib/schemas';

export const SERVICE_KEYS = ['company_profile', 'landing', 'online_store', 'portfolio', 'lms', 'booking', 'web_app', 'blog'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

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

export const ROUTES = {
  home: { en: '/', id: '/id/' },
  consult: { en: '/consult/', id: '/id/konsultasi/' },
  privacy: { en: '/privacy/', id: '/id/privasi/' },
  terms: { en: '/terms/', id: '/id/syarat-ketentuan/' },
} satisfies Record<string, Record<Locale, string>>;
export type RouteKey = keyof typeof ROUTES;

export const servicePath = (key: ServiceKey, locale: Locale) =>
  locale === 'id' ? `/id/layanan/${SERVICE_SLUGS[key].id}/` : `/services/${SERVICE_SLUGS[key].en}/`;

/** Every localized page as { en, id } path pairs — the single source for hreflang and sitemap alternates. */
export function allPagePairs(): Record<Locale, string>[] {
  return [...Object.values(ROUTES), ...SERVICE_KEYS.map((k) => ({ en: servicePath(k, 'en'), id: servicePath(k, 'id') }))];
}

const norm = (p: string) => (p.endsWith('/') ? p : p + '/');

export function pairFor(pathname: string): Record<Locale, string> | undefined {
  const p = norm(pathname);
  return allPagePairs().find((pair) => pair.en === p || pair.id === p);
}

export function alternatesFor(pathname: string, site: string) {
  const pair = pairFor(pathname);
  if (!pair) return undefined;
  return [
    { lang: 'en', url: site + pair.en },
    { lang: 'id', url: site + pair.id },
    { lang: 'x-default', url: site + pair.en },
  ];
}
