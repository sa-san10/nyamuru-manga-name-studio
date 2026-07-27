import { ClipboardCopy, Download } from 'lucide-preact';
import DocsLangToggle from './DocsLangToggle';
import MarkdownArticle from './MarkdownArticle';
import type { DocsLanguage } from '../types';

interface Props {
  readmeMarkdown: string;
  markdown: string;
  eyebrow: string;
  title: string;
  description: string;
  fileName: string;
  resourceName: string;
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
}

export default function DownloadableMarkdownGuide({ readmeMarkdown, markdown, eyebrow, title, description, fileName, resourceName, lang, onChangeLang, onNotify }: Props) {
  const en = lang === 'en';

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(markdown);
      onNotify(en ? `Copied the ${resourceName} Markdown` : `${resourceName}のMarkdownをコピーしました`);
    } catch {
      onNotify(en ? `Failed to copy the ${resourceName}` : `${resourceName}のコピーに失敗しました`);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify(en ? `Saved the ${resourceName} Markdown` : `${resourceName}のMarkdownを保存しました`);
  };

  const copyLabel = en ? 'Copy the Markdown' : 'Markdownの内容をコピー';
  const downloadLabel = en ? 'Download the Markdown file' : 'Markdownファイルをダウンロード';

  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
      <div class="document-head-actions markdown-resource-actions">
        <DocsLangToggle lang={lang} onChange={onChangeLang} />
        <button type="button" class="secondary-button" title={copyLabel} aria-label={copyLabel} onClick={handleCopy}><ClipboardCopy size={16} /><span>{en ? 'Copy content' : '内容をコピー'}</span></button>
        <button type="button" class="primary-button" title={downloadLabel} aria-label={downloadLabel} onClick={handleDownload}><Download size={16} /><span>{en ? 'Save Markdown' : 'Markdown保存'}</span></button>
      </div>
    </div>
    <div class="document-editor-body schema-markdown-wrap">
      <MarkdownArticle markdown={readmeMarkdown} className="markdown-resource-readme" onNotify={onNotify} />
      <MarkdownArticle markdown={markdown} className="markdown-resource-document" onNotify={onNotify} />
    </div>
  </div>;
}
