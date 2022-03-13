---
title: "GitHub Pagesで手軽にブログを始めよう"
categories:
    - blog
tags:
    - Jekyll
    - GitHub Pages
---

「ブログを作ろう！発信しよう！」というやる気は貴重なもの。  
冷めてしまう前にサクッと作ってしまいましょう。

### 気持ち・目的

* ブログをMarkdownで書いてGitHub上で管理したい。
* そのままGitHub Pagesで公開してしまおう。
* 手間は最小限で済ませたい。

### 方針

* Jekyll の [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) テーマを利用する。
* [Minimal Mistakes remote theme starter](https://github.com/mmistakes/mm-github-pages-starter) のテンプレートでリポジトリを用意する。

### 手順

1. [Minimal Mistakes remote theme starter](https://github.com/mmistakes/mm-github-pages-starter) の **Use this template** からリポジトリを作る。
    * リポジトリ名を `ユーザー名.github.io` （私なら `aruma256.github.io`）にすると、 https://ユーザー名.github.io/ で公開される。
1. 手元にcloneする。
1. `_config.yml` を編集する。
    * 必須 `title`, `description`, `author`, `footer` の内容を自分のものに置き換える。
        * `author` や `footer` で不要な項目はコメントアウトする。
    * その他のカスタマイズは本記事末尾のTipsに記載
1. `_pages/about.md` を編集する。
1. `_posts/` 内のサンプルを参考に、記事を書く。
1. 不要な `_posts/` 内のサンプルを削除する。
1. ここまで完了したらPushする。
1. GitHubのリポジトリの Settings - Pages - Source で、公開用ブランチを選択する。
1. リポジトリの Actions を見る。 `pages build and deployment` が緑色のチェックマークになれば公開成功！
    * Settings - Pages の "Your site is published at ..." が公開アドレス

### Tips

`_config.yml` 関連

* 投稿日の表示
    * `date_format: "%Y-%m-%d"` を追加
    * `defaults - values` に `show_date: true` を追加
* リードタイム非表示
    * `defaults - values - read_time` を `false` に変更
* 各記事のURLの形式変更
    * デフォルトはタイトルのみ
    * `defaults - values` に `permalink: /:categories/:year/:month/:day/:title.html` のようなフォーマット指定を追加
* 記事の表示幅を広げる
    * `defaults - values` に `classes: wide` を追加

その他

* 記事のパスは `_posts/` のサブディレクトリでもよい
    * 年別、月別など適度に整理しましょう
