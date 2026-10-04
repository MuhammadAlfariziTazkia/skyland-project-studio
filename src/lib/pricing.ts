// Deterministic price engine for data/pricing.json (calculation.steps). Pure and isomorphic: the consultant
// UI imports it for a live preview, and the API recomputes with it on every order (the server is authoritative).
// The AI never sees or produces prices; it only picks ids that this engine prices.
import raw from '../../data/pricing.json';
import { FEATURE_COPY, MULTIPLIER_COPY, SERVICE_COPY } from '../i18n/catalog';
import type { ServiceKey } from '../i18n/routes';
import type { Choices, Currency, Locale, Plan, Region } from './schemas';

type Page = Plan['pages'][number];

export type PricingData = typeof raw;
type Service = PricingData['services'][number] & { includes?: string[] };
export type FeatureUnit = 'page' | 'item';
type Feature = Omit<PricingData['features'][number], 'unit'> & { unit?: FeatureUnit };
type MultiplierKey = keyof PricingData['multipliers'];

/**
 * pricing.json holds the defaults; these PUBLIC_* env vars override the discount knobs so they can be
 * changed per deploy without editing the file. The percentages are advertised on the site anyway, so
 * being readable in the browser is fine — only the promo CODES stay server-side (src/lib/promo.ts).
 */
