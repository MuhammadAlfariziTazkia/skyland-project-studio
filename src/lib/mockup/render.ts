// Renders AI-generated homepage copy into a complete, responsive, self-contained HTML page.
// Shared by the consultant preview (iframe srcdoc), the landing demo and the emailed mockup.html.
import type { Locale, Mockup, ThemeId } from '../schemas';
import { THEMES, cardCss, fontsHref, heroCss, patternCss } from './themes';

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Keep emoji-ish icons short and harmless; fall back to a dot. */
const icon = (s: string) => esc([...(s || '').trim()].slice(0, 2).join('') || '•');

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrastText = (hex: string) => (luminance(hex) > 0.45 ? '#0b1020' : '#ffffff');

export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * The mockup copy (and its brand colour) is generated once and reused for every style, so the brand colour
 * is only used when it stays readable on this style's background and the style doesn't own its colours.
 */
export function pickAccent(brand: string, themeId: ThemeId): string {
  const t = THEMES[themeId] ?? THEMES.minimal;
  if (t.accentLock || !/^#[0-9a-f]{6}$/i.test(brand)) return t.accent;
  return contrastRatio(brand, t.bg) >= 2.2 ? brand : t.accent;
}

export interface RenderOptions {
  locale: Locale;
  /** Adds a small ribbon marking the page as a concept preview. */
  watermark?: string;
}

export function renderMockup(m: Mockup, themeId: ThemeId, opts: RenderOptions): string {
  const t = THEMES[themeId] ?? THEMES.minimal;
  const accent = pickAccent(m.accent, themeId);
  const onAccent = contrastText(accent);
  const r = t.radius;
  const hard = t.card === 'hard';
  const cardBg = t.dark ? t.surface : t.bg;
  const card = cardCss(t, cardBg);
  const altCard = cardCss(t, t.bg);

  const sectionHtml = m.sections
    .map((s, idx) => {
      const head = `<div class="sh">${s.eyebrow ? `<span class="eb">${esc(s.eyebrow)}</span>` : ''}<h2>${esc(s.title)}</h2>${s.text ? `<p class="lead">${esc(s.text)}</p>` : ''}</div>`;
      const alt = idx % 2 === 1 ? ' alt' : '';
      switch (s.kind) {
        case 'cards':
          return `<section class="sec${alt}"><div class="wrap">${head}<div class="cards">${s.items
            .map((it) => `<article class="card"><span class="ic">${icon(it.icon)}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`)
            .join('')}</div></div></section>`;
        case 'split':
          return `<section class="sec${alt}"><div class="wrap split"><div>${head}<ul class="ticks">${s.items
            .map((it) => `<li><b>${esc(it.title)}</b>${it.text ? ` <span>${esc(it.text)}</span>` : ''}</li>`)
            .join('')}</ul></div><div class="art art2"><span class="big">${icon(s.items[0]?.icon || m.hero.icon)}</span></div></div></section>`;
        case 'steps':
          return `<section class="sec${alt}"><div class="wrap">${head}<ol class="steps">${s.items
            .map((it, i) => `<li><span class="n">${i + 1}</span><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div></li>`)
            .join('')}</ol></div></section>`;
        case 'stats':
          return `<section class="sec${alt}"><div class="wrap">${head}<div class="stats">${s.items
            .map((it) => `<div><b>${esc(it.title)}</b><span>${esc(it.text)}</span></div>`)
            .join('')}</div></div></section>`;
        case 'quote': {
          const who = s.items[0];
          return `<section class="sec${alt}"><div class="wrap narrow"><span class="eb">${esc(s.eyebrow)}</span><blockquote>“${esc(s.text || s.title)}”</blockquote>${
            who ? `<p class="who"><span class="av">${icon(who.icon || '🙂')}</span><span><b>${esc(who.title)}</b><br>${esc(who.text)}</span></p>` : ''
          }</div></section>`;
        }
        case 'cta':
        default:
          return `<section class="sec"><div class="wrap"><div class="band"><div><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></div><a class="btn light" href="#">${esc(m.hero.primaryCta)}</a></div></div></section>`;
      }
    })
    .join('');

  const hl = m.highlights
    .map((h) => `<div class="hl"><span class="ic">${icon(h.icon)}</span><div><b>${esc(h.title)}</b><p>${esc(h.text)}</p></div></div>`)
    .join('');

  const css = `
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background-color:${t.bg};${patternCss(t)};color:${t.text};font-family:${t.font};line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3{font-family:${t.headingFont};font-weight:${t.headingWeight};letter-spacing:${t.headingSpacing};margin:0;line-height:1.1;text-wrap:balance}
p{margin:0}a{color:inherit;text-decoration:none}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.eb{display:inline-block;color:${accent};${t.eyebrowStyle}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:${t.buttonRadius}px;font-weight:700;font-size:15px;background:${accent};color:${onAccent};border:${hard ? `2px solid ${t.text};box-shadow:3px 3px 0 ${t.shadow}` : `1px solid ${accent}`}}
.btn.ghost{background:transparent;color:${t.text};border-color:${hard ? t.text : t.border};box-shadow:none}
.btn.light{background:${onAccent};color:${accent};border-color:${hard ? t.text : onAccent}}
header{position:sticky;top:0;z-index:5;background:${t.bg}e6;backdrop-filter:blur(10px);border-bottom:${t.rules || hard ? `${hard ? 2 : 1}px solid ${t.text}` : `1px solid ${t.border}`}}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{font-family:${t.headingFont};font-weight:${t.headingWeight};font-size:${t.rules ? 24 : 20}px;display:flex;align-items:center;gap:10px}
.brand i{width:26px;height:26px;border-radius:${Math.min(r, 8)}px;background:linear-gradient(135deg,${accent},${t.accent2})${hard ? `;border:2px solid ${t.text}` : ''}}
.links{display:flex;gap:26px;font-size:14px;color:${t.muted}}
.nav .btn{padding:10px 18px;font-size:14px}
.hero{padding:56px 0 40px}
.hero .wrap{display:grid;gap:40px;align-items:center}
.hero h1{font-size:${t.rules ? 'clamp(42px,8vw,84px)' : 'clamp(34px,6vw,60px)'};margin:14px 0 16px;line-height:${t.rules ? 1 : 1.08}}
.hero .sub{font-size:18px;color:${t.muted};max-width:520px}
.ctas{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
.art{position:relative;aspect-ratio:1.1;${heroCss(t, accent)};display:flex;align-items:center;justify-content:center;overflow:${t.hero === 'arch' || t.hero === 'blob' ? 'visible' : 'hidden'};${t.card === 'hard' || t.hero === 'stripes' ? '' : `box-shadow:0 30px 60px ${t.dark ? '#000a' : accent + '33'}`}}
.art .big{font-size:clamp(72px,12vw,120px);filter:drop-shadow(0 12px 24px #0003)}
.art .float{position:absolute;${altCard};${t.card === 'glass' || t.card === 'outline' ? `background:${t.dark ? t.surface + 'e6' : '#ffffffee'}` : ''};color:${t.text};border-radius:${Math.max(r, 8)}px;padding:10px 14px;font-size:13px;display:flex;gap:8px;align-items:center;max-width:70%}
.art .f1{left:6%;bottom:8%}.art .f2{right:6%;top:8%}
.hls{display:grid;gap:14px;padding:8px 0 48px}
.hl{display:flex;gap:14px;align-items:flex-start;${card};border-radius:${r}px;padding:18px}
.hl p{color:${t.muted};font-size:14px;margin-top:2px}
.ic{flex:none;width:42px;height:42px;border-radius:${Math.min(r, 12)}px;background:${accent}1f;display:flex;align-items:center;justify-content:center;font-size:20px${hard ? `;border:2px solid ${t.text}` : ''}}
.sec{padding:64px 0}.sec.alt{background:${t.card === 'glass' ? 'transparent' : t.surface};border-top:1px solid ${t.border};border-bottom:1px solid ${t.border}}
${t.rules ? `.sec{border-top:1px solid ${t.text}}.sec.alt{background:transparent;border-bottom:0}` : ''}
.sh{max-width:640px;margin-bottom:32px;display:flex;flex-direction:column;gap:10px}
.sh h2{font-size:${t.rules ? 'clamp(32px,5vw,52px)' : 'clamp(26px,4vw,38px)'}}
.lead{color:${t.muted};font-size:16px}
.cards{display:grid;gap:16px}
.card{${card};border-radius:${r}px;padding:22px;display:flex;flex-direction:column;gap:10px}
.sec.alt .card{${altCard};border-radius:${r}px}
.card p{color:${t.muted};font-size:14.5px}
.split{display:grid;gap:36px;align-items:center}
.art2{aspect-ratio:1.3}
.ticks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.ticks li{padding-left:30px;position:relative}
.ticks li:before{content:'✓';position:absolute;left:0;top:1px;width:20px;height:20px;border-radius:50%;background:${accent};color:${onAccent};font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:800}
.ticks span{color:${t.muted}}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:16px}
.steps li{display:flex;gap:16px;align-items:flex-start;${card};border-radius:${r}px;padding:20px}
.steps .n{flex:none;width:36px;height:36px;border-radius:50%;background:${accent};color:${onAccent};font-weight:800;display:flex;align-items:center;justify-content:center}
.steps p{color:${t.muted};font-size:14.5px;margin-top:4px}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.stats div{display:flex;flex-direction:column;gap:4px;padding:20px;${card};border-radius:${r}px}
.stats b{font-family:${t.headingFont};font-size:clamp(28px,5vw,40px);color:${accent};line-height:1}
.stats span{color:${t.muted};font-size:14px}
.narrow{max-width:760px;text-align:center}
blockquote{margin:14px 0 20px;font-family:${t.headingFont};font-size:clamp(22px,3.4vw,32px);line-height:1.3;font-weight:${Math.min(t.headingWeight, 700)}}
.who{display:inline-flex;gap:12px;align-items:center;text-align:left;color:${t.muted};font-size:14px}.who b{color:${t.text}}
.av{width:44px;height:44px;border-radius:50%;background:${accent}26;display:flex;align-items:center;justify-content:center;font-size:20px}
.band{display:flex;flex-direction:column;gap:20px;align-items:flex-start;justify-content:space-between;background:${t.hero === 'mesh' ? `radial-gradient(circle at 15% 20%,${accent}aa,transparent 50%),radial-gradient(circle at 85% 80%,${t.accent2}99,transparent 50%),${t.surface}` : `linear-gradient(135deg,${accent},${t.accent2})`};color:${t.hero === 'mesh' ? t.text : onAccent};border-radius:${r * 1.5}px;padding:36px 28px${hard ? `;border:2px solid ${t.text};box-shadow:6px 6px 0 ${t.shadow}` : ''}}
.band h2{font-size:clamp(24px,4vw,34px)}.band p{opacity:.85;margin-top:8px}
footer{border-top:1px solid ${t.rules || hard ? t.text : t.border};padding:28px 0;color:${t.muted};font-size:13.5px}
footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ribbon{position:fixed;left:12px;bottom:12px;z-index:9;background:#0b1a3ad9;color:#fff;font:600 11px/1 system-ui,sans-serif;padding:7px 12px;border-radius:999px;backdrop-filter:blur(6px);pointer-events:none}
@media(max-width:719px){.links{display:none}.hero{padding-top:32px}}
@media(min-width:720px){.hls{grid-template-columns:repeat(3,1fr)}.cards{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(4,1fr)}.steps{grid-template-columns:repeat(2,1fr)}.band{flex-direction:row;align-items:center;padding:44px}}
@media(min-width:960px){.hero .wrap{grid-template-columns:1.1fr 1fr}.split{grid-template-columns:1fr 1fr}.cards{grid-template-columns:repeat(3,1fr)}}
${
  t.bento
    ? `@media(min-width:720px){.hls{grid-template-columns:1.3fr 1fr;grid-auto-rows:minmax(120px,auto)}.hl:first-child{grid-row:span 2;flex-direction:column;justify-content:flex-end;padding:28px;background:linear-gradient(160deg,${accent}22,${t.surface} 60%)}.hl:first-child b{font-size:24px;letter-spacing:-.02em}}.hl{border-radius:${r}px}`
    : ''
}
`;

  return `<!doctype html>
<html lang="${opts.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.brandName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="${fontsHref(t)}">
<style>${css}</style>
</head>
<body>
<header><div class="wrap nav"><a class="brand" href="#"><i></i>${esc(m.brandName)}</a><nav class="links">${m.nav.map((n) => `<a href="#">${esc(n)}</a>`).join('')}</nav><a class="btn" href="#">${esc(m.hero.primaryCta)}</a></div></header>
<main>
<section class="hero"><div class="wrap"><div><span class="eb">${esc(m.hero.eyebrow)}</span><h1>${esc(m.hero.headline)}</h1><p class="sub">${esc(m.hero.subheadline)}</p><div class="ctas"><a class="btn" href="#">${esc(m.hero.primaryCta)} →</a><a class="btn ghost" href="#">${esc(m.hero.secondaryCta)}</a></div></div>
<div class="art"><span class="big">${icon(m.hero.icon)}</span>${m.highlights[0] ? `<span class="float f1">${icon(m.highlights[0].icon)} <b>${esc(m.highlights[0].title)}</b></span>` : ''}${m.highlights[1] ? `<span class="float f2">${icon(m.highlights[1].icon)} <b>${esc(m.highlights[1].title)}</b></span>` : ''}</div></div></section>
<div class="wrap hls">${hl}</div>
${sectionHtml}
</main>
<footer><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(m.brandName)}</span><span>${esc(m.footerNote)}</span></div></footer>
${opts.watermark ? `<div class="ribbon">${esc(opts.watermark)}</div>` : ''}
</body>
</html>`;
}
