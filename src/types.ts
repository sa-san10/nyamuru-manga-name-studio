export type Anchor = 'right' | 'left' | 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type FigureSize = 'full' | 'waist-up' | 'bust-up' | 'face' | 'hand' | 'foot' | 'part';
export type FigureRole = 'main' | 'sub';
export type BubbleShape = 'normal' | 'thought' | 'square' | 'caption' | 'flash' | 'uniflash' | 'wobbly' | 'whisper' | 'handwritten';
export type MaterialType = 'character' | 'background' | 'prop';
export type BleedEdge = 'left' | 'right' | 'bottom';
export type ScreenTextOrientation = 'horizontal' | 'vertical';

export interface BBox { x: number; y: number; w: number; h: number }
export interface RectShape extends BBox { type: 'rect' }
export interface PolygonShape { type: 'polygon'; points: [number, number][] }
export type PanelShape = RectShape | PolygonShape;

export interface Figure {
  name: string;
  object?: boolean;
  bbox?: BBox;
  anchor?: Anchor;
  size?: FigureSize;
  role?: FigureRole;
}

export interface Bubble {
  text: string;
  speaker?: string;
  shape?: BubbleShape;
  emphasis?: string;
  monologue?: boolean;
  offscreen?: boolean;
  bbox?: BBox;
  anchor?: Anchor;
}

export interface ScreenText {
  text: string;
  bbox?: BBox;
  orientation?: ScreenTextOrientation;
}

export interface Panel {
  id: number;
  shape: PanelShape;
  bg: -1 | 0 | 1 | 2;
  no_figures?: boolean;
  bleed?: BleedEdge[];
  figures?: Figure[];
  assets?: string[];
  bubbles: Bubble[];
  screen_text?: ScreenText[];
  action: string | null;
}

export interface MangaPage {
  page: number;
  canvas: { w: number; h: number; unit: string };
  panels: Panel[];
}

export interface Character { name: string; role: string }
export interface Material { key: string; type: MaterialType; keywords: string[]; note?: string }

export interface Manga {
  schema_name: string;
  schema_version: number;
  meta: {
    title: string;
    author: string;
    format: string;
    page_count: number;
    reading_direction: string;
    text_orientation: string;
    font: string;
    style_notes: string[];
  };
  layout_spec: string;
  setting: {
    location: string;
    time: string;
    weather: string;
    background: string[];
    props: string[];
    situation: string;
  };
  characters: Character[];
  materials: Material[];
  pages: MangaPage[];
}

export interface MangaDocument { manga: Manga }
export type CanvasElementType = 'figure' | 'bubble' | 'screen_text';
export interface CanvasElementSelection { type: CanvasElementType; index: number }
export type IssueLevel = 'error' | 'warning';
export interface ValidationIssue { level: IssueLevel; path: string; message: string }
export type WorkspaceTab = 'storyboard' | 'meta' | 'setting' | 'characters' | 'materials' | 'schema' | 'nyamurutan' | 'howto' | 'prompt' | 'workflow' | 'yaml';
export type DocsLanguage = 'ja' | 'en';
