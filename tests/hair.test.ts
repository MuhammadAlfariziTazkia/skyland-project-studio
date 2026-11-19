import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HAIR_PROFILE, HAIR_STYLE_IDS, analyzeHair, decodePhoto, hairEnabled, normalizeAnalysis, tryOnHair, tryOnPrompt } from '../src/lib/hair';
import { POST as analyzePost } from '../src/pages/api/hair/analyze';

// The Kurohane AI trial. No test talks to OpenAI: fetch is replaced, so these cost nothing.
const demoData = readFileSync('public/samples/kurohane/kurohane-data.js', 'utf8');
const jpeg = (bytes = 4000) => `data:image/jpeg;base64,${Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(bytes)]).toString('base64')}`;
const ENV = ['OPENAI_API_KEY', 'KUROHANE_AI', 'OPENAI_VISION_MODEL', 'OPENAI_IMAGE_MODEL', 'OPENAI_IMAGE_QUALITY'] as const;
let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  for (const k of ENV) delete process.env[k];
  process.env.OPENAI_API_KEY = 'sk-test';
});
afterEach(() => {
  for (const k of ENV) (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]));
  vi.unstubAllGlobals();
});

describe('the server catalog matches the demo', () => {
  it('offers exactly the styles the demo can show', () => {
    const demoIds = [...demoData.matchAll(/\{ id: '(\w+)', no: '\d+'/g)].map((m) => m[1]);
    expect(demoIds.length).toBe(11);
    expect([...HAIR_STYLE_IDS].sort()).toEqual(demoIds.sort());
  });

  it('uses the same profile values as the demo chips', () => {
    for (const [dim, values] of Object.entries(HAIR_PROFILE)) {
      const line = new RegExp(`\\{ id: '${dim}', name: '[^']+', opts: \\[(.+?)\\] \\}`).exec(demoData);
      expect(line, dim).toBeTruthy();
      const ids = [...line![1].matchAll(/\['(\w+)'/g)].map((m) => m[1]);
      expect([...values].sort(), dim).toEqual(ids.sort());
    }
  });
});

describe('photo input', () => {
  it('accepts a JPEG data URL and refuses anything else', () => {
    expect(decodePhoto(jpeg()).length).toBeGreaterThan(1000);
    expect(() => decodePhoto('data:image/png;base64,AAAA')).toThrow('photo_invalid');
    const png = `data:image/jpeg;base64,${Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(4000)]).toString('base64')}`;
    expect(() => decodePhoto(png)).toThrow('photo_invalid');
    expect(() => decodePhoto(jpeg(1_300_000))).toThrow('too_large');
  });
});

describe('analysis', () => {
  it('keeps three distinct known styles, best first, with clamped scores', () => {
    const a = normalizeAnalysis({
      faceFound: true,
      profile: { face: 'round', head: 'weird', texture: 'wavy', density: 'thin' },
      picks: [
        { styleId: 'crop', score: 80, reason: 'a' },
        { styleId: 'crop', score: 99, reason: 'dup' },
        { styleId: 'mullet', score: 90, reason: 'not on the menu' },
        { styleId: 'mash', score: 120, reason: 'b' },
        { styleId: 'taper', score: 10, reason: 'c' },
      ],
    });
    expect(a.picks.map((p) => p.styleId)).toEqual(['mash', 'crop', 'taper']);
    expect(a.picks.map((p) => p.score)).toEqual([97, 80, 50]);
    expect(a.profile).toEqual({ face: 'round', head: 'round', texture: 'wavy', density: 'thin' });
  });

  it('refuses a result with fewer than three usable styles', () => {
    expect(() => normalizeAnalysis({ faceFound: true, profile: {}, picks: [{ styleId: 'crop', score: 80, reason: '' }] })).toThrow('ai_truncated');
  });

  it('sends the photo to the cheap vision model at low detail', async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.model).toBe('gpt-6-luna');
      expect(body.reasoning_effort).toBeUndefined();
      const part = body.messages[1].content[1];
      expect(part).toEqual({ type: 'image_url', image_url: { url: expect.stringMatching(/^data:image\/jpeg;base64,/), detail: 'low' } });
      const content = JSON.stringify({ faceFound: true, profile: { face: 'oval', head: 'round', texture: 'straight', density: 'normal' }, picks: [
        { styleId: 'natural', score: 90, reason: '扱いやすい' }, { styleId: 'business7', score: 85, reason: '品がある' }, { styleId: 'taper', score: 80, reason: '清潔感' }] });
      return new Response(JSON.stringify({ choices: [{ message: { content }, finish_reason: 'stop' }] }));
    });
    vi.stubGlobal('fetch', fetch);
    const a = await analyzeHair(jpeg());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions');
    expect(a.picks).toHaveLength(3);
  });
});

describe('try-on', () => {
  it('asks for one low-quality edit in the demo frame, changing only the hair', async () => {
    const fetch = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('https://api.openai.com/v1/images/edits');
      const form = init.body as FormData;
      expect(form.get('model')).toBe('gpt-image-2.6-flare');
      expect(form.get('size')).toBe('768x1024');
      expect(form.get('quality')).toBe('low');
      expect(form.get('output_format')).toBe('jpeg');
      expect(String(form.get('prompt'))).toContain('Change ONLY the hairstyle');
      expect(form.get('image[]')).toBeInstanceOf(Blob);
      expect(String(form.get('safety_identifier'))).toBe('visitor-hash');
      return new Response(JSON.stringify({ data: [{ b64_json: 'QUJD' }], usage: { input_tokens: 1600, output_tokens: 400 } }));
    });
    vi.stubGlobal('fetch', fetch);
    expect(await tryOnHair(jpeg(), 'crop', 'visitor-hash')).toBe('data:image/jpeg;base64,QUJD');
  });

  it('lets env pick a different model and quality', async () => {
    process.env.OPENAI_IMAGE_MODEL = 'gpt-image-2.5-flare';
    process.env.OPENAI_IMAGE_QUALITY = 'medium';
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: RequestInit) => {
      const form = init.body as FormData;
      expect([form.get('model'), form.get('quality')]).toEqual(['gpt-image-2.5-flare', 'medium']);
      return new Response(JSON.stringify({ data: [{ b64_json: 'QQ==' }] }));
    }));
    await tryOnHair(jpeg(), 'buzz', 'v');
  });

  it('turns OpenAI refusals into short codes the demo can explain', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 'moderation_blocked' } }), { status: 400 })));
    await expect(tryOnHair(jpeg(), 'crop', 'v')).rejects.toThrow('ai_moderated');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 429 })));
    await expect(tryOnHair(jpeg(), 'crop', 'v')).rejects.toThrow('ai_rate_limited');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":{"message":"organization must be verified"}}', { status: 403 })));
    await expect(tryOnHair(jpeg(), 'crop', 'v')).rejects.toThrow('ai_image_unavailable');
  });

  it('describes every style in the prompt', () => {
    for (const id of HAIR_STYLE_IDS) expect(tryOnPrompt(id).length, id).toBeGreaterThan(200);
  });
});

describe('switch', () => {
  it('is off unless KUROHANE_AI=1 and a key is set', async () => {
    expect(hairEnabled()).toBe(false);
    process.env.KUROHANE_AI = '1';
    expect(hairEnabled()).toBe(true);
    delete process.env.OPENAI_API_KEY;
    expect(hairEnabled()).toBe(false);
  });

  it('answers 404 from the endpoint while off, without calling OpenAI', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const res = await analyzePost({ request: new Request('http://x/api/hair/analyze', { method: 'POST', body: JSON.stringify({ image: jpeg() }) }) } as never);
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
});
