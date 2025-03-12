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

Fisher–Yates shuffle は 「`i` を `N`, `N-1`, ..., `1` まで変化させながら、`0` 以上 `i` 以下の整数をランダムに選択し(この整数を `j` とする) `i` 番目と `j` 番目の要素を入れ替える操作を繰り返す」というアルゴリズム…と言われても、この説明だけではイメージが湧きにくいと思います。

JavaScript で実装すると以下のようになりますが、

```javascript
function shuffle(array) {
    // i を N, N-1, ..., 1 までループ
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

```javascript
[1, 2, 3, 4, 5]
```

の各要素に乱数を紐づけて

```javascript
[[1, 0.83],
 [2, 0.37],
 [3, 0.45],
 [4, 0.13],
 [5, 0.52]]
```

乱数の方でソートすれば、

```javascript
[[4, 0.13],
 [2, 0.37],
 [3, 0.45],
 [5, 0.52],
 [1, 0.83]]
```

最後に乱数を削除して

```javascript
[4, 2, 3, 5, 1]
```

というように、シャッフルされた配列が得られます。  
単純明快な手法ですし、ソート処理もメジャーな言語ならサポートされているので実装も楽そうです。  
これでよさそうな気がしますが、実は落とし穴があります。

## シャッフルに必要となるリソースを比較する

同じ結果を得られるなら、メモリ使用量が少ない方が嬉しいでしょう。

乱数を紐づけてソートする方法では、紐づけた乱数の分のメモリが追加で必要になります。  
一方、Fisher–Yates アルゴリズムの場合、もとの配列の中で入れ替え処理を行うため、追加のメモリはほとんど必要ありません。

また、同じ結果を得られるなら、計算時間は短い方が嬉しいです。

乱数を紐づけてソートする方法では、ソート処理が最も時間のかかる処理になります。一般に、N件のソートには `N log N` に比例する時間がかかります。  
一方、Fisher–Yates アルゴリズムの場合、最も時間がかかる処理はおよそ `array.length` 回のforループです。N件のシャッフルは `N` に比例する時間で済みます。

|  | メモリ使用量の増加 | 計算時間 |
|---|---|---|
| 乱数を紐づけてソート | ❌ `N` に比例した追加メモリが必要 | ❌ `N log N` に比例する時間がかかる |
| Fisher-Yates shuffle | ✅ ほぼ無し | ✅ `N` に比例する時間で済む |

Fisher–Yates shuffle は、メモリ使用量の面でも計算時間の面でも優れていることがわかります。

# 正しくシャッフルできているのか

効率が良くても、正しく公平に（均等な確率で）シャッフルされていないと意味がありません。
Fisher–Yates shuffle のシャッフルを詳しく見ていきましょう。

## 基本的なシャッフル

例えば「最初に前の方にあった要素が前に来やすい」というような偏りがあると、公平に（均等な確率で）シャッフルされていないことになります。  
偏りをなくすにはどうすればよいでしょうか。

「元の配列をどう並べ替えるか？」と考えると難しくなってしまいますが、シャッフルで実現したいことは最終的にランダムな順序にすることであり、最初の順序は気にする必要がありません。

そこで、

1. 一旦、元の配列の要素を1つの大きな袋に入れてしまう
2. 袋からランダムの1つ取り出し、最後尾に追加する

を繰り返すと考えてみましょう。

<img src="/assets/2025/2025-03-13-fisher-yates-shuffle/bag-shuffle.gif" alt="シャッフルのイメージ" style="max-width: 100%; width: 600px; height: auto; display: block; margin: 0 auto;" />

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

もう一度、シャッフルのイメージを思い出してみましょう。

<img src="/assets/2025/2025-03-13-fisher-yates-shuffle/bag-shuffle.gif" alt="シャッフルのイメージ" style="max-width: 100%; width: 600px; height: auto; display: block; margin: 0 auto;" />

ここで重要なのは、**袋の中身の順序は無関係**ということです。  
配列のうち**シャッフル済みではない部分を袋として利用**しましょう。

<img src="/assets/2025/2025-03-13-fisher-yates-shuffle/in-place-shuffle.gif" alt="シャッフルのイメージ" style="max-width: 100%; width: 600px; height: auto; display: block; margin: 0 auto;" />

これを、実装しやすいように後ろから確定させていくように変更したものが、最初の Fisher–Yates shuffle の実装でした。
