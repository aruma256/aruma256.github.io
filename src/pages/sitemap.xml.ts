import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

// Search Console に登録済みの /sitemap.xml をそのまま維持するため、自前で生成する
export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((post) => !post.isLink);
  const pages = ['/', '/profile', '/posts', '/tags', ...posts.map((post) => post.url)];
  const lastmod = new Map(posts.map((post) => [post.url, post.date]));
  const urls = pages
    .map((path) => {
      const date = lastmod.get(path);
      return `  <url><loc>${new URL(path, context.site)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
