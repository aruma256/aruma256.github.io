---
title: "ruby/gem_rbs_collection に初めてコントリビュートするまで"
categories:
    - blog
tags:
    - Ruby
    - RBS
    - OSS
toc: true
---

担当しているRailsプロジェクトに[rbs-inline](https://github.com/soutaro/rbs-inline)と[steep](https://github.com/soutaro/steep)による型付け・型検査を導入しました。  
検出された型エラーの調査・修正を行う中で、[ruby/gem_rbs_collection](https://github.com/ruby/gem_rbs_collection) 側の追加・修正が必要な箇所をいくつか見つけたので、初めて gem_rbs_collection にコントリビュートしてみました。

## gem_rbs_collection とは

[gem_rbs_collection](https://github.com/ruby/gem_rbs_collection) は、RBSを同梱していないgemのための型定義を集めた、コミュニティ管理のリポジトリです。

```bash
rbs collection init
rbs collection install
```

で簡単に導入でき、steepなどの型チェッカーと組み合わせて利用できます。

## 作成したPR

これまで合計3つのPRを出しました。

### PR #871: GraphQL::ExecutionError#initialize の型定義追加

[graphql: Add types for GraphQL::ExecutionError#initialize #871](https://github.com/ruby/gem_rbs_collection/pull/871)

初めてのPRです。 graphql-ruby gemの `GraphQL::ExecutionError#initialize` メソッドは `ast_node` 、 `options` 、 `extensions` などの引数を受け取れますが、そもそもメソッドの型定義がなかったためにこれらの引数を渡すと型エラーが発生する状態でした。

```
test.rb:61:62: [error] Unexpected keyword argument
│ Diagnostic ID: Ruby::UnexpectedKeywordArgument
│
└       raise GraphQL::ExecutionError.new("Test error message", ast_node: nil, extensions: { "code" => "TEST_ERROR" })
                                                                ~~~~~~~~

test.rb:61:77: [error] Unexpected keyword argument
│ Diagnostic ID: Ruby::UnexpectedKeywordArgument
│
└       raise GraphQL::ExecutionError.new("Test error message", ast_node: nil, extensions: { "code" => "TEST_ERROR" })
                                                                               ~~~~~~~~~~
```

（これはテストコードをもとに当時の状況を再現したものです）

* gem の api-doc [https://graphql-ruby.org/api-doc/1.12.0/GraphQL/ExecutionError.html#initialize-instance_method](https://graphql-ruby.org/api-doc/1.12.0/GraphQL/ExecutionError.html#initialize-instance_method)
* gem のソースコード [https://github.com/rmosolgo/graphql-ruby/blob/v1.12.0/lib/graphql/execution_error.rb](https://github.com/rmosolgo/graphql-ruby/blob/v1.12.0/lib/graphql/execution_error.rb)

などを確認しつつ、以下のような型定義を追加しました。

```rbs
def initialize: (String message, ?ast_node: untyped, ?extensions: Hash[untyped, untyped]?) -> void
```

通常の開発であれば単体テストなどで動作を保証できますが、型定義ファイル自体はそもそも実行するものではないため実行時の挙動に基づいたテストはできません。  
代わりに gem_rbs_collection では、まずそのgemを利用した際のコードを用意し、それを型定義ファイルに基づいた型検査がpassすることをテストします。

テストとして用意した実際のコードが以下です。

```ruby
def error_field
  raise GraphQL::ExecutionError.new("Test error message", ast_node: nil, extensions: { "code" => "TEST_ERROR" })
end
```

このコードをテストに追加すると型検査が落ちるようになるので、型定義を修正し、再び型検査が通るようになることを確認しました。つまり、TDDのサイクルで進められます。

ちなみにgem_rbs_collectionは[レビュー無しでもマージできる運用](https://www.timedia.co.jp/tech/20240513-tech/)になっていますが、初めてで心配だったので念のためレビューを依頼し、approveを頂いてからマージしました。元々はこのPRに `options` 引数も含めていたのですが、レビューにて deprecated であることを指摘頂き修正しました。（ありがとうございました！）

### PR #887: RQRCode::QRCode#initialize の型定義修正

[rqrcode: Fix type definition for RQRCode::QRCode#initialize #887](https://github.com/ruby/gem_rbs_collection/pull/887)

rqrcode gemの `RQRCode::QRCode#initialize` は[gemのREADMEにもあるように](https://github.com/whomwah/rqrcode/blob/e789be339b6f833a01bc4c84e3d444e4699c3765/README.md#advanced-options)オプションを受け取れますが、これが型検査にてエラーとなっていました。

```
test.rb:6:45: [error] Unexpected keyword argument
│ Diagnostic ID: Ruby::UnexpectedKeywordArgument
│
└ qr = RQRCode::QRCode.new("https://kyan.com", level: :h)
                                               ~~~~~
```

gem の実装に合わせた型定義に修正しました。

```diff
- def initialize: (String) -> void
+ def initialize: (String, *untyped) -> void
```

### PR #933: GraphQL::Schema::Resolver.null メソッド署名の追加

[graphql: Add GraphQL::Schema::Resolver.null method signature #933](https://github.com/ruby/gem_rbs_collection/pull/933)

graphql-ruby gemの `GraphQL::Schema::Resolver.null` クラスメソッドの型定義がなかったため、追加しました。

```
test.rb:76:4: [error] Type `singleton(::Mutations::Ping)` does not have method `null`
│ Diagnostic ID: Ruby::NoMethod
│
└     null true
      ~~~~
```

```diff
+ def self.null: (?bool allow_null) -> untyped
```

## 注意すべき点

gem_rbs_collection では、gem ごとに対象とするバージョンが定められています。  
PRを作り始める前に、そのメソッドや引数が追加・変更されたどのバージョンと型定義の対象バージョンをチェックしておくとよいでしょう。

## おわりに

gem側の型エラーはその場でパッチを用意して暫定対応することもできますが、以前 RubyKaigi 2022 の発表 [Types teaches success, what will we do?](https://rubykaigi.org/2022/presentations/fugakkbn.html) で流れを聞いていたので、この機会にコントリビュートしてみることにしました。

実際にやってみると、ハードルは思ったより低かったです。型定義の不足や誤りを見つけたら、暫定対応だけでなくコントリビュートも選択肢に入れてみください。
