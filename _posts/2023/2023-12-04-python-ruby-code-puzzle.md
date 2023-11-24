---
title: "PythonとしてもRubyとしても実行できるが出力は異なるコードを考えてみた"
categories:
    - blog
tags:
    - Python
    - Ruby
toc: true
---

PythonとしてもRubyとしても文法的に正しく実行もできるが、出力は異なるというコードを考えてみました。

# きっかけ

実話です。ある日、Rubyが好きな友人に「Python の "Hello, world!" はどう書くの？」と尋ねられた私は、以下のコードを書きました。

```python
print("Hello, world!")
```

これを見て友人は「このコード、Rubyでもそのまま動くよ」と言いました。  
Rubyを全く知らなかった当時の私はすぐにオンラインの実行環境で試し、確かに同じ結果が得られることに驚きました。

あれから数年、私は業務でもRubyを使うようになりました。
そして最近、ふとこの出来事を思い出したとき、こんなことを考えました。

**「PythonとしてもRubyとしても文法的に正しく実行もできるが、出力が異なるコードは作れるだろうか？」**

みなさんも是非考えてみてください。

# 作ってみた

本記事に記載のコードは、以下の言語バージョンで動作確認を行いました。

* Python: 3.12.0
* Ruby: 3.2.2

本記事では、PythonでもRubyでも実行できるコードを "共通コード" と呼ぶことにします。

## Python と Ruby　の記法が共通である要素

まずは、PythonとRubyで記法が共通している要素を考えました。

整数や文字列の記述・代入などは、特殊なことをしない限りは共通コードになります。

```python
# Python and Ruby
a = 1
a += 3
b = "Hello, world!"
```

可変長配列（Pythonの `list` 、Rubyの `Array` ）の作成及び要素へのアクセスも、共通コードにできます。

```python
# Python　and Ruby
a = [1, 2, 3]
a[1] = 5
```

また、関数呼び出しも以下の記法で共通コード化が可能です。

```python
# Python and Ruby
func("sample")
```

## Python と Ruby　で記法が異なる要素

真理値や条件分岐、関数定義などは記法が異なります。
つまり、今回これらの要素は使えません。

```python
# Python
def func(n, m):     # セミコロンをつける
    if n == 1:
        return True # `True` (`true`ではない)
    elif m == 2:    # `elif` (`elsif`ではない)
        return True
    else:
        return False
```

```ruby
# Ruby
def func(n, m)       # セミコロンをつけない
    if n == 1
        return true  # `true` (`True`ではない)
    elsif m == 2     # `elsif` (`elif`ではない)
        return true
    else
        return false
    end              # `end` をつける
end
```

## 共通コードのうち異なる挙動をするものを探す

ここまで挙げた共通コードの中からPythonとRubyで挙動が異なるものを探してみると、1つ見つかりました。  
**list / Array に対する、 `+=` 演算子の挙動です。**

Pythonにおける `list` は、ミュータブルなシーケンス型の1つです。  
通常、ミュータブルなシーケンス `s` とイテラブル `t` があるとき、`s += t` はシーケンス `s` を拡張して `t` の要素を追加する操作、すなわち `s.extend(t)` （Rubyでの `s.concat(t)`）と等価です。
参考: [https://docs.python.org/ja/3.12/library/stdtypes.html#mutable-sequence-types](https://docs.python.org/ja/3.12/library/stdtypes.html#mutable-sequence-types)

一方、Rubyにおける `s += t` は単なる自己代入、すなわち `s = s + t` と等価です。
参考: [https://docs.ruby-lang.org/ja/3.2/doc/spec=2foperator.html#selfassign](https://docs.ruby-lang.org/ja/3.2/doc/spec=2foperator.html#selfassign)
つまり、 `s` と `t` がともに `Array` の場合、`s` には新しく作成された `Array` が代入されます。

この挙動の違いを使えば、共通コード内の変数から言語によって異なるオブジェクトを参照させることができ、結果として言語によって異なる出力を得られます。

```python
# Python
a = [1, 2]
b = a
a += [3, 4]

print(b is a)  # True （bとaは同一オブジェクトを参照）
```

```ruby
# Ruby
a = [1, 2]
b = a
a += [3, 4]

print(b.equal?(a))  # false （bとaは異なるオブジェクトを参照）
```

## 完成したコード

以上をふまえて、完成したコードを以下に示します。
Pythonでは `Python`、Rubyでは `Ruby` と1行出力されます。

```python
# Python and Ruby
a = b = ["Ruby\n"]
a += ["Python"]
print(b[-1])
```
Pythonの `print` はデフォルトキーワード引数 `end='\n'` を持つため、末尾に改行文字が付いた出力となります。
出力形式を揃えるため、Ruby用の出力文字列には `"\n"` をつけています。

実際に `common.pyrb` というファイル名で保存しPythonとRubyで実行すると、以下のようになりました。

```bash
$ python common.pyrb 
Python
$ ruby common.pyrb 
Ruby
```
