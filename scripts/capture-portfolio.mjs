// Captures desktop (1440×900) and mobile (390×844 @2x) screenshots of each portfolio project.
// Concepts hosted in public/samples/ get a single tall desktop shot instead (the card pans through it on hover).
// Usage: node scripts/capture-portfolio.mjs [key ...]   (uses local Chrome; set CHROME_PATH to override)
//        Concepts are captured from BASE_URL (default http://localhost:4321), so run `npm run dev` first.
// Output: src/assets/work/{key}.png and src/assets/work/{key}-mobile.png (projects only)
import { chromium } from 'playwright-core';

const base = (process.env.BASE_URL || 'http://localhost:4321').replace(/\/$/, '');
const projects = {
  fikrmate: { url: 'https://fikrmate.com' },
  bunsky: { url: 'https://rumah-belajar-bunsky.vercel.app/' },
  tegak: { url: `${base}/samples/tegak/`, long: 3600 },
};
const only = process.argv.slice(2);

// Scroll through the page so scroll-triggered reveals and count-ups have run before the shot.
async function revealAll(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
for (const [key, { url, long }] of Object.entries(projects)) {
  if (only.length && !only.includes(key)) continue;
  const shots = [['', { width: 1440, height: 900 }, 1]];
  if (!long) shots.push(['-mobile', { width: 390, height: 844 }, 2]);
  for (const [suffix, viewport, deviceScaleFactor] of shots) {
    const page = await browser.newPage({ viewport, deviceScaleFactor, isMobile: suffix === '-mobile' });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '#sky-bar{display:none!important}' }); // Skyland banner on concept pages
    const tall = long && suffix === '';
    if (tall) await revealAll(page);
    else await page.waitForTimeout(2500); // let entrance animations finish
    const path = `src/assets/work/${key}${suffix}.png`;
    if (tall) await page.screenshot({ path, fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height: long } });
    else await page.screenshot({ path });
    await page.close();
    console.log(`saved ${path}`);
  }
}
await browser.close();
