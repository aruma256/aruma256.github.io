---
title: "Rails6.1 AnonymousControllerと非UTF-8を含むPOSTリクエストの組み合わせでハマった"
categories:
    - blog
tags:
    - Rails
toc: true
---

Rails 6.0 → 6.1 の移行にて、非UTF-8を含むPOSTリクエストに対する処理を[rspec-railsのAnonymousController](https://relishapp.com/rspec/rspec-rails/v/5-1/docs/controller-specs/anonymous-controller)を使ってテストしている部分が `ActionController::BadRequest` で落ちるようになった問題とその解決について

# 解決方法の概要

1. AnonymousController作成時、対象アクションのUTF-8検証をスキップさせる
   * `skip_parameter_encoding アクション名`
1. 一時的に定数を設定する
   * `AnonymousController = controller_class`
1. テスト実行後、定数を削除する
   * `Object.send(:remove_const, :AnonymousController)`

以降は経緯や考えたことなどを載せます。

---

# Rails6.1の変更

Railsを 6.0 から 6.1 に更新した際、非UTF-8を含むPOSTリクエストをするテストケースが落ちてしまうことに気がつきました。  
エラーメッセージは以下です。

```
ActionController::BadRequest:
    Invalid request parameters: Invalid encoding for parameter: ****
```

[Rails 6.1 のCHANGELOG](https://github.com/rails/rails/blob/6-1-stable/actionpack/CHANGELOG.md#rails-610-december-09-2020) を確認すると、次のような記載がありました。

> Catch invalid UTF-8 parameters for POST requests and respond with BadRequest.

この挙動は、[`skip_parameter_encoding`](https://api.rubyonrails.org/v6.1/classes/ActionController/ParameterEncoding/ClassMethods.html#method-i-skip_parameter_encoding) の指定により部分的に無効化することができます。

例：ExampleControllerの `create` アクションのみ、エンコーディングのチェックをスキップさせる

```ruby
class ExampleController < ApplicationController
  skip_parameter_encoding :create
```

通常のコントローラーであればこれで解決されるのですが、AnonymousControllerを使っているテストでは追加の対応が必要でした。

# AnonymousControllerの場合

AnonymousControllerでは、`skip_parameter_encoding`を追加してもスキップが適用されず、BadRequestが返されました。

Railsの実装を追っていくと、この現象は以下のような流れで発生しているようでした。

1. リクエストが飛んできた際に[`controller_class_for`](https://github.com/rails/rails/blob/v6.1.6/actionpack/lib/action_dispatch/http/request.rb#L88-L104)が呼ばれる。このとき、引数は`"anonymous"`
1. このメソッド内では `引数.camelize + "Controller"` の文字列から一致する定数のオブジェクトを得ようとするが、AnonymousController定数が存在しないためコントローラーのクラス取得に失敗する。
1. コントローラークラスが不明なので、`skip_parameter_encoding` などの設定も反映できず、デフォルト動作（非UTF-8は弾く）となってしまう。

# 対策

今回は、"AnonymousController定数を作ってしまう"という方法で、クラス取得が成功するようにしました。

```ruby
RSpec.describe テスト対象, type: :controller do
  controller(ApplicationController) do
    skip_parameter_encoding :対象アクション

    def 対象アクション
      # 動作
    end
  end

  AnonymousController = controller_class
```

また、作成した定数が他のテストに影響することを防ぐため、テスト終了時に定数を削除するようにしました。

```ruby
    after(:all) do
      Object.send(:remove_const, :AnonymousController)
    end
```
