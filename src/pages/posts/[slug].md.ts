import type { APIContext } from 'astro';
import { getPosts, type Post } from '../../lib/posts';

// AI エージェント向けに、記事を Markdown のまま /posts/slug.md で配信する
export async function getStaticPaths() {
  const posts = (await getPosts()).filter((post) => !post.isLink);
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}

export function GET({ props, site }: APIContext<{ post: Post }>) {
  const { post } = props;
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${post.date}`,
    `tags: ${JSON.stringify(post.tags)}`,
    `url: ${new URL(post.url, site)}`,
    '---',
  ].join('\n');
  const body = `${frontmatter}\n\n${post.entry.body?.trim() ?? ''}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
