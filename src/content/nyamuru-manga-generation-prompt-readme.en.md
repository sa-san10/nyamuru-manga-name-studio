# Nyamuru🐱 Manga Name Generation Prompt

> SPDX-License-Identifier: MIT
>
> Copyright © 2026 sa-san10
>
> This document is provided under the MIT License described in the `LICENSE` file at the repository root.

This is an LLM prompt that structures a story manuscript or idea into a manga *name* (ネーム — the Japanese term for a manga storyboard) conforming to the **Nyamuru Data Model (NDM) v10**, and outputs it in **Open Manga Name YAML (OMNY)** format.

Give it a script, synopsis, or theme, and it generates a machine-readable storyboard including page structure, panel layout, character placement, speech balloons, backgrounds, and asset references.

The prompt targets vertical-text, right-bound (right-to-left) manga, and the full prompt itself is written in Japanese.
If you need another manga format or language, many parts of the prompt change together, so we recommend editing it with an LLM.

## What this prompt can do

- Break a manuscript down into pages and panels
- Design panel layouts using absolute A4 coordinates
- Specify the position and size of characters and speech balloons
- Structure dialogue, monologue, sound effects, and staging
- Specify background detail levels and reference assets
- Self-verify the OMNY output against NDM v10 rules

## NDM and OMNY

The **Nyamuru Data Model (NDM)** is a data model that defines the structure of a manga storyboard: panel layout, characters, speech balloons, and asset references. Its nickname is **Nyamuru🐱**.

**Open Manga Name YAML (OMNY)** is the serialization format for saving and exchanging NDM as YAML.

## What you need

- `nyamuru-manga-generation-prompt-v10.md`: the full prompt to give to the LLM (written in Japanese)
- The script, synopsis, theme, or dialogue you want to turn into manga
- An LLM environment that can handle a long prompt and your manuscript at once

This prompt assumes an LLM at the level of Claude Fable 5 or above.

## How to use

1. Set the full prompt as the LLM's project instructions or system instructions.
2. Provide the manuscript you want to adapt, plus your preferences such as page count and art style.
3. Save the OMNY the LLM outputs, and review its content and validation results.
4. Edit the OMNY as needed and pass it on to your manga production workflow.

## Example request

```text
次の原稿を、Nyamuru Data Model v10に準拠した漫画ネームへ変換してください。
出力はOpen Manga Name YAML（OMNY）形式にしてください。

ページ数：4ページ
形式：カラー漫画
希望する雰囲気：明るい日常コメディ

原稿：
（ここに台本やあらすじを入力）
```

(The example above is in Japanese, matching the prompt: "Convert the following manuscript into a manga storyboard conforming to Nyamuru Data Model v10, output in OMNY format. Pages: 4. Format: color manga. Desired mood: light slice-of-life comedy. Manuscript: …")

## Input and output

| Type | Content |
|---|---|
| Input | Script, synopsis, theme, desired page count, art style and staging preferences |
| Output | A manga storyboard in OMNY format conforming to NDM v10, plus validation results |

Always review the generated result. For the detailed schema structure and the meaning of each field, see the Nyamuru Data Model specification.

## License

MIT License

Copyright © 2026 [sa-san10](https://github.com/sa-san10)
