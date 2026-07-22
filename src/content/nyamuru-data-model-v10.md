# Nyamuru Data Model（NDM）v10 / Open Manga Name YAML（OMNY）簡易ガイド

**Nyamuru Data Model（NDM）** は、漫画ネームの構造、コマ割り、人物、フキダシ、素材参照を定義するデータモデルです。愛称は **Nyamuru🐱** です。

**Open Manga Name YAML（OMNY）** は、NDMをYAMLとして保存・交換するためのシリアライズ形式です。

## 1. 全体構造

ルートは必ず `manga` です。作品情報、舞台、人物、素材、ページを一つの文書にまとめます。

```yaml
manga:
  schema_name: "Nyamuru Data Model"
  schema_version: 10
  meta: { ... }
  layout_spec: |
    # A4座標系の説明
  setting: { ... }
  characters: [ ... ]
  materials: [ ... ]
  pages:
    - page: 1
      canvas: { w: 210, h: 297, unit: mm }
      panels: [ ... ]
```

| フィールド | 決まり |
|---|---|
| `schema_name` | NDMの正式な識別名 `"Nyamuru Data Model"` 固定。絵文字は含めない |
| `schema_version` | 現在のNDMスキーマバージョンは整数 `10` |
| `meta.author` | 作者名（任意）。指定があれば各ページ下端中央のフッターに小さく描く。空なら描かない |
| `meta.page_count` | `pages` 配列の実数と一致させる |
| `meta.reading_direction` | `"right-to-left"` 固定 |
| `meta.text_orientation` | `"vertical"` 固定 |
| `meta.font` | `"アンチック体"` 固定 |
| `meta.style_notes` | 完全版プロンプト§Bの固定内容を保持する |
| `layout_spec` | 完全版プロンプト§Cの固定内容を保持する |

## 2. ページとコマ

- `canvas` は原則A4縦の **210 × 297mm**。
- `panels` は1ページ最大6コマ。
- 配列順と `id` は右上から左下への読み順にそろえる。
- `shape.type` は `rect` または `polygon`。
- `bg` は `0` / `1` / `2` の必須値。`2` は1ページ2コマまで。

### コマ形状

```yaml
# 四角コマ
shape: { type: rect, x: 10, y: 10, w: 190, h: 80 }

# 多角形・対角線カット
shape:
  type: polygon
  points: [[200, 95], [200, 170], [105, 170], [115, 95]]
```

## 3. A4絶対座標

- 原点は用紙左上の `(0, 0)`。
- xは右方向、yは下方向、単位はmm。
- `figures[].bbox` と `bubbles[].bbox` も、コマ内座標ではなく**用紙全体の絶対座標**。
- `anchor` はコマ内の相対位置を表し、bboxより優先する。
- フキダシは、人物bbox上部1/3の顔ゾーンと交差させない。
- 構図の優先順は `action` ＞ `anchor` ＞ `bbox`。

## 4. 人物配置

```yaml
figures:
  - name: "キャラクター名"
    bbox: { x: 30, y: 22, w: 55, h: 62 }
    anchor: left
    size: waist-up
```

- `name` は `characters[].name` と一致させる。
- `size` は `full` / `waist-up` / `bust-up` / `face`。
- コマ外の声だけなら `figures` へ入れない。

## 5. フキダシ

セリフは必ず `bubbles` 配列へ入れます。`text` は必須です。

```yaml
bubbles:
  - text: "セリフ"
    speaker: "キャラクター名"
    shape: normal
    bbox: { x: 145, y: 20, w: 35, h: 35 }
    anchor: top-right
```

使用できる `shape` は次の9種類です。

| shape | 用途 |
|---|---|
| `normal` | 通常の会話。省略時の既定値 |
| `thought` | 心の声・想像・夢見 |
| `square` | 独白・回想・クールな内語 |
| `caption` | ナレーション・時間・場所説明 |
| `flash` | 叫び・強い驚き |
| `uniflash` | 最大級の絶叫・衝撃 |
| `wobbly` | 弱り声・恐怖・脱力 |
| `whisper` | ひそひそ声 |
| `handwritten` | 効果音・手描き文字 |

