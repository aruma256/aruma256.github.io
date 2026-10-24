// @ts-check
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import remarkCjkFriendly from 'remark-cjk-friendly';

export default defineConfig({
  site: 'https://aruma256.dev',
  // URL は拡張子・末尾スラッシュなし (/posts/slug, /profile)。
  // Cloudflare の html_handling (auto-trailing-slash) が posts/slug.html を /posts/slug で配信する
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  markdown: {
    // デフォルトの Sätteri には CJK 向けの強調補正がないため、remark/rehype を使う
    processor: unified({
      // `**「強調」**です` のように、日本語の約物に隣接する強調も効くようにする
      remarkPlugins: [remarkCjkFriendly],
      // 原文の引用符や "..." をそのまま出す (コードを含むインライン SVG などが書き換わらないように)
      smartypants: false,
    }),
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
