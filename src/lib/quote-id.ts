import { createHmac } from 'node:crypto';
import { env } from './env';
import type { Quote } from './pricing';
import type { Plan } from './schemas';

/** Short, verifiable quote reference: same plan + price → same ID, and it can't be forged without QUOTE_SECRET. */
export function quoteId(plan: Plan, quote: Quote): string {
  const secret = env('QUOTE_SECRET') || 'dev-secret';
  const payload = JSON.stringify({ plan, currency: quote.currency, total: quote.total });
  const digest = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 8).toUpperCase();
  return `SKY-${digest}`;
}
