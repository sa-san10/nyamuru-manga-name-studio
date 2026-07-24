import { ArrowDown, ArrowRight, Bot, Cat, Download, FilePlus2, LayoutPanelTop, Sparkles, Workflow } from 'lucide-preact';
import AskAiBlock from './AskAiBlock';
import type { WorkspaceTab } from '../types';

interface Props {
  onNavigate: (tab: WorkspaceTab) => void;
}

const STEPS: {
  number: string;
  title: string;
  optional?: boolean;
  tool: string;
  tasks: string[];
  output: string;
  tab: WorkspaceTab;
  tabLabel: string;
  icon: typeof Sparkles;
}[] = [
  {
    number: '1',
    title: 'LLMでネームを作る',
    tool: '「生成プロンプト」タブの完全版プロンプト ＋ お好みのLLM（Claude・ChatGPTなど）',
    tasks: [
      '「生成プロンプト」タブのプロンプト全文をコピーして、LLMのプロジェクト指示（またはシステム指示）に設定する',
      'テーマ・あらすじ・台本と、ページ数や作風などの希望を伝える',
      'LLMが出力したOMNY形式のネームを .yaml ファイルとして保存する',
    ],
    output: 'OMNY形式のネームファイル（.yaml）',
    tab: 'prompt',
    tabLabel: '生成プロンプトを開く',
    icon: Sparkles,
  },
  {
    number: '2',
    title: 'このアプリで確認・調整する',
    optional: true,
    tool: 'Nyamuru🐱 Manga Name Studio（このアプリ）',
    tasks: [
      'ヘッダーの「読み込み」からSTEP 1のOMNYファイルを開く',
      '「ネーム」タブでコマ割り・人物・フキダシの配置をドラッグで調整し、セリフや演出を手直しする',
      'NDM検査でルール違反がないか確かめて、「書き出し」からOMNYファイルを保存し直す',
    ],
    output: '調整済みのOMNYファイル（.yaml）',
    tab: 'storyboard',
    tabLabel: 'ネームを開く',
    icon: LayoutPanelTop,
  },
  {
    number: '3',
    title: '画像生成AIで漫画にする',
    tool: '「生成ワークフロー」タブのワークフロー ＋ キャラ・背景のリファレンス画像 ＋ 画像生成できるAIエージェント（GPT Workなど）',
    tasks: [
      '「生成ワークフロー」タブのワークフローを、エージェントが参照できる場所に配置してプロジェクト指示を設定する',
      'OMNYファイルとリファレンス画像を渡して、漫画生成を依頼する',
      'エージェントがページ単位で作画・検品・再生成して、完成画像を納品する',
    ],
    output: 'ページごとの完成漫画画像（PNG）',
    tab: 'workflow',
    tabLabel: '生成ワークフローを開く',
    icon: Workflow,
  },
];

const OVERVIEW = ['テーマ・原稿', 'ネーム（OMNY）', '調整済みネーム', '完成漫画画像'];

// スタンドアロン版（file://起動）では配信元サイトのURLが確定しないため、
// ダウンロードボタンは非表示にし、NOTICESは同梱ファイルへの相対リンクにする
const IS_STANDALONE = Boolean(import.meta.env.PUBLIC_STANDALONE);
const STANDALONE_URL = '/standalone/nyamuru-manga-name-studio.html';
const NOTICES_URL = IS_STANDALONE ? './THIRD_PARTY_NOTICES.txt' : '/standalone/THIRD_PARTY_NOTICES.txt';

export default function HowToGuide({ onNavigate }: Props) {
  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">HOW TO USE · MANGA WORKFLOW</span><h2>使い方</h2><p>LLMと画像生成AIをつないで、テーマから完成漫画まで進む3ステップのワークフローです。このアプリは真ん中に立って、ネーム（OMNY形式）の確認・調整を受け持ちます。</p></div>
    </div>
    <div class="document-editor-body">
      <div class="howto-flow">
        <section class="howto-ask-ai">
          <h3><Bot size={15} aria-hidden="true" />とりあえず、あなたの創作パートナーのAIに聞いてみる</h3>
          <p>下の質問文をコピーして、いつも使っているAI（Claude・ChatGPTなど）に貼り付ければ、このアプリのことを案内してもらえます。</p>
          <AskAiBlock />
        </section>
        <div class="howto-overview" aria-label="ワークフロー全体像">
          {OVERVIEW.map((label, index) => <>
            {index > 0 && <ArrowRight class="howto-overview-arrow" size={14} aria-hidden="true" />}
            <span class={`howto-overview-chip ${index === OVERVIEW.length - 1 ? 'is-goal' : ''}`} key={label}>{label}</span>
          </>)}
        </div>

        {STEPS.map((step, index) => <>
          {index > 0 && <div class="howto-arrow" aria-hidden="true"><ArrowDown size={17} /><span>{STEPS[index - 1].output}</span></div>}
          <section class="howto-step" key={step.number}>
            <div class="howto-step-head">
              <span class="howto-step-number">STEP {step.number}</span>
              <h3>{step.title}</h3>
              {step.optional && <span class="howto-optional-badge">任意（スキップ可）</span>}
            </div>
            <p class="howto-tool"><Bot size={13} aria-hidden="true" />使うもの：{step.tool}</p>
            <ol class="howto-tasks">
              {step.tasks.map((task) => <li key={task}>{task}</li>)}
            </ol>
            <div class="howto-step-footer">
              <span class="howto-output">できあがり：<strong>{step.output}</strong></span>
              <button type="button" class="secondary-button" onClick={() => onNavigate(step.tab)}><step.icon size={15} />{step.tabLabel}</button>
            </div>
          </section>
        </>)}

        <h4 class="howto-tips-title">ワンポイントアドバイス</h4>
        <aside class="howto-tip">
          <FilePlus2 size={16} aria-hidden="true" />
          <div>
            <strong>LLMを使わずにOMNYを一から作ることもできます</strong>
            <p>Nyamuru🐱 Manga Name Studioがあれば、STEP 1を飛ばしてゼロからのネーム作りも可能です。ヘッダーの「新規作成」でコマ割りパターンを選び、「ネーム」タブでコマ・人物・フキダシを配置して、セリフや演出を書き込めば、そのままSTEP 3へ渡せるOMNYファイルを書き出せます。</p>
          </div>
        </aside>
        <aside class="howto-tip">
          <Cat size={16} aria-hidden="true" />
          <div>
            <strong>まずは手ぶらで試すなら</strong>
            <p>このアプリに入っているサンプル漫画をヘッダーの「書き出し」でOMNYファイルにして、「にゃむるたん」タブの立ち絵画像と一緒にエージェントへ渡せば、STEP 3だけをすぐ体験できます。</p>
          </div>
        </aside>
        <aside class="howto-tip">
          <Download size={16} aria-hidden="true" />
          <div>
            <strong>スタンドアロン版もあります</strong>
            <p>CSS・JS・アイコンまで全部入りの単一HTMLファイル版です。ダウンロードしたファイルをダブルクリックするだけで、サーバー不要・オフラインで起動します。USBメモリで持ち運んだり、ネットのない環境でネームを編集したいときにどうぞ。再配布するときは <a href={NOTICES_URL} download>THIRD_PARTY_NOTICES.txt</a> を一緒に添付してください。</p>
            {!IS_STANDALONE && <a class="secondary-button howto-tip-download" href={STANDALONE_URL} download="nyamuru-manga-name-studio.html"><Download size={15} />スタンドアロン版をダウンロード</a>}
          </div>
        </aside>
      </div>
    </div>
  </div>;
}
