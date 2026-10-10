import type { Locale, Plan, ThemeId } from '../schemas';

export type Mood = 'clean' | 'bold' | 'warm' | 'dark';
/** How cards and floating elements are drawn. */
export type CardStyle = 'soft' | 'outline' | 'hard' | 'glass' | 'flat';
/** Shape and fill of the hero visual. */
export type HeroStyle = 'gradient' | 'mesh' | 'blob' | 'arch' | 'boxed' | 'stripes';
export type Pattern = 'none' | 'grid' | 'dots' | 'aurora';

export interface Theme {
  id: ThemeId;
  name: Record<Locale, string>;
  sub: Record<Locale, string>;
  /** One line for the AI: what kind of business the style suits. */
  fits: string;
  mood: Mood;
  dark: boolean;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accent2: string;
  radius: number;
  buttonRadius: number;
  font: string;
  headingFont: string;
  headingWeight: number;
  headingSpacing: string;
  eyebrowStyle: string;
  card: CardStyle;
  hero: HeroStyle;
  pattern: Pattern;
  /** Hard-shadow colour for the "hard" card style. */
  shadow: string;
  /** Highlights as a bento grid instead of three equal cards. */
  bento?: boolean;
  /** Thin rules between sections, magazine style. */
  rules?: boolean;
  /** Keep the theme's own accent: the colour is part of the style's identity. */
  accentLock?: boolean;
  /** Google Fonts families, only what this theme uses. */
  fonts: string[];
}

const stack = (family: string, fallback: string) => `'${family}', ${fallback}`;
// Japanese needs an explicit CJK tail: none of the Latin stacks below carry kana or kanji, so without
// this a Japanese mockup renders in whatever face the OS happens to pick, with mismatched metrics.
const CJK_FB = "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', Meiryo";
const SANS_FB = `system-ui, -apple-system, 'Segoe UI', ${CJK_FB}, sans-serif`;
const SERIF_FB = `Georgia, 'Times New Roman', 'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', ${CJK_FB}, serif`;
const JAKARTA = 'Plus+Jakarta+Sans:wght@400;500;600;700;800';
const UPPER = 'letter-spacing:.12em;text-transform:uppercase;font-weight:700;font-size:12px';

