'use client';

import type { NutrientDefinition } from '@/lib/nutrients';

type ColorSpectrumProps = {
  hue: number;
  nutrient: NutrientDefinition;
  onStart: () => void;
  onPreview: (hue: number) => void;
  onCommit: (hue: number) => void;
};

export function ColorSpectrum({
  hue,
  nutrient,
  onStart,
  onPreview,
  onCommit,
}: ColorSpectrumProps) {
  return (
    <section className="spectrum-section" aria-label="Color spectrum">
      <div className="spectrum-copy">
        <span>COLOR SPECTRUM</span>
        <strong style={{ color: nutrient.color }}>{nutrient.label}</strong>
      </div>
      <div className="spectrum-control">
        <div className="spectrum-track color-spectrum-track" />
        <span
          className="spectrum-indicator"
          style={{ left: `${(hue / 360) * 100}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hue)}
          aria-label="Choose a color"
          aria-valuetext={nutrient.label}
          onPointerDown={onStart}
          onPointerUp={(event) => onCommit(Number(event.currentTarget.value))}
          onPointerLeave={(event) =>
            onCommit(Number(event.currentTarget.value))
          }
          onClick={(event) => onCommit(Number(event.currentTarget.value))}
          onKeyDown={onStart}
          onKeyUp={(event) => onCommit(Number(event.currentTarget.value))}
          onBlur={(event) => onCommit(Number(event.currentTarget.value))}
          onChange={(event) => onPreview(Number(event.currentTarget.value))}
        />
      </div>
    </section>
  );
}
