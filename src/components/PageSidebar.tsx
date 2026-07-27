import { useState } from 'preact/hooks';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, FilePlus2, PanelTop, Trash2 } from 'lucide-preact';
import type { MangaDocument, ValidationIssue, WorkspaceTab } from '../types';

interface Props {
  document: MangaDocument;
  activePage: number;
  tab: WorkspaceTab;
  issues: ValidationIssue[];
  collapsed: boolean;
  onCollapse: () => void;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  onReorderPage: (from: number, to: number) => void;
}

export default function PageSidebar(props: Props) {
  const { document, activePage, issues, collapsed } = props;
  const manga = document.manga;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const resetDrag = () => { setDragIndex(null); setOverIndex(null); };
  return (
    <aside id="mobile-pages-pane" class={`page-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div class="sidebar-heading">
        {!collapsed && <><div><span class="eyebrow">PAGES</span><h2>ページ</h2></div><span class="count-badge">{manga.pages.length}</span></>}
        <button class="collapse-button" onClick={props.onCollapse} aria-label={collapsed ? 'ページ一覧を開く' : 'ページ一覧を閉じる'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!collapsed && <>
        <div class="page-list">
          {manga.pages.map((page, index) => {
            const pageIssues = issues.filter((issue) => issue.path.startsWith(`manga.pages[${index}]`));
            return (
              <div
                class={`page-card ${activePage === index ? 'is-active' : ''} ${dragIndex === index ? 'is-dragging' : ''} ${dragIndex !== null && dragIndex !== index && overIndex === index ? (dragIndex < index ? 'is-drop-after' : 'is-drop-before') : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => props.onSelectPage(index)}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); props.onSelectPage(index); } }}
                draggable
                onDragStart={(event) => { setDragIndex(index); if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)); } }}
                onDragOver={(event) => { if (dragIndex === null) return; event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; setOverIndex(index); }}
                onDragLeave={() => { if (overIndex === index) setOverIndex(null); }}
                onDrop={(event) => { event.preventDefault(); if (dragIndex !== null && dragIndex !== index) props.onReorderPage(dragIndex, index); resetDrag(); }}
                onDragEnd={resetDrag}
                title="ドラッグでページ順を入れ替え"
                key={`${page.page}-${index}`}
              >
                <div class="page-thumb">
                  <span class="paper-corner" />
                  <span class="thumb-number">{String(index + 1).padStart(2, '0')}</span>
                  <div class="thumb-panels">
                    {page.panels.slice(0, 6).map((panel) => <span class={`thumb-panel bg-${panel.bg}`} key={panel.id} />)}
                  </div>
                </div>
                <div class="page-card-copy">
                  <strong>PAGE {index + 1}</strong>
                  <span>{page.panels.length}コマ · bg2 {page.panels.filter((panel) => panel.bg === 2).length}</span>
                </div>
                {pageIssues.length > 0 && <span class={`issue-dot ${pageIssues.some((issue) => issue.level === 'error') ? 'error' : ''}`}>{pageIssues.length}</span>}
                <span class="page-move">
                  <button type="button" disabled={index === 0} onClick={(event) => { event.stopPropagation(); props.onReorderPage(index, index - 1); }} aria-label={`ページ ${index + 1} を上へ移動`} title="上へ移動"><ChevronUp size={13} /></button>
                  <button type="button" disabled={index === manga.pages.length - 1} onClick={(event) => { event.stopPropagation(); props.onReorderPage(index, index + 1); }} aria-label={`ページ ${index + 1} を下へ移動`} title="下へ移動"><ChevronDown size={13} /></button>
                </span>
              </div>
            );
          })}
        </div>
        <button class="add-page-button" onClick={props.onAddPage}><FilePlus2 size={17} />ページを追加</button>
        <div class="sidebar-tools">
          <button onClick={props.onDuplicatePage} disabled={!manga.pages.length}><Copy size={15} />複製</button>
          <button onClick={props.onDeletePage} disabled={manga.pages.length <= 1}><Trash2 size={15} />削除</button>
        </div>
        <div class="sidebar-summary">
          <PanelTop size={16} />
          <div><strong>{manga.pages.reduce((sum, page) => sum + page.panels.length, 0)} コマ</strong><span>全{manga.pages.length}ページ</span></div>
        </div>
      </>}
    </aside>
  );
}
