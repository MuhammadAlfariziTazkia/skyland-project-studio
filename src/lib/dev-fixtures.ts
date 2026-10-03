import { env } from './env';
// Used only by `astro dev` when OPENAI_API_KEY is empty, so the whole flow can be tried locally.
import { SAMPLE_MOCKUP } from './mockup/samples';
import { PlanSchema, type Locale, type Plan } from './schemas';

export const devMode = () => import.meta.env.DEV && !env('OPENAI_API_KEY');

export function devPlan(locale: Locale, revised = false): Plan {
  const id = locale === 'id';
  return PlanSchema.parse({
    serviceId: 'company_profile',
    projectName: 'Kopi Senja',
    summary: id ? 'Website modern untuk coffee shop yang menampilkan menu, cerita, dan lokasi, serta memudahkan pelanggan memesan untuk diambil.' : 'A modern coffee shop website that shows the menu, story and location, and makes pickup orders easy.',
    audience: id ? 'Mahasiswa dan pekerja muda di Bandung' : 'Students and young workers in Bandung',
    goals: id ? ['Menambah pesanan pickup', 'Memudahkan orang menemukan lokasi'] : ['Get more pickup orders', 'Help people find the café'],
    pages: [
      { name: id ? 'Beranda' : 'Home', purpose: id ? 'Pengunjung langsung melihat menu favorit dan suasana kafe.' : 'Visitors see the best sellers and the café vibe right away.', sections: ['Hero', id ? 'Menu favorit' : 'Best sellers', id ? 'Ajakan pesan' : 'Order call-to-action'] },
      { name: 'Menu', purpose: id ? 'Pengunjung melihat semua menu lengkap dengan foto dan harga.' : 'Visitors browse the full menu with photos and prices.', sections: [id ? 'Kategori' : 'Categories', id ? 'Foto & harga' : 'Photos & prices'] },
      { name: id ? 'Cerita Kami' : 'Our Story', purpose: id ? 'Pengunjung mengenal cerita dan tim di balik kafe.' : 'Visitors get to know the story and team.', sections: [id ? 'Cerita' : 'Story', id ? 'Tim' : 'Team'] },
      { name: id ? 'Lokasi' : 'Location', purpose: id ? 'Pengunjung menemukan alamat dan jam buka.' : 'Visitors find the address and opening hours.', sections: [id ? 'Peta' : 'Map', id ? 'Jam buka' : 'Hours'] },
      { name: id ? 'Kontak' : 'Contact', purpose: id ? 'Pengunjung bisa bertanya atau memesan.' : 'Visitors can ask questions or order.', sections: [id ? 'Form' : 'Form', 'WhatsApp'] },
      ...(revised ? [{ name: id ? 'Reservasi' : 'Reservations', purpose: id ? 'Pelanggan meminta reservasi meja.' : 'Customers request a table.', sections: [id ? 'Form reservasi' : 'Booking form'] }] : []),
    ],
    features: [
      { id: 'gallery', reason: id ? 'Agar menu dan suasana kafe terlihat menggoda.' : 'So the menu and café look tempting.' },
      { id: 'google_maps', reason: id ? 'Agar pelanggan mudah menemukan kafe.' : 'So customers can find the café.' },
      { id: 'whatsapp_button', reason: id ? 'Agar pelanggan bisa pesan pickup lewat chat.' : 'So customers can order pickup by chat.' },
    ],
    suggestions: [
      { id: 'seo_basic', reason: id ? 'Agar kafe muncul saat orang mencari “kopi dekat sini”.' : 'So the café shows up when people search “coffee near me”.' },
      { id: 'cms_admin', reason: id ? 'Agar Anda bisa mengganti menu dan harga sendiri.' : 'So you can update the menu and prices yourself.' },
    ],
    customRequests: [],
    questions: [
      {
        question: id ? 'Apakah pelanggan perlu membayar online saat memesan?' : 'Should customers pay online when they order?',
        options: [
          { label: id ? 'Tidak, bayar di kasir' : 'No, pay at the counter', add: [], remove: ['payment'] },
          { label: id ? 'Ya, bayar online' : 'Yes, pay online', add: ['payment'], remove: [] },
        ],
      },
    ],
    assumptions: [id ? 'Pemesanan dilakukan lewat WhatsApp, bukan keranjang belanja.' : 'Orders go through WhatsApp, not a shopping cart.'],
  });
}

export const devMockup = (locale: Locale) => SAMPLE_MOCKUP[locale];
