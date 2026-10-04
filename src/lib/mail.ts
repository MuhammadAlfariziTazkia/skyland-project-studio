import nodemailer from 'nodemailer';
import { env } from './env';
import pricing from '../../data/pricing.json';
import { SITE } from '../config/site';
import { FEATURE_COPY, MULTIPLIER_COPY, SERVICE_COPY } from '../i18n/catalog';
import { formatPrice, visiblePages, quotePriceText, type Quote } from './pricing';
import type { OrderRequest } from './schemas';
import { THEMES } from './mockup/themes';

const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const nl2br = (s: string) => esc(s).replace(/\n/g, '<br>');

function transport() {
  const user = env('GMAIL_USER');
  const pass = env('GMAIL_APP_PASSWORD');
  if (!user || !pass) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD are not set');
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass: pass.replace(/\s+/g, '') } });
}

const box = (inner: string) =>
  `<div style="background:#f3f6fc;padding:24px 12px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0b1a3a"><div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e3eaf6;border-radius:16px;overflow:hidden">${inner}</div></div>`;
const h = (s: string) => `<h3 style="margin:24px 0 8px;font-size:15px;color:#0b1a3a">${s}</h3>`;
const row = (k: string, v: string) => `<tr><td style="padding:6px 12px 6px 0;color:#6a7894;font-size:13px;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0;font-size:14px">${v}</td></tr>`;

function priceTable(q: Quote, lang: 'en' | 'id') {
  const L =
    lang === 'id'
      ? { inc: 'termasuk', free: 'gratis', price: 'Harga normal', total: 'Total harga pasti', est: 'Estimasi (dikonfirmasi lewat obrolan singkat)', discuss: 'Perlu diskusi langsung' }
      : { inc: 'included', free: 'free', price: 'Normal price', total: 'Fixed total', est: 'Estimate (confirmed in a short call)', discuss: 'To be discussed' };
  const money = (n: number) => (n < 0 ? `−${formatPrice(-n, q.region)}` : formatPrice(n, q.region));
  const lines = q.lines
    .map(
      (l) =>
        `<tr><td style="padding:7px 0;border-bottom:1px solid #edf1f8;font-size:13.5px">${esc(l.label)}${l.quantity > 1 ? ` × ${l.quantity}` : ''}${l.detail ? `<br><span style="color:#8a97b0;font-size:12px">${esc(l.detail)}</span>` : ''}</td><td style="padding:7px 0;border-bottom:1px solid #edf1f8;text-align:right;font-size:13.5px;white-space:nowrap">${l.included ? `<span style="color:#16a36a">${L.inc}</span>` : l.amount === 0 ? `<span style="color:#16a36a">${L.free}</span>` : money(l.amount)}</td></tr>`,
    )
    .join('');
  const label = q.status === 'fixed' ? L.total : q.status === 'range' ? L.est : L.discuss;
  return `<table style="width:100%;border-collapse:collapse">${lines}
<tr><td style="padding:8px 0;font-size:13.5px">${L.price}</td><td style="text-align:right;font-size:13.5px">${formatPrice(q.price, q.region)}</td></tr>
${q.discounts
    .filter((d) => d.amount > 0)
    .map((d) => `<tr><td style="padding:4px 0;font-size:13.5px;color:#16a36a">${esc(d.label)} (${d.percent}%)</td><td style="text-align:right;font-size:13.5px;color:#16a36a">−${formatPrice(d.amount, q.region)}</td></tr>`)
    .join('')}
<tr><td style="padding:10px 0;font-size:16px;font-weight:800">${label}</td><td style="text-align:right;font-size:18px;font-weight:800">${quotePriceText(q) || '—'}</td></tr></table>`;
}

