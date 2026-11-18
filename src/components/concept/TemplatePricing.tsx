import { useMemo, useState } from 'preact/hooks';
import '../consult/consult.css';
import { consultStrings } from '../../i18n/consult';
import { getDict } from '../../i18n';
import { NOT_INCLUDED_COPY } from '../../i18n/catalog';
import type { ConceptKey } from '../../i18n/routes';
import { TEMPLATE_COPY } from '../../i18n/templates';
import { PRICING, formatPrice, formatShort, getTemplate, quote, quotePriceText, templateSelection, type TemplateItem, type TemplateModule } from '../../lib/pricing';
import { toTemplatePlan } from '../../lib/samples/plan';
import { SAMPLE_SPECS } from '../../lib/samples/specs';
import type { Locale, Region } from '../../lib/schemas';
import { handOffToConsultant } from './handoff';

interface Props {
  locale: Locale;
  concept: ConceptKey;
  consultHref: string;
  region: Region;
}

/**
 * A concept sold from its template price list: a base package that is always on, a few modules, and
 * add-ons that appear under their module only once it is switched on — so there is never an add-on that
 * cannot work. Every card says who can do what, with the steps spelled out, because the buyer is a shop
 * owner deciding between concrete things, not a developer reading a feature list.
 *
 * The number still comes from `quote()`, which delegates to the template list for a template plan; the
 * consultant and the order API recompute it the same way.
 */
