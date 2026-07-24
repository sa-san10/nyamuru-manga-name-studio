import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { UserRound, ZoomIn, ZoomOut } from 'lucide-preact';
import BubbleShapeSvg from './BubbleShapeSvg';
import type { BBox, CanvasElementSelection, MangaPage, Panel } from '../types';
import { clamp, clampedPanelDelta, fallbackBox, panelBounds, resizedBox, roundMm, type InteractionGeometry, type ResizeHandle } from '../lib/canvasGeometry';

interface Props {
  title: string;
  author: string;
  page: MangaPage;
  pageCount: number;
  activePanel: number;
  selectedElement: CanvasElementSelection | null;
  showGuides: boolean;
  onSelectPanel: (index: number) => void;
  onSelectElement: (selection: CanvasElementSelection | null) => void;
  onChangeElementBBox: (selection: CanvasElementSelection, bbox: BBox) => void;
  onMovePanel: (panelIndex: number, deltaX: number, deltaY: number) => void;
  onResizePanel: (panelIndex: number, bounds: BBox) => void;
}

interface Interaction extends InteractionGeometry {
  selection: CanvasElementSelection;
  paperRect: DOMRect;
}

function panelStyle(panel: Panel): Record<string, string | number> {
  if (panel.shape.type === 'rect') {
    return {
      left: `${panel.shape.x / 2.1}%`, top: `${panel.shape.y / 2.97}%`,
      width: `${panel.shape.w / 2.1}%`, height: `${panel.shape.h / 2.97}%`,
    };
  }
  const xs = panel.shape.points.map(([x]) => x);
  const ys = panel.shape.points.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const width = maxX - minX || 1, height = maxY - minY || 1;
  const points = panel.shape.points.map(([x, y]) => `${((x - minX) / width) * 100}% ${((y - minY) / height) * 100}%`).join(',');
  return {
    left: `${minX / 2.1}%`, top: `${minY / 2.97}%`, width: `${width / 2.1}%`, height: `${height / 2.97}%`,
    clipPath: `polygon(${points})`,
  };
}

// フキダシ内テキスト。はみ出す場合は --bubble-fit（縮小率）で自動縮小する。
// 率で持つことでズーム（cqh変化）してもフィットが保たれる
function BubbleText({ text, lengthClass, boxW, boxH }: { text: string; lengthClass: string; boxW: number; boxH: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--bubble-fit', '1');
    for (let i = 0; i < 2; i++) {
      const overflow = Math.max(el.scrollWidth / Math.max(1, el.clientWidth), el.scrollHeight / Math.max(1, el.clientHeight));
      if (overflow <= 1.02) break;
      const current = parseFloat(el.style.getPropertyValue('--bubble-fit')) || 1;
      el.style.setProperty('--bubble-fit', String(Math.max(0.35, current / overflow)));
    }
  }, [text, lengthClass, boxW, boxH]);
  return <span ref={ref} class={`vertical-text bubble-text ${lengthClass}`}>{text}</span>;
}

function bboxStyle(box: BBox, panel: Panel): Record<string, string> {
  const bounds = panelBounds(panel);
  return {
    left: `${((box.x - bounds.x) / bounds.w) * 100}%`,
    top: `${((box.y - bounds.y) / bounds.h) * 100}%`,
    width: `${(box.w / bounds.w) * 100}%`,
    height: `${(box.h / bounds.h) * 100}%`,
  };
}

