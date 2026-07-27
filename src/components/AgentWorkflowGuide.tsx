import readmeMarkdownJa from '../content/agent-manga-generation-workflow-readme.md?raw';
import readmeMarkdownEn from '../content/agent-manga-generation-workflow-readme.en.md?raw';
import workflowMarkdownJa from '../content/agent-manga-generation-workflow.md?raw';
import workflowMarkdownEn from '../content/agent-manga-generation-workflow.en.md?raw';
import DownloadableMarkdownGuide from './DownloadableMarkdownGuide';
import type { DocsLanguage } from '../types';

interface Props {
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
}

export default function AgentWorkflowGuide({ lang, onChangeLang, onNotify }: Props) {
  const en = lang === 'en';
  return <DownloadableMarkdownGuide
    readmeMarkdown={en ? readmeMarkdownEn : readmeMarkdownJa}
    markdown={en ? workflowMarkdownEn : workflowMarkdownJa}
    eyebrow="AGENT WORKFLOW"
    title={en ? 'Agent Manga Generation Workflow' : 'エージェント漫画生成ワークフロー'}
    description={en
      ? 'Steps for an AI agent to generate and inspect a manga from OMNY and character assets.'
      : 'OMNYとキャラクター素材から漫画を生成・検品するエージェント向け手順です。'}
    fileName={en ? 'agent-manga-generation-workflow.en.md' : 'agent-manga-generation-workflow.md'}
    resourceName={en ? 'generation workflow' : '生成ワークフロー'}
    lang={lang}
    onChangeLang={onChangeLang}
    onNotify={onNotify}
  />;
}
