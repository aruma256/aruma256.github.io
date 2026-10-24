import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPosts, pubDate } from '../lib/posts';

export async function GET(context: APIContext) {
  const site = context.site!;
  // フィードリーダーで壊れないよう、本文中のサイト内リンク・画像を絶対 URL にする
  const absolutize = (html: string) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${site.origin}/`);
  const posts = await getPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: posts.map((post) => ({
      title: post.title,
      link: post.url,
      pubDate: pubDate(post),
      description: post.excerpt,
      content: post.isLink ? undefined : absolutize(post.entry.rendered?.html ?? ''),
      categories: post.tags,
    })),
    customData: '<language>ja</language>',
  });
}
