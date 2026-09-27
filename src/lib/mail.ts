import nodemailer from 'nodemailer';
import { env } from './env';
import pricing from '../../data/pricing.json';
import { SITE } from '../config/site';
import { formatPrice, type Quote } from './pricing';
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
  const L = lang === 'id' ? { inc: 'termasuk', sub: 'Subtotal', disc: 'Diskon klien pertama', total: 'Total harga pasti', est: 'Estimasi (perlu konfirmasi)' } : { inc: 'included', sub: 'Subtotal', disc: 'Founding client discount', total: 'Fixed total', est: 'Estimate (needs confirmation)' };
  const lines = q.lines
    .map(
      (l) =>
        `<tr><td style="padding:7px 0;border-bottom:1px solid #edf1f8;font-size:13.5px">${esc(l.label)}${l.quantity > 1 ? ` × ${l.quantity}` : ''}${l.detail ? `<br><span style="color:#8a97b0;font-size:12px">${esc(l.detail)}</span>` : ''}</td><td style="padding:7px 0;border-bottom:1px solid #edf1f8;text-align:right;font-size:13.5px;white-space:nowrap">${l.included ? `<span style="color:#16a36a">${L.inc}</span>` : formatPrice(l.amount, q.currency)}</td></tr>`,
    )
    .join('');
  const total = q.needsReview && q.estimateRange ? `${formatPrice(q.estimateRange[0], q.currency)} – ${formatPrice(q.estimateRange[1], q.currency)}` : formatPrice(q.total, q.currency);
  return `<table style="width:100%;border-collapse:collapse">${lines}
<tr><td style="padding:8px 0;font-size:13.5px">${L.sub}</td><td style="text-align:right;font-size:13.5px">${formatPrice(q.subtotal, q.currency)}</td></tr>
${q.discount ? `<tr><td style="padding:4px 0;font-size:13.5px;color:#16a36a">${L.disc} (${q.discountPercent}%)</td><td style="text-align:right;font-size:13.5px;color:#16a36a">−${formatPrice(q.discount, q.currency)}</td></tr>` : ''}
<tr><td style="padding:10px 0;font-size:16px;font-weight:800">${q.needsReview ? L.est : L.total}</td><td style="text-align:right;font-size:18px;font-weight:800">${total}</td></tr></table>`;
}

