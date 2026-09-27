import type { Locale, ThemeId } from '../schemas';

export interface Theme {
  id: ThemeId;
  name: Record<Locale, string>;
  sub: Record<Locale, string>;
  dark: boolean;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accent2: string;
  radius: number;
  font: string;
  headingFont: string;
  headingWeight: number;
  headingSpacing: string;
  eyebrowStyle: string;
}

const SANS = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

export const THEMES: Record<ThemeId, Theme> = {
  minimal: {
    id: 'minimal',
    name: { en: 'Minimal', id: 'Minimal' },
    sub: { en: 'Clean', id: 'Bersih' },
    dark: false,
    bg: '#ffffff',
    surface: '#f5f7fb',
    text: '#0f172a',
    muted: '#5b6477',
    border: '#e5e9f2',
    accent: '#2563eb',
    accent2: '#93c5fd',
    radius: 14,
    font: SANS,
    headingFont: SANS,
    headingWeight: 800,
    headingSpacing: '-0.03em',
    eyebrowStyle: 'letter-spacing:.12em;text-transform:uppercase;font-weight:700;font-size:12px',
  },
  elegant: {
    id: 'elegant',
    name: { en: 'Elegant', id: 'Elegan' },
    sub: { en: 'Refined', id: 'Berkelas' },
    dark: false,
    bg: '#f7f2ea',
    surface: '#fffdf8',
    text: '#2b2118',
    muted: '#7a6a58',
    border: '#e7dccb',
    accent: '#9a6b3f',
    accent2: '#d9c3a3',
    radius: 4,
    font: SANS,
    headingFont: SERIF,
    headingWeight: 600,
    headingSpacing: '-0.01em',
    eyebrowStyle: 'letter-spacing:.28em;text-transform:uppercase;font-weight:600;font-size:11px',
  },
  futuristic: {
    id: 'futuristic',
    name: { en: 'Futuristic', id: 'Futuristik' },
    sub: { en: 'Bold tech', id: 'Teknologi' },
    dark: true,
    bg: '#070b1a',
    surface: '#0f1630',
    text: '#e8eeff',
    muted: '#93a0c8',
    border: '#1f2a55',
    accent: '#22d3ee',
    accent2: '#a78bfa',
    radius: 10,
    font: SANS,
    headingFont: SANS,
    headingWeight: 800,
    headingSpacing: '-0.035em',
    eyebrowStyle: "font-family:ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;font-size:12px",
  },
  vibrant: {
    id: 'vibrant',
    name: { en: 'Vibrant', id: 'Ceria' },
    sub: { en: 'Playful', id: 'Playful' },
    dark: false,
    bg: '#fff7f0',
    surface: '#ffffff',
    text: '#1f1235',
    muted: '#6b5a7e',
    border: '#f3dccb',
    accent: '#ff4d8d',
    accent2: '#ffb020',
    radius: 24,
    font: SANS,
    headingFont: SANS,
    headingWeight: 900,
    headingSpacing: '-0.04em',
    eyebrowStyle: 'letter-spacing:.06em;text-transform:uppercase;font-weight:800;font-size:12px',
  },
};

/** Small static preview of a theme, used on theme cards (landing demo + consultant). */
export function themeSwatchHtml(id: ThemeId): string {
  const t = THEMES[id];
  const r = Math.min(t.radius, 10);
  const bar = (w: string, o = 0.18, h = 5) => `<i style="display:block;width:${w};height:${h}px;border-radius:3px;background:${t.text};opacity:${o}"></i>`;
  return `<div style="height:100%;background:${t.bg};padding:9% 9%;display:flex;flex-direction:column;gap:7%;font-family:${t.font}">
  <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:${t.headingFont};color:${t.text};font-size:9px;font-weight:${t.headingWeight}">Aa</b><span style="display:flex;gap:4px">${bar('14px', 0.2, 3)}${bar('14px', 0.2, 3)}${bar('14px', 0.2, 3)}</span></div>
  <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:8%;align-items:center;flex:1">
    <div style="display:flex;flex-direction:column;gap:5px">${bar('100%', 0.85, 7)}${bar('75%', 0.85, 7)}${bar('90%', 0.25, 3)}<span style="margin-top:3px;width:44%;height:10px;border-radius:${Math.max(r, 3)}px;background:${t.accent}"></span></div>
    <div style="height:100%;min-height:30px;border-radius:${r}px;background:linear-gradient(135deg,${t.accent},${t.accent2})"></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6%">${[0, 1, 2].map(() => `<div style="height:16px;border-radius:${Math.max(r - 2, 2)}px;background:${t.surface};border:1px solid ${t.border}"></div>`).join('')}</div>
</div>`;
}
