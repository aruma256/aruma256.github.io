import { getPosts, legacyUrl } from '../lib/posts';

// Cloudflare の _redirects を生成する。
// _ で始まるファイルは Astro のルーティング対象外なので、動的ルートで出力している
export function getStaticPaths() {
  return [{ params: { file: '_redirects' } }];
}

// 旧 URL (Jekyll / GitHub Pages 時代) から新 URL への恒久リダイレクト
export async function GET() {
  const posts = (await getPosts()).filter((post) => !post.isLink);
  const rules = [
    ...['profile', 'posts', 'tags', 'search'].map((page) => [`/${page}/`, `/${page}`]),
    ...posts.map((post) => [legacyUrl(post), post.url]),
  ];
  const body = rules.map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
