# Nyamuru Data Model (NDM) v10.2 / Open Manga Name YAML (OMNY) Quick Guide

The **Nyamuru Data Model (NDM)** is a data model that defines the structure of a manga *name* (storyboard): panel layout, characters, speech balloons, and asset references. Its nickname is **Nyamuru🐱**.

**Open Manga Name YAML (OMNY)** is the serialization format for saving and exchanging NDM as YAML.

## 1. Overall structure

The root is always `manga`. It gathers work metadata, setting, characters, assets, and pages into a single document.

```yaml
manga:
  schema_name: "Nyamuru Data Model"
  schema_version: 10.2
  meta: { ... }
  layout_spec: |
    # Description of the A4 coordinate system
  setting: { ... }
  characters: [ ... ]
  materials: [ ... ]
  pages:
    - page: 1
      canvas: { w: 210, h: 297, unit: mm }
      panels: [ ... ]
```

| Field | Rule |
|---|---|
| `schema_name` | NDM's formal identifier, fixed to `"Nyamuru Data Model"`. No emoji |
| `schema_version` | The current NDM schema version, `10.2` |
| `meta.author` | Author name (optional). If set, it is drawn small in the footer at the bottom center of each page; if empty, nothing is drawn |
| `meta.page_count` | Must match the actual length of the `pages` array |
| `meta.reading_direction` | Fixed to `"right-to-left"` |
| `meta.text_orientation` | Fixed to `"vertical"` |
| `meta.font` | Fixed to `"アンチック体"` (antique typeface, the standard font for Japanese manga dialogue) |
| `meta.style_notes` | Holds the fixed content of §B of the full prompt |
| `layout_spec` | Holds the fixed content of §C of the full prompt |

## 2. Pages and panels

- `canvas` is A4 portrait as a rule: **210 × 297 mm**.
- `panels` holds at most 6 panels per page.
- Array order and `id` follow reading order, from top right to bottom left.
- `shape.type` is `rect` or `polygon`.
- `bg` is required and is `-1` / `0` / `1` / `2`. At most 2 panels per page may use `2` (`-1` does not count toward this limit).
- `bg: -1` means no background art (a single flat mid-gray fill only, with no contact shadow). Use it only for panels specified in the request; never select it automatically as a staging choice.

### Panel shapes

```yaml
# Rectangular panel
shape: { type: rect, x: 10, y: 10, w: 190, h: 80 }

# Polygon / diagonal cut
shape:
  type: polygon
  points: [[200, 95], [200, 170], [105, 170], [115, 95]]
```

## 3. Absolute A4 coordinates

- The origin `(0, 0)` is the top-left corner of the paper.
- x runs rightward, y runs downward, and the unit is mm.
- `figures[].bbox` and `bubbles[].bbox` are also **absolute coordinates on the whole page**, not panel-local coordinates.
- `anchor` expresses a position relative to the panel and takes precedence over bbox.
- Speech balloons must not intersect the face zone — the top third of a character's bbox.
- Composition precedence is `action` > `anchor` > speaking order = standing position > `size` > `bbox` (a transcription of the precedence table in §C of the generation prompt).

## 4. Character placement

```yaml
figures:
  - name: "Character name"
    bbox: { x: 30, y: 22, w: 55, h: 62 }
    anchor: left
    size: waist-up
```

- `name` must match a `characters[].name`.
- `size` is `full` / `waist-up` / `bust-up` / `face`.
- A voice from outside the panel does not go into `figures`.

## 5. Speech balloons

Dialogue always goes into the `bubbles` array. `text` is required.

```yaml
bubbles:
  - text: "Dialogue"
    speaker: "Character name"
    shape: normal
    bbox: { x: 145, y: 20, w: 35, h: 35 }
    anchor: top-right
```

The following 9 `shape` values are available.

| shape | Use |
|---|---|
| `normal` | Ordinary dialogue. Default when omitted |
| `thought` | Inner voice, imagination, daydreams |
| `square` | Monologue, flashback, cool inner speech |
| `caption` | Narration, time, and place descriptions |
| `flash` | Shouting, strong surprise |
| `uniflash` | Maximum-intensity screams and shocks |
| `wobbly` | Weak voice, fear, exhaustion |
| `whisper` | Whispering |
| `handwritten` | Sound effects, hand-drawn text |

