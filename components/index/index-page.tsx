'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- signed Supabase URLs are dynamic; plain anchors avoid the vinext Link hydration mismatch */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import InfoPopover from '@/components/info-popover';
import { knownImageStoragePaths } from '@/lib/image-colors';
import type { CollectionMeal, Meal } from '@/lib/meals';
import { nutrientNeonProfile } from '@/lib/nutrient-visuals';
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

const compositionNames = [
  'central-pool',
  'edge-current',
  'rising-diagonal',
  'falling-diagonal',
  'vertical-tide',
  'horizontal-tide',
  'off-center-vortex',
] as const;

const motionClasses = [
  styles.fieldMotionA,
  styles.fieldMotionB,
  styles.fieldMotionC,
  styles.fieldMotionD,
  styles.fieldMotionE,
  styles.fieldMotionF,
] as const;

const nutrientGradient = `linear-gradient(90deg, ${nutrientKeys
  .map((key) => nutrientByKey[key].color)
  .join(', ')})`;

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed: number, salt: number) {
  let value = seed ^ Math.imul(salt + 1, 0x9e3779b1);
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967295;
}

function seededRange(
  seed: number,
  salt: number,
  minimum: number,
  maximum: number,
) {
  return minimum + seededUnit(seed, salt) * (maximum - minimum);
}

function mealHash(meal: Meal) {
  return hashString(meal.image.storagePath);
}

function organicRadius(seed: number, offset = 0) {
  const values = Array.from({ length: 8 }, (_, index) =>
    Math.round(seededRange(seed, offset + index, 31, 69)),
  );
  return `${values[0]}% ${values[1]}% ${values[2]}% ${values[3]}% / ${values[4]}% ${values[5]}% ${values[6]}% ${values[7]}%`;
}

function compositionPoint(mealSeed: number, nutrientSeed: number) {
  const compositionIndex = mealSeed % compositionNames.length;
  const u = seededUnit(nutrientSeed, 4);
  const v = seededUnit(nutrientSeed, 5);
  const jitterX = seededRange(nutrientSeed, 6, -11, 11);
  const jitterY = seededRange(nutrientSeed, 7, -11, 11);
  const mealAngle = seededRange(mealSeed, 2, 0, Math.PI * 2);

  switch (compositionIndex) {
    case 0: {
      const anchorX = seededRange(mealSeed, 7, 37, 63);
      const anchorY = seededRange(mealSeed, 8, 37, 63);
      return [anchorX + (u - 0.5) * 48, anchorY + (v - 0.5) * 48] as const;
    }
    case 1: {
      const angle = mealAngle + u * Math.PI * 2;
      const radius = 29 + v * 23;
      return [
        50 + Math.cos(angle) * radius + jitterX * 0.25,
        50 + Math.sin(angle) * radius + jitterY * 0.25,
      ] as const;
    }
    case 2:
      return [14 + u * 72 + jitterX * 0.4, 82 - u * 64 + jitterY] as const;
    case 3:
      return [14 + u * 72 + jitterX * 0.4, 18 + u * 64 + jitterY] as const;
    case 4:
      return [
        (u > 0.5 ? 67 : 33) + jitterX,
        14 + v * 72 + jitterY * 0.35,
      ] as const;
    case 5:
      return [
        14 + u * 72 + jitterX * 0.35,
        (v > 0.5 ? 67 : 33) + jitterY,
      ] as const;
    default: {
      const angle = mealAngle + u * Math.PI * 1.7;
      const radius = 10 + v * 42;
      const anchorX = seededRange(mealSeed, 10, 40, 60);
      const anchorY = seededRange(mealSeed, 11, 40, 60);
      return [
        anchorX + Math.cos(angle) * radius,
        anchorY + Math.sin(angle) * radius,
      ] as const;
    }
  }
}

