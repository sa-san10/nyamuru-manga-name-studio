# OSS公開情報チェックリスト

この文書は、新規公開リポジトリへ移すときに掲載情報を揃えるためのチェックリストです。

## 確定済み

- 正式なプロジェクト名（アプリ名）: `Nyamuru🐱Manga Name Studio`
- ライセンス: MIT License（SPDX識別子: `MIT`）
- 著作権表示: `Copyright (c) 2026 sa-san10`
- 作者名: sa-san10
- GitHubアカウント: [sa-san10](https://github.com/sa-san10)
- ライセンス対象: sa-san10が制作したNyamuru Data Model（NDM）、Open Manga Name YAML（OMNY）形式、アプリのソースコード、漫画ネーム生成プロンプト、文書、サンプル、オリジナルの画像・アイコン等
- 対象外: 依存ライブラリ等の第三者著作物、利用者が読み込んだ原稿・素材、アプリ利用者が生成した成果物

## 公開前に確定・置換する情報

- [x] 正式なリポジトリ名: `nyamuru-manga-name-studio`（2026-07-22決定）
- [x] 正式なリポジトリURL: `https://github.com/sa-san10/nyamuru-manga-name-studio`（`package.json`・README・ライセンスページ・アプリ内リンクへ反映済み）
- [ ] 公開アプリURL（決定後、`package.json`、README、OGP、PWA manifestへ反映）
- [ ] 初回公開年が2026年から変わる場合の著作権年
- [ ] 公開対象へ含める画像、フォント、サンプル素材を作者自身がMITで許諾できること
- [ ] 第三者由来の素材が加わった場合、その名称・権利者・ライセンス・配布条件を `public/THIRD_PARTY_NOTICES.txt` に追記
- [ ] GitHubのAbout欄へ説明、公開URL、`MIT`トピック等を設定
- [ ] 公開リポジトリの Settings → Pages → Source を「GitHub Actions」にして、スタンドアロン版のPagesデモを有効化（`.github/workflows/deploy-pages.yml`）
- [x] 必要に応じてIssue/脆弱性報告先、行動規範、コントリビューション方針を追加（`SECURITY.md`・`CODE_OF_CONDUCT.md`・`.github/ISSUE_TEMPLATE/`・`.github/PULL_REQUEST_TEMPLATE.md`・`CONTRIBUTING.md`）
- [ ] `docs/` ディレクトリは作業用資料のため、公開リポジトリへは丸ごとコピーしない（アプリが参照する文書・画像は `src/content/`・`src/assets/` に収録済みで、コードから `docs/` への参照は無い）

## リポジトリに残す表示

- ルートの `LICENSE`: MIT全文と著作権表示
- `README.md`: ライセンス、作者、対象範囲、第三者著作物への案内
- `package.json`: `license`、`author`、`repository`、`homepage`、`bugs`
- アプリ画面: フッターの著作権・MIT表示と `/licenses/` のライセンスページ
- `public/THIRD_PARTY_NOTICES.txt`: 配布物に含まれる第三者著作物の表示
- プロンプト等、単独でコピーされやすい主要文書: SPDX識別子、著作権者、ルートライセンスへの案内

MITでは、複製物またはソフトウェアの重要な部分へ著作権表示と許諾表示を含める必要があります。第三者著作物は本プロジェクトのMITへ変更されず、それぞれのライセンスに従います。
