import assert from 'node:assert/strict';
import test from 'node:test';
import { applyPanelTemplate, PANEL_TEMPLATES } from '../src/lib/panelTemplates.ts';

const rect = (x, y, w, h) => ({ type: 'rect', x, y, w, h });

function pageWith(panels) {
  return { page: 1, canvas: { w: 210, h: 297, unit: 'mm' }, panels };
}

function panel(id, shape, overrides = {}) {
  return { id, shape, bg: 1, bubbles: [], action: null, ...overrides };
}

test('プロンプト§DのパターンA〜Qを選択肢として持つ', () => {
  assert.equal(PANEL_TEMPLATES.map((template) => template.id).join(''), 'ABCDEFGHIJKLMNOPQ');
  assert.deepEqual(PANEL_TEMPLATES.map((template) => template.shapes.length), [3, 6, 1, 4, 5, 4, 4, 6, 4, 5, 5, 3, 1, 4, 3, 4, 4]);
  assert.deepEqual(PANEL_TEMPLATES.find((template) => template.id === 'B').shapes[1], {
    type: 'polygon', points: [[200, 95], [200, 170], [105, 170], [115, 95]],
  });
  assert.deepEqual(PANEL_TEMPLATES.find((template) => template.id === 'M').shapes[0], rect(0, 10, 210, 287));
});

test('タチキリ系テンプレートN〜Qは紙端(x=0/x=210/y=297)に達し、上端はy=10を守る', () => {
  for (const id of ['N', 'O', 'P', 'Q']) {
    const template = PANEL_TEMPLATES.find((t) => t.id === id);
    const bleeds = template.shapes.filter((s) => s.x === 0 || s.x + s.w === 210 || s.y + s.h === 297);
    assert.ok(bleeds.length >= 1 && bleeds.length <= 2, `${id}のタチキリコマは1〜2個`);
    for (const s of template.shapes) {
      assert.ok(s.y >= 10, `${id}の上端はヘッダー帯のためy=10まで`);
    }
  }
});

test('既存の人物とフキダシを新しいコマの絶対mm座標へ変換する', () => {
  const page = pageWith([
    panel(1, rect(10, 10, 100, 100), {
      figures: [{ name: '人物', bbox: { x: 20, y: 30, w: 20, h: 40 } }],
      bubbles: [{ text: 'セリフ' }],
    }),
  ]);
  const template = { id: 'X', name: 'テスト', usage: '', shapes: [rect(20, 30, 180, 50)] };

  applyPanelTemplate(page, template);

  assert.deepEqual(page.panels[0].shape, rect(20, 30, 180, 50));
  assert.deepEqual(page.panels[0].figures[0].bbox, { x: 38, y: 40, w: 36, h: 20 });
  // bbox未指定でも、適用前に画面へ表示されていたフォールバック位置（縦長40×50目安）から移動して保存する。
  assert.deepEqual(page.panels[0].bubbles[0].bbox, { x: 129.8, y: 32, w: 63, h: 22.5 });
});

test('テンプレートの方が多いときは既存内容を保ち、残りを空コマで追加する', () => {
  const page = pageWith([
    panel(1, rect(10, 10, 190, 100), { bubbles: [{ text: '残す' }] }),
  ]);
  const template = { id: 'X', name: 'テスト', usage: '', shapes: [rect(10, 10, 190, 80), rect(10, 95, 190, 90)] };

  applyPanelTemplate(page, template);

  assert.equal(page.panels.length, 2);
  assert.equal(page.panels[0].bubbles[0].text, '残す');
  assert.deepEqual(page.panels[1], panel(2, rect(10, 95, 190, 90)));
});

test('テンプレートの方が少なくても全コマの内容を統合して保持する', () => {
  const page = pageWith([
    panel(1, rect(10, 10, 190, 80), {
      figures: [{ name: '右の人物', bbox: { x: 30, y: 20, w: 40, h: 50 } }],
      bubbles: [{ text: 'ひとつめ', bbox: { x: 140, y: 20, w: 35, h: 30 } }],
      assets: ['人物素材'], action: '右を見る',
    }),
    panel(2, rect(10, 100, 190, 80), {
      figures: [{ name: '左の人物', bbox: { x: 110, y: 110, w: 40, h: 50 } }],
      bubbles: [{ text: 'ふたつめ', bbox: { x: 30, y: 110, w: 35, h: 30 } }],
      assets: ['背景素材'], action: '左を見る',
    }),
  ]);
  const template = { id: 'X', name: 'テスト', usage: '', shapes: [rect(10, 10, 190, 277)] };

  applyPanelTemplate(page, template);

  assert.equal(page.panels.length, 1);
  assert.deepEqual(page.panels[0].figures.map((figure) => figure.name), ['右の人物', '左の人物']);
  assert.deepEqual(page.panels[0].bubbles.map((bubble) => bubble.text), ['ひとつめ', 'ふたつめ']);
  assert.deepEqual(page.panels[0].assets, ['人物素材', '背景素材']);
  assert.equal(page.panels[0].action, '右を見る\n左を見る');
  for (const item of [...page.panels[0].figures, ...page.panels[0].bubbles]) {
    assert.ok(item.bbox.x >= 10 && item.bbox.y >= 10);
    assert.ok(item.bbox.x + item.bbox.w <= 200 && item.bbox.y + item.bbox.h <= 287);
  }
});
