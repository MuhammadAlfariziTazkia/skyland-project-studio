// Local browser regression check for the Lembar concept; never calls checkout APIs.
// Start a local server, then: BASE_URL=http://localhost:4321 node scripts/check-lembar.mjs
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = (process.env.BASE_URL || 'http://localhost:4321').replace(/\/$/, '');
const artifacts = '.shots/lembar';
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
});
const errors = [];
let cases = 0;

async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  assert.ok(sizes.content <= sizes.width, `${label}: overflow ${JSON.stringify(sizes)}`);
  cases++;
}
async function start(width, lang = 'en') {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text());
  });
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/')) errors.push('Unexpected API request: ' + r.url());
  });
  await page.goto(`${base}/samples/lembar/?lang=${lang}`);
  await page.locator('#hero-title').waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'), 'id');
  assert.equal(
    await page.locator('#sky-bar .sky-cta').getAttribute('href'),
    lang === 'id' ? '/id/konsultasi/' : '/consult/',
  );
  return page;
}

try {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    for (const lang of ['en', 'id']) {
      const page = await start(width, lang);
      await noOverflow(page, `${width}/${lang} home`);
      assert.equal(
        await page.locator('.hero-copy').evaluate((el) => getComputedStyle(el).animationName),
        'none',
      );
      await page.locator('#sky-bar button').click();
      await page.getByRole('button', { name: 'Temukan bukumu', exact: true }).click();
      await page.locator('[role="dialog"]').waitFor();
      assert.equal(await page.locator('.search-result').count(), 14);
      assert.equal(await page.locator('body').evaluate((el) => el.style.overflow), 'hidden');
      await page.getByRole('searchbox').fill('dara');
      assert.equal(await page.locator('.search-result').count(), 1);
      await noOverflow(page, `${width}/${lang} search`);
      await page.locator('.search-result-book').click();
      await page.locator('.product-info').waitFor();
      await noOverflow(page, `${width}/${lang} product`);
      await page.getByRole('button', { name: 'Hardcover', exact: false }).click();
      assert.equal(await page.locator('.product-price').innerText(), 'Rp 143.000');
      await page.getByRole('button', { name: 'Tambah jumlah', exact: true }).click();
      assert.match(await page.locator('.purchase-row > .button').innerText(), /286\.000/);
      await page.locator('.purchase-row > .button').click();
      await page.locator('.cart-trigger').click();
      assert.equal(await page.locator('.cart-item').count(), 1);
      assert.equal(await page.locator('.cart-item p').innerText(), 'Hardcover');
      assert.equal(await page.locator('.cart-bottom .summary-line strong').innerText(), 'Rp 286.000');
      assert.match(await page.locator('.shipping-progress').innerText(), /gratis ongkir/);
      await noOverflow(page, `${width}/${lang} cart`);
      await page.getByRole('button', { name: 'Lanjut checkout' }).click();
      assert.equal(await page.locator('.order-summary .total strong').last().innerText(), 'Rp 286.000');
      assert.match(await page.locator('.order-page > p').innerText(), /Tidak ada pembayaran/);
      await noOverflow(page, `${width}/${lang} order`);
      await page.close();
    }
  }

  const page = await start(1440, 'id');
  await page.locator('#sky-bar button').click();
  await page.locator('.wishlist-trigger').click();
  assert.match(await page.locator('.empty-state h3').innerText(), /masih kosong/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.wishlist-trigger').evaluate((el) => el === document.activeElement), true);
  await page.locator('#baru .save-button').first().click();
  await page.locator('.wishlist-trigger').click();
  assert.equal(await page.locator('.search-result').count(), 1);
  await page.locator('.search-result-book').click();
  assert.equal(await page.locator('.save-book').getAttribute('aria-pressed'), 'true');
  await page.locator('.save-book').click();
  assert.equal(await page.locator('.save-book').getAttribute('aria-pressed'), 'false');
  await page.locator('.purchase-row > .button').click();
  await page.getByRole('button', { name: 'Hardcover', exact: false }).click();
  await page.locator('.purchase-row > .button').click();
  await page.locator('.cart-trigger').click();
  assert.equal(await page.locator('.cart-item').count(), 2);
  assert.equal(await page.locator('.cart-bottom .summary-line strong').innerText(), 'Rp 241.000');
  await page.locator('.cart-item .remove-button').last().click();
  assert.equal(await page.locator('.cart-bottom .summary-line strong').innerText(), 'Rp 98.000');
  await page.getByRole('button', { name: 'Lanjut checkout' }).click();
  assert.equal(await page.locator('.order-summary .total strong').last().innerText(), 'Rp 118.000');
  await page.getByRole('button', { name: 'Kembali menjelajah' }).click();

  await page.keyboard.press('Control+k');
  assert.equal(await page.getByRole('searchbox').evaluate((el) => el === document.activeElement), true);
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button').last().focus();
  await page.keyboard.press('Tab');
  assert.equal(
    await page
      .getByRole('button', { name: 'Tutup pencarian' })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.keyboard.press('Shift+Tab');
  assert.equal(
    await dialog
      .getByRole('button')
      .last()
      .evaluate((el) => el === document.activeElement),
    true,
  );
  for (const [filter, count] of [
    ['Buku baru', 8],
    ['Bestseller', 5],
    ['Pre-order', 1],
    ['Koleksi', 4],
    ['Semua', 14],
  ]) {
    await page.locator('.search-filters').getByRole('button', { name: filter, exact: true }).click();
    assert.equal(await page.locator('.search-result').count(), count);
  }
  await page.getByRole('searchbox').fill('buku-tidak-ada');
  assert.equal(await page.locator('.search-result').count(), 0);
  await page.getByRole('button', { name: 'Jelajahi semua buku' }).click();
  assert.equal(await page.locator('.search-result').count(), 14);
  await page.keyboard.press('Escape');
  await page.locator('.nav-links').getByRole('button', { name: 'Buku baru', exact: true }).click();
  await page.getByRole('button', { name: 'Buku berikutnya', exact: true }).click();
  assert.ok(await page.locator('.book-shelf').evaluate((el) => el.scrollLeft > 0));
  await page.getByRole('button', { name: 'Buku sebelumnya', exact: true }).click();
  // Scroll snap aligns the first card after the shelf's 3px inset.
  assert.ok(await page.locator('.book-shelf').evaluate((el) => el.scrollLeft <= 4));
  await page.locator('#newsletter-email').fill('reader@example.com');
  await page.getByRole('button', { name: 'Ikut membaca' }).click();
  assert.match(await page.locator('.subscribe-success').innerText(), /Simulasi pendaftaran berhasil/);
  await page.locator('.cart-trigger').click();
  assert.equal(await page.getByRole('button', { name: 'Lanjut checkout' }).isDisabled(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('body').evaluate((el) => el.style.overflow), '');
  assert.equal(await page.locator('main').evaluate((el) => el.inert), false);
  await page.close();

  for (const [width, name] of [
    [1440, 'desktop'],
    [390, 'mobile'],
  ]) {
    const shot = await start(width, 'id');
    await shot.locator('#sky-bar button').click();
    await shot.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await shot.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
    await shot.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    `Lembar passed: ${cases} responsive assertions (6 widths × EN/ID banners × 5 views), catalog filters, search, wishlist, hardcover/paperback totals, shipping, empty cart, keyboard focus, reduced motion, newsletter, no API requests or browser errors. Screenshots: ${artifacts}/`,
  );
} finally {
  await browser.close();
}
