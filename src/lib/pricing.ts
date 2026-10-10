// Deterministic price engine for data/pricing.json (calculation.steps). Pure and isomorphic: the consultant
// UI imports it for a live preview, and the API recomputes with it on every order (the server is authoritative).
// The AI never sees or produces prices; it only picks ids that this engine prices.
import raw from '../../data/pricing.json';
import { FEATURE_COPY, MULTIPLIER_COPY, SERVICE_COPY } from '../i18n/catalog';
import type { ServiceKey } from '../i18n/routes';
import type { Choices, Currency, Locale, Plan, Region } from './schemas';

type Page = Plan['pages'][number];

export type PricingData = typeof raw;
type Service = PricingData['services'][number] & { includes?: string[]; risk_tier?: RiskTier; design_share: number };
export type FeatureUnit = 'page' | 'item';
type RiskTier = 'standard' | 'elevated' | 'review';
type Feature = Omit<PricingData['features'][number], 'unit'> & {
  unit?: FeatureUnit;
  risk_tier?: RiskTier;
  design_bearing: boolean;
  /** Needs a third-party account or subscription to work at all. */
  external_dependency?: boolean;
  /** An external dependency the business genuinely cannot trade without (payment). */
  crucial?: boolean;
};
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

/**
 * The market a prerendered page assumes. A lookup rather than a ternary so a third locale is one row,
 * and so `ja` lands on JP instead of silently falling through to USD.
 */
const LOCALE_MARKET: Record<Locale, Region> = { en: 'GLOBAL', id: 'ID', ja: 'JP' };
export const regionFor = (locale: Locale): Region => LOCALE_MARKET[locale];
export const currencyOf = (region: Region) => pricing.regions[region].currency as Currency;
export const defaultChoices = (locale: Locale): Choices => ({ region: regionFor(locale), design: 'semi_custom', content: 'partial', timeline: 'normal', promoCode: '' });

const ID_ZONES = /^Asia\/(Jakarta|Pontianak|Makassar|Jayapura)$/;
const JP_ZONES = /^(Asia\/Tokyo|Japan)$/;

/**
 * The visitor's price market, worked out on the device so they are never asked "where is your business?".
 *
 * Detection runs fresh on every visit and nothing is remembered. An earlier version read a saved
 * `skyland-market` key first, which outranked detection; once the currency picker was removed nothing
 * wrote that key any more, so a value left over from testing became permanent and unreachable and a
 * visitor in Tokyo kept seeing rupiah. Timezone and language are available synchronously with no
 * network, so an island settles the market in its first effect and the price never moves again.
 * Falls back to the locale default outside the browser.
 */
export function marketFromClient(locale: Locale): Region {
  if (typeof window === 'undefined') return regionFor(locale);
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (JP_ZONES.test(tz)) return 'JP';
    if (ID_ZONES.test(tz)) return 'ID';
    const langs = navigator.languages ?? [navigator.language || ''];
    if (langs.some((l) => /^ja\b/i.test(l))) return 'JP';
    if (langs.some((l) => /^id\b/i.test(l))) return 'ID';
  } catch {
    /* no Intl or navigator; fall through */
  }
  return regionFor(locale);
}

export function getService(id: string, data: PricingData = pricing): Service {
  const s = data.services.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown service: ${id}`);
  return s as unknown as Service;
}

export function getFeature(id: string, data: PricingData = pricing): Feature {
  const f = data.features.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown feature: ${id}`);
  return f as unknown as Feature;
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
  const svc = data.services.find((s) => s.id === plan.serviceId) as unknown as Service | undefined;
  return new Set([...plan.features.map((f) => f.id), ...(svc?.includes ?? [])]);
}

// When the AI leaves `feature` empty on a member/admin screen, these features can provide it.
const AREA_FALLBACK: Record<'member' | 'admin', string[]> = {
  member: ['user_login', 'member_area'],
  admin: ['cms_admin'],
};

/**
 * Pages the client actually gets. Content pages always; a page that comes with a feature (cart, article,
 * admin screens...) only while that feature is on, so switching a feature off hides its pages and back on
 * restores them.
 */
export function visiblePages(plan: Plan, data: PricingData = pricing): Page[] {
  const active = activeFeatureIds(plan, data);
  return plan.pages.filter((p) => {
    if (p.feature && data.features.some((f) => f.id === p.feature)) return active.has(p.feature);
    if (p.area === 'public') return true;
    return AREA_FALLBACK[p.area].some((id) => active.has(id));
  });
}

/** Everything a visitor can open: content pages plus public pages that come with a feature. */
export const publicPages = (plan: Plan, data: PricingData = pricing): Page[] => visiblePages(plan, data).filter((p) => p.area === 'public');

/** Content pages: public pages that no feature brings. The only pages counted against pages_included and per-page features. */
export const contentPages = (plan: Plan, data: PricingData = pricing): Page[] => publicPages(plan, data).filter((p) => !p.feature);

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
  /**
   * Why this quote cannot be a fixed number, independent of how large it is. `blocking` means we do not take
   * the work on at all (see blocking_domains in pricing.json) — a small budget never clears it.
   */
  risk: { blocking: string[]; elevated: string[]; truncated: boolean };
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

