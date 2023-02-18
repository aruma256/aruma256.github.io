---
title: "RustのAtCoder環境構築手順（devcontainer編）"
categories:
    - blog
tags:
    - AtCoder
    - Rust
toc: true
---

VSCodeとdevcontainerを使い、RustでAtCoderのコンテストに参加するための環境を整えました。  
その際の手順メモです。

# Dockerfileを用意する

VSCodeとDockerを使える状態から始めます。

まずは、devcontainer用のDockerfileを作ります。  
`rust.Dockerfile`というファイル名で、プロジェクト直下に置きます。  
ファイルの内容は以下のようにしました。

```dockerfile
FROM rust
RUN cargo install cargo-compete && rustup install 1.42.0
```

* [cargo-compete](https://github.com/qryxip/cargo-compete/blob/master/README-ja.md) は、競技プログラミング用のcargoのツールです。
* 1.42.0 は、2023年2月18日現在[AtCoderが対応しているRustのバージョン](https://atcoder.jp/contests/abc289/rules)です。
    * 「最初から `rust:1.42.0` 系のイメージを使えばよいのでは？」→ そのバージョンでは cargo-compete のインストールが困難でした。

# devcontainerを用意する

VSCodeに[Dev Containers拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)を導入しておきます。

コマンドパレット（Ctrl+Shift+P）の `Dev Containers: Add Dev Container Configuration Files...` で、rust.Dockerfileを利用したDev Containers設定を作ります。

Rust用の拡張機能も設定します。  
`.devcontainer/devcontainer.json` を開き、
```json
	"extensions": [
		"rust-lang.rust-analyzer"
	]
```
を追加し、保存します。

Reopen in Container をします。（初回はコンテナ作成が行われるため、時間がかかります）

# コンテナ内からAtCoderへログインする

以降はコンテナ内で作業します。

competeの初期化: `cargo compete init atcoder`  
以下の設定は `2` としました。

```
# cargo compete init atcoder

Do you use crates on AtCoder?
1 No
2 Yes
3 Yes, but I submit base64-encoded programs
1..3: 2
```

ログイン: `cargo compete login atcoder`  
AtCoderアカウントのUsernameとPasswordを入力します。

> `Successfully Logged in`

と出力されればログイン成功です。

# 挑戦するコンテストの環境を用意する

今回は例として [ABC288](https://atcoder.jp/contests/abc288) の環境を用意します。

`cargo compete new abc288` を実行すると `abc288` というディレクトリが作成されます。  

以降は `abc288` 内で作業するので、中へ移動しておきます。  
`cd abc288`

# 問題を解いて、コードを提出する

今回は [A問題 - Many A+B Problems](https://atcoder.jp/contests/abc288/tasks/abc288_a) を解いてみます。

`src/bin/` 以下に、各問題に対応する `.rs` ファイルが作成されています。  
A問題を解くので、 `src/bin/a.rs` を開きます。

## 入力の受け取り

入力の受け取りには [proconio](https://docs.rs/proconio/latest/proconio/) が便利です。

今回の入力は
```
N
A1 B1
A2 B2
...
AN BN
```
という形式なので、proconioを使って受け取ります。
```rust
use proconio::input;

fn main() {
    input! {
        n: u64,
        ab: [(i64, i64); n],
    }
    //TODO 出力
}
```

## 解答を完成させる

正しい出力をするように実装します。  
[RustCoder ―― AtCoder と Rust で始める競技プログラミング入門](https://zenn.dev/toga/books/rust-atcoder) などが参考になります。

```rust
use proconio::input;

fn main() {
    input! {
        n: u64,
        ab: [(i64, i64); n],
    }
    for (a, b) in ab {
        println!("{}", a + b);
    }
}
```

## テストケースで検証する

コードが完成したら、テストケースについて正しい出力をするかを確認します。  
`cargo compete test a`

## 提出する

作成したコードが問題なさそうであれば、提出します。  
`cargo compete submit a`

ACとなれば正答です。
