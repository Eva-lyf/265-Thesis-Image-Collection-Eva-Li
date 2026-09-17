'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorFilmstrip } from './color-filmstrip';
import { ColorSpectrum } from './color-spectrum';
import { MealDetail } from './meal-detail';
import {
  closestMealForHue,
  colorForStoragePath,
  knownImageStoragePaths,
  type ColorIndexedMeal,
} from '@/lib/image-colors';
import { meals } from '@/lib/meals';
import { nutrientForHue } from '@/lib/nutrients';
import {
  loadMealsFromStorage,
  loadStorageImageUrl,
  mealsForStoragePaths,
  storageConfigured,
  type SupabaseStorageConfig,
} from '@/lib/supabase-storage';

type CollectionPageProps = {
  config: SupabaseStorageConfig;
};

function nearbyMealIds(
  collection: readonly ColorIndexedMeal[],
  selectedId: string,
  radius = 4,
) {
  const sorted = [...collection].sort(
    (first, second) => first.dominantColor.hue - second.dominantColor.hue,
  );
  const selectedIndex = sorted.findIndex((meal) => meal.id === selectedId);
  if (selectedIndex < 0) return [];

  const ids = new Set<string>();
  for (let offset = -radius; offset <= radius; offset += 1) {
    const index = (selectedIndex + offset + sorted.length) % sorted.length;
    ids.add(sorted[index].id);
  }
  return [...ids];
}

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
  const mealsRef = useRef<ColorIndexedMeal[]>([]);
  const imageRequests = useRef(new Set<string>());

  const requestImages = useCallback(
    async (mealIds: readonly string[]) => {
      const requestedIds = new Set(mealIds);
      const targets = mealsRef.current.filter(
        (meal) =>
          requestedIds.has(meal.id) &&
          !meal.imageUrl &&
          !imageRequests.current.has(meal.storagePath),
      );
      if (!targets.length) return;

      targets.forEach((meal) => imageRequests.current.add(meal.storagePath));
      const results = await Promise.allSettled(
        targets.map(async (meal) => ({
          id: meal.id,
          storagePath: meal.storagePath,
          imageUrl: await loadStorageImageUrl(config, meal.storagePath),
        })),
      );

      const loadedUrls = new Map<string, string>();
      results.forEach((result, index) => {
        imageRequests.current.delete(targets[index].storagePath);
        if (result.status === 'fulfilled') {
          loadedUrls.set(result.value.id, result.value.imageUrl);
        }
      });
      if (!loadedUrls.size) return;

      setResolvedMeals((current) => {
        const next = current.map((meal) => {
          const imageUrl = loadedUrls.get(meal.id);
          return imageUrl ? { ...meal, imageUrl } : meal;
        });
        mealsRef.current = next;
        return next;
      });
    },
    [config],
  );

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

      const knownPaths = knownImageStoragePaths();
      if (knownPaths.length) {
        const knownMeals = mealsForStoragePaths(knownPaths, meals).map(
          (meal) => ({
            ...meal,
            dominantColor: colorForStoragePath(meal.storagePath),
          }),
        );
        const initialMeal = closestMealForHue(knownMeals, 0);
        mealsRef.current = knownMeals;
        setResolvedMeals(knownMeals);
        setSelectedMealId(initialMeal?.id ?? null);
        if (initialMeal) setSelectedHue(initialMeal.dominantColor.hue);
        setStorageCount(knownPaths.length);
        setDisplayableCount(knownPaths.length);
        setLoading(false);
      }

      try {
        const result = await loadMealsFromStorage(config, meals);
        if (cancelled) return;
        const colorIndexedMeals = result.meals.map((meal) => ({
          ...meal,
          imageUrl:
            mealsRef.current.find(
              (current) => current.storagePath === meal.storagePath,
            )?.imageUrl ?? '',
          dominantColor: colorForStoragePath(meal.storagePath),
        }));
        const initialMeal = closestMealForHue(colorIndexedMeals, 0);
        const storageChanged =
          colorIndexedMeals.length !== mealsRef.current.length ||
          colorIndexedMeals.some(
            (meal, index) =>
              meal.storagePath !== mealsRef.current[index]?.storagePath,
          );
        if (storageChanged) {
          mealsRef.current = colorIndexedMeals;
          setResolvedMeals(colorIndexedMeals);
          setSelectedMealId((current) =>
            colorIndexedMeals.some((meal) => meal.id === current)
              ? current
              : (initialMeal?.id ?? null),
          );
        }
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

  useEffect(() => {
    if (!selectedMealId || !resolvedMeals.length) return;
    void requestImages(nearbyMealIds(resolvedMeals, selectedMealId));
  }, [requestImages, resolvedMeals, selectedMealId]);

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
          onNeedImages={requestImages}
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