- Inner voices get `monologue: true`, and parentheses "（）" are removed from `text`.
- When `speaker` is omitted, the previous speaker within the same panel is inherited.
- `speaker` can be omitted for speaker-less shapes such as `caption` and `handwritten`.

## 6. Asset references

Register characters, backgrounds, and props in `materials`, then reference their `key` from each panel's `assets`.

```yaml
materials:
  - key: "Character asset"
    type: character
    keywords: ["Character name", "standing art"]
    note: "Key points of the look"

pages:
  - panels:
      - id: 1
        assets: ["Character asset"]
```

`type` is one of `character` / `background` / `prop`. `keywords` is an array of strings used to search for asset files.

## 7. Full panel example

```yaml
- id: 1
  shape: { type: rect, x: 10, y: 10, w: 190, h: 80 }
  bg: 1
  figures:
    - name: "Character name"
      bbox: { x: 30, y: 22, w: 55, h: 62 }
      anchor: left
      size: waist-up
  assets: ["Character asset"]
  bubbles:
    - text: "Dialogue"
      speaker: "Character name"
      shape: normal
      bbox: { x: 145, y: 20, w: 35, h: 35 }
      anchor: top-right
  action: "Turns around with a smile"
```

## 8. Commented empty template for 2 pages

Below is an empty OMNY template for two pages. You can paste it straight into the "OMNY編集" (OMNY editor) tab and add your work metadata and panels. Lines starting with `#` are explanatory comments; the file still loads as OMNY with them left in.

```yaml
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 sa-san10
# Nyamuru Data Model (NDM) v10.2 serialized as Open Manga Name YAML (OMNY)
# Nickname: Nyamuru🐱

# Root of an OMNY document. All information about the work goes inside
manga:
  # NDM's formal identifier. No emoji; never change this value
  schema_name: "Nyamuru Data Model"

  # Version of the NDM schema in use
  schema_version: 10.2

  # Basic information about the whole work
  meta:
    # Replace with the work's title
    title: "Work title"
    # Author name (optional). Drawn in the footer at the bottom center of each page; hidden if empty
    author: ""
    # Output format of the manga
    format: "Color manga"
    # Must match the actual number of pages. This template has 2 pages
    page_count: 2
    # Reading direction for right-bound manga. Fixed value
    reading_direction: "right-to-left"
    # Text direction for dialogue. Fixed value
    text_orientation: "vertical"
    # Base font for manga text. Fixed value (Japanese antique typeface)
    font: "アンチック体"
    # Add art, lettering, and staging rules applied to the whole work as an array
    style_notes: []

  # Layout rules shared by all pages: A4 coordinates, panel borders, bboxes, etc.
  # For multiple lines, replace the empty string with | and indent from the next line
  layout_spec: ""

  # The story's setting
  setting:
    # Main location
    location: ""
    # Time of day or era
    time: ""
    # Weather
    weather: ""
    # Places, scenery, and facilities appearing in backgrounds
    background: []
    # Props used in the story
    props: []
    # The situation at the moment this storyboard begins
    situation: ""

  # Cast. Example: { name: "Character name", role: "Role or persona" }
  characters: []

  # Reference assets. Each entry has key, type, keywords, and an optional note
  # type is one of character / background / prop
  materials: []

  # Array of manga pages. Order must match the page numbers
  pages:
    # Page 1
    - page: 1
      # Paper size: A4 portrait width, height, and unit
      canvas: { w: 210, h: 297, unit: mm }
      # Add panels in reading order from top right to bottom left. At most 6 panels per page
      # Each panel gets id, shape, bg, bubbles, action, and so on
      panels: []

    # Page 2
    - page: 2
      # All pages use the same absolute A4 coordinate system
      canvas: { w: 210, h: 297, unit: mm }
      # An empty page with no panels or content yet
      panels: []
```
