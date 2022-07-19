---
title: "Java 可変長引数メソッドをリフレクションで呼び出す"
categories:
    - blog
tags:
    - Java
---

**Javaのプロジェクトで「privateかつ可変長引数を取るメソッド」の単体テストを書きたくなった際、リフレクションによる呼び出しでハマったことを書きます。**

# 答え

```java
// "aaa", "bbb" -> "aaabbb"
private static String concat(String ... args) {
    return String.join("", args);
}
```

上の`concat`メソッドを他のクラスからリフレクションで呼び出す際は、**目的の引数へ渡すオブジェクトを格納した配列を `Object` にキャストし、`invoke`に渡せばよい**

```java
public static void test_concat() throws Exception {
    Method method = Impl.class.getDeclaredMethod("concat", String[].class);
    method.setAccessible(true);
    assert "aaabbb".equals(method.invoke(null, (Object)new String[]{"aaa", "bbb"}));
}
```

# 実行環境

```
openjdk version "18.0.1.1" 2022-04-22
OpenJDK Runtime Environment (build 18.0.1.1+2-6)
OpenJDK 64-Bit Server VM (build 18.0.1.1+2-6, mixed mode, sharing)
```

# 前提: 通常の引数の場合

privateなメソッドであっても、以下のようにメソッド名と引数の型の情報から `Method` オブジェクトを取得し、呼び出すことができる。

```java
// 実装クラス
private static String concat(String arg0, String arg1) {
    return arg0 + arg1;
}
```

```java
// テストクラス
public static void test_concat() throws Exception {
    Method method = Impl.class.getDeclaredMethod("concat", String.class, String.class);
    method.setAccessible(true);
    assert "aaabbb".equals(method.invoke(null, "aaa", "bbb"));
}
```

## 補足: Class#getDeclaredMethod

