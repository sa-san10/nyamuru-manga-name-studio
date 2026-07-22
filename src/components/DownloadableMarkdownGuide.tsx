import { ClipboardCopy, Download } from 'lucide-preact';
import MarkdownArticle from './MarkdownArticle';

interface Props {
  readmeMarkdown: string;
  markdown: string;
  eyebrow: string;
  title: string;
  description: string;
  fileName: string;
  resourceName: string;
  onNotify: (message: string) => void;
}

export default function DownloadableMarkdownGuide({ readmeMarkdown, markdown, eyebrow, title, description, fileName, resourceName, onNotify }: Props) {
  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(markdown);
      onNotify(`${resourceName}のMarkdownをコピーしました`);
    } catch {
      onNotify(`${resourceName}のコピーに失敗しました`);
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
    onNotify(`${resourceName}のMarkdownを保存しました`);
  };

  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
      <div class="document-head-actions markdown-resource-actions">
        <button type="button" class="secondary-button" title="Markdownの内容をコピー" aria-label="Markdownの内容をコピー" onClick={handleCopy}><ClipboardCopy size={16} /><span>内容をコピー</span></button>
        <button type="button" class="primary-button" title="Markdownファイルをダウンロード" aria-label="Markdownファイルをダウンロード" onClick={handleDownload}><Download size={16} /><span>Markdown保存</span></button>
      </div>
    </div>
    <div class="document-editor-body schema-markdown-wrap">
      <MarkdownArticle markdown={readmeMarkdown} className="markdown-resource-readme" onNotify={onNotify} />
      <MarkdownArticle markdown={markdown} className="markdown-resource-document" onNotify={onNotify} />
    </div>
  </div>;
}
