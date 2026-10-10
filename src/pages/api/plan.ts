import type { APIRoute } from 'astro';
import { clientIp, errorResponse, json, rateLimit, readJson, verifyTurnstile, HttpError } from '../../lib/guard';
import { createPlan, revisePlan } from '../../lib/openai';
import { PlanRequestSchema } from '../../lib/schemas';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = clientIp(request);
    const body = PlanRequestSchema.parse(await readJson(request));
    if (body.website) throw new HttpError(400, 'bad_request');
    rateLimit(`ai:${ip}`, 12);
    if (body.mode === 'create') {
      await verifyTurnstile(body.turnstileToken, ip);
      return json({ plan: await createPlan(body.locale, body.description, body.reference) });
    }
    return json(await revisePlan(body.locale, body.description, body.plan, body.instruction));
  } catch (err) {
    return errorResponse(err);
  }
};
