import type { FigureSize } from '../types';

interface Props {
  size: FigureSize;
}

// size パラメータを丸（頭）とピル型（胴・腕・脚）の組み合わせで表すピクトグラム。
// waist-up / bust-up は viewBox の下端クロップで胴の切れ目（フラットな下端）を表現する。
// viewBox は図形の外接範囲ぴったりに取り、bbox いっぱいに meet フィットさせる
const VIEW_BOXES: Record<FigureSize, string> = {
  full: '11.5 0.5 41 99',
  'waist-up': '11.5 0.5 41 49.5',
  'bust-up': '15 0.5 34 33.5',
  face: '1.5 1.5 33 33',
};

export default function FigureSizeSvg({ size }: Props) {
  return <svg class={`figure-size-svg figure-size-${size}`} viewBox={VIEW_BOXES[size]} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    {size === 'face' && <circle cx="18" cy="18" r="16.5" />}
    {size === 'bust-up' && <>
      <circle cx="32" cy="11" r="10.5" />
      <rect x="15" y="25" width="34" height="30" rx="15" />
    </>}
    {(size === 'full' || size === 'waist-up') && <>
      <circle cx="32" cy="10" r="9.5" />
      <rect x="20" y="22" width="24" height="34" rx="12" />
      <rect x="11.5" y="23.5" width="7" height="28" rx="3.5" />
      <rect x="45.5" y="23.5" width="7" height="28" rx="3.5" />
    </>}
    {size === 'full' && <>
      <rect x="21.5" y="53" width="9" height="46.5" rx="4.5" />
      <rect x="33.5" y="53" width="9" height="46.5" rx="4.5" />
    </>}
  </svg>;
}
