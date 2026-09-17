import colorRecords from '@/data/image-colors.json';
import type { CollectionMeal } from './meals';

export type ImageColor = {
  storagePath: string;
  dominantHex: string;
  hue: number;
  saturation: number;
  lightness: number;
};

export type ColorIndexedMeal = CollectionMeal & {
  dominantColor: ImageColor;
};

const colorsByPath = new Map(
  (colorRecords as ImageColor[]).map((record) => [record.storagePath, record]),
);

const fallback: ImageColor = {
  storagePath: '',
  dominantHex: '#B8B8B8',
  hue: 0,
  saturation: 0,
  lightness: 72,
};

export function colorForStoragePath(storagePath: string): ImageColor {
  return colorsByPath.get(storagePath) ?? { ...fallback, storagePath };
}

export function hueDistance(first: number, second: number) {
  const difference = Math.abs(first - second) % 360;
  return Math.min(difference, 360 - difference);
}

export function closestMealForHue(
  meals: readonly ColorIndexedMeal[],
  hue: number,
) {
  return meals.reduce<ColorIndexedMeal | undefined>((closest, meal) => {
    if (!closest) return meal;
    return hueDistance(meal.dominantColor.hue, hue) <
      hueDistance(closest.dominantColor.hue, hue)
      ? meal
      : closest;
  }, undefined);
}
