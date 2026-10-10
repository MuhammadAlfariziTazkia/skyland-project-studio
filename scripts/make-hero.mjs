// Renders the sample "company profile" website shown on the hero laptop (EN + ID).
// Usage: node scripts/make-hero.mjs   (uses local Chrome; set CHROME_PATH to override)
import { chromium } from 'playwright-core';

const copy = {
  en: {
    nav: ['Services', 'Industries', 'Insights', 'About', 'Contact'],
    cta: 'Book a consultation',
    eyebrow: 'Strategy & Operations Consulting',
    h1: ['Clear strategy.', 'Measurable growth.'],
    lead: 'We help growing companies across Southeast Asia streamline operations, enter new markets and build teams that scale.',
    primary: 'Book a free consultation',
    secondary: 'Our case studies',
    trust: 'Trusted by 120+ companies',
    rating: '4.9 average client rating',
    kpiLabel: 'Client revenue growth',
    kpiSub: 'avg. in the first 12 months',
    meetTitle: 'Strategy workshop',
    meetSub: 'Tue, 10:00 · Jakarta office',
    badge: 'ISO 9001 certified',
    stats: [['12+', 'years of experience'], ['340', 'projects delivered'], ['9', 'countries served'], ['96%', 'client retention']],
  },
  id: {
    nav: ['Layanan', 'Industri', 'Wawasan', 'Tentang', 'Kontak'],
    cta: 'Jadwalkan konsultasi',
    eyebrow: 'Konsultan Strategi & Operasional',
    h1: ['Strategi yang jelas.', 'Pertumbuhan terukur.'],
    lead: 'Kami membantu perusahaan yang sedang bertumbuh merapikan operasional, masuk ke pasar baru, dan membangun tim yang siap berkembang.',
    primary: 'Konsultasi gratis',
    secondary: 'Studi kasus kami',
    trust: 'Dipercaya 120+ perusahaan',
    rating: 'Rating klien rata-rata 4,9',
    kpiLabel: 'Pertumbuhan omzet klien',
    kpiSub: 'rata-rata di 12 bulan pertama',
    meetTitle: 'Workshop strategi',
    meetSub: 'Selasa, 10.00 · Kantor Jakarta',
    badge: 'Tersertifikasi ISO 9001',
    stats: [['12+', 'tahun pengalaman'], ['340', 'proyek selesai'], ['9', 'negara dilayani'], ['96%', 'klien kembali']],
  },
  ja: {
    nav: ['サービス', '業界', 'インサイト', '会社概要', 'お問い合わせ'],
    cta: '相談を予約する',
    eyebrow: '戦略・業務コンサルティング',
    h1: ['明確な戦略を。', '測れる成長を。'],
    lead: '成長中の企業が業務を整理し、新しい市場に入り、拡大に耐えるチームをつくるお手伝いをしています。',
    primary: '無料相談を予約',
    secondary: '事例を見る',
    trust: '120社以上にご利用いただいています',
    rating: 'クライアント評価 平均4.9',
    kpiLabel: 'クライアントの売上成長',
    kpiSub: '最初の12か月の平均',
    meetTitle: '戦略ワークショップ',
    meetSub: '火 10:00 · ジャカルタ事務所',
    badge: 'ISO 9001 認証',
    stats: [['12年以上', 'の実績'], ['340件', 'の案件実績'], ['9か国', 'で対応'], ['96%', 'の継続率']],
  },
};

const logos = ['NORTHLANE', 'Vireo', 'KALANI', 'orbitra', 'Senandika', 'HALCYON'];

