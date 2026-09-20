'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Supabase image URLs are signed at runtime; a plain fallback link avoids vinext Link hydration issues */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { NutrientOrbVisual } from '@/components/index/index-page';
import { knownImageStoragePaths } from '@/lib/image-colors';
import { mealInsight } from '@/lib/meal-insights';
import type { Meal } from '@/lib/meals';
import { nutrientByKey, nutrientKeys } from '@/lib/nutrients';
import {
  loadStorageImageUrl,
  type SupabaseStorageConfig,
} from '@/lib/supabase-storage';
import styles from './meal-detail-page.module.css';

type MealDetailPageProps = {
  meal: Meal | null;
  config: SupabaseStorageConfig;
};

function formatAmount(amount: number, unit: 'g' | 'mg') {
  const fractionDigits = amount < 10 ? 1 : 0;
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: fractionDigits })} ${unit}`;
}

export default function MealDetailPage({ meal, config }: MealDetailPageProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!meal) return;
    let cancelled = false;
    const storagePath =
      knownImageStoragePaths().find(
        (path) => path.split('/').at(-1) === meal.image.storagePath,
      ) ?? meal.image.storagePath;

    loadStorageImageUrl(config, storagePath)
      .then((url) => {
        if (!cancelled) setImageUrl(url);
      })
      .catch(() => {
        if (!cancelled) setImageFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [config, meal]);

  const insight = useMemo(() => (meal ? mealInsight(meal) : null), [meal]);
  const nutrientRows = useMemo(
    () =>
      meal
        ? [...nutrientKeys].sort(
            (first, second) =>
              meal.orbVisualPercent[second] - meal.orbVisualPercent[first],
          )
        : [],
    [meal],
  );

  function goBack() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  }

  if (!meal || !insight) {
    return (
      <main className={styles.missing}>
        <p>Meal not found.</p>
        <a href="/">← BACK TO INDEX</a>
      </main>
    );
  }

  return (
    <main className={styles.detailShell}>
      <header className={styles.detailHeader}>
        <button type="button" onClick={goBack} aria-label="Back to index">
          <span aria-hidden="true">←</span> BACK
        </button>
        <span>{meal.id.replace('meal-', 'MEAL ')}</span>
      </header>

      <section className={styles.detailGrid} aria-label={meal.title}>
        <article className={styles.photoPanel}>
          <div className={styles.photoFrame}>
            {imageUrl ? (
              <img src={imageUrl} alt={meal.image.alt} decoding="async" />
            ) : (
              <span className={styles.imagePlaceholder} aria-hidden="true" />
            )}
          </div>
          <div className={styles.photoReading}>
            <span className={styles.eyebrow}>MEAL READING</span>
            <h1>{meal.title}</h1>
            <dl>
              <div>
                <dt>Most visible in the nutrient mix</dt>
                <dd>{insight.dominant}</dd>
              </div>
              <div>
                <dt>High by DV / collection context</dt>
                <dd>{insight.high}</dd>
              </div>
              <div>
                <dt>Above this 67-meal collection average</dt>
                <dd>{insight.collectionComparison}</dd>
              </div>
              <div>
                <dt>For balance at the next meal</dt>
                <dd>{insight.nextMeal}</dd>
              </div>
            </dl>
            <p className={styles.referenceNote}>
              General context uses the{' '}
              <a
                href="https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels"
                target="_blank"
                rel="noreferrer"
              >
                FDA guide
              </a>
              : 20% DV or more is high and 5% DV or less is low. Total sugar
              uses this collection’s static reference because it is not added
              sugar.
            </p>
          </div>
          {imageFailed ? (
            <p className={styles.imageError}>IMAGE UNAVAILABLE</p>
          ) : null}
          <p className={styles.interactionHint}>HOVER TO READ THE MEAL</p>
        </article>

        <article className={styles.orbPanel}>
          <div className={styles.orbVisual}>
            <NutrientOrbVisual meal={meal} detail active />
          </div>
          <div className={styles.nutrientReadout}>
            <div className={styles.readoutHeading}>
              <span className={styles.eyebrow}>NUTRIENT DISTRIBUTION</span>
              <span>{meal.calories.toLocaleString('en-US')} KCAL</span>
            </div>
            <div className={styles.nutrientRows}>
              {nutrientRows.map((key) => {
                const nutrient = nutrientByKey[key];
                const value = meal.nutrients[key];
                const percent =
                  value.dvPercent === null
                    ? `${Math.round(value.normalizedPercent)}% REF.`
                    : `${Math.round(value.dvPercent)}% DV`;
                return (
                  <div
                    className={styles.nutrientRow}
                    key={key}
                    style={
                      { '--nutrient-color': nutrient.color } as CSSProperties
                    }
                  >
                    <i aria-hidden="true" />
                    <span className={styles.dashedLine} aria-hidden="true" />
                    <strong>{nutrient.label}</strong>
                    <span>{percent}</span>
                    <small>{formatAmount(value.amount, nutrient.unit)}</small>
                  </div>
                );
              })}
            </div>
          </div>
          <p className={styles.interactionHint}>HOVER TO READ ALL NUTRIENTS</p>
        </article>
      </section>
    </main>
  );
}
