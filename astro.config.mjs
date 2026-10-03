// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { alternatesFor } from './src/i18n/routes.ts';

const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` || 'http://localhost:4321').replace(/\/$/, '');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  adapter: vercel({ maxDuration: 60 }),
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      serialize(item) {
        const links = alternatesFor(new URL(item.url).pathname, site);
        return links ? { ...item, links } : item;
      },
    }),
  ],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    plugins: [
      {
        // Vercel serves public/samples/<name>/index.html at /samples/<name>/; mirror that in `astro dev`.
        name: 'samples-dir-index',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const m = req.url?.match(/^(\/samples\/[\w-]+)\/?(\?.*)?$/);
            if (m) req.url = `${m[1]}/index.html${m[2] ?? ''}`;
            next();
          });
        },
      },
    ],
  },
});