export const THEMES: Record<ThemeId, Theme> = {
  minimal: {
    id: 'minimal',
    name: { en: 'Minimal', id: 'Minimal', ja: 'ミニマル' },
    sub: { en: 'Clean', id: 'Bersih', ja: 'すっきり' },
    fits: 'any business; safe, clear, modern',
    mood: 'clean',
    dark: false,
    bg: '#ffffff',
    surface: '#f5f7fb',
    text: '#0f172a',
    muted: '#5b6477',
    border: '#e5e9f2',
    accent: '#2563eb',
    accent2: '#93c5fd',
    radius: 14,
    buttonRadius: 12,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Plus Jakarta Sans', SANS_FB),
    headingWeight: 800,
    headingSpacing: '-0.03em',
    eyebrowStyle: UPPER,
    card: 'soft',
    hero: 'gradient',
    pattern: 'none',
    shadow: '#0f172a',
    fonts: [JAKARTA],
  },
  bento: {
    id: 'bento',
    name: { en: 'Bento', id: 'Bento', ja: 'ベント' },
    sub: { en: 'Modern grid', id: 'Grid modern', ja: 'モダンなグリッド' },
    fits: 'tech, apps, startups, products with several highlights',
    mood: 'clean',
    dark: false,
    bg: '#f2f2f5',
    surface: '#ffffff',
    text: '#111114',
    muted: '#5f6068',
    border: '#e4e4ea',
    accent: '#0a84ff',
    accent2: '#5e5ce6',
    radius: 26,
    buttonRadius: 999,
    font: stack('Inter', SANS_FB),
    headingFont: stack('Inter', SANS_FB),
    headingWeight: 700,
    headingSpacing: '-0.035em',
    eyebrowStyle: 'font-weight:600;font-size:13px',
    card: 'flat',
    hero: 'boxed',
    pattern: 'none',
    shadow: '#111114',
    bento: true,
    fonts: ['Inter:wght@400;500;600;700'],
  },
  corporate: {
    id: 'corporate',
    name: { en: 'Professional', id: 'Profesional', ja: 'プロフェッショナル' },
    sub: { en: 'Trustworthy', id: 'Terpercaya', ja: '信頼感' },
    fits: 'consultants, finance, law, clinics, B2B, education',
    mood: 'clean',
    dark: false,
    bg: '#ffffff',
    surface: '#f4f7fb',
    text: '#0f2a4a',
    muted: '#51627a',
    border: '#e1e7ef',
    accent: '#0f766e',
    accent2: '#0f2a4a',
    radius: 8,
    buttonRadius: 8,
    font: stack('Inter', SANS_FB),
    headingFont: stack('Inter', SANS_FB),
    headingWeight: 700,
    headingSpacing: '-0.025em',
    eyebrowStyle: UPPER,
    card: 'outline',
    hero: 'boxed',
    pattern: 'grid',
    shadow: '#0f2a4a',
    fonts: ['Inter:wght@400;500;600;700'],
  },
  editorial: {
    id: 'editorial',
    name: { en: 'Editorial', id: 'Editorial', ja: 'エディトリアル' },
    sub: { en: 'Magazine', id: 'Majalah', ja: '雑誌風' },
    fits: 'media, writers, architects, studios, fashion',
    mood: 'clean',
    dark: false,
    bg: '#fbfaf7',
    surface: '#f1efe9',
    text: '#111111',
    muted: '#55534e',
    border: '#d9d5cc',
    accent: '#d6372b',
    accent2: '#111111',
    radius: 0,
    buttonRadius: 0,
    font: stack('Inter', SANS_FB),
    headingFont: stack('DM Serif Display', SERIF_FB),
    headingWeight: 400,
    headingSpacing: '-0.015em',
    eyebrowStyle: 'letter-spacing:.2em;text-transform:uppercase;font-weight:600;font-size:11px',
    card: 'outline',
    hero: 'boxed',
    pattern: 'none',
    shadow: '#111111',
    rules: true,
    fonts: ['DM+Serif+Display', 'Inter:wght@400;500;600'],
  },
  elegant: {
    id: 'elegant',
    name: { en: 'Elegant', id: 'Elegan', ja: 'エレガント' },
    sub: { en: 'Refined', id: 'Berkelas', ja: '洗練' },
    fits: 'cafés, restaurants, boutiques, weddings, beauty',
    mood: 'warm',
    dark: false,
    bg: '#f7f2ea',
    surface: '#fffdf8',
    text: '#2b2118',
    muted: '#7a6a58',
    border: '#e7dccb',
    accent: '#9a6b3f',
    accent2: '#d9c3a3',
    radius: 6,
    buttonRadius: 4,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Playfair Display', SERIF_FB),
    headingWeight: 600,
    headingSpacing: '-0.01em',
    eyebrowStyle: 'letter-spacing:.28em;text-transform:uppercase;font-weight:600;font-size:11px',
    card: 'outline',
    hero: 'arch',
    pattern: 'none',
    shadow: '#2b2118',
    fonts: [JAKARTA, 'Playfair+Display:wght@500;600;700'],
  },
  organic: {
    id: 'organic',
    name: { en: 'Natural', id: 'Natural', ja: 'ナチュラル' },
    sub: { en: 'Earthy', id: 'Alami', ja: '自然体' },
    fits: 'wellness, food, farms, eco brands, spas, coffee',
    mood: 'warm',
    dark: false,
    bg: '#f3eee3',
    surface: '#fbf8f1',
    text: '#2f3a2a',
    muted: '#6b6f5c',
    border: '#e2d9c6',
    accent: '#5f7a35',
    accent2: '#d9a066',
    radius: 28,
    buttonRadius: 999,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Fraunces', SERIF_FB),
    headingWeight: 600,
    headingSpacing: '-0.02em',
    eyebrowStyle: 'letter-spacing:.14em;text-transform:uppercase;font-weight:600;font-size:12px',
    card: 'soft',
    hero: 'blob',
    pattern: 'none',
    shadow: '#2f3a2a',
    fonts: [JAKARTA, 'Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700'],
  },
  retro: {
    id: 'retro',
    name: { en: 'Retro', id: 'Retro', ja: 'レトロ' },
    sub: { en: '70s warmth', id: 'Hangat 70-an', ja: '70年代の温かさ' },
    fits: 'cafés, bakeries, barbers, music, vintage shops',
    mood: 'warm',
    dark: false,
    bg: '#fbf1e1',
    surface: '#fff8ec',
    text: '#3b2316',
    muted: '#7d5d47',
    border: '#3b2316',
    accent: '#e4572e',
    accent2: '#f3a712',
    radius: 22,
    buttonRadius: 999,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Bricolage Grotesque', SANS_FB),
    headingWeight: 800,
    headingSpacing: '-0.035em',
    eyebrowStyle: 'letter-spacing:.06em;text-transform:uppercase;font-weight:800;font-size:12px',
    card: 'hard',
    hero: 'stripes',
    pattern: 'none',
    shadow: '#f3a712',
    accentLock: true,
    fonts: [JAKARTA, 'Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800'],
  },
  vibrant: {
    id: 'vibrant',
    name: { en: 'Vibrant', id: 'Ceria', ja: 'ビビッド' },
    sub: { en: 'Playful', id: 'Playful', ja: '遊びのある' },
    fits: 'kids, events, creators, snacks, fun consumer brands',
    mood: 'bold',
    dark: false,
    bg: '#fff7f0',
    surface: '#ffffff',
    text: '#1f1235',
    muted: '#6b5a7e',
    border: '#f3dccb',
    accent: '#ff4d8d',
    accent2: '#ffb020',
    radius: 24,
    buttonRadius: 999,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Plus Jakarta Sans', SANS_FB),
    headingWeight: 800,
    headingSpacing: '-0.04em',
    eyebrowStyle: 'letter-spacing:.06em;text-transform:uppercase;font-weight:800;font-size:12px',
    card: 'soft',
    hero: 'blob',
    pattern: 'dots',
    shadow: '#1f1235',
    fonts: [JAKARTA],
  },
  neo_brutal: {
    id: 'neo_brutal',
    name: { en: 'Bold Pop', id: 'Bold Pop', ja: 'ボールドポップ' },
    sub: { en: 'Loud & fun', id: 'Berani', ja: '大胆で楽しい' },
    fits: 'startups, agencies, creators, streetwear, youth brands',
    mood: 'bold',
    dark: false,
    bg: '#fffbea',
    surface: '#ffffff',
    text: '#111111',
    muted: '#3d3d3d',
    border: '#111111',
    accent: '#ff5c39',
    accent2: '#7c5cff',
    radius: 10,
    buttonRadius: 10,
    font: stack('Space Grotesk', SANS_FB),
    headingFont: stack('Space Grotesk', SANS_FB),
    headingWeight: 700,
    headingSpacing: '-0.03em',
    eyebrowStyle: 'letter-spacing:.04em;text-transform:uppercase;font-weight:700;font-size:12px',
    card: 'hard',
    hero: 'boxed',
    pattern: 'dots',
    shadow: '#111111',
    accentLock: true,
    fonts: ['Space+Grotesk:wght@400;500;600;700'],
  },
  futuristic: {
    id: 'futuristic',
    name: { en: 'Futuristic', id: 'Futuristik', ja: 'フューチャリスティック' },
    sub: { en: 'Bold tech', id: 'Teknologi', ja: 'テック感' },
    fits: 'tech, gaming, crypto, AI products, developer tools',
    mood: 'dark',
    dark: true,
    bg: '#070b1a',
    surface: '#0f1630',
    text: '#e8eeff',
    muted: '#93a0c8',
    border: '#1f2a55',
    accent: '#22d3ee',
    accent2: '#a78bfa',
    radius: 10,
    buttonRadius: 10,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Plus Jakarta Sans', SANS_FB),
    headingWeight: 800,
    headingSpacing: '-0.035em',
    eyebrowStyle: 'font-family:ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;font-size:12px',
    card: 'outline',
    hero: 'mesh',
    pattern: 'grid',
    shadow: '#000000',
    accentLock: true,
    fonts: [JAKARTA],
  },
  aurora: {
    id: 'aurora',
    name: { en: 'Aurora', id: 'Aurora', ja: 'オーロラ' },
    sub: { en: 'Glow & glass', id: 'Kaca bercahaya', ja: '光とガラス' },
    fits: 'SaaS, AI, fintech, music, nightlife, premium apps',
    mood: 'dark',
    dark: true,
    bg: '#0b0820',
    surface: '#151132',
    text: '#f4f1ff',
    muted: '#b8b2d9',
    border: '#2c2656',
    accent: '#8b5cf6',
    accent2: '#22d3ee',
    radius: 20,
    buttonRadius: 999,
    font: stack('Outfit', SANS_FB),
    headingFont: stack('Outfit', SANS_FB),
    headingWeight: 600,
    headingSpacing: '-0.03em',
    eyebrowStyle: 'letter-spacing:.14em;text-transform:uppercase;font-weight:500;font-size:12px',
    card: 'glass',
    hero: 'mesh',
    pattern: 'aurora',
    shadow: '#000000',
    accentLock: true,
    fonts: ['Outfit:wght@400;500;600;700'],
  },
  luxury: {
    id: 'luxury',
    name: { en: 'Luxury', id: 'Mewah', ja: 'ラグジュアリー' },
    sub: { en: 'Black & gold', id: 'Hitam & emas', ja: '黒と金' },
    fits: 'jewelry, hotels, fine dining, real estate, premium beauty',
    mood: 'dark',
    dark: true,
    bg: '#0d0c0b',
    surface: '#171512',
    text: '#f3ead7',
    muted: '#a69c86',
    border: '#3a3326',
    accent: '#c9a45c',
    accent2: '#7a5f2e',
    radius: 0,
    buttonRadius: 0,
    font: stack('Plus Jakarta Sans', SANS_FB),
    headingFont: stack('Cormorant Garamond', SERIF_FB),
    headingWeight: 500,
    headingSpacing: '0',
    eyebrowStyle: 'letter-spacing:.32em;text-transform:uppercase;font-weight:500;font-size:11px',
    card: 'outline',
    hero: 'arch',
    pattern: 'none',
    shadow: '#000000',
    accentLock: true,
    fonts: [JAKARTA, 'Cormorant+Garamond:wght@500;600'],
  },
};

