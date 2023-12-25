# bds-enhancer

[English](./README.md) / [日本語](./README_ja.md)

BDS でプレイヤーのサーバー間転送などを可能にするための外部ソフトです。

## 実行方法

1. [Releases](https://github.com/Lapis256/bds-enhancer/releases)より最新の`bds_enhancer.exe`をダウンロードします。
2. `bedrock_server.exe`と同じディレクトリに`bds_enhancer.exe`を配置します。
3. `bds_enhancer.exe`を起動します。

## 使い方

このソフトの機能を使用するには ScriptAPI を使用する必要があります。各自利用できるよう準備してください。

機能を利用するための専用ライブラリとして、`bds_enhancer.js`を用意しています。
[Releases](https://github.com/Lapis256/bds-enhancer/releases)からダウンロードし利用してください。

[ライブラリのドキュメント](./lib/doc_ja.md)

## 開発

デバッグ実行方法

```
cargo run -- <BDSのディレクトリ>
```

リリースビルドの作成

```
cargo build --release
```
