/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * るびこん ビルド設定。
 * - 配信: Cloudflare Pages のサブドメイン rubicon.pages.dev（ルート運用）。
 *   そのため base は '/'（既定）。`/rubicon/` プレフィックスは使わない。
 * - セキュリティヘッダ(CSP等)は public/_headers で Cloudflare Pages 側が付与する。
 * - MPA構成: 各HTMLページを rollupOptions.input に列挙する。
 *   main=本体(変換ツール) / privacy=プライバシーページ。
 *   今後のSEO用サブページ(guide/faq/about/sites)もここへ追加する。
 */
export default defineConfig({
  base: '/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        privacy: path.resolve(__dirname, 'privacy/index.html'),
        faq: path.resolve(__dirname, 'faq/index.html'),
        guide: path.resolve(__dirname, 'guide/index.html'),
        about: path.resolve(__dirname, 'about/index.html'),
        sites: path.resolve(__dirname, 'sites/index.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
