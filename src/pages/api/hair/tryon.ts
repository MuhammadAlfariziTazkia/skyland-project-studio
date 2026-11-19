import type { APIRoute } from 'astro';
import { HttpError, clientIp, errorResponse, json, rateLimit, readJson } from '../../../lib/guard';
import { PHOTO_BODY_LIMIT, TryOnRequestSchema, hairEnabled, safetyId, tryOnHair } from '../../../lib/hair';

export const prerender = false;

/** One restyled photo per request, so the three cards fill in as each image is ready. */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (!hairEnabled()) throw new HttpError(404, 'ai_off');
    const body = TryOnRequestSchema.parse(await readJson(request, PHOTO_BODY_LIMIT));
    const ip = clientIp(request);
    rateLimit(`hair-tryon:${ip}`, 18);
    return json({ styleId: body.styleId, image: await tryOnHair(body.image, body.styleId, safetyId(ip)) });
  } catch (err) {
    return errorResponse(err);
  }
};
