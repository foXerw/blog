// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkD2 from './src/lib/remark-d2.mjs';

// site/base 由部署平台在构建时通过环境变量注入：
//  - GitHub Pages 项目页：SITE_URL=https://foxerw.github.io、BASE_PATH=/blog/
//  - Microverse / 根域名部署：设置 SITE_URL 即可，BASE_PATH 默认 '/'
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // ```d2 → 预渲染好的 public/d2/<hash>.{light,dark}.svg
    // 注意：这里要传 [插件, 选项] 元组，不能传已经调用过的 transformer。
    remarkPlugins: [[remarkD2, { base: process.env.BASE_PATH || '/' }]],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
