'use client';

import type {
  NutrientDefinition,
  NutrientKey,
  SpectrumSegment,
} from '@/lib/nutrients';

type ColorSpectrumProps = {
  position: number;
  nutrient: NutrientDefinition;
  segments: readonly SpectrumSegment[];
  onStart: () => void;
  onPreview: (position: number) => void;
  onCommit: (position: number) => void;
  onSelect: (nutrient: NutrientKey) => void;
};

export function ColorSpectrum({
  position,
  nutrient,
  segments,
  onStart,
  onPreview,
  onCommit,
  onSelect,
}: ColorSpectrumProps) {
  const spectrumGradient = `linear-gradient(90deg, ${segments
    .flatMap((segment) => [
      `${segment.nutrient.color} ${segment.start}%`,
      `${segment.nutrient.color} ${segment.end}%`,
    ])
    .join(', ')})`;

  return (
    <section className="spectrum-section" aria-label="Nutrient spectrum">
      <div className="spectrum-labels" aria-label="Nutrients by color">
        {segments.map((segment) => (
          <button
            type="button"
            key={segment.nutrient.key}
            className={
              segment.nutrient.key === nutrient.key ? 'active' : undefined
            }
            style={{
              left: `${segment.center}%`,
              color: segment.nutrient.color,
            }}
            aria-pressed={segment.nutrient.key === nutrient.key}
            onClick={() => onSelect(segment.nutrient.key)}
          >
            {segment.nutrient.shortLabel}
          </button>
        ))}
      </div>
      <div className="spectrum-control">
        <div
          className="spectrum-track color-spectrum-track"
          style={{ background: spectrumGradient }}
        />
        <span
          className="spectrum-indicator"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(position * 10)}
          aria-label="Choose a nutrient color"
          aria-valuetext={nutrient.label}
          onPointerDown={onStart}
          onPointerUp={(event) =>
            onCommit(Number(event.currentTarget.value) / 10)
          }
          onPointerLeave={(event) => {
            if (event.buttons) {
              onCommit(Number(event.currentTarget.value) / 10);
            }
          }}
          onKeyDown={onStart}
          onKeyUp={(event) => onCommit(Number(event.currentTarget.value) / 10)}
          onBlur={(event) => onCommit(Number(event.currentTarget.value) / 10)}
          onChange={(event) =>
            onPreview(Number(event.currentTarget.value) / 10)
          }
        />
      </div>
    </section>
  );
}
