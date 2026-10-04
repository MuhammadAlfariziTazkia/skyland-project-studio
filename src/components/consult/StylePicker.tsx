import { useState } from 'preact/hooks';
import type { ConsultStrings } from '../../i18n/consult';
import { MOODS, MOOD_COPY, THEMES, recommendThemes, themeSwatchHtml, type Mood } from '../../lib/mockup/themes';
import { THEME_IDS, type Locale, type Plan, type ThemeId } from '../../lib/schemas';

interface Props {
  t: ConsultStrings;
  locale: Locale;
  plan: Plan | null;
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  /** Chip row for the mockup step (re-renders instantly) instead of the big cards. */
  compact?: boolean;
}

/**
 * Four styles picked for this business are always visible; the rest stay behind "See all styles",
 * filterable by mood, so twelve choices never land on the client at once.
 */
export function StylePicker({ t, locale, plan, value, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood | 'all'>('all');
  const rec = recommendThemes(plan, value);
  const others = THEME_IDS.filter((id) => !rec.includes(id) && (mood === 'all' || THEMES[id].mood === mood));

  const card = (id: ThemeId) => (
    <button type="button" role="radio" aria-checked={value === id} class={`theme ${value === id ? 'sel' : ''}`} onClick={() => onChange(id)}>
      <div class="sw" dangerouslySetInnerHTML={{ __html: themeSwatchHtml(id) }} />
      <div class="tn">
        <b>{THEMES[id].name[locale]}</b>
        <span>{THEMES[id].sub[locale]}</span>
      </div>
    </button>
  );

  const chip = (id: ThemeId) => (
    <button type="button" role="radio" aria-checked={value === id} class={`style-chip ${value === id ? 'sel' : ''}`} onClick={() => onChange(id)}>
      <span class="mini" aria-hidden="true" dangerouslySetInnerHTML={{ __html: themeSwatchHtml(id) }} />
      {THEMES[id].name[locale]}
    </button>
  );

  const all = open && (
    <div class="all-styles">
      <div class="moods" role="group" aria-label={t.theme.mood}>
        {(['all', ...MOODS] as const).map((m) => (
          <button type="button" aria-pressed={mood === m} class={`chip ${mood === m ? 'sel' : ''}`} onClick={() => setMood(m)}>
            {MOOD_COPY[m][locale]}
          </button>
        ))}
      </div>
      <div class="themes more" role="radiogroup" aria-label={t.theme.allStyles}>
        {others.map(card)}
      </div>
    </div>
  );

  const toggle = (
    <button type="button" class="link more-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
      {open ? t.theme.hideAll : compact ? t.theme.moreStyles : t.theme.showAll(THEME_IDS.length)}
    </button>
  );

  // On the mockup step the extra styles are small chips too, so the preview stays right below.
  if (compact) {
    const rest = THEME_IDS.filter((id) => !rec.includes(id));
    return (
      <div class="style-picker compact">
        <div class="chips-row" role="radiogroup" aria-label={t.theme.title}>
          {rec.map(chip)}
          {open && rest.map(chip)}
          {toggle}
        </div>
      </div>
    );
  }

  return (
    <div class="style-picker">
      <span class="k rec-label">✦ {t.theme.recommended}</span>
      <div class="themes" role="radiogroup" aria-label={t.theme.title}>
        {rec.map(card)}
      </div>
      {toggle}
      {all}
    </div>
  );
}
