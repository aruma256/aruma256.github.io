---
title: "VRCSDK3 to VCC アバタープロジェクトの移行作業メモ"
categories:
    - blog
tags:
    - VRChat
toc: true
---

VRChatアバターのプロジェクトを VRCSDK3 から VCC環境へ移行した際の手順メモです。

# 背景

> We're planning to distribute all SDK updates solely via the VRChat Creator Companion starting in 2023.
>
> Please migrate your projects to VCC soon.

[https://docs.vrchat.com/docs/vrchat-202231p2](https://docs.vrchat.com/docs/vrchat-202231p2)

VRChat Creator Companion (VCC) に移行しましょう。

# 公式手順リンク

公式な移行手順は [https://vcc.docs.vrchat.com/vpm/migrating](https://vcc.docs.vrchat.com/vpm/migrating) 参照してください。

以降は 2022/11/06 時点で↑を参考に実施した記録です。

# 手順メモ

## 環境

* アバター: [【オリジナルVRChat向けアバター】くれな](https://booth.pm/ja/items/2068711) ver1.2 改変
* 移行元のSDK: `VRCSDK3-AVATAR-2022.07.26.21.45_Public.unitypackage`
* 導入しているツール
    * [VRC睡眠システム](https://booth.pm/ja/items/3406857) v3.0.0

## プロジェクトのバックアップ

**プロジェクト全体をzip圧縮し、ローカルと個人クラウドへ保存**しておきました。  
（私はプロジェクトファイルをgitで管理しているので、リモートへのpushも行いました。）

※VCCの機能でバックアップすることも可能ですが、この機能によるバックアップファイルには、プロジェクト本体以外のファイル（`.git`など）が含まれないようでした。

## 移行手順

1. VCCをインストール
    * [https://vrchat.com/home/download](https://vrchat.com/home/download) の `Download the Creator Companion` から導入しました。
1. VCCを起動
1. VCCの `ADD` から、移行対象のプロジェクトを選択
1. リストに追加されたプロジェクトを選択（ここでは `Kurena-modded` ）  
![リストに追加されたプロジェクトを選択](/assets/2022/2022-11-06-vrchat-migrating-sdk3-avatar-to-vcc/vcc_import.png)
1. `Migrate` をクリック  
![Migrateをクリック](/assets/2022/2022-11-06-vrchat-migrating-sdk3-avatar-to-vcc/vcc_click_migrate.png)
1. 移行方式を選択  
![移行方式を選択](/assets/2022/2022-11-06-vrchat-migrating-sdk3-avatar-to-vcc/vcc_click_migrate_in_place.png)
    * 旧プロジェクトの併用はしない、git等のバージョン管理を使用している という理由から `Migrate in place` を選択しました。
    * 旧プロジェクトを併用する場合は `Migrate a copy` を選ぶと良さそうです。
1. 移行処理の完了を待つ（元の画面に戻り、画面下に `Sucessfully Migrated ...` が出れば成功の模様 ）
1. (git等で管理している場合)  
差分をコミットしておく
1. `Open Project` をクリックしてプロジェクトを開く
1. (optional) Blueprint ID を更新する  
![移行方式を選択](/assets/2022/2022-11-06-vrchat-migrating-sdk3-avatar-to-vcc/update_blueprint_id.png)
    * 必須ではありませんが、念のため既存アバターの置換を避けたかったので、Blueprint ID を更新しました。
1. アバターをアップロードし、VRChat内で動作確認する
    * 移動 : 前後左右・ジャンプ
    * 姿勢 : 立ち・しゃがみ・伏せ・AFK
    * ハンドジェスチャー関連
    * PhysBones や Contacts
    * Expression Menu
    * アバター及びオブジェクトの見た目（シェーダー周り）
    * その他、視線やリップシンクなど
1. (optional / 移行時に `Migrate in place` を選んだ場合)  
Unity Hubを開き、 `Remove project form list` を行う
    * 今後プロジェクトを開く際には、Unity HubではなくVCC経由になります。  

以上の手順で移行できました。