/** Grouping for the "all styles" filter; order is the display order. */
export const MOODS: Mood[] = ['clean', 'warm', 'bold', 'dark'];
export const MOOD_COPY: Record<Mood | 'all', Record<Locale, string>> = {
  all: { en: 'All', id: 'Semua', ja: 'すべて' },
  clean: { en: 'Clean', id: 'Bersih', ja: 'すっきり' },
  warm: { en: 'Warm', id: 'Hangat', ja: '温かい' },
  bold: { en: 'Bold', id: 'Berani', ja: '大胆' },
  dark: { en: 'Dark', id: 'Gelap', ja: 'ダーク' },
};

/** The four styles shown on the landing-page demo. */
export const FEATURED_THEMES: ThemeId[] = ['minimal', 'elegant', 'aurora', 'neo_brutal'];

/** Fallback when the AI gave no style suggestions (older plans, dev mode). */
const SERVICE_STYLES: Record<string, ThemeId[]> = {
  company_profile: ['corporate', 'minimal', 'elegant'],
  landing_page: ['bento', 'neo_brutal', 'aurora'],
  online_store: ['bento', 'organic', 'vibrant'],
  personal_portfolio: ['editorial', 'bento', 'neo_brutal'],
  online_course: ['minimal', 'bento', 'corporate'],
  booking_reservation: ['elegant', 'organic', 'minimal'],
  custom_web_app: ['bento', 'aurora', 'corporate'],
  blog_media: ['editorial', 'minimal', 'organic'],
};

