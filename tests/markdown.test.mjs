import assert from 'node:assert/strict';
import test from 'node:test';
import { renderMarkdownWithCodeCopyButtons } from '../src/lib/markdown.ts';

test('各コードブロックへ本文コピー用ボタンを追加する', () => {
  const html = renderMarkdownWithCodeCopyButtons('```yaml\nmanga: {}\n```\n\n本文の `inline` コード。\n\n```text\n完了\n```');
  assert.equal((html.match(/data-copy-code/g) ?? []).length, 2);
  assert.match(html, /<code class="language-yaml">manga: \{\}\n<\/code>/);
  assert.match(html, /<code>inline<\/code>/);
});

test('段落内の単一改行を表示上の改行へ変換する', () => {
  const html = renderMarkdownWithCodeCopyButtons('一行目\n二行目');
  assert.match(html, /<p>一行目<br>二行目<\/p>/);
});
