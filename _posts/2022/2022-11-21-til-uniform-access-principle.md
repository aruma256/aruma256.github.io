---
title: "Today I Learned: UniformAccessPrinciple と Ruby"
categories:
    - blog
tags:
    - TIL
    - Ruby
toc: true
---

「Ruby、この考え方か〜」となったのでメモ

# UniformAccessPrinciple

[UniformAccessPrinciple](https://martinfowler.com/bliki/UniformAccessPrinciple.html)

以下、自分の解釈

---

# 概要

オブジェクトが（生で）保持している値だけではなく、演算に基づいて返す値もプロパティと同様にアクセスできるように、インターフェースを統一する。

まず、以下のようなクラスを考える。

```ruby
class Person
  attr_reader :birthdate

  def initialize(birthdate:)
    @birthdate = birthdate
  end

  def calc_age()
    # 年齢計算
  end
end
```

外部からこのクラスを利用するときは、次のようになるだろう。

```ruby
me = Person.new(birthdate: Date.new(2000, 1, 1))

puts "誕生日は #{me.birthdate}"
puts "年齢　は #{me.calc_age()}"
```

誕生日の取得はプロパティへの直接的なアクセスで済むが、年齢の取得はオブジェクトのメソッドに計算を依頼する形になる。  
実装の通りであり問題無いように思えるが、UniformAccessPrincipleに基づいて考えると
**「年齢の取得が"計算"であるというクラスの内部的な事情を、そのクラスを利用する外部が考慮しなければならない」**
という点に気が付く。

解決方法はシンプルで、メソッドの利用をプロパティアクセスのように見せてしまえばよい。

`calc_age()` を `age()` に変更する。

```ruby
class Person
  # 省略

  def age() # calc_age -> age
    # 年齢計算
  end
end
```

```ruby
puts "誕生日は #{me.birthdate}"
puts "年齢　は #{me.age()}"
```

さらに、Rubyでは `()` を省略できることを利用すると

```ruby
puts "誕生日は #{me.birthdate}"
puts "年齢　は #{me.age}"
```

クラスの内部事情を気にしない/させない書き方を実現できた。

## 「それが重たい処理のときはどうするの？」

そのようなときこそ `calc_` などを付け、利用者に注意を促すのが良いだろう。  
（気にせず呼び出しても問題にならない程度のものなら、`calc_`をつけず、プロパティのように見せてもよいだろう。）
