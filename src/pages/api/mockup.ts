import type { APIRoute } from 'astro';
import { clientIp, errorResponse, json, rateLimit, readJson } from '../../lib/guard';
import { createMockup } from '../../lib/openai';
import { MockupRequestSchema } from '../../lib/schemas';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = MockupRequestSchema.parse(await readJson(request));
    rateLimit(`ai:${clientIp(request)}`, 12);
    return json({ mockup: await createMockup(body.locale, body.description, body.plan) });
  } catch (err) {
    return errorResponse(err);
  }
};
