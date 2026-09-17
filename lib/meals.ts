import sampleMeals from '@/data/meals.json';
import { nutrientKeys, type NutrientKey } from './nutrients';

export type NutrientValue = {
  amount: number;
  dvPercent: number;
  guidance: string;
};

export type MealImage = {
  storagePath?: string;
  storageIndex?: number;
  alt: string;
  width?: number;
  height?: number;
};

export type Meal = {
  id: string;
  title: string;
  image: MealImage;
  calories: number;
  ingredients: string[];
  nutrients: Record<NutrientKey, NutrientValue>;
};

export type ResolvedMeal = Meal & {
  imageUrl: string;
  storagePath: string;
  analysisStatus: 'analyzed';
};

export type PendingMeal = {
  id: string;
  title: string;
  image: MealImage;
  imageUrl: string;
  storagePath: string;
  calories: null;
  ingredients: string[];
  nutrients: null;
  analysisStatus: 'pending';
};

export type CollectionMeal = ResolvedMeal | PendingMeal;

function isMeal(value: unknown): value is Meal {
  if (!value || typeof value !== 'object') return false;
  const meal = value as Partial<Meal>;
  return (
    typeof meal.id === 'string' &&
    typeof meal.title === 'string' &&
    typeof meal.calories === 'number' &&
    Array.isArray(meal.ingredients) &&
    !!meal.image &&
    !!meal.nutrients &&
    nutrientKeys.every((key) => {
      const nutrient = meal.nutrients?.[key];
      return (
        typeof nutrient?.amount === 'number' &&
        typeof nutrient.dvPercent === 'number' &&
        typeof nutrient.guidance === 'string'
      );
    })
  );
}

export const meals: readonly Meal[] = (sampleMeals as unknown[]).filter(isMeal);

export function sortMealsByNutrient(
  collection: readonly CollectionMeal[],
  nutrient: NutrientKey,
) {
  return [...collection].sort((a, b) => {
    const aValue = a.nutrients?.[nutrient].dvPercent ?? -1;
    const bValue = b.nutrients?.[nutrient].dvPercent ?? -1;
    return bValue - aValue || a.title.localeCompare(b.title);
  });
}
