'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- signed Supabase URLs are dynamic; plain anchors avoid the vinext Link hydration mismatch */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { knownImageStoragePaths } from '@/lib/image-colors';
import type { CollectionMeal } from '@/lib/meals';
import { nutrientByKey, nutrientKeys, type NutrientKey } from '@/lib/nutrients';
import {
  loadStorageImageUrl,
  mealsForStoragePaths,
  storageConfigured,
  type SupabaseStorageConfig,
} from '@/lib/supabase-storage';
import styles from './index-page.module.css';

type IndexPageProps = {
  config: SupabaseStorageConfig;
};

type IndexMode = 'photos' | 'orbs';

const gridPattern = [
  'portrait',
  'portrait',
  'wide',
  'tall',
  'portrait',
  'square',
  'square',
  'tall',
  'wide',
  'portrait',
  'landscape',
  'portrait',
] as const;

const blobPositions: Record<NutrientKey, readonly [number, number]> = {
  protein: [30, 30],
  carbohydrate: [68, 35],
  totalFat: [60, 70],
  fiber: [21, 67],
  sugar: [36, 78],
  sodium: [80, 55],
  potassium: [17, 45],
  calcium: [57, 17],
  iron: [78, 80],
};

const orbShapes = [
  '67% 33% 61% 39% / 43% 66% 34% 57%',
  '39% 61% 32% 68% / 63% 41% 59% 37%',
  '61% 39% 70% 30% / 36% 64% 42% 58%',
  '34% 66% 43% 57% / 69% 38% 62% 31%',
] as const;

function mealHash(meal: CollectionMeal) {
  return Array.from(meal.storagePath).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
}

function orbStyle(meal: CollectionMeal) {
  const strongest = nutrientKeys.reduce((current, key) =>
    meal.orbVisualPercent[key] > meal.orbVisualPercent[current] ? key : current,
  );
  const hash = mealHash(meal);
  const intensity = Math.min(
    1.13,
    Math.max(0.96, 0.96 + (meal.calories / 1600) * 0.17),
  );

  return {
    '--index-orb-dominant': nutrientByKey[strongest].color,
    '--index-orb-radius': orbShapes[hash % orbShapes.length],
    '--index-orb-rotation': `${(hash % 9) - 4}deg`,
    '--index-orb-scale-x': 0.94 + (hash % 7) * 0.018,
    '--index-orb-scale-y': 0.95 + ((hash >>> 3) % 7) * 0.016,
    '--index-orb-intensity': intensity,
  } as CSSProperties;
}

function orbLayers(meal: CollectionMeal) {
  const total = nutrientKeys.reduce(
    (sum, key) => sum + meal.orbVisualPercent[key],
    0,
  );

  return nutrientKeys
    .map((key) => {
      const percent = (meal.orbVisualPercent[key] / total) * 100;
      const proportion = Math.sqrt(percent / 100);
      const [x, y] = blobPositions[key];
      return {
        key,
        percent,
        style: {
          '--blob-color': nutrientByKey[key].color,
          '--blob-x': `${x}%`,
          '--blob-y': `${y}%`,
          '--blob-size': `${Math.max(22, proportion * 145)}%`,
          '--blob-opacity': Math.min(1, 0.72 + proportion * 0.42),
          '--blob-blur': `${Math.max(1.5, 6 - proportion * 7)}px`,
        } as CSSProperties,
      };
    })
    .sort((first, second) => second.percent - first.percent);
}

function IndexOrb({ meal }: { meal: CollectionMeal }) {
  return (
    <span className={styles.orbWrap} aria-hidden="true">
      <span className={styles.orb} style={orbStyle(meal)}>
        {orbLayers(meal).map(({ key, style }) => (
          <span className={styles.orbBlob} key={key} style={style} />
        ))}
        <span className={styles.orbLight} />
      </span>
    </span>
  );
}

