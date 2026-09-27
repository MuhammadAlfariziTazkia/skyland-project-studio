import pricing from '../../data/pricing.json';
import { SITE, socialLinks } from '../config/site';
import { getDict } from '../i18n';
import { ROUTES, SERVICE_KEYS, servicePath, type ServiceKey } from '../i18n/routes';
import type { Locale } from './schemas';

const abs = (site: string, path: string) => site + path;

export function organizationLd(site: string, locale: Locale) {
  const t = getDict(locale);
  const cur = t.currency;
  const types = pricing.projectTypes;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site}/#business`,
    name: SITE.name,
    alternateName: locale === 'id' ? 'Skyland – Jasa Pembuatan Website' : 'Skyland – Website Development Studio',
    url: abs(site, ROUTES.home[locale]),
    logo: `${site}/logo.png`,
    image: `${site}/og-${locale}.png`,
    description: t.meta.homeDescription,
    ...(SITE.email ? { email: SITE.email } : {}),
    ...(SITE.whatsapp ? { telephone: `+${SITE.whatsapp}` } : {}),
    priceRange: cur === 'IDR' ? 'Rp 1.500.000 – Rp 60.000.000' : '$200 – $7,000',
    currenciesAccepted: 'IDR, USD',
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
    areaServed: [{ '@type': 'Country', name: 'Indonesia' }, { '@type': 'Place', name: 'Worldwide' }],
    knowsLanguage: ['id', 'en'],
    founder: { '@id': `${site}/#founder` },
    sameAs: socialLinks().map((s) => s.href),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'id' ? 'Jasa Pembuatan Website' : 'Website Development Services',
      itemListElement: SERVICE_KEYS.map((k) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t.services_list[k].name, url: abs(site, servicePath(k, locale)) },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: cur,
          minPrice: types[k].typicalRange[cur][0],
          maxPrice: types[k].typicalRange[cur][1],
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
  const [lo, hi] = pricing.projectTypes[key].typicalRange[cur];
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.seo.h1,
    serviceType: s.name,
    description: s.seo.description,
    url: abs(site, servicePath(key, locale)),
    provider: { '@id': `${site}/#business` },
    areaServed: [{ '@type': 'Country', name: 'Indonesia' }, { '@type': 'Place', name: 'Worldwide' }],
    offers: { '@type': 'AggregateOffer', priceCurrency: cur, lowPrice: lo, highPrice: hi },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
