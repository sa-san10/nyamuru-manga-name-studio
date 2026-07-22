import { marked } from 'marked';

export function renderMarkdownWithCodeCopyButtons(markdown: string): string {
  const html = marked.parse(markdown, { gfm: true, breaks: true }) as string;
  return html.replace(
    /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
    (_match, attributes: string, code: string) => `<div class="markdown-code-block"><button type="button" class="markdown-code-copy" data-copy-code aria-label="コードブロックをコピー">コピー</button><pre><code${attributes}>${code}</code></pre></div>`,
  );
}