function orbStyle(meal: Meal) {
  const strongest = nutrientKeys.reduce((current, key) =>
    meal.orbVisualPercent[key] > meal.orbVisualPercent[current] ? key : current,
  );
  const hash = mealHash(meal);
  const intensity = Math.min(
    1.13,
    Math.max(0.96, 0.96 + (meal.calories / 1600) * 0.17),
  );
  const scaleX = seededRange(hash, 31, 0.91, 1.08);
  const scaleY = seededRange(hash, 32, 0.91, 1.08);
  const breatheX = seededRange(hash, 35, 0.975, 1.035);
  const breatheY = seededRange(hash, 36, 0.975, 1.035);
  const driftX = seededRange(hash, 33, -4, 4);
  const driftY = seededRange(hash, 34, -4, 4);
  const rotation = seededRange(hash, 30, -8, 8);

  return {
    '--index-orb-dominant': nutrientByKey[strongest].color,
    '--index-orb-radius': organicRadius(hash, 20),
    '--index-orb-rotation': `${rotation.toFixed(2)}deg`,
    '--index-orb-rotation-mid': `${(rotation + seededRange(hash, 39, -4.8, 4.8)).toFixed(2)}deg`,
    '--index-orb-rotation-end': `${(rotation + seededRange(hash, 40, -3.4, 3.4)).toFixed(2)}deg`,
    '--index-orb-scale-x': scaleX.toFixed(3),
    '--index-orb-scale-y': scaleY.toFixed(3),
    '--index-orb-scale-x-mid': (scaleX * breatheX).toFixed(3),
    '--index-orb-scale-y-mid': (scaleY * breatheY).toFixed(3),
    '--index-orb-scale-x-end': (scaleX * breatheY).toFixed(3),
    '--index-orb-scale-y-end': (scaleY * breatheX).toFixed(3),
    '--index-orb-intensity': intensity.toFixed(3),
    '--orb-drift-x': `${driftX.toFixed(2)}%`,
    '--orb-drift-y': `${driftY.toFixed(2)}%`,
    '--orb-drift-x-end': `${(-driftX * 0.55).toFixed(2)}%`,
    '--orb-drift-y-end': `${(-driftY * 0.55).toFixed(2)}%`,
    '--orb-duration': `${seededRange(hash, 37, 34, 68).toFixed(2)}s`,
    '--orb-delay': `${(-seededRange(hash, 38, 0, 60)).toFixed(2)}s`,
    '--orb-direction':
      seededUnit(hash, 41) > 0.5 ? 'alternate' : 'alternate-reverse',
    '--orb-mask-x': `${seededRange(hash, 42, 46, 54).toFixed(2)}%`,
    '--orb-mask-y': `${seededRange(hash, 43, 46, 54).toFixed(2)}%`,
    '--orb-mask-rx': `${seededRange(hash, 44, 57, 64).toFixed(2)}%`,
    '--orb-mask-ry': `${seededRange(hash, 45, 56, 64).toFixed(2)}%`,
    '--orb-light-x': `${seededRange(hash, 46, 22, 46).toFixed(2)}%`,
    '--orb-light-y': `${seededRange(hash, 47, 18, 43).toFixed(2)}%`,
    '--orb-glow-x': `${seededRange(hash, 48, 55, 82).toFixed(2)}%`,
    '--orb-glow-y': `${seededRange(hash, 49, 57, 84).toFixed(2)}%`,
  } as CSSProperties;
}