const ADJUST: Record<MultiplierKey | 'round' | 'minimum' | 'cap', Record<Locale, string>> = {
  design_level: { en: 'Design', id: 'Desain', ja: 'デザイン' },
  content_readiness: { en: 'Content help', id: 'Bantuan konten', ja: '原稿のお手伝い' },
  timeline: { en: 'Faster delivery', id: 'Pengerjaan lebih cepat', ja: '納期の短縮' },
  round: { en: 'Rounding', id: 'Pembulatan', ja: '端数調整' },
  minimum: { en: 'Minimum project price', id: 'Harga minimum proyek', ja: '最低料金' },
  cap: { en: 'Combined options capped', id: 'Batas gabungan opsi', ja: 'オプション合計の上限' },
};

const PAGES_INCLUDED: Record<Locale, (n: number) => string> = {
  en: (n) => `Includes ${n} page${n > 1 ? 's' : ''}`,
  id: (n) => `Termasuk ${n} halaman`,
  ja: (n) => `${n}ページ分を含む`,
};
const EXTRA_PAGES: Record<Locale, string> = { en: 'Extra pages', id: 'Halaman tambahan', ja: '追加ページ' };

const DISCOUNT: Record<Discount['kind'], Record<Locale, string>> = {
  founding: { en: 'Founding client discount', id: 'Diskon klien pertama', ja: '初期クライアント割引' },
  promo: { en: 'Promo code', id: 'Kode promo', ja: 'プロモコード' },
};

/**
 * Work we decline, matched against what the client wrote rather than against the amount. A bidding engine is
 * out of scope whether the budget is small or large, so this gate deliberately ignores price and promo.
 * Matching is keyword-based and so is deliberately eager: a false "let's talk" costs a conversation,
 * a false "fixed price" costs a project we cannot deliver.
 */
export function blockingDomains(plan: Plan, locale: Locale, data: PricingData = pricing): string[] {
  const haystack = [
    plan.projectName, plan.summary, plan.business, plan.audience,
    ...plan.flows.map((f) => f.does),
    ...plan.pages.map((p) => p.name),
    ...plan.customRequests.flatMap((c) => [c.name, c.description]),
  ].join(' \n ').toLowerCase();
  return data.blocking_domains.filter((d) => d.keywords.some((k) => haystack.includes(k.toLowerCase()))).map((d) => d.label[locale]);
}

