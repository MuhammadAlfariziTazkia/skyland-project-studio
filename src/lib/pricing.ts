// Deterministic price engine for data/pricing.json (calculation.steps). Pure and isomorphic: the consultant
// UI imports it for a live preview, and the API recomputes with it on every order (the server is authoritative).
// The AI never sees or produces prices; it only picks ids that this engine prices.
import pricing from '../../data/pricing.json';
import { FEATURE_COPY, MULTIPLIER_COPY, SERVICE_COPY } from '../i18n/catalog';
import type { ServiceKey } from '../i18n/routes';
import type { Choices, Currency, Locale, Plan, Region } from './schemas';

export type PricingData = typeof pricing;
type Service = PricingData['services'][number] & { includes?: string[] };
type Feature = PricingData['features'][number] & { unit?: string };
type MultiplierKey = keyof PricingData['multipliers'];

/** Productive hours per workday, used to turn extra est_hours into extra days on the timeline. */
export const HOURS_PER_DAY = 6;

/** Website type used for URLs and copy → service id in pricing.json. */
export const SERVICE_PRICING_ID: Record<ServiceKey, string> = {
  company_profile: 'company_profile',
  landing: 'landing_page',
  online_store: 'online_store',
  portfolio: 'personal_portfolio',
  lms: 'online_course',
  booking: 'booking_reservation',
  web_app: 'custom_web_app',
  blog: 'blog_media',
};

export const regionFor = (locale: Locale): Region => (locale === 'id' ? 'ID' : 'GLOBAL');
export const currencyOf = (region: Region) => pricing.regions[region].currency as Currency;
export const defaultChoices = (locale: Locale): Choices => ({ region: regionFor(locale), design: 'semi_custom', content: 'partial', timeline: 'normal' });

export function getService(id: string, data: PricingData = pricing): Service {
  const s = data.services.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown service: ${id}`);
  return s;
}

export function getFeature(id: string, data: PricingData = pricing): Feature {
  const f = data.features.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown feature: ${id}`);
  return f;
}

const multiplier = (key: MultiplierKey, id: string, data: PricingData) => {
  const m = (data.multipliers[key] as { id: string; value: number; time_factor?: number }[]).find((x) => x.id === id);
  if (!m) throw new Error(`Unknown ${key}: ${id}`);
  return m;
};

const parseDays = (s: string): [number, number] => {
  const [a, b] = s.split('-').map(Number);
  return [a, b ?? a];
};

export function foundingSpotsLeft(data: PricingData = pricing): number {
  const f = data.founding_offer;
  return f.active ? Math.max(0, f.spots_total - f.spots_taken) : 0;
}

export interface QuoteLine {
  kind: 'base' | 'pages' | 'feature' | 'adjust';
  label: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  included?: boolean;
}

/** fixed: one final price · range: has custom requests, confirmed in a short call · discuss: above the region maximum, no number shown. */
export type QuoteStatus = 'fixed' | 'range' | 'discuss';

