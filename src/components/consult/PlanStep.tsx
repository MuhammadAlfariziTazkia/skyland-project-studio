import { useState } from 'preact/hooks';
import pricing from '../../../data/pricing.json';
import { FEATURE_COPY, SERVICE_COPY } from '../../i18n/catalog';
import type { ConsultStrings } from '../../i18n/consult';
import { featurePrice, formatPrice, formatShort, getService, quotePriceText, type Quote } from '../../lib/pricing';
import type { Locale, Plan } from '../../lib/schemas';

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

export function PlanStep({ t, locale, plan, q, onChange, answers, onAnswer, revision, onRevision, revisionUsed, reviseNote, onRevise, error, onBack, onNext }: Props) {
  const [newPage, setNewPage] = useState('');
  const svc = getService(plan.serviceId);
  const region = q.region;
  const update = (patch: Partial<Plan>) => onChange({ ...plan, ...patch });
  const listed = new Set([...plan.features, ...plan.suggestions].map((f) => f.id));
  const addable = pricing.features.filter((f) => !listed.has(f.id));
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
    for (const id of opt.add) if (!features.some((f) => f.id === id)) features = [...features, { id, reason: '' }];
    const on = new Set(features.map((f) => f.id));
    update({ features, suggestions: plan.suggestions.filter((f) => !on.has(f.id)) });
    onAnswer({ ...answers, [qi]: oi });
  };

  const addPage = (e: Event) => {
    e.preventDefault();
    const name = newPage.trim();
    if (!name) return;
    update({ pages: [...plan.pages, { name: name.slice(0, 60), purpose: '', sections: [] }] });
    setNewPage('');
  };

  const priceTag = (id: string) => {
    const p = featurePrice(plan.serviceId, id, region);
    if (p.kind === 'included') return <span class="ftag inc">{t.plan.inPackage}</span>;
    if (p.kind === 'free') return <span class="ftag inc">{t.plan.free}</span>;
    return <span class="ftag">+{formatShort(p.amount, region)}{p.perPage ? t.plan.perPage : ''}</span>;
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
    </li>
  );

  const price = quotePriceText(q) || t.plan.discuss;

  return (
    <div class="cs-body">
      <div class="cs-head">
        <span class="type-pill">{SERVICE_COPY[plan.serviceId]?.[locale].name}</span>
        <h2>{plan.projectName || t.plan.title}</h2>
        {plan.summary && <p>{plan.summary}</p>}
      </div>

      {plan.goals.length > 0 && (
        <div class="helps">
          <b>{t.plan.helps}</b>
          <ul>
            {plan.goals.map((g) => (
              <li>{g}</li>
            ))}
          </ul>
        </div>
      )}

      <section class="blk">
        <h3>
          {t.plan.pages} <span class="count">{plan.pages.length}</span>
        </h3>
        <p class="fine blk-note">{t.plan.pagesNote(svc.pages_included, formatShort(pricing.extra_page.price[region], region))}</p>
        <ol class="pages">
          {plan.pages.map((p, i) => (
            <li class="page">
              <span class="pnum">{i + 1}</span>
              <div class="page-body">
                <div class="page-top">
                  <b>{p.name}</b>
                  {i >= svc.pages_included && <span class="ftag">{t.plan.extraTag(formatShort(pricing.extra_page.price[region], region))}</span>}
                  {plan.pages.length > 1 && (
                    <button type="button" class="x" aria-label={`${t.plan.remove}: ${p.name}`} onClick={() => update({ pages: plan.pages.filter((_, j) => j !== i) })}>
                      ×
                    </button>
                  )}
                </div>
                {p.purpose && <p>{p.purpose}</p>}
                {p.sections.length > 0 && (
                  <div class="secs">
                    {p.sections.map((sec) => (
                      <span>{sec}</span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <form class="add-page" onSubmit={addPage}>
          <input type="text" maxLength={60} placeholder={t.plan.addPagePh} aria-label={t.plan.addPagePh} value={newPage} onInput={(e) => setNewPage((e.target as HTMLInputElement).value)} />
          <button type="submit" class="btn btn-ghost btn-sm" disabled={!newPage.trim()}>
            + {t.plan.addPage}
          </button>
        </form>
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
        {addable.length > 0 && (
          <select
            class="add"
            value=""
            aria-label={t.plan.addFeature}
            onChange={(e) => {
              const id = (e.target as HTMLSelectElement).value;
              if (id) update({ features: [...plan.features, { id, reason: '' }] });
              (e.target as HTMLSelectElement).value = '';
            }}
          >
            <option value="">+ {t.plan.addFeature}</option>
            {addable.map((f) => (
              <option value={f.id}>{copy(f.id)?.name ?? f.label}</option>
            ))}
          </select>
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
                  ×
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
              <span class="fine">{t.plan.reviseLeft}</span>
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
          <LivePrice label={t.plan.live} price={price} was={q.savings > 0 ? formatPrice(q.price, q.region) : ''} days={t.result.workdays(q.workdays[0], q.workdays[1])} />
          <button type="button" class="btn btn-primary" onClick={onNext}>
            {t.plan.next} →
          </button>
        </div>
      </div>
    </div>
  );
}

/** The running total next to the primary action, so every change shows its effect immediately. */
export function LivePrice({ label, price, was, days }: { label: string; price: string; was?: string; days: string }) {
  return (
    <div class="live" aria-live="polite">
      <span>{label}</span>
      <div class="live-now">
        {was && <s>{was}</s>}
        <b>{price}</b>
      </div>
      <small>{days}</small>
    </div>
  );
}