const html = (c) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600&display=swap">
<style>
*{box-sizing:border-box;margin:0}body{width:1440px;height:900px;overflow:hidden;font-family:'Plus Jakarta Sans','Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif;color:#0f2a4a;background:#f7f8f5}
.wrap{padding:0 96px}
header{display:flex;align-items:center;justify-content:space-between;height:84px;border-bottom:1px solid #e7e9e2;background:#fff}
.logo{display:flex;align-items:center;gap:12px;font-weight:800;font-size:22px;letter-spacing:-.02em}
.logo i{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#1f7a6c,#0f2a4a);position:relative}
.logo i:after{content:'';position:absolute;inset:9px 9px auto auto;width:12px;height:12px;border-radius:50%;background:#e0a84f}
nav{display:flex;gap:36px;font-size:15px;font-weight:500;color:#51627a}
.btn{display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 24px;border-radius:12px;font-weight:700;font-size:15px}
.dark{background:#0f2a4a;color:#fff}.ghost{border:1.5px solid #cfd6cc;color:#0f2a4a;background:#fff}.teal{background:#1f7a6c;color:#fff;box-shadow:0 14px 30px rgba(31,122,108,.3)}
.hero{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center;padding-top:64px}
.eb{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1f7a6c}
.eb:before{content:'';width:28px;height:2px;background:#e0a84f}
h1{font-family:'Fraunces','Noto Serif JP','Hiragino Mincho ProN',serif;font-weight:600;font-size:66px;line-height:1.04;letter-spacing:-.02em;margin:22px 0 22px}
h1 span{display:block;color:#1f7a6c}
.lead{font-size:19px;line-height:1.6;color:#51627a;max-width:540px}
.ctas{display:flex;gap:14px;margin-top:34px}
.trust{display:flex;align-items:center;gap:18px;margin-top:40px}
.av{display:flex}.av span{width:42px;height:42px;border-radius:50%;border:3px solid #f7f8f5;margin-left:-12px}.av span:first-child{margin-left:0}
.trust b{display:block;font-size:15px}.trust small{font-size:13.5px;color:#51627a}.stars{color:#e0a84f;letter-spacing:2px;font-size:14px}
.art{position:relative;height:600px}
.photo{position:absolute;inset:0 0 40px 40px;border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#cfe6e0 0%,#f3e7cf 100%)}
.photo svg{position:absolute;inset:0;width:100%;height:100%}
.card{position:absolute;background:#fff;border-radius:18px;box-shadow:0 24px 50px rgba(15,42,74,.16);padding:20px 22px}
.kpi{left:0;bottom:0;width:300px}.kpi small{font-size:13px;color:#51627a}.kpi b{display:block;font-size:40px;letter-spacing:-.03em;margin:4px 0 2px}.kpi b em{font-style:normal;font-size:16px;color:#1f7a6c;margin-left:8px}
.bars{display:flex;align-items:flex-end;gap:8px;height:56px;margin-top:12px}.bars i{flex:1;border-radius:6px 6px 2px 2px;background:#d6ebe6}.bars i:last-child{background:#1f7a6c}
.meet{right:24px;top:36px;display:flex;gap:14px;align-items:center}.cal{width:48px;height:48px;border-radius:12px;background:#fdf3e1;color:#b7791f;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;font-size:18px;line-height:1}.cal small{font-size:10px;letter-spacing:.08em}
.meet b{display:block;font-size:15px}.meet span{font-size:13px;color:#51627a}
.badge{right:-8px;bottom:120px;display:flex;align-items:center;gap:10px;padding:14px 18px;font-weight:700;font-size:14px}.badge i{width:30px;height:30px;border-radius:50%;background:#e3f3ef;color:#1f7a6c;display:flex;align-items:center;justify-content:center;font-style:normal}
.logos{position:absolute;left:0;right:0;bottom:0;height:92px;background:#fff;border-top:1px solid #e7e9e2;display:flex;align-items:center;justify-content:space-between;padding:0 96px}
.logos span{font-weight:800;font-size:21px;color:#9aa6b2;letter-spacing:.04em}.logos span:nth-child(2n){font-family:'Fraunces',serif;letter-spacing:0;font-weight:600}
</style></head><body>
<header class="wrap"><div class="logo"><i></i>Lumora</div><nav>${c.nav.map((n) => `<span>${n}</span>`).join('')}</nav><span class="btn dark">${c.cta}</span></header>
<main class="wrap hero">
  <div>
    <span class="eb">${c.eyebrow}</span>
    <h1>${c.h1[0]}<span>${c.h1[1]}</span></h1>
    <p class="lead">${c.lead}</p>
    <div class="ctas"><span class="btn teal">${c.primary} →</span><span class="btn ghost">${c.secondary}</span></div>
    <div class="trust"><div class="av"><span style="background:linear-gradient(135deg,#f2c9a0,#c98b5a)"></span><span style="background:linear-gradient(135deg,#8fb8d8,#40739e)"></span><span style="background:linear-gradient(135deg,#e7b4c0,#a8566b)"></span><span style="background:linear-gradient(135deg,#b9d9a6,#5f8f45)"></span></div>
      <div><b>${c.trust}</b><small><span class="stars">★★★★★</span> ${c.rating}</small></div></div>
  </div>
  <div class="art">
    <div class="photo">
      <svg viewBox="0 0 600 560" preserveAspectRatio="xMidYMax slice">
        <circle cx="455" cy="120" r="54" fill="#f4d29a"/>
        <g fill="#fff" opacity=".7"><ellipse cx="150" cy="110" rx="60" ry="16"/><ellipse cx="200" cy="96" rx="40" ry="14"/><ellipse cx="380" cy="190" rx="46" ry="12"/></g>
        <g fill="#9cc9bf"><rect x="20" y="300" width="70" height="260"/><rect x="520" y="270" width="80" height="290"/></g>
        <g fill="#2f6f78"><rect x="90" y="230" width="110" height="330" rx="4"/><rect x="400" y="200" width="120" height="360" rx="4"/></g>
        <rect x="200" y="140" width="200" height="420" rx="6" fill="#0f2a4a"/>
        <rect x="286" y="100" width="28" height="44" fill="#0f2a4a"/>
        <g fill="#f4d29a" opacity=".85">${Array.from({ length: 12 }, (_, r) => Array.from({ length: 5 }, (_, k) => ((r * 5 + k) % 3 ? `<rect x="${220 + k * 36}" y="${165 + r * 32}" width="22" height="16" rx="2"/>` : '')).join('')).join('')}</g>
        <g fill="#cfe6e0" opacity=".55">${Array.from({ length: 9 }, (_, r) => [0, 1, 2].map((k) => `<rect x="${104 + k * 32}" y="${250 + r * 34}" width="20" height="18" rx="2"/>`).join('')).join('')}${Array.from({ length: 10 }, (_, r) => [0, 1, 2].map((k) => `<rect x="${416 + k * 34}" y="${222 + r * 32}" width="22" height="16" rx="2"/>`).join('')).join('')}</g>
        <rect x="0" y="540" width="600" height="20" fill="#1f7a6c"/>
        <g fill="#1f7a6c"><circle cx="60" cy="520" r="30"/><circle cx="560" cy="515" r="36"/><circle cx="110" cy="530" r="22"/></g>
      </svg>
    </div>
    <div class="card meet"><div class="cal"><small>OCT</small>14</div><div><b>${c.meetTitle}</b><span>${c.meetSub}</span></div></div>
    <div class="card badge"><i>✓</i>${c.badge}</div>
    <div class="card kpi"><small>${c.kpiLabel}</small><b>+38%<em>▲ YoY</em></b><small>${c.kpiSub}</small><div class="bars"><i style="height:30%"></i><i style="height:42%"></i><i style="height:38%"></i><i style="height:55%"></i><i style="height:68%"></i><i style="height:100%"></i></div></div>
  </div>
</main>
<div class="logos">${logos.map((l) => `<span>${l}</span>`).join('')}</div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
for (const locale of ['en', 'id', 'ja']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.setContent(html(copy[locale]), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `src/assets/hero-site-${locale}.png` });
  await page.close();
  console.log(`saved src/assets/hero-site-${locale}.png`);
}
await browser.close();
