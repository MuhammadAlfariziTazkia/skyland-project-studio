import pricing from '../../data/pricing.json';
import { currencyOf, quote, regionFor, startingPrice } from './pricing';
import { SITE, socialLinks } from '../config/site';
import { getDict } from '../i18n';
import { ROUTES, SERVICE_KEYS, conceptPath, servicePath, type ConceptKey, type ServiceKey } from '../i18n/routes';
import { essentialIds, toPlan } from './samples/plan';
import { SAMPLE_SPECS } from './samples/specs';
import { LOCALES, type Locale } from './schemas';

const ALT_NAME: Record<Locale, string> = {
  en: 'Skyland – Website Development Studio',
  id: 'Skyland – Jasa Pembuatan Website',
  ja: 'Skyland – ウェブサイト制作スタジオ',
};
const CATALOG_NAME: Record<Locale, string> = {
  en: 'Website Development Services',
  id: 'Jasa Pembuatan Website',
  ja: 'ウェブサイト制作サービス',
};

const abs = (site: string, path: string) => site + path;

export function organizationLd(site: string, locale: Locale) {
  const t = getDict(locale);
  const cur = t.currency;
  const region = regionFor(locale);
  const starts = SERVICE_KEYS.map((k) => startingPrice(k, region));
  // Every market formats in its own currency; this used to print a JPY range with a dollar sign.
  const fmt = (n: number) => new Intl.NumberFormat(pricing.regions[region].locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site}/#business`,
    name: SITE.name,
    alternateName: ALT_NAME[locale],
    url: abs(site, ROUTES.home[locale]),
    logo: `${site}/logo.png`,
    image: `${site}/og-${locale}.png`,
    description: t.meta.homeDescription,
    ...(SITE.email ? { email: SITE.email } : {}),
    ...(SITE.whatsapp ? { telephone: `+${SITE.whatsapp}` } : {}),
    priceRange: `${fmt(Math.min(...starts))} – ${fmt(pricing.regions[region].max_price)}`,
    currenciesAccepted: 'IDR, JPY, USD',
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
    areaServed: [{ '@type': 'Country', name: 'Indonesia' }, { '@type': 'Place', name: 'Worldwide' }],
    knowsLanguage: [...LOCALES],
    founder: { '@id': `${site}/#founder` },
    sameAs: socialLinks().map((s) => s.href),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: CATALOG_NAME[locale],
      itemListElement: SERVICE_KEYS.map((k) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t.services_list[k].name, url: abs(site, servicePath(k, locale)) },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: cur,
          minPrice: startingPrice(k, region),
        },
      })),
    },
  };
}

export function personLd(site: string, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site}/#founder`,
    name: SITE.founder.name,
    jobTitle: SITE.founder.role[locale],
    worksFor: { '@id': `${site}/#business` },
    image: `${site}/founder.jpg`,
    sameAs: socialLinks().map((s) => s.href),
  };
}

export function websiteLd(site: string, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    url: site + '/',
    name: SITE.name,
    inLanguage: locale,
    publisher: { '@id': `${site}/#business` },
  };
}

export function faqLd(items: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export function serviceLd(site: string, locale: Locale, key: ServiceKey) {
  const t = getDict(locale);
  const s = t.services_list[key];
  const cur = t.currency;
  const lo = startingPrice(key, regionFor(locale));
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.seo.h1,
    serviceType: s.name,
    description: s.seo.description,
    url: abs(site, servicePath(key, locale)),
    provider: { '@id': `${site}/#business` },
    areaServed: [{ '@type': 'Country', name: 'Indonesia' }, { '@type': 'Place', name: 'Worldwide' }],
    offers: { '@type': 'AggregateOffer', priceCurrency: cur, lowPrice: lo },
  };
}

/**
 * A concept page's priced offer, for machines only.
 *
 * The page itself states its price in exactly one place — the panel, which reads the market from the
 * visitor's device. A crawler has no device, so the offer here uses the locale's market: it is the same
 * number the `/id/` or `/ja/` page would have shown, and because nothing renders it, it can never
 * disagree with what a visitor reads.
 */
export function conceptLd(site: string, locale: Locale, concept: ConceptKey) {
  const t = getDict(locale);
  const copy = t.work.concepts.find((x) => x.key === concept)!;
  const spec = SAMPLE_SPECS[concept];
  const region = regionFor(locale);
  const q = quote(toPlan(spec, essentialIds(spec), locale), { region, design: spec.design as never, content: 'ready', timeline: 'normal', promoCode: '' }, locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: copy.name,
    serviceType: copy.type,
    description: copy.desc,
    url: abs(site, conceptPath(concept, locale)),
    provider: { '@id': `${site}/#business` },
    offers: {
      '@type': 'Offer',
      priceCurrency: currencyOf(region),
      ...(q.status === 'fixed' ? { price: q.total } : { priceSpecification: { '@type': 'PriceSpecification', priceCurrency: currencyOf(region), minPrice: q.total } }),
      availability: 'https://schema.org/InStock',
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
