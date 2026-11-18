// Client-facing copy for the template price lists in data/pricing.json `templates` (the JSON holds numbers;
// this holds words). tests/pricing.test.ts fails if an item has no copy in every locale.
//
// House rule for this file: every line says who can do what, concretely. No "fast", "SEO-ready", "modern",
// "professional", "optimised" — a barber cannot check those, and neither can we when a client asks whether
// we delivered. If an item cannot be written as "the customer can… / you can…", it is not an item.
import type { Locale } from '../lib/schemas';

export interface TemplateItemCopy {
  name: string;
  /** One sentence: who can do what. */
  does: string;
  /** The customer's path through it, step by step. Shown as a short flow on the card. */
  steps?: string[];
  /** What exactly it includes, as a checklist. */
  gets?: string[];
  /** Extra lines that apply only while another module (the key) is also selected. */
  also?: Record<string, string[]>;
  /** A plain warning shown while another module (the key) is NOT selected. */
  without?: Record<string, string>;
}

export interface TemplateCopy {
  items: Record<string, Record<Locale, TemplateItemCopy>>;
  presets: Record<string, Record<Locale, string>>;
  /** Alternatives the buyer picks one of (pricing.json `group`): the question, and the "none of these" answer. */
  groups: Record<string, Record<Locale, { label: string; none: string; noneNote: string }>>;
  /** Paid by the client straight to a provider, never to Skyland. `hosting_domain` reuses NOT_INCLUDED_COPY. */
  clientPaid: Record<string, Record<Locale, { name: string; note: string }>>;
  notIncluded: Record<Locale, { label: string; why: string }[]>;
  /** Anchor in the live demo where a module can be tried. */
  demo: Record<string, string>;
}

