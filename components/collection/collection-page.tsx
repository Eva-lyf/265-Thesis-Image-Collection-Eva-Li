'use client';

import { useEffect, useState } from 'react';
import { ColorFilmstrip } from './color-filmstrip';
import { ColorSpectrum } from './color-spectrum';
import { MealDetail } from './meal-detail';
import {
  closestMealForHue,
  colorForStoragePath,
  type ColorIndexedMeal,
} from '@/lib/image-colors';
import { meals } from '@/lib/meals';
import { nutrientForHue } from '@/lib/nutrients';
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
  const [selectedHue, setSelectedHue] = useState(0);
  const [resolvedMeals, setResolvedMeals] = useState<ColorIndexedMeal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [detailMealId, setDetailMealId] = useState<string | null>(null);
  const [isChoosingColor, setIsChoosingColor] = useState(false);
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
        const colorIndexedMeals = result.meals.map((meal) => ({
          ...meal,
          dominantColor: colorForStoragePath(meal.storagePath),
        }));
        const initialMeal = closestMealForHue(colorIndexedMeals, 0);
        setResolvedMeals(colorIndexedMeals);
        setSelectedMealId(initialMeal?.id ?? null);
        if (initialMeal) setSelectedHue(initialMeal.dominantColor.hue);
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

  const detailMeal = detailMealId
    ? resolvedMeals.find((meal) => meal.id === detailMealId)
    : undefined;
  const selectedNutrient = nutrientForHue(selectedHue);

  function commitHue(hue: number) {
    setSelectedHue(hue);
    setIsChoosingColor(false);
    const closest = closestMealForHue(resolvedMeals, hue);
    if (closest) setSelectedMealId(closest.id);
    setDetailMealId(null);
  }

  return (
    <main className="collection-shell">
      <ColorSpectrum
        hue={selectedHue}
        nutrient={selectedNutrient}
        onStart={() => setIsChoosingColor(true)}
        onPreview={(hue) => {
          setIsChoosingColor(true);
          setSelectedHue(hue);
        }}
        onCommit={commitHue}
      />

      {detailMeal ? (
        <MealDetail meal={detailMeal} onClose={() => setDetailMealId(null)} />
      ) : (
        <ColorFilmstrip
          meals={resolvedMeals}
          selectedId={selectedMealId}
          loading={loading}
          message={message}
          isChoosingColor={isChoosingColor}
          onCenter={(meal) => {
            setIsChoosingColor(false);
            setSelectedMealId(meal.id);
            setSelectedHue(meal.dominantColor.hue);
          }}
          onOpen={(meal) => setDetailMealId(meal.id)}
        />
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
