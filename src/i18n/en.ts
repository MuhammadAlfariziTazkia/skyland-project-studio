import type { Currency } from '../lib/schemas';
import type { ServiceKey } from './routes';

export interface ProjectCopy {
  key: 'fikrmate' | 'bunsky';
  name: string;
  category: string;
  type: string;
  tagline: string;
  challenge: string;
  built: string;
  highlights: string[];
  url: string;
  host: string;
  service: ServiceKey;
}

export interface ServiceCopy {
  name: string;
  desc: string;
  forWho: string;
  headline: string;
  url: string;
  seo: {
    title: string;
    description: string;
    h1: string;
    intro: string;
    benefits: [string, string][];
    faqs: [string, string][];
  };
}

const en = {
  lang: 'en',
  currency: 'USD' as Currency,
  meta: {
    homeTitle: 'Website Development Services with Fixed Prices | Skyland Project Studio',
    homeDescription:
      'Professional website development for businesses worldwide. Describe your idea, get an AI-generated plan, design preview and a fixed price in minutes, then we build it. Company profiles, online stores, web apps.',
    consultTitle: 'Free AI Website Consultation: Get a Fixed Price in Minutes | Skyland',
    consultDescription:
      'Describe the website you need and our AI consultant turns it into pages, features, a homepage mockup and a fixed price. Free, no sign-up, no commitment.',
    ogAlt: 'Skyland Project Studio: modern websites with a fixed price',
  },
  nav: {
    services: 'Services',
    how: 'How It Works',
    work: 'Work',
    why: 'Why Us',
    faq: 'FAQ',
    cta: 'Free Consultation',
    menu: 'Menu',
    close: 'Close',
    switchLang: 'Bahasa Indonesia',
    switchLangShort: 'ID',
  },
  hero: {
    badge: (pct: number, spots: number) => `Founding client offer: ${pct}% off our first ${spots} projects`,
    titleA: 'We Build Modern Websites for',
    titleB: 'Ambitious Businesses',
    lead: 'Tell us your idea. Our AI consultant turns it into a clear website plan, design preview and a fixed price in minutes. Then our team builds it.',
    primary: 'Start Free AI Consultation',
    secondary: 'See Our Work',
    checks: ['Fixed price before you pay', 'Pay in stages', 'Work directly with the builder'],
    planCard: ['AI plan ready', '5 pages · 8 features'],
    priceCard: (price: string) => [`Fixed price: ${price}`, 'Locked before you pay'],
    note: ['Great Websites', 'Greater Businesses'],
    laptopAlt: 'Example of a professional company profile website designed by Skyland, shown on a laptop',
  },
  services: {
    eyebrow: 'SERVICES',
    title: "Whatever you're building, we'll build it right",
    lead: 'From a one-page campaign to your own digital platform.',
    range: 'Typical range',
    greatFor: 'Great for',
    exact: 'Get your exact price in minutes.',
    try: 'Try the free AI consultation',
    details: 'Details',
  },
  how: {
    eyebrow: '✦ AI CONSULTATION · FREE',
    title: 'Know your exact price before you order',
    lead: 'Describe your project, shape the plan with AI, and get a fixed price you can budget for. No hidden fees, no surprises later.',
    steps: [
      ['Describe your website', 'Explain your business, goals and the features you need, in as much detail as you like.'],
      ['Review & revise the plan', 'Get suggested pages, features and content. Remove or add anything.'],
      ['Choose a theme', 'Pick the visual style that matches your brand.'],
      ['See your mockup & fixed price', 'Preview your homepage and get the final price, the same price you will pay.'],
    ] as [string, string][],
    cta: 'Get My Fixed Price',
    checks: ['Price locked in writing', 'Free, no commitment'],
    consultant: 'Skyland AI Consultant',
    stepOf: (n: number) => `Step ${n} of 4`,
    demo: {
      describeTitle: 'Describe the website you want',
      describeHint: 'The more detail you share, the more accurate your plan.',
      sample:
        'I run a coffee shop in Bandung for students and young workers. I want a modern, minimal website with our menu, our story, location and online ordering for pickup.',
      tip: 'Tip: mention your audience and must-have features',
      chips: ['+ Target audience', '+ Must-have features', '+ Reference websites'],
      generate: 'Generate my plan',
      structure: 'Recommended structure',
      pages: [
        ['Home', 'Hero, best sellers, CTA'],
        ['Menu', 'Menu, online ordering'],
        ['Our Story', 'Story, team, values'],
        ['Location', 'Map, hours, contact'],
      ] as [string, string][],
      ask: 'On the Menu page, can customers also reserve a table?',
      added: '✓ Added “Table reservation” to Menu',
      pickStyle: 'Pick a style for your brand',
      priceLabel: 'Your fixed price · 5 pages · 6 features',
      final: '✓ Final price, no hidden fees',
      order: 'Order this project',
    },
  },
  work: {
    eyebrow: 'SELECTED WORK',
    title: 'Small studio. Serious craft.',
    lead: "We're a new studio, so every project gets our full attention. Here's what we've shipped so far.",
    challengeLabel: 'CHALLENGE',
    builtLabel: 'WHAT WE BUILT',
    visit: 'Visit live site',
    similar: 'Similar service',
    desktopAlt: (name: string) => `${name} website on desktop`,
    mobileAlt: (name: string) => `${name} website on mobile`,
    projects: [
      {
        key: 'fikrmate',
        name: 'FikrMate',
        category: 'SaaS · Web app',
        type: 'AI learning platform',
        tagline: 'You choose what to learn. I’ll organize what comes next.',
        challenge: 'Self-learners drown in scattered material with no structure, no rhythm and no one to keep the next step ready.',
        built:
          'A web app that turns a short learning brief into an AI-generated curriculum and delivers scheduled lessons by email (PDF) or on the web, with multilingual content, an AI lesson tutor and subscription plans.',
        highlights: ['AI curriculum engine', 'Scheduled email delivery', 'Subscriptions & credits', 'Multilingual'],
        url: 'https://fikrmate.com',
        host: 'fikrmate.com',
        service: 'web_app',
      },
      {
        key: 'bunsky',
        name: 'Rumah Belajar Bunsky',
        category: 'Landing page · Education',
        type: 'Private tutoring for grades 1–6',
        tagline: 'Personal learning support so children grow more focused and confident.',
        challenge: 'A new private tutoring service needed to earn parents’ trust online and turn their interest into registrations, without a complicated system.',
        built:
          'A warm, elegant landing page that explains the TKA-prep and school-subject programs, the six subjects, learning targets and a simple 3-step sign-up, with one-tap WhatsApp registration and a mobile-first layout.',
        highlights: ['WhatsApp registration', 'Programs & subjects', '3-step sign-up', 'Mobile-first'],
        url: 'https://rumah-belajar-bunsky.vercel.app/',
        host: 'rumah-belajar-bunsky.vercel.app',
        service: 'landing',
      },
    ] as ProjectCopy[],
    nextTitle: 'Your project could be next.',
    nextText: (pct: number) => `Founding clients get ${pct}% off and priority attention.`,
    nextCta: 'See the founding offer',
  },
  why: {
    eyebrow: 'WHY SKYLAND',
    title: 'A new studio, with promises in writing',
    hi: "Hi, I'm Alfarizi",
    bio: 'I started Skyland to give businesses a clear plan, an honest price and a website built with care. You work with me directly, from the first message to launch, and I stay around after it goes live.',
    photoAlt: 'Muhammad Alfarizi Tazkia, founder of Skyland Project Studio, in Kyoto',
    note: "Let's build it together!",
    promises: [
      ['Fixed price, in writing', 'The price from your consultation is the price you pay. No hidden fees.'],
      ['Pay in stages', '50% to start, the rest only after you approve the finished site.'],
      ['You own everything', 'Code, domain, content and accounts are 100% yours.'],
      ['30 days of free support', 'Fixes and small changes after launch, on us.'],
    ] as [string, string][],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions, answered',
    lead: 'Still unsure?',
    chat: 'Chat with us on WhatsApp',
    leadEnd: "and we'll reply within the day.",
    items: [
      ["You're a new studio. Why should I trust you?", 'Fair question. That is why the price is fixed in writing before you pay, payment is split into stages, and you approve the design before we build. You also work with the founder directly.'],
      ['How is the AI price calculated?', 'The AI only maps your needs to our published price list: a base package per website type, extra pages by complexity and a catalog of features with fixed prices. The total is calculated by code from that list, not guessed by the AI, so the same plan always gets the same price.'],
      ['Is the AI consultation really free?', 'Yes. You get the full plan, a homepage mockup and a fixed price for free, without signing up. You only order if you are happy with it.'],
      ['How long does it take to build a website?', 'Most websites are done in 1–5 weeks. Your consultation shows the estimated timeline for your exact scope.'],
      ['How does payment work?', '50% down payment to start, 50% after you approve the finished website and before launch. Every step is agreed in writing first.'],
      ['Do you work with clients outside Indonesia?', 'Yes. We work remotely with clients worldwide, communicate in English or Indonesian, and quote in USD or IDR.'],
      ['What is not included in the price?', 'Domain and paid hosting (many sites can run on free hosting), third-party subscriptions, and maintenance after the 30-day support period. The consultation lists these separately.'],
      ['Do you provide support after launch?', 'Every project includes 30 days of free support, with optional monthly maintenance plans after that.'],
    ] as [string, string][],
  },
  offer: {
    eyebrow: 'FOUNDING CLIENT PROGRAM',
    title: (spots: number) => `Be one of our first ${spots} clients`,
    lead: (pct: number) => `Get ${pct}% off any project plus priority support. In return, we'd love your honest feedback once your site is live.`,
    left: (left: number, total: number) => `${left} of ${total} spots left`,
    full: 'All founding spots are taken. Thank you!',
    claim: 'Claim My Spot',
    talk: 'Talk to us first',
  },
  footer: {
    tagline: 'Modern websites for a brighter business.',
    explore: 'Explore',
    services: 'Services',
    contact: 'Contact',
    follow: 'Follow',
    rights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    location: 'Bandung, Indonesia · Working worldwide',
  },
  servicePage: {
    breadcrumbHome: 'Home',
    breadcrumbServices: 'Services',
    startsFrom: 'Starts from',
    typical: 'Typical range',
    timeline: 'Typical timeline',
    weeks: (a: number, b: number) => `${a}–${b} weeks`,
    included: 'Included in every project',
    includedItems: ['Responsive design for mobile & desktop', 'Basic SEO setup', 'SSL (https) & speed optimization', '2 design revision rounds', '30 days of free support', 'Full ownership of code & content'],
    packageIncludes: 'This package includes',
    pages: (n: number) => `Up to ${n} page${n > 1 ? 's' : ''}`,
    benefits: 'Why build it with Skyland',
    faq: 'Frequently asked questions',
    ctaTitle: 'Get your exact price in minutes',
    ctaText: 'Describe your project to our AI consultant and get pages, features, a mockup and a fixed price. Free.',
    other: 'Other services',
  },
  services_list: {} as Record<ServiceKey, ServiceCopy>,
};

