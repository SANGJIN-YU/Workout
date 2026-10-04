import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL: 실제 도메인 (예: https://example.co.kr). 도메인 구매 전에는 기본값으로 빌드된다.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
