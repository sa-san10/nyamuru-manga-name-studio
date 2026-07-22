import assert from 'node:assert/strict';
import test from 'node:test';
import { clampedPanelDelta, convertPanelShape, fallbackBox, panelBounds, resizedBox, resizePanelToBounds, translatePanel } from '../src/lib/canvasGeometry.ts';

const rectPanel = {
  id: 1,
  shape: { type: 'rect', x: 10, y: 10, w: 190, h: 100 },
  bg: 1,
  bubbles: [],
  action: null,
};

const baseInteraction = {
  mode: 'move',
  startClientX: 100,
  startClientY: 100,
  startBox: { x: 20, y: 20, w: 40, h: 50 },
  bounds: { x: 10, y: 10, w: 190, h: 100 },
  paperRect: { width: 420, height: 594 },
};

test('ドラッグの画面座標をキャンバスmmへ変換する', () => {
  assert.deepEqual(resizedBox(baseInteraction, 142, 120), { x: 41, y: 30, w: 40, h: 50 });
});

test('ドラッグした要素をコマ境界内へ収める', () => {
  assert.deepEqual(resizedBox(baseInteraction, 1000, 1000), { x: 160, y: 60, w: 40, h: 50 });
  assert.deepEqual(resizedBox(baseInteraction, -1000, -1000), { x: 10, y: 10, w: 40, h: 50 });
});

test('南東ハンドルで幅と高さを拡大する', () => {
  assert.deepEqual(resizedBox({ ...baseInteraction, mode: 'se' }, 142, 159.4), { x: 20, y: 20, w: 61, h: 79.7 });
});

test('北西ハンドルは最小6mmを保つ', () => {
  assert.deepEqual(resizedBox({ ...baseInteraction, mode: 'nw' }, 1000, 1000), { x: 54, y: 64, w: 6, h: 6 });
});

test('多角形コマの外接矩形を操作境界として求める', () => {
  assert.deepEqual(panelBounds({ ...rectPanel, shape: { type: 'polygon', points: [[20, 30], [190, 25], [180, 140], [10, 130]] } }), { x: 10, y: 25, w: 180, h: 115 });
});

test('bbox未指定の要素にもコマ内の初期操作領域を与える', () => {
  const figure = fallbackBox(rectPanel, 'figure', 0);
  const bubble = fallbackBox(rectPanel, 'bubble', 0);
  assert.ok(figure.x >= 10 && figure.y >= 10 && figure.x + figure.w <= 200 && figure.y + figure.h <= 110);
  assert.ok(bubble.x >= 10 && bubble.y >= 10 && bubble.x + bubble.w <= 200 && bubble.y + bubble.h <= 110);
  assert.ok(bubble.x > figure.x);
});

test('コマ移動量をキャンバス内へ制限する', () => {
  assert.deepEqual(clampedPanelDelta({ x: 10, y: 20, w: 80, h: 100 }, 25.24, 30.26), { x: 25.2, y: 30.3 });
  assert.deepEqual(clampedPanelDelta({ x: 10, y: 20, w: 80, h: 100 }, -50, -50), { x: -10, y: -20 });
  assert.deepEqual(clampedPanelDelta({ x: 150, y: 230, w: 50, h: 60 }, 50, 50), { x: 10, y: 7 });
});

test('コマ移動時に形状・人物・フキダシを一緒に移動する', () => {
  const panel = {
    ...rectPanel,
    shape: { ...rectPanel.shape },
    figures: [{ name: '人物', bbox: { x: 20, y: 30, w: 40, h: 50 } }],
    bubbles: [{ text: 'セリフ', bbox: { x: 70, y: 25, w: 30, h: 20 } }],
  };
  translatePanel(panel, 12.25, -4.24);
  assert.deepEqual(panel.shape, { type: 'rect', x: 22.3, y: 5.8, w: 190, h: 100 });
  assert.deepEqual(panel.figures[0].bbox, { x: 32.3, y: 25.8, w: 40, h: 50 });
  assert.deepEqual(panel.bubbles[0].bbox, { x: 82.3, y: 20.8, w: 30, h: 20 });
});

test('形状タイプの切り替えで左上位置と大きさを維持する', () => {
  const panel = {
    ...rectPanel,
    shape: { type: 'polygon', points: [[15, 25], [190, 20], [200, 115], [10, 120]] },
    figures: [{ name: '人物', bbox: { x: 30, y: 40, w: 50, h: 60 } }],
  };
  const before = structuredClone(panel.figures[0].bbox);
  convertPanelShape(panel, 'rect');
  assert.deepEqual(panel.shape, { type: 'rect', x: 10, y: 20, w: 190, h: 100 });
  assert.deepEqual(panel.figures[0].bbox, before);
  convertPanelShape(panel, 'polygon');
  assert.deepEqual(panel.shape.points, [[10, 20], [200, 20], [200, 120], [10, 120]]);
  assert.deepEqual(panel.figures[0].bbox, before);
});

test('コマ拡大縮小時に人物・フキダシも相対的に追従する', () => {
  const panel = {
    ...rectPanel,
    shape: { type: 'rect', x: 10, y: 10, w: 100, h: 100 },
    figures: [{ name: '人物', bbox: { x: 20, y: 20, w: 20, h: 40 } }],
    bubbles: [{ text: 'セリフ', bbox: { x: 70, y: 30, w: 20, h: 20 } }],
  };
  resizePanelToBounds(panel, { x: 20, y: 30, w: 180, h: 50 });
  assert.deepEqual(panel.shape, { type: 'rect', x: 20, y: 30, w: 180, h: 50 });
  assert.deepEqual(panel.figures[0].bbox, { x: 38, y: 35, w: 36, h: 20 });
  assert.deepEqual(panel.bubbles[0].bbox, { x: 128, y: 40, w: 36, h: 10 });
});

test('多角形コマの拡大縮小で各頂点を外接矩形へ合わせる', () => {
  const panel = { ...rectPanel, shape: { type: 'polygon', points: [[10, 10], [100, 20], [110, 110], [20, 100]] } };
  resizePanelToBounds(panel, { x: 20, y: 30, w: 180, h: 160 });
  assert.deepEqual(panel.shape.points, [[20, 30], [182, 46], [200, 190], [38, 174]]);
});
