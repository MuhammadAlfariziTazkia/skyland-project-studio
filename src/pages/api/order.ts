import type { APIRoute } from 'astro';
import { clientIp, errorResponse, json, rateLimit, readJson, HttpError } from '../../lib/guard';
import { sendOrderEmails } from '../../lib/mail';
import { renderMockup } from '../../lib/mockup/render';
import { quote } from '../../lib/pricing';
import { quoteId } from '../../lib/quote-id';
import { OrderRequestSchema } from '../../lib/schemas';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = OrderRequestSchema.parse(await readJson(request));
    if (body.website) throw new HttpError(400, 'Invalid request');
    rateLimit(`order:${clientIp(request)}`, 5);
    // Never trust a client-side total: the price is recomputed from the plan and pricing.json.
    const q = quote(body.plan, body.choices, body.locale);
    const id = quoteId(body.plan, body.choices, q);
    const html = renderMockup(body.mockup, body.theme, { locale: body.locale, watermark: `Concept · ${id}` });
    await sendOrderEmails(body, q, id, html);
    return json({ ok: true, quoteId: id, total: q.total, currency: q.currency, status: q.status });
  } catch (err) {
    return errorResponse(err);
  }
};
