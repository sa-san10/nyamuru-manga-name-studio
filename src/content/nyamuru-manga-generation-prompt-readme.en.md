# Nyamuru🐱 Manga Name Generation Prompt

> SPDX-License-Identifier: MIT
>
> Copyright © 2026 sa-san10
>
> This document is provided under the MIT License described in the `LICENSE` file at the repository root.

This is an LLM prompt that structures a story manuscript or idea into a manga *name* (ネーム — the Japanese term for a manga storyboard) conforming to the **Nyamuru Data Model (NDM) v10.2**, and outputs it in **Open Manga Name YAML (OMNY)** format.

Give it a script, synopsis, or theme, and it generates a machine-readable storyboard including page structure, panel layout, character placement, speech balloons, backgrounds, and asset references.

The LLM outputs **pure name data (OMNY) only**. The drawing & staging rules and layout spec for image generation are managed separately as the artwork instruction file **Open Manga Artwork YAML (OMAY)** (`standard.omay.yaml`), set once in the image-generation side's project instructions and used alongside the OMNY.

The prompt targets vertical-text, right-bound (right-to-left) manga, and the full prompt itself is written in Japanese.
If you need another manga format or language, many parts of the prompt change together, so we recommend editing it with an LLM.

## What this prompt can do

- Break a manuscript down into pages and panels
- Design panel layouts using absolute A4 coordinates
- Specify the position and size of characters and speech balloons
- Structure dialogue, monologue, sound effects, and staging
- Specify background detail levels and reference assets
- Self-verify the OMNY output against NDM v10.2 rules

## NDM and OMNY

The **Nyamuru Data Model (NDM)** is a data model that defines the structure of a manga storyboard: panel layout, characters, speech balloons, and asset references. Its nickname is **Nyamuru🐱**.

**Open Manga Name YAML (OMNY)** is the serialization format for saving and exchanging NDM as YAML.

**Open Manga Artwork YAML (OMAY)** is the artwork instruction file for drawing OMNY as finished manga: the shared drawing & staging rules (`style_notes`) and the layout specification (`layout_spec`). Its `spec_version` corresponds to the OMNY's `schema_version`.

## What you need

- `nyamuru-manga-generation-prompt-v10.md`: the full prompt to give to the LLM (written in Japanese)
- The script, synopsis, theme, or dialogue you want to turn into manga
- An LLM environment that can handle a long prompt and your manuscript at once

This prompt assumes an LLM at the level of Claude Fable 5 or above.

## How to use

1. Set the full prompt as the LLM's project instructions or system instructions.
2. Provide the manuscript you want to adapt, plus your preferences such as page count and art style.
3. Download the OMNY `.yaml` file the LLM provides, and review its content and validation results.
4. Edit the OMNY as needed and pass it on to a manga production workflow that has the OMAY (artwork instruction file) set up.

## Example request

```text
Convert the following manuscript into a manga storyboard (name) conforming to Nyamuru Data Model v10.2.
Output it in Open Manga Name YAML (OMNY) format.

- **Title**:
- **Author**:
- **Tone / mood**:
- **Art style**:
- **Page count**:

Manuscript:
(Paste your script or synopsis here)
```

(The full prompt itself is written in Japanese, and generated manga pages use Japanese text — but you can write your request and manuscript in either language.)

## Input and output

| Type | Content |
|---|---|
| Input | Script, synopsis, theme, desired page count, art style and staging preferences |
| Output | A manga storyboard in OMNY format conforming to NDM v10.2 — pure name data with no image-generation rules (as a downloadable `.yaml` file), plus validation results |

At image-generation time, combine this OMNY with the artwork instruction file (OMAY).

Always review the generated result. For the detailed schema structure and the meaning of each field, see the Nyamuru Data Model specification.

## License

MIT License

Copyright © 2026 [sa-san10](https://github.com/sa-san10)
