---
title: "LibreChat"
categories:
    - blog
tags:
    - LLM
toc: true
---

ChatGPT Plus からの移行先として、LibreChat を触ってみました。

# 背景

ChatGPT Plus は、 OpenAI が提供する ChatGPT のサブスクリプションプランです。月額$20で、ピークタイムのアクセス、高速なレスポンス、新機能の早期アクセスなどが提供されます。  
2024年2月10日現在では、

* GPT-4 へのアクセス（40メッセージ/3時間 の上限あり）
* GPTs の作成・利用
* DALL·E, Browsing, Advanced Data Analysis などの追加ツール・機能

が提供されています。

今となっては「便利」を通り過ぎて「常に使っているのが普通」となった ChatGPT (Plus) ですが、

* 40メッセージ/3時間 の上限を超えて使いたい
* Temperature など、APIでのみ設定可能なパラメータを自由に設定したい
* Google から[Gemini Ultra 1.0 が発表される(2024/02/08)](https://japan.googleblog.com/2024/02/bard-gemini-ultra-10-gemini.html) など、今後ますますOpenAI以外のLLMサービスやローカルで動かせるモデルが増えると予想されるため
  * 他のLLMを気軽に試せる状態にしておきたい
  * **会話履歴を自分の管理下におきたい** （エクスポート機能ではなく）

といった理由で、ChatGPT Plus から 「ChatGPT API を利用可能なローカルで動かせるクライアントソフトウェア」に移行しようと考えました。
