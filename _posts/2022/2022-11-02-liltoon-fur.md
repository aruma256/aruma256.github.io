---
title: "【Unity】lilToonのファー機能を適用してみたメモ"
categories:
    - blog
tags:
    - Unity
    - VRChat
toc: true
---

VRChatのアバターにファーシェーダー（lilToonファー）を適用したので、作業手順メモを残します。

# リンク

* アバター： [【オリジナルVRChat向けアバター】くれな](https://booth.pm/ja/items/2068711)
    * この記事では、ver1.2 を使用しました。
* シェーダー：[【無料】lilToon](https://booth.pm/ja/items/3087170)
    * この記事では、lilToon 1.3.6 を前提とします。

# 前準備：lilToonへ移行する

lilToonファーを使うため、まずはシェーダーをlilToonに変更します。  
（適用対象のマテリアルが既にlilToonの場合、本手順はスキップします。）

簡易説明

1. Unityでアバターのプロジェクトを開く
1. lilToonをダウンロードし、プロジェクトにインポートする
1. アバターのマテリアルを選択し、 **Ctrl+Dで複製する**
![](/assets/2022/2022-11-02-liltoon-fur/material_ears_lilToon.jpg)
    * サンプル画像では `ears` を複製し、 `ears_lilToon` を作った
1. アバターBodyの使用マテリアルを複製先に変更する
![](/assets/2022/2022-11-02-liltoon-fur/change_material.png)
    * サンプル画像では `ears` → `ears_lilToon`
1. 作成されたマテリアルのシェーダーを変更する
    * before
    ![](/assets/2022/2022-11-02-liltoon-fur/shader_before.png)
    * after
    ![](/assets/2022/2022-11-02-liltoon-fur/shader_after.png)

統一感のため、この作業はファー適用対象だけでなく、全身のマテリアルに対して行うことを推奨します。  

※透過を利用するマテリアルでは、描画モード `半透明` を選ぶ必要があります。

# 描画モード"ファー"用のマテリアルを用意する

1. アバターのマテリアルを選択し、 **Ctrl+Dで複製する**
![](/assets/2022/2022-11-02-liltoon-fur/material_ears_lilToon_fur.png)
    * サンプル画像では `ears_lilToon` を複製し、 `ears_lilToon_fur` を作った
1. アバターBodyの使用マテリアルを複製先に変更する
![](/assets/2022/2022-11-02-liltoon-fur/change_material_fur.png)
    * サンプル画像では `ears_lilToon` → `ears_lilToon_fur`
1. 作成されたマテリアルのシェーダーの描画モードを `[高負荷] ファー (2パス)` に変更する
![](/assets/2022/2022-11-02-liltoon-fur/render_mode_fur.png)
    * 他のファー系描画モードでも可

**(2022/11/04 更新) 以降はファーの調整の概要を書いていたのですが、詳細な設定方法の解説記事が公開されていたのでこちらをオススメします** → [lilToonのファーの設定いろいろ
 https://note.com/ma1ono1am/n/ndfa54c30eb2a](https://note.com/ma1ono1am/n/ndfa54c30eb2a)

---

# ファー設定を調整する

1. シェーダーの `詳細設定` をクリック
1. `拡張設定 - ファー設定` の以下項目を調整する
    * 長さ : 自然な長さにする（アバターによって大きく異なります）
    * ノイズ - Tiling : X, Y に同じ値を入れる（16～32 辺りをよく使います）

before

![](/assets/2022/2022-11-02-liltoon-fur/fur_shader_before.jpg)

after

![](/assets/2022/2022-11-02-liltoon-fur/fur_shader_after.jpg)

# ノーマルマップ用の画像を作成し適用する

現状、毛の向きが未指定となっています。  
向きを指定するためのデータ（ノーマルマップ画像ファイル）を作成しましょう。

[毛並みを整える Grooming Tool](https://booth.pm/ja/items/3009310) がオススメです。

このツールでノーマルマップを作成し、プロジェクトにインポートし、シェーダー設定のノーマルマップに適用します。

![](/assets/2022/2022-11-02-liltoon-fur/normalmap_applied.jpeg)

before

![](/assets/2022/2022-11-02-liltoon-fur/fur_shader_after.jpg)

after

![](/assets/2022/2022-11-02-liltoon-fur/fur_shader_normalmap.jpg)

基本的な設定ができました。

他にも様々な詳細設定が可能です。  
お好みに合わせて調整してみてください。
