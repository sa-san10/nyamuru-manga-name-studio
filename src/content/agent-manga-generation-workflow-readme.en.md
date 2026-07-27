# Agent Manga Generation Workflow

> SPDX-License-Identifier: MIT
>
> Copyright © 2026 sa-san10
>
> This document is provided under the MIT License described in the `LICENSE` file at the repository root.

This is a workflow that lets an AI agent take a manga *name* (storyboard) in Open Manga Name YAML (OMNY) format and reference images, and carry manga production all the way from image generation through inspection and delivery.

It defines the steps for parsing the OMNY, preparing the required assets, generating images page by page, regenerating failed pages, naming files, writing an inspection report, and giving a final report.

This workflow assumes ChatGPTWork.

## What you need

- `agent-manga-generation-workflow.md`: the workflow document the agent refers to
- A manga storyboard file in OMNY format
- Reference images for characters, backgrounds, props, and so on
- An AI agent environment capable of image generation and file operations

Give reference images file names that identify the character or background they correspond to. If needed, placing short setting notes in the same working folder improves reference accuracy.

## How to use

1. Place the workflow document somewhere the AI agent can read it.
2. Add the "Example project instructions" below to the agent's project instructions.
3. Provide the OMNY file and the required reference images.
4. Ask the agent to generate the manga.

## Example project instructions

```text
# This project produces manga

## Steps

1. Read `agent-manga-generation-workflow.md` and understand it.
2. Load the OMNY-format manga storyboard provided by the user.
3. Search for the required character art and background assets, and copy only what you will use into the working area. Do not rename files — renaming makes assets unidentifiable.
4. Once preparation is complete, start manga generation following the workflow and the OMNY.
5. Even for revisions and re-runs, do not change the panel layout unless the user explicitly asks.
6. Include the user's original OMNY, unmodified, as a file in the deliverables.
7. Follow the workflow through inspection, reporting, and delivery.
```

## Input and deliverables

| Type | Content |
|---|---|
| Input | A manga storyboard in OMNY format, reference images, and any additional instructions |
| Deliverables | Generated images per page, the original OMNY, an inspection report, and a summary of the work |

For the concrete generation rules, regeneration conditions, naming conventions, and inspection checklist, see the workflow document itself.

## License

MIT License

Copyright © 2026 [sa-san10](https://github.com/sa-san10)
