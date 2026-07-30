import { Braces } from 'lucide-preact';
import schemaMarkdownJa from '../content/nyamuru-data-model-v10.md?raw';
import schemaMarkdownEn from '../content/nyamuru-data-model-v10.en.md?raw';
import DocsLangToggle from './DocsLangToggle';
import MarkdownArticle from './MarkdownArticle';
import type { DocsLanguage } from '../types';

interface Props {
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
}

export default function SchemaGuide({ lang, onChangeLang, onNotify }: Props) {
  const en = lang === 'en';
  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">Nyamuru🐱 · NDM v10.2</span><h2>Nyamuru Data Model</h2><p>{en ? 'The NDM specification and how it serializes to OMNY, in Markdown.' : 'NDMの仕様とOMNY形式へのシリアライズ方法をMarkdownで確認できます。'}</p></div>
      <div class="document-head-actions">
        <DocsLangToggle lang={lang} onChange={onChangeLang} />
        <span class="schema-source-badge"><Braces size={15} />src/content/{en ? 'nyamuru-data-model-v10.en.md' : 'nyamuru-data-model-v10.md'}</span>
      </div>
    </div>
    <div class="document-editor-body schema-markdown-wrap">
      <MarkdownArticle markdown={en ? schemaMarkdownEn : schemaMarkdownJa} onNotify={onNotify} />
    </div>
  </div>;
}
