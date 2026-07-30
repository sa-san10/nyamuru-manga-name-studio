import { ClipboardCopy, Download } from 'lucide-preact';
import DocsLangToggle from './DocsLangToggle';
import MarkdownArticle from './MarkdownArticle';
import type { DocsLanguage } from '../types';

// タブに併載する分割ファイル（OMAYなど）。個別にコピー・保存できる導線
export interface GuideAttachment {
  label: string;
  description: string;
  fileName: string;
  content: string;
  mime?: string;
}

interface Props {
  readmeMarkdown: string;
  markdown: string;
  eyebrow: string;
  title: string;
  description: string;
  fileName: string;
  resourceName: string;
  attachments?: GuideAttachment[];
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
}

export default function DownloadableMarkdownGuide({ readmeMarkdown, markdown, eyebrow, title, description, fileName, resourceName, attachments, lang, onChangeLang, onNotify }: Props) {
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

  const copyAttachment = async (attachment: GuideAttachment) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(attachment.content);
      onNotify(en ? `Copied ${attachment.label}` : `${attachment.label}をコピーしました`);
    } catch {
      onNotify(en ? `Failed to copy ${attachment.label}` : `${attachment.label}のコピーに失敗しました`);
    }
  };

  const downloadAttachment = (attachment: GuideAttachment) => {
    const blob = new Blob([attachment.content], { type: attachment.mime ?? 'application/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = attachment.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify(en ? `Saved ${attachment.fileName}` : `${attachment.fileName}を保存しました`);
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
      {attachments && attachments.length > 0 && <div class="markdown-attachments">
        {attachments.map((attachment) => <div class="markdown-attachment" key={attachment.fileName}>
          <div class="markdown-attachment-copy">
            <strong>{attachment.label}</strong>
            <small>{attachment.description}</small>
            <code>{attachment.fileName}</code>
          </div>
          <div class="markdown-attachment-actions">
            <button type="button" class="secondary-button" onClick={() => copyAttachment(attachment)}><ClipboardCopy size={15} /><span>{en ? 'Copy' : 'コピー'}</span></button>
            <button type="button" class="secondary-button" onClick={() => downloadAttachment(attachment)}><Download size={15} /><span>{en ? 'Save' : '保存'}</span></button>
          </div>
        </div>)}
      </div>}
      <MarkdownArticle markdown={readmeMarkdown} className="markdown-resource-readme" onNotify={onNotify} />
      <MarkdownArticle markdown={markdown} className="markdown-resource-document" onNotify={onNotify} />
    </div>
  </div>;
}
