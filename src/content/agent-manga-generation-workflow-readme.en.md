# Agent Manga Generation Workflow

> SPDX-License-Identifier: MIT
>
> Copyright © 2026 sa-san10
>
> This document is provided under the MIT License described in the `LICENSE` file at the repository root.

This is a workflow that lets an AI agent take a manga *name* (storyboard) in Open Manga Name YAML (OMNY) format and reference images, and carry manga production all the way from image generation through inspection and delivery.

It defines the steps for parsing the OMAY and OMNY, preparing the required assets, generating images page by page, regenerating failed pages, naming files, writing an inspection report, and giving a final report.

The drawing & staging rules and the layout specification are set once on the project-instructions side as the artwork instruction file **Open Manga Artwork YAML (OMAY)**. Per work, only the OMNY file is handed over.

This workflow assumes ChatGPTWork.

## What you need

- `agent-manga-generation-workflow.md`: the workflow document the agent refers to
- `standard.omay.yaml`: the artwork instruction file (OMAY) — drawing & staging rules plus the layout spec (available from the studio's "生成プロンプト" (generation prompt) tab, or exported from the "作品情報" (work info) tab)
- A manga storyboard file in OMNY format
- Reference images for characters, backgrounds, props, and so on
- An AI agent environment capable of image generation and file operations

Give reference images file names that identify the character or background they correspond to. If needed, placing short setting notes in the same working folder improves reference accuracy.

## How to use

1. Place the workflow document and the OMAY (artwork instruction file) somewhere the AI agent can read them.
2. Add the "Example project instructions" below to the agent's project instructions.
3. Provide the OMNY file and the required reference images.
4. Ask the agent to generate the manga.

## Example project instructions

```text
# This project produces manga

## Steps

1. Read `agent-manga-generation-workflow.md` and understand it.
2. Read `standard.omay.yaml` (the OMAY artwork instruction file) and apply it as the drawing & staging rules and layout spec for every work.
3. Load the OMNY-format manga storyboard provided by the user.
4. Search for the required character art and background assets, and copy only what you will use into the working area. Do not rename files — renaming makes assets unidentifiable.
5. Once preparation is complete, start manga generation following the workflow, the OMAY, and the OMNY.
6. Even for revisions and re-runs, do not change the panel layout unless the user explicitly asks.
7. Include the user's original OMNY, unmodified, as a file in the deliverables.
8. Follow the workflow through inspection, reporting, and delivery.
```

## Input and deliverables

| Type | Content |
|---|---|
| Input | The OMAY (artwork instructions, set on the project-instructions side), a manga storyboard in OMNY format, reference images, and any additional instructions |
| Deliverables | Generated images per page, the original OMNY, an inspection report, and a summary of the work |

For the concrete generation rules, regeneration conditions, naming conventions, and inspection checklist, see the workflow document itself.

## License

MIT License

Copyright © 2026 [sa-san10](https://github.com/sa-san10)
