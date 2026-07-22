import page1 from '../assets/nyamurutan-manga-p1.webp?url';
import page2 from '../assets/nyamurutan-manga-p2.webp?url';

// サンプル漫画画像の共有モジュール。データURIの文字列定数を直接exportすると、
// スタンドアロン版（単一HTML化）のミニファイ時に使用箇所ごとインライン展開されて
// 画像が二重に埋め込まれるため、オブジェクトのプロパティ経由で参照させる
export const sampleMangaPages = { page1, page2 };
