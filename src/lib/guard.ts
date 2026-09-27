import { env } from './env';
// Cheap abuse protection for the AI endpoints (no database needed).
// The in-memory limiter is best effort: serverless instances don't share memory. Pair it with an
// OpenAI project spend limit and, ideally, a Vercel Firewall rate-limit rule on /api/*.

const MAX_BODY = 64 * 1024;
const WINDOW_MS = 60 * 60 * 1000;
const buckets = new Map<string, { count: number; reset: number }>();

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function clientIp(request: Request): string {
  return (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
}

export function rateLimit(key: string, limit: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return;
  }
  if (++b.count > limit) throw new HttpError(429, 'Too many requests. Please try again later.');
}

export async function readJson(request: Request): Promise<unknown> {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) throw new HttpError(403, 'Forbidden');
  const raw = await request.text();
  if (raw.length > MAX_BODY) throw new HttpError(413, 'Request too large');
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!secret) return;
  if (!token) throw new HttpError(400, 'Please complete the verification.');
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success: boolean };
  if (!data.success) throw new HttpError(400, 'Verification failed. Please refresh and try again.');
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  if (err && typeof err === 'object' && 'issues' in err) return json({ error: 'Invalid input', issues: (err as { issues: unknown }).issues }, 400);
  console.error(err);
  return json({ error: 'Something went wrong. Please try again.' }, 500);
}
