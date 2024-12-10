---
title: "PythonでTシャツをデザインする"
categories:
    - blog
tags:
    - Python
    - Pillow
    - SUZURI
toc: true
---

PythonのPillowという画像処理ライブラリで自分のアイデアを画像ファイル化し、SUZURIでTシャツにして販売した話です。  
この記事は [SUZURI Advent Calendar 2024](https://adventar.org/calendars/10879) の10日目です。

一人で語っても伝えにくそうだと思ったので、今回は実験的に Claude 3.5 Sonnet にインタビューしてもらうことにしました。  
※「Tシャツ」と題していますが、Tシャツ以外の服や雑貨なども含まれます。  
※以下、はじめの文と「Claude」とついた発言は `claude-3-5-sonnet-20241022` によるものです。

---

こんにちは！インタビュアーの Claude です。
今回は、Pythonを使ってオリジナルTシャツをデザインし、販売まで行った aruma さんにお話を伺います。

**Claude**: こんにちは、aruma さん！本日はよろしくお願いします。

**aruma**: はい、よろしくお願いします。

**Claude**: さっそくですが、なぜPythonとPillowを使ってTシャツをデザインしようと思われたのでしょうか？普通は画像編集ソフトを使うと思うのですが。

**aruma**: そうですよね。私も、初めて作ったときは画像編集ソフトで制作しました。
[![arumaロゴジップパーカーの画像](/assets/2024/2024-12-10-design-tshirt-with-python/aruma-zip-hoodie.png)
https://suzuri.jp/aruma256/designs/13772132](https://suzuri.jp/aruma256/designs/13772132)

それ自体は問題なく完成したのですが、次に「[セグメント木](https://aruma256.dev/blog/2023/07/23/segment-tree.html)」を題材にしたとき、画像編集ソフトで作るのは大変だったのです。
このデザインでは、セグメント木の各ノードを表現する図形を正確な位置と色で配置する必要がありました。これは手間のかかる作業です。
さらに、全体のバランスを見つつ幅や濃さなど様々なパラメータを調整することを考慮すると、プログラムで生成するのが最も効率的だと考えました。
もちろん、画像編集ソフトでも同じようなことはできるとは思いますが、私は画像編集ソフトよりもVSCodeの方が、遥かに慣れていました。

**Claude**: なるほど、プログラムで生成する方が効率的だったのですね。実際に作ってみて、どのような反応がありましたか？

**aruma**: もともとは自分が着るためだけに作ったのですが、販売すると思った以上に好評でした。
直接関わりのない方にも購入いただけて、とても嬉しかったです。
また、特に競技プログラミングなどでセグメント木をよく知っている方々からは「セグ木だ！」と反応を貰えて、「わかる人にはわかる」系デザインをもっと作りたいと思うようになりました。

**Claude**: それは素晴らしいですね！次に、デザインのインスピレーションはどこから得たのか教えていただけますか？

**aruma**: 大学で学んでいた電気電子工学や、数理・情報系全般から得ています。
最初に作った「セグメント木」のデザインは、セグ木のアルゴリズムの説明資料を作成していたときに「図解がきれいだな」と思ったことがきっかけでした。
最近は、「これはデザインのテーマになりそうだな」と思ったものはメモするようにしています。
実際に完成まで至るのはそのうちの10%程度ですが、試行錯誤も含めて現在の趣味の1つとして楽しんでいます。  
この三ヶ月では、グラフ理論について調べていて出会った「[ケーニヒスベルクの七つの橋問題](https://ja.wikipedia.org/wiki/一筆書き#ケーニヒスベルクの七つの橋問題)」をテーマにしたデザインを作ってみたり、VRChatでパワーエレクトロニクスについて話していたときに話題に出た「[PN接合](https://ja.wikipedia.org/wiki/PN接合)のエネルギーバンド図」からデザインを作ってみたりしました。

**Claude**: 「ケーニヒスベルクの橋の問題」と「PN接合」、とても興味深いテーマですね。実際のデザインを見せていただけますか？

**aruma**: こちらです。

[![ケーニヒスベルクの橋の問題のデザイン](/assets/2024/2024-12-10-design-tshirt-with-python/konigsberg-bridge.png)
https://suzuri.jp/aruma256/designs/16858056](https://suzuri.jp/aruma256/designs/16858056)

![PN接合のエネルギーバンド図のデザイン](/assets/2024/2024-12-10-design-tshirt-with-python/pn-junction.png)

**Claude**: デザインがとても素敵ですね。これらはPythonとPillowで作られたとのことですが、実際のコード作成ではどのような工夫をされましたか？

**aruma**: ありがとうございます。
コードについては、大きく2つのポイントがありました。
1つ目は、GitHub Copilot や Cursor などを活用したことです。
せっかくなので、ここで実演してみましょうか。
以下の要件を満たすコードを作成してください。

* 512x256のRGB画像
* 背景は白
* 16個の正方形を横一列に並べ、黒色で描画する
* 正方形の個数などは定数としてコードの最初で定義する

**Claude**: 承知しました。以下のようなコードはいかがでしょうか？

```python
from PIL import Image, ImageDraw

# 定数定義
WIDTH = 512
HEIGHT = 256
N_SQUARES = 16
SQUARE_SIZE = 12
MARGIN = 4

# 画像作成
image = Image.new('RGB', (WIDTH, HEIGHT), 'white')
draw = ImageDraw.Draw(image)

# 正方形を描画
start_x = (WIDTH - (N_SQUARES * (SQUARE_SIZE + MARGIN) - MARGIN)) // 2
y = HEIGHT // 2 - SQUARE_SIZE // 2

for i in range(N_SQUARES):
    x = start_x + i * (SQUARE_SIZE + MARGIN)
    draw.rectangle(
        [x, y, x + SQUARE_SIZE, y + SQUARE_SIZE],
        fill='black'
    )

image.save('squares.png')
```

**aruma**: このコードを実行すると、以下のような画像が作成されます。

![正方形のデザイン](/assets/2024/2024-12-10-design-tshirt-with-python/squares.png)

左右に余白を作ってくれましたが、今回私が想像していたのは余白無しで、正方形がちょうど並ぶような配置でした。  
修正するついでに、色も変えてみましょう。

では、以下の通りにコードを変更してください。

* 正方形の間及び端に余白を作らず、敷き詰める
* 塗りつぶしの色は左端から右端へ徐々に赤から青へ変化させる

**Claude**: はい、以下のように修正してみました。

```python
from PIL import Image, ImageDraw

# 定数定義
WIDTH = 512
HEIGHT = 256
N_SQUARES = 16
SQUARE_SIZE = WIDTH // N_SQUARES  # 正方形のサイズを画面幅から計算

# 画像作成
image = Image.new('RGB', (WIDTH, HEIGHT), 'white')
draw = ImageDraw.Draw(image)

# 正方形を描画
y = HEIGHT // 2 - SQUARE_SIZE // 2
for i in range(N_SQUARES):
    x = i * SQUARE_SIZE
    # 赤から青へのグラデーション
    r = int(255 * (N_SQUARES - i - 1) / (N_SQUARES - 1))
    b = int(255 * i / (N_SQUARES - 1))
    draw.rectangle(
        [x, y, x + SQUARE_SIZE, y + SQUARE_SIZE],
        fill=(r, 0, b)
    )

image.save('squares_gradient.png')
```

**aruma**: 新しいコードを実行すると、以下のような画像が作成されます。

![グラデーションの正方形のデザイン](/assets/2024/2024-12-10-design-tshirt-with-python/squares_gradient.png)

このようにコーディングをある程度LLMに任せることで、手作業の負担を減らすことができますし、試行錯誤も容易になります。

**Claude**: なるほど、LLMの活用は効率的ですね。先ほど「2つのポイント」とおっしゃいましたが、もう1つのポイントは何でしょうか？

**aruma**: パラメータ類をコードの最初で定義させていることです。
ちょっとしたサイズや色合いの変更はLLMを使うまでもないので、簡単に変更できるようにしています。  
数パターン生成して見比べてみるという時にも役に立ちますよ。

**Claude**: なるほど、パラメータを最初に定義しておくことで、柔軟に調整できるのですね。とても参考になります。最後に、この記事を読んでいる方々に何かメッセージをお願いします。

**aruma**: 私のような「絵を描くのは苦手だけどコードなら書ける」という方には、このような方法があることを知っていただけたら嬉しいです。
好きなテーマから膨らませて作ってみると、とても楽しいですよ。