function orbLayers(meal: Meal) {
  const total = nutrientKeys.reduce(
    (sum, key) => sum + meal.orbVisualPercent[key],
    0,
  );

  return nutrientKeys
    .map((key) => {
      const percent = (meal.orbVisualPercent[key] / total) * 100;
      const neon = nutrientNeonProfile(
        key,
        meal.nutrients[key].normalizedPercent,
      );
      const displayColor =
        neon.strength > 0.04 && neon.color
          ? neon.color
          : nutrientByKey[key].color;
      const nutrientSeed = hashString(`${meal.image.storagePath}:${key}`);
      const mealSeed = mealHash(meal);
      const [rawX, rawY] = compositionPoint(mealSeed, nutrientSeed);
      const x = Math.min(92, Math.max(8, rawX));
      const y = Math.min(92, Math.max(8, rawY));
      const specialSizeBoost =
        1 + neon.strength * (key === 'sugar' ? 0.85 : 0.65);
      const baseSize = Math.sqrt(percent) * 14.8 * specialSizeBoost;
      const isAccent = percent < 8;
      const aspect = isAccent
        ? seededRange(nutrientSeed, 11, 0.34, 2.94)
        : seededRange(nutrientSeed, 11, 0.55, 1.82);
      const width = baseSize * Math.sqrt(aspect);
      const height = baseSize / Math.sqrt(aspect);
      const amplitude = seededRange(
        nutrientSeed,
        12,
        isAccent ? 5 : 8,
        isAccent ? 13 : 20,
      );
      const direction = seededRange(nutrientSeed, 13, 0, Math.PI * 2);
      const crossDirection =
        direction + seededRange(nutrientSeed, 14, 0.7, 2.15);
      const duration = isAccent
        ? seededRange(nutrientSeed, 15, 30, 59)
        : percent >= 18
          ? seededRange(nutrientSeed, 15, 17, 39)
          : seededRange(nutrientSeed, 15, 22, 50);
      const motionIndex = Math.floor(
        seededUnit(nutrientSeed, 16) * motionClasses.length,
      );
      const prominence = Math.min(
        0.99,
        0.49 + Math.sqrt(percent / 100) * 0.65 + neon.strength * 0.12,
      );
      const blur = Math.max(
        3.8,
        11.2 - Math.sqrt(percent) * 0.78 - neon.strength * 2.2,
      );
      const depth = Math.floor(seededRange(nutrientSeed, 17, 1, 20));
      const visualDepth = depth + Math.round(neon.strength * 30);
      return {
        key,
        percent,
        motionClass: motionClasses[motionIndex],
        depth,
        style: {
          '--blob-color': displayColor,
          '--blob-x': `${x.toFixed(2)}%`,
          '--blob-y': `${y.toFixed(2)}%`,
          '--blob-width': `${width.toFixed(2)}%`,
          '--blob-height': `${height.toFixed(2)}%`,
          '--blob-opacity': prominence.toFixed(3),
          '--blob-opacity-low': Math.max(0.34, prominence - 0.16).toFixed(3),
          '--blob-blur': `${blur.toFixed(2)}px`,
          '--blob-blur-alt': `${(blur + seededRange(nutrientSeed, 18, 0.8, 3.4)).toFixed(2)}px`,
          '--blob-saturation': (1.2 + neon.strength * 0.95).toFixed(3),
          '--blob-brightness': (1 + neon.strength * 0.24).toFixed(3),
          '--blob-glow-radius': `${(neon.strength * 18).toFixed(2)}px`,
          '--blob-glow-color':
            neon.strength > 0.02 && neon.color
              ? `color-mix(in srgb, ${neon.color} ${(28 + neon.strength * 46).toFixed(1)}%, transparent)`
              : 'transparent',
          '--blob-radius': organicRadius(nutrientSeed, 40),
          '--blob-radius-1': organicRadius(nutrientSeed, 50),
          '--blob-radius-2': organicRadius(nutrientSeed, 60),
          '--blob-angle': `${seededRange(nutrientSeed, 19, -175, 175).toFixed(2)}deg`,
          '--blob-focus-x': `${seededRange(nutrientSeed, 20, 30, 70).toFixed(2)}%`,
          '--blob-focus-y': `${seededRange(nutrientSeed, 21, 30, 70).toFixed(2)}%`,
          '--blob-duration': `${duration.toFixed(2)}s`,
          '--blob-delay': `${(-seededRange(nutrientSeed, 22, 0, duration)).toFixed(2)}s`,
          '--blob-direction':
            seededUnit(nutrientSeed, 31) > 0.5
              ? 'alternate'
              : 'alternate-reverse',
          '--blob-ease':
            seededUnit(nutrientSeed, 23) > 0.5
              ? 'cubic-bezier(0.37, 0, 0.63, 1)'
              : 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
          '--drift-x1': `${(Math.cos(direction) * amplitude).toFixed(2)}%`,
          '--drift-y1': `${(Math.sin(direction) * amplitude).toFixed(2)}%`,
          '--drift-x2': `${(Math.cos(crossDirection) * amplitude * 0.78).toFixed(2)}%`,
          '--drift-y2': `${(Math.sin(crossDirection) * amplitude * 0.78).toFixed(2)}%`,
          '--drift-x3': `${(Math.cos(direction + Math.PI) * amplitude * 0.56).toFixed(2)}%`,
          '--drift-y3': `${(Math.sin(direction + Math.PI) * amplitude * 0.56).toFixed(2)}%`,
          '--blob-rotate-1': `${seededRange(nutrientSeed, 24, -22, 22).toFixed(2)}deg`,
          '--blob-rotate-2': `${seededRange(nutrientSeed, 25, -38, 38).toFixed(2)}deg`,
          '--blob-scale-x1': seededRange(nutrientSeed, 26, 0.88, 1.14).toFixed(
            3,
          ),
          '--blob-scale-y1': seededRange(nutrientSeed, 27, 0.88, 1.14).toFixed(
            3,
          ),
          '--blob-scale-x2': seededRange(nutrientSeed, 28, 0.9, 1.12).toFixed(
            3,
          ),
          '--blob-scale-y2': seededRange(nutrientSeed, 29, 0.9, 1.12).toFixed(
            3,
          ),
          '--blob-skew': `${seededRange(nutrientSeed, 30, -8, 8).toFixed(2)}deg`,
          zIndex: visualDepth,
        } as CSSProperties,
      };
    })
    .sort((first, second) => first.depth - second.depth);
}

