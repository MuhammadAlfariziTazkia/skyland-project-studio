import { afterEach, describe, expect, it } from 'vitest';
import pricing from '../data/pricing.json';
import { CATEGORY_COPY, FEATURE_COPY, MULTIPLIER_COPY, NOT_INCLUDED_COPY, PAGE_COPY, RECURRING_COPY, SERVICE_COPY } from '../src/i18n/catalog';
import { SERVICE_KEYS } from '../src/i18n/routes';
import { SERVICE_PRICING_ID, contentPages, publicPages, quote, visiblePages, withEnv, type PricingData, type Promo } from '../src/lib/pricing';
import { validatePromo } from '../src/lib/promo';
import { LOCALES, MockupSchema, PAGE_TYPES, PlanSchema, PlanShape, type Choices, type Plan } from '../src/lib/schemas';
import { CONCEPT_KEYS, CONCEPT_SLUGS, allPagePairs, conceptPath } from '../src/i18n/routes';
import { getDict } from '../src/i18n';
import { CONCEPT_MOCKUPS } from '../src/lib/samples/mockups';
import { essentialIds, needsThirdParty, orderedFeatures, planKey, toPlan } from '../src/lib/samples/plan';
import { SAMPLE_SPECS } from '../src/lib/samples/specs';

type Page = Plan['pages'][number];
const pages = (n: number): Page[] => Array.from({ length: n }, (_, i) => ({ name: `Page ${i + 1}`, area: 'public', feature: '', covers: [], purpose: '', sections: [] }));
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
const feats = (...ids: string[]) => ids.map((id) => ({ id, reason: '', quantity: 1 }));
const feat = (id: string, quantity: number) => ({ id, reason: '', quantity });
const choices = (over: Partial<Choices> = {}): Choices => ({ region: 'ID', design: 'semi_custom', content: 'ready', timeline: 'normal', promoCode: '', ...over });
const noDiscount: PricingData = { ...pricing, founding_offer: { ...pricing.founding_offer, active: false } };
/** Catalog sums land on the finer catalog grid; the engine then rounds the finished price to the market grid. */
const onGrid = (sum: number, region: 'ID' | 'JP' | 'GLOBAL' = 'ID') => {
  const step = pricing.regions[region].round_to;
  return Math.round(sum / step) * step;
};

const priceOf = (id: string, region: 'ID' | 'JP' | 'GLOBAL') => pricing.features.find((f) => f.id === id)!.price[region];
const baseOf = (id: string, region: 'ID' | 'JP' | 'GLOBAL') => pricing.services.find((s) => s.id === id)!.base[region];
const extraOf = (region: 'ID' | 'JP' | 'GLOBAL') => pricing.extra_page.price[region];

describe('catalog is derived from hours, not hand-tuned', () => {
  // The old catalog drifted away from pricing_basis: the ID/GLOBAL ratio ran 6.6x-8.9x across packages
  // while the stated hourly rate implied 6.5x, which is how ID work ended up paying a fraction of GLOBAL
  // work for identical scope. Every price is now est_hours x rate, and this test keeps it that way.
  const rate = pricing.pricing_basis.hourly_rate;
  const markets = ['ID', 'JP', 'GLOBAL'] as const;

  const round = (n: number, step: number) => Math.round(n / step) * step;

  it('prices every service at est_hours x the market rate', () => {
    // Packages round to the price grid, so a plan that fits its package shows no rounding line.
    for (const s of pricing.services)
      for (const m of markets)
        expect(s.base[m], `${s.id} ${m}`).toBe(round(s.est_hours * rate[m], pricing.regions[m].round_to));
  });

  it('prices every feature at est_hours x the market rate', () => {
    for (const f of pricing.features)
      for (const m of markets)
        expect(f.price[m], `${f.id} ${m}`).toBe(round(f.est_hours * rate[m], pricing.regions[m].catalog_round));
  });

  it('keeps the extra page and every region coherent', () => {
    for (const m of markets) expect(pricing.extra_page.price[m], m).toBe(round(pricing.extra_page.est_hours * rate[m], pricing.regions[m].catalog_round));
    // A market ceiling must be a business decision in that market, not an artefact of exchange rates.
    // ID used to stop at Rp22m (about $1,229) while GLOBAL ran to $12,000 for the very same scope.
    for (const m of markets) {
      const reg = pricing.regions[m];
      expect(reg.max_price / rate[m], `${m} ceiling in hours`).toBeGreaterThan(150);
      expect(reg.max_price / rate[m], `${m} ceiling in hours`).toBeLessThan(260);
    }
  });
});

