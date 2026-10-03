import { createHmac } from 'node:crypto';
import { env } from './env';
import type { Quote } from './pricing';
import type { Choices, Plan } from './schemas';

/** Short, verifiable quote reference: same plan + price → same ID, and it can't be forged without QUOTE_SECRET. */
export function quoteId(plan: Plan, choices: Choices, quote: Quote): string {
  const secret = env('QUOTE_SECRET') || 'dev-secret';
  const payload = JSON.stringify({ plan, choices, total: quote.total, status: quote.status });
  const digest = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 8).toUpperCase();
  return `SKY-${digest}`;
}
