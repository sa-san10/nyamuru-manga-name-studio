import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// file:// のダブルクリック起動用に、CSS・JS・アイコンをすべて1つのHTMLへインライン化する
export default defineConfig({
  root: 'standalone',
  publicDir: false,
  plugins: [
    tailwindcss(),
    viteSingleFile(),
    {
      name: 'copy-third-party-notices',
      closeBundle() {
        copyFileSync(
          resolve(import.meta.dirname, 'public/THIRD_PARTY_NOTICES.txt'),
          resolve(import.meta.dirname, 'dist-standalone/THIRD_PARTY_NOTICES.txt'),
        );
      },
    },
  ],
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  define: { 'import.meta.env.PUBLIC_STANDALONE': 'true' },
  build: {
    outDir: resolve(import.meta.dirname, 'dist-standalone'),
    emptyOutDir: true,
  },
});
