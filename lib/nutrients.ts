import nutritionDataset from '@/data/meal-nutrition.json';

export const nutrientKeys = [
  'protein',
  'iron',
  'carbohydrate',
  'totalFat',
  'potassium',
  'fiber',
  'sodium',
  'calcium',
  'sugar',
] as const;

export type NutrientKey = (typeof nutrientKeys)[number];

export type NutrientDefinition = {
  key: NutrientKey;
  label: string;
  shortLabel: string;
  color: string;
  unit: 'g' | 'mg';
  amountField:
    | 'proteinG'
    | 'ironMg'
    | 'carbohydratesG'
    | 'fatG'
    | 'potassiumMg'
    | 'fiberG'
    | 'sodiumMg'
    | 'calciumMg'
    | 'totalSugarG';
  dailyValue: number | null;
};

const dailyValues = nutritionDataset.dailyValueReferences;

export const nutrients: readonly NutrientDefinition[] = [
  {
    key: 'protein',
    label: 'Protein',
    shortLabel: 'Protein',
    color: 'rgb(255 45 35)',
    unit: 'g',
    amountField: 'proteinG',
    dailyValue: dailyValues.proteinG,
  },
  {
    key: 'iron',
    label: 'Iron',
    shortLabel: 'Iron',
    color: 'rgb(198 92 18)',
    unit: 'mg',
    amountField: 'ironMg',
    dailyValue: dailyValues.ironMg,
  },
  {
    key: 'carbohydrate',
    label: 'Carbohydrate',
    shortLabel: 'Carbs',
    color: 'rgb(255 112 0)',
    unit: 'g',
    amountField: 'carbohydratesG',
    dailyValue: dailyValues.carbohydratesG,
  },
  {
    key: 'totalFat',
    label: 'Total Fat',
    shortLabel: 'Fat',
    color: 'rgb(255 210 0)',
    unit: 'g',
    amountField: 'fatG',
    dailyValue: dailyValues.fatG,
  },
  {
    key: 'potassium',
    label: 'Potassium',
    shortLabel: 'Potassium',
    color: 'rgb(137 230 0)',
    unit: 'mg',
    amountField: 'potassiumMg',
    dailyValue: dailyValues.potassiumMg,
  },
  {
    key: 'fiber',
    label: 'Fiber',
    shortLabel: 'Fiber',
    color: 'rgb(0 200 83)',
    unit: 'g',
    amountField: 'fiberG',
    dailyValue: dailyValues.fiberG,
  },
  {
    key: 'sodium',
    label: 'Sodium',
    shortLabel: 'Sodium',
    color: 'rgb(0 201 255)',
    unit: 'mg',
    amountField: 'sodiumMg',
    dailyValue: dailyValues.sodiumMg,
  },
  {
    key: 'calcium',
    label: 'Calcium',
    shortLabel: 'Calcium',
    color: 'rgb(142 82 255)',
    unit: 'mg',
    amountField: 'calciumMg',
    dailyValue: dailyValues.calciumMg,
  },
  {
    key: 'sugar',
    label: 'Total Sugar',
    shortLabel: 'Sugar',
    color: 'rgb(255 65 157)',
    unit: 'g',
    amountField: 'totalSugarG',
    dailyValue: null,
  },
] as const;

export const nutrientByKey = Object.fromEntries(
  nutrients.map((nutrient) => [nutrient.key, nutrient]),
) as Record<NutrientKey, NutrientDefinition>;

export type SpectrumSegment = {
  nutrient: NutrientDefinition;
  score: number;
  width: number;
  start: number;
  end: number;
  center: number;
};

export function nutrientForSpectrumPosition(
  position: number,
  segments: readonly SpectrumSegment[],
) {
  const bounded = Math.min(100, Math.max(0, position));
  return (
    segments.find((segment, index) =>
      index === segments.length - 1
        ? bounded <= segment.end
        : bounded < segment.end,
    ) ?? segments[segments.length - 1]
  ).nutrient;
}
