import { CheckCircle2, ClipboardCopy, Download, FilePlus2, FileUp, Redo2, RotateCcw, Save, TriangleAlert, Undo2 } from 'lucide-preact';
import type { ValidationIssue } from '../types';

interface Props {
  title: string;
  version: number;
  issues: ValidationIssue[];
  savedAt: Date | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNew: () => void;
  onImport: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onReset: () => void;
  onValidate: () => void;
}

export default function Header({ title, version, issues, savedAt, canUndo, canRedo, onUndo, onRedo, onNew, onImport, onCopy, onDownload, onReset, onValidate }: Props) {
  const errors = issues.filter((issue) => issue.level === 'error').length;
  return (
    <header class="app-header">
      <div class="brand-wrap">
        <div class="brand-mark" aria-hidden="true"><span>M</span></div>
        <div class="brand-copy">
          <div class="eyebrow">Nyamuru🐱 · MANGA NAME STUDIO</div>
          <h1>{title || '無題の漫画'}</h1>
        </div>
        <span class="version-badge">NDM v{version}</span>
      </div>

      <div class="header-actions">
        <button class={`validation-pill ${errors ? 'has-errors' : issues.length ? 'has-warnings' : 'is-valid'}`} title="NDM検査結果" onClick={onValidate}>
          {errors ? <TriangleAlert size={15} /> : <CheckCircle2 size={15} />}
          <span>{errors ? `${errors} エラー` : issues.length ? `${issues.length} 件の確認` : '検査OK'}</span>
        </button>
        <div class="save-state" title="ブラウザに自動保存されます">
          <Save size={14} />
          <span>{savedAt ? `${savedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 保存` : '自動保存'}</span>
        </div>
        <button class="icon-button history-button" onClick={onUndo} disabled={!canUndo} title="元に戻す (Ctrl+Z)" aria-label="元に戻す"><Undo2 size={18} /></button>
        <button class="icon-button history-button" onClick={onRedo} disabled={!canRedo} title="やり直す (Ctrl+Shift+Z)" aria-label="やり直す"><Redo2 size={18} /></button>
        <button class="icon-button" onClick={onReset} title="サンプルに戻す" aria-label="サンプルに戻す"><RotateCcw size={18} /></button>
        <button class="secondary-button new-button" onClick={onNew} title="新しい漫画を作成"><FilePlus2 size={17} />新規</button>
        <button class="secondary-button import-button" title="OMNYファイルを読み込む" aria-label="OMNYファイルを読み込む" onClick={onImport}><FileUp size={17} />読み込む</button>
        <button class="secondary-button copy-button" onClick={onCopy} title="OMNY形式の全文をクリップボードにコピー"><ClipboardCopy size={17} />OMNYコピー</button>
        <button class="primary-button" onClick={onDownload}><Download size={17} />OMNY保存</button>
      </div>
    </header>
  );
}
