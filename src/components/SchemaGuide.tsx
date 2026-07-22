import { Braces } from 'lucide-preact';
import schemaMarkdown from '../content/nyamuru-data-model-v10.md?raw';
import MarkdownArticle from './MarkdownArticle';

interface Props {
  onNotify: (message: string) => void;
}

export default function SchemaGuide({ onNotify }: Props) {
  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">Nyamuru🐱 · NDM v10</span><h2>Nyamuru Data Model</h2><p>NDMの仕様とOMNY形式へのシリアライズ方法をMarkdownで確認できます。</p></div>
      <span class="schema-source-badge"><Braces size={15} />src/content/nyamuru-data-model-v10.md</span>
    </div>
    <div class="document-editor-body schema-markdown-wrap">
      <MarkdownArticle markdown={schemaMarkdown} onNotify={onNotify} />
    </div>
  </div>;
}
