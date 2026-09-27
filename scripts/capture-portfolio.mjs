// Captures desktop (1440×900) and mobile (390×844 @2x) screenshots of each portfolio project.
// Usage: node scripts/capture-portfolio.mjs   (uses local Chrome; set CHROME_PATH to override)
// Output: src/assets/work/{key}.png and src/assets/work/{key}-mobile.png
import { chromium } from 'playwright-core';

const projects = {
  fikrmate: 'https://fikrmate.com',
  bunsky: 'https://rumah-belajar-bunsky.vercel.app/',
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
for (const [key, url] of Object.entries(projects)) {
  for (const [suffix, viewport, deviceScaleFactor] of [['', { width: 1440, height: 900 }, 1], ['-mobile', { width: 390, height: 844 }, 2]]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor, isMobile: suffix === '-mobile' });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500); // let entrance animations finish
    await page.screenshot({ path: `src/assets/work/${key}${suffix}.png` });
    await page.close();
    console.log(`saved src/assets/work/${key}${suffix}.png`);
  }
}
await browser.close();
