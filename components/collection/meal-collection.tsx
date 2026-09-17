'use client';
/* oxlint-disable next/no-img-element -- public Supabase Storage URLs are dynamic */

import type { CollectionMeal } from '@/lib/meals';
import { nutrientByKey, type NutrientKey } from '@/lib/nutrients';

type MealCollectionProps = {
  meals: readonly CollectionMeal[];
  nutrient: NutrientKey;
  selectedMealId: string | null;
  loading: boolean;
  message: string;
  onSelect: (id: string) => void;
};

export function MealCollection({
  meals,
  nutrient,
  selectedMealId,
  loading,
  message,
  onSelect,
}: MealCollectionProps) {
  if (loading) {
    return (
      <output className="collection-empty is-loading">
        <span />
        Reading the 265 collection…
      </output>
    );
  }

  if (!meals.length) {
    return (
      <output className="collection-empty">
        <span>＋</span>
        <p>{message || 'No sample meals are available yet.'}</p>
      </output>
    );
  }

  const definition = nutrientByKey[nutrient];

  return (
    <section
      className="meal-collection"
      aria-label={`Meals ordered by ${definition.label}`}
    >
      {meals.map((meal, index) => {
        const selected = meal.id === selectedMealId;
        const value = meal.nutrients?.[nutrient];
        return (
          <button
            key={meal.id}
            className={`meal-card ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(meal.id)}
            aria-pressed={selected}
            aria-label={
              value
                ? `${meal.title}, rank ${index + 1}, ${value.dvPercent}% daily value of ${definition.label}`
                : `${meal.title}, nutrient analysis pending`
            }
            data-meal-id={meal.id}
            data-next-state="meal-detail"
          >
            <span className="meal-rank">
              {String(index + 1).padStart(2, '0')}
            </span>
            <img src={meal.imageUrl} alt={meal.image.alt} />
            <span className="meal-card-caption">
              <strong>{meal.title}</strong>
              <small>{value ? `${value.dvPercent}% DV` : 'DATA PENDING'}</small>
            </span>
          </button>
        );
      })}
    </section>
  );
}