describe('concept scopes are the single source of truth', () => {
  // Every concept's scope lives in src/lib/samples/specs.ts. The detail page, the pricing engine and this
  // test all read it, so a price shown to a client cannot drift from docs/PRICING_RESEARCH_01_MARKET.md.
  const markets = ['ID', 'JP', 'GLOBAL'] as const;

  it('builds a schema-valid plan for every concept', () => {
    for (const key of CONCEPT_KEYS) {
      const spec = SAMPLE_SPECS[key];
      const p = toPlan(spec, essentialIds(spec), 'en');
      expect(p.serviceId, key).toBe(spec.serviceId);
      expect(p.pages.length, key).toBe(spec.contentPages.length + spec.featurePages.length);
      // Nothing may be silently dropped: MAX_PAGES must not bite, or the quote would be a discussion.
      expect(p.scopeTruncated, key).toBe(false);
      expect(contentPages(p).length, `${key} content pages`).toBe(spec.contentPages.length);
    }
  });

  it('switches unselected features off rather than deleting them', () => {
    const spec = SAMPLE_SPECS.tegak;
    const all = spec.features.map((f) => f.id);
    const p = toPlan(spec, essentialIds(spec), 'en');
    expect([...p.features, ...p.suggestions].map((f) => f.id).sort()).toEqual([...all].sort());
    expect(p.features.map((f) => f.id).sort()).toEqual(essentialIds(spec).sort());
  });

  it('uses no third-party dependency a solo studio would have to keep paying for', () => {
    // The owner builds alone and sells outright, so a subscription integration is a liability. Only
    // payment earns an exception, because a shop cannot take money without one.
    for (const key of CONCEPT_KEYS)
      for (const { id } of SAMPLE_SPECS[key].features)
        if (needsThirdParty(id)) expect(pricing.features.find((f) => f.id === id), `${key}/${id}`).toMatchObject({ crucial: true });
  });

  it('orders features by need first, then price ascending', () => {
    // The owner's priority order: needed+cheap, needed+costly, optional+cheap, optional+costly.
    for (const key of CONCEPT_KEYS) {
      const rows = orderedFeatures(SAMPLE_SPECS[key], 'ID');
      const tier = (r: (typeof rows)[number]) => (r.need === 'core' ? 0 : 1);
      for (let i = 1; i < rows.length; i++) {
        const [prev, cur] = [rows[i - 1], rows[i]];
        expect(tier(prev), `${key} ${prev.id} before ${cur.id}`).toBeLessThanOrEqual(tier(cur));
        if (tier(prev) === tier(cur)) expect(prev.amount, `${key} ${prev.id} <= ${cur.id}`).toBeLessThanOrEqual(cur.amount);
      }
      expect(rows.filter((r) => r.need === 'core').length, `${key} has essentials`).toBeGreaterThan(0);
    }
  });

  it('shares planKey with the consultant so a seeded result step needs no AI call', () => {
    // Consultant.tsx caches the mockup against this key. If the two implementations disagree, handing a
    // seeded state to the result step would look stale and fire an avoidable /api/mockup request.
    const p = toPlan(SAMPLE_SPECS.kurohane, essentialIds(SAMPLE_SPECS.kurohane), 'en');
    expect(planKey(p)).toBe(JSON.stringify([p.serviceId, p.pages.map((x) => x.name), p.features.map((f) => f.id)]));
    expect(planKey(p)).not.toBe(planKey(toPlan(SAMPLE_SPECS.kurohane, [], 'en')));
  });

  describe('full scope lands on the documented fee', () => {
    // Targets from docs/PRICING_RESEARCH_01_MARKET.md are for the whole v1 scope, so the comparison is the
    // full feature list. The essential subset is deliberately cheaper — that is the entry price, asserted
    // separately below.
    const priced = ['tegak', 'lembar', 'kurohane'] as const;
    const targets: Record<(typeof priced)[number], Record<(typeof markets)[number], number>> = {
      tegak: { ID: 6_500_000, JP: 220_000, GLOBAL: 1_900 },
      lembar: { ID: 13_000_000, JP: 440_000, GLOBAL: 3_800 },
      kurohane: { ID: 12_000_000, JP: 420_000, GLOBAL: 3_600 },
    };
    const priceOfScope = (key: (typeof priced)[number], region: (typeof markets)[number], ids: string[]) => {
      const spec = SAMPLE_SPECS[key];
      return quote(toPlan(spec, ids, 'id'), choices({ region, design: spec.design as never, content: 'ready' }), 'id', noDiscount);
    };

    for (const key of priced)
      for (const region of markets)
        it(`${key} ${region} is within 10% of the target`, () => {
          const all = SAMPLE_SPECS[key].features.map((f) => f.id);
          const q = priceOfScope(key, region, all);
          const want = targets[key][region];
          expect(Math.abs(q.price / want - 1), `${q.price} vs ${want}`).toBeLessThan(0.1);
          expect(q.lines.reduce((s, l) => s + l.amount, 0)).toBe(q.price);
        });

    it('keeps the essential price below full scope but not a teaser', () => {
      // The headline has to be reachable and honest: cheaper than everything switched on, yet still most
      // of the real cost. A tiny essential price followed by a large jump is the trap to avoid.
      for (const key of priced) {
        const spec = SAMPLE_SPECS[key];
        const essential = priceOfScope(key, 'ID', essentialIds(spec)).price;
        const full = priceOfScope(key, 'ID', spec.features.map((f) => f.id)).price;
        expect(essential, `${key} essential < full`).toBeLessThanOrEqual(full);
        expect(essential / full, `${key} essential is ${Math.round((essential / full) * 100)}% of full`).toBeGreaterThan(0.6);
      }
    });
  });

  it('prices Arden as a sellable catalogue, not a discussion', () => {
    // The auction gate must catch a bidding engine without catching a catalogue site for an auction house.
    const spec = SAMPLE_SPECS.arden;
    const q = quote(toPlan(spec, essentialIds(spec), 'id'), choices({ region: 'ID', design: 'full_custom', content: 'ready' }), 'id', noDiscount);
    expect(q.risk.blocking).toEqual([]);
    expect(q.status).toBe('fixed');
    expect(q.price).toBeGreaterThan(0);
    expect(q.price).toBeLessThan(pricing.regions.ID.max_price);
    expect(spec.notOffered?.length, 'what is excluded must be stated').toBeGreaterThan(0);
  });

  it('still refuses a real bidding engine', () => {
    const p = plan({ serviceId: 'company_profile', pageCount: 2, summary: 'Platform properti dengan bidding online dan proxy bid' });
    expect(quote(p, choices(), 'id', noDiscount).status).toBe('discuss');
  });

  it('gives the same scope the same effective rate in every market', () => {
    // Identical scope, proportionate price. Before the recalibration the same Kurohane scope paid roughly
    // 6-7x more per hour in GLOBAL than in ID.
    const spec = SAMPLE_SPECS.kurohane;
    const rate = pricing.pricing_basis.hourly_rate;
    const perHour = markets.map((region) => {
      const q = quote(toPlan(spec, essentialIds(spec), 'id'), choices({ region, design: 'full_custom', content: 'ready' }), 'id', noDiscount);
      return q.price / rate[region];
    });
    for (const h of perHour) expect(Math.abs(h / perHour[0] - 1)).toBeLessThan(0.1);
  });
});


