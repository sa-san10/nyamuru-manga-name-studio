import { useMemo } from 'preact/hooks';
import standardOmaySource from '../content/standard.omay.yaml?raw';
import { renderMarkdownWithCodeCopyButtons } from '../lib/markdown';

interface Props {
  markdown: string;
  className?: string;
  onNotify: (message: string) => void;
}

export default function MarkdownArticle({ markdown, className = '', onNotify }: Props) {
  const html = useMemo(() => renderMarkdownWithCodeCopyButtons(markdown), [markdown]);

  const handleClick = async (event: MouseEvent) => {
    const target = event.target as Element;
    const article = event.currentTarget as HTMLElement;

    // md内の standard.omay.yaml へのリンクは、アプリ内にファイル実体が無いため同梱テンプレートのダウンロードに置き換える
    const omayLink = target.closest<HTMLAnchorElement>('a[href$="standard.omay.yaml"]');
    if (omayLink && article.contains(omayLink)) {
      event.preventDefault();
      const blob = new Blob([standardOmaySource], { type: 'application/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'standard.omay.yaml'; anchor.click();
      URL.revokeObjectURL(url);
      onNotify('standard.omay.yaml を保存しました');
      return;
    }

    const button = target.closest<HTMLButtonElement>('[data-copy-code]');
    if (!button || !article.contains(button)) return;
    const code = button.closest('.markdown-code-block')?.querySelector('code')?.textContent;
    if (code == null) return;

    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(code);
      button.textContent = 'コピー済み';
      window.setTimeout(() => { if (button.isConnected) button.textContent = 'コピー'; }, 1200);
      onNotify('コードブロックをコピーしました');
    } catch {
      onNotify('コードブロックのコピーに失敗しました');
    }
  };

  return <article class={`schema-markdown ${className}`.trim()} onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
