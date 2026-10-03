// Promo codes live in the PROMO_CODES env var, never in data/pricing.json or the repo:
// pricing.json is bundled into the browser island and the repo is public, so a code stored there
// would be trivial to find. This module is imported only by API routes, so it stays server-side.
// Format: "KENALANCEO=20" or several, comma separated: "KENALANCEO=20,TEMANLAMA=10".
import { env } from './env';
import { PRICING, type Promo } from './pricing';

export type { Promo };

const normalize = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

function table(): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of env('PROMO_CODES').split(',')) {
    const [rawCode, rawPercent] = entry.split('=');
    const code = normalize(rawCode ?? '');
    const percent = Number(rawPercent);
    if (!code || !Number.isFinite(percent) || percent <= 0) continue;
    map.set(code, Math.min(percent, PRICING.max_discount_percent));
  }
  return map;
}

/** The promo for this code, or null when it is unknown, misspelled or no codes are configured. */
export function validatePromo(code: string | undefined | null): Promo | null {
  if (!code) return null;
  const key = normalize(code);
  const percent = table().get(key);
  return percent === undefined ? null : { code: key, percent };
}
