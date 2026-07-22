import type { BBox, CanvasElementType, Panel } from '../types';

export type ResizeHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se';

export interface InteractionGeometry {
  mode: ResizeHandle;
  startClientX: number;
  startClientY: number;
  startBox: BBox;
  bounds: BBox;
  paperRect: { width: number; height: number };
}

export const MIN_SIZE_MM = 6;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function roundMm(value: number) {
  return Math.round(value * 10) / 10;
}

export function panelBounds(panel: Panel): BBox {
  if (panel.shape.type === 'rect') return panel.shape;
  const xs = panel.shape.points.map(([x]) => x);
  const ys = panel.shape.points.map(([, y]) => y);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

export function fallbackBox(panel: Panel, type: CanvasElementType, index: number): BBox {
  const bounds = panelBounds(panel);
  let width = Math.min(type === 'figure' ? 42 : 40, Math.max(MIN_SIZE_MM, bounds.w * .35));
  const height = Math.min(type === 'figure' ? 55 : 50, Math.max(MIN_SIZE_MM, bounds.h * .45));
  // 縦書きフキダシは縦長bbox（通常サイズの目安 w40×h50）を保つ
  if (type === 'bubble') width = Math.max(MIN_SIZE_MM, Math.min(width, height * .8));
  const inset = 4 + index * 3;
  return {
    x: clamp(bounds.x + (type === 'bubble' ? bounds.w - width - inset : inset), bounds.x, bounds.x + bounds.w - width),
    y: clamp(bounds.y + inset, bounds.y, bounds.y + bounds.h - height),
    w: width,
    h: height,
  };
}

export function resizedBox(interaction: InteractionGeometry, clientX: number, clientY: number, minSize = MIN_SIZE_MM): BBox {
  const { startBox, bounds, paperRect, mode } = interaction;
  const dx = (clientX - interaction.startClientX) * (210 / paperRect.width);
  const dy = (clientY - interaction.startClientY) * (297 / paperRect.height);
  const right = startBox.x + startBox.w;
  const bottom = startBox.y + startBox.h;
  let x = startBox.x, y = startBox.y, w = startBox.w, h = startBox.h;

  if (mode === 'move') {
    x = clamp(startBox.x + dx, bounds.x, bounds.x + bounds.w - startBox.w);
    y = clamp(startBox.y + dy, bounds.y, bounds.y + bounds.h - startBox.h);
  } else {
    if (mode.includes('w')) { x = clamp(startBox.x + dx, bounds.x, right - minSize); w = right - x; }
    if (mode.includes('e')) { w = clamp(startBox.w + dx, minSize, bounds.x + bounds.w - startBox.x); }
    if (mode.includes('n')) { y = clamp(startBox.y + dy, bounds.y, bottom - minSize); h = bottom - y; }
    if (mode.includes('s')) { h = clamp(startBox.h + dy, minSize, bounds.y + bounds.h - startBox.y); }
  }
  return { x: roundMm(x), y: roundMm(y), w: roundMm(w), h: roundMm(h) };
}

export function clampedPanelDelta(bounds: BBox, deltaX: number, deltaY: number): { x: number; y: number } {
  return {
    x: roundMm(clamp(deltaX, -bounds.x, 210 - (bounds.x + bounds.w))),
    y: roundMm(clamp(deltaY, -bounds.y, 297 - (bounds.y + bounds.h))),
  };
}

export function translatePanel(panel: Panel, deltaX: number, deltaY: number): void {
  if (panel.shape.type === 'rect') {
    panel.shape.x = roundMm(panel.shape.x + deltaX);
    panel.shape.y = roundMm(panel.shape.y + deltaY);
  } else {
    panel.shape.points = panel.shape.points.map(([x, y]) => [roundMm(x + deltaX), roundMm(y + deltaY)]);
  }
  panel.figures?.forEach((figure) => {
    if (!figure.bbox) return;
    figure.bbox.x = roundMm(figure.bbox.x + deltaX);
    figure.bbox.y = roundMm(figure.bbox.y + deltaY);
  });
  panel.bubbles.forEach((bubble) => {
    if (!bubble.bbox) return;
    bubble.bbox.x = roundMm(bubble.bbox.x + deltaX);
    bubble.bbox.y = roundMm(bubble.bbox.y + deltaY);
  });
}

export function resizePanelToBounds(panel: Panel, requestedBounds: BBox): void {
  const original = panelBounds(panel);
  const next = {
    x: roundMm(requestedBounds.x),
    y: roundMm(requestedBounds.y),
    w: Math.max(1, roundMm(requestedBounds.w)),
    h: Math.max(1, roundMm(requestedBounds.h)),
  };
  const scaleX = original.w ? next.w / original.w : 1;
  const scaleY = original.h ? next.h / original.h : 1;
  const transformBox = (box: BBox) => {
    box.x = roundMm(next.x + (box.x - original.x) * scaleX);
    box.y = roundMm(next.y + (box.y - original.y) * scaleY);
    box.w = roundMm(box.w * scaleX);
    box.h = roundMm(box.h * scaleY);
  };

  if (panel.shape.type === 'rect') {
    panel.shape = { type: 'rect', ...next };
  } else {
    panel.shape.points = panel.shape.points.map(([x, y]) => [
      roundMm(next.x + (x - original.x) * scaleX),
      roundMm(next.y + (y - original.y) * scaleY),
    ]);
  }
  panel.figures?.forEach((figure) => { if (figure.bbox) transformBox(figure.bbox); });
  panel.bubbles.forEach((bubble) => { if (bubble.bbox) transformBox(bubble.bbox); });
}

export function convertPanelShape(panel: Panel, type: 'rect' | 'polygon'): void {
  if (panel.shape.type === type) return;
  const bounds = panelBounds(panel);
  panel.shape = type === 'rect'
    ? { type: 'rect', ...bounds }
    : { type: 'polygon', points: [
      [bounds.x, bounds.y],
      [bounds.x + bounds.w, bounds.y],
      [bounds.x + bounds.w, bounds.y + bounds.h],
      [bounds.x, bounds.y + bounds.h],
    ] };
}