describe('concept pages', () => {
  it('has a unique slug per concept per locale, and hreflang pairs for all of them', () => {
    for (const locale of LOCALES) {
      const slugs = CONCEPT_KEYS.map((k) => CONCEPT_SLUGS[k][locale]);
      expect(new Set(slugs).size, `${locale} slugs unique`).toBe(slugs.length);
    }
    // Without this, a concept page would ship with no hreflang and be missing from the sitemap.
    const pairs = allPagePairs();
    for (const k of CONCEPT_KEYS) expect(pairs.some((p) => p.en === conceptPath(k, 'en')), k).toBe(true);
  });

  it('has a schema-valid hand-written mockup in every locale', () => {
    // These are what make the concept route cost nothing: no mockup, no result step without an AI call.
    for (const k of CONCEPT_KEYS)
      for (const locale of LOCALES) {
        const parsed = MockupSchema.safeParse(CONCEPT_MOCKUPS[k][locale]);
        expect(parsed.success, `${k}/${locale}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues[0])}`).toBe(true);
      }
  });

  it('has landing copy for every concept in every locale', () => {
    for (const locale of LOCALES) {
      const concepts = getDict(locale).work.concepts;
      for (const k of CONCEPT_KEYS) expect(concepts.find((x) => x.key === k), `${k}/${locale}`).toBeDefined();
    }
  });

  it('names every page type it uses, so no screen falls back to a guess', () => {
    for (const k of CONCEPT_KEYS) {
      const spec = SAMPLE_SPECS[k];
      for (const page of [...spec.contentPages, ...spec.featurePages]) expect(PAGE_TYPES.has(page.type), `${k}/${page.type}`).toBe(true);
      for (const locale of LOCALES)
        for (const page of [...spec.contentPages, ...spec.featurePages]) expect(page.name[locale]?.length, `${k}/${page.type}/${locale}`).toBeGreaterThan(0);
    }
  });

  it('only lists feature ids that exist in the catalog, with no duplicates', () => {
    for (const k of CONCEPT_KEYS) {
      const ids = SAMPLE_SPECS[k].features.map((f) => f.id);
      expect(new Set(ids).size, `${k} duplicates`).toBe(ids.length);
      for (const id of ids) expect(pricing.features.some((f) => f.id === id), `${k}/${id}`).toBe(true);
    }
  });
});

describe('design and content multipliers only touch design work', () => {
  it('leaves a payment gateway untouched by the design level', () => {
    // full_custom used to inflate the entire subtotal, so "custom design" raised the price of a payment
    // integration and a role matrix by 40%. Only the design-bearing slice may move.
    const p = plan({ serviceId: 'online_store', pageCount: 6, features: feats('payment', 'shopping_cart', 'roles_permissions') });
    const tpl = quote(p, choices({ design: 'template' }), 'id', noDiscount);
    const full = quote(p, choices({ design: 'full_custom' }), 'id', noDiscount);
    const svc = pricing.services.find((s) => s.id === 'online_store')!;
    // Only base x design_share can move: roles_permissions is not design-bearing and the rest is included.
    const movable = svc.base.ID * svc.design_share;
    expect(full.price - tpl.price).toBeLessThanOrEqual(Math.ceil(movable * 0.26) + pricing.regions.ID.round_to);
    expect(full.price).toBeGreaterThan(tpl.price);
  });

  it('caps the combined multipliers at max_multiplier', () => {
    const p = plan({ serviceId: 'company_profile', pageCount: 9, features: feats('gallery', 'custom_animation', 'seo_basic') });
    const q = quote(p, choices({ design: 'full_custom', content: 'none', timeline: 'rush' }), 'id', noDiscount);
    expect(q.price).toBeLessThanOrEqual(Math.round(q.subtotal * pricing.calculation.max_multiplier) + pricing.regions.ID.round_to);
  });

  it('stops charging copywriting when there is no content at all', () => {
    // pricing.json has always said the content multiplier covers the writing; the engine used to bill both.
    const p = plan({ pageCount: 5, features: feats('copywriting') });
    const none = quote(p, choices({ content: 'none' }), 'id', noDiscount);
    expect(none.lines.find((l) => l.label === FEATURE_COPY.copywriting.id.name)).toMatchObject({ amount: 0, included: true });
    const ready = quote(p, choices({ content: 'ready' }), 'id', noDiscount);
    expect(ready.lines.find((l) => l.label === FEATURE_COPY.copywriting.id.name)!.amount).toBeGreaterThan(0);
  });
});

