---
title: "Fisher–Yatesシャッフルのやさしい解説"
categories:
    - blog
tags:
    - algorithm
toc: true
---

配列のシャッフルに有用な Fisher–Yates shuffle と呼ばれるアルゴリズムをわかりやすく解説することを目指した記事です。

# Fisher–Yates shuffle アルゴリズム

Fisher–Yates shuffle は  
「`i` を `N-1`, `N-2`, ..., `1` まで変化させながら、`0` 以上 `i` 以下の整数をランダムに選択し(この整数を `j` とする) `i` 番目と `j` 番目の要素を入れ替える操作を繰り返す」というアルゴリズム…  
と言われても、この説明だけではイメージが湧きにくいと思います。

JavaScript で実装すると以下のようになりますが、

```javascript
function shuffle(array) {
    // i を N-1, N-2, ..., 1 までループ
    for (let i = array.length - 1; i > 0; i--) {
        // 0 以上 i 以下の整数をランダムに選択し（この整数を j とする）
        const j = Math.floor(Math.random() * (i + 1));
        // i 番目と j 番目の要素を入れ替える
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
```

* もっとシンプルに、乱数を紐づけてソートではダメなの？
* たった1回のループで本当にシャッフルできているの？

など、気になります。

# 乱数を紐づけてソートする方法との比較

例えば以下の配列の要素をシャッフルしたいとします。

```javascript
[1, 2, 3, 4, 5]
```

この配列の各要素に乱数を紐づけて

```javascript
[[1, 0.83],
 [2, 0.37],
 [3, 0.45],
 [4, 0.13],
 [5, 0.52]]
```

乱数の方でソートし

```javascript
[[4, 0.13],
 [2, 0.37],
 [3, 0.45],
 [5, 0.52],
 [1, 0.83]]
```

最後に乱数を削除すれば

```javascript
[4, 2, 3, 5, 1]
```

シャッフルされた配列が得られます。  

単純明快な手法ですし、ソート処理もメジャーな言語ならサポートされているので実装も楽そうです。  
これでよさそうな気がしますが、実は改善できる点があります。

## シャッフルに必要となるリソースを比較する

同じ結果を得られるなら、メモリ使用量が少ない方が嬉しいでしょう。

乱数を紐づけてソートする方法では、紐づけた乱数の分のメモリが追加で必要になります。  
一方、**Fisher–Yates アルゴリズムの場合、もとの配列の中で入れ替え処理を行うため、追加のメモリはほとんど必要ありません。**

また、同じ結果を得られるなら、計算時間は短い方が嬉しいです。

少数のシャッフルなら方法によらず瞬時に計算が終わるので、ここではシャッフル対象の配列はある程度大きいものとして、対象の配列の長さ `N` が大きくなると計算時間がどのような伸び方をするかを比較してみます。  
（例えば `N` が2倍、3倍、4倍…になったとき、計算時間も2倍、3倍、4倍…で済む実装と、4倍、9倍、16倍…のように膨れ上がっていく実装の2択なら、前者を選びたいですよね。）  
乱数を紐づけてソートする方法では、基本的に伸び方は `N*log(N)` と表現されます。`N` が2倍、3倍、4倍…になったとき、計算時間は2倍、3倍、4倍…よりも大きくなってしまうということです。  
**一方、Fisher–Yates の伸び方は `N` と表現されます。つまり、2倍、3倍、4倍…で済むのです。**  
（詳細は時間計算量について調べてみてください）

|  | メモリ使用量の増加 | 計算時間の伸び方 |
|---|---|---|
| 乱数を紐づけてソート | ❌ 乱数値 `N` 個分の追加メモリが必要 | ❌ `N*log(N)` で伸びていく |
| Fisher-Yates shuffle | ✅ わずか | ✅ `N` で済む |

Fisher–Yates shuffle は、メモリ使用量の面でも計算時間の面でも優れていることがわかります。

# 正しくシャッフルできているのか

いくら効率が良くても、例えば **「最初に前の方にあった要素が前に来やすい」というような偏りがあると困ります。**  
偏りをなくすにはどうすればよいでしょうか。

## シャッフルの基本

「元の配列をどう並べ替えるか？」と考えると難しくなってしまいますが、シャッフルで実現したいことは最終的にランダムな順序にすることであり、最初の順序は気にする必要がありません。

そこで、

1. 一旦、元の配列の要素を1つの大きな袋に入れてしまう
2. 袋からランダムに1つ取り出し、最後尾に追加する という操作を繰り返す

と考えてみましょう。

<video muted playsinline controls style="max-width: 100%; width: 600px; height: auto; display: block; margin: 0 auto;">
  <source src="/assets/2025/2025-03-13-fisher-yates-shuffle/bag-shuffle.mp4" type="video/mp4">
</video>

初期状態の並び順に無関係で、シャッフル後の順序も偏りがないシャッフル方法ができました。  
これと同じことをコードで実現すればよいのです。

```javascript
function shuffle(array) {
    // まずは袋に入れる
    const bag = array.slice();
    const shuffled = [];

    while (bag.length > 0) {
        // 袋からランダムの1つ取り出し
        const randomIndex = Math.floor(Math.random() * bag.length);
        const selectedElement = bag.splice(randomIndex, 1)[0];
        // 取り出した要素を最後尾に追加する
        shuffled.push(selectedElement);
    }
    return shuffled;
}
```

## in-place での実装

上記の実装では、シャッフルされた配列を新しく作成しています。  
配列を新規作成しないような実装に変更するにはどうすればよいでしょうか。

もう一度、先程のシャッフルのイメージを思い出してみましょう。

<video muted playsinline controls style="max-width: 100%; width: 600px; height: auto; display: block; margin: 0 auto;">
  <source src="/assets/2025/2025-03-13-fisher-yates-shuffle/bag-shuffle.mp4" type="video/mp4">
</video>

ここで、袋の中身の順序は無関係という性質を利用し、**配列のうち未シャッフル部分を袋として利用**しましょう。  
つまり、**「袋から取り出し、最後尾に追加する」を「袋を1つ分縮小させる。この時、はみ出た要素が最後尾に追加されたことにする」**と考えます。  
このとき、「ランダムに1つ取り出す」は「ランダムに1つ選び、はみ出ることになる位置に移動させてから、袋を縮小させる」となります。

<video muted playsinline controls style="max-width: 100%; width: 600px; height: auto; display: block; margin: 0 auto;">
  <source src="/assets/2025/2025-03-13-fisher-yates-shuffle/in-place-shuffle.mp4" type="video/mp4">
</video>

これを、実装しやすいように前後反転すると、最初の Fisher–Yates shuffle の実装になります。
