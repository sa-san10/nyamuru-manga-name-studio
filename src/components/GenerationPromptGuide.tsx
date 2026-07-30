import readmeMarkdownJa from '../content/nyamuru-manga-generation-prompt-readme.md?raw';
import readmeMarkdownEn from '../content/nyamuru-manga-generation-prompt-readme.en.md?raw';
import promptMarkdown from '../content/nyamuru-manga-generation-prompt-v10.md?raw';
import standardOmaySource from '../content/standard.omay.yaml?raw';
import DownloadableMarkdownGuide from './DownloadableMarkdownGuide';
import type { DocsLanguage } from '../types';

interface Props {
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
  onOpenMeta: () => void;
}

export default function GenerationPromptGuide({ lang, onChangeLang, onNotify, onOpenMeta }: Props) {
  const en = lang === 'en';
  return <DownloadableMarkdownGuide
    readmeMarkdown={en ? readmeMarkdownEn : readmeMarkdownJa}
    markdown={promptMarkdown}
    eyebrow="GENERATION PROMPT · NDM v10.2"
    title={en ? 'Manga Name Generation Prompt' : '漫画ネーム生成プロンプト'}
    description={en
      ? 'The full prompt (written in Japanese) that structures a story manuscript into NDM v10.2 and outputs pure name data in OMNY format. Artwork rules for image generation are managed separately as the OMAY file below.'
      : 'ストーリー原稿をNDM v10.2へ構造化し、純粋なネームデータをOMNY形式で出力するための完全版プロンプトです。画像生成向けの作画ルールは、下のOMAYファイルとして分離管理します。'}
    fileName="nyamuru-manga-generation-prompt-v10.md"
    resourceName={en ? 'generation prompt' : '漫画ネーム生成プロンプト'}
    attachments={[{
      label: en ? 'Artwork instructions (OMAY) standard template' : '画像生成指示（OMAY）標準テンプレート',
      description: en
        ? 'Drawing & staging rules (style_notes) and the layout spec (layout_spec) for turning OMNY into finished manga. Set it once in the image-generation side project instructions; per work, pass only the OMNY file.'
        : 'OMNYを漫画として描くための作画・演出ルール（style_notes）とレイアウト仕様（layout_spec）。画像生成側のプロジェクト指示に一度設定すれば、作品ごとに渡すのはOMNYファイルのみで済みます。',
      fileName: 'standard.omay.yaml',
      content: standardOmaySource,
      link: { label: en ? 'Edit and download on the 作品情報 (work info) page' : '編集とダウンロードは作品情報ページで', onClick: onOpenMeta },
    }]}
    lang={lang}
    onChangeLang={onChangeLang}
    onNotify={onNotify}
  />;
}
