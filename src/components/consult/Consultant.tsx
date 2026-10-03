import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import pricing from '../../../data/pricing.json';
import { consultStrings } from '../../i18n/consult';
import { renderMockup } from '../../lib/mockup/render';
import { THEMES, themeSwatchHtml } from '../../lib/mockup/themes';
import { MULTIPLIER_COPY, NOT_INCLUDED_COPY, RECURRING_COPY } from '../../i18n/catalog';
import { quote as computeQuote, defaultChoices, formatPrice, formatShort, quotePriceText, type Promo } from '../../lib/pricing';
import { REGIONS, THEME_IDS, type Choices, type Locale, type Mockup, type Plan, type ThemeId } from '../../lib/schemas';
import { LivePrice, PlanStep } from './PlanStep';
import { PromoField } from './PromoField';
import { Segmented } from './Segmented';
import { OrderStep, type ContactForm } from './OrderStep';
import { MockupFrame } from './MockupFrame';
import { Loading } from './Loading';
import './consult.css';

type Step = 'describe' | 'plan' | 'theme' | 'result' | 'order' | 'done';
interface State {
  step: Step;
  description: string;
  reference: string;
  plan: Plan | null;
  revision: string;
  revisionUsed: boolean;
  reviseNote: string;
  answers: Record<number, number>;
  choices: Choices;
  promo: Promo | null;
  theme: ThemeId;
  mockup: Mockup | null;
  mockupKey: string;
  contact: ContactForm;
  quoteId: string;
}

interface Props {
  locale: Locale;
  whatsapp: string;
  privacyHref: string;
  turnstileSiteKey: string;
}

const STORE = 'skyland-consult-v2';
const load = (): Partial<State> | null => {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const save = (s: State) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
};

async function post<T>(url: string, body: unknown, t: typeof consultStrings.en): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error(t.errors.network);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || t.errors.generic);
  return data as T;
}

const planKey = (plan: Plan | null, theme: ThemeId) => JSON.stringify([plan?.serviceId, plan?.pages.map((p) => p.name), plan?.features.map((f) => f.id), theme]);