describe('risk gates the status, not the amount', () => {
  const auction = (over: Partial<Plan> = {}) => plan({ serviceId: 'company_profile', pageCount: 2, summary: 'Platform lelang properti dengan bidding online', ...over });

  it('refuses to commit on a blocking domain however small the number', () => {
    const q = quote(auction(), choices(), 'id', noDiscount);
    expect(q.risk.blocking.length).toBeGreaterThan(0);
    expect(q.status).toBe('discuss');
    expect(q.price).toBeLessThan(pricing.regions.ID.max_price); // small, and still refused
  });

  it('keeps refusing in every market and with no custom requests', () => {
    for (const region of ['ID', 'JP', 'GLOBAL'] as const)
      expect(quote(auction({ customRequests: [] }), choices({ region }), 'id', noDiscount).status, region).toBe('discuss');
  });

  it('cannot be cleared by dropping the custom-request label or changing the design level', () => {
    // Removing the three custom requests used to turn Arden GLOBAL into a fixed $9,150 with no change
    // to the business requirement at all.
    const q = quote(auction({ customRequests: [] }), choices({ region: 'GLOBAL', design: 'template' }), 'en', noDiscount);
    expect(q.status).toBe('discuss');
  });

  it('always needs a human for a custom web app', () => {
    const q = quote(plan({ serviceId: 'custom_web_app', pageCount: 3 }), choices(), 'id', noDiscount);
    expect(q.status).toBe('discuss');
  });

  it('ranges rather than fixes when a feature depends on an unvetted third party', () => {
    const q = quote(plan({ serviceId: 'company_profile', pageCount: 3, features: feats('payment') }), choices(), 'id', noDiscount);
    expect(q.risk.elevated.length).toBeGreaterThan(0);
    expect(q.status).toBe('range');
  });

  it('never loses scope silently', () => {
    // MAX_PAGES used to slice the array quietly, so three of Arden's operational screens vanished and the
    // engine quoted the remainder as if it were the whole job.
    const p = plan({ pageCount: 30 });
    expect(p.pages).toHaveLength(24);
    expect(p.scopeTruncated).toBe(true);
    expect(quote(p, choices(), 'id', noDiscount).status).toBe('discuss');
  });
});

describe('discount policy', () => {
  it('applies one discount, never a stack', () => {
    const promo: Promo = { code: 'TEST', percent: 10 };
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), choices({ region: 'GLOBAL' }), 'en', pricing as PricingData, promo);
    expect(q.discounts.filter((d) => d.amount > 0)).toHaveLength(1);
    expect(q.discounts[0].percent).toBeLessThanOrEqual(pricing.max_discount_percent);
    expect(q.savingsPercent).toBeLessThanOrEqual(pricing.max_discount_percent + 1); // rounding to the price step
  });

  it('takes the larger of founding and promo', () => {
    const big: Promo = { code: 'BIG', percent: 50 };
    const q = quote(plan(), choices({ region: 'GLOBAL' }), 'en', pricing as PricingData, big);
    expect(q.discounts[0].kind).toBe('promo');
    expect(q.discounts[0].percent).toBe(pricing.max_discount_percent);
  });

  it('gives no discount at all in a subsidised market', () => {
    // ID list prices already sit below the owner's cost floor, so discounting them again is not a promotion.
    const promo: Promo = { code: 'TEST', percent: 10 };
    const q = quote(plan(), choices({ region: 'ID' }), 'id', pricing as PricingData, promo);
    expect(q.discounts).toHaveLength(0);
    expect(q.total).toBe(q.price);
  });

  it('never discounts below the market minimum', () => {
    const q = quote(plan({ serviceId: 'landing_page', pageCount: 1 }), choices({ region: 'GLOBAL' }), 'en');
    expect(q.total).toBeGreaterThanOrEqual(pricing.regions.GLOBAL.min_price);
  });
});


