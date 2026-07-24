import type { BubbleShape } from '../types';
import { EXTRACTED_BUBBLE_ASSETS } from '../data/extractedBubbleAssets';

interface Props {
  shape?: BubbleShape;
}

export default function BubbleShapeSvg({ shape = 'normal' }: Props) {
  if (shape === 'handwritten') return null;
  const extracted = shape in EXTRACTED_BUBBLE_ASSETS
    ? EXTRACTED_BUBBLE_ASSETS[shape as keyof typeof EXTRACTED_BUBBLE_ASSETS]
    : null;
  return <svg class={`bubble-shape-svg bubble-shape-${shape}`} viewBox={extracted?.viewBox ?? '0 0 100 100'} preserveAspectRatio="none" aria-hidden="true">
    {shape === 'normal' && <circle class="bubble-svg-surface" cx="50" cy="50" r="50" />}

    {shape === 'square' && <rect class="bubble-svg-surface" x="0" y="0" width="100" height="100" rx="1" />}

    {shape === 'caption' && <>
      <rect class="bubble-svg-surface" x="0" y="0" width="100" height="100" rx="1" />
      <path class="bubble-svg-detail" d="M5 6H95M5 94H95" />
    </>}

    {extracted?.type === 'path' && <path
      class="bubble-svg-source-surface"
      d={extracted.d}
      strokeLinejoin={extracted.strokeLinejoin}
      strokeMiterlimit={extracted.strokeMiterlimit}
      strokeDasharray={extracted.strokeDasharray || undefined}
    />}
    {extracted?.type === 'ellipse' && <ellipse
      class="bubble-svg-source-surface"
      cx={extracted.cx}
      cy={extracted.cy}
      rx={extracted.rx}
      ry={extracted.ry}
      strokeLinejoin={extracted.strokeLinejoin}
      strokeMiterlimit={extracted.strokeMiterlimit}
      strokeDasharray={extracted.strokeDasharray || undefined}
    />}

  </svg>;
}