function planHtml(o: OrderRequest, lang: 'en' | 'id') {
  const p = o.plan;
  const L =
    lang === 'id'
      ? { flows: 'Yang bisa dilakukan', visitor: 'Pengunjung', member: 'Member', owner: 'Pemilik', public: 'Halaman publik', memberArea: 'Area member (setelah login)', admin: 'Panel admin', feats: 'Fitur', custom: 'Perlu diskusi', ass: 'Asumsi' }
      : { flows: 'What people can do', visitor: 'Visitor', member: 'Member', owner: 'Owner', public: 'Public pages', memberArea: 'Member area (after login)', admin: 'Admin panel', feats: 'Features', custom: 'To discuss', ass: 'Assumptions' };
  const pages = visiblePages(p);
  const pageList = (area: 'public' | 'member' | 'admin', title: string) => {
    const list = pages.filter((pg) => pg.area === area);
    if (!list.length) return '';
    return `${h(title)}<ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${list
      .map((pg) => `<li style="margin-bottom:6px"><b>${esc(pg.name)}</b>${pg.feature && area !== 'public' ? ` <span style="color:#8a97b0;font-size:12px">(${esc(FEATURE_COPY[pg.feature]?.[lang].name ?? pg.feature)})</span>` : ''}<br><span style="color:#4a5876">${esc(pg.purpose)}</span>${pg.sections.length ? `<br><span style="color:#6a7894;font-size:13px">${pg.sections.map(esc).join(' · ')}</span>` : ''}</li>`)
      .join('')}</ol>`;
  };
  return `${p.flows.length ? `${h(L.flows)}<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${p.flows.map((f) => `<li><span style="color:#6a7894">${L[f.who]}:</span> ${esc(f.does)}</li>`).join('')}</ul>` : ''}
${pageList('public', L.public)}${pageList('member', L.memberArea)}${pageList('admin', L.admin)}
${h(L.feats)}<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${p.features.map((f) => `<li><b>${esc(FEATURE_COPY[f.id]?.[lang].name ?? f.id)}</b>${f.quantity > 1 ? ` × ${f.quantity}` : ''}${f.reason ? ` <span style="color:#6a7894">– ${esc(f.reason)}</span>` : ''}</li>`).join('')}</ul>
${p.customRequests.length ? `${h(L.custom)}<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${p.customRequests.map((c) => `<li><b>${esc(c.name)}</b> – ${esc(c.description)}</li>`).join('')}</ul>` : ''}
${p.assumptions.length ? `${h(L.ass)}<ul style="margin:0;padding-left:20px;font-size:13.5px;color:#4a5876">${p.assumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`;
}

export async function sendOrderEmails(o: OrderRequest, q: Quote, id: string, mockupHtml: string) {
  if (import.meta.env.DEV && !env('GMAIL_APP_PASSWORD')) {
    console.log(`[dev] Gmail not configured, skipping emails for ${id} (${q.status}: ${quotePriceText(q) || 'discuss'}) to ${o.contact.email}`);
    return;
  }
  const t = transport();
  const owner = env('OWNER_EMAIL') || env('GMAIL_USER');
  const from = `"${SITE.name}" <${env('GMAIL_USER')}>`;
  const c = o.contact;
  const waNum = c.whatsapp.replace(/\D/g, '').replace(/^0/, '62');
  const typeName = SERVICE_COPY[o.plan.serviceId].id.name;
  const totalText = quotePriceText(q) || (o.locale === 'id' ? 'perlu diskusi' : 'to discuss');
  const choice = (k: keyof typeof MULTIPLIER_COPY, v: string) => MULTIPLIER_COPY[k].options[v].id.label;
  const attachments = [
    { filename: `mockup-${id}.html`, content: mockupHtml, contentType: 'text/html' },
    { filename: `consultation-${id}.json`, content: JSON.stringify({ quoteId: id, createdAt: new Date().toISOString(), ...o, quote: q }, null, 2), contentType: 'application/json' },
  ];

  const ownerHtml = box(`
<div style="background:#2459e0;color:#fff;padding:20px 24px"><div style="font-size:12px;letter-spacing:.1em;opacity:.8">ORDER BARU · ${id}</div><div style="font-size:22px;font-weight:800;margin-top:4px">${esc(o.plan.projectName || typeName)} — ${totalText}</div></div>
<div style="padding:8px 24px 24px">
${h('Kontak klien')}<table>${row('Nama', esc(c.name))}${c.company ? row('Perusahaan', esc(c.company)) : ''}${row('Email', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`)}${row('WhatsApp', `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Halo ${c.name}, saya Alfarizi dari Skyland. Terima kasih sudah memesan (${id}).`)}">${esc(c.whatsapp)}</a>`)}${row('Bahasa / region', `${o.locale.toUpperCase()} / ${q.region} (${q.currency})`)}${row('Tema', THEMES[o.theme].name.id)}${row('Desain', choice('design_level', o.choices.design))}${row('Konten', choice('content_readiness', o.choices.content))}${row('Waktu', `${choice('timeline', o.choices.timeline)} · ${q.workdays[0]}–${q.workdays[1]} hari kerja`)}${o.choices.promoCode ? row('Kode promo', esc(o.choices.promoCode)) : ''}</table>
${c.notes ? `${h('Catatan klien')}<p style="margin:0;font-size:14px;color:#33415e">${nl2br(c.notes)}</p>` : ''}
${q.status !== 'fixed' ? `<p style="margin:16px 0 0;padding:12px 14px;background:#fff7e6;border:1px solid #f5d9a8;border-radius:10px;font-size:13.5px">⚠️ ${q.status === 'range' ? 'Ada kebutuhan di luar katalog: harga ditampilkan sebagai rentang, konfirmasi lewat obrolan singkat.' : 'Melebihi batas harga otomatis: angka tidak ditampilkan ke klien, perlu diskusi langsung.'}</p>` : ''}
${h('Brief asli')}<p style="margin:0;font-size:14px;color:#33415e;background:#f7faff;border-radius:10px;padding:12px 14px">${nl2br(o.description)}</p>
${o.revision ? `${h('Permintaan revisi')}<p style="margin:0;font-size:14px;color:#33415e">${nl2br(o.revision)}</p>` : ''}
${h('Ringkasan')}<table>${row('Jenis', typeName)}${row('Ringkasan', esc(o.plan.summary))}${row('Target', esc(o.plan.audience))}${o.plan.business ? row('Bisnis', esc(o.plan.business)) : ''}</table>
${planHtml(o, 'id')}
${h('Rincian harga')}${priceTable(q, 'id')}
<p style="margin:20px 0 0;font-size:12.5px;color:#8a97b0">Lampiran: mockup homepage (buka file .html di browser) dan data konsultasi lengkap (.json).</p>
</div>`);

  await t.sendMail({ from, to: owner, replyTo: `"${c.name}" <${c.email}>`, subject: `[Skyland] Order baru ${id}: ${o.plan.projectName || typeName} (${totalText})`, html: ownerHtml, attachments });

  const en = o.locale === 'en';
  const pay = pricing.payment_terms;
  const clientHtml = box(`
<div style="background:#2459e0;color:#fff;padding:20px 24px"><div style="font-size:12px;letter-spacing:.1em;opacity:.8">${en ? 'YOUR QUOTE' : 'PENAWARAN ANDA'} · ${id}</div><div style="font-size:22px;font-weight:800;margin-top:4px">${en ? `Thanks, ${esc(c.name)}! We received your project.` : `Terima kasih, ${esc(c.name)}! Proyek Anda sudah kami terima.`}</div></div>
<div style="padding:8px 24px 24px">
<p style="font-size:14.5px;line-height:1.6;color:#33415e">${
    en
      ? `We'll review your plan and contact you on WhatsApp or email within 1 business day to confirm the details and next steps. Your price is valid for ${q.validDays} days.`
      : `Kami akan meninjau rencana Anda dan menghubungi Anda lewat WhatsApp atau email dalam 1 hari kerja untuk konfirmasi detail dan langkah selanjutnya. Harga ini berlaku ${q.validDays} hari.`
  }</p>
${planHtml(o, o.locale)}
${h(en ? 'Price breakdown' : 'Rincian harga')}${priceTable(q, o.locale)}
<p style="font-size:13px;color:#6a7894;line-height:1.6">${
    pay.down_payment_percent === 0
      ? en
        ? 'Payment: nothing upfront. You pay in full after you approve the finished website, before it goes live. Hosting, domain and third-party subscriptions are paid directly to those providers.'
        : 'Pembayaran: tanpa DP. Anda bayar penuh setelah menyetujui website yang sudah jadi, sebelum online. Hosting, domain, dan langganan pihak ketiga dibayar langsung ke penyedianya.'
      : en
        ? `Payment: ${pay.down_payment_percent}% to start, ${pay.final_payment_percent}% after you approve the finished website. Hosting, domain and third-party subscriptions are paid directly to those providers.`
        : `Pembayaran: ${pay.down_payment_percent}% di awal, ${pay.final_payment_percent}% setelah Anda menyetujui website yang sudah jadi. Hosting, domain, dan langganan pihak ketiga dibayar langsung ke penyedianya.`
  }</p>
<p style="font-size:13px;color:#6a7894">${en ? 'Your homepage mockup is attached. Open it in any browser.' : 'Mockup homepage Anda terlampir. Buka di browser mana saja.'}</p>
<p style="font-size:14px;margin-top:20px">— Muhammad Alfarizi Tazkia<br><span style="color:#6a7894">${SITE.name}</span></p>
</div>`);

  // The owner already has the order; a failed confirmation must not fail the request.
  await t.sendMail({
    from,
    to: `"${c.name}" <${c.email}>`,
    replyTo: owner,
    subject: en ? `Your Skyland quote ${id}: ${totalText}` : `Penawaran Skyland ${id}: ${totalText}`,
    html: clientHtml,
    attachments: [attachments[0]],
  }).catch((err) => console.error('Client confirmation email failed', err));
}
