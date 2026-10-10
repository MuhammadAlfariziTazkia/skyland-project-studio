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
  ja: {
    brandName: 'Kopi Senja',
    nav: ['メニュー', '私たちの話', '店舗', 'ご注文'],
    accent: '#b45309',
    hero: {
      eyebrow: 'スペシャルティコーヒー · バンドン',
      headline: 'おいしい一杯で、明るい一日に',
      subheadline: '一杯ずつ手で淹れるコーヒーと、落ち着ける席。先に注文すれば、列に並ばずに受け取れます。',
      primaryCta: '受け取り注文',
      secondaryCta: 'メニューを見る',
      icon: '☕',
    },
    highlights: [
      { icon: '⚡', title: '10分で用意', text: 'オンラインで注文、通り道で受け取り。' },
      { icon: '🌱', title: '地元の豆', text: '西ジャワの農園から毎週焙煎。' },
      { icon: '📶', title: '作業にも', text: '速い Wi-Fi と十分な電源。' },
    ],
    sections: [
      {
        kind: 'cards',
        eyebrow: '人気',
        title: 'カウンターの定番',
        text: '季節のドリンクと、毎日の定番。ご注文ごとにお作りします。',
        items: [
          { icon: '🥛', title: 'エス・コピ・スス スンジャ', text: '看板のアイスラテ、パームシュガー仕立て。' },
          { icon: '🍵', title: 'マッチャ クラウド', text: '抹茶にオーツのフォームを重ねて。' },
          { icon: '🥐', title: 'バタークロワッサン', text: '毎朝焼いています。' },
        ],
      },
      {
        kind: 'split',
        eyebrow: '私たちの話',
        title: 'ゆっくりした朝が好きな二人で始めました',
        text: '',
        items: [
          { icon: '📍', title: 'Jl. Dago 123, バンドン', text: '毎日 07:00–22:00' },
          { icon: '', title: 'テーブルのご予約', text: 'グループや勉強会に' },
        ],
      },
      { kind: 'cta', eyebrow: '', title: '今日は列に並ばずに', text: '今すぐ注文して、10分後に受け取り。', items: [] },
    ],
    footerNote: 'Kopi Senja · バンドン',
  },
};
