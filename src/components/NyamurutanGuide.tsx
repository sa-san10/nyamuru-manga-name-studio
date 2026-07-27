import { ClipboardCopy, Download } from 'lucide-preact';
import settingMarkdownJa from '../content/nyamurutan-character-setting.md?raw';
import settingMarkdownEn from '../content/nyamurutan-character-setting.en.md?raw';
import originalImageUrl from '../assets/nyamurutan-original.webp?url';
import referenceImageUrl from '../assets/nyamurutan-reference.webp?url';
import { sampleMangaPages } from '../lib/sampleMangaImages';
import DocsLangToggle from './DocsLangToggle';
import MarkdownArticle from './MarkdownArticle';
import type { DocsLanguage } from '../types';

interface Props {
  lang: DocsLanguage;
  onChangeLang: (lang: DocsLanguage) => void;
  onNotify: (message: string) => void;
}

const IMAGES = [
  {
    url: originalImageUrl,
    fileName: 'にゃむるたん-手書き原画.webp',
    title: { ja: '手書き原画', en: 'Hand-drawn original' },
    caption: {
      ja: 'sa-san10による手書きデザイン原画。原寸のまま収録しています。',
      en: 'The original hand-drawn design by sa-san10, included at its original size.',
    },
    alt: {
      ja: 'にゃむるたんの手書きキャラクターデザイン原画',
      en: "Nyamuru-tan's hand-drawn character design original",
    },
  },
  {
    url: referenceImageUrl,
    fileName: 'にゃむるたん-リファレンス.webp',
    title: { ja: '生成リファレンス', en: 'Generation reference' },
    caption: {
      ja: '原画をリファインした、漫画生成のキャラクターリファレンス向け画像。',
      en: 'A refined version of the original, made as a character reference for manga generation.',
    },
    alt: {
      ja: 'にゃむるたんの漫画生成用リファレンス画像',
      en: "Nyamuru-tan's reference image for manga generation",
    },
  },
];

export default function NyamurutanGuide({ lang, onChangeLang, onNotify }: Props) {
  const en = lang === 'en';
  const settingMarkdown = en ? settingMarkdownEn : settingMarkdownJa;

  const copyMarkdown = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(settingMarkdown);
      onNotify(en ? 'Copied the character setting Markdown' : 'キャラクター設定のMarkdownをコピーしました');
    } catch {
      onNotify(en ? 'Failed to copy the character setting' : 'キャラクター設定のコピーに失敗しました');
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([settingMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = en ? 'nyamurutan-character-setting.en.md' : 'にゃむるたん-キャラクター設定.md';
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify(en ? 'Saved the character setting Markdown' : 'キャラクター設定のMarkdownを保存しました');
  };

  const downloadImage = (image: (typeof IMAGES)[number]) => {
    const anchor = document.createElement('a');
    anchor.href = image.url;
    anchor.download = image.fileName;
    anchor.click();
    onNotify(en ? `Saved the ${image.title.en} image` : `${image.title.ja}の画像を保存しました`);
  };

  const copyLabel = en ? 'Copy the character setting' : 'キャラクター設定をコピー';
  const downloadLabel = en ? 'Download the character setting Markdown' : 'キャラクター設定のMarkdownをダウンロード';

  return <div class="document-editor">
    <div class="document-editor-head">
      <div><span class="eyebrow">Nyamuru🐱 · {en ? 'Official mascot' : '公式マスコット'} · CC BY 4.0</span><h2>{en ? 'Nyamuru-tan' : 'にゃむるたん'}</h2><p>{en
        ? 'Fairy of the NDM data model, official mascot, and star of the sample manga. Both design and setting are CC BY 4.0 — anyone may use her freely with the credit "にゃむるたん © sa-san10 / CC BY 4.0".'
        : 'NDMデータモデルの妖精にして公式マスコット兼サンプル漫画の主人公。デザイン・設定ともCC BY 4.0で、「にゃむるたん © sa-san10 / CC BY 4.0」のクレジットを書けば誰でも自由に使えます。'}</p></div>
      <div class="document-head-actions markdown-resource-actions">
        <DocsLangToggle lang={lang} onChange={onChangeLang} />
        <button type="button" class="secondary-button" title={copyLabel} aria-label={copyLabel} onClick={copyMarkdown}><ClipboardCopy size={16} /><span>{en ? 'Copy setting' : '設定をコピー'}</span></button>
        <button type="button" class="primary-button" title={downloadLabel} aria-label={downloadLabel} onClick={downloadMarkdown}><Download size={16} /><span>{en ? 'Save setting' : '設定を保存'}</span></button>
      </div>
    </div>
    <div class="document-editor-body schema-markdown-wrap">
      <div class="nyamurutan-gallery">
        {IMAGES.map((image) => <figure class="nyamurutan-figure" key={image.fileName}>
          <div class="nyamurutan-figure-frame">
            <img src={image.url} alt={en ? image.alt.en : image.alt.ja} loading="lazy" />
            <button type="button" class="nyamurutan-image-download" title={en ? `Download the ${image.title.en}` : `${image.title.ja}をダウンロード`} aria-label={en ? `Download the ${image.title.en}` : `${image.title.ja}をダウンロード`} onClick={() => downloadImage(image)}><Download size={15} /><span>{en ? 'Download' : 'ダウンロード'}</span></button>
          </div>
          <figcaption><strong>{en ? image.title.en : image.title.ja}</strong><span>{en ? image.caption.en : image.caption.ja}</span></figcaption>
        </figure>)}
        <figure class="nyamurutan-figure nyamurutan-manga-spread">
          <div class="nyamurutan-spread-frame">
            <img src={sampleMangaPages.page2} alt={en ? 'Page 2 of the sample manga "The Fairy Who Shows Up Uninvited, Nyamuru-tan"' : 'サンプル漫画『押しかけ妖精にゃむるたん』2ページ目'} loading="lazy" />
            <img src={sampleMangaPages.page1} alt={en ? 'Page 1 of the sample manga "The Fairy Who Shows Up Uninvited, Nyamuru-tan"' : 'サンプル漫画『押しかけ妖精にゃむるたん』1ページ目'} loading="lazy" />
          </div>
          <figcaption><strong>{en ? 'Sample manga: "The Fairy Who Shows Up Uninvited, Nyamuru-tan"' : 'サンプル漫画『押しかけ妖精にゃむるたん』'}</strong><span>{en
            ? 'Two finished pages made by running the sample OMNY through the generation workflow. The manga is right-bound, so page 1 is on the right of the spread.'
            : 'サンプルOMNYを生成ワークフローで画像化した完成2ページ。右綴じなので、見開きの右が1ページ目です。'}</span></figcaption>
        </figure>
      </div>
      <MarkdownArticle markdown={settingMarkdown} className="markdown-resource-document" onNotify={onNotify} />
    </div>
  </div>;
}