export default function IndexPage({ config }: IndexPageProps) {
  const [mode, setMode] = useState<IndexMode>('photos');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [collection, setCollection] = useState<CollectionMeal[]>(() =>
    mealsForStoragePaths(knownImageStoragePaths()),
  );
  const collectionRef = useRef(collection);
  const gridRef = useRef<HTMLDivElement>(null);
  const requests = useRef(new Set<string>());
  const connected = storageConfigured(config);

  const requestImages = useCallback(
    async (mealIds: readonly string[]) => {
      const wanted = new Set(mealIds);
      const targets = collectionRef.current.filter(
        (meal) =>
          wanted.has(meal.id) &&
          !meal.imageUrl &&
          !requests.current.has(meal.storagePath),
      );
      if (!targets.length || !connected) return;

      targets.forEach((meal) => requests.current.add(meal.storagePath));
      const results = await Promise.allSettled(
        targets.map(async (meal) => ({
          id: meal.id,
          storagePath: meal.storagePath,
          imageUrl: await loadStorageImageUrl(config, meal.storagePath),
        })),
      );
      const urls = new Map<string, string>();
      results.forEach((result, index) => {
        requests.current.delete(targets[index].storagePath);
        if (result.status === 'fulfilled') {
          urls.set(result.value.id, result.value.imageUrl);
        }
      });
      if (!urls.size) return;

      setCollection((current) => {
        const next = current.map((meal) => {
          const imageUrl = urls.get(meal.id);
          return imageUrl ? { ...meal, imageUrl } : meal;
        });
        collectionRef.current = next;
        return next;
      });
    },
    [config, connected],
  );

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.flatMap((entry) => {
          if (!entry.isIntersecting) return [];
          const id = (entry.target as HTMLElement).dataset.mealId;
          return id ? [id] : [];
        });
        if (visible.length) void requestImages(visible);
      },
      { rootMargin: '420px 0px', threshold: 0.01 },
    );

    grid
      .querySelectorAll<HTMLElement>('[data-meal-id]')
      .forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [requestImages]);

  function selectMode(nextMode: IndexMode) {
    setMode(nextMode);
    setFlippedId(null);
  }

  return (
    <main className={styles.indexShell}>
      <header className={styles.topBar}>
        <a className={styles.indexTitle} href="/index">
          265 INDEX
        </a>
        <div className={styles.viewSwitch} aria-label="Index view">
          <button
            type="button"
            className={mode === 'photos' ? styles.active : undefined}
            aria-pressed={mode === 'photos'}
            onClick={() => selectMode('photos')}
          >
            ALL PHOTOS
          </button>
          <button
            type="button"
            className={mode === 'orbs' ? styles.active : undefined}
            aria-pressed={mode === 'orbs'}
            onClick={() => selectMode('orbs')}
          >
            COLOR ORBS
          </button>
        </div>
        <a className={styles.collectionLink} href="/">
          NUTRIENT VIEW ↗
        </a>
      </header>

      <section
        className={styles.indexGrid}
        ref={gridRef}
        aria-label={
          mode === 'photos' ? 'All meal photographs' : 'All nutrient color orbs'
        }
      >
        {collection.map((meal, index) => {
          const showPhotoFirst = mode === 'photos';
          const flipped = flippedId === meal.id;
          return (
            <button
              type="button"
              key={meal.id}
              data-meal-id={meal.id}
              className={`${styles.card} ${styles[gridPattern[index % gridPattern.length]]} ${flipped ? styles.flipped : ''}`}
              aria-label={`${showPhotoFirst ? 'Reveal color orb for' : 'Reveal photograph of'} ${meal.title}`}
              onClick={() => setFlippedId(flipped ? null : meal.id)}
            >
              <span className={styles.cardInner}>
                <span className={`${styles.cardFace} ${styles.cardFront}`}>
                  {showPhotoFirst ? (
                    meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.image.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className={styles.placeholder} aria-hidden="true" />
                    )
                  ) : (
                    <IndexOrb meal={meal} />
                  )}
                </span>
                <span className={`${styles.cardFace} ${styles.cardBack}`}>
                  {showPhotoFirst ? (
                    <IndexOrb meal={meal} />
                  ) : meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.image.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className={styles.placeholder} aria-hidden="true" />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}
