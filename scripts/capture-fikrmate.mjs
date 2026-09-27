// One-time: capture the FikrMate homepage for the portfolio / hero laptop.
// Usage: node scripts/capture-fikrmate.mjs  (uses local Chrome; set CHROME_PATH to override)
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('https://fikrmate.com', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'src/assets/work/fikrmate.png' });
await page.screenshot({ path: 'src/assets/work/fikrmate-full.png', fullPage: true });
await browser.close();
console.log('saved src/assets/work/fikrmate.png');
