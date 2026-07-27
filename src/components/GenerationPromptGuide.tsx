import readmeMarkdownJa from '../content/nyamuru-manga-generation-prompt-readme.md?raw';
import readmeMarkdownEn from '../content/nyamuru-manga-generation-prompt-readme.en.md?raw';
import promptMarkdown from '../content/nyamuru-manga-generation-prompt-v10.md?raw';
import DownloadableMarkdownGuide from './DownloadableMarkdownGuide';
import type { DocsLanguage } from '../types';

interface Props {
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
}

export default function GenerationPromptGuide({ lang, onChangeLang, onNotify }: Props) {
  const en = lang === 'en';
  return <DownloadableMarkdownGuide
    readmeMarkdown={en ? readmeMarkdownEn : readmeMarkdownJa}
    markdown={promptMarkdown}
    eyebrow="GENERATION PROMPT · NDM v10"
    title={en ? 'Manga Name Generation Prompt' : '漫画ネーム生成プロンプト'}
    description={en
      ? 'The full prompt (written in Japanese) that structures a story manuscript into NDM v10 and outputs it in OMNY format.'
      : 'ストーリー原稿をNDM v10へ構造化し、OMNY形式で出力するための完全版プロンプトです。'}
    fileName="nyamuru-manga-generation-prompt-v10.md"
    resourceName={en ? 'generation prompt' : '漫画ネーム生成プロンプト'}
    lang={lang}
    onChangeLang={onChangeLang}
    onNotify={onNotify}
  />;
}