const isTheme = (id: string): id is ThemeId => id in THEMES;

/**
 * Four styles to show first: the AI's picks for this business (or the service fallback), topped up so there
 * are always four, and always including the one currently selected.
 */
export function recommendThemes(plan: Pick<Plan, 'serviceId' | 'styles'> | null, current?: ThemeId): ThemeId[] {
  const picks = [...(plan?.styles ?? []).filter(isTheme), ...(plan ? (SERVICE_STYLES[plan.serviceId] ?? []) : []), 'minimal', 'bento', 'elegant', 'aurora'] as ThemeId[];
  const out: ThemeId[] = [];
  for (const id of picks) if (!out.includes(id) && out.length < 4) out.push(id);
  if (current && !out.includes(current)) out[3] = current;
  return out;
}

/** Google Fonts stylesheet URL for one theme. */
export const fontsHref = (t: Theme) => `https://fonts.googleapis.com/css2?${t.fonts.map((f) => `family=${f}`).join('&')}&display=swap`;

/** Card look shared by the swatch and the full mockup. */
export function cardCss(t: Theme, bg: string): string {
  switch (t.card) {
    case 'hard':
      return `background:${bg};border:2px solid ${t.text};box-shadow:4px 4px 0 ${t.shadow}`;
    case 'glass':
      return `background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)`;
    case 'flat':
      return `background:${t.surface};border:0`;
    case 'outline':
      return `background:transparent;border:1px solid ${t.border}`;
    default:
      return `background:${bg};border:1px solid ${t.border};box-shadow:0 10px 30px ${t.dark ? '#0006' : '#0f172a0f'}`;
  }
}

