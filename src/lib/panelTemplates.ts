import type { MangaPage, Panel, PanelShape } from '../types';
import { fallbackBox, panelBounds, resizePanelToBounds } from './canvasGeometry.ts';

export interface PanelTemplate {
  id: string;
  name: string;
  usage: string;
  shapes: PanelShape[];
}

const rect = (x: number, y: number, w: number, h: number): PanelShape => ({ type: 'rect', x, y, w, h });
const polygon = (points: [number, number][]): PanelShape => ({ type: 'polygon', points });

/** NDM v10で定義したコマ割りパターンA〜M。 */
export const PANEL_TEMPLATES: PanelTemplate[] = [
  {
    id: 'A', name: '3コマ縦積み', usage: '落ち着いた会話・ナレーション',
    shapes: [rect(10, 10, 190, 85), rect(10, 100, 190, 85), rect(10, 190, 190, 95)],
  },
  {
    id: 'B', name: '少年誌ベーシック6コマ', usage: '標準的な展開',
    shapes: [
      rect(10, 10, 190, 80),
      polygon([[200, 95], [200, 170], [105, 170], [115, 95]]),
      polygon([[115, 95], [105, 170], [10, 170], [10, 95]]),
      rect(10, 175, 190, 40), rect(85, 220, 115, 67), rect(10, 220, 70, 67),
    ],
  },
  {
    id: 'C', name: 'スプラッシュ', usage: '最大の見せ場',
    shapes: [rect(10, 10, 190, 277)],
  },
  {
    id: 'D', name: '4コマ等分', usage: 'テンポの良い掛け合い',
    shapes: [rect(10, 10, 190, 65), rect(10, 80, 190, 65), rect(10, 150, 190, 65), rect(10, 220, 190, 67)],
  },
  {
    id: 'E', name: '対角アクション', usage: '動き・驚き・事件発生',
    shapes: [
      polygon([[10, 10], [200, 10], [200, 65], [10, 90]]),
      polygon([[200, 70], [200, 150], [112, 150], [122, 95]]),
      polygon([[117, 95], [107, 150], [10, 150], [10, 95]]),
      polygon([[200, 155], [200, 287], [82, 287], [100, 155]]),
      polygon([[95, 155], [77, 287], [10, 287], [10, 155]]),
    ],
  },
  {
    id: 'F', name: 'ため→ドン', usage: '感動・告白・再会',
    shapes: [rect(110, 10, 90, 55), rect(10, 10, 95, 55), rect(10, 70, 190, 40), rect(10, 115, 190, 172)],
  },
  {
    id: 'G', name: '図解ワイド', usage: '解説・説明シーン',
    shapes: [rect(10, 10, 190, 60), rect(75, 75, 125, 120), rect(10, 75, 60, 120), rect(10, 200, 190, 87)],
  },
  {
    id: 'H', name: '会話ラリー6コマ', usage: '掛け合い・畳みかけ→オチ',
    shapes: [rect(110, 10, 90, 62), rect(10, 10, 95, 62), rect(122, 78, 78, 62), rect(10, 78, 107, 62), rect(10, 146, 190, 64), rect(10, 216, 190, 71)],
  },
  {
    id: 'I', name: '縦長見得切り', usage: '登場・変身・決めポーズ',
    shapes: [rect(90, 10, 110, 277), rect(10, 10, 75, 88), rect(10, 103, 75, 88), rect(10, 196, 75, 91)],
  },
  {
    id: 'J', name: 'じわヒキ3段', usage: '日常→不穏・ページ末のヒキ',
    shapes: [rect(10, 10, 190, 80), rect(104, 96, 96, 88), rect(10, 96, 89, 88), rect(86, 190, 114, 97), rect(10, 190, 71, 97)],
  },
  {
    id: 'K', name: '縦3列モンタージュ', usage: '時間経過・同時進行',
    shapes: [rect(10, 10, 190, 58), rect(140, 74, 60, 132), rect(75, 74, 60, 132), rect(10, 74, 60, 132), rect(10, 212, 190, 75)],
  },
  {
    id: 'L', name: 'メクリ受けドン', usage: '前ページのヒキを解放',
    shapes: [rect(10, 10, 190, 182), rect(104, 198, 96, 89), rect(10, 198, 89, 89)],
  },
  {
    id: 'M', name: 'タチキリ・スプラッシュ', usage: '紙端まで使う最大の見せ場',
    shapes: [rect(0, 10, 210, 287)],
  },
  {
    id: 'N', name: 'タチキリ見得切り', usage: '登場・変身を右下断ち切りで抜く',
    shapes: [rect(90, 10, 120, 287), rect(10, 10, 75, 88), rect(10, 103, 75, 88), rect(10, 196, 75, 91)],
  },
  {
    id: 'O', name: 'タチキリ受けドン', usage: 'メクリ受けを左右断ち切りで最大化',
    shapes: [rect(0, 10, 210, 182), rect(104, 198, 96, 89), rect(10, 198, 89, 89)],
  },
  {
    id: 'P', name: 'タチキリ・ヒキ3段', usage: 'ページ末のヒキを断ち切りで強調',
    shapes: [rect(10, 10, 190, 80), rect(104, 96, 96, 88), rect(10, 96, 89, 88), rect(0, 190, 210, 107)],
  },
  {
    id: 'Q', name: 'タチキリ登場ワイド', usage: '冒頭の登場を横断ち切りで見せる',
    shapes: [rect(0, 10, 210, 120), rect(10, 135, 190, 70), rect(108, 210, 92, 77), rect(10, 210, 93, 77)],
  },
];

