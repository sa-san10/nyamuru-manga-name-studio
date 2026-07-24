import { useEffect, useRef, useState } from 'preact/hooks';
import { Move, UserRound } from 'lucide-preact';
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
  const cleanupRef = useRef<(() => void) | null>(null);
  const [interactionMode, setInteractionMode] = useState<ResizeHandle | 'panel' | 'panel-resize' | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

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
              <Move class="move-indicator" size={11} />
              <UserRound size={12} /><small>{figure.name}</small>
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
              <Move class="move-indicator" size={10} />
              <span class={`vertical-text bubble-text ${textLengthClass}`}>{bubble.text}</span>
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
        <g class="panel-selection-label" transform={`translate(${selectedBounds.x + 1} ${selectedBounds.y < 12 ? selectedBounds.y + 10 : selectedBounds.y - 2})`}>
          <rect x="0" y="-7.5" width="35" height="9" rx="2" />
          <text x="3" y="-1.5">PANEL {String(selectedPanel.id).padStart(2, '0')}</text>
        </g>
        {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => {
          const x = handle.includes('w') ? selectedBounds.x : selectedBounds.x + selectedBounds.w;
          const y = handle.includes('n') ? selectedBounds.y : selectedBounds.y + selectedBounds.h;
          return <rect class={`panel-resize-handle panel-handle-${handle}`} x={x - 2.4} y={y - 2.4} width="4.8" height="4.8" rx=".7" onPointerDown={(event) => startPanelResize(event, handle)} key={handle} />;
        })}
      </svg>}
    </div>
  );
}