export interface Quote {
  region: Region;
  currency: Currency;
  status: QuoteStatus;
  lines: QuoteLine[];
  /** base + pages + features, before adjustments */
  subtotal: number;
  /** price_low: after multipliers, rounding and the region minimum */
  price: number;
  /** price_high = price × range_upper (shown only for "range") */
  priceHigh: number;
  discountPercent: number;
  discount: number;
  /** What the client pays: price − founding discount */
  total: number;
  totalHigh: number;
  workdays: [number, number];
  pagesCount: number;
  featuresCount: number;
  validDays: number;
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

const ADJUST: Record<MultiplierKey | 'round' | 'minimum', Record<Locale, string>> = {
  design_level: { en: 'Design', id: 'Desain' },
  content_readiness: { en: 'Content help', id: 'Bantuan konten' },
  timeline: { en: 'Faster delivery', id: 'Pengerjaan lebih cepat' },
  round: { en: 'Rounding', id: 'Pembulatan' },
  minimum: { en: 'Minimum project price', id: 'Harga minimum proyek' },
};

export function quote(plan: Plan, choices: Choices, locale: Locale, data: PricingData = pricing): Quote {
  const svc = getService(plan.serviceId, data);
  const region = choices.region;
  const reg = data.regions[region];
  const pagesCount = plan.pages.length;
  const lines: QuoteLine[] = [];
  let hours = 0;

  const n = svc.pages_included;
  lines.push({
    kind: 'base',
    label: SERVICE_COPY[svc.id]?.[locale].name ?? svc.name,
    detail: locale === 'id' ? `Termasuk ${n} halaman` : `Includes ${n} page${n > 1 ? 's' : ''}`,
    quantity: 1,
    unitPrice: svc.base[region],
    amount: svc.base[region],
  });

  const extra = Math.max(0, pagesCount - n);
  if (extra > 0) {
    const unit = data.extra_page.price[region];
    hours += extra * data.extra_page.est_hours;
    lines.push({ kind: 'pages', label: locale === 'id' ? 'Halaman tambahan' : 'Extra pages', quantity: extra, unitPrice: unit, amount: unit * extra });
  }

  const included = new Set(svc.includes ?? []);
  const seen = new Set<string>();
  for (const { id } of plan.features) {
    if (seen.has(id)) continue;
    seen.add(id);
    const def = getFeature(id, data);
    const label = FEATURE_COPY[id]?.[locale].name ?? def.label;
    if (included.has(id)) {
      lines.push({ kind: 'feature', label, quantity: 1, unitPrice: 0, amount: 0, included: true });
      continue;
    }
    const qty = def.unit ? pagesCount : 1; // the only unit in the catalog is "per halaman"
    hours += def.est_hours * qty;
    lines.push({ kind: 'feature', label, quantity: qty, unitPrice: def.price[region], amount: def.price[region] * qty });
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);

  // Multipliers compound (calculation step 3); each is shown as its own amount so the client sees what it costs.
  let running = subtotal;
  const picks: [MultiplierKey, string][] = [['design_level', choices.design], ['content_readiness', choices.content], ['timeline', choices.timeline]];
  for (const [key, id] of picks) {
    const m = multiplier(key, id, data);
    if (m.value === 1) continue;
    const amount = Math.round(running * (m.value - 1));
    running += amount;
    lines.push({ kind: 'adjust', label: ADJUST[key][locale], detail: `${MULTIPLIER_COPY[key].options[id][locale].label} · +${Math.round((m.value - 1) * 100)}%`, quantity: 1, unitPrice: amount, amount });
  }

  let price = roundTo(running, reg.round_to);
  if (price !== running) lines.push({ kind: 'adjust', label: ADJUST.round[locale], quantity: 1, unitPrice: price - running, amount: price - running });
  if (price < reg.min_price) {
    lines.push({ kind: 'adjust', label: ADJUST.minimum[locale], quantity: 1, unitPrice: reg.min_price - price, amount: reg.min_price - price });
    price = reg.min_price;
  }
  const priceHigh = roundTo(price * data.calculation.range_upper, reg.round_to);

  const status: QuoteStatus = price > reg.max_price ? 'discuss' : plan.customRequests.length > 0 ? 'range' : 'fixed';

  const discountPercent = foundingSpotsLeft(data) > 0 ? data.founding_offer.percent : 0;
  const discountOf = (p: number) => Math.max(0, Math.min(roundTo((p * discountPercent) / 100, reg.round_to), p - reg.min_price));
  const discount = discountOf(price);

  // Timeline: the package's workdays, plus the extra work, scaled by design/content effort and the chosen pace.
  const [lo, hi] = parseDays(svc.workdays);
  const extraDays = Math.ceil(hours / HOURS_PER_DAY);
  const effort = multiplier('design_level', choices.design, data).value * multiplier('content_readiness', choices.content, data).value;
  const pace = multiplier('timeline', choices.timeline, data).time_factor ?? 1;
  const days = (d: number) => Math.max(1, Math.ceil((d + extraDays) * effort * pace));

  return {
    region,
    currency: reg.currency as Currency,
    status,
    lines,
    subtotal,
    price,
    priceHigh,
    discountPercent,
    discount,
    total: price - discount,
    totalHigh: priceHigh - discountOf(priceHigh),
    workdays: [days(lo), days(hi)],
    pagesCount,
    featuresCount: seen.size,
    validDays: data.quote_valid_days,
  };
}

/** How a feature affects the price inside a given package, for tags in the plan UI. */
export function featurePrice(serviceId: string, featureId: string, region: Region): { kind: 'included' | 'free' | 'price'; amount: number; perPage: boolean } {
  const def = getFeature(featureId);
  if ((getService(serviceId).includes ?? []).includes(featureId)) return { kind: 'included', amount: 0, perPage: false };
  const amount = def.price[region];
  return { kind: amount === 0 ? 'free' : 'price', amount, perPage: !!def.unit };
}

export function formatPrice(amount: number, region: Region): string {
  const r = pricing.regions[region];
  return new Intl.NumberFormat(r.locale, { style: 'currency', currency: r.currency, maximumFractionDigits: 0 }).format(amount);
}

/** Short price for tight UI, e.g. "Rp 2,5 jt" / "$800". */
export function formatShort(amount: number, region: Region): string {
  if (region === 'GLOBAL') return formatPrice(amount, region);
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  return `Rp ${Math.round(amount / 1000)}rb`;
}

/** The headline price of a quote: one number, a range, or '' when it must be discussed. */
export function quotePriceText(q: Quote): string {
  if (q.status === 'discuss') return '';
  if (q.status === 'range') return `${formatPrice(q.total, q.region)} – ${formatPrice(q.totalHigh, q.region)}`;
  return formatPrice(q.total, q.region);
}

export function startingPrice(key: ServiceKey, region: Region): number {
  return getService(SERVICE_PRICING_ID[key]).base[region];
}

export function packageWorkdays(key: ServiceKey): [number, number] {
  return parseDays(getService(SERVICE_PRICING_ID[key]).workdays);
}
