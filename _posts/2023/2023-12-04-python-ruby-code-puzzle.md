---
title: "PythonでもRubyでも実行できるが異なる出力となるコードを考える"
categories:
    - blog
tags:
    - AtCoder
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

同じコードですが、出力が異なるようにできました。
