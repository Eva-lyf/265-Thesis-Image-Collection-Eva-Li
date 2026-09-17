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
  const normalized = Math.min(1.5, Math.max(0, normalizedPercent / 100));
  return Math.max(0.06, Math.pow(normalized / 1.5, 0.72));
}

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
  const layers = nutrientKeys
    .map((key, index) => ({
      key,
      index,
      weight: visualWeight(meal.nutrients[key].normalizedPercent),
    }))
    .sort((a, b) => a.weight - b.weight);
  const strongest = layers[layers.length - 1];
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
          } as CSSProperties
        }
      >
        {layers.map(({ key, index, weight }) => {
          const [x, y] = positions[index];
          const definition = nutrientByKey[key];
          const value = meal.nutrients[key];
          const size = 23 + weight * 82;
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
                    '--light-opacity': 0.2 + weight * 0.78,
                    '--light-blur': `${14 + (1 - weight) * 24}px`,
                    '--light-focus-blur': `${10 + (1 - weight) * 18}px`,
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
