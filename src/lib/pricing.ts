// Deterministic price engine. Pure and isomorphic: the consultant UI imports it for a
// live preview, and the API recomputes with it on every request (the server is authoritative).
import pricing from '../../data/pricing.json';
import type { Currency, Locale, Plan } from './schemas';

export type PricingData = typeof pricing;
type Complexity = keyof PricingData['extraPage'];
type Tier = keyof PricingData['customTiers'];
type Feature = { name: { en: string; id: string }; price: { IDR: number; USD: number }; days: number; unit?: string };

export interface QuoteLine {
  kind: 'base' | 'page' | 'feature' | 'custom' | 'rush';
  label: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  included?: boolean;
}

export interface Quote {
  currency: Currency;
  lines: QuoteLine[];
  subtotal: number;
  discountPercent: number;
  discount: number;
  total: number;
  timelineWeeks: [number, number];
  needsReview: boolean;
  estimateRange?: [number, number];
  pagesCount: number;
  featuresCount: number;
  validDays: number;
}

export function foundingSpotsLeft(data: PricingData = pricing): number {
  const f = data.foundingOffer;
  return f.active ? Math.max(0, f.spotsTotal - f.spotsTaken) : 0;
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function quote(plan: Plan, currency: Currency, locale: Locale, data: PricingData = pricing): Quote {
  const type = data.projectTypes[plan.projectType as keyof PricingData['projectTypes']];
  if (!type) throw new Error(`Unknown project type: ${plan.projectType}`);
  const features = data.features as Record<string, Feature>;
  const lines: QuoteLine[] = [];
  let days = 0;

  lines.push({
    kind: 'base',
    label: type.name[locale],
    detail: locale === 'id' ? `Termasuk ${type.includedPages} halaman` : `Includes ${type.includedPages} page${type.includedPages > 1 ? 's' : ''}`,
    quantity: 1,
    unitPrice: type.basePrice[currency],
    amount: type.basePrice[currency],
  });

  // The most complex pages are covered by the base package (client-favourable and order-independent).
  const rank: Record<Complexity, number> = { complex: 0, standard: 1, simple: 2 };
  const extraPages = [...plan.pages].sort((a, b) => rank[a.complexity] - rank[b.complexity]).slice(type.includedPages);
  for (const page of extraPages) {
    const p = data.extraPage[page.complexity];
    days += p.days;
    lines.push({
      kind: 'page',
      label: (locale === 'id' ? 'Halaman tambahan: ' : 'Extra page: ') + page.name,
      detail: page.complexity,
      quantity: 1,
      unitPrice: p.price[currency],
      amount: p.price[currency],
    });
  }

  const included = new Set(type.includedFeatures);
  const seen = new Set<string>();
  for (const f of plan.features) {
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    const def = features[f.id];
    if (!def) throw new Error(`Unknown feature: ${f.id}`);
    if (included.has(f.id)) {
      lines.push({ kind: 'feature', label: def.name[locale], quantity: 1, unitPrice: 0, amount: 0, included: true });
      continue;
    }
    const qty = def.unit === 'page' ? plan.pages.length : def.unit ? Math.max(1, f.quantity ?? 1) : 1;
    days += def.days * qty;
    lines.push({
      kind: 'feature',
      label: def.name[locale],
      quantity: qty,
      unitPrice: def.price[currency],
      amount: def.price[currency] * qty,
    });
  }

  for (const c of plan.customFeatures.slice(0, data.guardrails.maxCustomFeatures)) {
    const tier = data.customTiers[c.tier as Tier];
    days += tier.days;
    lines.push({
      kind: 'custom',
      label: c.name,
      detail: (locale === 'id' ? 'Fitur custom, ukuran ' : 'Custom feature, size ') + c.tier,
      quantity: 1,
      unitPrice: tier.price[currency],
      amount: tier.price[currency],
    });
  }

  let subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const [minW, maxW] = type.timelineWeeks;
  const extraWeeks = Math.ceil(days / 5);
  let timelineWeeks: [number, number] = [minW + extraWeeks, maxW + extraWeeks];

  if (plan.rush) {
    const r = data.modifiers.rush;
    const amount = (subtotal * r.percent) / 100;
    lines.push({ kind: 'rush', label: locale === 'id' ? 'Pengerjaan kilat' : 'Rush delivery', detail: `+${r.percent}%`, quantity: 1, unitPrice: amount, amount });
    subtotal += amount;
    timelineWeeks = [Math.max(1, Math.ceil(timelineWeeks[0] * r.timelineFactor)), Math.max(1, Math.ceil(timelineWeeks[1] * r.timelineFactor))];
  }

  const step = data.meta.currencies[currency].rounding;
  subtotal = roundTo(subtotal, step);
  const discountPercent = foundingSpotsLeft(data) > 0 ? data.foundingOffer.percent : 0;
  const discount = roundTo((subtotal * discountPercent) / 100, step);
  const total = subtotal - discount;

  const needsReview = total > data.guardrails.maxAutoQuote[currency] || plan.customFeatures.some((c) => c.tier === 'L');
  return {
    currency,
    lines,
    subtotal,
    discountPercent,
    discount,
    total,
    timelineWeeks,
    needsReview,
    estimateRange: needsReview ? [total, roundTo(total * data.guardrails.reviewRangeFactor, step)] : undefined,
    pagesCount: plan.pages.length,
    featuresCount: seen.size + plan.customFeatures.length,
    validDays: data.meta.quoteValidDays,
  };
}

export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(pricing.meta.currencies[currency].locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Short price for tight UI, e.g. "Rp 3,5 jt" / "$450". */
export function formatShort(amount: number, currency: Currency): string {
  if (currency === 'USD') return formatPrice(amount, 'USD');
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  return `Rp ${Math.round(amount / 1000)}rb`;
}

export function typicalRange(typeId: string, currency: Currency): string {
  const t = pricing.projectTypes[typeId as keyof PricingData['projectTypes']];
  const [lo, hi] = t.typicalRange[currency];
  return `${formatShort(lo, currency)} – ${formatShort(hi, currency)}`;
}

export function startingPrice(typeId: string, currency: Currency): number {
  return pricing.projectTypes[typeId as keyof PricingData['projectTypes']].basePrice[currency];
}
