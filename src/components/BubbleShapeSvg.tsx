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
    {shape === 'normal' && <circle class="bubble-svg-surface" cx="50" cy="50" r="45" />}

    {shape === 'square' && <rect class="bubble-svg-surface" x="5" y="5" width="90" height="90" rx="1" />}

    {shape === 'caption' && <>
      <rect class="bubble-svg-surface" x="4" y="7" width="92" height="86" rx="1" />
      <path class="bubble-svg-detail" d="M9 13H91M9 87H91" />
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
