import { ClipboardCopy, Download } from 'lucide-preact';
import settingMarkdown from '../content/nyamurutan-character-setting.md?raw';
import originalImageUrl from '../assets/nyamurutan-original.webp?url';
import referenceImageUrl from '../assets/nyamurutan-reference.webp?url';
import { sampleMangaPages } from '../lib/sampleMangaImages';
import MarkdownArticle from './MarkdownArticle';

interface Props {
  onNotify: (message: string) => void;
}

const IMAGES = [
  {
    url: originalImageUrl,
    fileName: 'にゃむるたん-手書き原画.webp',
    title: '手書き原画',
    caption: 'sa-san10による手書きデザイン原画。原寸のまま収録しています。',
    alt: 'にゃむるたんの手書きキャラクターデザイン原画',
  },
  {
    url: referenceImageUrl,
    fileName: 'にゃむるたん-リファレンス.webp',
    title: '生成リファレンス',
    caption: '原画をリファインした、漫画生成のキャラクターリファレンス向け画像。',
    alt: 'にゃむるたんの漫画生成用リファレンス画像',
  },
];

export default function NyamurutanGuide({ onNotify }: Props) {
  const copyMarkdown = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(settingMarkdown);
      onNotify('キャラクター設定のMarkdownをコピーしました');
    } catch {
      onNotify('キャラクター設定のコピーに失敗しました');
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([settingMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'にゃむるたん-キャラクター設定.md';
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify('キャラクター設定のMarkdownを保存しました');
  };

  const downloadImage = (image: (typeof IMAGES)[number]) => {
    const anchor = document.createElement('a');
    anchor.href = image.url;
    anchor.download = image.fileName;
    anchor.click();
    onNotify(`${image.title}の画像を保存しました`);
  };

  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">Nyamuru🐱 · 公式マスコット · CC BY 4.0</span><h2>にゃむるたん</h2><p>NDMデータモデルの妖精にして公式マスコット兼サンプル漫画の主人公。デザイン・設定ともCC BY 4.0で、「にゃむるたん © sa-san10 / CC BY 4.0」のクレジットを書けば誰でも自由に使えます。</p></div>
      <div class="document-head-actions markdown-resource-actions">
        <button type="button" class="secondary-button" title="キャラクター設定をコピー" aria-label="キャラクター設定をコピー" onClick={copyMarkdown}><ClipboardCopy size={16} /><span>設定をコピー</span></button>
        <button type="button" class="primary-button" title="キャラクター設定のMarkdownをダウンロード" aria-label="キャラクター設定のMarkdownをダウンロード" onClick={downloadMarkdown}><Download size={16} /><span>設定を保存</span></button>
      </div>
    </div>
    <div class="document-editor-body schema-markdown-wrap">
      <div class="nyamurutan-gallery">
        {IMAGES.map((image) => <figure class="nyamurutan-figure" key={image.fileName}>
          <div class="nyamurutan-figure-frame">
            <img src={image.url} alt={image.alt} loading="lazy" />
            <button type="button" class="nyamurutan-image-download" title={`${image.title}をダウンロード`} aria-label={`${image.title}をダウンロード`} onClick={() => downloadImage(image)}><Download size={15} /><span>ダウンロード</span></button>
          </div>
          <figcaption><strong>{image.title}</strong><span>{image.caption}</span></figcaption>
        </figure>)}
        <figure class="nyamurutan-figure nyamurutan-manga-spread">
          <div class="nyamurutan-spread-frame">
            <img src={sampleMangaPages.page2} alt="サンプル漫画『押しかけ妖精にゃむるたん』2ページ目" loading="lazy" />
            <img src={sampleMangaPages.page1} alt="サンプル漫画『押しかけ妖精にゃむるたん』1ページ目" loading="lazy" />
          </div>
          <figcaption><strong>サンプル漫画『押しかけ妖精にゃむるたん』</strong><span>サンプルOMNYを生成ワークフローで画像化した完成2ページ。右綴じなので、見開きの右が1ページ目です。</span></figcaption>
        </figure>
      </div>
      <MarkdownArticle markdown={settingMarkdown} className="markdown-resource-document" onNotify={onNotify} />
    </div>
  </div>;
}
