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
import { nutrientByKey, nutrientKeys } from '@/lib/nutrients';
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

function orbStyle(meal: CollectionMeal) {
  const minimumVisibleShare = 1.5;
  const weighted = nutrientKeys.map((key) =>
    Math.pow(Math.max(0, meal.nutrients[key].normalizedPercent), 2),
  );
  const total = weighted.reduce((sum, value) => sum + value, 0);
  const distributable = 100 - minimumVisibleShare * nutrientKeys.length;
  const shares = weighted.map(
    (value) =>
      minimumVisibleShare +
      (total > 0
        ? (value / total) * distributable
        : distributable / weighted.length),
  );
  const stops = shares.flatMap((share, index) => {
    const start = shares
      .slice(0, index)
      .reduce((sum, previous) => sum + previous, 0);
    const end = index === shares.length - 1 ? 100 : start + share;
    const color = nutrientByKey[nutrientKeys[index]].color;
    return [`${color} ${start}%`, `${color} ${end}%`];
  });
  const strongestIndex = weighted.reduce(
    (strongest, value, index) =>
      value > weighted[strongest] ? index : strongest,
    0,
  );

  return {
    '--index-orb-spectrum': `conic-gradient(from -90deg, ${stops.join(', ')})`,
    '--index-orb-dominant': nutrientByKey[nutrientKeys[strongestIndex]].color,
  } as CSSProperties;
}

function IndexOrb({ meal }: { meal: CollectionMeal }) {
  return (
    <span className={styles.orbWrap} aria-hidden="true">
      <span className={styles.orb} style={orbStyle(meal)} />
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