describe('quote', () => {
  it('charges only the base when the plan fits the package', () => {
    const q = quote(plan(), choices(), 'en', noDiscount);
    expect(q.total).toBe(baseOf('company_profile', 'ID'));
    expect(q.lines).toHaveLength(1);
  });

  it('charges extra pages flat and features in the package as included', () => {
    const q = quote(plan({ serviceId: 'booking_reservation', pageCount: 7, features: feats('contact_form', 'cms_admin', 'google_maps') }), choices({ region: 'GLOBAL' }), 'en', noDiscount);
    expect(q.lines.find((l) => l.kind === 'pages')).toMatchObject({ quantity: 2, amount: extraOf('GLOBAL') * 2 });
    expect(q.lines.filter((l) => l.included)).toHaveLength(2);
    expect(q.total).toBe(onGrid(baseOf('booking_reservation', 'GLOBAL') + extraOf('GLOBAL') * 2 + priceOf('google_maps', 'GLOBAL'), 'GLOBAL'));
  });

  it('prices copywriting per page and ignores duplicate features', () => {
    const q = quote(plan({ pageCount: 6, features: feats('copywriting', 'copywriting', 'whatsapp_button') }), choices(), 'id', noDiscount);
    const writing = priceOf('copywriting', 'ID') * 6;
    expect(q.lines.find((l) => l.label.includes('teks'))).toMatchObject({ quantity: 6, amount: writing });
    expect(q.featuresCount).toBe(2);
    expect(q.total).toBe(onGrid(baseOf('company_profile', 'ID') + extraOf('ID') + writing));
  });

  it('itemises every multiplier so the breakdown adds up to the price', () => {
    const q = quote(plan({ features: feats('gallery', 'google_maps') }), choices({ design: 'full_custom', content: 'none', timeline: 'rush' }), 'en', noDiscount);
    expect(q.lines.reduce((s, l) => s + l.amount, 0)).toBe(q.price);
    expect(q.price % pricing.regions.ID.round_to).toBe(0);
  });

  it('never goes below the region minimum, even after the founding discount', () => {
    const tiny = { ...pricing, services: pricing.services.map((s) => (s.id === 'landing_page' ? { ...s, base: { ID: 400_000, JP: 12_000, GLOBAL: 100 } } : s)) } as PricingData;
    const q = quote(plan({ serviceId: 'landing_page', pageCount: 1 }), choices(), 'id', tiny);
    expect(q.price).toBe(pricing.regions.ID.min_price);
    expect(q.total).toBe(pricing.regions.ID.min_price);
  });

  it('applies the founding discount on the price, rounded', () => {
    const q = quote(plan(), choices({ region: 'GLOBAL' }), 'en');
    const list = baseOf('company_profile', 'GLOBAL');
    const step = pricing.regions.GLOBAL.round_to;
    expect(q.discounts).toHaveLength(1);
    expect(q.discounts[0]).toMatchObject({ kind: 'founding', percent: pricing.founding_offer.percent });
    expect(q.total).toBe(list - Math.round((list * pricing.founding_offer.percent) / 100 / step) * step);
  });

  it('shows a range when a request is outside the catalog', () => {
    const q = quote(plan({ customRequests: [{ name: 'Loyalty points', description: '' }] }), choices(), 'id', noDiscount);
    expect(q.status).toBe('range');
    expect(q.priceHigh).toBe(Math.round((q.price * pricing.calculation.range_upper) / pricing.regions.ID.round_to) * pricing.regions.ID.round_to);
  });

  it('asks for a discussion above the region maximum', () => {
    const q = quote(plan({ serviceId: 'online_course', pageCount: 24, features: feats('multilang', 'copywriting', 'seo_advanced', 'ai_generator', 'subscription_billing') }), choices({ design: 'full_custom', content: 'none', timeline: 'rush' }), 'id', noDiscount);
    expect(q.price).toBeGreaterThan(pricing.regions.ID.max_price);
    expect(q.status).toBe('discuss');
  });

  it('extends and compresses the timeline', () => {
    const base = quote(plan(), choices(), 'en', noDiscount).workdays;
    expect(base).toEqual([5, 9]);
    const more = quote(plan({ pageCount: 8, features: feats('cms_admin') }), choices(), 'en', noDiscount).workdays;
    expect(more).toEqual([5 + 3, 9 + 3]); // 3 pages × 2h + 9h = 15h → 3 days
    const rush = quote(plan(), choices({ timeline: 'rush' }), 'en', noDiscount).workdays;
    expect(rush).toEqual([3, 6]); // time_factor 0.6
  });
});

describe('catalog copy', () => {
  it('has client-facing copy for every id in pricing.json', () => {
    for (const s of pricing.services) expect(SERVICE_COPY[s.id], s.id).toBeDefined();
    for (const f of pricing.features) expect(FEATURE_COPY[f.id], f.id).toBeDefined();
    for (const r of pricing.recurring) expect(RECURRING_COPY[r.id], r.id).toBeDefined();
    for (const r of pricing.not_included) expect(NOT_INCLUDED_COPY[r.id], r.id).toBeDefined();
    for (const [key, opts] of Object.entries(pricing.multipliers)) for (const o of opts) expect(MULTIPLIER_COPY[key as keyof typeof MULTIPLIER_COPY].options[o.id], `${key}.${o.id}`).toBeDefined();
  });

  it('maps every website type to a service in pricing.json', () => {
    for (const k of SERVICE_KEYS) expect(pricing.services.some((s) => s.id === SERVICE_PRICING_ID[k]), k).toBe(true);
  });
});

