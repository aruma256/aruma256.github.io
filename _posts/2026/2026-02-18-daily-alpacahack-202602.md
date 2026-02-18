---
title: "2026年2月前半の Daily AlpacaHack 記録"
categories:
    - blog
tags:
    - CTF
toc: true
---

Daily AlpacaHack でCTFデビューし、最近ハマっています。  
2/1～2/15 の問題を解いたので、解法メモを残しておきます。前半と言いつつ、勢い余って15日分になりました。  
どれも「自力で解ける」～「AIに相談しつつ解ける」程度で、CTF初心者にちょうどいい、楽しめる難易度でした。  

## 2026-02-01: Camelidae

問題文に FLAG がありました。

## 2026-02-02: Substance

tar.gz の中には、2つの大きい数が書かれた output.txt と、chal.py が入っていました。
chal.py に登場するメソッドを見ておきます。

- [`int.from_bytes`](https://docs.python.org/ja/3.14/library/stdtypes.html#int.from_bytes): bytesを受け取り整数表現を返す
- [`random.randint(a, b)`](https://docs.python.org/ja/3.14/library/random.html#random.randint): 範囲 [a, b] の整数をランダムに返す

chal.py は `flag * a * b * c` と `flag * d * e * f` （a～fは2～2026のランダムな整数）を出力するようです。  
実際は `A * flag` と `B * flag` と考えてよいでしょう。

とりあえず、最大公約数から `N * flag` （`N = gcd(A, B)`）を求めてみると、 31748696846809458845893315116545812553950394766538362807608704739811018 でした。  
このまま `.to_bytes(32)` しても正しくdecodeできないため、 `N > 1` と推測できます。  
2で1回、3で2回割ってから `.to_bytes(32)` すると正しくdecodeできるようになり、FLAGが得られました。

## 2026-02-03: read-a-binary

配布ファイルはバイナリファイル1つでした。  
リバースエンジニアリングの問題のようです。

```bash
$ ./read-a-binary 
Input > abc
Incorrect...
```

バイナリ解析は初心者なので、AIに聞きながら進めることにします。  
まずバイナリ内の文字列を抽出する方法を聞いてみると、 `strings` を提案されました。  
`strings read-a-binary | less` で

- `Correct! The flag is %s` 
- `Incorrect...`

などの文字列が含まれていましたが、 Alpaca… は見つかりませんでした。

もう一つの提案、 `xxd` を眺めてみると…

```
.........H.E.H..
H..f...H........
......0...A..1..
.l..2...p..3...a
..4...c..5...a..
6...{..7...D..8.
..e..9...c..:...
…
```

A l p a c a … が見えました。7 bytes おきに FLAG が分割されているようです。  
ということで、文字列結合して `s[::7]` で、やたら長い FLAG を入手できました。

ところで… FLAG によると、デコンパイラを使うとよかったようです。なるほど…

## 2026-02-04: Magic Engine

nginx の default.conf によると、このサーバーは複数の hostname を兼任しており、hostname `admin.alpaca.secret` の `/` が FLAG を返してくれるようです。

```bash
curl -H "Host: admin.alpaca.secret" （対象サーバー）
```

で、FLAG を入手できました。

## 2026-02-05: RRe_Time_Limiter

flag を 349以下の各素数で割ったときの余りから、flagを割り出す問題です。

「2 で割ったときの余りが 1 になる数」は、1, 3, 5, … です。  
この数列を昇順で見つつ、「3 で割ったときの余りが 2」も満たすところで止まれば、2条件を満たす数（ここでは 5）が得られます。  
次は 5 + (2*3)n の数列を昇順に… と全ての条件を満たす数を得られるまで操作を続けることで、FLAGを得られます。

```py
primes = [2, 3, 5, …]
outs = [1, 2, 0, …] 

c = 1
ans = 0

while primes:
    p = primes.pop()
    o = outs.pop()
    while ans % p != o:
        ans += c
    c *= p

print(ans.to_bytes(43))
```

## 2026-02-06: The World

サーバー側の時刻と100nsレベルで一致する入力を送ることでクリアできるようです。  
大量のリクエストを送れば…とも考えましたが、入力を色々試す中でサニタイズが甘いことに気が付きました。
FLAG と入力し、エラーメッセージから FLAG を得られました。

## 2026-02-07: misdirection

`strings` でバイナリを読むと、ダミーのフラグと、reverseされた真のフラグがありました。

## 2026-02-08: Compressor

テキストを送ると、 `FLAG + input` を `zlib.compress` した際のサイズが返されます。  
様々な入力を与えて、「うまく圧縮される」文字列が見つかった場合、それが FLAG と共通する部分を多く持つと推測できます。

フラグは `Alpaca{` で始まることがわかっているので、 `known + 1文字` を総当りし、最も圧縮された1文字を結合し新たな `known` として次の1文字を総当り…していけば特定できそうと思いました。

しかし、やってみると同率一位の候補が多数出現して詰まってしまいました。  
試行錯誤した結果、 `(known + 1文字) * 4` を入力とすることで20文字程度を当て、複数候補が現れたところでrepeatをやめることで最後まで特定できました。

## 2026-02-09: Plz Login

ログイン画面が表示され、username: `admin` で正しいパスワードを入れると FLAG が表示されるという問題です。

username/password の一致判定部分が怪しいかと思いましたが突破口が見つからず。  
curlで様々なリクエストを試行していたところで「0文字のusernameを渡すと `username[0]` で IndexError が発生し、トレースが表示される」ことを発見し、トレースにif文の判定ロジックが含まれていたため、そこで password が判明しました。

例: `curl -X POST http://localhost:3000/login -d "username=&password="`

あとは通常のログイン画面に "admin" と判明したpasswordを入力するだけです。

`debug=True` で実行されていたことが根本原因でした。

## 2026-02-10: Alpaca-Llama Ranch

セグフォを起こせば、シェルを起動できるようです。

`unsigned alpaca, llama` （種類別の合計数）と、それぞれ各個体のID情報を格納する配列（長さ0x40）に対して入力できますが、 `alpaca+llama > 0x40` のバリデーションがあります。

ここで、 `alpaca, llama` 単体でのバリデーションが無いことに注目すると、オーバーフローを狙えそうです。  
結果として `alpaca+llama <= 0x40` となるように 4294967295, 2 などを選び、あとは書き込みまくることでシェルを起動し、フラグを入手できました。

## 2026-02-11: destructuring

複雑な構造の要求に合うJSONを渡せば FLAG を貰えます。

ソースコード内のフォーマット部分を文字列として、以下のような文字列置換をすることで正しいJSONを生成することができました。

```py
import re

def transform(s: str) -> str:
    s = s.replace('_', '')
    s = re.sub(r'([a-zA-Z]):', r'"\1":', s)
    s = s.replace('[,', '[0,')
    s = s.replace(' ,', '0,')
    s = s.replace(', ]', ',0]')
    s = s.replace(' ', '')
    return s
```

なお、当初は読みやすくスペースを入れたり使わないvalueには `null` を入れたりしていたのですが、今回は nc で手動入力していた関係で入力が長すぎると（おそらく 4096 bytes）入力がカットされてしまったため、密なJSONとなるよう調整しました。

## 2026-02-12: AAAAAAAAEEEEEEEESSSSSSSS

FLAG の各1文字を8連続に引き伸ばし、それをランダムな鍵で MODE_ECB でAES暗号化した値が返されます。
また、インタラクティブな仕組みがあり、任意の入力値を同じ鍵で暗号化した値も返されます。

MODE_ECB （ブロック長 16 bytes）であること、1文字が8連続（8 bytes）になっていることを考えると、2文字の組み合わせ（約3000通り）とその暗号化hexの対応を導けば、元の FLAG がわかります。

これを実行するスクリプトを用意し実行することで、FLAG を入手できました。

## 2026-02-13: nc magic

（実は最初に解いた問題のため、初歩的な部分から書いています。）

タイトルや問題文の netcat / nc を調べると、TCP/UDPの接続を手軽に扱えるコマンドラインツールとのことでした。ポートスキャンやリッスンも対応、便利…。

tar.gz に含まれるファイルを読むと、ネットワーク越しに server.py に入出力できるようです。 server.py は print されたランダムな hex string をその場で渡すだけで FLAG をくれるようですが、実際にやってみるとうまく行きませんでした。  
server.py の内容をよく読むと

```py
if sys.stdin.buffer.readline() == secret.encode():
```

となっており、単にコピペして渡すだけでは改行が問題となるようです。  
実際にソースコードの `secret` の末尾に `"\n"` を追加してみると、手入力でも FLAG が返ってくることを確認できます。

整理すると、受け取ったテキストに含まれるコードを、末尾に改行を含めずに送信する必要があるということになります。

Ruby で実現できそうだったので、

`docker run --rm -it --network host ruby irb` で

```rb
require 'socket'

HOST = '127.0.0.1' # ターゲットによって変える
PORT = 1337 # ターゲットによって変える

s = TCPSocket.new(HOST, PORT)
line = s.gets
secret = line.split[3]
s.write(secret)
s.close_write
s.read
```

を実行し、FLAG を取れることを確認できました。

```
irb(main):012> s.read
irb(main):013> 
=> "Alpaca{REDACTED}\n"
```

同様の手順で本番サーバーから FLAG を入手すると、クリアです。

## 2026-02-14: simple ROP

`win` 関数を適切な引数とともに呼び出せば FLAG を入手できるようです。

`gets` という見慣れない関数が出てきたので調べると、脆弱な実装になりやすいため廃止されたとのことでした。なるほど。  
`-fno-stack-protector` も調べ、オーバーフローによるリターンアドレスの書き換えを防止する（書き換えられたことを検知する）仕組みであることを理解しました。なるほどなるほど。  
様々な改善や仕組みで守られているんだなぁ…。

今回はこれらのおかげで簡単にリターンアドレスの書き換えができます。

また、「ROP gadgets」として rdi, rsi, rdx のセットが用意されているので、これらで引数の値をセットしてから `win` を呼べばよさそうです。

`buffer` + RBP を埋め、値をセットしつつ最後に `win` を呼ぶような入力をすることで、FLAG を入手できました。

## 2026-02-15: You are being redirected

リダイレクト機能を持つ web サービスと、そこへブラウザ（puppeteer）でアクセスする bot サービスがあり、bot のアクセス時のクッキーを奪取するという問題でした。  

リダイレクト処理の流れを追ってみると

1. URLパラメータの `to` の値を抽出する
2. その `toLowerCase()` が "data", "javascript", "blob" のいずれも含んでいないことをチェック
3. `new URL(dest, base)` で URL オブジェクトを作る
4. `window.location.replace(url.href);`

となっていました。  
クッキーの内容を外部に投げるようなXSSを実行できれば良さそうです。

URL parser の仕様を調べていくと、[The basic URL parser](https://url.spec.whatwg.org/#concept-basic-url-parser) はTAB文字を除去するようでした。  
これを利用し、`java(tab)script:（クッキーを取得し用意した外部サーバーに送るスクリプト）` を実行させることで、FLAGを入手できました。

バリデーションの考慮漏れ（というかJSの知らない挙動）、怖い。

## さいごに

Daily AlpacaHack、楽しいし勉強になるし最高ですね。