- 心の声は `monologue: true` を付け、`text` から括弧「（）」を外す。
- `speaker` 省略時は、同じコマ内の直前の話者を継承する。
- `caption` や `handwritten` など話者がいないものは `speaker` を省略できる。

## 6. 素材参照

`materials` へ人物・背景・小道具を登録し、各コマの `assets` から `key` を参照します。

```yaml
materials:
  - key: "キャラクター素材"
    type: character
    keywords: ["キャラクター名", "立ち絵"]
    note: "見た目の要点"

pages:
  - panels:
      - id: 1
        assets: ["キャラクター素材"]
```

`type` は `character` / `background` / `prop` のいずれかです。`keywords` は素材ファイルを検索するための文字列配列です。

## 7. コマ全体の例

```yaml
- id: 1
  shape: { type: rect, x: 10, y: 10, w: 190, h: 80 }
  bg: 1
  figures:
    - name: "キャラクター名"
      bbox: { x: 30, y: 22, w: 55, h: 62 }
      anchor: left
      size: waist-up
  assets: ["キャラクター素材"]
  bubbles:
    - text: "セリフ"
      speaker: "キャラクター名"
      shape: normal
      bbox: { x: 145, y: 20, w: 35, h: 35 }
      anchor: top-right
  action: "笑顔で振り向く"
```

## 8. コメント付き・2ページ分の空テンプレート

下記は、2ページ分の空のOMNYテンプレートです。そのまま「OMNY編集」へ貼り付け、作品情報やコマを追加して使えます。`#` で始まる行は説明コメントなので、残したままでもOMNYとして読み込めます。

```yaml
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 sa-san10
# Nyamuru Data Model (NDM) v10 serialized as Open Manga Name YAML (OMNY)
# Nickname: Nyamuru🐱

# OMNY文書のルート。作品全体の情報をこの中にまとめる
manga:
  # NDMの正式な識別名。絵文字を含めず、この値から変更しない
  schema_name: "Nyamuru Data Model"

  # 使用するNDMスキーマのバージョン
  schema_version: 10

  # 作品全体の基本情報
  meta:
    # 作品タイトルに置き換える
    title: "作品タイトル"
    # 作者名（任意）。各ページ下端中央のフッターに描かれる。空なら非表示
    author: ""
    # 出力する漫画の形式
    format: "カラー漫画"
    # pagesの実数と一致させる。このテンプレートは2ページ
    page_count: 2
    # 右綴じ漫画の読み方向。固定値
    reading_direction: "right-to-left"
    # セリフの組み方向。固定値
    text_orientation: "vertical"
    # 漫画本文の基本フォント。固定値
    font: "アンチック体"
    # 作品全体に適用する作画・文字・演出ルールを配列で追加する
    style_notes: []

  # A4座標、コマ枠、bboxなど、全ページ共通のレイアウト規則を書く
  # 複数行にする場合は空文字を | に替え、次の行から字下げして記述する
  layout_spec: ""

  # 物語の舞台設定
  setting:
    # 主な場所
    location: ""
    # 時刻や時間帯
    time: ""
    # 天候
    weather: ""
    # 背景に登場する場所・景観・設備など
    background: []
    # 物語で使う小道具
    props: []
    # このネームが始まる時点の状況
    situation: ""

  # 登場人物。例: { name: "人物名", role: "役割や人物像" }
  characters: []

  # 参照素材。各要素はkey、type、keywords、任意のnoteを持つ
  # typeはcharacter / background / propのいずれか
  materials: []

  # 漫画ページの配列。並び順とpage番号を一致させる
  pages:
    # 1ページ目
    - page: 1
      # 用紙サイズ。A4縦の幅・高さ・単位
      canvas: { w: 210, h: 297, unit: mm }
      # コマを右上から左下への読み順で追加する。1ページ最大6コマ
      # 各コマにはid、shape、bg、bubbles、actionなどを設定する
      panels: []

    # 2ページ目
    - page: 2
      # 全ページで同じA4絶対座標系を使う
      canvas: { w: 210, h: 297, unit: mm }
      # まだコマも内容も配置されていない空ページ
      panels: []
```