en.services_list = {
  company_profile: {
    name: 'Company Profile',
    desc: 'Build credibility and turn visitors into clients.',
    forWho: 'SMEs, agencies, clinics, consultants',
    headline: 'Trusted Partner for Your Growth',
    url: 'yourcompany.com',
    seo: {
      title: 'Company Profile Website Development | Fixed Price | Skyland',
      description: 'Professional company profile websites that build trust and bring in leads. Mobile-friendly, SEO-ready, fixed price from the start.',
      h1: 'Company profile websites that win trust',
      intro: 'Your website is often the first meeting with a new client. We design a clear, fast company profile that explains what you do, shows proof and makes it easy to contact you.',
      benefits: [
        ['Look established from day one', 'A clean, modern design that matches your brand and builds instant credibility.'],
        ['Found on Google', 'Semantic structure, fast loading and on-page SEO so customers can find you.'],
        ['More inquiries', 'Clear calls to action, WhatsApp and contact forms on every page.'],
      ],
      faqs: [
        ['How many pages does a company profile need?', 'Most businesses need 4–6 pages: Home, About, Services, Portfolio or Clients, and Contact. The AI consultation suggests the right structure for you.'],
        ['Can I update the content myself?', 'Yes. Add the “Editable content via CMS” feature and you can change text and images without touching code.'],
      ],
    },
  },
  landing: {
    name: 'Landing Page',
    desc: 'One focused page for a product, campaign or event.',
    forWho: 'product launches, ads, events',
    headline: 'Launch Day Is Here',
    url: 'launch.yourbrand.com',
    seo: {
      title: 'Landing Page Development for Campaigns & Ads | Skyland',
      description: 'High-converting landing pages for product launches, ads and events. Fast, mobile-first and ready in about 1–2 weeks at a fixed price.',
      h1: 'Landing pages built to convert',
      intro: 'One page, one goal. We build focused landing pages that load fast, tell a clear story and push visitors to act, whether that is buying, booking or signing up.',
      benefits: [
        ['Built for ads', 'Fast loading and clear structure help your ad spend work harder.'],
        ['Ready quickly', 'Most landing pages are live in about 1–2 weeks.'],
        ['Measurable', 'Analytics and conversion tracking can be set up from day one.'],
      ],
      faqs: [
        ['What is the difference between a landing page and a website?', 'A landing page is a single page with one goal, ideal for campaigns. A website has several pages for a broader audience.'],
        ['Can you connect it to my ads and analytics?', 'Yes. Google Analytics, Search Console and pixel setup are available as small add-ons.'],
      ],
    },
  },
  online_store: {
    name: 'Online Store',
    desc: 'Sell online with products, cart, payments and orders.',
    forWho: 'retail, F&B, fashion, local brands',
    headline: 'New Season, Fresh Picks',
    url: 'shop.yourbrand.com',
    seo: {
      title: 'E-commerce Website Development | Online Store | Skyland',
      description: 'Custom online stores with product catalog, cart, payment gateway (Stripe, Midtrans, Xendit) and order management. Fixed price, you own everything.',
      h1: 'Online stores that are easy to buy from',
      intro: 'Sell directly to your customers without marketplace fees. We build fast online stores with a clean catalog, smooth checkout and the payment and shipping options your market expects.',
      benefits: [
        ['No marketplace commission', 'Your own store, your own customer data and margins.'],
        ['Payments that fit your market', 'Stripe for global customers, Midtrans or Xendit for Indonesia.'],
        ['Easy to manage', 'Manage products and orders from a simple admin.'],
      ],
      faqs: [
        ['Which payment gateways do you support?', 'Stripe, Midtrans and Xendit are the most common. Others can be quoted as an API integration.'],
        ['Can shipping costs be calculated automatically?', 'Yes, with the shipping calculator feature (e.g. RajaOngkir for Indonesian couriers).'],
      ],
    },
  },
  portfolio: {
    name: 'Personal Portfolio',
    desc: 'Showcase your work and build your personal brand.',
    forWho: 'freelancers, creatives, job seekers',
    headline: 'Hi, I Design Things People Love',
    url: 'yourname.com',
    seo: {
      title: 'Portfolio Website Development for Creatives & Professionals | Skyland',
      description: 'A personal portfolio website that showcases your best work and helps you get hired. Beautiful, fast and affordable with a fixed price.',
      h1: 'Portfolio websites that get you hired',
      intro: 'Stand out from a PDF CV or a crowded social profile. We build a personal site that presents your best work, your story and an easy way to contact you.',
      benefits: [
        ['Your work, front and center', 'Galleries and case studies that let your projects speak.'],
        ['A name people can search', 'Your own domain and SEO so recruiters and clients find you.'],
        ['Affordable', 'One of our lowest-cost packages, perfect for getting started.'],
      ],
      faqs: [
        ['Do I need my own domain?', 'It is recommended (about $12–20 per year) and we help you set it up.'],
        ['Can I add a blog later?', 'Yes. Features can be added any time with the same transparent price list.'],
      ],
    },
  },
  lms: {
    name: 'Online Course (LMS)',
    desc: 'Courses, quizzes, student progress and certificates.',
    forWho: 'schools, trainers, course creators',
    headline: 'Learn at Your Own Pace',
    url: 'learn.youracademy.com',
    seo: {
      title: 'Online Course & LMS Website Development | Skyland',
      description: 'Your own learning platform with courses, video lessons, quizzes, progress tracking and certificates. No per-student platform fees.',
      h1: 'Your own online course platform',
      intro: 'Teach on a platform you own. We build learning management systems with course players, quizzes, certificates and student progress, without monthly per-student fees.',
      benefits: [
        ['Own your students', 'No platform taking a cut of every sale.'],
        ['Complete learning flow', 'Lessons, quizzes, progress and certificates in one place.'],
        ['Room to grow', 'Add memberships, payments or AI features as you scale.'],
      ],
      faqs: [
        ['Can I sell courses on it?', 'Yes, combine the LMS with the payment gateway feature to sell courses directly.'],
        ['Where are the videos hosted?', 'We usually connect a video service (e.g. YouTube unlisted, Vimeo or Bunny Stream) to keep costs low.'],
      ],
    },
  },
  booking: {
    name: 'Booking & Reservation',
    desc: 'Let customers book appointments or tables online.',
    forWho: 'clinics, salons, restaurants, venues',
    headline: 'Book Your Visit in Seconds',
    url: 'book.yourplace.com',
    seo: {
      title: 'Booking & Reservation Website Development | Skyland',
      description: 'Online booking websites for clinics, salons, restaurants and venues: time slots, reminders and admin. Fixed price, built for your workflow.',
      h1: 'Online booking that fills your schedule',
      intro: 'Stop juggling bookings over chat. We build booking websites where customers pick a time slot themselves and you get notified instantly.',
      benefits: [
        ['Fewer no-shows', 'Automatic confirmations and reminders.'],
        ['24/7 bookings', 'Customers book any time, even while you sleep.'],
        ['Fits your workflow', 'Services, staff and time slots configured the way you work.'],
      ],
      faqs: [
        ['Can customers pay a deposit when booking?', 'Yes, add the payment gateway feature to collect deposits or full payment.'],
        ['Can reminders go to WhatsApp?', 'We can send email reminders and WhatsApp click-to-chat links; fully automated WhatsApp messages need a paid WhatsApp API.'],
      ],
    },
  },
  web_app: {
    name: 'Custom Web App',
    desc: 'Your own digital platform: dashboards, marketplaces, SaaS.',
    forWho: 'startups, internal tools, platforms',
    headline: 'Your Platform, Your Rules',
    url: 'app.yourstartup.com',
    seo: {
      title: 'Custom Web App Development for Startups & Businesses | Skyland',
      description: 'Custom web applications, SaaS, dashboards and internal tools. Clear scope, fixed price per phase, and you own the code.',
      h1: 'Custom web apps, built around your business',
      intro: 'When off-the-shelf tools do not fit, we build your own platform: SaaS products, dashboards, marketplaces and internal tools, including AI features.',
      benefits: [
        ['Clear scope first', 'The AI consultation maps features before any code is written.'],
        ['Modern, scalable stack', 'Fast, secure and cheap to host.'],
        ['AI-ready', 'Chatbots, generators and automations with LLM APIs.'],
      ],
      faqs: [
        ['Can large projects get a fixed price?', 'Yes. Very large scopes are flagged for a short call and usually split into phases, each with its own fixed price.'],
        ['Do I own the source code?', 'Always. Code, accounts and data are 100% yours.'],
      ],
    },
  },
  blog: {
    name: 'Blog & Media',
    desc: 'Publish articles and news that rank on Google.',
    forWho: 'writers, communities, media outlets',
    headline: 'Stories Worth Reading',
    url: 'yourmagazine.com',
    seo: {
      title: 'Blog & News Website Development | SEO-Friendly | Skyland',
      description: 'Fast, SEO-friendly blog and media websites with an easy CMS, categories and search. Fixed price, built to rank on Google.',
      h1: 'Blog & media websites built to rank',
      intro: 'Great writing deserves a fast, readable home. We build blogs and media sites with a simple CMS, clean typography and technical SEO baked in.',
      benefits: [
        ['Write with ease', 'A simple editor for publishing articles, images and categories.'],
        ['SEO-first', 'Structured data, sitemaps and fast pages that Google loves.'],
        ['Grow an audience', 'Newsletter signup and social sharing built in.'],
      ],
      faqs: [
        ['Which CMS do you use?', 'We pick a lightweight, low-cost CMS that fits your team, often a free headless CMS or markdown-based editor.'],
        ['Can you migrate my existing blog?', 'Yes, migration can be quoted as a custom item during the consultation.'],
      ],
    },
  },
};

export default en;
export type Dict = typeof en;
