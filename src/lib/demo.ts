// The sample project shown on the landing page (hero chip, "How it works" demo). Priced by the real
// engine so the marketing numbers always match pricing.json: a 5-page café site with 6 features.
import { defaultChoices, quote, type Quote } from './pricing';
import { PlanSchema, type Locale } from './schemas';

const DEMO_PLAN = PlanSchema.parse({
  serviceId: 'company_profile',
  projectName: 'Demo',
  summary: '',
  audience: '',
  pages: ['Home', 'Menu', 'Story', 'Location', 'Contact'].map((name) => ({ name, purpose: '', sections: [] })),
  features: ['whatsapp_button', 'google_maps', 'gallery', 'contact_form', 'seo_basic', 'analytics'].map((id) => ({ id, reason: '', quantity: 1 })),
  suggestions: [],
  customRequests: [],
  questions: [],
  assumptions: [],
});

export const demoQuote = (locale: Locale): Quote => quote(DEMO_PLAN, defaultChoices(locale), locale);
