import type { ConceptKey } from '../../i18n/routes';
import { CONCEPT_MOCKUPS } from '../../lib/samples/mockups';
import { conceptBrief, planKey } from '../../lib/samples/plan';
import { SAMPLE_SPECS } from '../../lib/samples/specs';
import type { Locale, Plan, Region } from '../../lib/schemas';

const STORE = 'skyland-consult-v2';

/**
 * Seeds the consultant's own state and jumps to its result step. The consultant restores whatever is in
 * this key, so the client lands on a rendered mockup and a price with no AI call: `mockupKey` has to
 * match `planKey(plan)` or the result step would ask the model for copy it already has.
 *
 * Shared by the catalog panel and the template panel, so both hand over exactly the same state shape.
 */
export function handOffToConsultant(opts: { concept: ConceptKey; locale: Locale; region: Region; plan: Plan; consultHref: string; overwrite: string }) {
  const { concept, locale, region, plan, consultHref, overwrite } = opts;
  const spec = SAMPLE_SPECS[concept];
  try {
    const raw = localStorage.getItem(STORE);
    const saved = raw ? (JSON.parse(raw) as { plan?: unknown; step?: string }) : null;
    if (saved?.plan && saved.step && saved.step !== 'describe' && !confirm(overwrite)) return;
  } catch {
    /* unreadable state is nothing worth protecting */
  }
  const state = {
    step: 'result',
    description: conceptBrief(spec, locale),
    plan,
    mockup: CONCEPT_MOCKUPS[concept][locale],
    mockupKey: planKey(plan),
    theme: spec.theme,
    choices: { region, design: spec.design, content: 'ready', timeline: 'normal', promoCode: '' },
    promo: null,
    revision: '',
    revisionUsed: false,
    reviseNote: '',
    answers: {},
    quoteId: '',
  };
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
  } catch {
    /* private mode: fall through to the consultant, which will start from the brief instead */
  }
  location.href = consultHref;
}
