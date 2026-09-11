'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- the custom wheel is keyboard accessible */

import { Slider } from '@/components/ui/slider';
import { hex, hslToRgb, type RGB } from '@/lib/color';

type ColorControlsProps = {
  hsl: RGB;
  previewHue: number | null;
  onPreviewHue: (hue: number | null) => void;
  onColorChange: (color: RGB) => void;
  onColorCommit: () => void;
  onToneChange: (color: RGB) => void;
  onToneCommit: () => void;
};

const wheelHues = [0, 60, 120, 180, 240, 300, 360];

export function ColorControls({
  hsl,
  previewHue,
  onPreviewHue,
  onColorChange,
  onColorCommit,
  onToneChange,
  onToneCommit,
}: ColorControlsProps) {
  const committedColor = hex(hslToRgb(...hsl));
  const displayHue = previewHue ?? hsl[0];
  const displayColor = hex(hslToRgb(displayHue, hsl[1], hsl[2]));
  const wheelBackground = `conic-gradient(from 90deg, ${wheelHues
    .map((hue) => `hsl(${hue} ${hsl[1]}% ${hsl[2]}%)`)
    .join(', ')})`;

  const pointerHue = (event: {
    currentTarget: HTMLDivElement;
    clientX: number;
    clientY: number;
  }) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  const changeHueFromKey = (key: string, shiftKey: boolean) => {
    if (
      ![
        'ArrowRight',
        'ArrowUp',
        'ArrowLeft',
        'ArrowDown',
        'Home',
        'End',
      ].includes(key)
    ) {
      return;
    }

    const direction = ['ArrowRight', 'ArrowUp'].includes(key) ? 1 : -1;
    const step = shiftKey ? 10 : 1;
    const hue =
      key === 'Home'
        ? 0
        : key === 'End'
          ? 359
          : (hsl[0] + direction * step + 360) % 360;
    onColorChange([hue, hsl[1], hsl[2]]);
    onColorCommit();
  };

  return (
    <div className="color-panel">
      <div className="wheel-wrap">
        <div
          className="color-wheel ring-wheel"
          role="slider"
          tabIndex={0}
          aria-label="Color hue"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={Math.round(hsl[0])}
          aria-valuetext={`${Math.round(hsl[0])} degrees, ${committedColor}`}
          style={{ background: wheelBackground }}
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse') onPreviewHue(pointerHue(event));
          }}
          onPointerLeave={() => onPreviewHue(null)}
          onClick={(event) => {
            const hue = pointerHue(event);
            onPreviewHue(null);
            onColorChange([hue, hsl[1], hsl[2]]);
            onColorCommit();
          }}
          onKeyDown={(event) => {
            if (
              [
                'ArrowRight',
                'ArrowUp',
                'ArrowLeft',
                'ArrowDown',
                'Home',
                'End',
              ].includes(event.key)
            ) {
              event.preventDefault();
              changeHueFromKey(event.key, event.shiftKey);
            }
          }}
        >
          <span
            className="wheel-cursor"
            style={{
              left: `${50 + 39 * Math.cos((displayHue * Math.PI) / 180)}%`,
              top: `${50 + 39 * Math.sin((displayHue * Math.PI) / 180)}%`,
              background: displayColor,
            }}
          />
        </div>

        <div className="wheel-center">
          <i style={{ background: displayColor }} />
          <span>{displayColor}</span>
        </div>
      </div>

      <div className="tone-controls">
        <span>Lightness</span>
        <Slider
          aria-label="Color lightness"
          min={8}
          max={95}
          value={[hsl[2]]}
          onValueChange={(value) => {
            onToneChange([
              hsl[0],
              hsl[1],
              Array.isArray(value) ? value[0] : value,
            ]);
          }}
          onValueCommitted={onToneCommit}
        />
        <span>{Math.round(hsl[2])}%</span>
      </div>

      <div className="tone-controls saturation">
        <span>Saturation</span>
        <Slider
          aria-label="Color saturation"
          min={0}
          max={100}
          value={[hsl[1]]}
          onValueChange={(value) => {
            onToneChange([
              hsl[0],
              Array.isArray(value) ? value[0] : value,
              hsl[2],
            ]);
          }}
          onValueCommitted={onToneCommit}
        />
        <span>{Math.round(hsl[1])}%</span>
      </div>
    </div>
  );
}
