---
title: "sqldef + MySQL 8 で CHECK ～ IN (1要素) と書いたら ALTER が出続けた"
categories:
    - blog
tags:
    - MySQL
    - sqldef
toc: true
---

sqldef + MySQL 8 の環境にて、schema.sql に `CHECK (priority IN ('normal'))` と書いたところ、2回目以降の実行でも毎回 `DROP CHECK` / `ADD CONSTRAINT` の ALTER が出続けるという現象に遭遇しました。

## 再現

MySQL 8.4.8、mysqldef v3.11.3 で確認しました。

schema.sql:

```sql
CREATE TABLE tasks (
  id BIGINT NOT NULL AUTO_INCREMENT,
  priority VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_tasks_priority
    CHECK (priority IN ('normal'))
);
```

これを `mysqldef` で適用したあと、もう一度同じ schema.sql で実行すると、毎回 ALTER が出続けます。

```sql
ALTER TABLE `tasks` DROP CHECK `chk_tasks_priority`;
ALTER TABLE `tasks` ADD CONSTRAINT `chk_tasks_priority` CHECK (priority in ('normal'));
```

何度実行しても収束せず、CIで「diff なし」を期待していると常に落ちる、という状態になります。

## SHOW CREATE TABLE してみる

差分を出されている DB 側の状態が気になり、 `SHOW CREATE TABLE` で実体を確認してみました。

```sql
CREATE TABLE `tasks` (
  ...
  CONSTRAINT `chk_tasks_priority` CHECK ((`priority` = _utf8mb4'normal'))
)
```

schema.sql に書いた `IN ('normal')` が、 DB 側では `= 'normal'` になっています。

## 原因：MySQL は CHECK 式を正規化して保存する

調べてみると、 MySQL 8 は CHECK 制約の式をパースしたあと、**正規化した形で保存**するようです。1要素の `IN (...)` は等価な `=` に書き換えられます。

sqldef は schema.sql の状態と DB の現状を比較して差分の DDL を生成します。今回のケースでは、

- schema.sql 側: `IN ('normal')`
- DB 側: `= 'normal'`

が一致しないと判定され、毎回 `DROP` → `ADD` の ALTER が生成されます。`ADD` 後に DB 側がまた `=` に正規化されるので、いくら適用しても収束しません。

## 回避策

CHECK 制約を書くときに、要素数で書き分けます。

```sql
-- 1要素なら =
CHECK (priority = 'normal')

-- 2要素以上なら IN
CHECK (priority IN ('normal', 'high'))
```

`= 'normal'` で書けば DB 側の表現と一致し、 `mysqldef` は `Nothing is modified` を返して冪等になります。

2要素以上の `IN (...)` は MySQL も内部表現を `IN` のまま保存するため、こちらも冪等です。

## さいごに

宣言型のスキーマ管理ツールは「目標 = 現状」の同値判定が肝です。その判定は DB エンジン側の式の正規化に左右されるため、 schema.sql に書いた SQL がそのまま DB に保存される保証はありません。

何かおかしいなと思ったら `SHOW CREATE TABLE` で実体を確認する、というのを安全装置として覚えておこうと思いました。
