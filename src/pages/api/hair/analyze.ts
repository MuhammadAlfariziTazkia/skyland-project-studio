import type { APIRoute } from 'astro';
import { HttpError, clientIp, errorResponse, json, rateLimit, readJson } from '../../../lib/guard';
import { AnalyzeRequestSchema, PHOTO_BODY_LIMIT, analyzeHair, hairEnabled } from '../../../lib/hair';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!hairEnabled()) throw new HttpError(404, 'ai_off');
    const body = AnalyzeRequestSchema.parse(await readJson(request, PHOTO_BODY_LIMIT));
    rateLimit(`hair-analyze:${clientIp(request)}`, 6);
    return json(await analyzeHair(body.image));
  } catch (err) {
    return errorResponse(err);
  }
};
