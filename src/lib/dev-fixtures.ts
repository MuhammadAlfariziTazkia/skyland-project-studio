import { env } from './env';
// Used only by `astro dev` when OPENAI_API_KEY is empty, so the whole flow can be tried locally.
import { SAMPLE_MOCKUP } from './mockup/samples';
import { PlanSchema, type Locale, type Plan } from './schemas';

export const devMode = () => import.meta.env.DEV && !env('OPENAI_API_KEY');

export function devPlan(locale: Locale, revised = false): Plan {
  const id = locale === 'id';
  return PlanSchema.parse({
    projectType: 'company_profile',
    projectName: 'Kopi Senja',
    summary: id ? 'Website modern untuk coffee shop dengan menu, cerita, lokasi, dan pemesanan pickup.' : 'A modern coffee shop website with menu, story, location and pickup ordering.',
    audience: id ? 'Mahasiswa dan pekerja muda di Bandung' : 'Students and young workers in Bandung',
    goals: id ? ['Menambah pesanan pickup', 'Memudahkan orang menemukan lokasi'] : ['Get more pickup orders', 'Help people find the café'],
    pages: [
      { name: id ? 'Beranda' : 'Home', purpose: id ? 'Kesan pertama dan menu favorit' : 'First impression and best sellers', sections: ['Hero', id ? 'Menu favorit' : 'Best sellers', 'CTA'], complexity: 'standard' },
      { name: 'Menu', purpose: id ? 'Daftar menu dan pemesanan' : 'Full menu and ordering', sections: [id ? 'Kategori' : 'Categories', id ? 'Pesan online' : 'Online ordering'], complexity: 'complex' },
      { name: id ? 'Cerita Kami' : 'Our Story', purpose: id ? 'Cerita dan tim' : 'Story and team', sections: [id ? 'Cerita' : 'Story', id ? 'Tim' : 'Team'], complexity: 'simple' },
      { name: id ? 'Lokasi' : 'Location', purpose: id ? 'Peta dan jam buka' : 'Map and opening hours', sections: [id ? 'Peta' : 'Map', id ? 'Jam buka' : 'Hours'], complexity: 'simple' },
      ...(revised ? [{ name: id ? 'Reservasi' : 'Reservations', purpose: id ? 'Reservasi meja' : 'Table booking', sections: ['Form'], complexity: 'standard' as const }] : []),
    ],
    features: [
      { id: 'online_ordering', reason: id ? 'Pesan untuk pickup' : 'Order for pickup', quantity: 1 },
      { id: 'google_maps', reason: id ? 'Lokasi' : 'Location', quantity: 1 },
      { id: 'whatsapp_button', reason: id ? 'Kontak cepat' : 'Quick contact', quantity: 1 },
      { id: 'social_feed', reason: 'Instagram', quantity: 1 },
      ...(revised ? [{ id: 'booking_calendar', reason: id ? 'Reservasi meja' : 'Table reservation', quantity: 1 }] : []),
    ],
    customFeatures: [],
    rush: false,
    assumptions: [id ? 'Foto dan teks menu disediakan klien.' : 'Photos and menu text are provided by the client.'],
    questions: [id ? 'Apakah pembayaran online dibutuhkan saat pemesanan?' : 'Do customers need to pay online when ordering?'],
  });
}

export const devMockup = (locale: Locale) => SAMPLE_MOCKUP[locale];
