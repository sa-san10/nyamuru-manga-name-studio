import { parse, stringify } from 'yaml';
import type { Manga, MangaDocument, MangaPage, Panel, ValidationIssue } from '../types';

export const STORAGE_KEY = 'manga-name-studio.document.v1';
export const NDM_SCHEMA_NAME = 'Nyamuru Data Model' as const;
export const OMAY_SPEC_NAME = 'Open Manga Artwork YAML' as const;
const LEGACY_OMNY_SCHEMA_NAME = 'Open Manga Name YAML';
export const BUBBLE_SHAPES = ['normal', 'thought', 'square', 'caption', 'flash', 'uniflash', 'wobbly', 'whisper', 'handwritten'] as const;
export const ANCHORS = ['right', 'left', 'center', 'top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;
export const FIGURE_SIZES = ['full', 'waist-up', 'bust-up', 'face', 'hand', 'foot', 'part'] as const;
export const FIGURE_ROLES = ['main', 'sub'] as const;
export const BLEED_EDGES = ['left', 'right', 'bottom'] as const;
export const SCREEN_TEXT_ORIENTATIONS = ['horizontal', 'vertical'] as const;

export function parseMangaYaml(source: string): MangaDocument {
  const value = parse(source) as MangaDocument;
  if (!value || typeof value !== 'object' || !value.manga) throw new Error('ルートに manga がありません');
  return normalizeDocument(value);
}

export function toMangaYaml(document: MangaDocument): string {
  return stringify(document, { indent: 2, lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' });
}

// 画像生成指示分離版：作画・演出ルール（style_notes）とレイアウト仕様（layout_spec）を含まない純粋なネームデータ
export function toSeparatedMangaYaml(document: MangaDocument): string {
  const next = cloneDocument(document);
  delete (next.manga.meta as Partial<Manga['meta']>).style_notes;
  delete (next.manga as Partial<Manga>).layout_spec;
  return toMangaYaml(next);
}

// 画像生成指示ファイル OMAY（Open Manga Artwork YAML）
export interface OmayDocument {
  spec_name: string;
  spec_version?: number | string;
  style_notes: string[];
  layout_spec: string;
}

export function parseOmayYaml(source: string): OmayDocument {
  const value = parse(source) as Partial<OmayDocument> | null;
  if (!value || typeof value !== 'object') throw new Error('OMAYとして解釈できません');
  if (!Array.isArray(value.style_notes) || typeof value.layout_spec !== 'string') {
    throw new Error('style_notes（配列）と layout_spec（複数行テキスト）が必要です');
  }
  return {
    spec_name: typeof value.spec_name === 'string' ? value.spec_name : OMAY_SPEC_NAME,
    spec_version: typeof value.spec_version === 'number' || typeof value.spec_version === 'string' ? value.spec_version : undefined,
    style_notes: value.style_notes.map(String),
    layout_spec: value.layout_spec,
  };
}

export function toOmayYaml(document: MangaDocument): string {
  return stringify({
    spec_name: OMAY_SPEC_NAME,
    spec_version: document.manga.schema_version,
    style_notes: document.manga.meta.style_notes,
    layout_spec: document.manga.layout_spec ?? '',
  }, { indent: 2, lineWidth: 0 });
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
  manga.layout_spec ??= '';
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
  if (manga.schema_version !== 10.3) issues.push({ level: 'warning', path: 'manga.schema_version', message: `NDMスキーマは v10.3 です（現在 v${manga.schema_version ?? '不明'}）` });
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
      if (![-1, 0, 1, 2].includes(panel.bg)) issues.push({ level: 'error', path: `${panelPath}.bg`, message: '-1 / 0 / 1 / 2 のいずれかが必須です' });
      if (!panel.shape || !['rect', 'polygon'].includes(panel.shape.type)) issues.push({ level: 'error', path: `${panelPath}.shape`, message: 'rect または polygon が必要です' });
      if (panel.bleed?.length) {
        if (panel.shape?.type !== 'rect') {
          issues.push({ level: 'error', path: `${panelPath}.bleed`, message: 'bleed（タチキリ）は rect コマにのみ指定できます' });
        } else {
          const { x, y, w, h } = panel.shape;
          panel.bleed.forEach((edge) => {
            if (!BLEED_EDGES.includes(edge)) issues.push({ level: 'error', path: `${panelPath}.bleed`, message: `断ち切れる辺は left / right / bottom です（「${edge}」は不可。上端はヘッダー帯のため断ち切れません）` });
            else if (edge === 'left' && x !== 0) issues.push({ level: 'error', path: `${panelPath}.bleed`, message: 'bleed: left のコマは x: 0（紙の左端）にしてください' });
            else if (edge === 'right' && x + w !== 210) issues.push({ level: 'error', path: `${panelPath}.bleed`, message: 'bleed: right のコマは x + w = 210（紙の右端）にしてください' });
            else if (edge === 'bottom' && y + h !== 297) issues.push({ level: 'error', path: `${panelPath}.bleed`, message: 'bleed: bottom のコマは y + h = 297（紙の下端）にしてください' });
          });
        }
      }
      // figures は人物専用ではない——object: true の figure は物（小道具等）の配置、無ければ人物
      const personCount = (panel.figures ?? []).filter((figure) => !figure.object).length;
      if (panel.no_figures && personCount > 0) issues.push({ level: 'error', path: `${panelPath}.no_figures`, message: '意図的な無人コマ（no_figures: true）に人物の figure は書けません（物の配置は書けます）' });
      const hasSpokenBubble = (panel.bubbles ?? []).some((bubble) => bubble.speaker);
      if (!panel.no_figures && personCount === 0 && !hasSpokenBubble) issues.push({ level: 'warning', path: `${panelPath}.figures`, message: '人物も話者もいないコマです。意図的な無人コマなら no_figures: true を宣言してください' });
      (panel.assets ?? []).forEach((key) => {
        if (!materialKeys.has(key)) issues.push({ level: 'warning', path: `${panelPath}.assets`, message: `素材「${key}」が materials にありません` });
      });
      (panel.figures ?? []).forEach((figure, index) => {
        if (figure.object) {
          if (characterNames.has(figure.name)) issues.push({ level: 'warning', path: `${panelPath}.figures[${index}].object`, message: `物（object: true）の名前「${figure.name}」が characters の人物と一致しています` });
          else if (!materialKeys.has(figure.name)) issues.push({ level: 'warning', path: `${panelPath}.figures[${index}].name`, message: `物「${figure.name}」が materials にありません` });
          if (figure.size || figure.role) issues.push({ level: 'warning', path: `${panelPath}.figures[${index}]`, message: 'size / role は人物向けの語彙です（物の figure には付けません）' });
          return;
        }
        if (!characterNames.has(figure.name)) {
          if (materialKeys.has(figure.name)) issues.push({ level: 'warning', path: `${panelPath}.figures[${index}].object`, message: `「${figure.name}」は materials の物と一致します。物の配置なら object: true を付けてください` });
          else issues.push({ level: 'warning', path: `${panelPath}.figures[${index}].name`, message: `人物「${figure.name}」が characters にありません` });
        }
        if (figure.size && !FIGURE_SIZES.includes(figure.size)) issues.push({ level: 'error', path: `${panelPath}.figures[${index}].size`, message: `size は ${FIGURE_SIZES.join(' / ')} から選んでください` });
        if (figure.role && !FIGURE_ROLES.includes(figure.role)) issues.push({ level: 'error', path: `${panelPath}.figures[${index}].role`, message: 'role は main / sub から選んでください' });
      });
      const figureNames = new Set((panel.figures ?? []).filter((figure) => !figure.object).map((figure) => figure.name));
      (panel.bubbles ?? []).forEach((bubble, bubbleIndex) => {
        const bubblePath = `${panelPath}.bubbles[${bubbleIndex}]`;
        if (!bubble.text?.trim()) issues.push({ level: 'error', path: `${bubblePath}.text`, message: 'フキダシ本文は必須です' });
        if (bubble.shape && !BUBBLE_SHAPES.includes(bubble.shape)) issues.push({ level: 'error', path: `${bubblePath}.shape`, message: '定義済みの9種類から選んでください' });
        if (bubble.speaker && !characterNames.has(bubble.speaker)) issues.push({ level: 'warning', path: `${bubblePath}.speaker`, message: `話者「${bubble.speaker}」が characters にありません` });
        if (bubble.offscreen && !bubble.speaker) issues.push({ level: 'warning', path: `${bubblePath}.offscreen`, message: 'コマ外の声（offscreen）には話者（speaker）を明記してください' });
        if (bubble.offscreen && bubble.speaker && figureNames.has(bubble.speaker)) issues.push({ level: 'warning', path: `${bubblePath}.offscreen`, message: `話者「${bubble.speaker}」が figures にいます。コマ内にいる話者に offscreen は付けません` });
      });
      (panel.screen_text ?? []).forEach((screenText, screenTextIndex) => {
        const screenTextPath = `${panelPath}.screen_text[${screenTextIndex}]`;
        if (!screenText.text?.trim()) issues.push({ level: 'error', path: `${screenTextPath}.text`, message: '画面内文字の本文は必須です' });
        if (screenText.orientation && !SCREEN_TEXT_ORIENTATIONS.includes(screenText.orientation)) issues.push({ level: 'error', path: `${screenTextPath}.orientation`, message: 'orientation は horizontal / vertical から選んでください' });
      });
    });
  });
  return issues;
}

function safeBaseName(title: string): string {
  return title.trim().replace(/[\\/:*?\"<>|]/g, '_') || 'manga-name';
}

// 全部入り版（ルール込み）
export function safeFileName(title: string): string {
  return `${safeBaseName(title)}.yaml`;
}

// 画像生成指示分離版（純粋なネームデータ）
export function omnyFileName(title: string): string {
  return `${safeBaseName(title)}.omny.yaml`;
}

export function omayFileName(title: string): string {
  return `${safeBaseName(title)}.omay.yaml`;
}
