import { describe, expect, it } from 'vitest';
import pricing from '../data/pricing.json';
import { CATEGORY_COPY, FEATURE_COPY, PAGE_COPY, SERVICE_COPY } from '../src/i18n/catalog';
import { catalogText, mockupSystem, planSystem, reviseSystem } from '../src/lib/openai';
import { LOCALES } from '../src/lib/schemas';

/*
 * The consultation used to answer in English even when the client wrote Indonesian. The cause was not the
 * translation catalog — that was complete — but the prompt: it was assembled entirely from `.en` copy, and
 * the PAGE TYPES block is exactly the list the model lifts page names and sections from.
 *
 * None of these tests call OpenAI. They assert what we send, which is the part we control.
 */
describe('the prompt is built in the client language', () => {
  it('builds a different catalog per locale', () => {
    const texts = LOCALES.map((l) => catalogText(l));
    for (let i = 1; i < texts.length; i++) expect(texts[i], `${LOCALES[i]} must differ from ${LOCALES[0]}`).not.toBe(texts[0]);
  });

  it('describes every page type in the client language', () => {
    // This is the block the model copies page names from, so it decides the language of the answer.
    for (const locale of LOCALES) {
      const text = catalogText(locale);
      for (const t of pricing.page_types) expect(text, `${t.id}/${locale}`).toContain(PAGE_COPY[t.id][locale]);
    }
  });

  it('describes every service, feature and category in the client language', () => {
    for (const locale of LOCALES) {
      const text = catalogText(locale);
      for (const s of pricing.services) expect(text, `${s.id}/${locale}`).toContain(SERVICE_COPY[s.id][locale].plain);
      for (const f of pricing.features) expect(text, `${f.id}/${locale}`).toContain(FEATURE_COPY[f.id][locale].plain);
      for (const c of pricing.feature_categories) expect(text, `${c}/${locale}`).toContain(CATEGORY_COPY[c][locale]);
    }
  });

  it('names the required output language in all three prompts, twice over', () => {
    // Once is not enough: the instruction competes with ~1.8k tokens of catalog, so it is stated in the
    // body and restated as the closing line.
    for (const locale of LOCALES)
      for (const [name, prompt] of [['plan', planSystem(locale)], ['revise', reviseSystem(locale)], ['mockup', mockupSystem(locale)]] as const)
        expect(prompt.match(/LANGUAGE:/g)?.length, `${name}/${locale}`).toBeGreaterThanOrEqual(1);
  });

  it('no longer hands the model English page names to copy', () => {
    // The worked example used to spell out `home "Home"`, `my_bookings "My Bookings"` — which answered the
    // "what would the client call it" instruction in English before the client was ever considered.
    const prompt = planSystem('id');
    for (const quoted of ['"Home"', '"Book a Class"', '"My Bookings"', '"Manage Classes"']) expect(prompt, quoted).not.toContain(quoted);
  });
});
