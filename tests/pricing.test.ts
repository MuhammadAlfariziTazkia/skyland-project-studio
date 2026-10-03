import { describe, expect, it } from 'vitest';
import pricing from '../data/pricing.json';
import { FEATURE_COPY, MULTIPLIER_COPY, RECURRING_COPY, SERVICE_COPY } from '../src/i18n/catalog';
import { SERVICE_KEYS } from '../src/i18n/routes';
import { SERVICE_PRICING_ID, quote, type PricingData } from '../src/lib/pricing';
import { PlanSchema, type Choices, type Plan } from '../src/lib/schemas';

const pages = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Page ${i + 1}`, purpose: '', sections: [] }));
const plan = (over: Partial<Plan> & { pageCount?: number } = {}): Plan => {
  const { pageCount = 5, ...rest } = over;
  return PlanSchema.parse({
    serviceId: 'company_profile',
    projectName: 'Test',
    summary: '',
    audience: '',
    goals: [],
    pages: pages(pageCount),
    features: [],
    suggestions: [],
    customRequests: [],
    questions: [],
    assumptions: [],
    ...rest,
  });
};
const feats = (...ids: string[]) => ids.map((id) => ({ id, reason: '' }));
const choices = (over: Partial<Choices> = {}): Choices => ({ region: 'ID', design: 'template', content: 'ready', timeline: 'normal', ...over });
const noDiscount: PricingData = { ...pricing, founding_offer: { ...pricing.founding_offer, active: false } };

describe('quote: reference_cases in pricing.json', () => {
  // Each case is the plan described in reference_cases[].desc; the engine must land on its agreed range.
  const cases: [Plan, Choices][] = [
    [plan({ serviceId: 'company_profile', pageCount: 5, features: feats('gallery', 'google_maps', 'whatsapp_button') }), choices({ region: 'ID', design: 'semi_custom', content: 'partial' })],
    [plan({ serviceId: 'online_store', pageCount: 7, features: feats('seo_basic') }), choices({ region: 'ID', design: 'semi_custom', content: 'partial' })],
    [plan({ serviceId: 'personal_portfolio', pageCount: 4, features: feats('custom_animation') }), choices({ region: 'GLOBAL', design: 'semi_custom', content: 'ready' })],
    [plan({ serviceId: 'online_course', pageCount: 7, features: feats('payment') }), choices({ region: 'GLOBAL', design: 'semi_custom', content: 'partial' })],
  ];
  pricing.reference_cases.forEach((ref, i) => {
    it(`${ref.region} ${ref.service}: ${ref.agreed.join(' – ')}`, () => {
      const [p, c] = cases[i];
      expect(p.serviceId).toBe(ref.service);
      const q = quote(p, c, 'id', noDiscount);
      expect([q.price, q.priceHigh]).toEqual(ref.agreed);
      expect(q.status).toBe('fixed');
    });
  });
});

describe('quote', () => {
  it('charges only the base when the plan fits the package', () => {
    const q = quote(plan(), choices(), 'en', noDiscount);
    expect(q.total).toBe(2_500_000);
    expect(q.lines).toHaveLength(1);
  });

  it('charges extra pages flat and features in the package as included', () => {
    const q = quote(plan({ serviceId: 'booking_reservation', pageCount: 7, features: feats('contact_form', 'cms_admin', 'google_maps') }), choices({ region: 'GLOBAL' }), 'en', noDiscount);
    expect(q.lines.find((l) => l.kind === 'pages')).toMatchObject({ quantity: 2, amount: 200 });
    expect(q.lines.filter((l) => l.included)).toHaveLength(2);
    expect(q.total).toBe(1600 + 200 + 25);
  });

  it('prices copywriting per page and ignores duplicate features', () => {
    const q = quote(plan({ pageCount: 6, features: feats('copywriting', 'copywriting', 'whatsapp_button') }), choices(), 'id', noDiscount);
    expect(q.lines.find((l) => l.label.includes('teks'))).toMatchObject({ quantity: 6, amount: 1_500_000 });
    expect(q.featuresCount).toBe(2);
    expect(q.total).toBe(2_500_000 + 300_000 + 1_500_000);
  });

  it('itemises every multiplier so the breakdown adds up to the price', () => {
    const q = quote(plan({ features: feats('gallery', 'google_maps') }), choices({ design: 'full_custom', content: 'none', timeline: 'rush' }), 'en', noDiscount);
    expect(q.lines.reduce((s, l) => s + l.amount, 0)).toBe(q.price);
    expect(q.price % pricing.regions.ID.round_to).toBe(0);
  });

  it('never goes below the region minimum, even after the founding discount', () => {
    const tiny: PricingData = { ...pricing, services: pricing.services.map((s) => (s.id === 'landing_page' ? { ...s, base: { ID: 500_000, GLOBAL: 100 } } : s)) };
    const q = quote(plan({ serviceId: 'landing_page', pageCount: 1 }), choices(), 'id', tiny);
    expect(q.price).toBe(pricing.regions.ID.min_price);
    expect(q.total).toBe(pricing.regions.ID.min_price);
  });

  it('applies the founding discount on the price, rounded', () => {
    const q = quote(plan(), choices(), 'id');
    expect(q.discountPercent).toBe(pricing.founding_offer.percent);
    expect(q.discount).toBe(500_000);
    expect(q.total).toBe(2_000_000);
  });

  it('shows a range when a request is outside the catalog', () => {
    const q = quote(plan({ customRequests: [{ name: 'Loyalty points', description: '' }] }), choices(), 'id', noDiscount);
    expect(q.status).toBe('range');
    expect(q.priceHigh).toBe(3_000_000);
  });

  it('asks for a discussion above the region maximum', () => {
    const q = quote(plan({ serviceId: 'custom_web_app', pageCount: 15, features: feats('payment', 'multilang', 'copywriting') }), choices({ design: 'full_custom', content: 'none', timeline: 'rush' }), 'id', noDiscount);
    expect(q.price).toBeGreaterThan(pricing.regions.ID.max_price);
    expect(q.status).toBe('discuss');
  });

  it('extends and compresses the timeline', () => {
    const base = quote(plan(), choices(), 'en', noDiscount).workdays;
    expect(base).toEqual([5, 9]);
    const more = quote(plan({ pageCount: 8, features: feats('cms_admin') }), choices(), 'en', noDiscount).workdays;
    expect(more).toEqual([5 + 5, 9 + 5]); // 3 pages × 4h + 16h = 28h → 5 days
    const rush = quote(plan(), choices({ timeline: 'rush' }), 'en', noDiscount).workdays;
    expect(rush).toEqual([3, 5]);
  });
});

describe('catalog copy', () => {
  it('has client-facing copy for every id in pricing.json', () => {
    for (const s of pricing.services) expect(SERVICE_COPY[s.id], s.id).toBeDefined();
    for (const f of pricing.features) expect(FEATURE_COPY[f.id], f.id).toBeDefined();
    for (const r of pricing.recurring) expect(RECURRING_COPY[r.id], r.id).toBeDefined();
    for (const [key, opts] of Object.entries(pricing.multipliers)) for (const o of opts) expect(MULTIPLIER_COPY[key as keyof typeof MULTIPLIER_COPY].options[o.id], `${key}.${o.id}`).toBeDefined();
  });

  it('maps every website type to a service in pricing.json', () => {
    for (const k of SERVICE_KEYS) expect(pricing.services.some((s) => s.id === SERVICE_PRICING_ID[k]), k).toBe(true);
  });
});
