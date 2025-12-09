---
title: "Daily AlpacaHack でCTFデビューした　- day1～3 writeups"
categories:
    - blog
tags:
    - CTF
toc: true
---

[Daily AlpacaHack](https://alpacahack.com/daily) は、2025年12月1日から始まった毎日1問出題される初心者向けの常設CTFです。  
CTF（ほぼ）初挑戦の私が取り組んだ記録、解説と、その過程で得た気づきをまとめます。

2025/12/01～2025/12/03 の3問の内容が含まれます。

この記事は、[GMOぺパボ エンジニア Advent Calendar 2025 🎄会場](https://adventar.org/calendars/12190) の9日目です。

## Day1: AlpacaHack 2100

[https://alpacahack.com/daily/challenges/alpacahack-2100](https://alpacahack.com/daily/challenges/alpacahack-2100)

> フラグは Daily AlpacaHack の 2100年1月 のカレンダーにあるパカ

とのことです（親切なアルパカだ）。

カレンダーのUIを見てみると、「前の月」「次の月」ボタンのみがあります。素直に2100年まで進めるには、およそ12回*74年分の「次の月」ボタンを押す必要があり、なかなか大変そうです。  
とりあえず数回「次の月」ボタンを押してみると、URLのクエリパラメータが変化することに気づきました。

`?month=2026-01`  
`?month=2026-02`  
`?month=2026-03`  
…

ということは、ここを直接 `?month=2100-01` に書き換えれば良さそうです。  
実際にアクセスし、無事FLAGを入手できました。

### 感想や気づき

フロントのパラメータは信用するな、という基本的なセキュリティの教訓を改めて思い出しました。  
この件は単にカレンダーの表示月なので問題は無さそうですが、パラメータを操作されても機密性が保たれるように設計することが重要ですね。

（2100年の運営さんは、どうするんだろう…）

## Day2: a fact of CTF

[https://alpacahack.com/daily/challenges/a-fact-of-CTF](https://alpacahack.com/daily/challenges/a-fact-of-CTF)

問題を開くと tar.gz ファイルが置いてありました。適当にubuntuコンテナを立ち上げて展開してみると、 `chall.py`, `output.txt` の2つのファイルが出てきました。  
`chall.py` は、環境変数 `FLAG` を決まった手続きで変換して標準出力するスクリプトのようです。  
`output.txt` には `0x` から始まる16進数の文字列が書かれていました。この内容は、特定の `FLAG` を `chall.py` に渡した際の出力結果ではないかと推測しました。

`chall.py` の決まった手続きとは、具体的には「`昇順でn番目の素数 ** n番目の文字のコードポイント` の総積を求め、16進数表現に変換」のようです。確かに `output.txt` の末尾は0がいくつか連続していて、 2 * 5 が含まれていそうな雰囲気です。  
ということは、素因数分解して「昇順でn番目の素数がいくつ含まれるか」から、n番目の文字のコードポイントを逆算できそうです。  
（ここで改めて問題を見ると `Crypto` とあり、暗号解読系の問題のようでした。なるほど。）

シンプルな処理なので、久しぶりにAIサポート無しの温かみのある手打ちコーディングをしてみました。使い捨てコードなので、動けばヨシ！

```py
primes = [2]

for i in range(3, 300):
    if any(i % prime == 0 for prime in primes):
        continue
    primes.append(i)

with open('output.txt') as f:
    txt = f.read()

num = int(txt, 16)

decoded = []

for prime in primes:
    counter = 0
    while num % prime == 0:
        num //= prime
        counter += 1
    if counter != 0:
        decoded.append(chr(counter))

print(*decoded, sep='')
```

これを実行し、FLAGを入手できました。

### 感想や気づき

競プロのおかげで素数にビビらずに済みました。推理・暗号解読ゲームのような感覚で楽しく解けました。  
逆操作で容易に複合できる暗号では手順が流出すると一気に解読されてしまうことを改めて認識しました。

## Day3: Emojify

[https://alpacahack.com/daily/challenges/emojify](https://alpacahack.com/daily/challenges/emojify)

tar.gz ファイルとIPv4のURLがありました。tar.gz の中には、Dockerfile、compose.yaml、frontend/backend/secret ディレクトリが入っていました。3つのサービスをdocker composeで立ち上げる構成のようです。  
立ち上げて `/` にアクセスすると、以下のような画面が表示されました。

![emojifyの画面](/assets/2025/2025-12-08-daily-alpacahack/emojify.png)

各要素について詳しく見ていきます。

* frontend は、`/` に対し `index.html` を、 `/api` に対しては `waf` メソッド（怪しすぎる）を通した上で backend に問い合わせてレスポンスを返すようです。
* backend は、受け取ったパラメータを `node-emoji` に問い合わせて返すのみのシンプルなAPIサーバーです。node-emoji が見当たらない…と思ったら、package.json の依存関係にあり、 https://www.npmjs.com/package/node-emoji のようでした。
* secret は `/flag` エンドポイントを持つサーバーです。おそらく、機密情報を持つ内部サーバーのような設定でしょう。

通常のアクセスでは frontend と backend しか登場しないので、どちらかから secret にアクセスさせる必要があります。backend には隙が無さそうだったので、frontend から secret へのアクセスを目指すことにしました。

手始めに `http://localhost:3000/api?path=/emoji/pizza` を叩いてみると、🍕が返ってきました。  
frontend は `waf` メソッドを通した後に `new URL(path, "http://backend:3000")` によってURLを生成しているようです。今回は `path` = `"/emoji/pizza"` なので、`http://backend:3000/emoji/pizza` というURLが組み立てられたことになります。

[node v25.2.1 の `new URL(input[, base])` のドキュメント](https://nodejs.org/docs/v25.2.1/api/url.html#new-urlinput-base)を見てみると、

> If `input` is relative, then `base` is required. If `input` is absolute, the `base` is ignored. 

とありました。つまり、 `path` に絶対URLを渡せば、 `base` は無視され、任意のURLにアクセスさせることができそうです。  
しかし、 `http://localhost:3000/api?path=http://secret:1337/flag` を叩いてみると、`Invalid 1` というレスポンスが返ってきました。

`waf` メソッドは

* `path` がstring以外なら、 `Invalid types` 例外
* `path` が `/` から始まっていないなら、 `Invalid 1` 例外
* `path` に `emoji` が含まれていないなら、 `Invalid 2` 例外

というチェックを行っていました。  
整理すると、「`new URL(path, "http://backend:3000")` を `http://secret:1337/flag` とするために `path` に絶対パスを渡したいが、`path` は `/` で始まる必要がある」という状況です。

URLの仕様でこれを実現できそうなものを探すため [https://developer.mozilla.org/ja/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL](https://developer.mozilla.org/ja/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL) を見てみると、絶対パスではありませんがスキーム相対URL （例: `//example.com/path`）というものがあることがわかりました。これは、絶対URLからプロトコルのみを取り除いた形式です。

手元で `new URL("//secret:1337/flag", "http://backend:3000")` を試すと `http://secret:1337/flag` となり、狙い通りに動作することが確認できました。

これを利用し、`emoji` を含むというチェックの対策も入れたURL `http://localhost:3000/api?path=//secret:1337/flag?emoji` を叩いてみると、`Alpaca{REDACTED}` という secret にセットされたダミーのFLAGが返ってきました。

あとはこれを提供されるサーバー用にして叩くだけです。

### 感想や気づき

分類としてはサーバーサイドリクエストフォージェリとなりそうですね。  
一見問題なさそうな入力値検証でも、仕様の見落としによってあっさりと突破され漏洩してしまうことを体感できました。  

今回のケースであれば、

* `/emoji/` までは固定し、以降を動的に組み立てる
* アクセス可能なホスト名やIPアドレスを許可リストで管理する
* `secret` のアクセス元を限定、あるいは認証する

などしていれば、同じ攻撃は成立しなかったでしょう。  
防御は多層的に行うことが重要だと改めて感じました。
