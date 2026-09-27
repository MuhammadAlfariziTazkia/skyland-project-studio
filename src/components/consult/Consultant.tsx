import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import pricing from '../../../data/pricing.json';
import { consultStrings } from '../../i18n/consult';
import { renderMockup } from '../../lib/mockup/render';
import { THEMES, themeSwatchHtml } from '../../lib/mockup/themes';
import { formatPrice, quote as computeQuote } from '../../lib/pricing';
import { THEME_IDS, type Currency, type Locale, type Mockup, type Plan, type ThemeId } from '../../lib/schemas';
import { PlanStep } from './PlanStep';
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
  theme: ThemeId;
  mockup: Mockup | null;
  mockupKey: string;
  currency: Currency;
  contact: ContactForm;
  quoteId: string;
}

interface Props {
  locale: Locale;
  whatsapp: string;
  privacyHref: string;
  turnstileSiteKey: string;
}

const STORE = 'skyland-consult-v1';
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

const planKey = (plan: Plan | null, theme: ThemeId) => JSON.stringify([plan?.projectType, plan?.pages.map((p) => p.name), plan?.features.map((f) => f.id), theme]);

export default function Consultant({ locale, whatsapp, privacyHref, turnstileSiteKey }: Props) {
  const t = consultStrings[locale];
  const initial: State = {
    step: 'describe',
    description: '',
    reference: '',
    plan: null,
    revision: '',
    revisionUsed: false,
    theme: 'minimal',
    mockup: null,
    mockupKey: '',
    currency: locale === 'id' ? 'IDR' : 'USD',
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

  const q = useMemo(() => (s.plan ? computeQuote(s.plan, s.currency, locale) : null), [s.plan, s.currency, locale]);
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
      set({ plan, revisionUsed: false, revision: '', mockup: null, mockupKey: '' });
      go('plan');
    });

  const revisePlan = () =>
    run('revise', async () => {
      const { plan } = await post<{ plan: Plan }>('/api/plan', { mode: 'revise', locale, description: s.description, plan: s.plan, instruction: s.revision, website: honeypot }, t);
      set({ plan, revisionUsed: true });
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
        { locale, currency: s.currency, description: s.description, revision: s.revisionUsed ? s.revision : '', plan: s.plan, theme: s.theme, mockup: s.mockup, contact: s.contact, website: honeypot },
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

        {!busy && s.step === 'plan' && s.plan && (
          <PlanStep
            t={t}
            locale={locale}
            plan={s.plan}
            onChange={(plan) => set({ plan })}
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
            {error && <p class="err" role="alert">{error}</p>}
            <div class="cs-actions sticky">
              <button type="button" class="btn btn-ghost" onClick={() => go('plan')}>
                ← {t.theme.back}
              </button>
              <button type="button" class="btn btn-primary" onClick={generateMockup}>
                {t.theme.next} →
              </button>
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
                  <span>{q.needsReview ? t.result.reviewTitle : t.result.priceTitle}</span>
                  <label class="cur">
                    <span class="sr-only">{t.result.currency}</span>
                    <select value={s.currency} onChange={(e) => set({ currency: (e.target as HTMLSelectElement).value as Currency })}>
                      <option value="IDR">IDR</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
                </div>
                {q.discount > 0 && <s class="was">{formatPrice(q.subtotal, q.currency)}</s>}
                <b class="total">{q.needsReview && q.estimateRange ? `${formatPrice(q.estimateRange[0], q.currency)} – ${formatPrice(q.estimateRange[1], q.currency)}` : formatPrice(q.total, q.currency)}</b>
                {q.needsReview ? <p class="warn">{t.result.reviewNote}</p> : <span class="final">{t.result.final}</span>}
                <ul class="facts">
                  <li>
                    <span>{t.result.timeline}</span>
                    <b>{t.result.weeks(q.timelineWeeks[0], q.timelineWeeks[1])}</b>
                  </li>
                  <li>
                    <span>{t.plan.counts(q.pagesCount, q.featuresCount)}</span>
                    <b>{t.result.valid(q.validDays)}</b>
                  </li>
                </ul>
                <details class="bd">
                  <summary>{t.result.breakdown}</summary>
                  <table>
                    <tbody>
                      {q.lines.map((l) => (
                        <tr>
                          <td>
                            {l.label}
                            {l.quantity > 1 ? ` × ${l.quantity}` : ''}
                          </td>
                          <td>{l.included ? <span class="inc">{t.result.included}</span> : formatPrice(l.amount, q.currency)}</td>
                        </tr>
                      ))}
                      <tr class="sub">
                        <td>{t.result.subtotal}</td>
                        <td>{formatPrice(q.subtotal, q.currency)}</td>
                      </tr>
                      {q.discount > 0 && (
                        <tr class="disc">
                          <td>{t.result.discount(q.discountPercent)}</td>
                          <td>−{formatPrice(q.discount, q.currency)}</td>
                        </tr>
                      )}
                      <tr class="tot">
                        <td>{t.result.total}</td>
                        <td>{formatPrice(q.total, q.currency)}</td>
                      </tr>
                    </tbody>
                  </table>
                </details>
                <p class="fine">{t.result.payment(pricing.meta.paymentTerms.downPaymentPercent, pricing.meta.paymentTerms.finalPaymentPercent)}</p>
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
                    {pricing.recurringNotIncluded.map((r) => (
                      <li>
                        {r.name[locale]} · <span>{r.estimate[s.currency]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div class="cs-actions sticky col">
                  <button type="button" class="btn btn-primary" onClick={() => go('order')}>
                    {t.result.order} →
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
          <OrderStep t={t} contact={s.contact} onChange={(contact) => set({ contact })} privacyHref={privacyHref} error={error} onBack={() => go('result')} onSubmit={submitOrder} total={q.needsReview && q.estimateRange ? `${formatPrice(q.estimateRange[0], q.currency)} – ${formatPrice(q.estimateRange[1], q.currency)}` : formatPrice(q.total, q.currency)} />
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
