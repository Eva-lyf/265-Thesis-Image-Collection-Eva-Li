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
    color: '#ef3b35',
    unit: 'g',
    amountField: 'proteinG',
    dailyValue: dailyValues.proteinG,
  },
  {
    key: 'iron',
    label: 'Iron',
    shortLabel: 'Iron',
    color: '#a66a3f',
    unit: 'mg',
    amountField: 'ironMg',
    dailyValue: dailyValues.ironMg,
  },
  {
    key: 'carbohydrate',
    label: 'Carbohydrate',
    shortLabel: 'Carbs',
    color: '#ed7b35',
    unit: 'g',
    amountField: 'carbohydratesG',
    dailyValue: dailyValues.carbohydratesG,
  },
  {
    key: 'totalFat',
    label: 'Total Fat',
    shortLabel: 'Fat',
    color: '#e3be40',
    unit: 'g',
    amountField: 'fatG',
    dailyValue: dailyValues.fatG,
  },
  {
    key: 'potassium',
    label: 'Potassium',
    shortLabel: 'Potassium',
    color: '#95c944',
    unit: 'mg',
    amountField: 'potassiumMg',
    dailyValue: dailyValues.potassiumMg,
  },
  {
    key: 'fiber',
    label: 'Fiber',
    shortLabel: 'Fiber',
    color: '#48a868',
    unit: 'g',
    amountField: 'fiberG',
    dailyValue: dailyValues.fiberG,
  },
  {
    key: 'sodium',
    label: 'Sodium',
    shortLabel: 'Sodium',
    color: '#38b9c8',
    unit: 'mg',
    amountField: 'sodiumMg',
    dailyValue: dailyValues.sodiumMg,
  },
  {
    key: 'calcium',
    label: 'Calcium',
    shortLabel: 'Calcium',
    color: '#9268c7',
    unit: 'mg',
    amountField: 'calciumMg',
    dailyValue: dailyValues.calciumMg,
  },
  {
    key: 'sugar',
    label: 'Total Sugar',
    shortLabel: 'Sugar',
    color: '#ed78a8',
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
import nutritionDataset from '@/data/meal-nutrition.json';
