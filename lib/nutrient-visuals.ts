import type { NutrientKey } from './nutrients';

type NeonNutrientConfig = {
  color: string;
  startPercent: number;
  fullPercent: number;
};

const neonNutrients: Partial<Record<NutrientKey, NeonNutrientConfig>> = {
  sugar: {
    color: 'rgb(255 0 184)',
    startPercent: 25,
    fullPercent: 85,
  },
  sodium: {
    color: 'rgb(0 217 255)',
    startPercent: 100,
    fullPercent: 260,
  },
};

function smoothstep(value: number) {
  const bounded = Math.min(1, Math.max(0, value));
  return bounded * bounded * (3 - 2 * bounded);
}

export function nutrientNeonProfile(
  key: NutrientKey,
  normalizedPercent: number,
) {
  const config = neonNutrients[key];
  if (!config) return { color: null, strength: 0 };

  const progress =
    (normalizedPercent - config.startPercent) /
    (config.fullPercent - config.startPercent);

  return {
    color: config.color,
    strength: smoothstep(progress),
  };
}
