// Kurohane AI hairstyle match, for real: a cheap vision model reads the visitor's photo and picks three
// of the shop's styles, then an image model restyles the visitor's own photo once per pick.
// Server-only (imports env). Trial feature: off unless KUROHANE_AI=1, see hairEnabled().
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { env } from './env';
import { HttpError } from './guard';
import { chatJson } from './openai';

/** The shop's style list. Ids match public/samples/kurohane/kurohane-data.js (tests/hair.test.ts checks). */
export const HAIR_STYLES = [
  { id: 'skinfade', name: 'スキンフェード', prompt: 'a skin fade: sides and back faded down to bare skin, a few centimetres of textured length left on top, swept up and back' },
  { id: 'natural', name: 'ナチュラルショート', prompt: 'a natural short cut: an even short length all over, a soft short fringe and a tidy neckline' },
  { id: 'twist', name: 'ツイストパーマ', prompt: 'a twist perm: short tapered sides with twisted, coiled curls on top and plenty of volume' },
  { id: 'business7', name: '七三ビジネス', prompt: 'a classic 7:3 side part: short neat sides, a clean side parting, the top combed to one side with a slight lift' },
  { id: 'crop', name: 'クロップ', prompt: 'a textured French crop: a high fade on the sides, a short straight-cut fringe and choppy texture on top' },
  { id: 'wave', name: '波巻きパーマ', prompt: 'a wave perm: soft loose waves through medium-length hair, a rounded silhouette and a fringe falling onto the forehead' },
  { id: 'taper', name: 'テーパーフェード', prompt: 'a taper fade: only the sideburns and neckline faded short, the rest short and neat, the top swept back' },
  { id: 'centre', name: 'センターパート', prompt: 'a centre part: medium-length hair parted in the middle with a curtain fringe falling to both sides' },
  { id: 'mash', name: 'ソフトマッシュ', prompt: 'a soft mash (Japanese mushroom cut): a rounded silhouette with a full fringe covering the forehead and light texture' },
  { id: 'buzz', name: 'バズカット', prompt: 'a buzz cut: clipped very short, about 6 mm, evenly all over the head' },
  { id: 'softmohawk', name: 'ソフトモヒカン', prompt: 'a soft mohawk: short faded sides with the top pushed up into a textured ridge along the centre' },
] as const;
export type HairStyleId = (typeof HAIR_STYLES)[number]['id'];
export const HAIR_STYLE_IDS = HAIR_STYLES.map((s) => s.id) as [HairStyleId, ...HairStyleId[]];

/** Same dimensions and values as KH.profileDims in the demo, so the result chips read the AI's answer. */
export const HAIR_PROFILE = {
  face: ['oval', 'round', 'long', 'square', 'heart'],
  head: ['round', 'flat', 'wide'],
  texture: ['straight', 'wavy', 'curly'],
  density: ['normal', 'thick', 'thin'],
} as const;

export const hairEnabled = () => env('KUROHANE_AI') === '1' && !!env('OPENAI_API_KEY');

// ---------- input ----------
/** The demo sends the aligned 768×1024 frame as a JPEG data URL; ~150 KB in practice. */
export const MAX_PHOTO_BYTES = 1_200_000;
export const PHOTO_BODY_LIMIT = 1_700_000;

export function decodePhoto(dataUrl: string): Buffer {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!m) throw new HttpError(400, 'photo_invalid');
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > MAX_PHOTO_BYTES) throw new HttpError(413, 'too_large');
  // JPEG magic bytes: a renamed PNG, or anything else, is refused before it costs a model call.
  if (buf.length < 1000 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) throw new HttpError(400, 'photo_invalid');
  return buf;
}

export const AnalyzeRequestSchema = z.object({ image: z.string().max(PHOTO_BODY_LIMIT) });
export const TryOnRequestSchema = z.object({ image: z.string().max(PHOTO_BODY_LIMIT), styleId: z.enum(HAIR_STYLE_IDS) });

