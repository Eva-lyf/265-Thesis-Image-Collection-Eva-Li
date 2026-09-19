import nutritionDataset from '@/data/meal-nutrition.json';
import orbVisualDataset from '@/data/nutrient-orb-v2.json';
import { nutrientByKey, nutrientKeys, type NutrientKey } from './nutrients';

type NutritionAmounts = {
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;
  totalSugarG: number;
  sodiumMg: number;
  potassiumMg: number;
  calciumMg: number;
  ironMg: number;
};

type NutritionRecord = {
  imageFilename: string;
  mealId: string;
  estimatedMeal: string;
  estimatedFoods: { name: string; estimatedGrams: number }[];
  nutrition: NutritionAmounts;
  confidence: number;
  estimationBasis: string;
  notes: string;
};

export type NutrientValue = {
  amount: number;
  dvPercent: number | null;
  normalizedPercent: number;
  guidance: string;
};

export type MealImage = {
  storagePath: string;
  alt: string;
};

export type Meal = {
  id: string;
  title: string;
  image: MealImage;
  calories: number;
  ingredients: string[];
  estimatedFoods: { name: string; estimatedGrams: number }[];
  nutrients: Record<NutrientKey, NutrientValue>;
  orbVisualPercent: Record<NutrientKey, number>;
  confidence: number;
  estimationBasis: string;
  notes: string;
};

export type CollectionMeal = Meal & {
  imageUrl: string;
  storagePath: string;
  analysisStatus: 'analyzed';
};

const sourceRecords = nutritionDataset.records as NutritionRecord[];

type OrbVisualRecord = {
  imageFilename: string;
  caloriesKcal: number;
  dominantBody: NutrientKey;
  orbVisualPercent: Record<NutrientKey, number>;
};

const orbVisualByImageFilename = new Map(
  (orbVisualDataset.records as OrbVisualRecord[]).map((record) => [
    record.imageFilename,
    record,
  ]),
);

function percentile(values: readonly number[], percentileValue: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(
    0,
    Math.min(sorted.length - 1, Math.ceil(percentileValue * sorted.length) - 1),
  );
  return sorted[index];
}

export const sugarP90Grams = percentile(
  sourceRecords.map((record) => record.nutrition.totalSugarG),
  0.9,
);

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function guidanceFor(key: NutrientKey, normalizedPercent: number) {
  if (key === 'sugar') {
    return `${Math.round(normalizedPercent)}% of the collection's 90th-percentile total-sugar reference.`;
  }
  if (normalizedPercent >= 100) return 'At least one full Daily Value.';
  if (normalizedPercent >= 20) return 'A substantial share of the Daily Value.';
  return 'A smaller share of the Daily Value.';
}

export const meals: readonly Meal[] = sourceRecords.map((record) => {
  const orbVisual = orbVisualByImageFilename.get(record.imageFilename);
  if (!orbVisual) {
    throw new Error(
      `Missing Orb Visual percentages for ${record.imageFilename}`,
    );
  }
  const entries = nutrientKeys.map((key) => {
    const definition = nutrientByKey[key];
    const amount = record.nutrition[definition.amountField];
    const reference = definition.dailyValue ?? sugarP90Grams;
    const normalizedPercent = roundPercent((amount / reference) * 100);

    return [
      key,
      {
        amount,
        dvPercent: definition.dailyValue === null ? null : normalizedPercent,
        normalizedPercent,
        guidance: guidanceFor(key, normalizedPercent),
      },
    ] as const;
  });

  return {
    id: record.mealId,
    title: record.estimatedMeal,
    image: {
      storagePath: record.imageFilename,
      alt: record.estimatedMeal,
    },
    calories: record.nutrition.caloriesKcal,
    ingredients: record.estimatedFoods.map((food) => food.name),
    estimatedFoods: record.estimatedFoods,
    nutrients: Object.fromEntries(entries) as Record<
      NutrientKey,
      NutrientValue
    >,
    orbVisualPercent: orbVisual.orbVisualPercent,
    confidence: record.confidence,
    estimationBasis: record.estimationBasis,
    notes: record.notes,
  };
});

export const mealsByImageFilename = new Map(
  meals.map((meal) => [meal.image.storagePath, meal]),
);
