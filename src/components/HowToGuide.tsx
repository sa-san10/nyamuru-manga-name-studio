import { FileText } from 'lucide-preact';
import howToMarkdown from '../content/how-to-guide.md?raw';
import { REPO_URL } from './AskAiBlock';
import MarkdownArticle from './MarkdownArticle';
import type { WorkspaceTab } from '../types';

interface Props {
  onNavigate: (tab: WorkspaceTab) => void;
  onNotify: (message: string) => void;
}

// md内の「#tab-◯◯」リンクで遷移できるタブ
const TAB_LINK_TARGETS = new Set<WorkspaceTab>(['storyboard', 'meta', 'nyamurutan', 'prompt', 'workflow']);

// スタンドアロン版（file://起動）では配信元サイトのURLが確定しないため、
// ダウンロードリンクの代わりに配布元リポジトリを開き、NOTICESは同梱ファイルへの相対リンクにする
const IS_STANDALONE = Boolean(import.meta.env.PUBLIC_STANDALONE);
const STANDALONE_URL = '/standalone/nyamuru-manga-name-studio.html';
const NOTICES_URL = IS_STANDALONE ? './THIRD_PARTY_NOTICES.txt' : '/standalone/THIRD_PARTY_NOTICES.txt';

function download(url: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
}

export default function HowToGuide({ onNavigate, onNotify }: Props) {
  // md内のリンクをアプリの挙動へつなぐ：「#tab-◯◯」はタブ遷移、スタンドアロン版とNOTICESはビルド形態に合わせた入手先
  const handleClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';

    if (href.startsWith('#tab-')) {
      const tab = href.slice('#tab-'.length) as WorkspaceTab;
      if (TAB_LINK_TARGETS.has(tab)) {
        event.preventDefault();
        onNavigate(tab);
      }
      return;
    }
    if (href.endsWith('nyamuru-manga-name-studio.html')) {
      event.preventDefault();
      if (IS_STANDALONE) window.open(REPO_URL, '_blank', 'noreferrer');
      else download(STANDALONE_URL, 'nyamuru-manga-name-studio.html');
      return;
    }
    if (href.endsWith('THIRD_PARTY_NOTICES.txt')) {
      event.preventDefault();
      download(NOTICES_URL, 'THIRD_PARTY_NOTICES.txt');
    }
  };

  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">HOW TO USE · MANGA WORKFLOW</span><h2>使い方</h2><p>LLMと画像生成AIをつないで、テーマから完成漫画まで進む3ステップのワークフローです。このアプリは真ん中に立って、ネーム（OMNY形式）の確認・調整を受け持ちます。</p></div>
      <div class="document-head-actions">
        <span class="schema-source-badge"><FileText size={15} />src/content/how-to-guide.md</span>
      </div>
    </div>
    <div class="document-editor-body schema-markdown-wrap" onClick={handleClick}>
      <MarkdownArticle markdown={howToMarkdown} onNotify={onNotify} />
    </div>
  </div>;
}
