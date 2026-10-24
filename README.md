arumaのブログ [https://aruma256.dev/](https://aruma256.dev/) を管理するリポジトリです。

[Astro](https://astro.build/) で構築し、GitHub Actions で GitHub Pages にデプロイしています。

## 開発

```sh
npm ci
npm run dev      # http://localhost:4321/
npm run build    # dist/ に出力 (検索インデックスの生成を含む)
npm run preview  # ビルド結果の確認 (検索はこちらで動作する)
```

Docker を使う場合は `docker compose up`。

## 記事の書き方

`src/content/posts/YYYY/YYYY-MM-DD-slug.md` を作成します。URL は `/blog/YYYY/MM/DD/slug.html` になります。

```yaml
---
title: "記事タイトル"
tags:
    - タグ
toc: true # 目次を表示する場合
image: /assets/... # OGP 画像 (任意)
---
```

画像などは `public/assets/YYYY/YYYY-MM-DD-slug/` に置き、`/assets/...` で参照します。

### 外部寄稿記事 (link post)

`link` を指定すると、ブログ内にページは作られず、記事一覧のタイトルから寄稿先へ直接リンクします。
本文の最初の段落が一覧の抜粋として表示されます。

```yaml
---
title: "寄稿した記事のタイトル"
tags:
    - タグ
link: https://example.com/article/
---

会社のテックブログで記事を書きました。
```
