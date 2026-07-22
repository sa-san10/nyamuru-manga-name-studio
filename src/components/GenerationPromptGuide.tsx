import readmeMarkdown from '../content/nyamuru-manga-generation-prompt-readme.md?raw';
import promptMarkdown from '../content/nyamuru-manga-generation-prompt-v10.md?raw';
import DownloadableMarkdownGuide from './DownloadableMarkdownGuide';

interface Props {
  onNotify: (message: string) => void;
}

export default function GenerationPromptGuide({ onNotify }: Props) {
  return <DownloadableMarkdownGuide
    readmeMarkdown={readmeMarkdown}
    markdown={promptMarkdown}
    eyebrow="GENERATION PROMPT · NDM v10"
    title="漫画ネーム生成プロンプト"
    description="ストーリー原稿をNDM v10へ構造化し、OMNY形式で出力するための完全版プロンプトです。"
    fileName="nyamuru-manga-generation-prompt-v10.md"
    resourceName="漫画ネーム生成プロンプト"
    onNotify={onNotify}
  />;
}