export function NutrientOrbVisual({
  meal,
  detail = false,
  active = false,
}: {
  meal: Meal;
  detail?: boolean;
  active?: boolean;
}) {
  const seed = mealHash(meal);
  return (
    <span
      className={`${styles.orbWrap} ${detail ? styles.orbDetail : ''} ${active ? styles.orbActive : ''}`}
      aria-hidden="true"
    >
      <span
        className={styles.orb}
        style={orbStyle(meal)}
        data-orb-seed={seed}
        data-composition={compositionNames[seed % compositionNames.length]}
      >
        {orbLayers(meal).map(({ key, percent, motionClass, style }) => (
          <span
            className={`${styles.orbBlob} ${motionClass}`}
            key={key}
            data-nutrient={key}
            data-percent={percent.toFixed(2)}
            style={style}
          />
        ))}
        <span className={styles.orbLight} />
      </span>
    </span>
  );
}

export default function IndexPage({ config }: IndexPageProps) {
  const [mode, setMode] = useState<IndexMode>('photos');
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientKey | null>(
    null,
  );
  const [collection, setCollection] = useState<CollectionMeal[]>(() =>
    mealsForStoragePaths(knownImageStoragePaths()),
  );
  const collectionRef = useRef(collection);
  const gridRef = useRef<HTMLDivElement>(null);
  const requests = useRef(new Set<string>());
  const connected = storageConfigured(config);
  const orderedCollection = useMemo(() => {
    if (!selectedNutrient) return collection;

    const originalOrder = new Map(
      collection.map((meal, index) => [meal.id, index]),
    );
    return [...collection].sort(
      (first, second) =>
        second.orbVisualPercent[selectedNutrient] -
          first.orbVisualPercent[selectedNutrient] ||
        (originalOrder.get(first.id) ?? 0) -
          (originalOrder.get(second.id) ?? 0),
    );
  }, [collection, selectedNutrient]);

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
          (entry.target as HTMLElement).dataset.orbActive = entry.isIntersecting
            ? 'true'
            : 'false';
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
  }

  function selectNutrient(nextNutrient: NutrientKey | null) {
    setSelectedNutrient(nextNutrient);
  }

  return (
    <main className={styles.indexShell}>
      <div className={styles.indexBody}>
        <aside
          className={styles.nutrientBrowser}
          aria-label="Browse by nutrient"
        >
          <div className={styles.viewSwitch} aria-label="Index view">
            <button
              type="button"
              className={mode === 'photos' ? styles.active : undefined}
              aria-pressed={mode === 'photos'}
              onClick={() => selectMode('photos')}
            >
              PHOTO
            </button>
            <button
              type="button"
              className={mode === 'orbs' ? styles.active : undefined}
              aria-pressed={mode === 'orbs'}
              onClick={() => selectMode('orbs')}
            >
              ORBS
            </button>
          </div>

          <div
            className={`${styles.filterStack} ${selectedNutrient ? styles.hasSelection : ''}`}
          >
            <button
              type="button"
              className={`${styles.filterButton} ${selectedNutrient === null ? styles.filterActive : ''}`}
              style={
                {
                  '--filter-background': nutrientGradient,
                } as CSSProperties
              }
              aria-pressed={selectedNutrient === null}
              onClick={() => selectNutrient(null)}
            >
              <span>SHOW ALL</span>
              <i aria-hidden="true" />
            </button>
            <span className={styles.filterHeading}>Search By</span>
            {nutrientKeys.map((key) => {
              const nutrient = nutrientByKey[key];
              const active = selectedNutrient === key;
              return (
                <button
                  type="button"
                  key={key}
                  className={`${styles.filterButton} ${active ? styles.filterActive : ''}`}
                  style={
                    {
                      '--filter-background': nutrient.color,
                    } as CSSProperties
                  }
                  aria-pressed={active}
                  aria-label={`Order meals by ${nutrient.label}, highest percentage first`}
                  onClick={() => selectNutrient(key)}
                >
                  <span>{nutrient.shortLabel}</span>
                  <i aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </aside>

        <section
          className={styles.indexGrid}
          ref={gridRef}
          aria-label={
            mode === 'photos'
              ? 'All meal photographs'
              : 'All nutrient color orbs'
          }
        >
          {orderedCollection.map((meal, index) => {
            const showPhotoFirst = mode === 'photos';
            return (
              <a
                href={`/meal/${meal.id}`}
                key={meal.id}
                data-meal-id={meal.id}
                className={`${styles.card} ${styles[gridPattern[index % gridPattern.length]]}`}
                aria-label={`View nutrition details for ${meal.title}`}
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
                        <span
                          className={styles.placeholder}
                          aria-hidden="true"
                        />
                      )
                    ) : (
                      <NutrientOrbVisual meal={meal} />
                    )}
                  </span>
                  <span className={`${styles.cardFace} ${styles.cardBack}`}>
                    {showPhotoFirst ? (
                      <NutrientOrbVisual meal={meal} />
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
              </a>
            );
          })}
        </section>
      </div>
      <InfoPopover label="About this nutrient index">
        <p>
          Each color represents a type of nutrient. Every meal has its own
          color. Click on one meal/orb to see detailed nutrient composition.
        </p>
        <p>
          <strong>Browse by nutrient</strong>
          Meals are organized by the relative proportion of each nutrient within
          the meal’s overall nutritional profile, rather than by its absolute
          amount. A meal with less protein in grams may therefore rank higher if
          protein makes up a larger share of that meal’s overall nutritional
          composition.
        </p>
        <p>
          <strong>ORB VISUALIZATION</strong>
          Each Orb translates the estimated nutritional profile of a meal into a
          data-informed composition of color. The size and prominence of each
          color are determined by a set of <b>visual weighting coefficients</b>,
          rather than by literal nutrient mass or % Daily Value.
        </p>
        <p>
          Protein, carbohydrate, and fat form the primary color body. Their
          estimated amounts are weighted by factors of 4, 4, and 9. This
          structure is informed by their relative energy contribution, but is
          used here as a{' '}
          <b>design decision rather than a nutritional recommendation</b>. In
          particular, fat receives greater visual emphasis because of its higher
          energy density, making fat-rich meals more visually apparent within
          the collection.
        </p>
        <p>
          Fiber and total sugar form secondary color fields. Fiber is weighted
          at 2 to remain visible without competing with the primary
          macronutrients. Total sugar is weighted at 1.5 because sugar is
          already included within total carbohydrate; the reduced weight allows
          sugar to appear as an additional signal without giving it the same
          structural emphasis twice.
        </p>
        <p>
          Sodium, potassium, calcium, and iron are normalized against their
          reference values and rendered only as accent layers. Together, these
          minerals are limited to 15% of the total body’s visual weight so that
          micronutrients cannot visually overpower the principal nutrients.
        </p>
        <p>
          The resulting weights are normalized into a single visual composition.{' '}
          <b>
            A larger color field therefore means that a nutrient has greater
            prominence within this visualization system—not that it literally
            occupies that percentage of the food.
          </b>{' '}
          Calories do not receive their own color; instead, they influence the
          Orb’s overall luminosity and intensity.
        </p>
        <p>
          <b>
            Orb Visual % is a design visualization value. It is not % Daily
            Value, a dietary recommendation, or a literal chemical percentage of
            the meal.
          </b>
        </p>
      </InfoPopover>
    </main>
  );
}
