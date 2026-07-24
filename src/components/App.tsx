import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BookOpen, BookOpenCheck, Boxes, Braces, Cat, ChevronLeft, ChevronRight, CircleHelp, Eye, EyeOff, FilePlus2, Files, Images, LayoutPanelTop, Settings2, SlidersHorizontal, Sparkles, UsersRound, Workflow, X } from 'lucide-preact';
import sampleYaml from '../content/sample.omny.yaml?raw';
import { version as appVersion } from '../../package.json';
import { sampleMangaPages } from '../lib/sampleMangaImages';
import AskAiBlock, { REPO_URL } from './AskAiBlock';
import Header from './Header';
import PageSidebar from './PageSidebar';
import MangaCanvas from './MangaCanvas';
import PanelInspector from './PanelInspector';
import SchemaGuide from './SchemaGuide';
import AgentWorkflowGuide from './AgentWorkflowGuide';
import GenerationPromptGuide from './GenerationPromptGuide';
import HowToGuide from './HowToGuide';
import NyamurutanGuide from './NyamurutanGuide';
import { CharactersEditor, MaterialsEditor, MetaEditor, RawYamlEditor, SettingEditor, ValidationPanel } from './DocumentEditors';
import { cloneDocument, newPage, newPanel, parseMangaYaml, safeFileName, STORAGE_KEY, toMangaYaml, validateManga } from '../lib/manga';
import { resizePanelToBounds, translatePanel } from '../lib/canvasGeometry';
import { applyPanelTemplate, findPanelTemplate, PANEL_TEMPLATES, type PanelTemplate } from '../lib/panelTemplates';
import type { BBox, CanvasElementSelection, MangaDocument, WorkspaceTab } from '../types';

const TABS: {
  id: WorkspaceTab;
  label: string;
  icon: typeof LayoutPanelTop;
  separatorBefore?: boolean;
}[] = [
  { id: 'storyboard', label: 'ネーム', icon: LayoutPanelTop },
  { id: 'meta', label: '作品情報', icon: BookOpen },
  { id: 'setting', label: '舞台設定', icon: Settings2 },
  { id: 'characters', label: '登場人物', icon: UsersRound },
  { id: 'materials', label: '素材', icon: Images },
  { id: 'yaml', label: 'OMNY編集', icon: Braces },
  { id: 'howto', label: '使い方', icon: CircleHelp, separatorBefore: true },
  { id: 'prompt', label: '生成プロンプト', icon: Sparkles },
  { id: 'workflow', label: '生成ワークフロー', icon: Workflow },
  { id: 'schema', label: 'NDM仕様', icon: BookOpenCheck },
  { id: 'nyamurutan', label: 'にゃむるたん', icon: Cat },
];

type MobileStoryboardPane = 'pages' | 'editor' | 'panel';

const HOWTO_INTRO_KEY = 'manga-name-studio.howto-intro.v1';

// 見開きは右綴じ（1ページ目が右）。ビューアはこの配列順にめくる
const SAMPLE_MANGA_PAGES = [sampleMangaPages.page1, sampleMangaPages.page2];

function TemplateThumb({ shapes }: { shapes: PanelTemplate['shapes'] }) {
  return <svg viewBox="0 0 210 297" aria-hidden="true">
    {shapes.map((shape, index) => shape.type === 'rect'
      ? <rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} />
      : <polygon key={index} points={shape.points.map((point) => point.join(',')).join(' ')} />)}
  </svg>;
}

function initialTab(): WorkspaceTab {
  try {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (requested && TABS.some((item) => item.id === requested)) return requested as WorkspaceTab;
  } catch { /* no URL access */ }
  return 'storyboard';
}

function initialDocument(): MangaDocument {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return parseMangaYaml(saved);
  } catch { /* private mode or first visit */ }
  return parseMangaYaml(sampleYaml);
}

