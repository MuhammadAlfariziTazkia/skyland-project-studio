// End-to-end walk through the AI consultant. Usage: node scripts/e2e-consult.mjs http://localhost:4321 [en|id] [width]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4321', locale = 'en', width = '1440'] = process.argv.slice(2);
const out = '.shots';
mkdirSync(out, { recursive: true });
const path = locale === 'id' ? '/id/konsultasi/' : '/consult/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
const shot = async (name) => {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  await page.screenshot({ path: `${out}/consult-${locale}-${width}-${name}.png`, fullPage: true });
  console.log(`${sw <= cw ? 'OK' : 'OVERFLOW'} ${name} scrollWidth=${sw} clientWidth=${cw}`);
};

await page.goto(base + path, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.fill('#cs-desc', 'I run a coffee shop in Bandung for students. I want a modern website with menu, story, location and online ordering for pickup.');
await shot('1-describe');
await page.click('.cs button[type=submit]');
await page.waitForSelector('.cs .pages');
await shot('2-plan');
await page.click('.cs .feat:nth-child(4) .x'); // remove one feature
await page.fill('.cs .revise textarea', 'Add table reservation');
await page.click('.cs .revise button');
await page.waitForSelector('.cs .revise .fine');
await page.click('.cs-actions .btn-primary');
await page.waitForSelector('.cs .themes');
await page.click('.cs .theme:nth-child(2)');
await shot('3-theme');
await page.click('.cs-actions .btn-primary');
await page.waitForSelector('.cs .price-card');
await page.waitForTimeout(1200);
await shot('4-result');
const total = await page.textContent('.cs .total');
console.log('TOTAL', total);
await page.click('.cs .price-card .btn-primary');
await page.waitForSelector('.cs .order');
await page.click('.cs .order button[type=submit]'); // should show validation
await shot('5-order-invalid');
await page.fill('.cs .order input[autocomplete=name]', 'Test Client');
await page.fill('.cs .order input[type=email]', 'client@example.com');
await page.fill('.cs .order input[type=tel]', '+62 812 3456 7890');
await page.check('.cs .order .check-row input');
await page.click('.cs .order button[type=submit]');
await page.waitForSelector('.cs .done-step');
await shot('6-done');
console.log('QUOTE', await page.textContent('.cs .done-step .ref b'));
await browser.close();
