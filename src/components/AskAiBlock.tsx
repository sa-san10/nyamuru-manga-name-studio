import { useEffect, useRef, useState } from 'preact/hooks';
import { Check, Copy } from 'lucide-preact';

export const REPO_URL = 'https://github.com/sa-san10/nyamuru-manga-name-studio';

const ASK_AI_TEXT = `このリポジトリについて教えて！\n${REPO_URL}`;

// 「AIに聞いてみる」定型文のコードブロック＋コピーボタン。案内ダイアログと使い方ページで共用
export default function AskAiBlock() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ASK_AI_TEXT);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard非対応環境ではテキストを選択してコピーしてもらう */ }
  };

  return <div class="ask-ai-block">
    <pre>{ASK_AI_TEXT}</pre>
    <button type="button" onClick={copy} aria-live="polite">
      {copied ? <><Check size={12} />コピーしました</> : <><Copy size={12} />コピー</>}
    </button>
  </div>;
}
