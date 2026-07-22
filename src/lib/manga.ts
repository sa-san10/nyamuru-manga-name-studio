import { parse, stringify } from 'yaml';
import type { MangaDocument, MangaPage, Panel, ValidationIssue } from '../types';

export const STORAGE_KEY = 'manga-name-studio.document.v1';
export const NDM_SCHEMA_NAME = 'Nyamuru Data Model' as const;
const LEGACY_OMNY_SCHEMA_NAME = 'Open Manga Name YAML';
export const BUBBLE_SHAPES = ['normal', 'thought', 'square', 'caption', 'flash', 'uniflash', 'wobbly', 'whisper', 'handwritten'] as const;
export const ANCHORS = ['right', 'left', 'center', 'top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;
export const FIGURE_SIZES = ['full', 'waist-up', 'bust-up', 'face'] as const;

export function parseMangaYaml(source: string): MangaDocument {
  const value = parse(source) as MangaDocument;
  if (!value || typeof value !== 'object' || !value.manga) throw new Error('ルートに manga がありません');
  return normalizeDocument(value);
}

export function toMangaYaml(document: MangaDocument): string {
  return stringify(document, { indent: 2, lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' });
}

export function cloneDocument(document: MangaDocument): MangaDocument {
  return structuredClone(document);
}

export function newPanel(id: number, offset = 0): Panel {
  return {
    id,
    shape: { type: 'rect', x: 10, y: 10 + offset, w: 190, h: 55 },
    bg: 1,
    bubbles: [{ text: '新しいセリフ', shape: 'normal', anchor: 'top-right' }],
    action: null,
  };
}

export function newPage(pageNumber: number): MangaPage {
  return { page: pageNumber, canvas: { w: 210, h: 297, unit: 'mm' }, panels: [newPanel(1)] };
}

export function normalizeDocument(document: MangaDocument): MangaDocument {
  const next = cloneDocument(document);
  const manga = next.manga;
  if (!manga.schema_name || manga.schema_name === LEGACY_OMNY_SCHEMA_NAME) manga.schema_name = NDM_SCHEMA_NAME;
  manga.pages ??= [];
  manga.characters ??= [];
  manga.materials ??= [];
  manga.meta.author ??= '';
  manga.meta.style_notes ??= [];
  manga.setting.background ??= [];
  manga.setting.props ??= [];
  manga.pages.forEach((page, pageIndex) => {
    page.page ??= pageIndex + 1;
    page.canvas ??= { w: 210, h: 297, unit: 'mm' };
    page.panels ??= [];
    page.panels.forEach((panel, panelIndex) => {
      panel.id ??= panelIndex + 1;
      panel.bubbles ??= [];
      panel.action ??= null;
    });
  });
  return next;
}

export function validateManga(document: MangaDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const manga = document?.manga;
  if (!manga) return [{ level: 'error', path: 'manga', message: 'manga ルートが必要です' }];
  if (manga.schema_name !== NDM_SCHEMA_NAME) issues.push({ level: 'error', path: 'manga.schema_name', message: `固定値「${NDM_SCHEMA_NAME}」にしてください` });
  if (manga.schema_version !== 10) issues.push({ level: 'warning', path: 'manga.schema_version', message: `NDMスキーマは v10 です（現在 v${manga.schema_version ?? '不明'}）` });
  if (!manga.meta?.title?.trim()) issues.push({ level: 'error', path: 'manga.meta.title', message: '作品タイトルは必須です' });
  if (manga.meta?.page_count !== manga.pages?.length) issues.push({ level: 'error', path: 'manga.meta.page_count', message: `pages の実数 ${manga.pages?.length ?? 0} と一致しません` });
  const fixed = [['reading_direction', 'right-to-left'], ['text_orientation', 'vertical'], ['font', 'アンチック体']] as const;
  fixed.forEach(([key, value]) => {
    if (manga.meta?.[key] !== value) issues.push({ level: 'error', path: `manga.meta.${key}`, message: `固定値「${value}」にしてください` });
  });
  const materialKeys = new Set((manga.materials ?? []).map((item) => item.key));
  const characterNames = new Set((manga.characters ?? []).map((item) => item.name));
  (manga.pages ?? []).forEach((page, pageIndex) => {
    const base = `manga.pages[${pageIndex}]`;
    if (page.page !== pageIndex + 1) issues.push({ level: 'warning', path: `${base}.page`, message: `配列順に合わせて ${pageIndex + 1} を推奨します` });
    if (page.canvas?.w !== 210 || page.canvas?.h !== 297 || page.canvas?.unit !== 'mm') issues.push({ level: 'warning', path: `${base}.canvas`, message: 'A4縦 210×297mm が原則です' });
    if ((page.panels?.length ?? 0) > 6) issues.push({ level: 'error', path: `${base}.panels`, message: '1ページは最大6コマです' });
    const bg2 = (page.panels ?? []).filter((panel) => panel.bg === 2).length;
    if (bg2 > 2) issues.push({ level: 'error', path: `${base}.panels`, message: `bg: 2 は1ページ2コマまでです（現在 ${bg2}）` });
    (page.panels ?? []).forEach((panel, panelIndex) => {
      const panelPath = `${base}.panels[${panelIndex}]`;
      if (panel.id !== panelIndex + 1) issues.push({ level: 'warning', path: `${panelPath}.id`, message: `読み順に合わせて ${panelIndex + 1} を推奨します` });
      if (![0, 1, 2].includes(panel.bg)) issues.push({ level: 'error', path: `${panelPath}.bg`, message: '0 / 1 / 2 のいずれかが必須です' });
      if (!panel.shape || !['rect', 'polygon'].includes(panel.shape.type)) issues.push({ level: 'error', path: `${panelPath}.shape`, message: 'rect または polygon が必要です' });
      (panel.assets ?? []).forEach((key) => {
        if (!materialKeys.has(key)) issues.push({ level: 'warning', path: `${panelPath}.assets`, message: `素材「${key}」が materials にありません` });
      });
      (panel.figures ?? []).forEach((figure, index) => {
        if (!characterNames.has(figure.name)) issues.push({ level: 'warning', path: `${panelPath}.figures[${index}].name`, message: `人物「${figure.name}」が characters にありません` });
      });
      (panel.bubbles ?? []).forEach((bubble, bubbleIndex) => {
        const bubblePath = `${panelPath}.bubbles[${bubbleIndex}]`;
        if (!bubble.text?.trim()) issues.push({ level: 'error', path: `${bubblePath}.text`, message: 'フキダシ本文は必須です' });
        if (bubble.shape && !BUBBLE_SHAPES.includes(bubble.shape)) issues.push({ level: 'error', path: `${bubblePath}.shape`, message: '定義済みの9種類から選んでください' });
        if (bubble.speaker && !characterNames.has(bubble.speaker)) issues.push({ level: 'warning', path: `${bubblePath}.speaker`, message: `話者「${bubble.speaker}」が characters にありません` });
      });
    });
  });
  return issues;
}

export function safeFileName(title: string): string {
  return `${title.trim().replace(/[\\/:*?\"<>|]/g, '_') || 'manga-name'}.yaml`;
}
