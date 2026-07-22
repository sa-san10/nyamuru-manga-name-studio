import { ChevronLeft, ChevronRight, Copy, FilePlus2, PanelTop, Trash2 } from 'lucide-preact';
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
}

export default function PageSidebar(props: Props) {
  const { document, activePage, issues, collapsed } = props;
  const manga = document.manga;
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
              <button class={`page-card ${activePage === index ? 'is-active' : ''}`} onClick={() => props.onSelectPage(index)} key={`${page.page}-${index}`}>
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
              </button>
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
