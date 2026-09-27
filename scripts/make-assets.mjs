// Generates OG images (1200x630, EN + ID), apple-touch-icon, logo.png and a public founder photo.
// Usage: node scripts/make-assets.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const founder = readFileSync('src/assets/founder.jpg');
const founderB64 = (await sharp(founder).resize(360, 450).jpeg({ quality: 82 }).toBuffer()).toString('base64');

const og = (title, sub, cta) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3ecff"/></linearGradient>
  <linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d7eff"/><stop offset="1" stop-color="#1a3fc4"/></linearGradient>
  <clipPath id="c"><rect x="820" y="110" width="300" height="375" rx="28"/></clipPath>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="980" cy="300" r="300" fill="#cddbff" opacity=".45"/>
<g transform="translate(80 58) scale(.875)"><rect width="64" height="64" rx="16" fill="url(#b)"/><path d="M13 38a19 19 0 0 1 38 0" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3.5" stroke-linecap="round"/><path d="M22 38a10 10 0 0 1 20 0z" fill="#fff"/><path d="M11 44h42" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></g>
<text x="148" y="86" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="800" font-size="29" letter-spacing="-0.6" fill="#0b1a3a">Skyland</text>
<text x="149" y="105" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="600" font-size="11" letter-spacing="3.2" fill="#5b6780">PROJECT STUDIO</text>
${title.map((l, i) => `<text x="80" y="${220 + i * 74}" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="800" font-size="64" letter-spacing="-2" fill="${i === title.length - 1 ? '#2459e0' : '#0b1a3a'}">${l}</text>`).join('')}
<text x="80" y="${240 + title.length * 74}" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-size="28" fill="#4a5876">${sub}</text>
<rect x="80" y="${290 + title.length * 74}" width="${cta.length * 15.5 + 60}" height="64" rx="32" fill="#2459e0"/>
<text x="110" y="${331 + title.length * 74}" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="700" font-size="26" fill="#fff">${cta}</text>
<image href="data:image/jpeg;base64,${founderB64}" x="820" y="110" width="300" height="375" clip-path="url(#c)" preserveAspectRatio="xMidYMid slice"/>
<rect x="760" y="440" width="300" height="84" rx="18" fill="#fff"/>
<circle cx="800" cy="482" r="18" fill="#e3f6ec"/><text x="792" y="490" font-family="Arial" font-weight="700" font-size="20" fill="#16a36a">✓</text>
<text x="832" y="474" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="700" font-size="20" fill="#0b1a3a">${cta.includes('Harga') ? 'Harga pasti' : 'Fixed price'}</text>
<text x="832" y="500" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-size="17" fill="#4a5876">${cta.includes('Harga') ? 'Dikunci sebelum bayar' : 'Locked before you pay'}</text>
</svg>`;

await sharp(Buffer.from(og(['Modern websites,', 'fixed price', 'before you pay.'], 'AI plan, mockup and exact price in minutes.', 'Free AI Consultation →'))).png().toFile('public/og-en.png');
await sharp(Buffer.from(og(['Jasa pembuatan', 'website dengan', 'harga pasti.'], 'Rencana, mockup, dan harga dari AI dalam menit.', 'Cek Harga Gratis →'))).png().toFile('public/og-id.png');
await sharp(Buffer.from(readFileSync('public/favicon.svg')), { density: 300 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
// Square raster logo for search engines (schema.org Organization.logo)
await sharp(Buffer.from(readFileSync('public/favicon.svg')), { density: 600 }).resize(512, 512).png().toFile('public/logo.png');
await sharp(founder).resize(480, 600).jpeg({ quality: 82 }).toFile('public/founder.jpg');
console.log('assets written to public/');
