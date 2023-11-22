---
title: "PythonでもRubyでも実行できるが異なる出力となるコードを考える"
categories:
    - blog
tags:
    - Python
    - Ruby
toc: true
---

PythonとしてもRubyとしても文法的に正しく実行もできるが、出力が異なるコードを考えてみました。

# きっかけ

登場人物

* 私(aruma): Python が好き。当時はRubyを全く知らなかった。
* Bさん: Ruby が好き。当時はPythonを全く知らなかった。

実話です。  
ある日、Bさんに「Python の "Hello, world!" を見せて」と言われました。  
私は以下のコードを見せました。

```python
print("Hello, world!")
```

これを見たBさんは、「このコード、そのままRubyでも動くな」と言いました。  
（へぇ〜。きっと文法似てるんだな。）

あれから2年が経ち、私はRubyを書くようになりました。  
（文法、全然違うわ）

そして最近、ふとこの出来事を思い出したとき、こんなことを考えました。

**PythonとしてもRubyとしても文法的に正しく実行もできるが、出力が異なるコードって作れるだろうか？**

みなさんも、ぜひ考えてみてください。  
以下、答えを含みます。

# 作ってみた

検証は以下のバージョンで行いました。

* Python: 3.12.0
* Ruby: 3.2.2

## Python と Ruby　で共通のコードを考える

まずは、PythonとRubyで共通のコードを考えました。

整数と文字列の記述および代入などは、特殊なことをしない限りは共通コードになります。

```python
# Python
a = 1
a += 3
b = "Hello, world!"
```

```ruby
# Ruby
a = 1
a += 3
b = "Hello, world!"
```

また、関数呼び出しも共通コードにできます。

```python
# Python
func("sample")
```

```ruby
# Ruby
func("sample")
```

Pythonで言う list、Rubyで言う Array も共通コードにできます。

```python
# Python
a = [1, 2, 3]
```

```ruby
# Ruby
a = [1, 2, 3]
```

## Python と Ruby　で異なるコードを考える

真理値やif文、関数定義などは文法が異なります。  
つまり、今回これらの要素は使えません。

```python
# Python
def func(n):
    if n > 0:
        return True
    elif n == 0:
        return False
    else:
        return True
```

```ruby
# Ruby
def func(n)
    if n > 0
        return true
    elsif n == 0
        return false
    else
        return true
    end
end
```

## Python と Ruby　で異なる出力を考える

ここまで挙げた共通コードの中で、PythonとRubyで挙動が異なるものを探します。  
うーーーん...と考えてみると、1つ思いつきました。

**list / Array に対する、 `+=` 演算子の挙動です。**

Pythonにおける `list` は、ミュータブルなシーケンス型の1つです。  
ミュータブルなシーケンス `s` とイテラブルな `t` があるとき、`s += t` はシーケンス `s` を拡張して `t` の要素を追加する操作、すなわち `s.extend(t)` と等価です。
参考: [https://docs.python.org/ja/3.12/library/stdtypes.html#mutable-sequence-types](https://docs.python.org/ja/3.12/library/stdtypes.html#mutable-sequence-types)

一方、Rubyにおける `s += t` は単なる自己代入、すなわち `s = s + t` と等価です。
参考: [https://docs.ruby-lang.org/ja/3.2/doc/spec=2foperator.html#selfassign](https://docs.ruby-lang.org/ja/3.2/doc/spec=2foperator.html#selfassign)
つまり、 `s` と `t` がともに `Array` の場合、`s` には新しく作成された `Array` が代入されます。

この差を使えば、同一コードで異なるオブジェクトを参照させることができます。

```python
# Python
a = [1, 2]
b = a
a += [3, 4]
print(b)  # [1, 2, 3, 4]
```

```ruby
# Ruby
a = [1, 2]
b = a
a += [3, 4]
print(b)  # [1, 2]
```

## 完成したコード

以上を踏まえて、完成したコードは以下の通りです。  
Pythonでは `Python`、Rubyでは `Ruby` と出力されます。

```python
# Python
a = b = ["Ruby\n"]
a += ["Python"]
print(b[-1])
```

```ruby
# Ruby
a = b = ["Ruby\n"]
a += ["Python"]
print(b[-1])
```

Pythonの `print` はデフォルトで改行される（デフォルトキーワード引数 `end='\n'` ）ことに合わせるため、`"Ruby"` には `"\n"` をつけています。
