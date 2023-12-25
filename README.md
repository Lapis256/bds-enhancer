# bds-enhancer

[English](./README.md) / [日本語](./README_ja.md)

This is an external software for enabling server transfers between players in BDS.

## How to run

1. Download the latest `bds_enhancer.exe` from [Releases](https://github.com/Lapis256/bds-enhancer/releases).
2. Place `bds_enhancer.exe` in the same directory as `bedrock_server.exe`.
3. Launch `bds_enhancer.exe`.

## How to use

To use the features of this software, you need to use the ScriptAPI. Please prepare to use it on your own.

We provide a dedicated library for using the features, `bds_enhancer.js`.
Please download and use it from [Releases](https://github.com/Lapis256/bds-enhancer/releases).

[Library Documentation](./lib/doc.md)

## Development

How to run for debugging

```
cargo run -- <BDSのディレクトリ>
```

How to create a release build

```
cargo build --release
```
