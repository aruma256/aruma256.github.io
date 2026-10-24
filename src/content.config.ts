import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // ファイル名 (YYYY-MM-DD-slug) を ID にする
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).default([]),
    toc: z.boolean().default(false),
    // OGP やページ上部に使う画像
    image: z.string().optional(),
    // 外部寄稿記事 (link post)。指定するとブログ内にページは作られず、一覧からこの URL へ直接飛ぶ
    link: z.url().optional(),
  }),
});

export const collections = { posts };
