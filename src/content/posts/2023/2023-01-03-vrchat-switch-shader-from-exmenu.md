---
title: "VRChat ExMenuからアバターのシェーダーを変更する"
tags:
    - Unity
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
![Inspector の Materials 欄。Size 9 で、Element 0〜8 に hair、body、face、highlight、ears、tail、nose、pale、clothes が並び、Element 5 の tail が選択されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/select_material.png)
1. マテリアルを1度クリックし、Ctrl+D で複製する。わかりやすい名前に変更しておく。  
![Project ウィンドウの Assets > Materials > sample_material フォルダ。マテリアル tail と、それを複製した tail_fur_shader が並んでいる](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/duplicate_material.png)
1. アバターBodyの `Materials` から、作成したマテリアルを適用する。  
![Inspector の Materials 欄。Element 5 が tail から tail_fur_shader に置き換わっている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/apply_new_material.png)
1. 新しいマテリアルに、目的のシェーダーを適用する。
    * シェーダーのパラメータもここで調整します。

この例では、liltoonファーの激重設定を使います。  
![ファーシェーダーを適用した尻尾のアップ。オレンジからクリーム色に変わる毛並みがふさふさに描画されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/fur_shader.jpg)

（[ファーシェーダーの適用メモはこちら](/posts/liltoon-fur)）

以降、「マテリアル切り替えのアニメーションを作成し、ExMenuから再生できるようにする」という操作手順の説明です。

## マテリアル変更のためのアニメーションを作成する

1. Ctrl+6 でAnimationウィンドウを開く
1. そのままHierarchyのアバターをクリックする
1. アニメーションファイルを作成する
    * 空の場合、Createボタンを押して新規作成する  
    ![ExampleAvatar を選択した状態の Animation ウィンドウ。「To begin animating ExampleAvatar, create an Animation Clip.」というメッセージと Create ボタンが表示されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_animation_file.png)
    * 既にアニメーションが存在する場合、`Create New Clip...`から新規作成する  
    ![Animation ウィンドウのクリップ選択ドロップダウン。既存の disable_fur の下に「Create New Clip...」がある](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_revert_animation.png)
1. マテリアル変更後の状態を指定するためのアニメーションファイルを作成する
    * 赤丸（録画ボタン）を押す
    * マテリアルスロット内のマテリアルを変更する
    * 赤丸（録画ボタン）を押す  
    ![録画ボタンが押された disable_fur クリップの Animation ウィンドウと、右側の Inspector の Materials 欄。Element 5 が tail_fur_shader になっている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/record_animation.png)
    * 0フレーム目のみが存在するアニメーションファイルが作成される  
    ![disable_fur クリップの Animation ウィンドウ。「Body : Skinned Mesh Renderer」のプロパティが追加され、0フレーム目にだけキーフレームがある](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/animation_created.png)
    * 例では `disable_fur.anim` とした
1. 元の状態を指定するためのアニメーションファイルを作成する
    * `Create New Clip...`から新規作成する  
    ![Animation ウィンドウのクリップ選択ドロップダウン。既存の disable_fur の下に「Create New Clip...」がある](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_revert_animation.png)
    * 「赤丸 → マテリアルを一度変更し、戻す → 赤丸」で現在のマテリアルを指定するアニメーションを作る
    * 例では `enable_fur.anim` とした

以降、「ExMenuから適用Animationを切り替えられるようにする」という操作手順の説明です。

## ExpressionMenuから適用Animationを切り替えられるようにする

1. アバターの Expression - Parameters に設定されているファイルを開く  
![アバターの Expressions 設定欄。Menu に ExMenu (VRCExpressionsMenu)、Parameters に ExParams (VRCExpressionParameters) が設定されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/avatar_expressions.png)
1. Expression Parameter にBool型のパラメータを追加する  
![ExParams の Inspector。VRCEmote、VRCFaceBlendH、VRCFaceBlendV の下に、赤い矢印で示した Bool 型のパラメータ DisableFur が追加されている。DisableFur の Saved はオフ](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/add_param.png)
    * この例では `DisableFur` とした（後で使う）
    * ワールド移動や再起動をしてもシェーダー選択を維持してほしい場合のみ`Saved`のチェックを入れる
1. アバターの Expression - Menu に設定されているファイルを開く  
![アバターの Expressions 設定欄。Menu に ExMenu (VRCExpressionsMenu)、Parameters に ExParams (VRCExpressionParameters) が設定されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/avatar_expressions.png)
1. Expression Menuにシェーダー変更用の項目を追加する  
![ExMenu の Inspector。Controls の末尾に Disable Fur が追加され、Name が Disable Fur、Type が Toggle、Parameter が DisableFur に設定されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/exmenu.png)
    * Name は任意
    * Type は`Toggle`
    * Parameter は先程作成したExpressionParameterのパラメータのものを選ぶ（例では`DisableFur`）
1. アバターの Playable Layers - FX に設定されている項目を開く
1. Animator - Parameters の＋ボタン（Bool）から、先程作成したパラメータを追加する（例では`DisableFur`）  
![Animator ウィンドウの Parameters タブ。Animator タブ、Parameters タブ、＋ボタンが赤丸で囲まれ、一覧の末尾に Bool 型の DisableFur が追加されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/fx_parameter.png)
1. Animator - Layers の＋ボタンを押し、レイヤーを追加する  
![Animator ウィンドウの Layers タブ。Layers タブと＋ボタンが赤丸で囲まれ、末尾に追加した ShaderController レイヤーの歯車アイコンと、設定パネルの Weight 1 も赤丸で強調されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/create_layer.png)
    * **［重要］追加したレイヤーの Weight を1にする**
1. Stateを2つ追加し、双方向のTransitionを設定する  
![Animator のステートマシン。Entry から FurEnabled へ遷移し、FurEnabled と FurDisabled の間に双方向の Transition がある。余白の右クリックメニューで Create State > Empty が選ばれている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/states.png)
    * Stateは 余白を右クリック → Create State → Empty で作成できる
    * Transitionは Stateをクリック → Make Transition で作成できる
1. 2つのStateに、作成したアニメーションを適用する
    * Stateを選び、Motionに作成したアニメーションをドラッグアンドドロップ
    * 例では、`enable_fur` と `disable_fur`
1. 2つのTransitionに、パラメータによる遷移条件を追加する
    * 行きのTransitionを選び、Conditionsに `パラメータ名 true` を追加する  
    ![FurEnabled から FurDisabled への Transition を選択した状態。Conditions に「DisableFur true」が設定されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/conditions.png)
    * 戻りのTransitionを選び、Conditionsに `パラメータ名 false` を追加する  
    ![FurDisabled から FurEnabled への Transition を選択した状態。Conditions に「DisableFur false」が設定されている](/assets/2023/2023-01-03-vrchat-switch-shader-from-exmenu/conditions_2.png)

あとはアップロードすれば完了です。

# 動作例

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">ファーシェーダーのオンオフ実演 <a href="https://t.co/oS8KaO4LTQ">pic.twitter.com/oS8KaO4LTQ</a></p>&mdash; aruma_vr (@aruma256_vr) <a href="https://twitter.com/aruma256_vr/status/1610114048783450112?ref_src=twsrc%5Etfw">January 3, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
