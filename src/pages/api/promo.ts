import type { APIRoute } from 'astro';
import { clientIp, errorResponse, json, rateLimit, readJson } from '../../lib/guard';
import { validatePromo } from '../../lib/promo';
import { PromoRequestSchema } from '../../lib/schemas';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = PromoRequestSchema.parse(await readJson(request));
    rateLimit(`promo:${clientIp(request)}`, 20); // cheap endpoint, but it must not become a code oracle
    const promo = validatePromo(body.code);
    return promo ? json({ ok: true, ...promo }) : json({ ok: false }, 200);
  } catch (err) {
    return errorResponse(err);
  }
};
