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
    business: id ? 'Coffee shop di Bandung untuk mahasiswa dan pekerja muda.' : 'A Bandung coffee shop for students and young workers.',
    flows: [
      { who: 'visitor', does: id ? 'Melihat menu lengkap dengan foto dan harga' : 'Browse the full menu with photos and prices' },
      { who: 'visitor', does: id ? 'Menemukan lokasi dan jam buka' : 'Find the location and opening hours' },
      { who: 'visitor', does: id ? 'Pesan untuk diambil lewat WhatsApp' : 'Order for pickup via WhatsApp' },
      { who: 'owner', does: id ? 'Mengganti menu dan harga sendiri' : 'Update the menu and prices yourself' },
    ],
    pages: [
      { type: 'home', name: id ? 'Beranda' : 'Home', covers: [1], purpose: id ? 'Pengunjung langsung melihat menu favorit, cerita, dan lokasi kafe.' : 'Visitors see the best sellers, the story and where the café is.', sections: ['Hero', id ? 'Menu favorit' : 'Best sellers', id ? 'Cerita kami' : 'Our story', id ? 'Lokasi & jam buka' : 'Location & hours'] },
      { type: 'services', name: 'Menu', covers: [0, 2], purpose: id ? 'Pengunjung melihat semua menu lengkap dengan foto dan harga, lalu pesan lewat WhatsApp.' : 'Visitors browse the full menu with photos and prices, then order on WhatsApp.', sections: [id ? 'Kategori' : 'Categories', id ? 'Foto & harga' : 'Photos & prices', id ? 'Tombol pesan' : 'Order button'] },
      { type: 'manage_content', name: id ? 'Kelola Menu' : 'Manage Menu', covers: [3], purpose: id ? 'Anda menambah, mengubah, atau menyembunyikan menu.' : 'You add, edit or hide menu items.', sections: [id ? 'Daftar menu' : 'Menu list', id ? 'Ubah harga & foto' : 'Edit price & photo'] },
      ...(revised ? [{ type: 'booking', name: id ? 'Reservasi' : 'Reservations', purpose: id ? 'Pelanggan memesan meja.' : 'Customers book a table.', sections: [id ? 'Pilih tanggal & jam' : 'Pick date & time'] }] : []),
    ],
    features: [
      { id: 'gallery', reason: id ? 'Agar menu dan suasana kafe terlihat menggoda.' : 'So the menu and café look tempting.' },
      { id: 'google_maps', reason: id ? 'Agar pelanggan mudah menemukan kafe.' : 'So customers can find the café.' },
      { id: 'whatsapp_button', reason: id ? 'Agar pelanggan bisa pesan pickup lewat chat.' : 'So customers can order pickup by chat.' },
      ...(revised ? [{ id: 'booking_calendar', reason: id ? 'Agar pelanggan bisa reservasi meja.' : 'So customers can book a table.' }] : []),
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
