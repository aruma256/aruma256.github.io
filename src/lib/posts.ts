import { getCollection, type CollectionEntry } from 'astro:content';

export interface Post {
  entry: CollectionEntry<'posts'>;
  title: string;
  /** JST の日付 (YYYY-MM-DD) */
  date: string;
  slug: string;
  tags: string[];
  /** 外部寄稿記事なら true */
  isLink: boolean;
  /** 一覧やフィードで使うリンク先。link post なら寄稿先の URL */
  url: string;
  excerpt: string;
}

const FILENAME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, '&');
}

/** 本文で最初に現れる、テキストを含む段落を抜き出す (Jekyll の excerpt 相当) */
function extractExcerpt(html: string): string {
  for (const [, inner] of html.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return '';
}

function toPost(entry: CollectionEntry<'posts'>): Post {
  const m = entry.id.match(FILENAME_PATTERN);
  if (!m) throw new Error(`記事のファイル名は YYYY-MM-DD-slug.md の形式にしてください: ${entry.id}`);
  const [, year, month, day, slug] = m;
  const isLink = entry.data.link !== undefined;
  return {
    entry,
    title: entry.data.title,
    date: `${year}-${month}-${day}`,
    slug,
    tags: entry.data.tags,
    isLink,
    url: entry.data.link ?? `/blog/${year}/${month}/${day}/${slug}.html`,
    excerpt: extractExcerpt(entry.rendered?.html ?? ''),
  };
}

/** 全記事を新しい順に返す */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('posts');
  return entries
    .map(toPost)
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export function pubDate(post: Post): Date {
  return new Date(`${post.date}T00:00:00+09:00`);
}
