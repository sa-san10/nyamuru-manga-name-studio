import { CopyPlus, MessageCircleMore, MonitorSpeaker, Plus, Trash2, UserPlus } from 'lucide-preact';
import { useEffect, useRef } from 'preact/hooks';
import { ANCHORS, BLEED_EDGES, BUBBLE_SHAPES, FIGURE_ROLES, FIGURE_SIZES } from '../lib/manga';
import { convertPanelShape, fallbackBox, resizePanelToBounds } from '../lib/canvasGeometry';
import type { BleedEdge, CanvasElementSelection, Manga, Panel } from '../types';

const BLEED_EDGE_LABELS: Record<BleedEdge, string> = { left: '左辺', right: '右辺', bottom: '下辺' };
const FIGURE_ROLE_LABELS: Record<(typeof FIGURE_ROLES)[number], string> = { main: 'main / 主役', sub: 'sub / 脇役' };
import { BBoxEditor, Field, SectionTitle } from './Fields';
import BubbleShapeSvg from './BubbleShapeSvg';

interface Props {
  manga: Manga;
  panel: Panel | undefined;
  panelIndex: number;
  selectedElement: CanvasElementSelection | null;
  onSelectElement: (selection: CanvasElementSelection | null) => void;
  onChange: (panel: Panel) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function PanelInspector({ manga, panel, panelIndex, selectedElement, onSelectElement, onChange, onAdd, onDuplicate, onDelete }: Props) {
  const inspectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedElement) return;
    inspectorRef.current?.querySelector('.selectable-card.is-selected')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedElement?.type, selectedElement?.index]);
  if (!panel) return <div class="empty-inspector"><div>◫</div><h3>コマを選択してください</h3><p>紙面上のコマをクリックすると、内容を編集できます。</p><button class="primary-button" onClick={onAdd}><Plus size={16} />コマを追加</button></div>;
  const update = (recipe: (draft: Panel) => void) => { const next = structuredClone(panel); recipe(next); onChange(next); };

  return <div ref={inspectorRef} class="panel-inspector">
    <div class="inspector-sticky-head">
      <div><span class="eyebrow">PANEL {String(panelIndex + 1).padStart(2, '0')}{selectedElement ? ` · ${selectedElement.type.toUpperCase()} ${selectedElement.index + 1}` : ''}</span><h2>コマ {panel.id}</h2></div>
      <div class="mini-actions"><button onClick={onDuplicate} title="複製"><CopyPlus size={16} /></button><button onClick={onDelete} title="削除"><Trash2 size={16} /></button></div>
    </div>

    <section class="editor-section">
      <SectionTitle index="01" title="コマ設定" description="形状と背景の密度" />
      <div class="field-grid">
        <Field label="ID"><input type="number" min="1" value={panel.id} onInput={(event) => update((draft) => { draft.id = Number(event.currentTarget.value); })} /></Field>
        <Field label="形状">
          <select value={panel.shape.type} onChange={(event) => update((draft) => {
            convertPanelShape(draft, event.currentTarget.value as 'rect' | 'polygon');
          })}><option value="rect">rect / 四角形</option><option value="polygon">polygon / 多角形</option></select>
        </Field>
      </div>
      {panel.shape.type === 'rect' ? <div class="shape-coordinates">
        <span class="sub-label">座標 <small>mm</small></span>
        <BBoxEditor value={panel.shape} onChange={(box) => update((draft) => { resizePanelToBounds(draft, box); })} />
      </div> : <Field label="頂点座標" hint="x,y を1行ずつ" wide>
        <textarea rows={4} value={panel.shape.points.map((point) => point.join(', ')).join('\n')} onBlur={(event) => {
          const points = event.currentTarget.value.split(/\n/).map((line) => line.split(',').map(Number)).filter((point) => point.length === 2 && point.every(Number.isFinite)) as [number, number][];
          if (points.length >= 3) update((draft) => {
            const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
            resizePanelToBounds(draft, { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) });
            draft.shape = { type: 'polygon', points };
          });
        }} />
      </Field>}
      {panel.shape.type === 'rect' && <div class="bleed-selector">
        <span class="sub-label">タチキリ（断ち切り辺） <small>紙端に接する辺のみ</small></span>
        <div class="bleed-options">{BLEED_EDGES.map((edge) => <label class="check-row" key={edge}>
          <input type="checkbox" checked={(panel.bleed ?? []).includes(edge)} onChange={(event) => update((draft) => {
            const current = new Set(draft.bleed ?? []);
            event.currentTarget.checked ? current.add(edge) : current.delete(edge);
            const next = BLEED_EDGES.filter((item) => current.has(item));
            next.length ? draft.bleed = next : delete draft.bleed;
          })} /><span>{BLEED_EDGE_LABELS[edge]}</span>
        </label>)}</div>
      </div>}
      <div class="bg-selector">
        <span class="sub-label">背景詳細度</span>
        <div>{[-1, 0, 1, 2].map((level) => <button class={`bg-option bg-option-${level} ${panel.bg === level ? 'is-active' : ''}`} onClick={() => update((draft) => { draft.bg = level as -1 | 0 | 1 | 2; })} key={level}><strong>BG {level}</strong><span>{level === -1 ? '背景無描画' : level === 0 ? '感情・効果' : level === 1 ? '簡易背景' : '詳細背景'}</span></button>)}</div>
      </div>
    </section>

    <section class="editor-section">
      <SectionTitle index="02" title="ト書き" description="表情・動作・カメラの指示" />
      <Field label="action" wide><textarea rows={5} value={panel.action ?? ''} placeholder="キャラクターの表情や動作を入力" onInput={(event) => update((draft) => { draft.action = event.currentTarget.value || null; })} /></Field>
    </section>

    <section class="editor-section">
      <SectionTitle index="03" title="素材" description="このコマで参照する materials" />
      <div class="asset-picker">
        {manga.materials.map((material) => <label class={(panel.assets ?? []).includes(material.key) ? 'is-selected' : ''} key={material.key}>
          <input type="checkbox" checked={(panel.assets ?? []).includes(material.key)} onChange={(event) => update((draft) => {
            const current = new Set(draft.assets ?? []);
            event.currentTarget.checked ? current.add(material.key) : current.delete(material.key);
            draft.assets = [...current];
          })} /><span class={`material-dot type-${material.type}`} /> <span>{material.key}</span>
        </label>)}
        {!manga.materials.length && <p class="muted-message">素材タブから materials を追加できます。</p>}
      </div>
    </section>

    <section class="editor-section">
      <SectionTitle index="04" title="人物・物の配置" description="figures / bbox" action={<button class="inline-add" onClick={() => { const index = panel.figures?.length ?? 0; update((draft) => { (draft.figures ??= []).push({ name: manga.characters[0]?.name ?? '', bbox: fallbackBox(panel, 'figure', index), anchor: 'center', size: 'waist-up' }); }); onSelectElement({ type: 'figure', index }); }}><UserPlus size={14} />追加</button>} />
      <label class="check-row"><input type="checkbox" checked={panel.no_figures ?? false} onChange={(event) => update((draft) => { event.currentTarget.checked ? draft.no_figures = true : delete draft.no_figures; })} /><span>意図的な無人コマ（no_figures）</span></label>
      <div class="nested-list">
        {(panel.figures ?? []).map((figure, index) => <div class={`nested-card selectable-card ${selectedElement?.type === 'figure' && selectedElement.index === index ? 'is-selected' : ''}`} key={index} onClick={() => onSelectElement({ type: 'figure', index })}>
          <div class="nested-card-head"><strong>{figure.object ? 'OBJECT' : 'FIGURE'} {index + 1}{selectedElement?.type === 'figure' && selectedElement.index === index ? ' · 選択中' : ''}</strong><button onClick={(event) => { event.stopPropagation(); update((draft) => { draft.figures?.splice(index, 1); }); if (selectedElement?.type === 'figure') onSelectElement(null); }}>×</button></div>
          <div class="field-grid">
            <Field label="対象" hint="人物または物"><select value={figure.name} onChange={(event) => update((draft) => {
              const value = event.currentTarget.value;
              const target = draft.figures![index];
              target.name = value;
              // 物（materials）を選んだら object: true を自動付与し、人物向けの語彙を外す
              const isObject = value !== '' && !manga.characters.some((character) => character.name === value) && manga.materials.some((material) => material.key === value);
              if (isObject) { target.object = true; delete target.size; delete target.role; } else delete target.object;
            })}>
              <option value="">未選択</option>
              <optgroup label="人物（characters）">{manga.characters.map((character) => <option value={character.name}>{character.name}</option>)}</optgroup>
              {manga.materials.some((material) => material.type === 'prop') && <optgroup label="物（materials・小道具）">{manga.materials.filter((material) => material.type === 'prop').map((material) => <option value={material.key}>{material.key}</option>)}</optgroup>}
            </select></Field>
            {!figure.object && <Field label="サイズ"><select value={figure.size ?? ''} onChange={(event) => update((draft) => { const value = event.currentTarget.value as typeof figure.size | ''; value ? draft.figures![index].size = value : delete draft.figures![index].size; })}><option value="">自動</option>{FIGURE_SIZES.map((size) => <option value={size}>{size}</option>)}</select></Field>}
            {!figure.object && <Field label="役割" hint="sub=脇役（センター既定の対象外）"><select value={figure.role ?? ''} onChange={(event) => update((draft) => { const value = event.currentTarget.value as typeof figure.role | ''; value ? draft.figures![index].role = value : delete draft.figures![index].role; })}><option value="">未指定（main扱い）</option>{FIGURE_ROLES.map((role) => <option value={role}>{FIGURE_ROLE_LABELS[role]}</option>)}</select></Field>}
            <Field label="アンカー"><select value={figure.anchor ?? ''} onChange={(event) => update((draft) => { draft.figures![index].anchor = event.currentTarget.value as typeof figure.anchor; })}><option value="">未指定</option>{ANCHORS.map((anchor) => <option value={anchor}>{anchor}</option>)}</select></Field>
          </div>
          <span class="sub-label">BBOX <small>mm</small></span><BBoxEditor value={figure.bbox} onChange={(bbox) => update((draft) => { draft.figures![index].bbox = bbox; })} />
        </div>)}
      </div>
    </section>

    <section class="editor-section">
      <SectionTitle index="05" title="フキダシ" description="配列順が読み順です" action={<button class="inline-add" onClick={() => { const index = panel.bubbles.length; update((draft) => { draft.bubbles.push({ text: '', shape: 'normal', anchor: 'top-right', bbox: fallbackBox(panel, 'bubble', index) }); }); onSelectElement({ type: 'bubble', index }); }}><MessageCircleMore size={14} />追加</button>} />
      <div class="nested-list">
        {panel.bubbles.map((bubble, index) => <div class={`nested-card bubble-card selectable-card ${selectedElement?.type === 'bubble' && selectedElement.index === index ? 'is-selected' : ''}`} key={index} onClick={() => onSelectElement({ type: 'bubble', index })}>
          <div class="nested-card-head"><strong>BUBBLE {index + 1}{selectedElement?.type === 'bubble' && selectedElement.index === index ? ' · 選択中' : ''}</strong><button onClick={(event) => { event.stopPropagation(); update((draft) => { draft.bubbles.splice(index, 1); }); if (selectedElement?.type === 'bubble') onSelectElement(null); }}>×</button></div>
          <Field label="セリフ" wide><textarea rows={3} value={bubble.text} placeholder="フキダシの本文" onInput={(event) => update((draft) => { draft.bubbles[index].text = event.currentTarget.value; })} /></Field>
          <div class="field-grid">
            <Field label="話者"><select value={bubble.speaker ?? ''} onChange={(event) => update((draft) => { const value = event.currentTarget.value; value ? draft.bubbles[index].speaker = value : delete draft.bubbles[index].speaker; })}><option value="">話者なし / 継承</option>{manga.characters.map((character) => <option value={character.name}>{character.name}</option>)}</select></Field>
            <Field label="形"><select value={bubble.shape ?? 'normal'} onChange={(event) => update((draft) => { draft.bubbles[index].shape = event.currentTarget.value as typeof bubble.shape; })}>{BUBBLE_SHAPES.map((shape) => <option value={shape}>{shape}</option>)}</select></Field>
            <Field label="アンカー"><select value={bubble.anchor ?? ''} onChange={(event) => update((draft) => { draft.bubbles[index].anchor = event.currentTarget.value as typeof bubble.anchor; })}><option value="">未指定</option>{ANCHORS.map((anchor) => <option value={anchor}>{anchor}</option>)}</select></Field>
            <Field label="強調語"><input value={bubble.emphasis ?? ''} onInput={(event) => update((draft) => { const value = event.currentTarget.value; value ? draft.bubbles[index].emphasis = value : delete draft.bubbles[index].emphasis; })} /></Field>
          </div>
          <div class="inspector-bubble-preview" aria-label={`${bubble.shape ?? 'normal'} のフキダシプレビュー`}>
            <BubbleShapeSvg shape={bubble.shape} />
            <span class="vertical-text">{bubble.text || 'セリフ'}</span>
            <small>{bubble.shape ?? 'normal'}</small>
          </div>
          <label class="check-row"><input type="checkbox" checked={bubble.monologue ?? false} onChange={(event) => update((draft) => { event.currentTarget.checked ? draft.bubbles[index].monologue = true : delete draft.bubbles[index].monologue; })} /><span>心の声（monologue）</span></label>
          <label class="check-row"><input type="checkbox" checked={bubble.offscreen ?? false} onChange={(event) => update((draft) => { event.currentTarget.checked ? draft.bubbles[index].offscreen = true : delete draft.bubbles[index].offscreen; })} /><span>コマ外の声（offscreen）· 尻尾を描かない</span></label>
          <span class="sub-label">BBOX <small>mm</small></span><BBoxEditor value={bubble.bbox} onChange={(bbox) => update((draft) => { draft.bubbles[index].bbox = bbox; })} />
        </div>)}
      </div>
    </section>

    <section class="editor-section">
      <SectionTitle index="06" title="画面内文字" description="screen_text / モニター・看板・紙面の文字" action={<button class="inline-add" onClick={() => { const index = panel.screen_text?.length ?? 0; update((draft) => { (draft.screen_text ??= []).push({ text: '', orientation: 'horizontal', bbox: fallbackBox(panel, 'screen_text', index) }); }); onSelectElement({ type: 'screen_text', index }); }}><MonitorSpeaker size={14} />追加</button>} />
      <div class="nested-list">
        {(panel.screen_text ?? []).map((screenText, index) => <div class={`nested-card selectable-card ${selectedElement?.type === 'screen_text' && selectedElement.index === index ? 'is-selected' : ''}`} key={index} onClick={() => onSelectElement({ type: 'screen_text', index })}>
          <div class="nested-card-head"><strong>SCREEN {index + 1}{selectedElement?.type === 'screen_text' && selectedElement.index === index ? ' · 選択中' : ''}</strong><button onClick={(event) => { event.stopPropagation(); update((draft) => { draft.screen_text?.splice(index, 1); if (!draft.screen_text?.length) delete draft.screen_text; }); if (selectedElement?.type === 'screen_text') onSelectElement(null); }}>×</button></div>
          <Field label="文字" wide><textarea rows={2} value={screenText.text} placeholder="画面・看板に描く文字" onInput={(event) => update((draft) => { draft.screen_text![index].text = event.currentTarget.value; })} /></Field>
          <div class="field-grid">
            <Field label="組み方向"><select value={screenText.orientation ?? 'horizontal'} onChange={(event) => update((draft) => { draft.screen_text![index].orientation = event.currentTarget.value as typeof screenText.orientation; })}><option value="horizontal">horizontal / 横組み</option><option value="vertical">vertical / 縦書き</option></select></Field>
          </div>
          <span class="sub-label">BBOX <small>mm</small></span><BBoxEditor value={screenText.bbox} onChange={(bbox) => update((draft) => { draft.screen_text![index].bbox = bbox; })} />
        </div>)}
        {!(panel.screen_text?.length) && <p class="muted-message">フキダシではない「画面・看板・紙面の文字」をコマに置けます。</p>}
      </div>
    </section>
    <button class="add-panel-bottom" onClick={onAdd}><Plus size={16} />新しいコマを追加</button>
  </div>;
}
