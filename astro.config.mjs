// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tmcgovern.me',
  trailingSlash: 'always',
  integrations: [sitemap()],
  adapter: cloudflare({ imageService: 'compile' }),
  build: {
    // embed styles in each page so a failed/blocked CSS request
    // can never produce an unstyled page
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
