import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // site（公開URL）はホスティング側のリポジトリで設定する。OSSリポには特定ドメインを含めない
  // sitemapは site が設定されている環境でのみ生成される（未設定ではスキップ）
  devToolbar: { enabled: false },
  integrations: [preact(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
