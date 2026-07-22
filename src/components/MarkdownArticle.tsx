import { useMemo } from 'preact/hooks';
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
    const button = target.closest<HTMLButtonElement>('[data-copy-code]');
    const article = event.currentTarget as HTMLElement;
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
