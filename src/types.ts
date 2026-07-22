export type Anchor = 'right' | 'left' | 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type FigureSize = 'full' | 'waist-up' | 'bust-up' | 'face';
export type BubbleShape = 'normal' | 'thought' | 'square' | 'caption' | 'flash' | 'uniflash' | 'wobbly' | 'whisper' | 'handwritten';
export type MaterialType = 'character' | 'background' | 'prop';

export interface BBox { x: number; y: number; w: number; h: number }
export interface RectShape extends BBox { type: 'rect' }
export interface PolygonShape { type: 'polygon'; points: [number, number][] }
export type PanelShape = RectShape | PolygonShape;

export interface Figure {
  name: string;
  bbox?: BBox;
  anchor?: Anchor;
  size?: FigureSize;
}

export interface Bubble {
  text: string;
  speaker?: string;
  shape?: BubbleShape;
  emphasis?: string;
  monologue?: boolean;
  bbox?: BBox;
  anchor?: Anchor;
}

export interface Panel {
  id: number;
  shape: PanelShape;
  bg: 0 | 1 | 2;
  figures?: Figure[];
  assets?: string[];
  bubbles: Bubble[];
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
export type CanvasElementType = 'figure' | 'bubble';
export interface CanvasElementSelection { type: CanvasElementType; index: number }
export type IssueLevel = 'error' | 'warning';
export interface ValidationIssue { level: IssueLevel; path: string; message: string }
export type WorkspaceTab = 'storyboard' | 'meta' | 'setting' | 'characters' | 'materials' | 'schema' | 'nyamurutan' | 'howto' | 'prompt' | 'workflow' | 'yaml';