export const TEMPLATE_COPY: Record<string, TemplateCopy> = {
  kurohane: {
    items: {
      barber_info: {
        en: {
          name: 'Barbershop info website',
          does: 'Everything a customer needs to know before visiting, on one website.',
          gets: [
            'Home page with your name, main photo, and buttons to call, LINE or Instagram',
            'Menu & prices: each service with its price and duration (e.g. "Cut + wash — ¥3,500 — 60 min")',
            'Barber profiles: photo, name and specialty',
            'Opening hours for each day, and regular days off',
            'Location: address, Google Maps and a "Directions" button',
            'Photo gallery of up to 20 photos',
            '"About us", "First visit" and FAQ pages',
            'Connected to your own domain and hosting, with 2 rounds of changes before launch',
          ],
        },
        id: {
          name: 'Website info barbershop',
          does: 'Semua yang perlu diketahui pelanggan sebelum datang, dalam satu website.',
          gets: [
            'Beranda berisi nama, foto utama, dan tombol telepon, LINE, atau Instagram',
            'Menu & harga: tiap layanan dengan harga dan durasinya (mis. "Potong + cuci — ¥3.500 — 60 menit")',
            'Profil barber: foto, nama, dan keahliannya',
            'Jam buka tiap hari dan hari libur tetap',
            'Lokasi: alamat, peta Google Maps, dan tombol "Petunjuk arah"',
            'Galeri hingga 20 foto',
            'Halaman "Tentang kami", "Kunjungan pertama", dan FAQ',
            'Dipasang di domain dan hosting atas nama Anda, dengan 2 putaran revisi sebelum online',
          ],
        },
        ja: {
          name: '店舗情報サイト',
          does: 'ご来店前にお客様が知りたいことを、ひとつのサイトにまとめます。',
          gets: [
            '店名・メイン写真と、電話・LINE・Instagram へのボタンがあるトップページ',
            'メニューと料金：施術ごとの料金と所要時間（例：「カット＋シャンプー — ¥3,500 — 60分」）',
            '理容師紹介：写真・名前・得意なスタイル',
            '曜日ごとの営業時間と定休日',
            'アクセス：住所、Google マップ、「経路を表示」ボタン',
            '写真ギャラリー（20枚まで）',
            '「お店について」「初めての方へ」「よくある質問」ページ',
            'お客様名義のドメインとサーバーに公開。公開前の修正は2回まで',
          ],
        },
      },
      second_language: {
        en: {
          name: 'Second language: Japanese + English',
          does: 'Visitors tap 日本語 / English on any page and the whole website switches to English.',
          gets: ['We translate every page, the menu & prices, barber profiles and FAQ; you check the translation before launch'],
          also: {
            booking: ['The booking form and customer emails come in the language the customer booked in'],
            ai_style: ['Style recommendations appear in English on the English version'],
            dashboard: ['Every text in the dashboard has a Japanese and an English field'],
          },
          without: { dashboard: 'Without the Dashboard, text added after launch is translated through us.' },
        },
        id: {
          name: 'Bahasa kedua: Jepang + Inggris',
          does: 'Pengunjung menekan 日本語 / English di halaman mana pun dan seluruh isi website berganti ke bahasa Inggris.',
          gets: ['Kami menerjemahkan semua halaman, menu & harga, profil barber, dan FAQ; Anda mengecek terjemahannya sebelum online'],
          also: {
            booking: ['Form booking dan email untuk pelanggan memakai bahasa yang dipakai pelanggan saat memesan'],
            ai_style: ['Hasil rekomendasi gaya tampil dalam bahasa Inggris di versi Inggris'],
            dashboard: ['Setiap teks di dashboard punya kolom bahasa Jepang dan Inggris'],
          },
          without: { dashboard: 'Tanpa Dashboard, teks yang ditambah setelah online diterjemahkan lewat kami.' },
        },
        ja: {
          name: '2言語対応：日本語＋英語',
          does: 'どのページでも「日本語 / English」を押すと、サイト全体が英語に切り替わります。',
          gets: ['全ページ・メニューと料金・理容師紹介・よくある質問をこちらで翻訳し、公開前にご確認いただきます'],
          also: {
            booking: ['予約フォームとお客様へのメールは、予約時に使った言語で届きます'],
            ai_style: ['英語版では、髪型の提案も英語で表示されます'],
            dashboard: ['管理画面の各項目に日本語欄と英語欄があります'],
          },
          without: { dashboard: '管理画面がない場合、公開後に追加する文章の翻訳はこちらで承ります。' },
        },
      },
      booking: {
        en: {
          name: 'Online booking',
          does: 'Customers book a free time themselves, at any hour, without calling.',
          steps: ['Pick a service', 'Pick a date', 'Pick a free time', 'Enter name, email, phone', 'Email to the customer and to you'],
          gets: [
            'A booked time is locked at once: two customers can never take the same slot',
            'Past times, breaks and days off are never offered',
            'As many bookings per time as you have chairs',
            'Privacy & cancellation-policy page, and a bot check on the form',
          ],
          without: { dashboard: 'Without the Dashboard, bookings reach you by email only.' },
        },
        id: {
          name: 'Booking online',
          does: 'Pelanggan memesan jam yang kosong sendiri, kapan saja, tanpa menelepon.',
          steps: ['Pilih layanan', 'Pilih tanggal', 'Pilih jam kosong', 'Isi nama, email, no. HP', 'Email ke pelanggan dan ke Anda'],
          gets: [
            'Jam yang sudah dipesan langsung terkunci: dua pelanggan tidak bisa mengambil jam yang sama',
            'Jam yang sudah lewat, jam istirahat, dan hari libur tidak pernah ditawarkan',
            'Jumlah booking per jam sesuai jumlah kursi Anda',
            'Halaman privasi & aturan pembatalan, dan pengecekan anti-bot di form',
          ],
          without: { dashboard: 'Tanpa Dashboard, booking hanya Anda terima lewat email.' },
        },
        ja: {
          name: 'ネット予約',
          does: 'お客様が空いている時間を、電話なしでいつでも予約できます。',
          steps: ['メニューを選ぶ', '日付を選ぶ', '空き時間を選ぶ', '名前・メール・電話番号', 'お客様とお店に確認メール'],
          gets: [
            '予約された時間はすぐに埋まり、同じ枠に2人が入ることはありません',
            '過ぎた時間・休憩・定休日は表示されません',
            '同じ時間に受けられる予約数＝椅子の数',
            'プライバシー・キャンセル規定ページと、フォームのボット対策',
          ],
          without: { dashboard: '管理画面がない場合、予約はメールでのみ届きます。' },
        },
      },
      booking_reschedule: {
        en: {
          name: 'Change or cancel online',
          does: 'The confirmation email has a link: the customer moves or cancels without calling, the old time opens up again, and you both get an email.',
        },
        id: {
          name: 'Ubah jadwal & batal sendiri',
          does: 'Email konfirmasi berisi tautan: pelanggan bisa pindah jam atau batal tanpa menelepon, jam lamanya terbuka lagi, dan Anda berdua menerima email.',
        },
        ja: {
          name: 'お客様による変更・キャンセル',
          does: '確認メールのリンクから、お客様が電話なしで日時変更・キャンセルできます。元の枠は自動で空き、お店とお客様の両方にメールが届きます。',
        },
      },
      booking_reminder: {
        en: { name: 'Day-before reminder email', does: 'Every customer automatically gets an email the day before their appointment.' },
        id: { name: 'Email pengingat H-1', does: 'Setiap pelanggan otomatis menerima email sehari sebelum jadwalnya.' },
        ja: { name: '前日リマインドメール', does: 'ご予約の前日に、お客様へ自動でメールが届きます。' },
      },
      booking_pick_barber: {
        en: { name: 'Choose a barber', does: 'The customer picks a specific barber or "anyone". Each barber has their own working hours and days off.' },
        id: { name: 'Pilih barber', does: 'Pelanggan memilih barber tertentu atau "siapa saja". Tiap barber punya jam kerja dan hari liburnya sendiri.' },
        ja: { name: '指名予約', does: 'お客様が理容師を指名するか「指名なし」を選べます。理容師ごとに勤務時間と休みを設定できます。' },
      },
      ai_style: {
        en: {
          name: 'AI hairstyle recommendation',
          does: 'A customer uploads a face photo and gets the 3 hairstyles that suit them best.',
          steps: ['Upload or take a photo', 'AI reads face shape and hair', '3 styles, best match first, each with its name and why it suits'],
          gets: [
            'The AI only picks from styles your shop actually does',
            'The photo is not stored',
            'Runs on your own OpenAI account; we set it up with a monthly spending limit',
          ],
          also: { booking: ['A "Book this style" button under each recommendation, free with Online booking'] },
        },
        id: {
          name: 'AI rekomendasi gaya rambut',
          does: 'Pelanggan upload foto wajah dan mendapat 3 gaya rambut yang paling cocok.',
          steps: ['Upload atau ambil foto', 'AI membaca bentuk wajah dan rambut', '3 gaya, paling cocok di atas, masing-masing dengan nama dan alasannya'],
          gets: [
            'AI hanya memilih dari gaya yang memang dikerjakan barbershop Anda',
            'Foto pelanggan tidak disimpan',
            'Memakai akun OpenAI milik Anda; kami yang menyiapkan, lengkap dengan batas pengeluaran bulanan',
          ],
          also: { booking: ['Tombol "Booking gaya ini" di bawah tiap rekomendasi, gratis bila Booking online aktif'] },
        },
        ja: {
          name: 'AI髪型診断',
          does: 'お客様が顔写真をアップロードすると、似合う髪型を3つ提案します。',
          steps: ['写真をアップロード・撮影', 'AIが顔の形と髪質を読み取る', '似合う順に3スタイル、名前と理由つき'],
          gets: [
            'AIはお店が実際に扱うスタイルの中からだけ選びます',
            '写真は保存しません',
            'お客様ご自身の OpenAI アカウントで動きます。月の利用上限も含めてこちらで設定します',
          ],
          also: { booking: ['各提案の下に「このスタイルで予約」ボタン（ネット予約があれば無料）'] },
        },
      },
      ai_style_photos: {
        en: { name: 'Sample photo of each style', does: 'Each recommendation shows a fixed photo of that style — your own work, or licensed stock photos.' },
        id: { name: 'Foto contoh tiap gaya (statis)', does: 'Setiap rekomendasi menampilkan foto contoh gaya itu — hasil kerja Anda sendiri, atau foto stok berlisensi.' },
        ja: { name: 'スタイルごとの見本写真', does: '各提案に、そのスタイルの見本写真（お店の施術写真、またはライセンス済みの素材写真）を表示します。' },
      },
      ai_style_tryon: {
        en: {
          name: "The customer's own photo, restyled by AI",
          does: "Each of the 3 recommendations shows the customer's own photo with their hair changed by AI to that style.",
          gets: [
            'Customers take the photo with the camera inside the website, or pick one from their album',
            'Before/after comparison on every recommendation',
            'The photo is processed on your OpenAI account and not stored',
          ],
        },
        id: {
          name: 'Foto pelanggan sendiri, diedit AI',
          does: 'Masing-masing dari 3 rekomendasi menampilkan foto pelanggan itu sendiri dengan rambut yang diubah AI ke gaya tersebut.',
          gets: [
            'Pelanggan memotret langsung dengan kamera di website, atau memilih dari album',
            'Perbandingan sebelum/sesudah di setiap rekomendasi',
            'Foto diproses di akun OpenAI Anda dan tidak disimpan',
          ],
        },
        ja: {
          name: 'お客様ご本人の写真をAIで髪型変更',
          does: '3つの提案それぞれに、お客様ご本人の写真の髪型をAIでそのスタイルに変えた画像を表示します。',
          gets: [
            'サイト内のカメラでその場で撮影、またはアルバムから選択',
            '各提案でビフォー・アフターを比較',
            '写真はお客様の OpenAI アカウントで処理し、保存しません',
          ],
        },
      },
      dashboard: {
        en: {
          name: 'Owner dashboard',
          does: 'You log in and change the website yourself, without asking us.',
          gets: ['Edit menu & prices, opening hours and days off, barber profiles, gallery photos'],
          also: {
            booking: ["See today's and this week's bookings, cancel one, close a time or a whole day"],
            ai_style: ['Edit the style list, their descriptions and sample photos'],
          },
        },
        id: {
          name: 'Dashboard pemilik',
          does: 'Anda login dan mengubah isi website sendiri, tanpa perlu minta ke kami.',
          gets: ['Ubah menu & harga, jam buka dan hari libur, profil barber, foto galeri'],
          also: {
            booking: ['Lihat booking hari ini dan minggu ini, batalkan booking, tutup jam atau satu hari penuh'],
            ai_style: ['Ubah daftar gaya, penjelasannya, dan foto contohnya'],
          },
        },
        ja: {
          name: 'オーナー管理画面',
          does: 'ログインして、サイトの内容をご自身で変更できます。',
          gets: ['メニューと料金、営業時間と休業日、理容師紹介、ギャラリー写真の編集'],
          also: {
            booking: ['今日・今週の予約一覧、予約のキャンセル、時間帯や1日まるごとの受付停止'],
            ai_style: ['スタイル一覧・説明文・見本写真の編集'],
          },
        },
      },
    },
    groups: {
      ai_photo: {
        en: { label: 'Photo on each recommendation — pick one', none: 'Text only', noneNote: 'Style name and why it suits, no photo.' },
        id: { label: 'Foto di tiap rekomendasi — pilih salah satu', none: 'Teks saja', noneNote: 'Nama gaya dan alasannya, tanpa foto.' },
        ja: { label: '各提案に表示する写真（ひとつ選択）', none: 'テキストのみ', noneNote: 'スタイル名と似合う理由のみ。写真なし。' },
      },
    },
    presets: {
      info: { en: 'Info only', id: 'Info saja', ja: '情報のみ' },
      booking: { en: 'Info + booking', id: 'Info + booking', ja: '情報＋予約' },
      all: { en: 'Everything', id: 'Semua', ja: 'すべて' },
    },
    clientPaid: {
      openai_image: {
        en: { name: 'OpenAI image edits (AI photo)', note: 'Each diagnosis creates 3 edited images, which costs much more than the text analysis. Billed to your OpenAI account and stopped by the same monthly limit.' },
        id: { name: 'Edit gambar OpenAI (foto AI)', note: 'Setiap diagnosis membuat 3 gambar hasil edit, jauh lebih mahal daripada analisis teks. Ditagih ke akun OpenAI Anda dan dihentikan oleh batas bulanan yang sama.' },
        ja: { name: 'OpenAI 画像編集料（AI写真）', note: '診断1回につき3枚の画像を生成するため、テキスト解析より大幅に高くなります。お客様の OpenAI アカウントに請求され、同じ月の上限で止まります。' },
      },
      openai_usage: {
        en: { name: 'OpenAI usage (AI module)', note: 'Charged per analysed photo, straight to your OpenAI account. The monthly limit we set stops it at the amount you choose.' },
        id: { name: 'Pemakaian OpenAI (modul AI)', note: 'Ditagih per foto yang dianalisis, langsung ke akun OpenAI Anda. Batas bulanan yang kami pasang menghentikannya di angka yang Anda tentukan.' },
        ja: { name: 'OpenAI 利用料（AI機能）', note: '診断した写真の枚数に応じて、お客様の OpenAI アカウントに直接請求されます。設定した月の上限で止まります。' },
      },
    },
    notIncluded: {
      en: [
        { label: 'Online payment', why: 'Customers pay at the shop.' },
        { label: 'LINE or WhatsApp notifications', why: 'Notifications go by email. LINE and WhatsApp need a separate business account.' },
      ],
      id: [
        { label: 'Pembayaran online', why: 'Pelanggan membayar di tempat.' },
        { label: 'Notifikasi LINE atau WhatsApp', why: 'Notifikasi dikirim lewat email. LINE dan WhatsApp butuh akun bisnis terpisah.' },
      ],
      ja: [
        { label: 'オンライン決済', why: 'お支払いは店頭です。' },
        { label: 'LINE・WhatsApp 通知', why: '通知はメールで送ります。LINE・WhatsApp は別途ビジネスアカウントが必要です。' },
      ],
    },
    demo: { booking: '#reserve', ai_style: '#finder' },
  },
};
