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
    eyebrow="GENERATION PROMPT · NDM v10.2"
    title={en ? 'Manga Name Generation Prompt' : '漫画ネーム生成プロンプト'}
    description={en
      ? 'The full prompt (written in Japanese) that structures a story manuscript into NDM v10.2 and outputs pure name data in OMNY format. Artwork rules for image generation are managed separately as the OMAY file (see the generation workflow tab).'
      : 'ストーリー原稿をNDM v10.2へ構造化し、純粋なネームデータをOMNY形式で出力するための完全版プロンプトです。画像生成向けの作画ルールは、OMAYファイルとして分離管理します（生成ワークフロータブ参照）。'}
    fileName="nyamuru-manga-generation-prompt-v10.md"
    resourceName={en ? 'generation prompt' : '漫画ネーム生成プロンプト'}
    lang={lang}
    onChangeLang={onChangeLang}
    onNotify={onNotify}
  />;
}
