---
title: "GitHub Pagesで手軽にブログを始める"
categories:
    - blog
tags:
    - Jekyll
    - GitHub Pages
---

### 気持ち・目的

* ブログをMarkdownで書いてGitHub上で管理したい。
* そのままGitHub Pagesで公開してしまおう。
* 手間は最小限で済ませたい。

「ブログを作ろう！発信しよう！」というやる気は貴重なもの。  
冷めてしまう前にサクッと作ってしまいましょう。

### 方針

* Jekyll の [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) テーマを利用する。
* [Minimal Mistakes remote theme starter](https://github.com/mmistakes/mm-github-pages-starter) のテンプレートでリポジトリを用意する。

### 手順

1. [Minimal Mistakes remote theme starter](https://github.com/mmistakes/mm-github-pages-starter) の **Use this template** からリポジトリを作る。
    * リポジトリ名を `ユーザー名.github.io` （私なら `aruma256.github.io`）にすると、 https://ユーザー名.github.io/ で公開される。
1. 手元にcloneする。
1. `_config.yml` を編集する。
    * `title`, `description`, `author`, `footer` の内容を自分のものに置き換える。
        * `author` や `footer` で不要な項目はコメントアウトする。
1. `_pages/about.md` を編集する。
1. `_posts/` 内のサンプルを参考に、記事を書く。
1. 不要な `_posts/` 内のサンプルを削除する。
1. ここまで完了したらPushする。
1. GitHubのリポジトリの Settings - Pages - Source で、公開用ブランチを選択する。
1. リポジトリの Actions を見る。 `pages build and deployment` が緑色のチェックマークになれば公開成功！
    * Settings - Pages の "Your site is published at ..." が公開アドレス
