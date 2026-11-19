import type { APIRoute } from 'astro';
import { json } from '../../../lib/guard';
import { hairEnabled } from '../../../lib/hair';

export const prerender = false;

/** Whether the Kurohane demo may use the real AI. When off, the demo keeps its in-browser simulation. */
export const GET: APIRoute = () => json({ enabled: hairEnabled() });
