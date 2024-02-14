---
title: "ChatGPT Plus から LibreChat + ChatGPT API に乗り換えた話（お試し編）"
categories:
    - blog
tags:
    - LLM
header:
    image: /assets/2024/2024-02-14-librechat/librechat-multi-model.webp
toc: true
---

ChatGPT Plus からの移行先として LibreChat を触ってみました。  
使い勝手がよく、しばらくメインで使っていくことにしたので、機能とローカルでの動かし方をまとめます。（デプロイ編は別記事にします。）

# 背景

ChatGPT Plus は、 OpenAI が提供する ChatGPT のサブスクリプションプランです。月額$20で、ピークタイムのアクセス、高速なレスポンス、新機能の早期アクセスなどが提供されます。  
2024年2月14日現在では、

* GPT-4 へのアクセス（40メッセージ/3時間 の上限あり）
* GPTs の作成・利用
* DALL·E, Browsing, Advanced Data Analysis などの追加ツール・機能

が提供されています。

今となっては「便利」を通り過ぎて常時使っているレベルとなった ChatGPT (Plus) ですが、

* 40メッセージ/3時間 の上限を超えて使いたい
* Temperature など、APIでのみ設定可能なパラメータを自由に設定したい
* Google から[Gemini Ultra 1.0 が発表される(2024/02/08)](https://japan.googleblog.com/2024/02/bard-gemini-ultra-10-gemini.html) など、今後ますますOpenAI以外のLLMサービスやローカルで動かせるモデルが増えると予想されるため
  * 他のLLMを気軽に試せる状態にしておきたい
  * **会話履歴を自分の管理下におきたい** （エクスポート機能ではなく）

といった理由で、ChatGPT Plus から 「ChatGPT API を利用可能なローカルで動かせるクライアントソフトウェア」に移行しようと考えました。

# LibreChat

[LibreChat](https://github.com/danny-avila/LibreChat) は、リポジトリのAboutに "Enhanced ChatGPT Clone" と書かれている通り、ChatGPT に似たUIを持つOSSです。

Light Mode

![LibreChatの画面(Light Mode)](/assets/2024/2024-02-14-librechat/librechat-light.webp)

Dark Mode

![LibreChatの画面(Dark Mode)](/assets/2024/2024-02-14-librechat/librechat-dark.webp)

LibreChat には ChatGPT (Plus) にはない特徴がいくつかあります。

## LibreChat の特徴 (2024/02/14 現在)

LibreChat では ChatGPT API の他にも、 Google Vertex AI (Gemini) や Azure OpenAI Service など複数のエンドポイントを利用できます。

![Endpointの選択](/assets/2024/2024-02-14-librechat/librechat-endpoints.webp)

OpenAI ChatGPT を利用する場合でも、 `gpt-4-0125-preview` , `gpt-4-1106-preview` のように特定のモデルを選択できます。

![モデルの選択](/assets/2024/2024-02-14-librechat/librechat-openai-models.webp)

利用時のパラメータも自由に設定できます。

![パラメータの設定](/assets/2024/2024-02-14-librechat/librechat-param-config.webp)

LibreChat にはユーザーアカウントの管理機能が組み込まれており、新規登録やログインができます。

![ログイン画面](/assets/2024/2024-02-14-librechat/librechat-login.webp)

そして、各エンドポイントのAPIキーは、LibreChat の各ユーザーアカウントが個別に登録し使用します。

![APIキーの設定](/assets/2024/2024-02-14-librechat/librechat-api-key-input.webp)

（APIキーは、設定ファイルに埋め込んで全ユーザーに一括解放することもできます。）

また、ベータ機能ですが、チャット中のモデル切り替えができるようになっていました。

![チャット途中でのモデル切り替え](/assets/2024/2024-02-14-librechat/librechat-multi-model.webp)

# LibreChat をローカルで動かす (v0.6.6)

公式ドキュメントで推奨されている、[Docker Compose を使う方法](https://docs.librechat.ai/install/installation/docker_compose_install.html)が手軽で良いでしょう。  
最新の手順は公式ドキュメントを参照してください。ここでは、v0.6.6 時点での手順を示します。

1. `git clone https://github.com/danny-avila/LibreChat.git`
1. `cp .env.example .env`
1. `.env` ファイルを開き、106行付近にある `OPENAI_MODELS` のコメントアウトを解除
1. `docker compose up -d`

コンテナが立ち上がってから `http://localhost:3080` にアクセスすると、LibreChat が動作しているはずです。  
あとはアカウント作成（適当なメアドとパスワードでよい）をして、APIキーを設定すれば利用できます。

（デプロイ編へ続く）
