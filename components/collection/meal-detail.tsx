'use client';
/* oxlint-disable next/no-img-element -- signed Supabase URLs are dynamic */

import type { CollectionMeal } from '@/lib/meals';
import { NutrientOrb } from './nutrient-orb';

type MealDetailProps = {
  meal: CollectionMeal;
  onClose: () => void;
};

export function MealDetail({ meal, onClose }: MealDetailProps) {
  return (
    <section
      className="meal-detail"
      aria-label={`${meal.title} nutrient detail`}
    >
      <button
        className="detail-close"
        onClick={onClose}
        aria-label="Back to collection"
      >
        <span aria-hidden="true">←</span>
        Collection
      </button>

      <figure className="detail-photo">
        {meal.imageUrl ? (
          <img src={meal.imageUrl} alt={meal.image.alt} />
        ) : (
          <span className="detail-photo-placeholder" aria-hidden />
        )}
      </figure>

      <div className="detail-visual">
        <NutrientOrb meal={meal} />
        <div className="detail-meta">
          <span>{meal.title}</span>
          <small>HOVER THE LIGHT TO READ ITS NUTRIENT</small>
        </div>
      </div>
    </section>
  );
}
