import type { FigureSize } from '../types';

interface Props {
  size: FigureSize;
}

// size パラメータを丸（頭）とピル型（胴・腕・脚）の組み合わせで表すピクトグラム。
// waist-up / bust-up は viewBox の下端クロップで胴の切れ目（フラットな下端）を表現する。
// hand / foot は体の一部そのもの、part は viewBox の両端クロップで「体の断片」を表現する。
// viewBox は図形の外接範囲ぴったりに取り、bbox いっぱいに meet フィットさせる
const VIEW_BOXES: Record<FigureSize, string> = {
  full: '11.5 0.5 41 99',
  'waist-up': '11.5 0.5 41 49.5',
  'bust-up': '15 0.5 34 33.5',
  face: '1.5 1.5 33 33',
  hand: '2 3 35.5 41',
  foot: '2 0 30 35',
  part: '4 6 36 34',
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
    {size === 'hand' && <>
      <rect x="10" y="24" width="26" height="20" rx="9" />
      <rect x="10.5" y="8" width="6" height="19" rx="3" />
      <rect x="17.5" y="3" width="6" height="24" rx="3" />
      <rect x="24.5" y="5" width="6" height="22" rx="3" />
      <rect x="31.5" y="10" width="6" height="17" rx="3" />
      <rect x="2" y="27" width="11" height="6.5" rx="3.25" />
    </>}
    {size === 'foot' && <>
      <rect x="22" y="0" width="10" height="24" rx="5" />
      <rect x="2" y="22" width="30" height="13" rx="6.5" />
    </>}
    {size === 'part' && <rect x="-8" y="15.5" width="60" height="15" rx="7.5" transform="rotate(-24 22 23)" />}
  </svg>;
}