describe('page areas', () => {
  const screen = (name: string, area: 'member' | 'admin', feature: string): Page => ({ name, area, feature, covers: [], purpose: '', sections: [] });

  it('does not charge member or admin screens as extra pages', () => {
    const base = quote(plan({ pageCount: 5, features: feats('cms_admin') }), choices(), 'id', noDiscount);
    const withScreens = quote(
      plan({ pages: [...pages(5), screen('Manage products', 'admin', 'cms_admin'), screen('Orders', 'admin', 'cms_admin'), screen('My orders', 'member', 'user_login')], features: feats('cms_admin', 'user_login') }),
      choices(),
      'id',
      noDiscount,
    );
    expect(withScreens.pagesCount).toBe(5);
    // Only the user_login feature is charged; the three screens add nothing. Each total is rounded to the
    // market grid on its own, so compare within one rounding step rather than demanding an exact delta.
    expect(Math.abs(withScreens.total - base.total - priceOf('user_login', 'ID'))).toBeLessThanOrEqual(pricing.regions.ID.round_to);
  });

  it('hides screens whose feature is switched off, and shows them again when it is back on', () => {
    const p = plan({ pages: [...pages(3), screen('Manage menu', 'admin', 'cms_admin')], features: feats('gallery') });
    expect(visiblePages(p).map((x) => x.name)).not.toContain('Manage menu');
    const on = { ...p, features: [...p.features, ...feats('cms_admin')] };
    expect(visiblePages(on).map((x) => x.name)).toContain('Manage menu');
  });

  it('keeps screens provided by a package feature (online store includes the admin)', () => {
    const p = plan({ serviceId: 'online_store', pages: [...pages(6), screen('Orders', 'admin', 'cms_admin')] });
    expect(visiblePages(p)).toHaveLength(7);
    expect(publicPages(p)).toHaveLength(6);
  });

  it('falls back to the usual feature when the AI leaves feature empty', () => {
    const p = plan({ pages: [...pages(2), screen('Content', 'admin', '')], features: feats('cms_admin') });
    expect(visiblePages(p)).toHaveLength(3);
    expect(visiblePages({ ...p, features: [] })).toHaveLength(2);
  });

  it('counts copywriting per public page only', () => {
    const p = plan({ pages: [...pages(4), screen('Orders', 'admin', 'cms_admin')], features: [feat('copywriting', 1), feat('cms_admin', 1)] });
    expect(quote(p, choices(), 'id', noDiscount).lines.find((l) => l.label === FEATURE_COPY.copywriting.id.name)?.quantity).toBe(4);
  });

  it('reads plans saved before page areas existed as public pages', () => {
    const old = PlanSchema.parse({ ...plan(), pages: [{ name: 'Home', purpose: '', sections: [] }], goals: ['old field'] });
    expect(old.pages[0].area).toBe('public');
    expect(old.flows).toEqual([]);
  });
});

describe('page types', () => {
  const typed = (type: string, name = type) => PlanShape.pages.parse([{ type, name, purpose: '', sections: [] }])[0];

  it('references only catalog features and has copy in both languages', () => {
    const ids = new Set(pricing.features.map((f) => f.id));
    for (const t of pricing.page_types) {
      const feature = (t as { feature?: string }).feature;
      if (feature) expect(ids.has(feature), `${t.id} → ${feature}`).toBe(true);
      expect(PAGE_COPY[t.id]?.en && PAGE_COPY[t.id]?.id, t.id).toBeTruthy();
      expect(['public', 'member', 'admin'], t.id).toContain(t.area);
    }
    expect(new Set(pricing.page_types.map((t) => t.id)).size).toBe(pricing.page_types.length);
  });

  it('derives area and feature from the type, ignoring what the AI wrote', () => {
    const cart = PlanShape.pages.parse([{ type: 'cart', name: 'Cart', area: 'admin', feature: 'gallery', purpose: '', sections: [] }])[0];
    expect([cart.area, cart.feature]).toEqual(['public', 'shopping_cart']);
    expect([typed('about').area, typed('about').feature]).toEqual(['public', '']);
    expect([typed('orders').area, typed('orders').feature]).toEqual(['admin', 'cms_admin']);
  });

  it('counts only content pages, not pages that come with a feature', () => {
    // Company Profile (5 pages included) with a shop: 3 content pages + 4 shop pages → no extra page charge
    const p = plan({
      pages: ['home', 'about', 'contact', 'product_list', 'product_detail', 'cart', 'checkout'].map((t) => typed(t)),
      features: feats('product_catalog', 'shopping_cart'),
    });
    expect(contentPages(p)).toHaveLength(3);
    expect(publicPages(p)).toHaveLength(7);
    expect(quote(p, choices(), 'id', noDiscount).total).toBe(onGrid(baseOf('company_profile', 'ID') + priceOf('product_catalog', 'ID') + priceOf('shopping_cart', 'ID')));
  });

  it('hides feature pages when the feature is off', () => {
    const p = plan({ pages: ['home', 'blog_list', 'article'].map((t) => typed(t)) });
    expect(visiblePages(p).map((x) => x.type)).toEqual(['home']);
    expect(visiblePages({ ...p, features: feats('blog_section') }).map((x) => x.type)).toEqual(['home', 'blog_list', 'article']);
  });

  it('shows feature pages that the package includes (blog in Blog & Media)', () => {
    const p = plan({ serviceId: 'blog_media', pages: ['home', 'blog_list', 'article', 'about'].map((t) => typed(t)) });
    expect(contentPages(p)).toHaveLength(2);
    expect(publicPages(p)).toHaveLength(4);
  });

  it('keeps plans without page types working (older saved plans)', () => {
    const p = plan({ pages: [{ name: 'Old page', area: 'public', feature: '', covers: [], purpose: '', sections: [] }] });
    expect(p.pages[0].type).toBeUndefined();
    expect(contentPages(p)).toHaveLength(1);
  });
});