function planHtml(o: OrderRequest, lang: 'en' | 'id') {
  const p = o.plan;
  const L = lang === 'id' ? { pages: 'Halaman', feats: 'Fitur', custom: 'Fitur custom', ass: 'Asumsi', qs: 'Pertanyaan terbuka' } : { pages: 'Pages', feats: 'Features', custom: 'Custom features', ass: 'Assumptions', qs: 'Open questions' };
  const feats = pricing.features as Record<string, { name: { en: string; id: string } }>;
  return `${h(L.pages)}<ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${p.pages
    .map((pg) => `<li style="margin-bottom:6px"><b>${esc(pg.name)}</b> <span style="color:#8a97b0">(${pg.complexity})</span><br><span style="color:#4a5876">${esc(pg.purpose)}</span>${pg.sections.length ? `<br><span style="color:#6a7894;font-size:13px">${pg.sections.map(esc).join(' · ')}</span>` : ''}</li>`)
    .join('')}</ol>
${h(L.feats)}<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${p.features.map((f) => `<li><b>${esc(feats[f.id]?.name[lang] ?? f.id)}</b>${f.quantity > 1 ? ` × ${f.quantity}` : ''}${f.reason ? ` <span style="color:#6a7894">– ${esc(f.reason)}</span>` : ''}</li>`).join('')}</ul>
${p.customFeatures.length ? `${h(L.custom)}<ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.55">${p.customFeatures.map((c) => `<li><b>${esc(c.name)}</b> [${c.tier}] – ${esc(c.description)}</li>`).join('')}</ul>` : ''}
${p.assumptions.length ? `${h(L.ass)}<ul style="margin:0;padding-left:20px;font-size:13.5px;color:#4a5876">${p.assumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
${p.questions.length ? `${h(L.qs)}<ul style="margin:0;padding-left:20px;font-size:13.5px;color:#4a5876">${p.questions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`;
}

export async function sendOrderEmails(o: OrderRequest, q: Quote, id: string, mockupHtml: string) {
  if (import.meta.env.DEV && !env('GMAIL_APP_PASSWORD')) {
    console.log(`[dev] Gmail not configured, skipping emails for ${id} (${q.currency} ${q.total}) to ${o.contact.email}`);
    return;
  }
  const t = transport();
  const owner = env('OWNER_EMAIL') || env('GMAIL_USER');
  const from = `"${SITE.name}" <${env('GMAIL_USER')}>`;
  const c = o.contact;
  const waNum = c.whatsapp.replace(/\D/g, '').replace(/^0/, '62');
  const typeName = pricing.projectTypes[o.plan.projectType as keyof typeof pricing.projectTypes].name;
  const totalText = q.needsReview && q.estimateRange ? `${formatPrice(q.estimateRange[0], q.currency)}–${formatPrice(q.estimateRange[1], q.currency)}` : formatPrice(q.total, q.currency);
  const attachments = [
    { filename: `mockup-${id}.html`, content: mockupHtml, contentType: 'text/html' },
    { filename: `consultation-${id}.json`, content: JSON.stringify({ quoteId: id, createdAt: new Date().toISOString(), ...o, quote: q }, null, 2), contentType: 'application/json' },
  ];

  const ownerHtml = box(`
<div style="background:#2459e0;color:#fff;padding:20px 24px"><div style="font-size:12px;letter-spacing:.1em;opacity:.8">ORDER BARU · ${id}</div><div style="font-size:22px;font-weight:800;margin-top:4px">${esc(o.plan.projectName || typeName.id)} — ${totalText}</div></div>
<div style="padding:8px 24px 24px">
${h('Kontak klien')}<table>${row('Nama', esc(c.name))}${c.company ? row('Perusahaan', esc(c.company)) : ''}${row('Email', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`)}${row('WhatsApp', `<a href="https://wa.me/${waNum}?text=${encodeURIComponent(`Halo ${c.name}, saya Alfarizi dari Skyland. Terima kasih sudah memesan (${id}).`)}">${esc(c.whatsapp)}</a>`)}${row('Bahasa / mata uang', `${o.locale.toUpperCase()} / ${q.currency}`)}${row('Tema', THEMES[o.theme].name.id)}${row('Estimasi waktu', `${q.timelineWeeks[0]}–${q.timelineWeeks[1]} minggu`)}</table>
${c.notes ? `${h('Catatan klien')}<p style="margin:0;font-size:14px;color:#33415e">${nl2br(c.notes)}</p>` : ''}
${q.needsReview ? `<p style="margin:16px 0 0;padding:12px 14px;background:#fff7e6;border:1px solid #f5d9a8;border-radius:10px;font-size:13.5px">⚠️ Scope besar / fitur custom L: harga ditampilkan sebagai estimasi, konfirmasi lewat call singkat.</p>` : ''}
${h('Brief asli')}<p style="margin:0;font-size:14px;color:#33415e;background:#f7faff;border-radius:10px;padding:12px 14px">${nl2br(o.description)}</p>
${o.revision ? `${h('Permintaan revisi')}<p style="margin:0;font-size:14px;color:#33415e">${nl2br(o.revision)}</p>` : ''}
${h('Ringkasan')}<table>${row('Jenis', typeName.id)}${row('Ringkasan', esc(o.plan.summary))}${row('Target', esc(o.plan.audience))}${o.plan.goals.length ? row('Tujuan', o.plan.goals.map(esc).join('<br>')) : ''}</table>
${planHtml(o, 'id')}
${h('Rincian harga')}${priceTable(q, 'id')}
<p style="margin:20px 0 0;font-size:12.5px;color:#8a97b0">Lampiran: mockup homepage (buka file .html di browser) dan data konsultasi lengkap (.json).</p>
</div>`);

  await t.sendMail({ from, to: owner, replyTo: `"${c.name}" <${c.email}>`, subject: `[Skyland] Order baru ${id}: ${o.plan.projectName || typeName.id} (${totalText})`, html: ownerHtml, attachments });

  const en = o.locale === 'en';
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
<p style="font-size:13px;color:#6a7894;line-height:1.6">${en ? `Payment: ${pricing.meta.paymentTerms.downPaymentPercent}% to start, ${pricing.meta.paymentTerms.finalPaymentPercent}% after you approve the finished website. Domain, paid hosting and third-party subscriptions are not included.` : `Pembayaran: ${pricing.meta.paymentTerms.downPaymentPercent}% di awal, ${pricing.meta.paymentTerms.finalPaymentPercent}% setelah Anda menyetujui website yang sudah jadi. Domain, hosting berbayar, dan langganan pihak ketiga belum termasuk.`}</p>
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
