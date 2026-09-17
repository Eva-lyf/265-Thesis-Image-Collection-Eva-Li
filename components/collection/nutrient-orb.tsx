'use client';

import type { CSSProperties } from 'react';
import type { Meal } from '@/lib/meals';
import { nutrientByKey, nutrientKeys } from '@/lib/nutrients';

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

export function visualWeight(dailyValuePercent: number) {
  return Math.min(1, Math.max(0.06, dailyValuePercent / 115));
}

export function NutrientOrb({ meal }: NutrientOrbProps) {
  const luminosity = Math.min(1.18, Math.max(0.72, meal.calories / 720));
  const layers = nutrientKeys
    .map((key, index) => ({
      key,
      index,
      weight: visualWeight(meal.nutrients[key].dvPercent),
    }))
    .sort((a, b) => a.weight - b.weight);

  return (
    <div
      className="nutrient-orb"
      aria-label={`Nutrient color orb for ${meal.title}`}
      style={{ '--orb-luminosity': luminosity } as CSSProperties}
    >
      {layers.map(({ key, index, weight }) => {
        const [x, y] = positions[index];
        const definition = nutrientByKey[key];
        const size = 24 + weight * 58;
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
                '--light-opacity': 0.06 + weight * 0.5,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
