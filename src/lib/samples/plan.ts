import { FEATURE_COPY, SERVICE_COPY } from '../../i18n/catalog';
import { PRICING, featurePrice, getFeature, type PricingData } from '../pricing';
import { PlanSchema, type Locale, type Plan, type Region } from '../schemas';
import type { SampleSpec } from './specs';

/**
 * Turns a concept's scope into the same `Plan` shape the AI produces, so a price from a concept page and a
 * price from a consultation go through one engine. Nothing here computes money.
 */

/**
 * Cache key for the generated mockup copy: it depends on the plan, not the style, so switching styles
 * re-renders locally without a new AI call.
 *
 * Shared with `Consultant.tsx` on purpose. If the two ever disagree, handing a seeded state to the result
 * step would look stale and fire an avoidable `/api/mockup` call.
 */
export const planKey = (plan: Plan | null) => JSON.stringify([plan?.serviceId, plan?.pages.map((p) => p.name), plan?.features.map((f) => f.id)]);

export interface OrderedFeature {
  id: string;
  need: 'core' | 'nice';
  /** 0 when the package already includes it, or when the feature itself is free. */
  amount: number;
  included: boolean;
  unit?: 'page' | 'item';
}

/**
 * The owner's priority order: how badly the sector needs it first, then price ascending.
 *
 * That ordering produces the four tiers (needed+cheap → needed+costly → optional+cheap → optional+costly)
 * without inventing a "cheap" threshold, and it means the top of the list is always the highest-value,
 * lowest-cost work. Included features sort first within `core` because they cost nothing.
 */
export function orderedFeatures(spec: SampleSpec, region: Region, data: PricingData = PRICING): OrderedFeature[] {
  return spec.features
    .map(({ id, need }) => {
      const { kind, amount, unit } = featurePrice(spec.serviceId, id, region, data);
      return { id, need, amount, included: kind === 'included', unit };
    })
    .sort((a, b) => (a.need === b.need ? a.amount - b.amount : a.need === 'core' ? -1 : 1));
}

/** Feature ids pre-selected for a concept: everything the sector cannot operate without. */
export const essentialIds = (spec: SampleSpec): string[] => spec.features.filter((f) => f.need === 'core').map((f) => f.id);

/**
 * Builds the plan for a concept with `selected` switched on. Unselected features become `suggestions`,
 * exactly as `PlanStep` does when the client toggles one off — `quote()` only charges `features`, and the
 * screens a dropped feature brought disappear from the plan on their own via `visiblePages()`.
 */
export function toPlan(spec: SampleSpec, selected: readonly string[], locale: Locale, data: PricingData = PRICING): Plan {
  const on = new Set(selected);
  const reason = (id: string) => FEATURE_COPY[id]?.[locale].name ?? id;
  const feature = (id: string) => ({ id, reason: reason(id), quantity: 1 });

  return PlanSchema.parse({
    serviceId: spec.serviceId,
    projectName: spec.key,
    summary: conceptBrief(spec, locale, data),
    audience: '',
    business: '',
    flows: [],
    styles: [spec.theme],
    pages: [...spec.contentPages, ...spec.featurePages].map((page) => ({
      type: page.type,
      name: page.name[locale],
      purpose: '',
      sections: [],
      covers: [],
    })),
    features: spec.features.filter((f) => on.has(f.id)).map((f) => feature(f.id)),
    suggestions: spec.features.filter((f) => !on.has(f.id)).map((f) => feature(f.id)),
    customRequests: [],
    questions: [],
    assumptions: [],
  });
}

/**
 * The brief the order email and the internal notes read, written by the system rather than the client.
 * It names the concept and the chosen scope so an order arriving from a concept page is self-explanatory.
 */
export function conceptBrief(spec: SampleSpec, locale: Locale, data: PricingData = PRICING): string {
  const service = SERVICE_COPY[spec.serviceId]?.[locale].name ?? spec.serviceId;
  const pages = spec.contentPages.length;
  return locale === 'id'
    ? `Pesanan dari halaman konsep "${spec.key}" (${service}): ${pages} halaman konten, scope mengikuti konsep tersebut. Klien memilih konsep ini, bukan menulis brief sendiri.`
    : `Ordered from the "${spec.key}" concept page (${service}): ${pages} content pages, scope follows that concept. The client picked this concept rather than writing a brief.`;
}

/** Features in the catalog that need a third-party account or subscription to work. */
export const needsThirdParty = (id: string, data: PricingData = PRICING): boolean =>
  (getFeature(id, data) as { external_dependency?: boolean }).external_dependency === true;
