import { meals, type Meal } from './meals';
import { nutrientByKey, nutrientKeys, type NutrientKey } from './nutrients';

const collectionAverage = Object.fromEntries(
  nutrientKeys.map((key) => [
    key,
    meals.reduce(
      (total, meal) => total + meal.nutrients[key].normalizedPercent,
      0,
    ) / meals.length,
  ]),
) as Record<NutrientKey, number>;

function listLabels(keys: readonly NutrientKey[]) {
  return keys.map((key) => nutrientByKey[key].label).join(', ');
}

export type MealInsight = {
  dominant: string;
  high: string;
  low: string;
  collectionComparison: string;
  nextMeal: string;
};

export function mealInsight(meal: Meal): MealInsight {
  const dominantKeys = [...nutrientKeys]
    .sort(
      (first, second) =>
        meal.orbVisualPercent[second] - meal.orbVisualPercent[first],
    )
    .slice(0, 3);
  const highKeys = nutrientKeys.filter((key) => {
    const value = meal.nutrients[key];
    return value.dvPercent !== null
      ? value.dvPercent >= 20
      : value.normalizedPercent >= 75;
  });
  const lowKeys = nutrientKeys.filter((key) => {
    const value = meal.nutrients[key];
    return value.dvPercent !== null && value.dvPercent <= 5;
  });
  const aboveAverage = [...nutrientKeys]
    .filter(
      (key) =>
        meal.nutrients[key].normalizedPercent >= collectionAverage[key] * 1.2,
    )
    .sort(
      (first, second) =>
        meal.nutrients[second].normalizedPercent / collectionAverage[second] -
        meal.nutrients[first].normalizedPercent / collectionAverage[first],
    )
    .slice(0, 3);

  const balanceCues: string[] = [];
  if ((meal.nutrients.sodium.dvPercent ?? 0) >= 20) {
    balanceCues.push('favor lower-sodium choices');
  }
  if (meal.nutrients.sugar.normalizedPercent >= 75) {
    balanceCues.push('keep added sweets and sweet drinks lighter');
  }
  if ((meal.nutrients.totalFat.dvPercent ?? 0) >= 20) {
    balanceCues.push('choose a lighter cooking method or leaner protein');
  }
  if ((meal.nutrients.fiber.dvPercent ?? 0) < 20) {
    balanceCues.push('add a fiber-rich vegetable, bean, whole grain, or fruit');
  }
  if (
    (meal.nutrients.potassium.dvPercent ?? 0) < 20 &&
    balanceCues.length < 2
  ) {
    balanceCues.push('include vegetables or fruit for potassium');
  }

  const selectedCues = balanceCues.slice(0, 2);

  return {
    dominant: listLabels(dominantKeys),
    high: highKeys.length ? listLabels(highKeys.slice(0, 5)) : 'None at 20% DV',
    low: lowKeys.length ? listLabels(lowKeys.slice(0, 4)) : 'None at 5% DV',
    collectionComparison: aboveAverage.length
      ? listLabels(aboveAverage)
      : 'Close to the collection average',
    nextMeal: selectedCues.length
      ? `${selectedCues.join('; ')}.`
      : 'vary the next meal with vegetables, whole foods, and a different protein source.',
  };
}
