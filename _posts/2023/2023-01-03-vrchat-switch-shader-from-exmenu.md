---
title: "VRChat ExMenuからアバターのシェーダーを変更する"
categories:
    - blog
tags:
    - VRChat
toc: true
---

Expression Menuからシェーダーを切り替えられるようにする手順の解説です。  
ファーシェーダー等の高負荷シェーダーのオンオフ切り替えや、シェーダー移行テストに便利です。

# 大まかな手順

1. マテリアルを複製し、目的のシェーダーを適用する
1. マテリアルスロット内のマテリアルを入れ替えたAnimationを作成する
1. Expression Menuから適用するAnimationを切り替えられるようにする

この方法では、マテリアル数は増えますが、**マテリアルスロットサイズ（アバターパフォーマンスランクに影響する値）は増えません。**

以下、詳細な手順の解説です。

---

# 背景

* ファーシェーダーを使いたい。高負荷なので、集会などでは通常シェーダーに変更できるようにしたい。
* 新しいシェーダーに移行させたい。試験運用中はいつでも元のシェーダーに戻せるようにしたい。
* ワールドに合わせ、複数のシェーダー設定を使い分けたい。

→ メニューから切り替えできるようにしよう！

# 手順

## 別のシェーダーを適用したマテリアルを用意する

1. アバターBodyの `Materials` から、対象のマテリアルを選択する。  
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/select_material.png)
1. マテリアルを1度クリックし、Ctrl+D で複製する。わかりやすい名前に変更しておく。  
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/duplicate_material.png)
1. アバターBodyの `Materials` から、作成したマテリアルを適用する。
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/apply_new_material.png)
1. 新しいマテリアルに、目的のシェーダーを適用する。
    * シェーダーのパラメータもここで調整します。

例では、liltoonファーの激重設定を使います。
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/fur_shader.jpg)

（[ファーシェーダーの適用メモはこちら](https://aruma256.github.io/blog/2022/11/02/liltoon-fur.html)）

以降、「マテリアル切り替えのアニメーションを作成し、ExMenuから再生できるようにする」という操作手順の説明です。

## マテリアル変更のためのアニメーションを作成する

1. Ctrl+6 でAnimationウィンドウを開く
1. そのままHierarchyのアバターをクリックする
1. アニメーションファイルを作成する
    * 空の場合、Createボタンを押して新規作成する  
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_animation_file.png)
    * 既にアニメーションが存在する場合、`Create New Clip...`から新規作成する  
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_revert_animation.png)
1. マテリアル変更後の状態を指定するためのアニメーションファイルを作成する
    * 赤丸（録画ボタン）を押す
    * マテリアルスロット内のマテリアルを変更する
    * 赤丸（録画ボタン）を押す  
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/record_animation.png)
    * 0フレーム目のみが存在するアニメーションファイルが作成される  
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/animation_created.png)
1. 元の状態を指定するためのアニメーションファイルを作成する
    * `Create New Clip...`から新規作成する  
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_revert_animation.png)
    * 同様の手順でアニメーションファイルを作成する

以降、「ExMenuから適用Animationを切り替えられるようにする」という操作手順の説明です。

## ExpressionMenuから適用Animationを切り替えられるようにする

1. アバターの Expression - Parameters に設定されているファイルを開く
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/avatar_expressions.png)
1. Expression Parameter にBool型のパラメータを追加する  
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/add_param.png)
    * この例では `DisableFur` とした（後で使う）
    * ワールド移動や再起動をしてもシェーダー選択を維持してほしい場合のみ`Saved`のチェックを入れる
1. アバターの Expression - Menu に設定されているファイルを開く
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/avatar_expressions.png)
1. Expression Menuにシェーダー変更用の項目を追加する
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/exmenu.png)
    * Type は`Toggle`
    * Parameter は先程作成したExpressionParameterのパラメータのものを選ぶ（例では`DisableFur`）
1. アバターの Playable Layers - FX に設定されている項目を開く
1. Animator - Parameters の＋ボタンを押し、先程作成したパラメータを追加する（例では`DisableFur`）
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/fx_parameter.png)
1. Animator - Layers の＋ボタンを押し、レイヤーを追加する
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_layer.png)
    * **［重要］追加したレイヤーの Weight を1にする**
1. Stateを2つ追加し、双方向のTransitionを設定する
![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/states.png)
    * Stateは 余白を右クリック → Create State → Empty で作成できる
    * Transitionは Stateをクリック → Make Transition で作成できる
1. 2つのStateに、作成したアニメーションを適用する
    * Stateを選び、Motionに作成したアニメーションをドラッグアンドドロップ
1. 2つのTransitionに、パラメータによる遷移条件を追加する
    * 行きのTransitionを選び、Conditionsに `パラメータ名 true` を追加する
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/conditions.png)
    * 戻りのTransitionを選び、Conditionsに `パラメータ名 false` を追加する
    ![](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/conditions_2.png)

あとはアップロードすれば完了です。
