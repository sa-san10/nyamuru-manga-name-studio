import type { BleedEdge, MangaPage, Panel, PanelShape } from '../types';
import { fallbackBox, panelBounds, resizePanelToBounds } from './canvasGeometry.ts';

export interface PanelTemplate {
  id: string;
  name: string;
  usage: string;
  shapes: PanelShape[];
  /** タチキリ（断ち切り）辺の宣言。shapes と同じ添字のコマに bleed を付与する */
  bleeds?: Partial<Record<number, BleedEdge[]>>;
}

const rect = (x: number, y: number, w: number, h: number): PanelShape => ({ type: 'rect', x, y, w, h });
const polygon = (points: [number, number][]): PanelShape => ({ type: 'polygon', points });

/** NDM v10で定義したコマ割りパターンA〜U。 */
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
      polygon([[200, 70], [200, 150], [112, 150], [122, 80]]),
      polygon([[117, 81], [107, 150], [10, 150], [10, 95]]),
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
    bleeds: { 0: ['left', 'right', 'bottom'] },
  },
  {
    id: 'N', name: 'タチキリ見得切り', usage: '登場・変身を右下断ち切りで抜く',
    shapes: [rect(90, 10, 120, 287), rect(10, 10, 75, 88), rect(10, 103, 75, 88), rect(10, 196, 75, 91)],
    bleeds: { 0: ['right', 'bottom'] },
  },
  {
    id: 'O', name: 'タチキリ受けドン', usage: 'メクリ受けを左右断ち切りで最大化',
    shapes: [rect(0, 10, 210, 182), rect(104, 198, 96, 89), rect(10, 198, 89, 89)],
    bleeds: { 0: ['left', 'right'] },
  },
  {
    id: 'P', name: 'タチキリ・ヒキ3段', usage: 'ページ末のヒキを断ち切りで強調',
    shapes: [rect(10, 10, 190, 80), rect(104, 96, 96, 88), rect(10, 96, 89, 88), rect(0, 190, 210, 107)],
    bleeds: { 3: ['left', 'right', 'bottom'] },
  },
  {
    id: 'Q', name: 'タチキリ登場ワイド', usage: '冒頭の登場を横断ち切りで見せる',
    shapes: [rect(0, 10, 210, 120), rect(10, 135, 190, 70), rect(108, 210, 92, 77), rect(10, 210, 93, 77)],
    bleeds: { 0: ['left', 'right'] },
  },
  {
    id: 'R', name: '斜め4段タタミカケ', usage: '追走・焦り・加速する展開',
    shapes: [
      polygon([[10, 10], [200, 10], [200, 70], [10, 85]]),
      polygon([[10, 90], [200, 75], [200, 140], [10, 150]]),
      polygon([[10, 155], [200, 145], [200, 215], [10, 205]]),
      polygon([[10, 210], [200, 220], [200, 287], [10, 287]]),
    ],
  },
  {
    id: 'S', name: '対決ツイン', usage: '対峙・にらみ合い・対決の火花',
    shapes: [
      rect(10, 10, 190, 60),
      polygon([[200, 75], [200, 230], [85, 230], [125, 75]]),
      polygon([[120, 75], [80, 230], [10, 230], [10, 75]]),
      rect(10, 235, 190, 52),
    ],
  },
  {
    id: 'T', name: 'クサビ畳みかけ', usage: 'パニック・混乱・畳みかけ',
    shapes: [
      rect(10, 10, 190, 55),
      polygon([[200, 70], [200, 210], [152, 210], [120, 70]]),
      polygon([[115, 70], [147, 210], [57, 210], [85, 70]]),
      polygon([[80, 70], [52, 210], [10, 210], [10, 70]]),
      rect(10, 215, 190, 72),
    ],
  },
  {
    id: 'U', name: '斜めメクリドン', usage: '衝撃の受け・急展開を勢いで見せる',
    shapes: [
      polygon([[10, 10], [200, 10], [200, 200], [10, 170]]),
      polygon([[200, 205], [200, 287], [103, 287], [113, 192]]),
      polygon([[108, 192], [98, 287], [10, 287], [10, 175]]),
    ],
  },
  // V〜Y は不規則コマ割り——余白とコマの重なりで語る詩的レイアウト。
  // 重なるレイアウトでは配列順（id昇順）で奥→手前に重ねる（1コマ目が一番奥）
  {
    id: 'V', name: '漂流', usage: '不規則・詩的な余白・回想・エピローグ（斜めの小コマ3つ）',
    shapes: [
      polygon([[128.6, 21.8], [192.9, 17.3], [196.9, 74.2], [132.6, 78.7]]),
      polygon([[78, 116.9], [142.4, 120.2], [139.5, 177.1], [75.1, 173.8]]),
      polygon([[18.1, 216.2], [82.5, 212.9], [85.4, 269.8], [21, 273.1]]),
    ],
  },
  {
    id: 'W', name: '音波', usage: '不規則・静かなモンタージュ・音の余韻（高さ違いの縦4本）',
    shapes: [rect(160.5, 34.5, 34.5, 138), rect(112.5, 79.5, 34.5, 168), rect(64.5, 49.5, 34.5, 111), rect(16.5, 105, 34.5, 162)],
  },
  {
    id: 'X', name: '鼓動', usage: '不規則・心の芯と断片（縦大に小コマが重なる・後のコマほど手前）',
    shapes: [rect(76.5, 19.5, 64.5, 258), rect(118.5, 72, 57, 46.5), rect(37.5, 141, 57, 46.5), rect(118.5, 210, 57, 46.5)],
  },
  {
    id: 'Y', name: '呼吸', usage: '不規則・記憶の束・夢うつつ（傾き重ねの4コマ・後のコマほど手前）',
    shapes: [
      polygon([[102, 50.6], [181.2, 57.5], [175.6, 121.8], [96.4, 114.9]]),
      polygon([[52.6, 82.7], [135.8, 71], [145.4, 139.3], [62.2, 151]]),
      polygon([[44.4, 138.3], [123.7, 143.8], [119.2, 208.1], [39.9, 202.6]]),
      polygon([[88.1, 172.6], [171.7, 163.8], [178.9, 232.4], [95.3, 241.2]]),
    ],
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
  panel.screen_text?.forEach((screenText, index) => {
    screenText.bbox ??= fallbackBox(panel, 'screen_text', index);
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
    const bleed = template.bleeds?.[targetIndex];
    if (!group.length) {
      const empty = emptyPanel(targetIndex + 1, shape);
      if (bleed) empty.bleed = [...bleed];
      return empty;
    }

    const merged = movePanelContent(group[0], shape);
    for (const source of group.slice(1)) {
      const moved = movePanelContent(source, shape);
      merged.figures = [...(merged.figures ?? []), ...(moved.figures ?? [])];
      merged.bubbles = [...merged.bubbles, ...moved.bubbles];
      const mergedScreenText = [...(merged.screen_text ?? []), ...(moved.screen_text ?? [])];
      mergedScreenText.length ? merged.screen_text = mergedScreenText : delete merged.screen_text;
      merged.assets = mergeUnique(merged.assets, moved.assets);
      merged.action = mergeAction(merged.action, moved.action);
    }
    if (merged.figures?.length) delete merged.no_figures;
    merged.id = targetIndex + 1;
    merged.shape = structuredClone(shape);
    // タチキリはテンプレート側の宣言で上書きする（移動元の bleed は座標が変わるため引き継がない）
    bleed ? merged.bleed = [...bleed] : delete merged.bleed;
    return merged;
  });
}
