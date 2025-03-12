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