export function findPanelTemplate(id: string): PanelTemplate | undefined {
  return PANEL_TEMPLATES.find((template) => template.id === id);
}

function emptyPanel(id: number, shape: PanelShape): Panel {
  return { id, shape: structuredClone(shape), bg: 1, bubbles: [], action: null };
}

function materializeElementBoxes(panel: Panel): void {
  panel.figures?.forEach((figure, index) => {
    figure.bbox ??= fallbackBox(panel, 'figure', index);
  });
  panel.bubbles.forEach((bubble, index) => {
    bubble.bbox ??= fallbackBox(panel, 'bubble', index);
  });
}

function movePanelContent(panel: Panel, shape: PanelShape): Panel {
  const moved = structuredClone(panel);
  materializeElementBoxes(moved);
  resizePanelToBounds(moved, panelBounds({ ...moved, shape }));
  moved.shape = structuredClone(shape);
  return moved;
}

function mergeUnique(left: string[] | undefined, right: string[] | undefined): string[] | undefined {
  const merged = [...new Set([...(left ?? []), ...(right ?? [])])];
  return merged.length ? merged : undefined;
}

function mergeAction(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right || left === right) return left;
  return `${left}\n${right}`;
}

/**
 * 現在のコマと中身を読み順でテンプレートへ再配置する。
 * bbox は旧コマ内の比率を新コマの外接矩形へ写し、A4上の絶対mm座標として保存する。
 * コマ数を減らす場合も内容は破棄せず、同じ割当先になったコマへ統合する。
 */
export function applyPanelTemplate(page: MangaPage, template: PanelTemplate): void {
  const sources = structuredClone(page.panels);
  const targetCount = template.shapes.length;
  const groups: Panel[][] = Array.from({ length: targetCount }, () => []);

  sources.forEach((panel, sourceIndex) => {
    const targetIndex = sources.length <= targetCount
      ? sourceIndex
      : Math.min(targetCount - 1, Math.floor(sourceIndex * targetCount / sources.length));
    groups[targetIndex].push(panel);
  });

  page.canvas = { w: 210, h: 297, unit: 'mm' };
  page.panels = template.shapes.map((shape, targetIndex) => {
    const group = groups[targetIndex];
    if (!group.length) return emptyPanel(targetIndex + 1, shape);

    const merged = movePanelContent(group[0], shape);
    for (const source of group.slice(1)) {
      const moved = movePanelContent(source, shape);
      merged.figures = [...(merged.figures ?? []), ...(moved.figures ?? [])];
      merged.bubbles = [...merged.bubbles, ...moved.bubbles];
      merged.assets = mergeUnique(merged.assets, moved.assets);
      merged.action = mergeAction(merged.action, moved.action);
    }
    merged.id = targetIndex + 1;
    merged.shape = structuredClone(shape);
    return merged;
  });
}
