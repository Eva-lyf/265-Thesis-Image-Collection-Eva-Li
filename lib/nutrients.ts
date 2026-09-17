export const nutrientKeys = [
  'protein',
  'fiber',
  'totalFat',
  'saturatedFat',
  'unsaturatedFat',
  'carbohydrate',
  'sugar',
  'sodium',
  'calcium',
  'potassium',
  'iron',
  'vitaminA',
  'vitaminD',
  'vitaminE',
  'vitaminK',
  'vitaminC',
  'vitaminB',
] as const;

export type NutrientKey = (typeof nutrientKeys)[number];

export type NutrientDefinition = {
  key: NutrientKey;
  label: string;
  shortLabel: string;
  color: string;
  unit: 'g' | 'mg' | 'mcg';
};

export const nutrients: readonly NutrientDefinition[] = [
  {
    key: 'protein',
    label: 'Protein',
    shortLabel: 'Protein',
    color: '#ef3b35',
    unit: 'g',
  },
  {
    key: 'fiber',
    label: 'Fiber',
    shortLabel: 'Fiber',
    color: '#48a868',
    unit: 'g',
  },
  {
    key: 'totalFat',
    label: 'Total Fat',
    shortLabel: 'Fat',
    color: '#e3be40',
    unit: 'g',
  },
  {
    key: 'saturatedFat',
    label: 'Saturated Fat',
    shortLabel: 'Sat. Fat',
    color: '#8f6544',
    unit: 'g',
  },
  {
    key: 'unsaturatedFat',
    label: 'Unsaturated Fat',
    shortLabel: 'Unsat. Fat',
    color: '#d59c2d',
    unit: 'g',
  },
  {
    key: 'carbohydrate',
    label: 'Carbohydrate',
    shortLabel: 'Carbs',
    color: '#ed7b35',
    unit: 'g',
  },
  {
    key: 'sugar',
    label: 'Sugar',
    shortLabel: 'Sugar',
    color: '#ed78a8',
    unit: 'g',
  },
  {
    key: 'sodium',
    label: 'Sodium',
    shortLabel: 'Sodium',
    color: '#38b9c8',
    unit: 'mg',
  },
  {
    key: 'calcium',
    label: 'Calcium',
    shortLabel: 'Calcium',
    color: '#9268c7',
    unit: 'mg',
  },
  {
    key: 'potassium',
    label: 'Potassium',
    shortLabel: 'Potassium',
    color: '#95c944',
    unit: 'mg',
  },
  {
    key: 'iron',
    label: 'Iron',
    shortLabel: 'Iron',
    color: '#a66a3f',
    unit: 'mg',
  },
  {
    key: 'vitaminA',
    label: 'Vitamin A',
    shortLabel: 'Vit. A',
    color: '#ff334c',
    unit: 'mcg',
  },
  {
    key: 'vitaminD',
    label: 'Vitamin D',
    shortLabel: 'Vit. D',
    color: '#ff8a1d',
    unit: 'mcg',
  },
  {
    key: 'vitaminE',
    label: 'Vitamin E',
    shortLabel: 'Vit. E',
    color: '#6554dc',
    unit: 'mg',
  },
  {
    key: 'vitaminK',
    label: 'Vitamin K',
    shortLabel: 'Vit. K',
    color: '#2878ef',
    unit: 'mcg',
  },
  {
    key: 'vitaminC',
    label: 'Vitamin C',
    shortLabel: 'Vit. C',
    color: '#f3df36',
    unit: 'mg',
  },
  {
    key: 'vitaminB',
    label: 'Vitamin B',
    shortLabel: 'Vit. B',
    color: '#4ec56f',
    unit: 'mg',
  },
] as const;

export const nutrientByKey = Object.fromEntries(
  nutrients.map((nutrient) => [nutrient.key, nutrient]),
) as Record<NutrientKey, NutrientDefinition>;
