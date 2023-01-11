---
title: "Today I Learned: PHP foreach+参照渡しの注意点"
categories:
    - blog
tags:
    - PHP
toc: true
---

最近初めてPHPを書きました。  
その際に遭遇した、「同一スコープ内の2つのforeachにて、ループ変数として `&$value` と `$value` をこの順で使うと、Arrayの中身が上書きされる」という話です。  
この仕様は様々な記事になっているため今更感はありますが、自分なりに考えたことをまとめておきます。

# 概要

以下の一見なにもしないように見える2つのループは、実はArrayの中身を書き換えてしまいます。PHP初心者としては驚きでした。

```php
$arr = [1, 2, 3];
foreach ($arr as &$value) {} // 意味のないループ(?)
foreach ($arr as $value) {}  // 意味のないループ(?)
print_r($arr); // [1, 2, 3] が出力されそうだが...?
```

出力
```
Array
(
    [0] => 1
    [1] => 2
    [2] => 2
)
```

**何もしないループがあるだけなのに、`$arr[2]`が`3`から`2` に変わってしまいました。**

# 何が起きたか

この現象は、[phpのドキュメント foreach に記載があります](https://www.php.net/manual/ja/control-structures.foreach.php)（"警告"の部分）

ざっくりまとめると

* ループ変数のスコープはループの外
    * つまり、ループ後もループ変数は存在し続ける
* ループ変数に `&` をつけると参照渡し、つけないと値渡しになる

という2つの仕様の組み合わせでした。

```php
$arr = [1, 2, 3];
foreach ($arr as &$value) {}
// 1つ目のループを抜けた時点で、$value は $arr[2] を差し続ける
foreach ($arr as $value) { // $value つまり $arr[2] に対し、$arrの要素を順に入れる
    print_r($arr);
}
```

```
Array
(
    [0] => 1
    [1] => 2
    [2] => 1
)
Array
(
    [0] => 1
    [1] => 2
    [2] => 2
)
Array
(
    [0] => 1
    [1] => 2
    [2] => 2
)
```

2つ目のループでは
1. `$value` つまり `$arr[2]` に `$arr[0]` を代入する
    * `[1, 2, 1]` となる
1. `$value` つまり `$arr[2]` に `$arr[1]` を代入する
    * `[1, 2, 2]` となる
1. `$value` つまり `$arr[2]` に `$arr[2]` を代入する
    * `[1, 2, 2]` となる

のような書き換えが起きています。

**特に実際の開発シーンでは、長い関数に処理を追加する際に注意が必要そうです。**

```diff
function long_func($arr) {
    foreach ($arr as &$value) {
    }
    // ...
    // いろいろな処理
    // ...

+   // 新機能開発で、以下を追加！
+   foreach ($arr as $value) {
+
+   }

    // ...
    another_func($arr); // 壊れる箇所の1つ
    // ...
}
```

# 対策案

## unsetで参照を解除する

PHPドキュメントに記載されている方法です。  
ループを抜けたらすぐに`unset`して参照を解除しておけば、書き換えは回避できます。

```php
$arr = [1, 2, 3];
foreach ($arr as &$value) {}
unset($value); // 参照解除
foreach ($arr as $value) {}
print_r($arr); 
```

```
Array
(
    [0] => 1
    [1] => 2
    [2] => 3
)
```

とはいえ、書き忘れますよね。既存コードも毎回`unset`されているとは限りません。

## foreach+参照の組み合わせを避ける

[`array_keys`](https://www.php.net/manual/ja/function.array-keys.php) を使うなどして、キーをループする方針なら、事故は減りそうです。  

```php
$arr = [1, 2, 3];
foreach ($arr as &$value) {} // 既存コード

foreach (array_keys($arr) as $key) {
    $arr[$key]; // に対する操作をする
}
```

`array_keys` はArrayを返すため、巨大な配列を扱うケースではそれはそれで注意が必要になります。

## 根本対策は難しい

`unset`無しの既存コードがある という環境では、

* ループ変数名が重複しないか確認する
* `unset`無しの参照変数を見つけたら、`unset`をつける
* 参照を使う場合は、必ず`unset`する
* foreach+参照の組み合わせを避ける（`array_keys` を使う）

を徹底するしか無さそうです。

とはいえ "気を付ける" だけではどうしようもないので、せめてCI等で検出できるようにしておきたいところです。
