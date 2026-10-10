import { useEffect, useState } from 'preact/hooks';
import { marketFromClient, regionFor } from '../lib/pricing';
import type { Locale, Region } from '../lib/schemas';

/**
 * The visitor's price market — the only way an island is allowed to resolve one.
 *
 * Both islands used to work this out for themselves, and the concept page worked it out a third time
 * at build time for its headline price. Three rules with nothing linking them meant the same page could
 * show USD above and IDR below. One hook, one rule.
 *
 * It starts from the locale's market, which is what the prerendered HTML already contains, and settles
 * on the detected one in an effect. Resolving it before the first render is not an option: the island is
 * prerendered, so a "detecting…" state would be the static HTML and every visitor would watch the price
 * appear. Starting from the server value costs one extra paint for the few visitors who read a locale
 * that does not match where they are — everyone the language redirect sent to a matching locale sees
 * the final number immediately.
 */
export function useMarket(locale: Locale): Region {
  const [region, setRegion] = useState<Region>(() => regionFor(locale));
  useEffect(() => {
    const detected = marketFromClient(locale);
    setRegion((prev) => (detected === prev ? prev : detected));
  }, [locale]);
  return region;
}
