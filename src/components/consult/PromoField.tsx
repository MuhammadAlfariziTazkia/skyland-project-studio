import { useState } from 'preact/hooks';
import type { ConsultStrings } from '../../i18n/consult';
import type { Promo } from '../../lib/pricing';

interface Props {
  t: ConsultStrings;
  promo: Promo | null;
  /** Resolves false when the code is unknown; the discount itself is always looked up server-side. */
  onApply: (code: string) => Promise<boolean>;
  onRemove: () => void;
}

export function PromoField({ t, promo, onApply, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState(false);

  if (promo)
    return (
      <div class="promo applied">
        <span>
          ✓ {t.result.promoOk}: <b>{promo.code}</b>
        </span>
        <button type="button" class="link" onClick={onRemove}>
          {t.result.promoRemove}
        </button>
      </div>
    );

  if (!open)
    return (
      <button type="button" class="link promo-ask" onClick={() => setOpen(true)}>
        {t.result.promoAsk}
      </button>
    );

  return (
    <form
      class="promo"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!code.trim() || busy) return;
        setBusy(true);
        setBad(false);
        const ok = await onApply(code);
        setBusy(false);
        if (!ok) setBad(true);
      }}
    >
      <div class="promo-row">
        <input
          type="text"
          maxLength={32}
          autoComplete="off"
          placeholder={t.result.promoPh}
          aria-label={t.result.promoAsk}
          aria-invalid={bad ? 'true' : undefined}
          value={code}
          onInput={(e) => {
            setCode((e.target as HTMLInputElement).value);
            setBad(false);
          }}
        />
        <button type="submit" class="btn btn-ghost btn-sm" disabled={!code.trim() || busy}>
          {t.result.promoApply}
        </button>
      </div>
      {bad && <p class="fine promo-bad">{t.result.promoInvalid}</p>}
    </form>
  );
}