export default function Consultant({ locale, whatsapp, privacyHref, turnstileSiteKey }: Props) {
  const t = consultStrings[locale];
  const initial: State = {
    step: 'describe',
    description: '',
    reference: '',
    plan: null,
    revision: '',
    revisionUsed: false,
    reviseNote: '',
    answers: {},
    choices: defaultChoices(locale),
    promo: null,
    theme: 'minimal',
    mockup: null,
    mockupKey: '',
    contact: { name: '', email: '', whatsapp: '', company: '', notes: '', consent: false },
    quoteId: '',
  };
  const [s, setS] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState<keyof typeof t.loading | null>(null);
  const [error, setError] = useState('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));
  const go = (step: Step) => {
    set({ step });
    setError('');
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  useEffect(() => {
    const saved = load();
    if (saved) setS((prev) => ({ ...prev, ...saved, step: saved.step === 'done' ? 'describe' : (saved.step ?? 'describe') }));
    if (matchMedia('(max-width: 639px)').matches) setDevice('mobile');
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) save(s);
  }, [s, hydrated]);

  // Optional Cloudflare Turnstile on the first AI call
  useEffect(() => {
    if (!turnstileSiteKey || s.step !== 'describe' || !tsRef.current) return;
    const w = window as unknown as { turnstile?: { render: (el: HTMLElement, o: object) => void } };
    const render = () => w.turnstile?.render(tsRef.current!, { sitekey: turnstileSiteKey, callback: setTurnstileToken, 'expired-callback': () => setTurnstileToken('') });
    if (w.turnstile) return render();
    const sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    sc.async = true;
    sc.onload = render;
    document.head.appendChild(sc);
  }, [turnstileSiteKey, s.step]);

  const q = useMemo(() => (s.plan ? computeQuote(s.plan, s.choices, locale, undefined, s.promo) : null), [s.plan, s.choices, locale, s.promo]);

  // The browser only learns the percentage; the code itself never ships in the bundle.
  const applyPromo = async (code: string): Promise<boolean> => {
    try {
      const res = await post<{ ok: boolean; code?: string; percent?: number }>('/api/promo', { code }, t);
      if (!res.ok || !res.code || !res.percent) return false;
      set({ promo: { code: res.code, percent: res.percent } });
      return true;
    } catch {
      return false;
    }
  };
  const choose = (patch: Partial<Choices>) => set({ choices: { ...s.choices, ...patch } });
  const multi = (key: keyof typeof MULTIPLIER_COPY) => Object.entries(MULTIPLIER_COPY[key].options).map(([id, o]) => ({ id, label: o[locale].label }));
  const mockHtml = useMemo(() => (s.mockup ? renderMockup(s.mockup, s.theme, { locale }) : ''), [s.mockup, s.theme, locale]);

  const run = async (kind: keyof typeof t.loading, fn: () => Promise<void>) => {
    setBusy(kind);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errors.generic);
    } finally {
      setBusy(null);
    }
  };

  const generatePlan = () =>
    run('plan', async () => {
      const { plan } = await post<{ plan: Plan }>('/api/plan', { mode: 'create', locale, description: s.description, reference: s.reference, website: honeypot, turnstileToken: turnstileToken || undefined }, t);
      set({ plan, revisionUsed: false, revision: '', reviseNote: '', answers: {}, mockup: null, mockupKey: '' });
      go('plan');
    });

  const revisePlan = () =>
    run('revise', async () => {
      const { plan, note } = await post<{ plan: Plan; note: string }>('/api/plan', { mode: 'revise', locale, description: s.description, plan: s.plan, instruction: s.revision, website: honeypot }, t);
      set({ plan, revisionUsed: true, reviseNote: note });
    });

  const generateMockup = () => {
    const key = planKey(s.plan, s.theme);
    if (s.mockup && s.mockupKey === key) return go('result');
    run('mockup', async () => {
      const { mockup } = await post<{ mockup: Mockup }>('/api/mockup', { locale, plan: s.plan, theme: s.theme, description: s.description }, t);
      set({ mockup, mockupKey: key });
      go('result');
    });
  };

  const submitOrder = () =>
    run('order', async () => {
      const res = await post<{ quoteId: string }>(
        '/api/order',
        { locale, choices: { ...s.choices, promoCode: s.promo?.code ?? '' }, description: s.description, revision: s.revisionUsed ? s.revision : '', plan: s.plan, theme: s.theme, mockup: s.mockup, contact: s.contact, website: honeypot },
        t,
      );
      set({ quoteId: res.quoteId });
      go('done');
    });

  const restart = () => {
    if (!confirm(t.restartConfirm)) return;
    setS(initial);
    setError('');
  };

  const stepIndex = { describe: 0, plan: 1, theme: 2, result: 3, order: 3, done: 3 }[s.step];
  const canVisit = (i: number) => i < stepIndex || (i === 1 && !!s.plan) || (i === 2 && !!s.plan) || (i === 3 && !!s.mockup);
  const stepTargets: Step[] = ['describe', 'plan', 'theme', 'result'];

  return (
    <div class="cs" ref={topRef}>
      <ol class="cs-progress" aria-label="Progress">
        {t.steps.map((label, i) => (
          <li class={i === stepIndex ? 'on' : i < stepIndex ? 'done' : ''}>
            <button type="button" disabled={!canVisit(i) || !!busy || s.step === 'done'} onClick={() => go(stepTargets[i])} aria-current={i === stepIndex ? 'step' : undefined}>
              <span class="dot">{i < stepIndex ? '✓' : i + 1}</span>
              <span class="lbl">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div class="cs-card">
        <input class="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onInput={(e) => setHoneypot((e.target as HTMLInputElement).value)} />

        {busy && <Loading messages={t.loading[busy]} />}

        {!busy && s.step === 'describe' && (
          <form
            class="cs-body"
            onSubmit={(e) => {
              e.preventDefault();
              if (s.description.trim().length >= 20) generatePlan();
            }}
          >
            <div class="cs-head">
              <h2>{t.describe.title}</h2>
              <p>{t.describe.hint}</p>
            </div>
            <label class="sr-only" for="cs-desc">{t.describe.title}</label>
            <div class="ta">
              <textarea id="cs-desc" rows={8} maxLength={1500} placeholder={t.describe.placeholder} value={s.description} onInput={(e) => set({ description: (e.target as HTMLTextAreaElement).value })} />
              <div class="ta-foot">
                <button type="button" class="link" onClick={() => set({ description: t.describe.placeholder.replace(/^(Example|Contoh): /, '') })}>
                  {t.describe.example}
                </button>
                <span>{s.description.length}/1500</span>
              </div>
            </div>
            <div class="chips">
              {t.describe.chips.map(([label, insert]) => (
                <button type="button" class="chip" onClick={() => set({ description: (s.description.trimEnd() + insert).slice(0, 1500) })}>
                  {label}
                </button>
              ))}
            </div>
            <fieldset class="quick">
              <legend>{t.describe.quick}</legend>
              <Segmented label={t.describe.region} value={s.choices.region} options={REGIONS.map((id) => ({ id, label: t.describe.regions[id] }))} onChange={(region) => choose({ region: region as Choices['region'] })} />
              <Segmented label={MULTIPLIER_COPY.content_readiness.question[locale]} value={s.choices.content} options={multi('content_readiness')} onChange={(content) => choose({ content })} />
              <Segmented label={MULTIPLIER_COPY.timeline.question[locale]} value={s.choices.timeline} options={multi('timeline')} onChange={(timeline) => choose({ timeline })} />
            </fieldset>
            <label class="field">
              <span>{t.describe.reference}</span>
              <input type="text" maxLength={200} placeholder={t.describe.referencePh} value={s.reference} onInput={(e) => set({ reference: (e.target as HTMLInputElement).value })} />
            </label>
            {turnstileSiteKey && <div ref={tsRef} class="ts" />}
            {error && <p class="err" role="alert">{error}</p>}
            <div class="cs-actions">
              <p class="fine">🔒 {t.describe.privacy}</p>
              <button type="submit" class="btn btn-primary" disabled={s.description.trim().length < 20 || (!!turnstileSiteKey && !turnstileToken)}>
                {t.describe.submit} →
              </button>
            </div>
          </form>
        )}

        {!busy && s.step === 'plan' && s.plan && q && (
          <PlanStep
            t={t}
            locale={locale}
            plan={s.plan}
            q={q}
            onChange={(plan) => set({ plan })}
            answers={s.answers}
            onAnswer={(answers) => set({ answers })}
            reviseNote={s.reviseNote}
            revision={s.revision}
            onRevision={(revision) => set({ revision })}
            revisionUsed={s.revisionUsed}
            onRevise={revisePlan}
            error={error}
            onBack={() => go('describe')}
            onNext={() => go('theme')}
          />
        )}

        {!busy && s.step === 'theme' && (
          <div class="cs-body">
            <div class="cs-head">
              <h2>{t.theme.title}</h2>
              <p>{t.theme.hint}</p>
            </div>
            <div class="themes" role="radiogroup" aria-label={t.theme.title}>
              {THEME_IDS.map((id) => (
                <button type="button" role="radio" aria-checked={s.theme === id} class={`theme ${s.theme === id ? 'sel' : ''}`} onClick={() => set({ theme: id })}>
                  <div class="sw" dangerouslySetInnerHTML={{ __html: themeSwatchHtml(id) }} />
                  <div class="tn">
                    <b>{THEMES[id].name[locale]}</b>
                    <span>{THEMES[id].sub[locale]}</span>
                  </div>
                </button>
              ))}
            </div>
            <div class="design">
              <h3>{MULTIPLIER_COPY.design_level.question[locale]}</h3>
              <div class="levels" role="radiogroup" aria-label={MULTIPLIER_COPY.design_level.question[locale]}>
                {pricing.multipliers.design_level.map((m) => {
                  const c = MULTIPLIER_COPY.design_level.options[m.id][locale];
                  return (
                    <button type="button" role="radio" aria-checked={s.choices.design === m.id} class={`level ${s.choices.design === m.id ? 'sel' : ''}`} onClick={() => choose({ design: m.id })}>
                      <b>{c.label}</b>
                      <span>{c.hint}</span>
                      <em>{m.value === 1 ? t.plan.inPackage : `+${Math.round((m.value - 1) * 100)}%`}</em>
                    </button>
                  );
                })}
              </div>
            </div>
            {error && <p class="err" role="alert">{error}</p>}
            <div class="cs-actions sticky">
              <button type="button" class="btn btn-ghost" onClick={() => go('plan')}>
                ← {t.theme.back}
              </button>
              <div class="next-wrap">
                {q && <LivePrice label={t.plan.live} price={quotePriceText(q) || t.plan.discuss} was={q.savings > 0 ? formatPrice(q.price, q.region) : ''} days={t.result.workdays(q.workdays[0], q.workdays[1])} />}
                <button type="button" class="btn btn-primary" onClick={generateMockup}>
                  {t.theme.next} →
                </button>
              </div>
            </div>
          </div>
        )}

        {!busy && s.step === 'result' && s.mockup && q && (
          <div class="cs-body result">
            <div class="res-grid">
              <div class="res-mock">
                <div class="res-top">
                  <h2>{t.result.title}</h2>
                  <div class="seg" role="group">
                    <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
                      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><rect x="2" y="3" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M7 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
                      {t.result.desktop}
                    </button>
                    <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
                      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><rect x="5.5" y="2" width="9" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M9 15h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
                      {t.result.mobile}
                    </button>
                  </div>
                </div>
                <MockupFrame html={mockHtml} device={device} title={s.mockup.brandName} />
                <p class="fine">{t.result.concept}</p>
              </div>

              <aside class="price-card">
                <div class="pc-head">
                  <span>{q.status === 'fixed' ? t.result.priceTitle : q.status === 'range' ? t.result.rangeTitle : t.result.discussTitle}</span>
                </div>
                {q.status === 'discuss' ? (
                  <p class="warn">{t.result.discussNote}</p>
                ) : (
                  <>
                    {q.savings > 0 && (
                      <div class="saves">
                        <div class="save-row">
                          <span>{t.result.normalPrice}</span>
                          <s>{q.status === 'range' ? `${formatPrice(q.price, q.region)} – ${formatPrice(q.priceHigh, q.region)}` : formatPrice(q.price, q.region)}</s>
                        </div>
                        {q.discounts.filter((d) => d.amount > 0).map((d) => (
                          <div class="save-row off">
                            <span>✓ {d.label} ({d.percent}%)</span>
                            <b>−{formatPrice(d.amount, q.region)}</b>
                          </div>
                        ))}
                      </div>
                    )}
                    <b class={`total ${q.status}`}>{quotePriceText(q)}</b>
                    {q.savings > 0 && <span class="saved">{t.result.youSave(formatPrice(q.savings, q.region), q.savingsPercent)}</span>}
                    {q.status === 'range' ? <p class="warn">{t.result.rangeNote}</p> : <span class="final">{t.result.final}</span>}
                    <PromoField t={t} promo={s.promo} onApply={applyPromo} onRemove={() => set({ promo: null })} />
                  </>
                )}
                <ul class="facts">
                  <li>
                    <span>{t.result.timeline}</span>
                    <b>{t.result.workdays(q.workdays[0], q.workdays[1])}</b>
                  </li>
                  <li>
                    <span>{t.result.region[q.region]}</span>
                    <b>{t.result.valid(q.validDays)}</b>
                  </li>
                </ul>
                {q.status !== 'discuss' && (
                  <details class="bd">
                    <summary>{t.result.breakdown}</summary>
                    <table>
                      <tbody>
                        {q.lines.map((l) => (
                          <tr class={l.kind}>
                            <td>
                              {l.label}
                              {l.quantity > 1 ? ` × ${l.quantity}` : ''}
                              {l.detail && <small>{l.detail}</small>}
                            </td>
                            <td>{l.included ? <span class="inc">{t.result.included}</span> : l.amount === 0 ? <span class="inc">{t.result.free}</span> : `${l.amount < 0 ? '−' : ''}${formatPrice(Math.abs(l.amount), q.region)}`}</td>
                          </tr>
                        ))}
                        <tr class="sub">
                          <td>{t.result.price}</td>
                          <td>{formatPrice(q.price, q.region)}</td>
                        </tr>
                        {q.discounts.filter((d) => d.amount > 0).map((d) => (
                          <tr class="disc">
                            <td>{d.label} ({d.percent}%)</td>
                            <td>−{formatPrice(d.amount, q.region)}</td>
                          </tr>
                        ))}
                        <tr class="tot">
                          <td>{t.result.total}</td>
                          <td>{formatPrice(q.total, q.region)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </details>
                )}
                <p class="fine pay">
                  {pricing.payment_terms.down_payment_percent === 0
                    ? t.result.paymentNoDeposit
                    : t.result.payment(pricing.payment_terms.down_payment_percent, pricing.payment_terms.final_payment_percent)}
                </p>
                <div class="incl">
                  <b>{t.result.everyProject}</b>
                  <ul>
                    {t.result.everyItems.map((i) => (
                      <li>✓ {i}</li>
                    ))}
                  </ul>
                </div>
                <div class="incl muted">
                  <b>{t.result.notIncluded}</b>
                  <ul>
                    {pricing.not_included.map((r) => {
                      const c = NOT_INCLUDED_COPY[r.id][locale];
                      const [lo, hi] = r.estimate[q.region];
                      return (
                        <li>
                          {c.name} · <span>{t.result.estimate(`${formatShort(lo, q.region)}–${formatShort(hi, q.region)}`, c.billing)}</span>
                          <em>{c.note}</em>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div class="incl muted">
                  <b>{t.result.recurring}</b>
                  <ul>
                    {pricing.recurring.map((r) => (
                      <li>
                        {RECURRING_COPY[r.id][locale].name} · <span>{formatPrice(r.price[q.region], q.region)}{t.result.per(RECURRING_COPY[r.id][locale].billing)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div class="cs-actions sticky col">
                  <button type="button" class="btn btn-primary" onClick={() => go('order')}>
                    {q.status === 'discuss' ? t.result.discussOrder : t.result.order} →
                  </button>
                  <div class="row">
                    <button type="button" class="link" onClick={() => go('plan')}>
                      {t.result.editPlan}
                    </button>
                    <button type="button" class="link" onClick={() => go('theme')}>
                      {t.result.changeTheme}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {!busy && s.step === 'order' && q && (
          <OrderStep t={t} contact={s.contact} onChange={(contact) => set({ contact })} privacyHref={privacyHref} error={error} onBack={() => go('result')} onSubmit={submitOrder} total={quotePriceText(q) || t.plan.discuss} />
        )}

        {!busy && s.step === 'done' && (
          <div class="cs-body done-step">
            <div class="big-check">✓</div>
            <h2>{t.done.title}</h2>
            <p>{t.done.text}</p>
            <p class="ref">
              {t.done.ref}: <b>{s.quoteId}</b>
            </p>
            <div class="cs-actions center">
              {whatsapp && (
                <a class="btn btn-primary" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t.done.waText(s.quoteId))}`} target="_blank" rel="noopener">
                  {t.done.wa}
                </a>
              )}
              <button type="button" class="btn btn-ghost" onClick={() => setS(initial)}>
                {t.done.again}
              </button>
            </div>
          </div>
        )}
      </div>

      {s.step !== 'describe' && s.step !== 'done' && !busy && (
        <button type="button" class="restart link" onClick={restart}>
          ↺ {t.restart}
        </button>
      )}
    </div>
  );
}
