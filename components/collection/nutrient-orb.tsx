'use client';

import { Fragment, useState, type CSSProperties } from 'react';
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

function visualWeight(normalizedPercent: number) {
  return Math.max(0, normalizedPercent);
}

const minimumVisibleShare = 3;

function measurementLabel(key: NutrientKey, dvPercent: number | null) {
  if (key === 'sugar') return 'Relative to collection P90';
  return `${dvPercent}% Daily Value`;
}

export function NutrientOrb({ meal }: NutrientOrbProps) {
  const [activeNutrient, setActiveNutrient] = useState<NutrientKey | null>(
    null,
  );
  const luminosity = Math.min(
    1.12,
    Math.max(0.84, 0.84 + (meal.calories / 4000) * 0.28),
  );
  const nutrientTotal = nutrientKeys.reduce(
    (sum, key) => sum + visualWeight(meal.nutrients[key].normalizedPercent),
    0,
  );
  const distributableShare = 100 - minimumVisibleShare * nutrientKeys.length;
  const shares = nutrientKeys.map((key) => {
    const proportionalShare =
      nutrientTotal > 0
        ? (visualWeight(meal.nutrients[key].normalizedPercent) /
            nutrientTotal) *
          distributableShare
        : distributableShare / nutrientKeys.length;
    return minimumVisibleShare + proportionalShare;
  });
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
  const activeDefinition = activeNutrient
    ? nutrientByKey[activeNutrient]
    : null;
  const activeValue = activeNutrient ? meal.nutrients[activeNutrient] : null;

  return (
    <div className="nutrient-orb-stage">
      <div
        className="nutrient-orb"
        aria-label={`Nutrient color orb for ${meal.title}`}
        onMouseLeave={() => setActiveNutrient(null)}
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
          const value = meal.nutrients[key];
          const proportion = Math.sqrt(share / 100);
          const size = 30 + proportion * 108;
          return (
            <Fragment key={key}>
              <span
                className={`nutrient-light ${activeNutrient === key ? 'active' : ''}`}
                style={
                  {
                    '--light-color': definition.color,
                    '--light-x': `${x}%`,
                    '--light-y': `${y}%`,
                    '--light-size': `${size}%`,
                    '--light-opacity': 0.3 + proportion * 0.66,
                    '--light-blur': `${13 + (1 - proportion) * 20}px`,
                    '--light-focus-blur': `${9 + (1 - proportion) * 15}px`,
                  } as CSSProperties
                }
              />
              <button
                type="button"
                className="nutrient-light-target"
                aria-label={`${definition.label}: ${value.amount} ${definition.unit}, ${measurementLabel(key, value.dvPercent)}`}
                onMouseEnter={() => setActiveNutrient(key)}
                onMouseLeave={() => setActiveNutrient(null)}
                onFocus={() => setActiveNutrient(key)}
                onBlur={() => setActiveNutrient(null)}
                style={
                  {
                    '--light-x': `${x}%`,
                    '--light-y': `${y}%`,
                  } as CSSProperties
                }
              />
            </Fragment>
          );
        })}
      </div>

      <div
        className={`nutrient-reading ${activeValue ? 'visible' : ''}`}
        aria-live="polite"
      >
        {activeDefinition && activeValue && activeNutrient ? (
          <>
            <strong>{activeDefinition.label}</strong>
            <span>
              {activeValue.amount} {activeDefinition.unit}
            </span>
            <span>
              {measurementLabel(activeNutrient, activeValue.dvPercent)}
            </span>
            <small>{activeValue.guidance}</small>
          </>
        ) : null}
      </div>
    </div>
  );
}
