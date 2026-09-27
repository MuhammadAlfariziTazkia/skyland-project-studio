// Responsive check: screenshots each URL at several widths and reports horizontal overflow.
// Usage: node scripts/shots.mjs http://localhost:4321/ /id/ ...   (output in ./.shots)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, ...paths] = process.argv.slice(2);
const widths = (process.env.WIDTHS || '375,768,1440').split(',').map(Number);
const out = process.env.OUT || '.shots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
let failed = false;
for (const p of paths.length ? paths : ['/']) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base.replace(/\/$/, '') + p, { waitUntil: 'networkidle' });
    // scroll through the page so lazy images load
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    const name = `${out}/${(p.replace(/\W+/g, '_') || 'home').replace(/^_|_$/g, '') || 'home'}-${w}.png`;
    if (!process.env.NO_SHOTS) await page.screenshot({ path: name, fullPage: !process.env.VIEWPORT_ONLY });
    const ok = sw <= cw;
    if (!ok) failed = true;
    console.log(`${ok ? 'OK  ' : 'OVERFLOW'} ${p} @${w}px scrollWidth=${sw} clientWidth=${cw} → ${name}`);
    await page.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
