// Responsive audit: walks every page (and every consultant step) at several widths and reports
// horizontal overflow, elements wider than the viewport, small tap targets and clipped text.
// Usage: node scripts/audit-responsive.mjs http://localhost:4321 [--shots] [--no-consult]
//        PAGES=/a/,/b/ node scripts/audit-responsive.mjs …   audits just those paths
// The consultant steps need .shots/plan.json + .shots/mockup.json; --no-consult skips them,
// which is what you want when auditing only the concept demos under /samples/.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';

const base = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');
const shots = process.argv.includes('--shots');
const noConsult = process.argv.includes('--no-consult');
const WIDTHS = (process.env.WIDTHS || '320,375,414,768,1024,1440').split(',').map(Number);
const PAGES = (process.env.PAGES || [
  '/', '/id/', '/consult/', '/id/konsultasi/',
  '/services/company-profile-website/', '/id/layanan/jasa-pembuatan-toko-online/',
  '/privacy/', '/id/syarat-ketentuan/',
  // Concept demos: plain files under public/, rendered by their own React runtime.
  '/samples/tegak/', '/samples/lembar/', '/samples/arden/', '/samples/kurohane/',
].join(',')).split(',').filter(Boolean);
if (shots) mkdirSync('.shots', { recursive: true });

// Tap-target checks only matter where a finger is the pointer, so they run below the desktop breakpoint.
const audit = (touchMax = 900) => {
  const vw = document.documentElement.clientWidth;
  const touch = vw <= touchMax;
  const out = { overflow: document.documentElement.scrollWidth - vw, wide: [], small: [], clipped: [] };
  const name = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  // Skip things that are deliberately off-screen or clipped: screen-reader text, the honeypot, decoration.
  const ignored = (el) => el.closest('.sr-only,.hp,[aria-hidden="true"],.mf,iframe,[data-scale-frame]') !== null;
  // Anything inside a horizontal scroller (the services carousel) is allowed to extend past the viewport.
  const inScroller = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const o = getComputedStyle(n);
      if (o.overflowX === 'auto' || o.overflowX === 'scroll' || o.overflow === 'auto' || o.overflow === 'scroll') return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll('body *')) {
    if (ignored(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if ((r.right > vw + 1 || r.left < -1) && !inScroller(el)) out.wide.push({ el: name(el), left: Math.round(r.left), right: Math.round(r.right) });
    // Tap targets: real controls only. Links that sit inside a sentence are exempt (WCAG inline exception).
    const wrapped = el.tagName === 'INPUT' && el.closest('label');
    const control = !wrapped && (el.matches('button,select,summary,input:not([type=hidden]),[role=radio],[role=switch]') || (el.tagName === 'A' && cs.display !== 'inline'));
    if (touch && control && (r.height < 32 || r.width < 28)) out.small.push({ el: name(el), w: Math.round(r.width), h: Math.round(r.height), text: el.textContent.trim().slice(0, 24) });
    if (el.children.length === 0 && el.textContent.trim() && !/auto|scroll/.test(cs.overflowX + cs.overflow) && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis') {
      out.clipped.push({ el: name(el), text: el.textContent.trim().slice(0, 30), scroll: el.scrollWidth, client: el.clientWidth });
    }
  }
  const uniq = (a) => [...new Map(a.map((x) => [x.el + (x.text || ''), x])).values()].slice(0, 8);
  return { overflow: out.overflow, wide: uniq(out.wide), small: uniq(out.small), clipped: uniq(out.clipped) };
};

// Fixtures are only needed for the consultant walk, so they are read lazily.
const plan = noConsult ? null : JSON.parse(readFileSync('.shots/plan.json', 'utf8'));
const mockup = noConsult ? null : JSON.parse(readFileSync('.shots/mockup.json', 'utf8'));
const key = plan && JSON.stringify([plan.serviceId, plan.pages.map((p) => p.name), plan.features.map((f) => f.id)]);
const contact = { name: 'Tes Klien', email: 'a@b.co', whatsapp: '+62 812 3456 7890', company: '', notes: '', consent: true };
const STEPS = ['describe', 'plan', 'theme', 'result', 'order'];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
let problems = 0;

// The width sweep below runs with reducedMotion so geometry is stable, which also skips every
// reveal-on-scroll code path. This pass is the opposite: real motion, and it reports content
// that is still fully transparent long after its entrance should have finished — the shape of
// bug where a demo renders as a blank page.
async function revealPass(paths) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => console.log(`  JS ERROR ${e.message}`));
  for (const path of paths) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForSelector('#dc-root > *', { timeout: 20000 });
    await page.waitForTimeout(2500);
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.height > 0 && r.top < innerHeight && r.bottom > 0 && el.textContent.trim() && getComputedStyle(el).opacity === '0';
        })
        .map((el) => `${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 34)}"`)
        .slice(0, 6));
    if (stuck.length) {
      problems++;
      console.log(`\nmotion ${path}`);
      for (const x of stuck) console.log(`  STUCK    ${x}`);
    }
  }
  await page.close();
}
const report = (label, r) => {
  const bad = r.overflow > 0 || r.wide.length || r.small.length || r.clipped.length;
  if (!bad) return;
  problems++;
  console.log(`\n${label}`);
  if (r.overflow > 0) console.log(`  OVERFLOW +${r.overflow}px`);
  for (const x of r.wide) console.log(`  WIDE     ${x.el} (${x.left}…${x.right})`);
  for (const x of r.small) console.log(`  SMALL    ${x.el} ${x.w}x${x.h} "${x.text}"`);
  for (const x of r.clipped) console.log(`  CLIPPED  ${x.el} "${x.text}" ${x.scroll}>${x.client}`);
};

for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', (e) => console.log(`  JS ERROR ${e.message}`));
  for (const path of PAGES) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // Concept demos render client-side from a CDN React bundle, so wait for the mount.
    if (path.startsWith('/samples/')) await page.waitForSelector('#dc-root > *', { timeout: 20000 });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
    await page.waitForTimeout(path.startsWith('/samples/') ? 600 : 250);
    report(`${w}px ${path}`, await page.evaluate(audit));
    if (shots) await page.screenshot({ path: `.shots/audit-${w}-${path.replace(/\W+/g, '_')}.png`, fullPage: true });
  }
  // consultant steps, state injected so no AI calls are needed
  for (const step of noConsult ? [] : STEPS) {
    await page.goto(base + '/consult/', { waitUntil: 'networkidle' });
    await page.evaluate(([plan, mockup, key, step, contact]) => {
      localStorage.setItem('skyland-consult-v2', JSON.stringify({ step, plan, mockup, mockupKey: key, theme: 'elegant', description: 'Coffee shop in Bandung with online ordering for pickup.', contact }));
    }, [plan, mockup, key, step, contact]);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.cs-card', { timeout: 15000 });
    await page.waitForTimeout(400);
    report(`${w}px consult:${step}`, await page.evaluate(audit));
    if (shots) await page.screenshot({ path: `.shots/audit-${w}-step-${step}.png`, fullPage: true });
  }
  await page.close();
}
await revealPass(PAGES.filter((p) => p.startsWith('/samples/')));

await browser.close();
console.log(problems ? `\n${problems} view(s) with findings` : '\nNo responsive issues found');
