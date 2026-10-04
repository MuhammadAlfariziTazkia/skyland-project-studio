import { describe, expect, it } from 'vitest';
import { contrastRatio, pickAccent, renderMockup } from '../src/lib/mockup/render';
import { SAMPLE_MOCKUP } from '../src/lib/mockup/samples';
import { MOODS, THEMES, fontsHref, recommendThemes, themeSwatchHtml } from '../src/lib/mockup/themes';
import { PlanSchema, THEME_IDS, type Mockup } from '../src/lib/schemas';

describe('themes', () => {
  it('defines every theme id with names in both languages and a known mood', () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_IDS].sort());
    for (const id of THEME_IDS) {
      const t = THEMES[id];
      expect(t.id).toBe(id);
      expect(t.name.en && t.name.id && t.sub.en && t.sub.id, id).toBeTruthy();
      expect(MOODS, id).toContain(t.mood);
      expect(fontsHref(t)).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=/);
    }
  });

  it('recommends four unique valid styles, AI picks first, and keeps the current one', () => {
    const plan = PlanSchema.shape.styles.parse(['aurora', 'not_a_theme', 'retro']);
    expect(plan).toEqual(['aurora', 'retro']);
    const rec = recommendThemes({ serviceId: 'company_profile', styles: plan });
    expect(rec).toHaveLength(4);
    expect(new Set(rec).size).toBe(4);
    expect(rec.slice(0, 2)).toEqual(['aurora', 'retro']);
    expect(recommendThemes({ serviceId: 'company_profile', styles: [] }, 'luxury')).toContain('luxury');
    expect(recommendThemes(null)).toHaveLength(4);
  });

  it('renders every theme, escaping the AI text', () => {
    const evil: Mockup = { ...SAMPLE_MOCKUP.en, brandName: '<script>alert(1)</script>' };
    for (const id of THEME_IDS) {
      const html = renderMockup(evil, id, { locale: 'en' });
      expect(html, id).toContain('&lt;script&gt;');
      expect(html, id).not.toContain('<script>alert');
      expect(themeSwatchHtml(id), id).toContain(THEMES[id].bg);
    }
  });

  it('marks a watermarked render as a draft and escapes the label', () => {
    const plain = renderMockup(SAMPLE_MOCKUP.en, 'minimal', { locale: 'en' });
    expect(plain).not.toContain('class="ribbon"');
    const draft = renderMockup(SAMPLE_MOCKUP.en, 'minimal', { locale: 'en', watermark: 'Draft · <b>not final</b>' });
    expect(draft).toContain('class="ribbon"');
    expect(draft).toContain('Draft · &lt;b&gt;not final&lt;/b&gt;');
  });

  it('uses the brand colour only when it stays readable and the style does not own its colours', () => {
    expect(pickAccent('#b45309', 'minimal')).toBe('#b45309');
    expect(pickAccent('#b45309', 'luxury')).toBe(THEMES.luxury.accent); // locked
    expect(pickAccent('#f5f0e6', 'elegant')).toBe(THEMES.elegant.accent); // too pale on cream
    expect(pickAccent('nope', 'bento')).toBe(THEMES.bento.accent);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });
});