describe('feature catalog', () => {
  const ids = new Set(pricing.features.map((f) => f.id));

  it('puts every feature in a known category with copy in both languages', () => {
    for (const c of pricing.feature_categories) expect(CATEGORY_COPY[c], c).toBeDefined();
    for (const f of pricing.features) {
      expect(pricing.feature_categories, f.id).toContain(f.category);
      expect(FEATURE_COPY[f.id]?.en.name && FEATURE_COPY[f.id]?.id.name, f.id).toBeTruthy();
    }
    expect(ids.size).toBe(pricing.features.length);
  });

  it('labels the unit of every per-item feature and uses only known units', () => {
    for (const f of pricing.features) {
      const unit = (f as { unit?: string }).unit;
      if (!unit) continue;
      expect(['page', 'item'], f.id).toContain(unit);
      if (unit === 'item') expect(FEATURE_COPY[f.id].en.unit && FEATURE_COPY[f.id].id.unit, f.id).toBeTruthy();
    }
  });

  it('only includes catalog features in packages', () => {
    for (const s of pricing.services) for (const id of (s as { includes?: string[] }).includes ?? []) expect(ids.has(id), `${s.id} → ${id}`).toBe(true);
  });

  it('prices features close to est_hours × hourly rate', () => {
    const rate = pricing.pricing_basis.hourly_rate;
    for (const f of pricing.features) {
      if (f.est_hours === 0) continue;
      for (const r of ['ID', 'GLOBAL'] as const) {
        const ratio = f.price[r] / (f.est_hours * rate[r]);
        expect(ratio, `${f.id} ${r}`).toBeGreaterThan(0.75);
        expect(ratio, `${f.id} ${r}`).toBeLessThan(1.3);
      }
    }
  });

  it('multiplies per-item features by their quantity', () => {
    // Company Profile, 5 pages, 2 connected services + 1 extra language.
    const q = quote(plan({ features: [feat('api_integration', 2), feat('multilang', 1)] }), choices(), 'id', noDiscount);
    expect(q.lines.find((l) => l.label === FEATURE_COPY.api_integration.id.name)?.quantity).toBe(2);
    expect(q.price).toBe(onGrid(baseOf('company_profile', 'ID') + priceOf('api_integration', 'ID') * 2 + priceOf('multilang', 'ID')));
  });

  it('ignores quantity on features without a per-item unit', () => {
    const one = quote(plan({ features: [feat('gallery', 1)] }), choices(), 'id', noDiscount);
    const many = quote(plan({ features: [feat('gallery', 5)] }), choices(), 'id', noDiscount);
    expect(many.total).toBe(one.total);
  });

  it('treats a package core feature as included, but charges it elsewhere', () => {
    const store = quote(plan({ serviceId: 'online_store', pageCount: 6, features: feats('shopping_cart', 'product_catalog') }), choices(), 'id', noDiscount);
    expect(store.total).toBe(baseOf('online_store', 'ID'));
    const profile = quote(plan({ features: feats('shopping_cart') }), choices(), 'id', noDiscount);
    expect(profile.total).toBe(onGrid(baseOf('company_profile', 'ID') + priceOf('shopping_cart', 'ID')));
  });

  it('defaults a missing or invalid quantity to 1 (older saved plans)', () => {
    const p = plan({ features: [{ id: 'multilang', reason: '' } as never, { id: 'api_integration', reason: '', quantity: 99 } as never] });
    expect(p.features.map((f) => f.quantity)).toEqual([1, 1]);
  });
});

const promo = (percent: number): Promo => ({ code: 'KENALANCEO', percent });