[`Class#getDeclaredMethod`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/Class.html#getDeclaredMethod(java.lang.String,java.lang.Class...)) は、 `メソッド名を表す文字列, 第1引数のクラス, 第2引数のクラス, ...` から、合致するメソッドのMethodオブジェクトを取得するメソッド。  
Methodオブジェクトは [`method.invoke(対象インスタンス, 第1引数, 第2引数...)`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/reflect/Method.html#invoke(java.lang.Object,java.lang.Object...)) で呼び出せる。

# 本題: 可変長引数の場合

下のように、可変長引数に変更するとどうなるか。

```java
// 実装クラス
private static String concat(String ... args) { // 可変長引数
    return String.join("", args);
}
```

まず、 `getDeclaredMethod` へ渡すクラス情報について考える。”可変長”を表すClassオブジェクトとは...?

## 可変長引数の正体

[ドキュメント - 可変長引数](https://docs.oracle.com/javase/jp/7/technotes/guides/language/varargs.html) によると、実は可変長引数は配列による受け渡しのショートカットらしい。  
つまり、上のメソッドは”配列1つを引数として取る”と扱うことができる。

```java
// 実装クラス
private static String concat(String[] args) { // 配列引数
    return String.join("", args);
}
```

従って、`getDeclaredMethod` の引数クラスとしては `String[]` を渡せばよい。

```java
// テストクラス
public static void test_concat() throws Exception {
    Method method = Impl.class.getDeclaredMethod("concat", String[].class);
    method.setAccessible(true);
    assert "aaabbb".equals(method.invoke(null, "aaa", "bbb"));
}
```

これでMethodオブジェクトの取得ができるようになったが、今度はそのinvokeでエラーになってしまった。

## 引数の配列？配列が引数？

エラーメッセージは以下。

```java
Exception in thread "main" java.lang.IllegalArgumentException: wrong number of arguments: 2 expected: 1
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.checkArgumentCount(DirectMethodHandleAccessor.java:337)
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:102)
        at java.base/java.lang.reflect.Method.invoke(Method.java:577)
        at com.example.TestImpl.test_concat(TestImpl.java:9)
        at com.example.Main.main(Main.java:5)
```

`wrong number of arguments: 2 expected: 1` 、つまり配列1つを取るメソッドに対し、オブジェクト2つを渡してしまっている。  
`Method#invoke` の内部では、可変長引数→配列 の変換は行ってくれない模様。

そこで、配列オブジェクトを渡すようにしてみた。

```java
// before
method.invoke(null, "aaa", "bbb");
// after
method.invoke(null, new String[]{"aaa", "bbb"});
```

しかし、まだ同じエラーが出た。

```java
Exception in thread "main" java.lang.IllegalArgumentException: wrong number of arguments: 2 expected: 1
```

なぜか。  
`Method#invoke` 自体も可変長引数を取るメソッドであるため、

* `method.invoke(null, "aaa", "bbb")`
* `method.invoke(null, new String[]{"aaa", "bbb"})`

この2つは同等、ということになる。  
**第1引数として"配列1つ"を渡したいのに、呼び出すメソッドが可変長引数を取るため、配列を利用し複数の引数を渡す可変長引数メソッド呼び出しとして扱われてしまう。**

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="671px" height="291px" viewBox="-0.5 -0.5 671 291" style="background-color: rgb(255, 255, 255);"><defs><radialGradient x1="0%" y1="0%" x2="0%" y2="0%" id="mx-gradient-ffffff-1-ffebeb-1-r-0"><stop offset="0%" style="stop-color: rgb(255, 255, 255); stop-opacity: 1;"/><stop offset="100%" style="stop-color: rgb(255, 235, 235); stop-opacity: 1;"/></radialGradient></defs><g><rect x="0" y="0" width="170" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-end; width: 168px; height: 1px; padding-top: 15px; margin-left: 0px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: right;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">method.invoke( null, </div></div></div></foreignObject><text x="168" y="20" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px" text-anchor="end">method.invoke( null...</text></switch></g><rect x="0" y="60" width="170" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-end; width: 168px; height: 1px; padding-top: 75px; margin-left: 0px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: right;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">method.invoke( null, </div></div></div></foreignObject><text x="168" y="80" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px" text-anchor="end">method.invoke( null...</text></switch></g><rect x="10" y="120" width="160" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-end; width: 158px; height: 1px; padding-top: 135px; margin-left: 10px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: right;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">呼び出し：concat( </div></div></div></foreignObject><text x="168" y="140" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px" text-anchor="end">呼び出し：concat( </text></switch></g><rect x="0" y="200" width="220" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 218px; height: 1px; padding-top: 215px; margin-left: 2px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">定義：String concat( args )</div></div></div></foreignObject><text x="2" y="220" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">定義：String concat( args )</text></switch></g><rect x="170" y="0" width="120" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 118px; height: 1px; padding-top: 15px; margin-left: 172px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;"><span style="background-color: rgb(204, 229, 255);">"aaa"</span>, <span style="background-color: rgb(255, 204, 204);">"bbb"</span> )</div></div></div></foreignObject><text x="172" y="20" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">"aaa", "bbb" )</text></switch></g><rect x="170" y="60" width="140" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 138px; height: 1px; padding-top: 75px; margin-left: 172px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">[ <span style="background-color: rgb(204, 229, 255);">"aaa"</span>, <span style="background-color: rgb(255, 204, 204);">"bbb"</span> ] )</div></div></div></foreignObject><text x="172" y="80" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">[ "aaa", "bbb" ]...</text></switch></g><rect x="170" y="120" width="120" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 118px; height: 1px; padding-top: 135px; margin-left: 172px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;"><span style="background-color: rgb(204, 229, 255);">"aaa"</span>, <span style="background-color: rgb(255, 204, 204);">"bbb"</span> )</div></div></div></foreignObject><text x="172" y="140" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">"aaa", "bbb" )</text></switch></g><rect x="260" y="30" width="210" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 208px; height: 1px; padding-top: 45px; margin-left: 262px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 15px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">可変長引数は内部では配列</div></div></div></foreignObject><text x="262" y="50" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="15px">可変長引数は内部では配列</text></switch></g><rect x="260" y="90" width="410" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 408px; height: 1px; padding-top: 105px; margin-left: 262px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 15px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">配列の<span style="background-color: rgb(204, 229, 255);">第1</span>,<span style="background-color: rgb(255, 204, 204);">第2</span>... 要素を、<br style="font-size: 15px;" />呼び出しの<span style="background-color: rgb(204, 229, 255);">第1</span>,<span style="background-color: rgb(255, 204, 204);">第2</span>...引数に</div></div></div></foreignObject><text x="262" y="110" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="15px">配列の第1,第2... 要素を、...</text></switch></g><path d="M 187.98 151.04 L 197.93 151.96 L 194.78 186.04 L 205.23 187.01 L 188.05 204.5 L 174.36 184.15 L 184.82 185.12 Z" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 274.86 264 L 190 264 L 190 220 L 320 220 L 320 264 L 300.86 264 L 261.86 290 Z" fill="#ffffff" stroke="#ff0000" stroke-miterlimit="10" transform="translate(255,0)scale(-1,1)translate(-255,0)rotate(-180,255,255)" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 128px; height: 1px; padding-top: 268px; margin-left: 191px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 15px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;"><font>wrong number of arguments</font></div></div></div></foreignObject><text x="255" y="273" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="15px" text-anchor="middle">wrong number of a...</text></switch></g><path d="M 242.5 208.13 C 232.5 208.13 230 216.25 238 217.88 C 230 221.45 239 229.25 245.5 226 C 250 232.5 265 232.5 270 226 C 280 226 280 219.5 273.75 216.25 C 280 209.75 270 203.25 261.25 206.5 C 255 201.63 245 201.63 242.5 208.13 Z" fill="url(#mx-gradient-ffffff-1-ffebeb-1-r-0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" stroke-dasharray="3 3" pointer-events="all"/><path d="M 244.09 152.05 L 254.02 150.94 L 257.82 185.07 L 268.25 183.91 L 254.94 204.5 L 237.44 187.33 L 247.88 186.17 Z" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 195 28 L 220 40 L 245 28" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 220 40 L 222.28 53.57" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 223.15 58.75 L 218.54 52.43 L 222.28 53.57 L 225.44 51.26 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 202.65 119.05 L 220 110 L 240.22 119.33" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 197.99 121.48 L 202.58 115.14 L 202.65 119.05 L 205.82 121.35 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 244.98 121.53 L 237.16 121.78 L 240.22 119.33 L 240.1 115.42 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 220 110 L 223 87" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a transform="translate(0,-5)" xlink:href="https://www.diagrams.net/doc/faq/svg-export-text-problems" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Text is not SVG - cannot display</text></a></switch></svg>

# 解決策

## 方法1: 明示的に配列渡しする

可変長引数メソッド(`invoke`)の呼び出しに、配列(`new Object[]`)を使う。  
その配列の第一要素として、methodの第一引数とする配列を入れ子にする。

```java
method.invoke(null, new Object[]{ new String[]{"aaa", "bbb"} })
```

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="671px" height="171px" viewBox="-0.5 -0.5 671 171" style="background-color: rgb(255, 255, 255);"><defs/><g><rect x="0" y="0" width="170" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-end; width: 168px; height: 1px; padding-top: 15px; margin-left: 0px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: right;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">method.invoke( null, </div></div></div></foreignObject><text x="168" y="20" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px" text-anchor="end">method.invoke( null...</text></switch></g><rect x="10" y="60" width="160" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-end; width: 158px; height: 1px; padding-top: 75px; margin-left: 10px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: right;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">呼び出し：concat( </div></div></div></foreignObject><text x="168" y="80" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px" text-anchor="end">呼び出し：concat( </text></switch></g><rect x="35" y="140" width="220" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 218px; height: 1px; padding-top: 155px; margin-left: 37px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">定義：String concat( <span style="background-color: rgb(204, 255, 204);">args</span> )</div></div></div></foreignObject><text x="37" y="160" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">定義：String concat( args )</text></switch></g><rect x="170" y="0" width="170" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 168px; height: 1px; padding-top: 15px; margin-left: 172px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">[ <span style="background-color: rgb(204, 255, 204);">[ "aaa", "bbb" ]</span> ] )</div></div></div></foreignObject><text x="172" y="20" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">[ [ "aaa", "bbb" ]...</text></switch></g><rect x="170" y="60" width="180" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 178px; height: 1px; padding-top: 75px; margin-left: 172px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 18px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;"><span style="background-color: rgb(204, 255, 204);">[ "aaa", "bbb" ]</span> )</div></div></div></foreignObject><text x="172" y="80" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="18px">[ "aaa", "bbb" ] )</text></switch></g><rect x="260" y="30" width="410" height="30" fill="none" stroke="none" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 408px; height: 1px; padding-top: 45px; margin-left: 262px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: left;"><div style="display: inline-block; font-size: 15px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">配列の<span style="background-color: rgb(204, 255, 204);">第1</span>,第2... 要素を、<br style="font-size: 15px;" />呼び出しの<span style="background-color: rgb(204, 255, 204);">第1</span>,第2...引数に</div></div></div></foreignObject><text x="262" y="50" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="15px">配列の第1,第2... 要素を、...</text></switch></g><path d="M 221.92 92.03 L 231.91 92.13 L 231.63 121.26 L 242.13 121.36 L 226.44 140.21 L 211.13 121.06 L 221.63 121.16 Z" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 236.64 31.29 L 232.7 53.01" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 231.76 58.18 L 229.57 50.67 L 232.7 53.01 L 236.45 51.92 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a transform="translate(0,-5)" xlink:href="https://www.diagrams.net/doc/faq/svg-export-text-problems" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Text is not SVG - cannot display</text></a></switch></svg>

## 方法2: 配列をObjectにキャストする

配列をそのまま渡すと、可変長引数メソッドの配列渡しとして解釈されてしまう。  
ならば、配列をObjectにキャストし、可変長引数メソッド呼び出しの第一引数としか解釈できないようにしてやればよい。

```java
method.invoke(null, (Object)new String[]{"aaa", "bbb"})
```


# なぜハマったか

実は、最初のやり方をすると、`cast to Object for a varargs call` と親切な警告メッセージが出力される。

```bash
com/example/TestImpl.java:9: warning: non-varargs call of varargs method with inexact argument type for last parameter;
        assert "aaabbb".equals(method.invoke(null, new String[]{"aaa", "bbb"}));
                                                   ^
  cast to Object for a varargs call
  cast to Object[] for a non-varargs call and to suppress this warning
1 warning
Exception in thread "main" java.lang.IllegalArgumentException: wrong number of arguments: 2 expected: 1
```

しかし、使っていた環境（IDE組み込みのJUnit）では、Exception以降のみが表示される仕様になっていたため、手がかりが "IllegalArgumentException: wrong number of arguments" のみとなり、手間取った。

