import type { ConceptKey } from '../../i18n/routes';
import type { Locale, Mockup } from '../schemas';

/**
 * Homepage preview copy for each concept, written by hand.
 *
 * This is what makes the concept route cost nothing and feel instant: the result step needs a `Mockup`,
 * and normally that comes from an OpenAI call. Here it is already written, so a client who picks a concept
 * goes straight to a rendered preview with no request at all. Same shape and same `renderMockup()` as the
 * AI path, so the preview and the emailed attachment cannot drift (see src/lib/mockup/samples.ts).
 */
export const CONCEPT_MOCKUPS: Record<ConceptKey, Record<Locale, Mockup>> = {
  tegak: {
    en: {
      brandName: 'Tegak Prima Konstruksi',
      nav: ['Projects', 'Services', 'Capabilities', 'Contact'],
      accent: '#c2410c',
      hero: {
        eyebrow: 'General contractor · Since 2011',
        headline: 'Building with certainty',
        subheadline: 'Industrial, commercial and institutional projects delivered on schedule, with the certifications and site discipline to prove it.',
        primaryCta: 'Request a consultation',
        secondaryCta: 'See our projects',
        icon: '🏗️',
      },
      highlights: [
        { icon: '📐', title: 'Design & build', text: 'One contract from drawings to handover.' },
        { icon: '🛡️', title: 'Certified & compliant', text: 'SBU, ISO 9001 and SMK3 on every site.' },
        { icon: '📍', title: '8 cities covered', text: 'Crews and suppliers already in place.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'What we build',
          title: 'Six delivery capabilities under one roof',
          text: 'From structural work to fit-out, handled by the same team that signed the contract.',
          items: [
            { icon: '🏭', title: 'Industrial', text: 'Warehouses, plants and logistics facilities.' },
            { icon: '🏢', title: 'Commercial', text: 'Offices and retail, occupied or new-build.' },
            { icon: '🔧', title: 'MEP', text: 'Mechanical, electrical and plumbing packages.' },
          ],
        },
        {
          kind: 'stats',
          eyebrow: 'Track record',
          title: 'Numbers the site logs can back up',
          text: '',
          items: [
            { icon: '', title: '120+', text: 'projects delivered' },
            { icon: '', title: '500K m²', text: 'built to date' },
            { icon: '', title: '95%', text: 'clients who come back' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'How we work',
          title: 'From first call to handover',
          text: 'Every stage closes with a document you keep.',
          items: [
            { icon: '1', title: 'Site survey', text: 'We measure before we quote.' },
            { icon: '2', title: 'Proposal & BoQ', text: 'Priced line by line, no lump sums.' },
            { icon: '3', title: 'Build & handover', text: 'Weekly progress reports, then as-builts.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Have drawings ready?', text: 'Send them over and we will come back with a priced proposal.', items: [] },
      ],
      footerNote: 'Tegak Prima Konstruksi · Jakarta',
    },
    id: {
      brandName: 'Tegak Prima Konstruksi',
      nav: ['Proyek', 'Layanan', 'Kapabilitas', 'Kontak'],
      accent: '#c2410c',
      hero: {
        eyebrow: 'Kontraktor umum · Sejak 2011',
        headline: 'Membangun dengan kepastian',
        subheadline: 'Proyek industri, komersial, dan institusional yang selesai sesuai jadwal, dengan sertifikasi dan disiplin lapangan yang bisa dibuktikan.',
        primaryCta: 'Ajukan konsultasi',
        secondaryCta: 'Lihat proyek kami',
        icon: '🏗️',
      },
      highlights: [
        { icon: '📐', title: 'Design & build', text: 'Satu kontrak dari gambar sampai serah terima.' },
        { icon: '🛡️', title: 'Tersertifikasi', text: 'SBU, ISO 9001, dan SMK3 di setiap proyek.' },
        { icon: '📍', title: '8 kota terlayani', text: 'Tim dan suplier sudah siap di lokasi.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'Yang kami bangun',
          title: 'Enam kapabilitas dalam satu tim',
          text: 'Dari pekerjaan struktur sampai fit-out, ditangani tim yang menandatangani kontraknya.',
          items: [
            { icon: '🏭', title: 'Industri', text: 'Gudang, pabrik, dan fasilitas logistik.' },
            { icon: '🏢', title: 'Komersial', text: 'Kantor dan retail, baru maupun terpakai.' },
            { icon: '🔧', title: 'MEP', text: 'Paket mekanikal, elektrikal, dan plumbing.' },
          ],
        },
        {
          kind: 'stats',
          eyebrow: 'Rekam jejak',
          title: 'Angka yang bisa ditelusuri dari catatan proyek',
          text: '',
          items: [
            { icon: '', title: '120+', text: 'proyek selesai' },
            { icon: '', title: '500 rb m²', text: 'terbangun' },
            { icon: '', title: '95%', text: 'klien kembali lagi' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'Cara kami bekerja',
          title: 'Dari telepon pertama sampai serah terima',
          text: 'Setiap tahap ditutup dengan dokumen yang Anda simpan.',
          items: [
            { icon: '1', title: 'Survei lokasi', text: 'Kami ukur dulu sebelum memberi harga.' },
            { icon: '2', title: 'Proposal & RAB', text: 'Dirinci per item, bukan harga borongan.' },
            { icon: '3', title: 'Bangun & serahkan', text: 'Laporan progres mingguan, lalu as-built.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Sudah punya gambar?', text: 'Kirimkan ke kami, nanti kami balas dengan proposal berharga.', items: [] },
      ],
      footerNote: 'Tegak Prima Konstruksi · Jakarta',
    },
    ja: {
      brandName: 'Tegak Prima Konstruksi',
      nav: ['施工実績', 'サービス', '施工体制', 'お問い合わせ'],
      accent: '#c2410c',
      hero: {
        eyebrow: '総合建設業 · 2011年創業',
        headline: '確かさを、かたちにする',
        subheadline: '工場・商業・公共施設の工事を工期どおりに引き渡します。許認可と現場管理で、それを裏づけます。',
        primaryCta: 'ご相談はこちら',
        secondaryCta: '施工実績を見る',
        icon: '🏗️',
      },
      highlights: [
        { icon: '📐', title: '設計施工一括', text: '図面から引き渡しまで一つの契約で。' },
        { icon: '🛡️', title: '許認可と安全管理', text: 'すべての現場で基準を満たします。' },
        { icon: '📍', title: '8都市に対応', text: '職人も仕入先もすでに現地にいます。' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: '対応工事',
          title: '6つの施工領域を自社で',
          text: '躯体から内装仕上げまで、契約した当人のチームが担当します。',
          items: [
            { icon: '🏭', title: '工場・倉庫', text: '倉庫、生産施設、物流拠点。' },
            { icon: '🏢', title: '商業施設', text: 'オフィスや店舗。居ながら改修も新築も。' },
            { icon: '🔧', title: '設備工事', text: '機械・電気・給排水の各工事。' },
          ],
        },
        {
          kind: 'stats',
          eyebrow: '実績',
          title: '現場記録で裏づけられる数字',
          text: '',
          items: [
            { icon: '', title: '120件以上', text: '引き渡した工事' },
            { icon: '', title: '50万m²', text: 'これまでの施工面積' },
            { icon: '', title: '95%', text: '再び依頼いただく割合' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: '進め方',
          title: '最初のご連絡から引き渡しまで',
          text: '各段階の終わりに、お手元に残る書類をお渡しします。',
          items: [
            { icon: '1', title: '現地調査', text: '見積る前に、まず測ります。' },
            { icon: '2', title: '提案と内訳書', text: '一式ではなく項目ごとの明細で。' },
            { icon: '3', title: '施工と引き渡し', text: '週次の進捗報告、最後に竣工図。' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: '図面はお手元にありますか？', text: 'お送りいただければ、金額を入れた提案をお返しします。', items: [] },
      ],
      footerNote: 'Tegak Prima Konstruksi · ジャカルタ',
    },
  },

  lembar: {
    en: {
      brandName: 'Lembar Toko Buku',
      nav: ['New arrivals', 'Genres', 'Staff picks', 'Cart'],
      accent: '#92400e',
      hero: {
        eyebrow: 'Independent bookshop',
        headline: 'Books worth reading slowly',
        subheadline: 'A shelf curated by people who read. Order online, and we wrap every book before it leaves.',
        primaryCta: 'Browse the shelves',
        secondaryCta: 'This month’s picks',
        icon: '📚',
      },
      highlights: [
        { icon: '✍️', title: 'Chosen by hand', text: 'Every title read by someone on the floor.' },
        { icon: '📦', title: 'Wrapped with care', text: 'Padded and sealed, never a bent corner.' },
        { icon: '🎁', title: 'Free delivery', text: 'On orders over Rp 250,000.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'Staff picks',
          title: 'What we are pressing into people’s hands',
          text: 'Short notes from the people who actually read them.',
          items: [
            { icon: '🌾', title: 'Fiction', text: 'Quiet novels that stay with you.' },
            { icon: '🏛️', title: 'History', text: 'Archipelago histories, retold well.' },
            { icon: '🧠', title: 'Psychology', text: 'Readable, not self-help.' },
          ],
        },
        {
          kind: 'split',
          eyebrow: 'Formats',
          title: 'Paperback or hardcover, your call',
          text: 'Stock is live, so what you see on the shelf is what we have.',
          items: [
            { icon: '📖', title: 'Paperback', text: 'The everyday edition.' },
            { icon: '📕', title: 'Hardcover', text: 'For the ones you keep.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Something in mind?', text: 'Search the whole shelf by title, author or genre.', items: [] },
      ],
      footerNote: 'Lembar Toko Buku · Bandung',
    },
    id: {
      brandName: 'Lembar Toko Buku',
      nav: ['Buku baru', 'Genre', 'Pilihan kami', 'Keranjang'],
      accent: '#92400e',
      hero: {
        eyebrow: 'Toko buku independen',
        headline: 'Buku yang layak dibaca perlahan',
        subheadline: 'Rak yang dikurasi orang-orang yang benar-benar membaca. Pesan online, dan setiap buku kami bungkus sebelum dikirim.',
        primaryCta: 'Jelajahi rak',
        secondaryCta: 'Pilihan bulan ini',
        icon: '📚',
      },
      highlights: [
        { icon: '✍️', title: 'Dipilih satu-satu', text: 'Setiap judul dibaca orang di toko.' },
        { icon: '📦', title: 'Dibungkus rapi', text: 'Berlapis dan tersegel, tanpa sudut terlipat.' },
        { icon: '🎁', title: 'Gratis kirim', text: 'Untuk pesanan di atas Rp 250.000.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'Pilihan kami',
          title: 'Yang sedang kami sodorkan ke pembaca',
          text: 'Catatan singkat dari orang yang benar-benar membacanya.',
          items: [
            { icon: '🌾', title: 'Fiksi', text: 'Novel tenang yang menetap lama.' },
            { icon: '🏛️', title: 'Sejarah', text: 'Sejarah nusantara yang diceritakan ulang dengan baik.' },
            { icon: '🧠', title: 'Psikologi', text: 'Enak dibaca, bukan buku motivasi.' },
          ],
        },
        {
          kind: 'split',
          eyebrow: 'Format',
          title: 'Paperback atau hardcover, Anda yang pilih',
          text: 'Stok tampil langsung, jadi yang terlihat di rak memang ada.',
          items: [
            { icon: '📖', title: 'Paperback', text: 'Edisi untuk dibaca sehari-hari.' },
            { icon: '📕', title: 'Hardcover', text: 'Untuk yang ingin disimpan.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Sudah ada judul di kepala?', text: 'Cari seluruh rak dari judul, penulis, atau genre.', items: [] },
      ],
      footerNote: 'Lembar Toko Buku · Bandung',
    },
    ja: {
      brandName: 'Lembar Toko Buku',
      nav: ['新刊', 'ジャンル', '店員のおすすめ', 'カート'],
      accent: '#92400e',
      hero: {
        eyebrow: '独立系書店',
        headline: 'ゆっくり読む価値のある本を',
        subheadline: '読む人が選んだ棚です。オンラインでご注文いただき、一冊ずつ包んでお送りします。',
        primaryCta: '棚を見る',
        secondaryCta: '今月の一冊',
        icon: '📚',
      },
      highlights: [
        { icon: '✍️', title: '一冊ずつ選書', text: '店にいる誰かが実際に読んだ本だけ。' },
        { icon: '📦', title: '丁寧に梱包', text: '緩衝材と封で、角を折らずにお届け。' },
        { icon: '🎁', title: '送料無料', text: '一定額以上のご注文で。' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: '店員のおすすめ',
          title: 'いま手渡したい本',
          text: '実際に読んだ人の短いコメントを添えて。',
          items: [
            { icon: '🌾', title: '文芸', text: '読み終えても残る静かな小説。' },
            { icon: '🏛️', title: '歴史', text: '語り直された、この土地の歴史。' },
            { icon: '🧠', title: '心理学', text: '自己啓発ではなく、読み物として。' },
          ],
        },
        {
          kind: 'split',
          eyebrow: '形態',
          title: '文庫か単行本か、お好みで',
          text: '在庫はそのまま反映されるので、棚に見えるものは実際にあります。',
          items: [
            { icon: '📖', title: '文庫', text: '日常的に読むための版。' },
            { icon: '📕', title: '単行本', text: '手元に置いておきたい一冊に。' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: '探している本がありますか？', text: '書名・著者・ジャンルから棚ごと検索できます。', items: [] },
      ],
      footerNote: 'Lembar Toko Buku · バンドン',
    },
  },

  kurohane: {
    en: {
      brandName: 'Kurohane Barber Studio',
      nav: ['Menu', 'Barbers', 'Styles', 'Book'],
      accent: '#9f1239',
      hero: {
        eyebrow: 'Barber studio · Tokyo',
        headline: 'Precision in every detail',
        subheadline: 'Four barbers, nine services, one chair at a time. Pick your barber and your slot — the calendar only shows what is really free.',
        primaryCta: 'Book an appointment',
        secondaryCta: 'See the menu',
        icon: '✂️',
      },
      highlights: [
        { icon: '🕐', title: 'Real availability', text: 'Slots check against the shop’s own hours.' },
        { icon: '👤', title: 'Choose your barber', text: 'Or let us assign whoever is free.' },
        { icon: '🔔', title: 'Reminder before', text: 'An email the day before your visit.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'The menu',
          title: 'Cuts, shaves and care',
          text: 'Every service lists its own duration, so the calendar books the right amount of time.',
          items: [
            { icon: '✂️', title: 'Cut · 60 min', text: 'Consultation, cut, finish.' },
            { icon: '🪒', title: 'Shave · 45 min', text: 'Hot towel and straight razor.' },
            { icon: '💎', title: 'Premium · 120 min', text: 'Cut, shave and scalp care.' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'Booking',
          title: 'Three taps and you are in the book',
          text: '',
          items: [
            { icon: '1', title: 'Pick a service', text: 'Duration sets itself.' },
            { icon: '2', title: 'Pick a barber', text: 'Or choose no preference.' },
            { icon: '3', title: 'Pick a slot', text: 'Change or cancel from your link.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'First visit?', text: 'Read what to expect, then book your chair.', items: [] },
      ],
      footerNote: 'Kurohane Barber Studio · Tokyo',
    },
    id: {
      brandName: 'Kurohane Barber Studio',
      nav: ['Menu', 'Barber', 'Gaya', 'Pesan'],
      accent: '#9f1239',
      hero: {
        eyebrow: 'Barber studio · Tokyo',
        headline: 'Presisi di setiap detail',
        subheadline: 'Empat barber, sembilan layanan, satu kursi sekali waktu. Pilih barber dan jadwal — kalender hanya menampilkan slot yang benar-benar kosong.',
        primaryCta: 'Pesan jadwal',
        secondaryCta: 'Lihat menu',
        icon: '✂️',
      },
      highlights: [
        { icon: '🕐', title: 'Slot sesuai kenyataan', text: 'Dicek ke jam buka toko sendiri.' },
        { icon: '👤', title: 'Pilih barber Anda', text: 'Atau biarkan kami yang menentukan.' },
        { icon: '🔔', title: 'Pengingat otomatis', text: 'Email sehari sebelum kedatangan.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'Menu',
          title: 'Potong, cukur, dan perawatan',
          text: 'Setiap layanan punya durasinya sendiri, jadi kalender memesan waktu yang tepat.',
          items: [
            { icon: '✂️', title: 'Potong · 60 mnt', text: 'Konsultasi, potong, finishing.' },
            { icon: '🪒', title: 'Cukur · 45 mnt', text: 'Handuk hangat dan pisau lurus.' },
            { icon: '💎', title: 'Premium · 120 mnt', text: 'Potong, cukur, dan perawatan kulit kepala.' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'Pemesanan',
          title: 'Tiga ketukan dan nama Anda masuk buku',
          text: '',
          items: [
            { icon: '1', title: 'Pilih layanan', text: 'Durasi terisi sendiri.' },
            { icon: '2', title: 'Pilih barber', text: 'Atau pilih tanpa preferensi.' },
            { icon: '3', title: 'Pilih slot', text: 'Ubah atau batalkan dari tautan Anda.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Kunjungan pertama?', text: 'Baca dulu apa yang akan terjadi, lalu pesan kursi Anda.', items: [] },
      ],
      footerNote: 'Kurohane Barber Studio · Tokyo',
    },
    ja: {
      brandName: '黒羽 Kurohane Barber Studio',
      nav: ['メニュー', '理容師', 'スタイル', 'ご予約'],
      accent: '#9f1239',
      hero: {
        eyebrow: 'バーバースタジオ · 東京',
        headline: '細部にまで、精度を',
        subheadline: '4人の理容師、9つのメニュー、椅子は一度にひとつ。担当と時間をお選びください。空いている枠だけを表示します。',
        primaryCta: 'ご予約へ',
        secondaryCta: 'メニューを見る',
        icon: '✂️',
      },
      highlights: [
        { icon: '🕐', title: '本当の空き状況', text: '店の営業時間と照らし合わせた枠だけ。' },
        { icon: '👤', title: '担当をお選びいただけます', text: '指名なしでも承ります。' },
        { icon: '🔔', title: '前日のお知らせ', text: 'ご来店前日にメールが届きます。' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'メニュー',
          title: 'カット、シェービング、ケア',
          text: 'メニューごとに所要時間が決まっているので、必要な分だけ枠を押さえます。',
          items: [
            { icon: '✂️', title: 'カット · 60分', text: 'カウンセリング、カット、仕上げ。' },
            { icon: '🪒', title: 'シェービング · 45分', text: 'ホットタオルとレザー。' },
            { icon: '💎', title: 'プレミアム · 120分', text: 'カット、シェービング、頭皮ケア。' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'ご予約',
          title: '3回のタップで予約完了',
          text: '',
          items: [
            { icon: '1', title: 'メニューを選ぶ', text: '所要時間は自動で入ります。' },
            { icon: '2', title: '担当を選ぶ', text: '指名なしも選べます。' },
            { icon: '3', title: '時間を選ぶ', text: '変更・キャンセルは専用リンクから。' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: '初めてのご来店ですか？', text: '当日の流れをお読みいただいてから、お席をご予約ください。', items: [] },
      ],
      footerNote: '黒羽 Kurohane Barber Studio · 東京',
    },
  },

  arden: {
    en: {
      brandName: 'Arden Property Auction',
      nav: ['Lots', 'Calendar', 'How to buy', 'Contact'],
      accent: '#7c5e2a',
      hero: {
        eyebrow: 'Property auction house',
        headline: 'Exceptional properties, transparently auctioned',
        subheadline: 'Every lot published with its guide price, legal pack and auction date. Bidding happens in the room — the catalogue lives here.',
        primaryCta: 'Browse the catalogue',
        secondaryCta: 'See auction dates',
        icon: '🏛️',
      },
      highlights: [
        { icon: '📄', title: 'Legal pack upfront', text: 'Documents available before you commit.' },
        { icon: '📅', title: 'Dates published early', text: 'Viewings and auction days in one calendar.' },
        { icon: '🔍', title: 'Searchable catalogue', text: 'Filter by type, tenure and location.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'The catalogue',
          title: 'Residential, commercial and land',
          text: 'Each lot carries its guide price, tenure and the session it belongs to.',
          items: [
            { icon: '🏠', title: 'Residential', text: 'Houses and apartments, vacant or tenanted.' },
            { icon: '🏢', title: 'Commercial', text: 'Retail, office and mixed-use.' },
            { icon: '🌳', title: 'Land', text: 'Development plots with planning notes.' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'How to buy',
          title: 'What happens before auction day',
          text: 'The site gets you ready; the bidding itself is handled in the room.',
          items: [
            { icon: '1', title: 'Read the legal pack', text: 'Downloadable from the lot page.' },
            { icon: '2', title: 'Book a viewing', text: 'Request a slot through the site.' },
            { icon: '3', title: 'Register to bid', text: 'We confirm your eligibility directly.' },
          ],
        },
        {
          kind: 'split',
          eyebrow: 'Selling',
          title: 'Thinking of entering a lot?',
          text: 'Send the details and our team comes back with an appraisal and a recommended guide price.',
          items: [
            { icon: '📐', title: 'Free appraisal', text: 'No obligation to proceed.' },
            { icon: '📣', title: 'Catalogue exposure', text: 'Listed to our registered buyers.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Next auction is open for registration', text: 'See the lots and book a viewing before the catalogue closes.', items: [] },
      ],
      footerNote: 'Arden Property Auction · London',
    },
    id: {
      brandName: 'Arden Property Auction',
      nav: ['Lot', 'Kalender', 'Cara membeli', 'Kontak'],
      accent: '#7c5e2a',
      hero: {
        eyebrow: 'Rumah lelang properti',
        headline: 'Properti istimewa, dilelang secara transparan',
        subheadline: 'Setiap lot diterbitkan bersama harga acuan, dokumen legal, dan tanggal lelangnya. Penawaran dilakukan di ruang lelang — katalognya ada di sini.',
        primaryCta: 'Lihat katalog',
        secondaryCta: 'Jadwal lelang',
        icon: '🏛️',
      },
      highlights: [
        { icon: '📄', title: 'Dokumen legal di depan', text: 'Tersedia sebelum Anda memutuskan.' },
        { icon: '📅', title: 'Jadwal terbit lebih awal', text: 'Hari tinjau dan hari lelang dalam satu kalender.' },
        { icon: '🔍', title: 'Katalog bisa dicari', text: 'Filter menurut jenis, status, dan lokasi.' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'Katalog',
          title: 'Hunian, komersial, dan tanah',
          text: 'Setiap lot membawa harga acuan, status kepemilikan, dan sesi lelangnya.',
          items: [
            { icon: '🏠', title: 'Hunian', text: 'Rumah dan apartemen, kosong atau tersewa.' },
            { icon: '🏢', title: 'Komersial', text: 'Retail, kantor, dan penggunaan campuran.' },
            { icon: '🌳', title: 'Tanah', text: 'Kavling pengembangan dengan catatan perizinan.' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'Cara membeli',
          title: 'Yang terjadi sebelum hari lelang',
          text: 'Website menyiapkan Anda; penawarannya sendiri ditangani di ruang lelang.',
          items: [
            { icon: '1', title: 'Baca dokumen legal', text: 'Bisa diunduh dari halaman lot.' },
            { icon: '2', title: 'Jadwalkan tinjauan', text: 'Ajukan waktunya lewat website.' },
            { icon: '3', title: 'Daftar sebagai peserta', text: 'Kelayakan kami konfirmasi langsung.' },
          ],
        },
        {
          kind: 'split',
          eyebrow: 'Menjual',
          title: 'Ingin memasukkan lot?',
          text: 'Kirim detailnya dan tim kami membalas dengan penilaian serta usulan harga acuan.',
          items: [
            { icon: '📐', title: 'Penilaian gratis', text: 'Tanpa kewajiban melanjutkan.' },
            { icon: '📣', title: 'Tayang di katalog', text: 'Tampil ke pembeli terdaftar kami.' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: 'Lelang berikutnya sudah dibuka', text: 'Lihat lot-nya dan jadwalkan tinjauan sebelum katalog ditutup.', items: [] },
      ],
      footerNote: 'Arden Property Auction · London',
    },
    ja: {
      brandName: 'Arden Property Auction',
      nav: ['出品物件', '開催日程', 'ご購入の流れ', 'お問い合わせ'],
      accent: '#7c5e2a',
      hero: {
        eyebrow: '不動産オークションハウス',
        headline: '確かな物件を、透明な競売で',
        subheadline: 'すべての物件を参考価格・重要書類・開催日とともに掲載します。入札は会場で、カタログはここで。',
        primaryCta: 'カタログを見る',
        secondaryCta: '開催日程を見る',
        icon: '🏛️',
      },
      highlights: [
        { icon: '📄', title: '書類は事前に公開', text: '判断する前に内容を確認できます。' },
        { icon: '📅', title: '日程は早めに掲載', text: '内覧日と開催日を一つのカレンダーに。' },
        { icon: '🔍', title: '検索できるカタログ', text: '種別・権利形態・所在地で絞り込み。' },
      ],
      sections: [
        {
          kind: 'cards',
          eyebrow: 'カタログ',
          title: '住宅、商業、土地',
          text: '物件ごとに参考価格、権利形態、該当する開催回を記載しています。',
          items: [
            { icon: '🏠', title: '住宅', text: '戸建てと集合住宅。空室・賃貸中いずれも。' },
            { icon: '🏢', title: '商業', text: '店舗、オフィス、複合用途。' },
            { icon: '🌳', title: '土地', text: '開発用地。許認可の注記つき。' },
          ],
        },
        {
          kind: 'steps',
          eyebrow: 'ご購入の流れ',
          title: '開催日までに済ませること',
          text: 'サイトは準備のためのもので、入札そのものは会場で行います。',
          items: [
            { icon: '1', title: '重要書類を読む', text: '物件ページからダウンロードできます。' },
            { icon: '2', title: '内覧を予約する', text: 'サイトから希望日をお申し込みください。' },
            { icon: '3', title: '参加登録をする', text: '参加資格はこちらで直接確認します。' },
          ],
        },
        {
          kind: 'split',
          eyebrow: 'ご出品',
          title: '物件の出品をお考えですか？',
          text: '詳細をお送りいただければ、査定と参考価格のご提案をお返しします。',
          items: [
            { icon: '📐', title: '査定は無料', text: 'そのまま進める義務はありません。' },
            { icon: '📣', title: 'カタログ掲載', text: '登録済みの買い手にお届けします。' },
          ],
        },
        { kind: 'cta', eyebrow: '', title: '次回開催の参加登録を受付中', text: 'カタログ締切までに物件をご覧いただき、内覧をご予約ください。', items: [] },
      ],
      footerNote: 'Arden Property Auction · ロンドン',
    },
  },
};