export default function TemplatePricing({ locale, concept, consultHref, region }: Props) {
  const spec = SAMPLE_SPECS[concept];
  const tpl = getTemplate(concept)!;
  const copy = TEMPLATE_COPY[concept];
  const t = consultStrings[locale];
  const dict = getDict(locale);
  const c = dict.conceptPage;
  const L = c.tpl;
  const demoUrl = dict.work.concepts.find((x) => x.key === concept)?.url ?? '';

  // Starts on the base package alone: the cheapest honest answer, and every addition is a visible choice.
  const [items, setItems] = useState<string[]>([]);
  const on = useMemo(() => new Set(templateSelection(tpl, items)), [tpl, items]);

  const quoteOf = (ids: readonly string[]) =>
    quote(toTemplatePlan(spec, ids, locale), { region, design: spec.design as never, content: 'ready', timeline: 'normal', promoCode: '' }, locale);
  const plan = useMemo(() => toTemplatePlan(spec, items, locale), [spec, items, locale]);
  const q = useMemo(() => quoteOf(items), [spec, items, locale, region]);
  // Preset buttons show the list price, the same number the price card shows struck through.
  const presets = useMemo(() => tpl.presets.map((p) => ({ ...p, price: quoteOf(p.items).price })), [tpl, spec, locale, region]);

  const word = (id: string) => copy.items[id][locale];
  const price = (i: TemplateItem) => formatPrice(i.price[region] ?? 0, region);
  const same = (a: readonly string[]) => a.length === on.size && a.every((id) => on.has(id));

  // `parent` is the module an add-on belongs to; base add-ons have none, because the base is always on.
  const toggle = (m: TemplateModule | TemplateItem, parent?: TemplateModule) =>
    setItems((prev) => {
      const sel = templateSelection(tpl, prev);
      if (!sel.includes(m.id)) return [...sel, m.id, ...(parent && !sel.includes(parent.id) ? [parent.id] : [])];
      // Switching a module off takes its add-ons with it, so switching it back on starts clean.
      const drop = new Set([m.id, ...('addons' in m ? m.addons.map((a) => a.id) : [])]);
      return sel.filter((id) => !drop.has(id));
    });

  const accept = () => handOffToConsultant({ concept, locale, region, plan, consultHref, overwrite: c.overwrite });

  const check = (lines: string[]) =>
    lines.length > 0 && (
      <ul class="tp-check">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    );

  const sw = () => (
    <span class="sw-toggle" aria-hidden="true">
      <i />
    </span>
  );

  /** Lines that depend on other modules: what it adds while they are on, and warnings while they are off. */
  const extras = (id: string, active: boolean) => {
    const w = word(id);
    return {
      also: Object.entries(w.also ?? {}).flatMap(([other, lines]) => (on.has(other) ? lines : [])),
      warnings: Object.entries(w.without ?? {}).flatMap(([other, text]) => (active && !on.has(other) ? [text] : [])),
    };
  };

  const notes = (warnings: string[]) =>
    warnings.map((text) => (
      <p class="tp-note" key={text}>
        {text}
      </p>
    ));

  /** Add-ons nested under their parent (a module, or the always-on base). An active add-on spells out what it covers. */
  const addonList = (parentName: string, addons: TemplateItem[], parent?: TemplateModule) => (
    <div class="tp-addons">
      <span class="tp-k">{L.addons(parentName)}</span>
      <ul class="feats stack">
        {addons.map((a) => {
          const aw = word(a.id);
          const aon = on.has(a.id);
          const { also, warnings } = extras(a.id, aon);
          return (
            <li key={a.id}>
              <button type="button" class={`feat${aon ? ' on' : ''}`} role="switch" aria-checked={aon} onClick={() => toggle(a, parent)}>
                {sw()}
                <span class="feat-main">
                  <b>{aw.name}</b>
                  <span>{aw.does}</span>
                </span>
                <span class="ftag">+{price(a)}</span>
              </button>
              {aon && (aw.gets?.length || also.length || warnings.length) ? (
                <div class="tp-addon-body">
                  {check([...(aw.gets ?? []), ...also])}
                  {notes(warnings)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );

  const moduleCard = (m: TemplateModule) => {
    const w = word(m.id);
    const active = on.has(m.id);
    const { also, warnings } = extras(m.id, active);
    const anchor = copy.demo[m.id];
    return (
      <li key={m.id} class={`tp-card${active ? ' on' : ''}`}>
        <button type="button" class={`feat tp-row${active ? ' on' : ''}`} role="switch" aria-checked={active} onClick={() => toggle(m)}>
          {sw()}
          <span class="feat-main">
            <b>{w.name}</b>
            <span>{w.does}</span>
          </span>
          <span class="ftag">+{price(m)}</span>
        </button>
        <div class="tp-body">
          {w.steps && (
            <>
              <span class="tp-k">{L.steps}</span>
              <ol class="tp-steps">
                {w.steps.map((step, i) => (
                  <li key={step}>
                    <span>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </>
          )}
          {(w.gets?.length ?? 0) + also.length > 0 && <span class="tp-k">{L.includes}</span>}
          {check([...(w.gets ?? []), ...also])}
          {notes(warnings)}
          {anchor && demoUrl && (
            <a class="link tp-demo" href={`${demoUrl}${anchor}`} target="_blank" rel="noopener">
              {L.tryDemo} ↗
            </a>
          )}
          {active && m.addons.length > 0 && addonList(w.name, m.addons, m)}
        </div>
      </li>
    );
  };

  const base = word(tpl.base.id);
  const clientPaid = tpl.client_paid.filter((p) => !p.requires || on.has(p.requires));

  return (
    <div class="cs cp tp">
      <div class="cp-grid">
        <div class="stack cp-lists">
          <section>
            <h3>{L.quick}</h3>
            <div class="chips tp-presets">
              {presets.map((p) => (
                <button type="button" key={p.id} class={`chip${same(p.items) ? ' sel' : ''}`} aria-pressed={same(p.items)} onClick={() => setItems(p.items)}>
                  {copy.presets[p.id][locale]} · <b>{formatPrice(p.price, region)}</b>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>{L.base}</h3>
            <p class="fine">{L.baseNote}</p>
            <div class="tp-card on tp-base">
              <div class="tp-row-static">
                <span class="feat-main">
                  <b>{base.name}</b>
                  <span>{base.does}</span>
                </span>
                <span class="ftag">{price(tpl.base)}</span>
              </div>
              <div class="tp-body">
                {check(base.gets ?? [])}
                {(tpl.base.addons?.length ?? 0) > 0 && addonList(base.name, tpl.base.addons!)}
              </div>
            </div>
          </section>

          <section>
            <h3>
              {L.modules} <span class="count">{tpl.modules.length}</span>
            </h3>
            <p class="fine">{L.modulesNote}</p>
            <ul class="stack tp-mods">{tpl.modules.map(moduleCard)}</ul>
          </section>

          <section class="custom">
            <h3>{L.notIncluded}</h3>
            <ul class="stack not-offered">
              {copy.notIncluded[locale].map((n) => (
                <li key={n.label}>
                  <b>{n.label}</b>
                  <span>{n.why}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside class="price-card">
          <div class="stack" style="gap:4px">
            <span class="k">{c.yourPrice}</span>
            {q.savings > 0 && (
              <div class="saves">
                <div class="save-row">
                  <span>{t.result.normalPrice}</span>
                  <s>{formatPrice(q.price, region)}</s>
                </div>
                {q.discounts
                  .filter((d) => d.amount > 0)
                  .map((d) => (
                    <div class="save-row off" key={d.kind}>
                      <span>
                        ✓ {d.label} ({d.percent}%)
                      </span>
                      <b>−{formatPrice(d.amount, region)}</b>
                    </div>
                  ))}
              </div>
            )}
            <b class="total">{quotePriceText(q)}</b>
            <p class="fine">{L.payOnce}</p>
          </div>

          <ul class="facts">
            <li>
              <span>{c.timeline}</span>
              <b>{t.result.workdays(q.workdays[0], q.workdays[1])}</b>
            </li>
          </ul>

          <details class="bd">
            <summary>{t.result.breakdown}</summary>
            <table>
              <tbody>
                {q.lines.map((l, i) => (
                  <tr key={i} class={l.kind === 'adjust' ? 'adjust' : undefined}>
                    <td>
                      {l.label}
                      {l.detail && <small>{l.detail}</small>}
                    </td>
                    <td>{formatPrice(l.amount, region)}</td>
                  </tr>
                ))}
                {q.discounts
                  .filter((d) => d.amount > 0)
                  .map((d) => (
                    <tr class="disc" key={d.kind}>
                      <td>{d.label}</td>
                      <td>−{formatPrice(d.amount, region)}</td>
                    </tr>
                  ))}
                <tr class="tot">
                  <td>{t.result.total}</td>
                  <td>{quotePriceText(q)}</td>
                </tr>
              </tbody>
            </table>
          </details>

          <div class="incl muted">
            <b>{L.clientPaid}</b>
            <ul>
              {clientPaid.map((p) => {
                if (p.id === 'hosting_domain') {
                  const ni = PRICING.not_included.find((n) => n.id === p.id);
                  const cp = NOT_INCLUDED_COPY[p.id][locale];
                  const range = ni ? (ni.estimate as Record<Region, number[]>)[region] : undefined;
                  return (
                    <li key={p.id}>
                      {cp.name}
                      {range && <span> · {t.result.estimate(`${formatShort(range[0], region)}–${formatShort(range[1], region)}`, cp.billing)}</span>}
                      <em>{cp.note}</em>
                    </li>
                  );
                }
                const cp = copy.clientPaid[p.id]?.[locale];
                return (
                  cp && (
                    <li key={p.id}>
                      {cp.name}
                      <em>{cp.note}</em>
                    </li>
                  )
                );
              })}
            </ul>
          </div>

          <div class="cs-actions col">
            <button type="button" class="btn btn-primary" onClick={accept}>
              {c.cta} →
            </button>
            <p class="fine">{c.ctaNote}</p>
          </div>
        </aside>
      </div>

      {/* On a phone the price card sits below every card, out of sight while the client is choosing. */}
      <div class="cp-bar">
        <div class="cp-bar-in">
          <span class="stack">
            <small>{c.yourPrice}</small>
            <b>{quotePriceText(q)}</b>
          </span>
          <button type="button" class="btn btn-primary btn-sm" onClick={accept}>
            {c.cta} →
          </button>
        </div>
      </div>
    </div>
  );
}
