---
title: "SynologyのNASをVSCodeのRemote Development環境として使う"
categories:
    - blog
tags:
    - Synology NAS
    - VSCode
---

手元のNASをRemote Development環境にしてみました。

# 方針

* [SynologyNASのDockerパッケージ](https://www.synology.com/ja-jp/dsm/packages/Docker)でUbuntuコンテナを作ってsshdを動かす。
* [VSCodeのRemote - SSH拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)からsshで接続する。
* 注: [基本的にはコンテナ内でのsshd実行は非推奨とされている](https://docs.docker.com/samples/running_ssh_service/)が、今回はホスト（NAS本体）へのSSHを避けることを優先した。
    * NAS本体へSSHする場合は [Connect to remote Docker over SSH](https://code.visualstudio.com/docs/containers/ssh) を検討すると良さそう。


# 環境・機材

* NAS: Synology DS920+
    * DSM: `7.0.1-42218 Update 3`
    * Docker: `20.10.3-1239`
* PC: Windows 10 Pro (21H2)
    * Visual Studio Code: `Version 1.65.2`
        * Remote - SSH: `v0.76.1`

PCはVSCodeインストール済み・ssh鍵が生成済みの状態から始める。

# イメージのダウンロード

1. DSMのパッケージセンターから、Dockerパッケージをインストールする。
1. `Dockerアプリ - イメージ - 追加 - URLから追加` で `ubuntu` を指定し、イメージをダウンロードする。  
![pull container](/assets/2022/2022-03-24-synology-nas-vscode/pull_container.png)
    * ダウンロード時、オプション(ユーザー名/パスワード)は空欄にする。
        * 今回は `ubuntu:20.04` を選択した。

# コンテナの起動

1. ダウンロードしたイメージを選択し、`起動`
1. 任意のコンテナ名をつける。
1. `詳細設定` - `ポート設定` - `追加` で **コンテナポート 22 TCP** を指定する。  
![container port](/assets/2022/2022-03-24-synology-nas-vscode/container_port.png)
    * ローカルポートは任意（こだわりが無ければ`自動`のままでOK）
        * このポートがSSH接続時にPCから指定するポート番号となる
1. コンテナの作成を完了する。

# SSHサーバーの設定と起動

1. `Dockerアプリ - コンテナ` で作成したコンテナを選び、`詳細` を選択する。
    * ローカルポートを`自動`にしていた場合、この画面の`ポート設定`でポート番号を確認する。
1. `端末`タブで端末を開く。
1. sshをインストールする。
```
apt update
apt upgrade -y
apt install ssh -y
```
    * tips: Dockerアプリの端末画面では、 `Ctrl+A` を押してから `Ctrl+V` でペーストできる。
1. PCの公開鍵を置く。
```
mkdir -m 700 -p ~/.ssh/
echo "あなたのPCの公開鍵" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```
1. sshd_configを設定しsshdを起動する。
```
sed -i "s/#PermitRootLogin prohibit-password/PermitRootLogin prohibit-password/" /etc/ssh/sshd_config
sed -i "s/#PubkeyAuthentication yes/PubkeyAuthentication yes/" /etc/ssh/sshd_config
sed -i "s/#PasswordAuthentication yes/PasswordAuthentication no/" /etc/ssh/sshd_config
/etc/init.d/ssh restart
```
    * 注: 今回は十分に信頼されたLAN内での使用を想定している。

# VSCodeから接続

1. VSCodeの拡張機能 `Remote - SSH` をインストールする。
    * 方法1: VSCode内の Extensions で `remote ssh` と検索する。
    * 方法2: [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) からインストールする。
1. VSCodeウィンドウ左下の 緑色のボタン（Open a Remote Window）をクリックする。    
![open a remote window](/assets/2022/2022-03-24-synology-nas-vscode/open-a-remote-window.png)
1. `Connect to Host` → `Add New SSH Host` を選択する。
1. `ssh -p ローカルポート番号 root@NASのIPアドレス` を入力する。
    * 例：NASのIPアドレスが `192.168.11.16`、 ローカルポート番号が `40000` なら `ssh -p 40000 root@192.168.11.16`

以上で接続できた。
