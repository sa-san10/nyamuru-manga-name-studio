# Nyamuru🐱Manga Name Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Nyamuru Data Model（NDM）**は、漫画ネームのためのデータモデルです。正式名称に猫の絵文字は含めず、愛称は **Nyamuru🐱** です。

このPWAでは、NDMをYAMLで表現する **Open Manga Name YAML（OMNY）** 形式の漫画ネームを、紙面プレビューと構造化フォームで閲覧・編集できます。内蔵サンプルを初期データとして読み込み、NDM v10の主要ルールを検査します。

OSS公開用リポジトリは [sa-san10/nyamuru-manga-name-studio](https://github.com/sa-san10/nyamuru-manga-name-studio) です。

## 開発

```bash
npm install
npm run dev
```

## 検証・ビルド

```bash
npm run check
npm run build
```

編集内容はブラウザのローカルストレージへ自動保存されます。OMNY形式（`.yaml`）の読み込み・ダウンロード、オフライン起動にも対応しています。

## スタンドアロン版（単一HTML）

スタンドアロン版は、通常のサイトビルド（`npm run build`）でも `dist/standalone/nyamuru-manga-name-studio.html` として同梱され、公開サイトではこのパスで配信されます（アプリ内「使い方」タブのワンポイントアドバイスにダウンロードボタンがあります）。

GitHub Pages（[sa-san10.github.io/nyamuru-manga-name-studio](https://sa-san10.github.io/nyamuru-manga-name-studio/)）でも、スタンドアロン版をそのままブラウザで試せます（`.github/workflows/deploy-pages.yml` が main への push ごとに自動デプロイ。リポジトリの Settings → Pages で Source を「GitHub Actions」にすると有効化されます）。

単体でビルドする場合は次のコマンドを使います。

```bash
npm run build:standalone
```

`dist-standalone/index.html` に、CSS・JS・アイコンをすべて埋め込んだ**単一HTMLファイル**を出力します。サーバーを立てずに、ファイルのダブルクリック（`file://`）だけで起動できます。USBメモリ等で持ち運ぶ場合はこのファイル1つで動作します。

再配布するときは、同じフォルダに出力される `THIRD_PARTY_NOTICES.txt`（埋め込まれた依存ライブラリの第三者ライセンス表記）を必ず一緒に添付してください。スタンドアロン版のフッターのライセンスリンクは公開サイトの `/licenses/` を指します。

「作品情報」タブで作者名（`meta.author`）を設定すると、各ページ下端中央のフッターに作者名が表示されます（空欄なら非表示）。

## 漫画ネーム生成プロンプト

「生成プロンプト」タブでは、ストーリー原稿をNDM v10へ構造化してOMNY形式で出力する完全版プロンプトを確認できます。Markdown全文のコピーと、`.md`ファイルのダウンロードに対応しています。

## 紙面上の要素操作

1. 紙面上のコマをクリックして選択します。
2. 選択したコマ内の人物またはフキダシをクリックすると、赤い選択枠と四隅のハンドルが表示されます。
3. 要素本体のドラッグで移動、四隅のハンドルのドラッグで拡大・縮小できます。

操作結果は `figures[].bbox` または `bubbles[].bbox` のmm座標へ反映され、右側フォームとも同期します。矢印キーで1mm、Shift＋矢印キーで5mmずつ移動することもできます。

## コマ割りテンプレート

ネーム画面上部の「コマ割り」から、NDM v10のパターンA〜Q（N〜Qはタチキリ系）を選択して適用できます。既存のコマ、人物、フキダシは読み順を保ったまま再配置され、各 `bbox` は新しいコマに合わせたA4キャンバス上の絶対mm座標へ更新されます。テンプレートの方が少ない場合も内容は削除せず、近い読み順のコマへ統合します。

## エージェント漫画生成ワークフロー

「生成ワークフロー」タブでは、OMNYとキャラクター素材から漫画を生成・検品するエージェント向け手順を確認できます。Markdown全文のコピーと、`.md`ファイルのダウンロードに対応しています。

## 作者・ライセンス

Copyright © 2026 [sa-san10](https://github.com/sa-san10)

sa-san10が制作した、このリポジトリ内のアプリのソースコード、漫画ネーム生成プロンプト、文書、サンプル、オリジナルの画像・アイコン等は[MIT License](./LICENSE)で提供します。

依存ライブラリ等の第三者著作物は、それぞれの権利者が定めるライセンスに従います。配布物に含まれる主な第三者ライセンスは[THIRD_PARTY_NOTICES.txt](./public/THIRD_PARTY_NOTICES.txt)を参照してください。利用者が読み込んだ原稿・素材や利用者が生成した成果物へ、本プロジェクトのMIT Licenseが自動的に適用されるものではありません。

OSS公開前に確定・確認する項目は[OSS-PUBLISHING-CHECKLIST.md](./OSS-PUBLISHING-CHECKLIST.md)へまとめています。
