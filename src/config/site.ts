// Business details shown across the site. Empty social links are hidden automatically.
const env = import.meta.env;

export const SITE = {
  name: 'Skyland Project Studio',
  shortName: 'Skyland',
  url: (env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, ''),
  founder: {
    name: 'Muhammad Alfarizi Tazkia',
    role: { en: 'Founder & Web Developer', id: 'Founder & Web Developer', ja: 'ファウンダー兼開発者' },
  },
  email: env.PUBLIC_CONTACT_EMAIL || '',
  whatsapp: (env.PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  city: 'Kanagawa',
  region: 'Kanagawa',
  country: 'JP',
  socials: {
    linkedin: '',
    github: '',
    instagram: '',
    dribbble: '',
  } as Record<string, string>,
  gscVerification: env.PUBLIC_GSC_VERIFICATION || '',
  turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || '',
};

export const whatsappLink = (text = '') =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';

export const socialLinks = () =>
  Object.entries(SITE.socials)
    .filter(([, href]) => href)
    .map(([key, href]) => ({ key, href, label: key === 'linkedin' ? 'LinkedIn' : key === 'github' ? 'GitHub' : key[0].toUpperCase() + key.slice(1) }));
