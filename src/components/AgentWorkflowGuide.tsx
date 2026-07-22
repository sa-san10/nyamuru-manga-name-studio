import readmeMarkdown from '../content/agent-manga-generation-workflow-readme.md?raw';
import workflowMarkdown from '../content/agent-manga-generation-workflow.md?raw';
import DownloadableMarkdownGuide from './DownloadableMarkdownGuide';

interface Props {
  onNotify: (message: string) => void;
}

export default function AgentWorkflowGuide({ onNotify }: Props) {
  return <DownloadableMarkdownGuide
    readmeMarkdown={readmeMarkdown}
    markdown={workflowMarkdown}
    eyebrow="AGENT WORKFLOW"
    title="エージェント漫画生成ワークフロー"
    description="OMNYとキャラクター素材から漫画を生成・検品するエージェント向け手順です。"
    fileName="agent-manga-generation-workflow.md"
    resourceName="生成ワークフロー"
    onNotify={onNotify}
  />;
}
