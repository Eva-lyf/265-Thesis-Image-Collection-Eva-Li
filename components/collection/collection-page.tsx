'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColorFilmstrip } from './color-filmstrip';
import { ColorSpectrum } from './color-spectrum';
import { MealDetail } from './meal-detail';
import { knownImageStoragePaths } from '@/lib/image-colors';
import {
  collectionSpectrumSegments,
  sortMealsByNutrient,
  type CollectionMeal,
} from '@/lib/meals';
import {
  nutrientByKey,
  nutrientForSpectrumPosition,
  type NutrientKey,
} from '@/lib/nutrients';
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
  collection: readonly CollectionMeal[],
  selectedId: string,
  radius = 4,
) {
  const selectedIndex = collection.findIndex((meal) => meal.id === selectedId);
  if (selectedIndex < 0) return [];

  const ids = new Set<string>();
  for (let offset = -radius; offset <= radius; offset += 1) {
    const index =
      (selectedIndex + offset + collection.length) % collection.length;
    ids.add(collection[index].id);
  }
  return [...ids];
}

const initialNutrient: NutrientKey = 'protein';
const initialSpectrumPosition =
  collectionSpectrumSegments.find(
    (segment) => segment.nutrient.key === initialNutrient,
  )?.start ?? 0;

export default function CollectionPage({ config }: CollectionPageProps) {
  const connected = storageConfigured(config);
  const [selectedNutrient, setSelectedNutrient] =
    useState<NutrientKey>(initialNutrient);
  const [spectrumPosition, setSpectrumPosition] = useState(
    initialSpectrumPosition,
  );
  const [resolvedMeals, setResolvedMeals] = useState<CollectionMeal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [detailMealId, setDetailMealId] = useState<string | null>(null);
  const [isChoosingColor, setIsChoosingColor] = useState(false);
  const [loading, setLoading] = useState(connected);
  const [message, setMessage] = useState('');
  const mealsRef = useRef<CollectionMeal[]>([]);
  const imageRequests = useRef(new Set<string>());

  const previewNutrient = nutrientForSpectrumPosition(
    spectrumPosition,
    collectionSpectrumSegments,
  );
  const orderedMeals = useMemo(
    () => sortMealsByNutrient(resolvedMeals, selectedNutrient),
    [resolvedMeals, selectedNutrient],
  );

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
        const knownMeals = mealsForStoragePaths(knownPaths);
        const initiallyOrdered = sortMealsByNutrient(
          knownMeals,
          initialNutrient,
        );
        mealsRef.current = knownMeals;
        setResolvedMeals(knownMeals);
        setSelectedMealId(initiallyOrdered[0]?.id ?? null);
        setLoading(false);
      }

      try {
        const result = await loadMealsFromStorage(config);
        if (cancelled) return;

        const storageMeals = result.meals.map((meal) => ({
          ...meal,
          imageUrl:
            mealsRef.current.find(
              (current) => current.storagePath === meal.storagePath,
            )?.imageUrl ?? '',
        }));
        const storageChanged =
          storageMeals.length !== mealsRef.current.length ||
          storageMeals.some(
            (meal, index) =>
              meal.storagePath !== mealsRef.current[index]?.storagePath,
          );

        if (storageChanged) {
          mealsRef.current = storageMeals;
          setResolvedMeals(storageMeals);
          setSelectedMealId((current) => {
            if (storageMeals.some((meal) => meal.id === current))
              return current;
            return (
              sortMealsByNutrient(storageMeals, initialNutrient)[0]?.id ?? null
            );
          });
        }

        if (!result.meals.length) {
          setMessage(
            'The 265 bucket is connected, but none of its JPG filenames match the nutrition dataset.',
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
    if (!selectedMealId || !orderedMeals.length) return;
    void requestImages(nearbyMealIds(orderedMeals, selectedMealId));
  }, [requestImages, orderedMeals, selectedMealId]);

  const detailMeal = detailMealId
    ? resolvedMeals.find((meal) => meal.id === detailMealId)
    : undefined;

  function commitNutrient(
    nutrient: NutrientKey,
    position: number,
    selectedIndex = 0,
  ) {
    const nutrientOrder = sortMealsByNutrient(resolvedMeals, nutrient);
    setSpectrumPosition(position);
    setSelectedNutrient(nutrient);
    setIsChoosingColor(false);
    setSelectedMealId(nutrientOrder[selectedIndex]?.id ?? null);
    setDetailMealId(null);
  }

  function commitPosition(position: number) {
    const definition = nutrientForSpectrumPosition(
      position,
      collectionSpectrumSegments,
    );
    const segment = collectionSpectrumSegments.find(
      (candidate) => candidate.nutrient.key === definition.key,
    );
    const progress = segment
      ? Math.min(1, Math.max(0, (position - segment.start) / segment.width))
      : 0;
    const selectedIndex = Math.round(
      progress * Math.max(0, resolvedMeals.length - 1),
    );
    commitNutrient(definition.key, position, selectedIndex);
  }

  function selectNutrient(nutrient: NutrientKey) {
    const segment = collectionSpectrumSegments.find(
      (candidate) => candidate.nutrient.key === nutrient,
    );
    commitNutrient(nutrient, segment?.start ?? 0);
  }

  return (
    <main className="collection-shell">
      <ColorSpectrum
        position={spectrumPosition}
        nutrient={previewNutrient}
        segments={collectionSpectrumSegments}
        onStart={() => setIsChoosingColor(true)}
        onPreview={(position) => {
          setIsChoosingColor(true);
          setSpectrumPosition(position);
        }}
        onCommit={commitPosition}
        onSelect={selectNutrient}
      />

      {detailMeal ? (
        <MealDetail meal={detailMeal} onClose={() => setDetailMealId(null)} />
      ) : (
        <ColorFilmstrip
          meals={orderedMeals}
          nutrientLabel={nutrientByKey[selectedNutrient].label}
          selectedId={selectedMealId}
          loading={loading}
          message={message}
          isChoosingColor={isChoosingColor}
          onNeedImages={requestImages}
          onCenter={(meal) => {
            setIsChoosingColor(false);
            setSelectedMealId(meal.id);
          }}
          onOpen={(meal) => setDetailMealId(meal.id)}
        />
      )}
    </main>
  );
}
