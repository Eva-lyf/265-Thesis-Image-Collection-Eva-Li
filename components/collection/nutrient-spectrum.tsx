'use client';

import { nutrientKeys, nutrients, type NutrientKey } from '@/lib/nutrients';

type NutrientSpectrumProps = {
  value: NutrientKey;
  onChange: (nutrient: NutrientKey) => void;
};

export function NutrientSpectrum({ value, onChange }: NutrientSpectrumProps) {
  const activeIndex = nutrientKeys.indexOf(value);
  const active = nutrients[activeIndex];
  const gradient = `linear-gradient(90deg, ${nutrients
    .map((nutrient, index) => {
      const position = (index / (nutrients.length - 1)) * 100;
      return `${nutrient.color} ${position}%`;
    })
    .join(', ')})`;

  return (
    <section className="spectrum-section" aria-label="Nutrient color spectrum">
      <div className="spectrum-copy">
        <span>NUTRIENT SPECTRUM</span>
        <strong style={{ color: active.color }}>{active.label}</strong>
      </div>
      <div className="spectrum-control">
        <div className="spectrum-track" style={{ background: gradient }} />
        <span
          className="spectrum-indicator"
          style={{ left: `${(activeIndex / (nutrients.length - 1)) * 100}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={nutrients.length - 1}
          step={1}
          value={activeIndex}
          aria-label="Choose a nutrient"
          aria-valuetext={active.label}
          onChange={(event) => {
            onChange(nutrientKeys[Number(event.currentTarget.value)]);
          }}
        />
      </div>
      <div className="spectrum-ends" aria-hidden="true">
        <span>{nutrients[0].shortLabel}</span>
        <span>{nutrients[nutrients.length - 1].shortLabel}</span>
      </div>
    </section>
  );
}
