import { useMemo, useState } from 'preact/hooks';
import '../consult/consult.css';
import { consultStrings } from '../../i18n/consult';
import { getDict } from '../../i18n';
import type { ConceptKey } from '../../i18n/routes';
import { formatPrice, quote, quotePriceText } from '../../lib/pricing';
import { CONCEPT_MOCKUPS } from '../../lib/samples/mockups';
import { conceptBrief, essentialIds, orderedFeatures, planKey, toPlan } from '../../lib/samples/plan';
import { SAMPLE_SPECS } from '../../lib/samples/specs';
import { useMarket } from '../useMarket';
import type { Locale } from '../../lib/schemas';

interface Props {
  locale: Locale;
  concept: ConceptKey;
  /** Where to send the client once they accept this scope. */
  consultHref: string;
}

const STORE = 'skyland-consult-v2';

/**
 * The priced feature breakdown on a concept page, and the hand-off into the consultant.
 *
 * This island is the concept route's answer to step 2 of the consultation: the client adjusts scope here
 * instead of reviewing an AI plan, so they never choose features twice. Everything it shows comes from
 * `quote()` — there is no second pricing path — and nothing it does touches the network.
 */
export default function ConceptPricing({ locale, concept, consultHref }: Props) {
  const spec = SAMPLE_SPECS[concept];
  const t = consultStrings[locale];
  const c = getDict(locale).conceptPage;

  const [selected, setSelected] = useState<string[]>(() => essentialIds(spec));
  // Read from the device, never asked. This panel is the only place on the page that states a price.
  const region = useMarket(locale);

  const rows = useMemo(() => orderedFeatures(spec, region, locale), [spec, region, locale]);
  const essentials = rows.filter((r) => r.need === 'core');
  const options = rows.filter((r) => r.need === 'nice');

  const plan = useMemo(() => toPlan(spec, selected, locale), [spec, selected, locale]);

  const q = useMemo(
    () => quote(plan, { region, design: spec.design as never, content: 'ready', timeline: 'normal', promoCode: '' }, locale),
    [plan, region, spec.design, locale],
  );

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /**
   * Seeds the consultant's own state and jumps to its result step. The consultant restores whatever is in
   * this key, so the client lands on a rendered mockup and a price with no AI call: `mockupKey` has to
   * match `planKey(plan)` or the result step would ask the model for copy it already has.
   */
  const accept = () => {
    try {
      const raw = localStorage.getItem(STORE);
      const saved = raw ? (JSON.parse(raw) as { plan?: unknown; step?: string }) : null;
      if (saved?.plan && saved.step && saved.step !== 'describe' && !confirm(c.overwrite)) return;
    } catch {
      /* unreadable state is nothing worth protecting */
    }
    const mockup = CONCEPT_MOCKUPS[concept][locale];
    const state = {
      step: 'result',
      description: conceptBrief(spec, locale),
      plan,
      mockup,
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
  };

  const tag = (r: (typeof rows)[number]) =>
    r.included ? (
      <span class="ftag inc">{c.included}</span>
    ) : r.amount === 0 ? (
      <span class="ftag inc">{c.free}</span>
    ) : (
      <span class="ftag">
        +{formatPrice(r.amount, region)}
        {r.unit === 'item' ? ' /item' : ''}
      </span>
    );

  const row = (r: (typeof rows)[number]) => {
    const on = selected.includes(r.id);
    return (
      <li key={r.id}>
        <button type="button" class={`feat${on ? ' on' : ''}`} role="switch" aria-checked={on} onClick={() => toggle(r.id)}>
          <span class="sw-toggle" aria-hidden="true">
            <i />
          </span>
          <span class="feat-main">
            <b>{r.name}</b>
            <span>{r.does}</span>
            {r.so && <em>{r.so}</em>}
          </span>
          {tag(r)}
        </button>
      </li>
    );
  };

  return (
    <div class="cs cp">
      <div class="cp-grid">
        <div class="stack cp-lists">
          <section>
            <h3>
              {c.essentials} <span class="count">{essentials.length}</span>
            </h3>
            <p class="fine">{c.essentialsNote}</p>
            <ul class="feats stack">{essentials.map(row)}</ul>
          </section>

          {/* Collapsed by default. The essentials already explain the price; showing eighteen toggles at
              once invites fiddling with things that should stay on and makes the page feel endless. */}
          <details class="opt">
            <summary>
              <span>{c.options}</span> <span class="count">{options.length}</span>
            </summary>
            <p class="fine">{c.optionsNote}</p>
            <ul class="feats stack">{options.map(row)}</ul>
          </details>

          {spec.caveats?.map((cv) => (
            <p class="warn" key={cv[locale]}>
              <b>{c.caveat}:</b> {cv[locale]}
            </p>
          ))}

          {spec.notOffered && (
            <section class="custom">
              <h3>{c.notOffered}</h3>
              <ul class="stack not-offered">
                {spec.notOffered.map((n) => (
                  <li key={n.label[locale]}>
                    <b>{n.label[locale]}</b>
                    <span>{n.why[locale]}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>

        <aside class="price-card">
          <div class="stack" style="gap:4px">
            <span class="k">{c.yourPrice}</span>
            {q.status === 'discuss' ? (
              <>
                <b class="total range">{c.discussTitle}</b>
                <p class="warn" style="margin-top:8px">{q.risk.blocking.length > 0 ? t.result.discussBlocked(q.risk.blocking.join(', ')) : c.discussText}</p>
              </>
            ) : (
              <>
                <b class={`total${q.status === 'range' ? ' range' : ''}`}>{quotePriceText(q)}</b>
                {q.status === 'range' && <p class="warn" style="margin-top:8px">{c.rangeNote}</p>}
              </>
            )}
          </div>

          <ul class="facts">
            <li>
              <span>{c.timeline}</span>
              <b>{t.result.workdays(q.workdays[0], q.workdays[1])}</b>
            </li>
            <li>
              <span>{c.pagesFact}</span>
              <b>{q.pagesCount}</b>
            </li>
          </ul>

          {q.status !== 'discuss' && (
            <details class="bd">
              <summary>{t.result.breakdown}</summary>
              <table>
                <tbody>
                  {q.lines.map((l, i) => (
                    <tr key={i} class={l.kind === 'adjust' ? 'adjust' : undefined}>
                      <td>
                        {l.label}
                        {l.detail && <small>{l.detail}</small>}
                      </td>
                      <td class={l.included ? 'inc' : undefined}>{l.included ? c.included : formatPrice(l.amount, region)}</td>
                    </tr>
                  ))}
                  {q.discounts.map((d) => (
                    <tr class="disc" key={d.kind}>
                      <td>{d.label}</td>
                      <td>−{formatPrice(d.amount, region)}</td>
                    </tr>
                  ))}
                  <tr class="tot">
                    <td>{t.result.total}</td>
                    <td>{quotePriceText(q) || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </details>
          )}

          <div class="cs-actions col">
            <button type="button" class="btn btn-primary" onClick={accept}>
              {q.status === 'discuss' ? t.result.discussOrder : c.cta} →
            </button>
            <p class="fine">{c.ctaNote}</p>
          </div>
        </aside>
      </div>

      {/* On a phone the price panel sits below sixteen rows, so the number would be out of sight exactly
          while the client is changing it. This bar keeps the total and the action in view. */}
      <div class="cp-bar" aria-hidden={q.status === 'discuss' ? 'true' : undefined}>
        <div class="cp-bar-in">
          <span class="stack">
            <small>{c.yourPrice}</small>
            <b>{q.status === 'discuss' ? c.discussTitle : quotePriceText(q)}</b>
          </span>
          <button type="button" class="btn btn-primary btn-sm" onClick={accept}>
            {q.status === 'discuss' ? t.result.discussOrder : c.cta} →
          </button>
        </div>
      </div>
    </div>
  );
}
