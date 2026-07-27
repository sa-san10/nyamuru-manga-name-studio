import type { DocsLanguage } from '../types';

interface Props {
  lang: DocsLanguage;
  onChange: (lang: DocsLanguage) => void;
}

export default function DocsLangToggle({ lang, onChange }: Props) {
  return <div class="docs-lang-toggle" role="group" aria-label="ドキュメント言語 / Document language">
    <button type="button" class={lang === 'ja' ? 'is-active' : ''} aria-pressed={lang === 'ja'} onClick={() => onChange('ja')}>JP</button>
    <button type="button" class={lang === 'en' ? 'is-active' : ''} aria-pressed={lang === 'en'} onClick={() => onChange('en')}>EN</button>
  </div>;
}
