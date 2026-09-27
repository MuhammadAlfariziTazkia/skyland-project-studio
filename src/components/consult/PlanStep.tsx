import pricing from '../../../data/pricing.json';
import type { ConsultStrings } from '../../i18n/consult';
import type { Locale, Plan } from '../../lib/schemas';

type Feat = { name: { en: string; id: string }; unit?: string; category: string };
const FEATURES = pricing.features as Record<string, Feat>;
const TYPES = pricing.projectTypes as Record<string, { name: { en: string; id: string }; includedFeatures: string[] }>;

interface Props {
  t: ConsultStrings;
  locale: Locale;
  plan: Plan;
  onChange: (p: Plan) => void;
  revision: string;
  onRevision: (s: string) => void;
  revisionUsed: boolean;
  onRevise: () => void;
  error: string;
  onBack: () => void;
  onNext: () => void;
}

export function PlanStep({ t, locale, plan, onChange, revision, onRevision, revisionUsed, onRevise, error, onBack, onNext }: Props) {
  const type = TYPES[plan.projectType];
  const included = new Set(type?.includedFeatures ?? []);
  const inPlan = new Set(plan.features.map((f) => f.id));
  const addable = Object.entries(FEATURES).filter(([id]) => !inPlan.has(id));
  const update = (patch: Partial<Plan>) => onChange({ ...plan, ...patch });
  const featureCount = plan.features.length + plan.customFeatures.length;

  return (
    <div class="cs-body">
      <div class="cs-head">
        <h2>{plan.projectName || t.plan.title}</h2>
        <p>{t.plan.hint}</p>
      </div>

      <div class="summary">
        <div>
          <span class="k">{t.plan.type}</span>
          <b>{type?.name[locale] ?? plan.projectType}</b>
        </div>
        {plan.summary && <p>{plan.summary}</p>}
        {plan.audience && (
          <div>
            <span class="k">{t.plan.audience}</span>
            <span>{plan.audience}</span>
          </div>
        )}
        {plan.goals.length > 0 && (
          <div>
            <span class="k">{t.plan.goals}</span>
            <ul class="dots">
              {plan.goals.map((g) => (
                <li>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <section class="blk">
        <h3>
          {t.plan.pages} <span class="count">{plan.pages.length}</span>
        </h3>
        <ul class="pages">
          {plan.pages.map((p, i) => (
            <li class="page">
              <div class="page-top">
                <b>{p.name}</b>
                <span class={`cx ${p.complexity}`}>{t.plan.complexity[p.complexity]}</span>
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
            </li>
          ))}
        </ul>
      </section>

      <section class="blk">
        <h3>
          {t.plan.features} <span class="count">{featureCount}</span>
        </h3>
        <ul class="feats">
          {plan.features.map((f, i) => {
            const def = FEATURES[f.id];
            const hasQty = def?.unit && def.unit !== 'page';
            return (
              <li class="feat">
                <div class="feat-main">
                  <b>{def?.name[locale] ?? f.id}</b>
                  {included.has(f.id) && <span class="tag-inc">{t.plan.included}</span>}
                  {f.reason && <p>{f.reason}</p>}
                </div>
                {hasQty && (
                  <label class="qty">
                    <span>{t.plan.qty}</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={f.quantity}
                      onInput={(e) => {
                        const v = Math.max(1, Math.min(10, Number((e.target as HTMLInputElement).value) || 1));
                        update({ features: plan.features.map((x, j) => (j === i ? { ...x, quantity: v } : x)) });
                      }}
                    />
                  </label>
                )}
                <button type="button" class="x" aria-label={`${t.plan.remove}: ${def?.name[locale] ?? f.id}`} onClick={() => update({ features: plan.features.filter((_, j) => j !== i) })}>
                  ×
                </button>
              </li>
            );
          })}
          {plan.customFeatures.map((c, i) => (
            <li class="feat custom">
              <div class="feat-main">
                <b>{c.name}</b>
                <span class="tag-custom">
                  {t.plan.custom} · {c.tier}
                </span>
                {c.description && <p>{c.description}</p>}
              </div>
              <button type="button" class="x" aria-label={`${t.plan.remove}: ${c.name}`} onClick={() => update({ customFeatures: plan.customFeatures.filter((_, j) => j !== i) })}>
                ×
              </button>
            </li>
          ))}
        </ul>
        {addable.length > 0 && (
          <select
            class="add"
            value=""
            aria-label={t.plan.addFeature}
            onChange={(e) => {
              const id = (e.target as HTMLSelectElement).value;
              if (id) update({ features: [...plan.features, { id, reason: '', quantity: 1 }] });
              (e.target as HTMLSelectElement).value = '';
            }}
          >
            <option value="">+ {t.plan.addFeature}</option>
            {addable.map(([id, f]) => (
              <option value={id}>{f.name[locale]}</option>
            ))}
          </select>
        )}
        <label class="check-row">
          <input type="checkbox" checked={plan.rush} onChange={(e) => update({ rush: (e.target as HTMLInputElement).checked })} />
          <span>{t.plan.rush}</span>
        </label>
      </section>

      {(plan.assumptions.length > 0 || plan.questions.length > 0) && (
        <section class="blk notes">
          {plan.assumptions.length > 0 && (
            <div>
              <h3>{t.plan.assumptions}</h3>
              <ul class="dots">
                {plan.assumptions.map((a) => (
                  <li>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.questions.length > 0 && (
            <div>
              <h3>{t.plan.questions}</h3>
              <ul class="dots">
                {plan.questions.map((a) => (
                  <li>{a}</li>
                ))}
              </ul>
              {!revisionUsed && <p class="fine">{t.plan.questionsHint}</p>}
            </div>
          )}
        </section>
      )}

      <section class="blk revise">
        <h3>
          ✦ {t.plan.reviseTitle} <span class="count">{revisionUsed ? '0/1' : '1/1'}</span>
        </h3>
        {revisionUsed ? (
          <p class="fine">{t.plan.reviseUsed}</p>
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
          <span class="counts">{t.plan.counts(plan.pages.length, featureCount)}</span>
          <button type="button" class="btn btn-primary" onClick={onNext}>
            {t.plan.next} →
          </button>
        </div>
      </div>
    </div>
  );
}
