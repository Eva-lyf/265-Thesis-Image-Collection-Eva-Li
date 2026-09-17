'use client';

import { useEffect, useMemo, useState } from 'react';
import { MealCollection } from './meal-collection';
import { MealDetail } from './meal-detail';
import { NutrientSpectrum } from './nutrient-spectrum';
import { meals, sortMealsByNutrient, type CollectionMeal } from '@/lib/meals';
import { nutrientByKey, type NutrientKey } from '@/lib/nutrients';
import {
  loadMealsFromStorage,
  storageConfigured,
  type SupabaseStorageConfig,
} from '@/lib/supabase-storage';

type CollectionPageProps = {
  config: SupabaseStorageConfig;
};

export default function CollectionPage({ config }: CollectionPageProps) {
  const connected = storageConfigured(config);
  const [selectedNutrient, setSelectedNutrient] =
    useState<NutrientKey>('protein');
  const [resolvedMeals, setResolvedMeals] = useState<CollectionMeal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [storageCount, setStorageCount] = useState(0);
  const [displayableCount, setDisplayableCount] = useState(0);
  const [loading, setLoading] = useState(connected);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!connected) {
        setLoading(false);
        setMessage(
          'Add your Supabase project URL and publishable key to load the 265 collection.',
        );
        return;
      }

      setLoading(true);
      setMessage('');
      try {
        const result = await loadMealsFromStorage(config, meals);
        if (cancelled) return;
        setResolvedMeals(result.meals);
        setStorageCount(result.storageCount);
        setDisplayableCount(result.displayableCount);
        if (!result.meals.length) {
          setMessage(
            'The 265 bucket is connected, but no sample meal photographs could be resolved.',
          );
        }
      } catch (error) {
        if (!cancelled) setMessage((error as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [config, connected]);

  const orderedMeals = useMemo(
    () => sortMealsByNutrient(resolvedMeals, selectedNutrient),
    [resolvedMeals, selectedNutrient],
  );

  const activeNutrient = nutrientByKey[selectedNutrient];
  const selectedMeal = selectedMealId
    ? resolvedMeals.find((meal) => meal.id === selectedMealId)
    : undefined;

  return (
    <main className="collection-shell">
      <NutrientSpectrum
        value={selectedNutrient}
        onChange={(nutrient) => {
          setSelectedNutrient(nutrient);
          setSelectedMealId(null);
        }}
      />

      {selectedMeal ? (
        <MealDetail
          meal={selectedMeal}
          onClose={() => setSelectedMealId(null)}
        />
      ) : (
        <>
          <section className="collection-intro" aria-live="polite">
            <div>
              <i style={{ background: activeNutrient.color }} />
              <span>{activeNutrient.label}</span>
            </div>
            <p>Meals ordered by Daily Value, highest first.</p>
          </section>

          <MealCollection
            meals={orderedMeals}
            nutrient={selectedNutrient}
            selectedMealId={null}
            loading={loading}
            message={message}
            onSelect={setSelectedMealId}
          />
        </>
      )}

      <footer>
        <span>265ThesisBrainstormCollectionEvaLI</span>
        <span>
          {
            resolvedMeals.filter((meal) => meal.analysisStatus === 'analyzed')
              .length
          }{' '}
          ANALYZED MEALS · {displayableCount} WEB IMAGES · {storageCount}{' '}
          STORAGE OBJECTS
        </span>
      </footer>
    </main>
  );
}
