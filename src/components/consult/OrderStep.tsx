import { useState } from 'preact/hooks';
import type { ConsultStrings } from '../../i18n/consult';

export interface ContactForm {
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  notes: string;
  consent: boolean;
}

interface Props {
  t: ConsultStrings;
  contact: ContactForm;
  onChange: (c: ContactForm) => void;
  privacyHref: string;
  error: string;
  total: string;
  onBack: () => void;
  onSubmit: () => void;
}

const valid = {
  name: (v: string) => v.trim().length >= 2,
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  whatsapp: (v: string) => /^\+?[0-9 ()-]{8,20}$/.test(v.trim()),
};

export function OrderStep({ t, contact, onChange, privacyHref, error, total, onBack, onSubmit }: Props) {
  const [tried, setTried] = useState(false);
  const set = (k: keyof ContactForm, v: string | boolean) => onChange({ ...contact, [k]: v });
  const bad = {
    name: !valid.name(contact.name),
    email: !valid.email(contact.email),
    whatsapp: !valid.whatsapp(contact.whatsapp),
    consent: !contact.consent,
  };
  const ok = !Object.values(bad).some(Boolean);
  const inv = (k: keyof typeof bad) => (tried && bad[k] ? 'true' : undefined);
  /*
   * Only consent disables the button. Disabling it for any invalid field would be worse than it looks:
   * the form can then never be submitted, so `tried` never flips and the visitor never finds out which
   * field is wrong. Consent is different — there is exactly one thing to do about it, it is immediately
   * above the button, and it must be a deliberate act rather than something a click can slip past.
   */
  const blocked = bad.consent;

  return (
    <form
      class="cs-body order"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (ok) onSubmit();
      }}
    >
      <div class="cs-head">
        <h2>{t.order.title}</h2>
        <p>{t.order.hint}</p>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>{t.order.name} *</span>
          <input type="text" autoComplete="name" required maxLength={80} value={contact.name} aria-invalid={inv('name')} onInput={(e) => set('name', (e.target as HTMLInputElement).value)} />
        </label>
        <label class="field">
          <span>{t.order.email} *</span>
          <input type="email" autoComplete="email" inputMode="email" required maxLength={120} value={contact.email} aria-invalid={inv('email')} onInput={(e) => set('email', (e.target as HTMLInputElement).value)} />
        </label>
        <label class="field">
          <span>{t.order.whatsapp} *</span>
          <input type="tel" autoComplete="tel" inputMode="tel" required maxLength={20} placeholder={t.order.whatsappPh} value={contact.whatsapp} aria-invalid={inv('whatsapp')} onInput={(e) => set('whatsapp', (e.target as HTMLInputElement).value)} />
        </label>
        <label class="field">
          <span>{t.order.company}</span>
          <input type="text" autoComplete="organization" maxLength={100} value={contact.company} onInput={(e) => set('company', (e.target as HTMLInputElement).value)} />
        </label>
        <label class="field full">
          <span>{t.order.notes}</span>
          <textarea rows={3} maxLength={1000} value={contact.notes} onInput={(e) => set('notes', (e.target as HTMLTextAreaElement).value)} />
        </label>
      </div>
      <label class="check-row" id="order-consent" aria-invalid={inv('consent')}>
        <input type="checkbox" checked={contact.consent} onChange={(e) => set('consent', (e.target as HTMLInputElement).checked)} />
        <span>
          {t.order.consent}{' '}
          <a href={privacyHref} target="_blank" rel="noopener">
            {t.order.privacy}
          </a>
          .
        </span>
      </label>
      {tried && !ok && (
        <p class="err" role="alert">
          {t.order.invalid}
        </p>
      )}
      {error && (
        <p class="err" role="alert">
          {error}
        </p>
      )}
      <div class="cs-actions sticky">
        <button type="button" class="btn btn-ghost" onClick={onBack}>
          ← {t.order.back}
        </button>
        <div class="next-wrap">
          <span class="counts">{total}</span>
          <button type="submit" class="btn btn-primary" disabled={blocked} aria-describedby={blocked ? 'order-consent' : undefined}>
            {t.order.submit} →
          </button>
        </div>
      </div>
    </form>
  );
}