/** Hero visual fill and shape. */
export function heroCss(t: Theme, accent: string): string {
  const grad = `linear-gradient(140deg,${accent},${t.accent2})`;
  switch (t.hero) {
    case 'mesh':
      return `background:radial-gradient(circle at 20% 20%,${accent}cc,transparent 45%),radial-gradient(circle at 80% 30%,${t.accent2}bb,transparent 50%),radial-gradient(circle at 50% 90%,${accent}88,transparent 55%),${t.surface};border-radius:${t.radius * 1.5}px;border:1px solid ${t.border}`;
    case 'blob':
      return `background:${grad};border-radius:58% 42% 46% 54% / 52% 44% 56% 48%`;
    case 'arch':
      return `background:${grad};border-radius:999px 999px ${t.radius}px ${t.radius}px;outline:1px solid ${t.dark ? accent : t.border};outline-offset:10px`;
    case 'stripes':
      return `background:repeating-linear-gradient(-45deg,${accent} 0 18px,${t.accent2} 18px 36px,${t.surface} 36px 54px);border-radius:${t.radius}px;border:2px solid ${t.text};box-shadow:6px 6px 0 ${t.text}`;
    case 'boxed':
      return t.card === 'hard'
        ? `background:${grad};border-radius:${t.radius}px;border:2px solid ${t.text};box-shadow:8px 8px 0 ${t.shadow}`
        : `background:${grad};border-radius:${t.radius}px`;
    default:
      return `background:radial-gradient(circle at 30% 25%,${t.accent2}cc,transparent 55%),${grad};border-radius:${t.radius * 2}px`;
  }
}

/** Page background pattern. */
export function patternCss(t: Theme): string {
  switch (t.pattern) {
    case 'grid':
      return `background-image:linear-gradient(${t.border}80 1px,transparent 1px),linear-gradient(90deg,${t.border}80 1px,transparent 1px);background-size:44px 44px`;
    case 'dots':
      return `background-image:radial-gradient(${t.text}22 1.2px,transparent 1.2px);background-size:18px 18px`;
    case 'aurora':
      return `background-image:radial-gradient(ellipse at 10% 0%,${t.accent}55,transparent 45%),radial-gradient(ellipse at 90% 10%,${t.accent2}44,transparent 40%)`;
    default:
      return '';
  }
}

/** Small static preview of a theme for the style cards; draws the theme's character, not just its colours. */
export function themeSwatchHtml(id: ThemeId): string {
  const t = THEMES[id];
  const r = Math.min(t.radius, 10);
  const bar = (w: string, o = 0.18, h = 5, color = t.text) => `<i style="display:block;width:${w};height:${h}px;border-radius:3px;background:${color};opacity:${o}"></i>`;
  const card = cardCss({ ...t, radius: r }, t.dark ? t.surface : t.bg);
  const art = heroCss({ ...t, radius: r }, t.accent).replace(/outline-offset:10px/, 'outline-offset:3px').replace(/box-shadow:(6|8)px (6|8)px/, 'box-shadow:3px 3px');
  const hard = t.card === 'hard';
  const tiles = t.bento
    ? `<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:5px">${[0, 1, 2].map((i) => `<div style="height:${i === 0 ? 22 : 22}px;border-radius:${r}px;${card}"></div>`).join('')}</div>`
    : `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6%">${[0, 1, 2].map(() => `<div style="height:16px;border-radius:${Math.max(r - 2, 2)}px;${card.replace(/4px 4px 0/, '2px 2px 0')}"></div>`).join('')}</div>`;
  return `<div style="height:100%;background:${t.bg};${patternCss(t)};padding:9% 9%;display:flex;flex-direction:column;gap:7%;font-family:${t.font}">
  <div style="display:flex;justify-content:space-between;align-items:center${t.rules ? `;border-bottom:1px solid ${t.text};padding-bottom:4px` : ''}"><b style="font-family:${t.headingFont};color:${t.text};font-size:10px;font-weight:${t.headingWeight}">Aa</b><span style="display:flex;gap:4px">${bar('12px', 0.25, 3)}${bar('12px', 0.25, 3)}${bar('12px', 0.25, 3)}</span></div>
  <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:8%;align-items:center;flex:1">
    <div style="display:flex;flex-direction:column;gap:5px">${bar('100%', 0.9, t.rules ? 9 : 7)}${bar('72%', 0.9, t.rules ? 9 : 7)}${bar('88%', 0.25, 3)}<span style="margin-top:3px;width:46%;height:10px;border-radius:${Math.min(t.buttonRadius, 6)}px;background:${t.accent};${hard ? `border:1.5px solid ${t.text};box-shadow:2px 2px 0 ${t.shadow}` : ''}"></span></div>
    <div style="height:100%;min-height:30px;${art}"></div>
  </div>
  ${tiles}
</div>`;
}