export function quote(plan: Plan, choices: Choices, locale: Locale, data: PricingData = pricing, promo: Promo | null = null): Quote {
  const svc = getService(plan.serviceId, data);
  const region = choices.region;
  const reg = data.regions[region];
  const pagesCount = contentPages(plan, data).length;
  const lines: QuoteLine[] = [];
  let hours = 0;
  /**
   * The slice of the subtotal that is actually design and content work. The design and content multipliers
   * only touch this, so "custom design" can no longer inflate a payment gateway or a role matrix.
   */
  let designPart = 0;

  const n = svc.pages_included;
  lines.push({
    kind: 'base',
    label: SERVICE_COPY[svc.id]?.[locale].name ?? svc.name,
    detail: PAGES_INCLUDED[locale](n),
    quantity: 1,
    unitPrice: svc.base[region],
    amount: svc.base[region],
  });
  designPart += svc.base[region] * svc.design_share;

  const extra = Math.max(0, pagesCount - n);
  if (extra > 0) {
    const unit = data.extra_page.price[region];
    hours += extra * data.extra_page.est_hours;
    lines.push({ kind: 'pages', label: EXTRA_PAGES[locale], quantity: extra, unitPrice: unit, amount: unit * extra });
    designPart += unit * extra;
  }

  const included = new Set(svc.includes ?? []);
  const seen = new Set<string>();
  const elevated: string[] = [];
  for (const { id, quantity } of plan.features) {
    if (seen.has(id)) continue;
    seen.add(id);
    const def = getFeature(id, data);
    const label = FEATURE_COPY[id]?.[locale].name ?? def.label;
    if (def.risk_tier === 'elevated') elevated.push(label);
    // With no content at all the content multiplier already pays for the writing, so billing copywriting
    // on top would charge the same work twice. pricing.json has always said so; now the engine does it.
    const writingCoveredByMultiplier = id === 'copywriting' && choices.content === 'none';
    if (included.has(id) || writingCoveredByMultiplier) {
      lines.push({ kind: 'feature', label, quantity: 1, unitPrice: 0, amount: 0, included: true });
      continue;
    }
    const qty = def.unit === 'page' ? pagesCount : def.unit === 'item' ? Math.max(1, quantity ?? 1) : 1;
    hours += def.est_hours * qty;
    const amount = def.price[region] * qty;
    lines.push({ kind: 'feature', label, quantity: qty, unitPrice: def.price[region], amount });
    if (def.design_bearing) designPart += amount;
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);

  /*
   * Design and content scale only the design-bearing slice; the pace premium scales everything, because
   * delivering a payment integration sooner really does cost more. Each step is its own line so the client
   * can see what the option costs, and each is rounded on its own, so the engine stays the single authority.
   */
  let running = subtotal;
  let runningDesign = designPart;
  const segmented: [MultiplierKey, string][] = [['design_level', choices.design], ['content_readiness', choices.content]];
  for (const [key, id] of segmented) {
    const m = multiplier(key, id, data);
    if (m.value === 1) continue;
    const amount = Math.round(runningDesign * (m.value - 1));
    running += amount;
    runningDesign += amount;
    const pct = Math.round((m.value - 1) * 100);
    lines.push({ kind: 'adjust', label: ADJUST[key][locale], detail: `${MULTIPLIER_COPY[key].options[id][locale].label} · ${pct > 0 ? '+' : ''}${pct}%`, quantity: 1, unitPrice: amount, amount });
  }
  const pace = multiplier('timeline', choices.timeline, data);
  if (pace.value !== 1) {
    const amount = Math.round(running * (pace.value - 1));
    running += amount;
    lines.push({ kind: 'adjust', label: ADJUST.timeline[locale], detail: `${MULTIPLIER_COPY.timeline.options[choices.timeline][locale].label} · +${Math.round((pace.value - 1) * 100)}%`, quantity: 1, unitPrice: amount, amount });
  }

  // calculation.max_multiplier is a real ceiling now: stacking every option can no longer more than
  // max_multiplier the subtotal, which used to be reachable at 2.268x.
  const ceiling = Math.round(subtotal * data.calculation.max_multiplier);
  if (subtotal > 0 && running > ceiling) {
    lines.push({ kind: 'adjust', label: ADJUST.cap[locale], detail: `max ${data.calculation.max_multiplier}×`, quantity: 1, unitPrice: ceiling - running, amount: ceiling - running });
    running = ceiling;
  }

  let price = roundTo(running, reg.round_to);
  if (price !== running) lines.push({ kind: 'adjust', label: ADJUST.round[locale], quantity: 1, unitPrice: price - running, amount: price - running });
  if (price < reg.min_price) {
    lines.push({ kind: 'adjust', label: ADJUST.minimum[locale], quantity: 1, unitPrice: reg.min_price - price, amount: reg.min_price - price });
    price = reg.min_price;
  }
  const priceHigh = roundTo(price * data.calculation.range_upper, reg.round_to);

  /*
   * Risk decides the status before the amount does. Previously an auction platform could come back as a
   * fixed price just because it landed under the regional ceiling and carried no custom-request label,
   * and the same scope flipped between `range` and `discuss` purely because the ID and GLOBAL ceilings were
   * ~10x apart in real terms. A blocking domain, a package that always needs a human, and scope we had to
   * truncate are all refusals to commit, whatever the number says.
   */
  const blocking = blockingDomains(plan, locale, data);
  const risk = { blocking, elevated, truncated: plan.scopeTruncated };
  const mustDiscuss = blocking.length > 0 || svc.risk_tier === 'review' || plan.scopeTruncated || price > reg.max_price;
  const status: QuoteStatus = mustDiscuss ? 'discuss' : elevated.length > 0 || plan.customRequests.length > 0 ? 'range' : 'fixed';

  /*
   * One discount, never a stack. Founding 20% + promo 20% used to reach 40% off, which on an Indonesian
   * booking project worked out at roughly a third of the Kanagawa minimum wage per hour. Markets listed in
   * discount_policy.no_discount_markets get none at all, because their list price is already subsidised.
   */
  const subsidised = (data.discount_policy.no_discount_markets as string[]).includes(region);
  const offers: { kind: Discount['kind']; label: string; percent: number }[] = [];
  if (!subsidised && foundingSpotsLeft(data) > 0) offers.push({ kind: 'founding', label: DISCOUNT.founding[locale], percent: data.founding_offer.percent });
  if (!subsidised && promo && promo.percent > 0) offers.push({ kind: 'promo', label: `${DISCOUNT.promo[locale]} ${promo.code}`, percent: promo.percent });

  const best = offers.sort((a, b) => b.percent - a.percent)[0];
  const capped = best ? [{ ...best, percent: Math.max(0, Math.min(best.percent, data.max_discount_percent)) }] : [];

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
  const paceFactor = pace.time_factor ?? 1;
  const days = (d: number) => Math.max(1, Math.ceil((d + extraDays) * effort * paceFactor));

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
    risk,
  };
}

/** How a feature affects the price inside a given package, for tags in the plan UI. */
export function featurePrice(serviceId: string, featureId: string, region: Region, data: PricingData = pricing): { kind: 'included' | 'free' | 'price'; amount: number; unit?: FeatureUnit } {
  const def = getFeature(featureId, data);
  if ((getService(serviceId, data).includes ?? []).includes(featureId)) return { kind: 'included', amount: 0 };
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
  if (region !== 'ID') return formatPrice(amount, region);
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
