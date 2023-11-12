---
title: "GitHub Pages はデフォルトドメインで運用中でもカスタムドメインへ移転できるし301リダイレクトもできる"
categories:
    - blog
tags:
    - GitHub Pages
toc: true
---

運用中の GitHub Pages をデフォルトの `[username].github.io` から カスタムドメインへ変更したくなり色々調べた結果、簡単にできることがわかったのでメモします。

# どうやるか

ユーザーサイトを管理するリポジトリ（ `[username].github.io` ）の設定画面からカスタムドメインを設定し、DNSの設定を行うだけです。

実際に [https://aruma256.github.io/](https://aruma256.github.io/) へアクセスしてみると、301リダイレクトされて [https://aruma256.dev/](https://aruma256.dev/) へ遷移することが確認できます。

curlで確認すると以下のようになります。（抜粋）
```
# curl -I https://aruma256.github.io/
HTTP/2 301 
server: GitHub.com
content-type: text/html
location: https://aruma256.dev/
```

以降は背景や調べたことを書いていきます。

# 背景・モチベ

* aruma256.dev というドメインを持ってはいたものの、publicな用途で使えていなかった
* 今後、ホスティングサービスの乗り換えがあるかもしれないので、いつでも移転できるようにしたい
    * （気軽に他のホスティングサービスやおうちサーバーなどを試して遊べる状態にしたい、が正しいかもしれない）
* `aruma256.github.io` を使い始めてそれほど経っていない（1年半程度）ので、移転するなら今のうちがよさそう

# 困りごと

* GitHub Pages のユーザーサイトは1つしか作れない。つまり、デフォルトの `[username].github.io` とカスタムドメインの両方を運用することはできない
    * ということは、移転の際には GitHub Pages は `[username].github.io` からのリダイレクト用に残し、新ドメインは別のホスティングサービスで運用する必要があるのでは？
* GitHub Pages で301リダイレクトできなさそう
    * JavaScriptなどでリダイレクトすることになるのか？

# 移転の流れ

予め、お好きなドメインを取得しておきます。  
GitHub Pages のユーザーサイトを管理するリポジトリ（ `[username].github.io` ）のPages設定を開き、Custom domain に取得したドメインを入力します。

![GitHub Pages の設定画面](/assets/2023/2023-11-13-github-pages-custom-domain/github_pages_input_custom_doamin.png)

すると、主ブランチにてリポジトリ直下に `CNAME` ファイルが作成されます。これは先程入力したドメインを記述したテキストファイルです。  
[実際のコミットがこちら](https://github.com/aruma256/aruma256.github.io/commit/ba02b99165ac1ede04629c49832cf04bd35e1ca3)  
この `CNAME` ファイルにより、記載されているドメインへ301リダイレクトが行われるようになります。この時点で実際に試してみるとよいです。

なお、カスタムドメインとしてはApexドメインとサブドメインの両方が使えますが、GitHub Pages のドキュメントでは `www` サブドメインの使用が推奨されていました。([ref](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#supported-custom-domains))

# DNSの設定

Apexドメインを使う場合とサブドメインを使う場合で設定が異なります。  
今回はApexドメインのみを対象とします。サブドメインの場合については[公式ドキュメント](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)を参考にしてください。

Apexドメインを使う場合、当然ながらAレコードの設定が必要です。[公式ドキュメント](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)を参考に設定しましょう。  
なお、執筆時点では以下の4つに対しAレコードを追加するように案内されていました。
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
AAAAレコードも追加しておくとよいでしょう。

私の場合はムームードメインを使っているので、ムームーDNSのカスタム設定画面から以下のように設定しました。

![ムームーDNSのカスタム設定画面](/assets/2023/2023-11-13-github-pages-custom-domain/muumuu_dns.png)

なお、公式ドキュメントではApexドメインを使う場合にも `www` サブドメインの設定を行うことが推奨されています。

設定を済ませ反映されたら、`dig` コマンドなどで確認してみましょう。

（一部抜粋）
```
# dig aruma256.dev

;; QUESTION SECTION:
;aruma256.dev.                  IN      A

;; ANSWER SECTION:
aruma256.dev.           3600    IN      A       185.199.108.153
aruma256.dev.           3600    IN      A       185.199.110.153
aruma256.dev.           3600    IN      A       185.199.111.153
aruma256.dev.           3600    IN      A       185.199.109.153
```

Aレコード、ヨシ！

GitHubリポジトリのPages設定に戻り、Custom domain の欄に `DNS check successful` と表示されていればOKです。

![GitHub Pages の設定画面](/assets/2023/2023-11-13-github-pages-custom-domain/dns_check_successful.png)

Google Search Console などを利用している場合は、そちらの設定も忘れずに行いましょう。

お疲れ様でした。