// ---------- analysis (vision model) ----------
const str = { type: 'string' } as const;
const en = (values: readonly string[]) => ({ type: 'string', enum: [...values] });
const obj = (properties: Record<string, unknown>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const ANALYSIS_SCHEMA = obj({
  faceFound: { type: 'boolean' },
  profile: obj({ face: en(HAIR_PROFILE.face), head: en(HAIR_PROFILE.head), texture: en(HAIR_PROFILE.texture), density: en(HAIR_PROFILE.density) }),
  picks: { type: 'array', items: obj({ styleId: en(HAIR_STYLE_IDS), score: { type: 'integer' }, reason: str }) },
});

// Static, so automatic prompt caching can reuse it; the photo travels in the user message.
const ANALYSIS_SYSTEM = `You are the consultation assistant of KUROHANE, a Japanese barber studio.
Look at the customer's front-facing photo and judge, from what is visible:
- face: oval | round | long | square | heart
- head: round | flat (flat back of head) | wide (wide at the temples)
- texture: straight | wavy | curly
- density: normal | thick | thin
Then pick exactly 3 different styles from the studio's menu below that suit this person best, best first.
For each pick give score (an integer 70-97, the best pick highest) and reason: one sentence in natural Japanese,
at most 60 characters, saying why it suits their face shape, head shape or hair, concretely.

Menu (id: description):
${HAIR_STYLES.map((s) => `- ${s.id}: ${s.name} — ${s.prompt}`).join('\n')}

If there is no clearly visible human face, set faceFound to false and still fill the other fields with your best guess.
Never comment on attractiveness, age, ethnicity or anything other than hair and head shape.`;

export interface HairPick {
  styleId: HairStyleId;
  score: number;
  reason: string;
}
export interface HairAnalysis {
  faceFound: boolean;
  profile: { face: string; head: string; texture: string; density: string };
  picks: HairPick[];
}

/** Keeps exactly three distinct known styles with sane scores, whatever the model returned. */
export function normalizeAnalysis(raw: unknown): HairAnalysis {
  const r = raw as Partial<HairAnalysis>;
  const known = new Set<string>(HAIR_STYLE_IDS);
  const seen = new Set<string>();
  const picks: HairPick[] = [];
  for (const p of r.picks ?? []) {
    if (!p || !known.has(p.styleId) || seen.has(p.styleId)) continue;
    seen.add(p.styleId);
    picks.push({ styleId: p.styleId, score: Math.max(50, Math.min(97, Math.round(Number(p.score) || 70))), reason: String(p.reason ?? '').trim().slice(0, 80) });
    if (picks.length === 3) break;
  }
  if (picks.length < 3) throw new HttpError(502, 'ai_truncated');
  picks.sort((a, b) => b.score - a.score);
  const pf = (r.profile ?? {}) as HairAnalysis['profile'];
  const pick = <K extends keyof typeof HAIR_PROFILE>(k: K) => ((HAIR_PROFILE[k] as readonly string[]).includes(pf[k]) ? pf[k] : HAIR_PROFILE[k][0]);
  return { faceFound: r.faceFound !== false, profile: { face: pick('face'), head: pick('head'), texture: pick('texture'), density: pick('density') }, picks };
}

export async function analyzeHair(photo: string): Promise<HairAnalysis> {
  decodePhoto(photo);
  const raw = await chatJson(
    'hair_analysis',
    ANALYSIS_SCHEMA,
    [
      { role: 'system', content: ANALYSIS_SYSTEM },
      { role: 'user', content: [{ type: 'text', text: 'Customer photo:' }, { type: 'image_url', image_url: { url: photo, detail: 'low' } }] },
    ],
    800,
    'light',
    env('OPENAI_VISION_MODEL') || 'gpt-6-luna',
  );
  return normalizeAnalysis(raw);
}

// ---------- try-on (image model) ----------
export function tryOnPrompt(styleId: HairStyleId): string {
  const style = HAIR_STYLES.find((s) => s.id === styleId)!;
  return `Edit this photo of a real customer at a barbershop consultation. Change ONLY the hairstyle, to ${style.prompt}.
Keep the same person: identical face, facial features, skin tone, expression, eyebrows, ears, facial hair, glasses, clothing, background, lighting, framing, camera angle, and the exact head position and tilt.
Keep their natural hair colour. The result must look like a real, unretouched photo taken right after the haircut. No text, no watermark, no other people.`;
}

/** A stable, non-reversible id per visitor for OpenAI's abuse monitoring, as their docs recommend. */
export const safetyId = (ip: string) => createHash('sha256').update(`kurohane:${ip}:${env('QUOTE_SECRET')}`).digest('hex').slice(0, 32);

export async function tryOnHair(photo: string, styleId: HairStyleId, visitor: string): Promise<string> {
  const key = env('OPENAI_API_KEY');
  if (!key) throw new HttpError(503, 'ai_unconfigured');
  const jpeg = decodePhoto(photo);
  const model = env('OPENAI_IMAGE_MODEL') || 'gpt-image-2.6-flare';
  const form = new FormData();
  form.set('model', model);
  form.append('image[]', new Blob([new Uint8Array(jpeg)], { type: 'image/jpeg' }), 'photo.jpg');
  form.set('prompt', tryOnPrompt(styleId));
  form.set('size', '768x1024'); // the demo's frame: before and after stay aligned under the same oval
  form.set('quality', env('OPENAI_IMAGE_QUALITY') || 'low');
  form.set('output_format', 'jpeg');
  form.set('output_compression', '82');
  form.set('n', '1');
  form.set('safety_identifier', visitor);

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(57_000),
    });
  } catch {
    throw new HttpError(504, 'ai_timeout');
  }
  if (!res.ok) {
    const text = await res.text();
    console.error('OpenAI image error', res.status, text.slice(0, 600));
    let code = '';
    try {
      code = (JSON.parse(text) as { error?: { code?: string } }).error?.code ?? '';
    } catch {
      /* not JSON */
    }
    if (code === 'moderation_blocked') throw new HttpError(422, 'ai_moderated');
    if (res.status === 429) throw new HttpError(429, 'ai_rate_limited');
    if (res.status === 401 || res.status === 403) throw new HttpError(503, 'ai_image_unavailable');
    throw new HttpError(502, 'ai_busy');
  }
  const data = (await res.json()) as { data?: { b64_json?: string }[]; usage?: { input_tokens?: number; output_tokens?: number; input_tokens_details?: { image_tokens?: number; text_tokens?: number } } };
  const u = data.usage;
  if (u) console.info(`[openai] hair_tryon ${styleId}: in ${u.input_tokens} (image ${u.input_tokens_details?.image_tokens ?? '?'}, text ${u.input_tokens_details?.text_tokens ?? '?'}), out ${u.output_tokens}`);
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new HttpError(502, 'ai_truncated');
  return `data:image/jpeg;base64,${b64}`;
}
