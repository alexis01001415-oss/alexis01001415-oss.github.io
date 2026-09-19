import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const site = env.PUBLIC_SITE_URL || 'https://duanor.example';
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  build: { inlineStylesheets: 'auto' },
});