export default function App() {
  const [document, setDocumentState] = useState<MangaDocument>(initialDocument);
  const [activePage, setActivePage] = useState(0);
  const [activePanel, setActivePanel] = useState(0);
  const [selectedElement, setSelectedElement] = useState<CanvasElementSelection | null>(null);
  const [tab, setTab] = useState<WorkspaceTab>(initialTab);
  const [mobileStoryboardPane, setMobileStoryboardPane] = useState<MobileStoryboardPane>('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showHowtoIntro, setShowHowtoIntro] = useState(false);
  const [mangaViewerPage, setMangaViewerPage] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('B');
  const [rawSource, setRawSource] = useState(() => toMangaYaml(document));
  const [rawError, setRawError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [past, setPast] = useState<MangaDocument[]>([]);
  const [future, setFuture] = useState<MangaDocument[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const lastHistoryPush = useRef(0);

  const issues = useMemo(() => validateManga(document), [document]);
  const page = document.manga.pages[activePage];
  const panel = page?.panels[activePanel];

  const setDocument = (next: MangaDocument) => {
    next.manga.meta.page_count = next.manga.pages.length;
    const now = Date.now();
    if (now - lastHistoryPush.current > 800) {
      setPast((stack) => [...stack.slice(-49), document]);
      lastHistoryPush.current = now;
    }
    setFuture([]);
    setDocumentState(next);
  };

  const restoreDocument = (target: MangaDocument) => {
    setDocumentState(target);
    const pageIndex = Math.min(activePage, target.manga.pages.length - 1);
    setActivePage(pageIndex);
    setActivePanel(Math.min(activePanel, Math.max(0, (target.manga.pages[pageIndex]?.panels.length ?? 1) - 1)));
    setSelectedElement(null);
    lastHistoryPush.current = 0;
    if (tab === 'yaml') { setRawSource(toMangaYaml(target)); setRawError(null); }
  };

  const undo = () => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture((stack) => [...stack, document]);
    restoreDocument(previous);
    setToast('作業を元に戻しました');
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[future.length - 1];
    setFuture(future.slice(0, -1));
    setPast((stack) => [...stack, document]);
    restoreDocument(next);
    setToast('作業をやり直しました');
  };

  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, toMangaYaml(document));
        setSavedAt(new Date());
      } catch { setToast('ブラウザへの保存に失敗しました'); }
    }, 350);
    return () => window.clearTimeout(saveTimer.current);
  }, [document]);

  useEffect(() => {
    try {
      if (localStorage.getItem(HOWTO_INTRO_KEY)) return;
      localStorage.setItem(HOWTO_INTRO_KEY, '1');
      if (initialTab() !== 'howto') setShowHowtoIntro(true);
    } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    if (tab === 'yaml') { setRawSource(toMangaYaml(document)); setRawError(null); }
  }, [tab]);

  useEffect(() => { setSelectedElement(null); }, [activePage, activePanel]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 's') {
        event.preventDefault();
        try { localStorage.setItem(STORAGE_KEY, toMangaYaml(document)); setSavedAt(new Date()); setToast('ブラウザに保存しました'); } catch { setToast('保存に失敗しました'); }
        return;
      }
      if (key === 'escape' && mangaViewerPage !== null) { setMangaViewerPage(null); return; }
      if (key === 'escape' && showNewDialog) { setShowNewDialog(false); return; }
      if (key === 'escape' && showHowtoIntro) { setShowHowtoIntro(false); return; }
      const target = event.target as HTMLElement | null;
      if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable)) return;
      if ((event.metaKey || event.ctrlKey) && key === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'y') { event.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [document, past, future, showNewDialog, showHowtoIntro, mangaViewerPage]);

  const changeTab = (next: WorkspaceTab) => { setTab(next); if (next !== 'storyboard' && window.innerWidth < 800) setSidebarCollapsed(true); };
  const mutate = (recipe: (draft: MangaDocument) => void) => { const next = cloneDocument(document); recipe(next); setDocument(next); };

  const download = () => {
    const source = toMangaYaml(document);
    const blob = new Blob([source], { type: 'application/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url; anchor.download = safeFileName(document.manga.meta.title); anchor.click();
    URL.revokeObjectURL(url); setToast('OMNY形式を書き出しました');
  };

  const copyYaml = async () => {
    const source = toMangaYaml(document);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(source);
      setToast('OMNY形式の全文をコピーしました');
    } catch {
      setToast('OMNY形式のコピーに失敗しました');
    }
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = parseMangaYaml(await file.text());
      setDocument(parsed); setActivePage(0); setActivePanel(0); setTab('storyboard'); setMobileStoryboardPane('editor'); setToast(`${file.name} を読み込みました`);
    } catch (error) { setToast(`読み込み失敗: ${error instanceof Error ? error.message : '不明なエラー'}`); }
    if (fileInput.current) fileInput.current.value = '';
  };

  const createNewDocument = (template?: PanelTemplate) => {
    const sample = parseMangaYaml(sampleYaml);
    const firstPage = newPage(1);
    if (template) { firstPage.panels = []; applyPanelTemplate(firstPage, template); }
    else firstPage.panels[0].bubbles = [];
    const fresh: MangaDocument = {
      manga: {
        schema_name: sample.manga.schema_name,
        schema_version: sample.manga.schema_version,
        meta: {
          title: '', author: '', format: '', page_count: 1,
          reading_direction: sample.manga.meta.reading_direction,
          text_orientation: sample.manga.meta.text_orientation,
          font: sample.manga.meta.font,
          style_notes: sample.manga.meta.style_notes,
        },
        layout_spec: sample.manga.layout_spec,
        setting: { location: '', time: '', weather: '', background: [], props: [], situation: '' },
        characters: [],
        materials: [],
        pages: [firstPage],
      },
    };
    lastHistoryPush.current = 0;
    setDocument(fresh);
    setActivePage(0); setActivePanel(0); setSelectedElement(null); setTab('storyboard'); setMobileStoryboardPane('editor'); setShowNewDialog(false);
    setToast(template ? `パターン${template.id}で新規作成しました` : 'まっさらな漫画を作成しました');
  };

  const resetSample = () => {
    if (!confirm('編集中の内容をサンプル漫画に戻しますか？\nブラウザに保存された内容も上書きされます。')) return;
    setDocument(parseMangaYaml(sampleYaml)); setActivePage(0); setActivePanel(0); setTab('storyboard'); setMobileStoryboardPane('editor'); setToast('サンプル漫画に戻しました');
  };

  const addPage = () => mutate((draft) => { const index = draft.manga.pages.length; draft.manga.pages.push(newPage(index + 1)); setActivePage(index); setActivePanel(0); setTab('storyboard'); setMobileStoryboardPane('editor'); });
  const duplicatePage = () => {
    if (!page) return;
    mutate((draft) => { const copy = structuredClone(draft.manga.pages[activePage]); draft.manga.pages.splice(activePage + 1, 0, copy); draft.manga.pages.forEach((item, index) => { item.page = index + 1; }); setActivePage(activePage + 1); });
  };
  const deletePage = () => {
    if (document.manga.pages.length <= 1 || !confirm(`ページ ${activePage + 1} を削除しますか？`)) return;
    mutate((draft) => { draft.manga.pages.splice(activePage, 1); draft.manga.pages.forEach((item, index) => { item.page = index + 1; }); setActivePage(Math.max(0, activePage - 1)); setActivePanel(0); });
  };
  const addPanel = () => {
    if (!page || page.panels.length >= 6) { setToast('1ページに追加できるのは6コマまでです'); return; }
    mutate((draft) => { const panels = draft.manga.pages[activePage].panels; panels.push(newPanel(panels.length + 1, Math.min(210, panels.length * 45))); setActivePanel(panels.length - 1); });
  };
  const duplicatePanel = () => {
    if (!panel || !page || page.panels.length >= 6) { setToast('1ページに追加できるのは6コマまでです'); return; }
    mutate((draft) => { const panels = draft.manga.pages[activePage].panels; panels.splice(activePanel + 1, 0, structuredClone(panels[activePanel])); panels.forEach((item, index) => { item.id = index + 1; }); setActivePanel(activePanel + 1); });
  };
  const deletePanel = () => {
    if (!panel || !confirm(`コマ ${panel.id} を削除しますか？`)) return;
    mutate((draft) => { const panels = draft.manga.pages[activePage].panels; panels.splice(activePanel, 1); panels.forEach((item, index) => { item.id = index + 1; }); setActivePanel(Math.max(0, activePanel - 1)); });
  };
  const changeElementBBox = (selection: CanvasElementSelection, bbox: BBox) => {
    mutate((draft) => {
      const targetPanel = draft.manga.pages[activePage]?.panels[activePanel];
      if (!targetPanel) return;
      if (selection.type === 'figure') {
        const figure = targetPanel.figures?.[selection.index];
        if (figure) figure.bbox = bbox;
      } else {
        const bubble = targetPanel.bubbles[selection.index];
        if (bubble) bubble.bbox = bbox;
      }
    });
  };
  const movePanel = (panelIndex: number, deltaX: number, deltaY: number) => {
    mutate((draft) => {
      const targetPanel = draft.manga.pages[activePage]?.panels[panelIndex];
      if (!targetPanel) return;
      translatePanel(targetPanel, deltaX, deltaY);
    });
  };
  const resizePanel = (panelIndex: number, bounds: BBox) => {
    mutate((draft) => {
      const targetPanel = draft.manga.pages[activePage]?.panels[panelIndex];
      if (targetPanel) resizePanelToBounds(targetPanel, bounds);
    });
  };
  const applyTemplate = () => {
    if (!page) return;
    const template = findPanelTemplate(selectedTemplate);
    if (!template) return;
    if (page.panels.length > template.shapes.length && !confirm(
      `パターン${template.id}は${template.shapes.length}コマです。現在の${page.panels.length}コマを読み順で統合し、人物・フキダシをすべて再配置します。続けますか？`,
    )) return;
    mutate((draft) => applyPanelTemplate(draft.manga.pages[activePage], template));
    setActivePanel(Math.min(activePanel, template.shapes.length - 1));
    setSelectedElement(null);
    setToast(`パターン${template.id}「${template.name}」を適用しました`);
  };

  const applyRaw = () => {
    try { const parsed = parseMangaYaml(rawSource); setDocument(parsed); setRawSource(toMangaYaml(parsed)); setRawError(null); setToast('OMNY形式を反映しました'); }
    catch (error) { setRawError(error instanceof Error ? error.message : '不明なエラー'); }
  };
  const formatRaw = () => {
    try { setRawSource(toMangaYaml(parseMangaYaml(rawSource))); setRawError(null); }
    catch (error) { setRawError(error instanceof Error ? error.message : '不明なエラー'); }
  };

  return <div class="app-shell">
    <Header title={document.manga.meta.title} version={document.manga.schema_version} issues={issues} savedAt={savedAt} canUndo={past.length > 0} canRedo={future.length > 0} onUndo={undo} onRedo={redo} onNew={() => setShowNewDialog(true)} onImport={() => fileInput.current?.click()} onCopy={copyYaml} onDownload={download} onReset={resetSample} onValidate={() => setShowValidation(true)} />
    <input ref={fileInput} type="file" accept=".yaml,.yml,text/yaml,application/yaml" hidden onChange={(event) => importFile(event.currentTarget.files?.[0])} />

    <nav class="workspace-tabs" aria-label="編集カテゴリ">
      {TABS.map((item) => <button class={`${tab === item.id ? 'is-active' : ''}${item.separatorBefore ? ' has-separator-before' : ''}`} title={item.label} onClick={() => changeTab(item.id)} key={item.id}><item.icon size={17} /><span>{item.label}</span></button>)}
    </nav>

    <main class={`workspace-shell ${tab === 'storyboard' ? 'is-storyboard' : ''} mobile-pane-${mobileStoryboardPane}`}>
      <PageSidebar document={document} activePage={activePage} tab={tab} issues={issues} collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} onSelectPage={(index) => { setActivePage(index); setActivePanel(0); setTab('storyboard'); setMobileStoryboardPane('editor'); }} onAddPage={addPage} onDuplicatePage={duplicatePage} onDeletePage={deletePage} />

      <section class={`workspace-main ${tab === 'storyboard' ? 'has-mobile-storyboard-tabs' : ''}`}>
        {tab === 'storyboard' && <nav class="mobile-storyboard-tabs" aria-label="ネーム作業エリア" role="tablist">
          <button type="button" role="tab" aria-selected={mobileStoryboardPane === 'pages'} aria-controls="mobile-pages-pane" class={mobileStoryboardPane === 'pages' ? 'is-active' : ''} onClick={() => { setSidebarCollapsed(false); setMobileStoryboardPane('pages'); }}><Files size={17} /><span>ページ</span></button>
          <button type="button" role="tab" aria-selected={mobileStoryboardPane === 'editor'} aria-controls="mobile-editor-pane" class={mobileStoryboardPane === 'editor' ? 'is-active' : ''} onClick={() => setMobileStoryboardPane('editor')}><LayoutPanelTop size={17} /><span>ネーム編集</span></button>
          <button type="button" role="tab" aria-selected={mobileStoryboardPane === 'panel'} aria-controls="mobile-panel-pane" class={mobileStoryboardPane === 'panel' ? 'is-active' : ''} onClick={() => setMobileStoryboardPane('panel')}><SlidersHorizontal size={17} /><span>コマ設定</span></button>
        </nav>}
        {tab === 'storyboard' && page && <div class="storyboard-workspace">
          <div id="mobile-editor-pane" class="canvas-stage">
            <div class="canvas-toolbar">
              <div class="page-switcher"><button onClick={() => { setActivePage(Math.max(0, activePage - 1)); setActivePanel(0); }} disabled={activePage === 0}><ChevronLeft size={17} /></button><span>PAGE <strong>{String(activePage + 1).padStart(2, '0')}</strong> / {String(document.manga.pages.length).padStart(2, '0')}</span><button onClick={() => { setActivePage(Math.min(document.manga.pages.length - 1, activePage + 1)); setActivePanel(0); }} disabled={activePage === document.manga.pages.length - 1}><ChevronRight size={17} /></button></div>
              <div class="canvas-toolbar-actions">
                <div class="layout-template-control" title={findPanelTemplate(selectedTemplate)?.usage}>
                  <label for="panel-template">コマ割り</label>
                  <select id="panel-template" value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.currentTarget.value)}>
                    {PANEL_TEMPLATES.map((template) => <option value={template.id} key={template.id}>パターン{template.id} · {template.name}（{template.shapes.length}コマ）</option>)}
                  </select>
                  <button onClick={applyTemplate}>適用</button>
                </div>
                <button class={`guide-toggle ${showGuides ? 'is-active' : ''}`} onClick={() => setShowGuides(!showGuides)}>{showGuides ? <Eye size={16} /> : <EyeOff size={16} />}ガイド</button>
              </div>
            </div>
            <MangaCanvas title={document.manga.meta.title} author={document.manga.meta.author} page={page} pageCount={document.manga.pages.length} activePanel={activePanel} selectedElement={selectedElement} showGuides={showGuides} onSelectPanel={(index) => { setActivePanel(index); if (index === activePanel) setSelectedElement(null); }} onSelectElement={setSelectedElement} onChangeElementBBox={changeElementBBox} onMovePanel={movePanel} onResizePanel={resizePanel} />
            <div class="canvas-legend"><span><i class="legend-figure" />人物 bbox</span><span><i class="legend-bubble" />フキダシ bbox</span><span>赤いコマ線をドラッグで移動</span><span>要素はドラッグ · 四隅でリサイズ</span></div>
          </div>
          <aside id="mobile-panel-pane" class="inspector-pane"><PanelInspector manga={document.manga} panel={panel} panelIndex={activePanel} selectedElement={selectedElement} onSelectElement={setSelectedElement} onChange={(nextPanel) => mutate((draft) => { draft.manga.pages[activePage].panels[activePanel] = nextPanel; })} onAdd={addPanel} onDuplicate={duplicatePanel} onDelete={deletePanel} /></aside>
        </div>}
        {tab === 'meta' && <MetaEditor document={document} onChange={setDocument} />}
        {tab === 'setting' && <SettingEditor document={document} onChange={setDocument} />}
        {tab === 'characters' && <CharactersEditor document={document} onChange={setDocument} />}
        {tab === 'materials' && <MaterialsEditor document={document} onChange={setDocument} />}
        {tab === 'schema' && <SchemaGuide onNotify={setToast} />}
        {tab === 'nyamurutan' && <NyamurutanGuide onNotify={setToast} />}
        {tab === 'howto' && <HowToGuide onNavigate={changeTab} />}
        {tab === 'prompt' && <GenerationPromptGuide onNotify={setToast} />}
        {tab === 'workflow' && <AgentWorkflowGuide onNotify={setToast} />}
        {tab === 'yaml' && <RawYamlEditor source={rawSource} error={rawError} onSourceChange={setRawSource} onApply={applyRaw} onFormat={formatRaw} />}
      </section>
    </main>

    <footer class="app-footer"><span><Boxes size={13} />オフライン対応 · 変更はこの端末に自動保存</span><span class="footer-links"><a class="license-link" href={import.meta.env.PUBLIC_STANDALONE ? `${REPO_URL}/blob/main/LICENSE` : '/licenses/'} target={import.meta.env.PUBLIC_STANDALONE ? '_blank' : undefined}>© 2026 sa-san10 · MIT License</a><a class="license-link" href={import.meta.env.PUBLIC_STANDALONE ? REPO_URL : '/changelog/'} target={import.meta.env.PUBLIC_STANDALONE ? '_blank' : undefined} title="バージョン履歴">v{appVersion}</a></span><button onClick={() => setShowValidation(true)}>{issues.length ? `${issues.length} 件のNDM確認` : 'NDM検査OK'}</button></footer>
    {showValidation && <><button class="drawer-backdrop" onClick={() => setShowValidation(false)} aria-label="検査結果を閉じる" /><ValidationPanel issues={issues} onClose={() => setShowValidation(false)} /></>}
    {showNewDialog && <>
      <button class="drawer-backdrop" onClick={() => setShowNewDialog(false)} aria-label="新規作成を閉じる" />
      <section class="new-dialog" role="dialog" aria-modal="true" aria-label="新規作成">
        <div class="drawer-head new-dialog-head"><h2>新規作成</h2><button onClick={() => setShowNewDialog(false)} aria-label="閉じる"><X size={16} /></button></div>
        <div class="new-dialog-body">
          <p class="new-dialog-note">作画・演出ルール、レイアウト仕様、NDMスキーマ名・バージョンはサンプルから引き継ぎ、それ以外がまっさらな1ページの漫画を作ります。いまの編集内容は「元に戻す」で復帰できます。</p>
          <button class="new-blank-button" onClick={() => createNewDocument()}><FilePlus2 size={16} />まっさらで開始（コマ割りはあとで選べます）</button>
          <h3 class="new-dialog-subtitle">コマ割りを選んで開始</h3>
          <div class="new-template-grid">
            {PANEL_TEMPLATES.map((template) => <button class="new-template-card" key={template.id} onClick={() => createNewDocument(template)}>
              <TemplateThumb shapes={template.shapes} />
              <strong>パターン{template.id} · {template.name}</strong>
              <small>{template.shapes.length}コマ · {template.usage}</small>
            </button>)}
          </div>
        </div>
      </section>
    </>}
    {showHowtoIntro && <>
      <button class="drawer-backdrop" onClick={() => setShowHowtoIntro(false)} aria-label="案内を閉じる" />
      <section class="howto-intro-dialog" role="dialog" aria-modal="true" aria-label="使い方の案内">
        <div class="howto-intro-icon" aria-hidden="true"><CircleHelp size={26} /></div>
        <h2>使い方を見てみる？</h2>
        <p>LLMと画像生成AIをつないで漫画を作る、3ステップのワークフローを紹介します。</p>
        <div class="howto-intro-spread">
          <button type="button" onClick={() => setMangaViewerPage(1)} aria-label="サンプル漫画の2ページ目を全画面で読む"><img src={sampleMangaPages.page2} alt="" /></button>
          <button type="button" onClick={() => setMangaViewerPage(0)} aria-label="サンプル漫画の1ページ目を全画面で読む"><img src={sampleMangaPages.page1} alt="" /></button>
        </div>
        <small class="howto-intro-zoom-hint">漫画をタップすると全画面で読めます</small>
        <div class="howto-intro-actions">
          <button type="button" class="secondary-button" onClick={() => setShowHowtoIntro(false)}>あとで</button>
          <button type="button" class="primary-button" onClick={() => { setShowHowtoIntro(false); changeTab('howto'); }}>はい</button>
        </div>
        <div class="howto-intro-ask-ai">
          <span>または、あなたの創作パートナーのAIに聞いてみる</span>
          <AskAiBlock />
        </div>
      </section>
    </>}
    {mangaViewerPage !== null && <div
      class="manga-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="サンプル漫画の全画面表示"
      onClick={(event) => { if (event.target === event.currentTarget) setMangaViewerPage(null); }}
    >
      <button
        type="button"
        class="manga-viewer-page"
        onClick={() => setMangaViewerPage(mangaViewerPage + 1 < SAMPLE_MANGA_PAGES.length ? mangaViewerPage + 1 : null)}
        title={mangaViewerPage + 1 < SAMPLE_MANGA_PAGES.length ? 'タップで次のページ' : 'タップで閉じる'}
      >
        <img src={SAMPLE_MANGA_PAGES[mangaViewerPage]} alt={`サンプル漫画 ${mangaViewerPage + 1}ページ目`} />
      </button>
      <span class="manga-viewer-count">{mangaViewerPage + 1} / {SAMPLE_MANGA_PAGES.length}<em>タップで{mangaViewerPage + 1 < SAMPLE_MANGA_PAGES.length ? '次のページ' : '閉じる'}</em></span>
      <button type="button" class="manga-viewer-close" onClick={() => setMangaViewerPage(null)} aria-label="全画面表示を閉じる"><X size={17} /></button>
    </div>}
    {toast && <div class="toast"><span>{toast}</span><button onClick={() => setToast(null)}><X size={15} /></button></div>}
  </div>;
}
