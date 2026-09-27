import { describe, expect, it } from 'vitest';
import pricing from '../data/pricing.json';
import { quote, type PricingData } from '../src/lib/pricing';
import { PlanSchema, type Plan } from '../src/lib/schemas';

const page = (name: string, complexity: 'simple' | 'standard' | 'complex' = 'standard') => ({ name, purpose: '', sections: [], complexity });
const basePlan = (over: Partial<Plan> = {}): Plan =>
  PlanSchema.parse({
    projectType: 'company_profile',
    projectName: 'Test',
    summary: '',
    audience: '',
    goals: [],
    pages: [page('Home'), page('About'), page('Services'), page('Contact')],
    features: [],
    customFeatures: [],
    rush: false,
    assumptions: [],
    questions: [],
    ...over,
  });
const noDiscount: PricingData = { ...pricing, foundingOffer: { ...pricing.foundingOffer, active: false } };

describe('quote', () => {
  it('charges only the base price when the plan fits the package', () => {
    const q = quote(basePlan(), 'IDR', 'id', noDiscount);
    expect(q.total).toBe(3_500_000);
    expect(q.discount).toBe(0);
  });

  it('includes the most complex pages in the base and charges the rest by complexity', () => {
    const pages = [page('A', 'simple'), page('B', 'complex'), page('C'), page('D'), page('E'), page('F', 'simple'), page('G', 'standard')];
    const q = quote(basePlan({ pages }), 'USD', 'en', noDiscount);
    // Sorted B, C, D, E, G | A, F → the 5 most complex are included, the two simple pages cost $40 each
    expect(q.lines.filter((l) => l.kind === 'page').map((l) => l.amount)).toEqual([40, 40]);
    expect(q.total).toBe(450 + 80);
  });

  it('prices included features at zero, per-page features by page count, and ignores duplicates', () => {
    const q = quote(
      basePlan({
        features: [
          { id: 'contact_form', reason: '', quantity: 1 },
          { id: 'copywriting', reason: '', quantity: 1 },
          { id: 'gallery', reason: '', quantity: 1 },
          { id: 'gallery', reason: '', quantity: 1 },
        ],
      }),
      'IDR',
      'id',
      noDiscount,
    );
    expect(q.lines.find((l) => l.label.startsWith('Form kontak'))?.amount).toBe(0);
    expect(q.total).toBe(3_500_000 + 250_000 * 4 + 500_000);
  });

  it('applies the founding discount and rounds to the currency step', () => {
    const q = quote(basePlan({ features: [{ id: 'gallery', reason: '', quantity: 1 }] }), 'IDR', 'id', pricing as PricingData);
    expect(q.subtotal).toBe(4_000_000);
    expect(q.discount).toBe(800_000);
    expect(q.total).toBe(3_200_000);
    expect(q.total % 50_000).toBe(0);
  });

  it('adds rush fee and shortens the timeline', () => {
    const normal = quote(basePlan(), 'USD', 'en', noDiscount);
    const rush = quote(basePlan({ rush: true }), 'USD', 'en', noDiscount);
    expect(rush.total).toBe(565); // 450 * 1.25 = 562.5 → rounded to 5
    expect(rush.timelineWeeks[1]).toBeLessThan(normal.timelineWeeks[1]);
  });

  it('flags large custom work or very large totals for review', () => {
    const q = quote(basePlan({ customFeatures: [{ name: 'Sync', description: '', tier: 'L', reason: '' }] }), 'USD', 'en', noDiscount);
    expect(q.needsReview).toBe(true);
    expect(q.estimateRange?.[1]).toBeGreaterThan(q.total);
  });

  it('rejects feature ids outside the catalog at the schema level', () => {
    expect(() => basePlan({ features: [{ id: 'made_up' as never, reason: '', quantity: 1 }] })).toThrow();
  });
});
