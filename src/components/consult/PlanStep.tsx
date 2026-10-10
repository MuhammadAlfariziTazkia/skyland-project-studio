import { useState } from 'preact/hooks';
import pricing from '../../../data/pricing.json';
import { FEATURE_COPY, PAGE_COPY } from '../../i18n/catalog';
import type { ConsultStrings } from '../../i18n/consult';
import { featurePrice, formatPrice, formatShort, getService, quotePriceText, visiblePages, type Quote } from '../../lib/pricing';
import { MAX_QUANTITY, type Locale, type Plan } from '../../lib/schemas';

interface Props {
  t: ConsultStrings;
  locale: Locale;
  plan: Plan;
  q: Quote;
  onChange: (p: Plan) => void;
  answers: Record<number, number>;
  onAnswer: (answers: Record<number, number>) => void;
  revision: string;
  onRevision: (s: string) => void;
  revisionUsed: boolean;
  reviseNote: string;
  onRevise: () => void;
  error: string;
  onBack: () => void;
  onNext: () => void;
}

type Feature = Plan['features'][number];
type Page = Plan['pages'][number];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Drawn as two strokes so it sits exactly in the middle of the round button (a text "×" follows the font baseline). */
const XIcon = () => (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
    <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>
);

export function PlanStep({ t, locale, plan, q, onChange, answers, onAnswer, revision, onRevision, revisionUsed, reviseNote, onRevise, error, onBack, onNext }: Props) {
  const [newPage, setNewPage] = useState('');
  const svc = getService(plan.serviceId);
  const region = q.region;
  const update = (patch: Partial<Plan>) => onChange({ ...plan, ...patch });
  const copy = (id: string) => FEATURE_COPY[id]?.[locale];

  // Switching a feature off keeps it visible under "You could also add", so nothing silently disappears.
  const toggle = (f: Feature, on: boolean) =>
    on
      ? update({ features: plan.features.filter((x) => x.id !== f.id), suggestions: [f, ...plan.suggestions] })
      : update({ suggestions: plan.suggestions.filter((x) => x.id !== f.id), features: [...plan.features, f] });

  const answer = (qi: number, oi: number) => {
    const question = plan.questions[qi];
    const prev = answers[qi] != null ? question.options[answers[qi]] : null;
    const opt = question.options[oi];
    const drop = new Set([...(prev?.add ?? []), ...opt.remove]);
    let features = plan.features.filter((f) => !drop.has(f.id));
    for (const id of opt.add) if (!features.some((f) => f.id === id)) features = [...features, { id, reason: '', quantity: 1 }];
    const on = new Set(features.map((f) => f.id));
    update({ features, suggestions: plan.suggestions.filter((f) => !on.has(f.id)) });
    onAnswer({ ...answers, [qi]: oi });
  };

  const addPage = (e: Event) => {
    e.preventDefault();
    const name = newPage.trim();
    if (!name) return;
    update({ pages: [...plan.pages, { type: 'custom', name: name.slice(0, 60), area: 'public', feature: '', covers: [], purpose: '', sections: [] }] });
    setNewPage('');
  };

  const priceTag = (id: string) => {
    const p = featurePrice(plan.serviceId, id, region);
    if (p.kind === 'included') return <span class="ftag inc">{t.plan.inPackage}</span>;
    if (p.kind === 'free') return <span class="ftag inc">{t.plan.free}</span>;
    const per = p.unit === 'page' ? t.plan.perPage : p.unit === 'item' ? `/${copy(id)?.unit ?? ''}` : '';
    return <span class="ftag">+{formatShort(p.amount, region)}{per}</span>;
  };

  const setQty = (id: string, quantity: number) =>
    update({ features: plan.features.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) } : x)) });

  // Per-item features (extra languages, connected services) get a stepper once they are switched on.
  const stepper = (f: Feature) => {
    const p = featurePrice(plan.serviceId, f.id, region);
    if (p.unit !== 'item' || p.kind === 'included') return null;
    const name = copy(f.id)?.name ?? f.id;
    return (
      <div class="qty" role="group" aria-label={`${t.plan.qty}: ${name}`}>
        <button type="button" aria-label={`${t.plan.less}: ${name}`} disabled={f.quantity <= 1} onClick={() => setQty(f.id, f.quantity - 1)}>−</button>
        <span aria-live="polite">{f.quantity} × {copy(f.id)?.unit}</span>
        <button type="button" aria-label={`${t.plan.more}: ${name}`} disabled={f.quantity >= MAX_QUANTITY} onClick={() => setQty(f.id, f.quantity + 1)}>+</button>
      </div>
    );
  };

  const row = (f: Feature, on: boolean) => (
    <li>
      <button type="button" role="switch" aria-checked={on} class={`feat ${on ? 'on' : ''}`} onClick={() => toggle(f, on)}>
        <span class="sw-toggle" aria-hidden="true"><i /></span>
        <span class="feat-main">
          <b>{copy(f.id)?.name ?? f.id}</b>
          <span>{f.reason || copy(f.id)?.plain}</span>
        </span>
        {priceTag(f.id)}
      </button>
      {on && stepper(f)}
    </li>
  );

  const pages = visiblePages(plan);
  const pub = pages.filter((p) => p.area === 'public');
  const content = pub.filter((p) => !p.feature);
  const pageName = (p: Page) => p.name || (p.type ? PAGE_COPY[p.type]?.[locale] : '') || '';
  const contentCount = content.length;
  const removePage = (p: Page) => update({ pages: plan.pages.filter((x) => x !== p) });
  const customersDo = plan.flows.filter((f) => f.who !== 'owner');
  const ownerDo = plan.flows.filter((f) => f.who === 'owner');

  // Member and owner screens come with a feature, so they are listed compactly and never priced as pages.
  const areaCard = (area: 'member' | 'admin') => {
    const list = pages.filter((p) => p.area === area);
    if (!list.length) return null;
    return (
      <div class={`area-card ${area}`}>
        <div class="area-head">
          <b>{area === 'admin' ? t.plan.adminArea : t.plan.memberArea}</b>
          <span class="ftag inc">{t.plan.noExtraCost}</span>
        </div>
        <p class="fine">{area === 'admin' ? t.plan.adminNote : t.plan.memberNote}</p>
        <ul class="screens">
          {list.map((p) => (
            <li>
              <div>
                <b>{pageName(p)}</b>
                {p.purpose && <span>{p.purpose}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div class="cs-body">
      <div class="cs-head">
        <h2>{plan.projectName || t.plan.title}</h2>
        {plan.summary && <p>{plan.summary}</p>}
      </div>

      {plan.flows.length > 0 && (
        <div class="flows">
          {customersDo.length > 0 && (
            <div>
              <b>{t.plan.customersCan}</b>
              <ul>
                {customersDo.map((f) => (
                  <li>{cap(f.does)}</li>
                ))}
              </ul>
            </div>
          )}
          {ownerDo.length > 0 && (
            <div>
              <b>{t.plan.youCan}</b>
              <ul>
                {ownerDo.map((f) => (
                  <li>{cap(f.does)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <section class="blk">
        <h3>
          {t.plan.pages} <span class="count">{pub.length}</span>
        </h3>
        <p class="fine blk-note">{t.plan.pagesNote(svc.pages_included, formatShort(pricing.extra_page.price[region], region))}</p>
        <ol class="pages">
          {pub.map((p, i) => {
            // Only content pages count against the package; pages that come with a feature say which one.
            const nth = p.feature ? -1 : content.indexOf(p);
            return (
              <li class="page">
                <span class="pnum">{i + 1}</span>
                <div class="page-body">
                  <div class="page-top">
                    <b>{pageName(p)}</b>
                    {!p.feature && nth >= svc.pages_included && (
                      <span class="ftag">{t.plan.extraTag(formatShort(pricing.extra_page.price[region], region))}</span>
                    )}
                    {!p.feature && contentCount > 1 && (
                      <button type="button" class="x" aria-label={`${t.plan.remove}: ${pageName(p)}`} onClick={() => removePage(p)}>
                        <XIcon />
                      </button>
                    )}
                  </div>
                  {p.purpose && <p>{p.purpose}</p>}
                  {p.sections.length > 0 && (
                    <p class="secs">
                      <span>{t.plan.contains}</span> {p.sections.join(' · ')}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <form class="add-page" onSubmit={addPage}>
          <input type="text" maxLength={60} placeholder={t.plan.addPagePh} aria-label={t.plan.addPagePh} value={newPage} onInput={(e) => setNewPage((e.target as HTMLInputElement).value)} />
          <button type="submit" class="btn btn-ghost btn-sm" disabled={!newPage.trim()}>
            + {t.plan.addPage}
          </button>
        </form>
        {areaCard('member')}
        {areaCard('admin')}
      </section>

      <section class="blk">
        <h3>
          {t.plan.features} <span class="count">{plan.features.length}</span>
        </h3>
        <ul class="feats">{plan.features.map((f) => row(f, true))}</ul>
        {plan.suggestions.length > 0 && (
          <>
            <h4 class="sub">{t.plan.optional}</h4>
            <ul class="feats">{plan.suggestions.map((f) => row(f, false))}</ul>
          </>
        )}
      </section>

      {plan.customRequests.length > 0 && (
        <section class="blk custom">
          <h3>{t.plan.custom}</h3>
          <p class="fine blk-note">{t.plan.customNote}</p>
          <ul class="feats">
            {plan.customRequests.map((c, i) => (
              <li class="creq">
                <div class="feat-main">
                  <b>{c.name}</b>
                  {c.description && <span>{c.description}</span>}
                </div>
                <button type="button" class="x" aria-label={`${t.plan.remove}: ${c.name}`} onClick={() => update({ customRequests: plan.customRequests.filter((_, j) => j !== i) })}>
                  <XIcon />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {plan.questions.map((qn, qi) => (
        <section class="blk ask">
          <span class="k">{t.plan.questions}</span>
          <p>{qn.question}</p>
          <div class="chips" role="radiogroup" aria-label={qn.question}>
            {qn.options.map((o, oi) => (
              <button type="button" role="radio" aria-checked={answers[qi] === oi} class={`chip ${answers[qi] === oi ? 'sel' : ''}`} onClick={() => answer(qi, oi)}>
                {o.label}
              </button>
            ))}
          </div>
        </section>
      ))}

      {plan.assumptions.length > 0 && (
        <details class="assume">
          <summary>{t.plan.assumptions}</summary>
          <ul class="dots">
            {plan.assumptions.map((a) => (
              <li>{a}</li>
            ))}
          </ul>
        </details>
      )}

      <section class="blk revise">
        <h3>
          ✦ {t.plan.reviseTitle} <span class="count">{revisionUsed ? '0/1' : '1/1'}</span>
        </h3>
        {revisionUsed ? (
          <p class="fine">{reviseNote ? `✓ ${reviseNote} ` : ''}{t.plan.reviseUsed}</p>
        ) : (
          <>
            <textarea rows={3} maxLength={800} placeholder={t.plan.revisePh} value={revision} onInput={(e) => onRevision((e.target as HTMLTextAreaElement).value)} />
            <div class="row-end">
              <button type="button" class="btn btn-ghost btn-sm" disabled={revision.trim().length < 3} onClick={onRevise}>
                {t.plan.reviseBtn}
              </button>
            </div>
          </>
        )}
      </section>

      {error && (
        <p class="err" role="alert">
          {error}
        </p>
      )}

      <div class="cs-actions sticky">
        <button type="button" class="btn btn-ghost" onClick={onBack}>
          ← {t.plan.back}
        </button>
        <div class="next-wrap">
          <LivePrice {...livePrice(q, t)} />
          <button type="button" class="btn btn-primary" onClick={onNext}>
            {t.plan.next} →
          </button>
        </div>
      </div>
    </div>
  );
}

/** Derived once so the bar on the plan step and the style step can never drift apart. */
export function livePrice(q: Quote, t: ConsultStrings) {
  return {
    label: t.plan.live,
    price: quotePriceText(q) || t.plan.discuss,
    // A struck range next to a discounted range is unreadable at this size; step 4 has the full breakdown.
    was: q.savings > 0 && q.status === 'fixed' ? formatPrice(q.price, q.region) : '',
    save: q.savings > 0 && q.status !== 'discuss' ? t.plan.saveShort(q.savingsPercent) : '',
    days: t.result.workdays(q.workdays[0], q.workdays[1]),
  };
}

/** The running total next to the primary action, so every change shows its effect immediately. */
export function LivePrice({ label, price, was, save, days }: { label: string; price: string; was?: string; save?: string; days: string }) {
  return (
    <div class="live" aria-live="polite">
      <div class="live-top">
        <span class="lbl">{label}</span>
        {save && <span class="save">{save}</span>}
      </div>
      <div class="live-now">
        {was && <s>{was}</s>}
        <b>{price}</b>
      </div>
      <small>{days}</small>
    </div>
  );
}