export default function MangaCanvas({ title, author, page, pageCount, activePanel, selectedElement, showGuides, onSelectPanel, onSelectElement, onChangeElementBBox, onMovePanel, onResizePanel }: Props) {
  const paperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [interactionMode, setInteractionMode] = useState<ResizeHandle | 'panel' | 'panel-resize' | null>(null);
  // ズームは直接DOMの幅を書き換える（ジェスチャ中の再レンダー回避）。stateは%表示のみ
  const [zoomPercent, setZoomPercent] = useState(100);
  const basePaperWidth = useRef(0);
  const isZoomed = useRef(false);

  useEffect(() => () => cleanupRef.current?.(), []);

  // 非ズーム時は紙面をスクロール領域へ収める（従来のCSSフィットの代替。ズーム基準幅もここで決まる）
  const fitPaper = () => {
    const scroll = scrollRef.current, paper = paperRef.current;
    if (!scroll || !paper || isZoomed.current) return;
    const styles = getComputedStyle(scroll);
    const availW = scroll.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const availH = scroll.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    if (availW <= 0 || availH <= 0) return;
    const width = Math.min(availW, (availH * 210) / 297, (760 * 210) / 297);
    paper.style.width = `${width}px`;
    paper.style.height = 'auto';
    basePaperWidth.current = width;
  };

  useEffect(() => {
    fitPaper();
    const scroll = scrollRef.current;
    if (!scroll) return;
    const observer = new ResizeObserver(() => fitPaper());
    observer.observe(scroll);
    return () => observer.disconnect();
  }, []);

  const zoomAt = (factor: number, centerX?: number, centerY?: number) => {
    const scroll = scrollRef.current, paper = paperRef.current;
    if (!scroll || !paper) return;
    const rect = paper.getBoundingClientRect();
    if (!isZoomed.current) basePaperWidth.current = rect.width;
    const base = basePaperWidth.current || rect.width;
    const target = clamp(rect.width * factor, base * 0.4, base * 4);
    const f = target / rect.width;
    const scrollRect = scroll.getBoundingClientRect();
    const midX = centerX ?? scrollRect.left + scrollRect.width / 2;
    const midY = centerY ?? scrollRect.top + scrollRect.height / 2;
    const pointX = scroll.scrollLeft + midX - scrollRect.left - paper.offsetLeft;
    const pointY = scroll.scrollTop + midY - scrollRect.top - paper.offsetTop;
    paper.style.width = `${target}px`;
    paper.style.height = 'auto';
    isZoomed.current = true;
    scroll.scrollLeft = paper.offsetLeft + pointX * f - (midX - scrollRect.left);
    scroll.scrollTop = paper.offsetTop + pointY * f - (midY - scrollRect.top);
    setZoomPercent(Math.round((target / base) * 100));
  };

  const resetZoom = () => {
    isZoomed.current = false;
    setZoomPercent(100);
    fitPaper();
  };

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch: { dist: number; width: number; scrollLeft: number; scrollTop: number; midX: number; midY: number; paperLeft: number; paperTop: number } | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size !== 2) return;
      cleanupRef.current?.();
      const paper = paperRef.current;
      if (!paper) return;
      const rect = paper.getBoundingClientRect();
      if (!isZoomed.current) basePaperWidth.current = rect.width;
      const [a, b] = [...pointers.values()];
      pinch = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        width: rect.width,
        scrollLeft: scroll.scrollLeft,
        scrollTop: scroll.scrollTop,
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
        paperLeft: paper.offsetLeft,
        paperTop: paper.offsetTop,
      };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const paper = paperRef.current;
      if (!pinch || pointers.size < 2 || !paper) return;
      const [a, b] = [...pointers.values()];
      const base = basePaperWidth.current || pinch.width;
      const target = clamp(pinch.width * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist), base * 0.4, base * 4);
      const f = target / pinch.width;
      paper.style.width = `${target}px`;
      paper.style.height = 'auto';
      isZoomed.current = true;
      const scrollRect = scroll.getBoundingClientRect();
      const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
      const pointX = pinch.scrollLeft + pinch.midX - scrollRect.left - pinch.paperLeft;
      const pointY = pinch.scrollTop + pinch.midY - scrollRect.top - pinch.paperTop;
      scroll.scrollLeft = paper.offsetLeft + pointX * f - (midX - scrollRect.left);
      scroll.scrollTop = paper.offsetTop + pointY * f - (midY - scrollRect.top);
    };
    const onPointerEnd = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pinch && pointers.size < 2) {
        pinch = null;
        const paper = paperRef.current;
        if (paper && basePaperWidth.current) setZoomPercent(Math.round((paper.getBoundingClientRect().width / basePaperWidth.current) * 100));
      }
    };
    // 2本指の間はネイティブのパン/ズームを止めて自前のピンチに専念させる
    const onTouchMove = (event: TouchEvent) => { if (event.touches.length >= 2) event.preventDefault(); };
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      zoomAt(Math.exp(-event.deltaY * 0.002), event.clientX, event.clientY);
    };
    scroll.addEventListener('pointerdown', onPointerDown, { capture: true });
    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerEnd, { capture: true });
    window.addEventListener('pointercancel', onPointerEnd, { capture: true });
    scroll.addEventListener('touchmove', onTouchMove, { passive: false });
    scroll.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      scroll.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerup', onPointerEnd, { capture: true });
      window.removeEventListener('pointercancel', onPointerEnd, { capture: true });
      scroll.removeEventListener('touchmove', onTouchMove);
      scroll.removeEventListener('wheel', onWheel);
    };
  }, []);

  const startInteraction = (
    event: PointerEvent,
    panelIndex: number,
    selection: CanvasElementSelection,
    box: BBox,
    mode: ResizeHandle,
  ) => {
    if (panelIndex !== activePanel || !paperRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectElement(selection);
    const interaction: Interaction = {
      selection, mode, startClientX: event.clientX, startClientY: event.clientY,
      startBox: { ...box }, bounds: panelBounds(page.panels[panelIndex]), paperRect: paperRef.current.getBoundingClientRect(),
    };
    setInteractionMode(mode);
    document.body.classList.add('is-canvas-dragging');

    const move = (pointerEvent: PointerEvent) => {
      pointerEvent.preventDefault();
      onChangeElementBBox(selection, resizedBox(interaction, pointerEvent.clientX, pointerEvent.clientY));
    };
    const finish = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      document.body.classList.remove('is-canvas-dragging');
      setInteractionMode(null);
      cleanupRef.current = null;
    };
    cleanupRef.current?.();
    cleanupRef.current = finish;
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  };

  const nudgeElement = (event: KeyboardEvent, panel: Panel, selection: CanvasElementSelection, box: BBox) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    onSelectElement(selection);
    const amount = event.shiftKey ? 5 : 1;
    const bounds = panelBounds(panel);
    let x = box.x, y = box.y;
    if (event.key === 'ArrowLeft') x -= amount;
    if (event.key === 'ArrowRight') x += amount;
    if (event.key === 'ArrowUp') y -= amount;
    if (event.key === 'ArrowDown') y += amount;
    onChangeElementBBox(selection, { ...box, x: roundMm(clamp(x, bounds.x, bounds.x + bounds.w - box.w)), y: roundMm(clamp(y, bounds.y, bounds.y + bounds.h - box.h)) });
  };

  const startPanelMove = (event: PointerEvent) => {
    if (!selectedPanel || !selectedBounds || !paperRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectElement(null);
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const paperRect = paperRef.current.getBoundingClientRect();
    setInteractionMode('panel');
    document.body.classList.add('is-panel-dragging');

    const move = (pointerEvent: PointerEvent) => {
      pointerEvent.preventDefault();
      const rawX = (pointerEvent.clientX - startClientX) * (210 / paperRect.width);
      const rawY = (pointerEvent.clientY - startClientY) * (297 / paperRect.height);
      const delta = clampedPanelDelta(selectedBounds, rawX, rawY);
      onMovePanel(activePanel, delta.x, delta.y);
    };
    const finish = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      document.body.classList.remove('is-panel-dragging');
      setInteractionMode(null);
      cleanupRef.current = null;
    };
    cleanupRef.current?.();
    cleanupRef.current = finish;
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  };

  const startPanelResize = (event: PointerEvent, handle: Exclude<ResizeHandle, 'move'>) => {
    if (!selectedPanel || !selectedBounds || !paperRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectElement(null);
    const paperRect = paperRef.current.getBoundingClientRect();
    const interaction: InteractionGeometry = {
      mode: handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startBox: { ...selectedBounds },
      bounds: { x: 0, y: 0, w: 210, h: 297 },
      paperRect,
    };
    const bodyClass = `is-panel-resizing-${handle}`;
    setInteractionMode('panel-resize');
    document.body.classList.add(bodyClass);

    const move = (pointerEvent: PointerEvent) => {
      pointerEvent.preventDefault();
      onResizePanel(activePanel, resizedBox(interaction, pointerEvent.clientX, pointerEvent.clientY, 20));
    };
    const finish = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      document.body.classList.remove(bodyClass);
      setInteractionMode(null);
      cleanupRef.current = null;
    };
    cleanupRef.current?.();
    cleanupRef.current = finish;
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  };

  const renderHandles = (panelIndex: number, selection: CanvasElementSelection, box: BBox) => (
    <>
      {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => <span
        class={`resize-handle handle-${handle}`}
        onPointerDown={(event) => startInteraction(event, panelIndex, selection, box, handle)}
        aria-hidden="true"
        key={handle}
      />)}
      <span class="element-size-label">{box.w.toFixed(1)} × {box.h.toFixed(1)} mm</span>
    </>
  );

  const selectedPanel = page.panels[activePanel];
  const selectedBounds = selectedPanel ? panelBounds(selectedPanel) : null;

  return (
    <div class="canvas-viewport">
      <div ref={scrollRef} class="canvas-scroll">
        <div ref={paperRef} class={`manga-paper ${showGuides ? 'show-guides' : ''} ${interactionMode ? 'is-interacting' : ''}`} onPointerDown={(event) => { if (event.target === event.currentTarget) onSelectElement(null); }}>
      <div class="paper-header"><span>{title}</span><span>{page.page} / {pageCount}</span></div>
      {author.trim() && <div class="paper-footer"><span>{author}</span></div>}
      <div class="safe-area" aria-hidden="true" />
      {page.panels.map((panel, panelIndex) => (
        <div
          class={`manga-panel panel-bg-${panel.bg} ${activePanel === panelIndex ? 'is-selected' : ''}`}
          style={panelStyle(panel)}
          onClick={(event) => { event.stopPropagation(); onSelectPanel(panelIndex); }}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectPanel(panelIndex); } }}
          key={`${panel.id}-${panelIndex}`}
          role="button"
          tabIndex={0}
          aria-label={`コマ ${panel.id} を編集`}
          title={panel.action ? `コマ ${panel.id}: ${panel.action}` : `コマ ${panel.id}`}
        >
          <span class="panel-number">{panel.id}</span>
          {(panel.figures ?? []).map((figure, figureIndex) => {
            const selection: CanvasElementSelection = { type: 'figure', index: figureIndex };
            const box = figure.bbox ?? fallbackBox(panel, 'figure', figureIndex);
            const isSelected = activePanel === panelIndex && selectedElement?.type === 'figure' && selectedElement.index === figureIndex;
            return <button
              class={`canvas-element figure-guide ${isSelected ? 'is-element-selected' : ''}`}
              style={bboxStyle(box, panel)}
              onPointerDown={(event) => startInteraction(event, panelIndex, selection, box, 'move')}
              onClick={(event) => { event.stopPropagation(); onSelectElement(selection); }}
              onKeyDown={(event) => nudgeElement(event, panel, selection, box)}
              key={`figure-${figureIndex}`}
              title={`${figure.name}（ドラッグで移動）`}
              tabIndex={activePanel === panelIndex ? 0 : -1}
            >
              <UserRound size={12} />
              {/* 名前がボックス幅に収まらないときは縮小（cqw=紙面幅基準、全角想定で1文字≈1em） */}
              <small style={{ fontSize: `min(clamp(9px, 2.4cqh, 21px), ${((box.w / 2.1 / Math.max(1, figure.name.length)) * 0.92).toFixed(2)}cqw)` }}>{figure.name}</small>
              {isSelected && renderHandles(panelIndex, selection, box)}
            </button>;
          })}
          {panel.bubbles.map((bubble, bubbleIndex) => {
            const selection: CanvasElementSelection = { type: 'bubble', index: bubbleIndex };
            const box = bubble.bbox ?? fallbackBox(panel, 'bubble', bubbleIndex);
            const isSelected = activePanel === panelIndex && selectedElement?.type === 'bubble' && selectedElement.index === bubbleIndex;
            const textLengthClass = bubble.text.length > 24 ? 'is-very-long' : bubble.text.length > 14 ? 'is-long' : '';
            return <button
              class={`canvas-element bubble-guide bubble-${bubble.shape ?? 'normal'} ${isSelected ? 'is-element-selected' : ''}`}
              style={bboxStyle(box, panel)}
              onPointerDown={(event) => startInteraction(event, panelIndex, selection, box, 'move')}
              onClick={(event) => { event.stopPropagation(); onSelectElement(selection); }}
              onKeyDown={(event) => nudgeElement(event, panel, selection, box)}
              key={`bubble-${bubbleIndex}`}
              title={`フキダシ ${bubbleIndex + 1}（ドラッグで移動）`}
              tabIndex={activePanel === panelIndex ? 0 : -1}
            >
              <BubbleShapeSvg shape={bubble.shape} />
              <BubbleText text={bubble.text} lengthClass={textLengthClass} boxW={box.w} boxH={box.h} />
              {isSelected && renderHandles(panelIndex, selection, box)}
            </button>;
          })}
        </div>
      ))}
      <svg class="panel-frame-overlay" viewBox="0 0 210 297" aria-hidden="true">
        {page.panels.map((panel, panelIndex) => panel.shape.type === 'rect'
          ? <rect x={panel.shape.x} y={panel.shape.y} width={panel.shape.w} height={panel.shape.h} key={`frame-${panel.id}-${panelIndex}`} />
          : <polygon points={panel.shape.points.map(([x, y]) => `${x},${y}`).join(' ')} key={`frame-${panel.id}-${panelIndex}`} />)}
      </svg>
      {selectedPanel && selectedBounds && <svg class="panel-selection-overlay" viewBox="0 0 210 297" aria-hidden="true">
        {selectedPanel.shape.type === 'rect' ? <>
          <rect class="panel-selection-shape" x={selectedPanel.shape.x} y={selectedPanel.shape.y} width={selectedPanel.shape.w} height={selectedPanel.shape.h} />
          <rect class="panel-selection-hit-area" x={selectedPanel.shape.x} y={selectedPanel.shape.y} width={selectedPanel.shape.w} height={selectedPanel.shape.h} onPointerDown={startPanelMove} />
        </> : <>
          <polygon class="panel-selection-shape" points={selectedPanel.shape.points.map(([x, y]) => `${x},${y}`).join(' ')} />
          <polygon class="panel-selection-hit-area" points={selectedPanel.shape.points.map(([x, y]) => `${x},${y}`).join(' ')} onPointerDown={startPanelMove} />
        </>}
        <g class="panel-selection-label" transform={`translate(${selectedBounds.x + 1} ${Math.max(8, selectedBounds.y - 2)})`} onPointerDown={startPanelMove}>
          <rect x="0" y="-7.5" width="35" height="9" rx="2" />
          <text x="3" y="-1.5">PANEL {String(selectedPanel.id).padStart(2, '0')}</text>
        </g>
        {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => {
          const x = handle.includes('w') ? selectedBounds.x : selectedBounds.x + selectedBounds.w;
          const y = handle.includes('n') ? selectedBounds.y : selectedBounds.y + selectedBounds.h;
          return <g class={`panel-handle-${handle}`} key={handle}>
            <rect class="panel-resize-handle" x={x - 3} y={y - 3} width="6" height="6" rx=".9" />
            <rect class="panel-resize-hit" x={x - 6.5} y={y - 6.5} width="13" height="13" onPointerDown={(event) => startPanelResize(event, handle)} />
          </g>;
        })}
      </svg>}
      </div>
      </div>
      <div class="canvas-zoom-controls">
        <button type="button" onClick={() => zoomAt(1 / 1.25)} aria-label="縮小" title="縮小（Ctrl+ホイール / 二本指ピンチ）"><ZoomOut size={14} /></button>
        <button type="button" class="zoom-reset" onClick={resetZoom} title="ズームをリセット">{zoomPercent}%</button>
        <button type="button" onClick={() => zoomAt(1.25)} aria-label="拡大" title="拡大（Ctrl+ホイール / 二本指ピンチ）"><ZoomIn size={14} /></button>
      </div>
    </div>
  );
}
