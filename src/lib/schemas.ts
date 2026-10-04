import { z } from 'zod';
import pricing from '../../data/pricing.json';

export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];
export const CURRENCIES = ['IDR', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const REGIONS = ['ID', 'GLOBAL'] as const;
export type Region = (typeof REGIONS)[number];
export const SERVICE_IDS = pricing.services.map((s) => s.id) as [string, ...string[]];
export const FEATURE_IDS = pricing.features.map((f) => f.id) as [string, ...string[]];
const ids = (list: { id: string }[]) => list.map((o) => o.id) as [string, ...string[]];
export const DESIGN_IDS = ids(pricing.multipliers.design_level);
export const CONTENT_IDS = ids(pricing.multipliers.content_readiness);
export const TIMELINE_IDS = ids(pricing.multipliers.timeline);
export const THEME_IDS = ['minimal', 'elegant', 'futuristic', 'vibrant'] as const;
export type ThemeId = (typeof THEME_IDS)[number];
// Public pages plus member/admin screens.
export const MAX_PAGES = 24;

// Strings and lists are clipped rather than rejected, so slightly verbose AI output still validates.
const text = (max: number) => z.string().trim().transform((s) => s.slice(0, max));
const list = <T extends z.ZodTypeAny>(item: T, max: number) => z.array(item).transform((a) => a.slice(0, max));
const featureId = z.enum(FEATURE_IDS);

export const PAGE_AREAS = ['public', 'member', 'admin'] as const;
export type PageArea = (typeof PAGE_AREAS)[number];
export const FLOW_ACTORS = ['visitor', 'member', 'owner'] as const;

// One thing someone must be able to do on the site ("visitor: browse books by genre"). The AI lists these
// first, then derives features and pages from them, so nothing the business needs is forgotten.
export const FlowSchema = z.object({ who: z.enum(FLOW_ACTORS).catch('visitor'), does: z.string().trim().min(1).transform((s) => s.slice(0, 120)) });

// area: public pages are priced (extra pages, copywriting); member/admin screens come with the feature
// named in `feature` and add no page cost. Defaults keep plans saved before these fields valid.
export const PageSchema = z.object({
  name: z.string().trim().min(1).transform((s) => s.slice(0, 60)),
  area: z.enum(PAGE_AREAS).catch('public').default('public'),
  feature: z.string().trim().max(40).catch('').default(''),
  covers: list(z.number().int().min(0).max(30), 12).catch([]).default([]),
  purpose: text(240),
  sections: list(text(120), 10),
});

export const MAX_QUANTITY = 10;
// quantity only matters for features with unit "item" (e.g. extra languages, connected services).
export const FeatureSchema = z.object({ id: featureId, reason: text(240), quantity: z.number().int().min(1).max(MAX_QUANTITY).catch(1).default(1) });
export const CustomRequestSchema = z.object({ name: z.string().trim().min(1).transform((s) => s.slice(0, 80)), description: text(300) });
export const QuestionSchema = z.object({
  question: text(200),
  options: list(z.object({ label: text(60), add: list(featureId, 4), remove: list(featureId, 4) }), 3),
});

// `features` are switched on; `suggestions` are optional extras shown switched off (the client moves items between them).
export const PlanSchema = z.object({
  serviceId: z.enum(SERVICE_IDS),
  projectName: text(80),
  summary: text(600),
  audience: text(300),
  business: text(240).catch('').default(''),
  flows: list(FlowSchema, 12).catch([]).default([]),
  pages: z.array(PageSchema).min(1).transform((a) => a.slice(0, MAX_PAGES)),
  features: list(FeatureSchema, FEATURE_IDS.length),
  suggestions: list(FeatureSchema, FEATURE_IDS.length),
  customRequests: list(CustomRequestSchema, 3),
  questions: list(QuestionSchema, 2),
  assumptions: list(text(240), 6),
});
export type Plan = z.output<typeof PlanSchema>;

/** The price multipliers and region are chosen by the client in the UI, never guessed by the AI. */
export const ChoicesSchema = z.object({
  region: z.enum(REGIONS),
  design: z.enum(DESIGN_IDS),
  content: z.enum(CONTENT_IDS),
  timeline: z.enum(TIMELINE_IDS),
  // Only the code travels. Its discount is always looked up server-side (src/lib/promo.ts).
  promoCode: z.string().trim().max(32).optional().default(''),
});
export type Choices = z.infer<typeof ChoicesSchema>;

export const PromoRequestSchema = z.object({ code: z.string().trim().min(1).max(32) });

const hex = z.string().transform((s) => (/^#[0-9a-fA-F]{6}$/.test(s.trim()) ? s.trim() : '#2563eb'));

export const MockupSchema = z.object({
  brandName: z.string().trim().min(1).transform((s) => s.slice(0, 40)),
  nav: list(text(24), 5),
  accent: hex,
  hero: z.object({
    eyebrow: text(60),
    headline: text(90),
    subheadline: text(220),
    primaryCta: text(30),
    secondaryCta: text(30),
    icon: text(8),
  }),
  highlights: list(z.object({ icon: text(8), title: text(50), text: text(140) }), 3),
  sections: list(
    z.object({
      kind: z.enum(['cards', 'split', 'steps', 'stats', 'quote', 'cta']),
      eyebrow: text(40),
      title: text(90),
      text: text(260),
      items: list(z.object({ icon: text(8), title: text(60), text: text(160) }), 6),
    }),
    4,
  ),
  footerNote: text(120),
});
export type Mockup = z.output<typeof MockupSchema>;

export const PlanRequestSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('create'),
    locale: z.enum(LOCALES),
    description: z.string().trim().min(20).max(1500),
    reference: text(200).optional().default(''),
    website: z.string().max(0).optional(), // honeypot
    turnstileToken: z.string().max(2048).optional(),
  }),
  z.object({
    mode: z.literal('revise'),
    locale: z.enum(LOCALES),
    description: text(1500),
    plan: PlanSchema,
    instruction: z.string().trim().min(3).max(800),
    website: z.string().max(0).optional(),
    turnstileToken: z.string().max(2048).optional(),
  }),
]);

export const MockupRequestSchema = z.object({
  locale: z.enum(LOCALES),
  plan: PlanSchema,
  theme: z.enum(THEME_IDS),
  description: text(1500),
});

export const ContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{8,20}$/),
  company: text(100).optional().default(''),
  notes: text(1000).optional().default(''),
  consent: z.literal(true),
});
export type Contact = z.infer<typeof ContactSchema>;

export const OrderRequestSchema = z.object({
  locale: z.enum(LOCALES),
  choices: ChoicesSchema,
  description: text(1500),
  revision: text(800).optional().default(''),
  plan: PlanSchema,
  theme: z.enum(THEME_IDS),
  mockup: MockupSchema,
  contact: ContactSchema,
  website: z.string().max(0).optional(),
});
export type OrderRequest = z.infer<typeof OrderRequestSchema>;
