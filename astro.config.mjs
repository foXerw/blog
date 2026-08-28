// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// site/base 由部署平台在构建时通过环境变量注入：
//  - GitHub Pages 项目页：SITE_URL=https://foxerw.github.io、BASE_PATH=/personal-blog/
//  - Microverse / 根域名部署：设置 SITE_URL 即可，BASE_PATH 默认 '/'
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