export function withEnv(data: PricingData, e: Record<string, string | undefined>): PricingData {
  const num = (value: string | undefined, fallback: number) => {
    const n = Number(value);
    return value !== undefined && value.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const f = data.founding_offer;
  return {
    ...data,
    founding_offer: {
      ...f,
      percent: num(e.PUBLIC_FOUNDING_PERCENT, f.percent),
      spots_total: num(e.PUBLIC_FOUNDING_SPOTS, f.spots_total),
      spots_taken: num(e.PUBLIC_FOUNDING_TAKEN, f.spots_taken),
    },
    max_discount_percent: num(e.PUBLIC_MAX_DISCOUNT_PERCENT, data.max_discount_percent),
  };
}

// Each key is read as a literal so Vite inlines it into the browser bundle too, which keeps the
// consultant's live price identical to the price the server recomputes on order.
const pricing: PricingData = withEnv(raw, {
  PUBLIC_FOUNDING_PERCENT: import.meta.env.PUBLIC_FOUNDING_PERCENT,
  PUBLIC_FOUNDING_SPOTS: import.meta.env.PUBLIC_FOUNDING_SPOTS,
  PUBLIC_FOUNDING_TAKEN: import.meta.env.PUBLIC_FOUNDING_TAKEN,
  PUBLIC_MAX_DISCOUNT_PERCENT: import.meta.env.PUBLIC_MAX_DISCOUNT_PERCENT,
});

/** pricing.json with the env overrides applied. Always use this, never the raw JSON import. */
export const PRICING = pricing;
export const foundingOffer = pricing.founding_offer;

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
export const defaultChoices = (locale: Locale): Choices => ({ region: regionFor(locale), design: 'semi_custom', content: 'partial', timeline: 'normal', promoCode: '' });

export function getService(id: string, data: PricingData = pricing): Service {
  const s = data.services.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown service: ${id}`);
  return s;
}

export function getFeature(id: string, data: PricingData = pricing): Feature {
  const f = data.features.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown feature: ${id}`);
  return f as Feature;
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

/** Features the client gets: the ones switched on plus everything the package already includes. */
export function activeFeatureIds(plan: Plan, data: PricingData = pricing): Set<string> {
  const svc = data.services.find((s) => s.id === plan.serviceId) as Service | undefined;
  return new Set([...plan.features.map((f) => f.id), ...(svc?.includes ?? [])]);
}

// When the AI leaves `feature` empty on a member/admin screen, these features can provide it.
const AREA_FALLBACK: Record<'member' | 'admin', string[]> = {
  member: ['user_login', 'member_area'],
  admin: ['cms_admin'],
};

/**
 * Pages the client actually gets. Public pages always; a member/admin screen only while the feature that
 * provides it is on, so switching "Update the site yourself" off hides the admin screens (and back on restores them).
 */
export function visiblePages(plan: Plan, data: PricingData = pricing): Page[] {
  const active = activeFeatureIds(plan, data);
  return plan.pages.filter((p) => {
    if (p.area === 'public') return true;
    if (p.feature && data.features.some((f) => f.id === p.feature)) return active.has(p.feature);
    return AREA_FALLBACK[p.area].some((id) => active.has(id));
  });
}

/** Public pages: the only ones that count against pages_included and per-page features. */
export const publicPages = (plan: Plan, data: PricingData = pricing): Page[] => visiblePages(plan, data).filter((p) => p.area === 'public');

export interface Promo {
  code: string;
  percent: number;
}

export interface Discount {
  kind: 'founding' | 'promo';
  label: string;
  percent: number;
  amount: number;
}

export function foundingSpotsLeft(data: PricingData = pricing): number {
  const f = data.founding_offer;
  // A zero percentage or zero spots switches the offer off, so it can be disabled from the env alone.
  return f.active && f.percent > 0 ? Math.max(0, f.spots_total - f.spots_taken) : 0;
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
  /** Founding offer and promo code, each with the amount it actually took off. */
  discounts: Discount[];
  savings: number;
  savingsPercent: number;
  /** What the client pays: price − savings */
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

const DISCOUNT: Record<Discount['kind'], Record<Locale, string>> = {
  founding: { en: 'Founding client discount', id: 'Diskon klien pertama' },
  promo: { en: 'Promo code', id: 'Kode promo' },
};

export function quote(plan: Plan, choices: Choices, locale: Locale, data: PricingData = pricing, promo: Promo | null = null): Quote {
  const svc = getService(plan.serviceId, data);
  const region = choices.region;
  const reg = data.regions[region];
  const pagesCount = publicPages(plan, data).length;
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
  for (const { id, quantity } of plan.features) {
    if (seen.has(id)) continue;
    seen.add(id);
    const def = getFeature(id, data);
    const label = FEATURE_COPY[id]?.[locale].name ?? def.label;
    if (included.has(id)) {
      lines.push({ kind: 'feature', label, quantity: 1, unitPrice: 0, amount: 0, included: true });
      continue;
    }
    const qty = def.unit === 'page' ? pagesCount : def.unit === 'item' ? Math.max(1, quantity ?? 1) : 1;
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

  // Discounts stack additively (20% + 20% = 40% off the undiscounted price), capped twice:
  // by max_discount_percent, and by the region minimum so a cheap project can never fall below it.
  const stack: { kind: Discount['kind']; label: string; percent: number }[] = [];
  if (foundingSpotsLeft(data) > 0) stack.push({ kind: 'founding', label: DISCOUNT.founding[locale], percent: data.founding_offer.percent });
  if (promo && promo.percent > 0) stack.push({ kind: 'promo', label: `${DISCOUNT.promo[locale]} ${promo.code}`, percent: promo.percent });

  let budget = data.max_discount_percent;
  const capped = stack.map((d) => {
    const percent = Math.max(0, Math.min(d.percent, budget));
    budget -= percent;
    return { ...d, percent };
  });

  const applyDiscounts = (p: number): { discounts: Discount[]; savings: number } => {
    const room = Math.max(0, p - reg.min_price);
    let savings = 0;
    const discounts = capped.map((d) => {
      const amount = Math.max(0, Math.min(roundTo((p * d.percent) / 100, reg.round_to), room - savings));
      savings += amount;
      return { ...d, amount };
    });
    return { discounts, savings };
  };

  const { discounts, savings } = applyDiscounts(price);

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
    discounts,
    savings,
    savingsPercent: price > 0 ? Math.round((savings / price) * 100) : 0,
    total: price - savings,
    totalHigh: priceHigh - applyDiscounts(priceHigh).savings,
    workdays: [days(lo), days(hi)],
    pagesCount,
    featuresCount: seen.size,
    validDays: data.quote_valid_days,
  };
}

/** How a feature affects the price inside a given package, for tags in the plan UI. */
export function featurePrice(serviceId: string, featureId: string, region: Region): { kind: 'included' | 'free' | 'price'; amount: number; unit?: FeatureUnit } {
  const def = getFeature(featureId);
  if ((getService(serviceId).includes ?? []).includes(featureId)) return { kind: 'included', amount: 0 };
  const amount = def.price[region];
  return { kind: amount === 0 ? 'free' : 'price', amount, unit: def.unit };
}

/** Feature ids grouped in the order of feature_categories, for grouped pickers. */
export function featuresByCategory(data: PricingData = pricing): { category: string; ids: string[] }[] {
  return data.feature_categories.map((category) => ({ category, ids: data.features.filter((f) => f.category === category).map((f) => f.id) }));
}

export function formatPrice(amount: number, region: Region): string {
  const r = pricing.regions[region];
  return new Intl.NumberFormat(r.locale, { style: 'currency', currency: r.currency, maximumFractionDigits: 0 }).format(amount);
}

/** Short price for tight UI, e.g. "Rp 1,75 jt" / "$650". Two decimals so it never rounds up past the real price. */
export function formatShort(amount: number, region: Region): string {
  if (region === 'GLOBAL') return formatPrice(amount, region);
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} jt`;
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
