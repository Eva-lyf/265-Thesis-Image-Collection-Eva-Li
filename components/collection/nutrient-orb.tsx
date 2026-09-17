'use client';

import { Fragment, useState, type CSSProperties } from 'react';
import type { Meal } from '@/lib/meals';
import {
  nutrientByKey,
  nutrientKeys,
  type NutrientKey,
} from '@/lib/nutrients';

type NutrientOrbProps = {
  meal: Meal;
};

const positions = [
  [48, 48],
  [29, 38],
  [68, 64],
  [55, 26],
  [31, 70],
  [72, 38],
  [45, 73],
  [24, 56],
  [65, 48],
  [43, 26],
  [58, 76],
  [75, 72],
  [23, 27],
  [78, 25],
  [39, 55],
  [61, 51],
  [50, 66],
] as const;

function visualWeight(dailyValuePercent: number) {
  const normalized = Math.min(1.35, Math.max(0, dailyValuePercent / 100));
  return Math.max(0.035, Math.pow(normalized / 1.35, 0.78));
}

export function NutrientOrb({ meal }: NutrientOrbProps) {
  const [activeNutrient, setActiveNutrient] = useState<NutrientKey | null>(
    null,
  );
  const luminosity = Math.min(
    1.13,
    Math.max(0.84, 0.76 + meal.calories / 1900),
  );
  const layers = nutrientKeys
    .map((key, index) => ({
      key,
      index,
      weight: visualWeight(meal.nutrients[key].dvPercent),
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
          const size = 20 + weight * 76;
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
                  '--light-opacity': 0.13 + weight * 0.8,
                  '--light-blur': `${18 + (1 - weight) * 25}px`,
                  '--light-focus-blur': `${14 + (1 - weight) * 20}px`,
                } as CSSProperties
              }
              />
              <button
                type="button"
                className="nutrient-light-target"
                aria-label={`${definition.label}: ${meal.nutrients[key].dvPercent}% daily value`}
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
        {activeDefinition && activeValue ? (
          <>
            <strong>{activeDefinition.label}</strong>
            <span>
              {activeValue.amount} {activeDefinition.unit}
            </span>
            <span>{activeValue.dvPercent}% Daily Value</span>
            <small>{activeValue.guidance}</small>
          </>
        ) : null}
      </div>
    </div>
  );
}
