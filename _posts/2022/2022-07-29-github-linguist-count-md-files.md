---
title: "MarkdownファイルをGitHubリポジトリ言語統計のカウント対象する"
categories:
    - blog
tags:
    - GitHub
toc: true
---

MarkdownファイルをGitHubの言語統計のカウント対象に設定する方法を説明する。  
特にMarkdownがメインのリポジトリは、この方法を適用して「Markdownがメインであること」を明示すると親切。

before

<img src="/assets/2022/2022-07-29-github-linguist-count-md-files/linguist-stat-before.png" width="50%" />

多数あるMarkdownファイルがカウントされず、Gemfileなどわずかなコード片から言語統計が作られてしまっている

after

<img src="/assets/2022/2022-07-29-github-linguist-count-md-files/linguist-stat-after.png" width="50%" />

<img src="/assets/2022/2022-07-29-github-linguist-count-md-files/linguist-summary-after.png" width="50%" />

リポジトリ一覧の言語表示もJavaからMarkdownに変わった



# 先に答え

1. `.gitattributes` ファイルが存在しなければ作る
1. そのファイルに `*.md linguist-detectable=true` を追記する（Markdownの拡張子として `.md` を使っている場合）
1. git管理対象にしてGitHubにpushする

# 仕組み

GitHubでの言語判定や統計算出には[Linguist](https://github.com/github/linguist)が使われている。  
Linguistでは、各言語の拡張子やカラー、**type**などが予め設定されている。

## type

type属性では、その言語で記述されたファイルに対し、`data`, `programming`, `markup`, `prose` といった種別を指定する。

[デフォルトでは、Markdownのtypeは prose となっている](https://github.com/github/linguist/blob/249bbd1c2ffc631ca2ec628da26be5800eec3d48/lib/linguist/languages.yml#L3790-L3800)が、

> By default only languages of type programming or markup in languages.yml are included in the language statistics.

[https://github.com/github/linguist/blob/master/docs/overrides.md#detectable](https://github.com/github/linguist/blob/master/docs/overrides.md#detectable)

の通り、 type:prose は統計対象外にされている。このため、Markdownはカウントされない。

## 設定のオーバーライド

linguistの挙動は上記リンクに記載の通り、 `.gitattributes` ファイルによってオーバーライドすることができる。

今回は、指定に合致するファイルをtypeによらず統計の対象とする`linguist-detectable`を使う。

```
*.md linguist-detectable=true
```

上記内容を含む `.gitattributes` ファイルをGitHubに置くことで、拡張子`md`のファイルを統計対象にできる　という仕組み。
