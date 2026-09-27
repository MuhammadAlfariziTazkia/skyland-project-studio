import { z } from 'zod';
import pricing from '../../data/pricing.json';

export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];
export const CURRENCIES = ['IDR', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PROJECT_TYPES = Object.keys(pricing.projectTypes) as [string, ...string[]];
export const FEATURE_IDS = Object.keys(pricing.features) as [string, ...string[]];
export const THEME_IDS = ['minimal', 'elegant', 'futuristic', 'vibrant'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

// Strings and lists are clipped rather than rejected, so slightly verbose AI output still validates.
const text = (max: number) => z.string().trim().transform((s) => s.slice(0, max));
const list = <T extends z.ZodTypeAny>(item: T, max: number) => z.array(item).transform((a) => a.slice(0, max));

export const PageSchema = z.object({
  name: z.string().trim().min(1).transform((s) => s.slice(0, 60)),
  purpose: text(240),
  sections: list(text(120), 10),
  complexity: z.enum(['simple', 'standard', 'complex']),
});

export const FeatureSchema = z.object({
  id: z.enum(FEATURE_IDS),
  reason: text(240),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const CustomFeatureSchema = z.object({
  name: z.string().trim().min(1).transform((s) => s.slice(0, 80)),
  description: text(300),
  tier: z.enum(['S', 'M', 'L']),
  reason: text(240),
});

export const PlanSchema = z.object({
  projectType: z.enum(PROJECT_TYPES),
  projectName: text(80),
  summary: text(600),
  audience: text(300),
  goals: list(text(160), 6),
  pages: z.array(PageSchema).min(1).transform((a) => a.slice(0, pricing.guardrails.maxPages)),
  features: list(FeatureSchema, 30),
  customFeatures: list(CustomFeatureSchema, pricing.guardrails.maxCustomFeatures),
  rush: z.boolean(),
  assumptions: list(text(240), 8),
  questions: list(text(240), 5),
});
export type Plan = z.output<typeof PlanSchema>;

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
  currency: z.enum(CURRENCIES),
  description: text(1500),
  revision: text(800).optional().default(''),
  plan: PlanSchema,
  theme: z.enum(THEME_IDS),
  mockup: MockupSchema,
  contact: ContactSchema,
  website: z.string().max(0).optional(),
});
export type OrderRequest = z.infer<typeof OrderRequestSchema>;
