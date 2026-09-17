'use client';

import { spectrumNutrients, type NutrientDefinition } from '@/lib/nutrients';

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
      <div className="spectrum-labels" aria-label="Nutrients by color">
        {spectrumNutrients.map((item, index) => (
          <button
            type="button"
            key={item.key}
            className={`${item.key === nutrient.key ? 'active' : ''} ${
              index === 0 ? 'first' : ''
            } ${index === spectrumNutrients.length - 1 ? 'last' : ''}`}
            style={{
              left: `${(item.spectrumHue / 360) * 100}%`,
              color: item.color,
            }}
            aria-pressed={item.key === nutrient.key}
            onClick={() => onCommit(item.spectrumHue)}
          >
            {item.shortLabel}
          </button>
        ))}
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