describe('one discount, not a stack', () => {
  // Was: founding and promo added up to 40% off. On an Indonesian booking project that worked out at about
  // a third of the Kanagawa minimum wage per hour, so the engine now applies whichever single offer is larger.
  const glob = (over = {}) => choices({ region: 'GLOBAL', ...over });

  it('takes the larger offer and ignores the other', () => {
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), glob(), 'en', pricing as PricingData, promo(90));
    expect(q.discounts).toHaveLength(1);
    expect(q.discounts[0].kind).toBe('promo');
    expect(q.discounts[0].percent).toBe(pricing.max_discount_percent);
  });

  it('falls back to founding when the promo is smaller', () => {
    const d = { ...pricing, max_discount_percent: 30, founding_offer: { ...pricing.founding_offer, percent: 25 } } as PricingData;
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), glob(), 'en', d, promo(5));
    expect(q.discounts[0]).toMatchObject({ kind: 'founding', percent: 25 });
  });

  it('applies the promo alone once the founding spots are gone', () => {
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), glob(), 'en', noDiscount, promo(10));
    expect(q.discounts).toHaveLength(1);
    expect(q.discounts[0].kind).toBe('promo');
  });

  it('labels the promo row with the code', () => {
    expect(quote(plan(), glob(), 'id', noDiscount, promo(10)).discounts[0].label).toBe('Kode promo KENALANCEO');
    expect(quote(plan(), glob(), 'en', noDiscount, promo(10)).discounts[0].label).toBe('Promo code KENALANCEO');
  });

  it('never discounts below the market minimum', () => {
    const small = { ...pricing, services: pricing.services.map((s) => (s.id === 'landing_page' ? { ...s, base: { ID: 800_000, JP: 32_000, GLOBAL: 275 } } : s)) } as PricingData;
    const q = quote(plan({ serviceId: 'landing_page', pageCount: 1 }), glob(), 'en', small, promo(90));
    expect(q.total).toBeGreaterThanOrEqual(pricing.regions.GLOBAL.min_price);
    expect(q.savings).toBe(q.price - q.total);
  });

  it('discounts the upper bound of a range too', () => {
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6, customRequests: [{ name: 'Loyalty points', description: '' }] }), glob(), 'en', pricing as PricingData, promo(10));
    expect(q.status).toBe('range');
    expect(q.totalHigh).toBeGreaterThan(q.total);
    expect(q.totalHigh).toBeLessThan(q.priceHigh);
  });

  it('gives a subsidised market no discount at all', () => {
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), choices({ region: 'ID' }), 'id', pricing as PricingData, promo(90));
    expect(q.discounts).toHaveLength(0);
    expect(q.total).toBe(q.price);
  });
});


describe('validatePromo', () => {
  const set = (v: string) => (process.env.PROMO_CODES = v);
  afterEach(() => delete process.env.PROMO_CODES);

  it('accepts a configured code regardless of case and spacing', () => {
    set('KENALANCEO=8');
    expect(validatePromo('kenalanceo')).toEqual({ code: 'KENALANCEO', percent: 8 });
    expect(validatePromo('  Kenalan Ceo ')).toEqual({ code: 'KENALANCEO', percent: 8 });
  });

  it('reads several codes and clamps each to max_discount_percent', () => {
    set('KENALANCEO=8,TEMANLAMA=90');
    expect(validatePromo('TEMANLAMA')?.percent).toBe(pricing.max_discount_percent);
    expect(validatePromo('KENALANCEO')?.percent).toBe(8);
  });

  it('rejects unknown, empty and malformed codes', () => {
    set('KENALANCEO=8,BROKEN,ZERO=0');
    expect(validatePromo('NOPE')).toBeNull();
    expect(validatePromo('')).toBeNull();
    expect(validatePromo(undefined)).toBeNull();
    expect(validatePromo('BROKEN')).toBeNull();
    expect(validatePromo('ZERO')).toBeNull();
  });

  it('rejects everything when no codes are configured', () => {
    set('');
    expect(validatePromo('KENALANCEO')).toBeNull();
  });
});

describe('withEnv', () => {
  it('keeps the pricing.json values when nothing is set', () => {
    expect(withEnv(pricing, {})).toEqual(pricing);
    expect(withEnv(pricing, { PUBLIC_FOUNDING_PERCENT: '' }).founding_offer.percent).toBe(pricing.founding_offer.percent);
  });

  it('overrides the discount knobs from the environment', () => {
    const d = withEnv(pricing, { PUBLIC_FOUNDING_PERCENT: '30', PUBLIC_FOUNDING_SPOTS: '3', PUBLIC_FOUNDING_TAKEN: '1', PUBLIC_MAX_DISCOUNT_PERCENT: '50' });
    expect(d.founding_offer).toMatchObject({ percent: 30, spots_total: 3, spots_taken: 1 });
    expect(d.max_discount_percent).toBe(50);
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), choices({ region: 'GLOBAL' }), 'en', d);
    expect(q.discounts[0]).toMatchObject({ kind: 'founding', percent: 30 });
  });

  it('ignores values that are not usable numbers', () => {
    const d = withEnv(pricing, { PUBLIC_FOUNDING_PERCENT: 'abc', PUBLIC_FOUNDING_SPOTS: '-2' });
    expect(d.founding_offer.percent).toBe(pricing.founding_offer.percent);
    expect(d.founding_offer.spots_total).toBe(pricing.founding_offer.spots_total);
  });

  it('switches the founding offer off when the percentage or the spots are zero', () => {
    expect(quote(plan(), choices({ region: 'GLOBAL' }), 'en', withEnv(pricing, { PUBLIC_FOUNDING_PERCENT: '0' })).discounts).toHaveLength(0);
    expect(quote(plan(), choices({ region: 'GLOBAL' }), 'en', withEnv(pricing, { PUBLIC_FOUNDING_SPOTS: '0' })).discounts).toHaveLength(0);
  });

  it('lets a bigger cap raise the single discount, without stacking it', () => {
    const d = withEnv(pricing, { PUBLIC_FOUNDING_PERCENT: '30', PUBLIC_MAX_DISCOUNT_PERCENT: '50' });
    const q = quote(plan({ serviceId: 'online_store', pageCount: 6 }), choices({ region: 'GLOBAL' }), 'en', d, promo(45));
    expect(q.discounts).toHaveLength(1);
    expect(q.discounts[0]).toMatchObject({ kind: 'promo', percent: 45 });
  });
});
