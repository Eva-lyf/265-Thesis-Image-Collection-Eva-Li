'use client';

import { type CSSProperties } from 'react';
import type { Meal } from '@/lib/meals';
import { nutrientByKey, nutrientKeys, type NutrientKey } from '@/lib/nutrients';

type NutrientOrbProps = {
  meal: Meal;
};

const positions = [
  [48, 48],
  [28, 35],
  [70, 66],
  [56, 24],
  [29, 72],
  [73, 38],
  [44, 76],
  [24, 55],
  [65, 49],
] as const;

function measurementLabel(key: NutrientKey, dvPercent: number | null) {
  if (key === 'sugar') return 'Relative to collection P90';
  return `${dvPercent}% Daily Value`;
}

export function NutrientOrb({ meal }: NutrientOrbProps) {
  const luminosity = Math.min(
    1.12,
    Math.max(0.84, 0.84 + (meal.calories / 4000) * 0.28),
  );
  const nutrientTotal = nutrientKeys.reduce(
    (sum, key) => sum + meal.orbVisualPercent[key],
    0,
  );
  const shares = nutrientKeys.map(
    (key) => (meal.orbVisualPercent[key] / nutrientTotal) * 100,
  );
  const composition = nutrientKeys.map((key, index) => {
    const share = shares[index];
    const start = shares
      .slice(0, index)
      .reduce((sum, previousShare) => sum + previousShare, 0);
    const end = index === nutrientKeys.length - 1 ? 100 : start + share;
    return { key, index, share, start, end };
  });
  const orbSpectrum = `conic-gradient(from -90deg, ${composition
    .flatMap(({ key, start, end }) => [
      `${nutrientByKey[key].color} ${start}%`,
      `${nutrientByKey[key].color} ${end}%`,
    ])
    .join(', ')})`;
  const layers = [...composition].sort((a, b) => b.share - a.share);
  const strongest = layers[0];
  const readingId = `nutrient-reading-${meal.id}`;

  return (
    <div className="nutrient-orb-stage">
      <button
        type="button"
        className="nutrient-orb"
        aria-label={`Nutrient color orb for ${meal.title}`}
        aria-describedby={readingId}
        style={
          {
            '--orb-luminosity': luminosity,
            '--orb-dominant': nutrientByKey[strongest.key].color,
            '--orb-spectrum': orbSpectrum,
          } as CSSProperties
        }
      >
        {layers.map(({ key, index, share }) => {
          const [x, y] = positions[index];
          const definition = nutrientByKey[key];
          const proportion = Math.sqrt(share / 100);
          const size = 30 + proportion * 108;
          return (
            <span
              key={key}
              className="nutrient-light"
              style={
                {
                  '--light-color': definition.color,
                  '--light-x': `${x}%`,
                  '--light-y': `${y}%`,
                  '--light-size': `${size}%`,
                  '--light-opacity': 0.3 + proportion * 0.66,
                  '--light-blur': `${13 + (1 - proportion) * 20}px`,
                } as CSSProperties
              }
            />
          );
        })}
      </button>

      <div className="nutrient-reading" id={readingId}>
        {nutrientKeys.map((key) => {
          const definition = nutrientByKey[key];
          const value = meal.nutrients[key];
          return (
            <div className="nutrient-reading-row" key={key}>
              <div>
                <strong>{definition.label}</strong>
                <small>
                  {value.amount} {definition.unit}
                </small>
              </div>
              <span>{measurementLabel(key, value.dvPercent)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
