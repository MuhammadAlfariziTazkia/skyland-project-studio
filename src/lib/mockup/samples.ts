import type { Locale, Mockup } from '../schemas';

/** The coffee-shop example used by the landing-page demo (step 4). */
export const SAMPLE_MOCKUP: Record<Locale, Mockup> = {
  en: {
    brandName: 'Kopi Senja',
    nav: ['Menu', 'Our Story', 'Location', 'Order'],
    accent: '#b45309',
    hero: {
      eyebrow: 'Specialty coffee · Bandung',
      headline: 'Good Coffee, Brighter Days',
      subheadline: 'Hand-brewed coffee and cozy corners for students and young workers. Order ahead and skip the line.',
      primaryCta: 'Order for pickup',
      secondaryCta: 'See the menu',
      icon: '☕',
    },
    highlights: [
      { icon: '⚡', title: 'Ready in 10 min', text: 'Order online, pick up on your way.' },
      { icon: '🌱', title: 'Local beans', text: 'Roasted weekly from West Java farms.' },
      { icon: '📶', title: 'Work-friendly', text: 'Fast Wi-Fi and plenty of sockets.' },
    ],
    sections: [
      {
        kind: 'cards',
        eyebrow: 'Best sellers',
        title: 'Favourites from our bar',
        text: 'Seasonal drinks and everyday classics, made to order.',
        items: [
          { icon: '🥛', title: 'Es Kopi Susu Senja', text: 'Our signature iced latte with palm sugar.' },
          { icon: '🍵', title: 'Matcha Cloud', text: 'Ceremonial matcha with oat foam.' },
          { icon: '🥐', title: 'Butter Croissant', text: 'Baked fresh every morning.' },
        ],
      },
      {
        kind: 'split',
        eyebrow: 'Our story',
        title: 'Started by two friends who loved slow mornings',
        text: '',
        items: [
          { icon: '📍', title: 'Jl. Dago 123, Bandung', text: 'Open daily 07:00–22:00' },
          { icon: '', title: 'Table reservation', text: 'for groups and study sessions' },
        ],
      },
      { kind: 'cta', eyebrow: '', title: 'Skip the line today', text: 'Order now and pick up in 10 minutes.', items: [] },
    ],
    footerNote: 'Kopi Senja · Bandung',
  },
  id: {
    brandName: 'Kopi Senja',
    nav: ['Menu', 'Cerita Kami', 'Lokasi', 'Pesan'],
    accent: '#b45309',
    hero: {
      eyebrow: 'Specialty coffee · Bandung',
      headline: 'Kopi Enak, Hari Lebih Cerah',
      subheadline: 'Kopi seduh manual dan sudut nyaman untuk mahasiswa dan pekerja muda. Pesan dulu, tinggal ambil.',
      primaryCta: 'Pesan untuk pickup',
      secondaryCta: 'Lihat menu',
      icon: '☕',
    },
    highlights: [
      { icon: '⚡', title: 'Siap dalam 10 menit', text: 'Pesan online, ambil di jalan.' },
      { icon: '🌱', title: 'Biji kopi lokal', text: 'Disangrai tiap minggu dari kebun Jawa Barat.' },
      { icon: '📶', title: 'Nyaman untuk kerja', text: 'Wi-Fi kencang dan banyak colokan.' },
    ],
    sections: [
      {
        kind: 'cards',
        eyebrow: 'Menu favorit',
        title: 'Favorit dari bar kami',
        text: 'Minuman musiman dan menu klasik, dibuat saat dipesan.',
        items: [
          { icon: '🥛', title: 'Es Kopi Susu Senja', text: 'Es kopi susu andalan dengan gula aren.' },
          { icon: '🍵', title: 'Matcha Cloud', text: 'Matcha premium dengan foam oat.' },
          { icon: '🥐', title: 'Butter Croissant', text: 'Dipanggang segar setiap pagi.' },
        ],
      },
      {
        kind: 'split',
        eyebrow: 'Cerita kami',
        title: 'Dimulai oleh dua sahabat yang suka pagi yang santai',
        text: '',
        items: [
          { icon: '📍', title: 'Jl. Dago 123, Bandung', text: 'Buka setiap hari 07.00–22.00' },
          { icon: '', title: 'Reservasi meja', text: 'untuk rombongan dan belajar bareng' },
        ],
      },
      { kind: 'cta', eyebrow: '', title: 'Tanpa antre hari ini', text: 'Pesan sekarang, ambil dalam 10 menit.', items: [] },
    ],
    footerNote: 'Kopi Senja · Bandung',
  },
};
