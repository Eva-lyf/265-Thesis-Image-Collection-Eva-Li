'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Supabase image URLs are signed at runtime; a plain fallback link avoids vinext Link hydration issues */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import InfoPopover from '@/components/info-popover';
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

type ActiveReading = 'nutrients' | 'meal' | null;
type NutrientConnector = {
  key: (typeof nutrientKeys)[number];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

function formatAmount(amount: number, unit: 'g' | 'mg') {
  const fractionDigits = amount < 10 ? 1 : 0;
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: fractionDigits })} ${unit}`;
}

export default function MealDetailPage({ meal, config }: MealDetailPageProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const [activeReading, setActiveReading] = useState<ActiveReading>(null);
  const [connectorSize, setConnectorSize] = useState({ width: 0, height: 0 });
  const [connectors, setConnectors] = useState<NutrientConnector[]>([]);
  const gridRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const orb = orbRef.current;
    const readout = readoutRef.current;
    if (!grid || !orb || !readout || !meal) return;

    const updateConnectors = () => {
      const gridBox = grid.getBoundingClientRect();
      const orbBox = orb.getBoundingClientRect();
      const centerX = orbBox.left - gridBox.left + orbBox.width / 2;
      const centerY = orbBox.top - gridBox.top + orbBox.height / 2;
      const radius = orbBox.width * 0.43;
      const rows = Array.from(
        readout.querySelectorAll<HTMLElement>('[data-nutrient-row]'),
      );

      setConnectorSize({ width: gridBox.width, height: gridBox.height });
      setConnectors(
        rows.map((row, index) => {
          const label = row.querySelector('strong')?.getBoundingClientRect();
          const rowBox = row.getBoundingClientRect();
          const angle =
            ((-72 + (144 * index) / Math.max(rows.length - 1, 1)) * Math.PI) /
            180;
          return {
            key: nutrientRows[index],
            startX: centerX + Math.cos(angle) * radius,
            startY: centerY + Math.sin(angle) * radius,
            endX: (label?.left ?? rowBox.left) - gridBox.left - 10,
            endY: rowBox.top - gridBox.top + rowBox.height / 2,
          };
        }),
      );
    };

    updateConnectors();
    const observer = new ResizeObserver(updateConnectors);
    observer.observe(grid);
    observer.observe(orb);
    observer.observe(readout);
    return () => observer.disconnect();
  }, [meal, nutrientRows]);

  function activateOnPointer(
    event: PointerEvent<HTMLButtonElement>,
    reading: Exclude<ActiveReading, null>,
  ) {
    if (event.pointerType !== 'touch') setActiveReading(reading);
  }

  function activateOnTouch(reading: Exclude<ActiveReading, null>) {
    if (window.matchMedia('(hover: none)').matches) setActiveReading(reading);
  }

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

      <section
        ref={gridRef}
        className={styles.detailGrid}
        aria-label={meal.title}
        data-active={activeReading ?? undefined}
      >
        <article className={styles.orbPanel}>
          <button
            ref={orbRef}
            type="button"
            className={styles.orbVisual}
            aria-label="Show nutrient distribution"
            onPointerEnter={(event) => activateOnPointer(event, 'nutrients')}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'touch') setActiveReading(null);
            }}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible'))
                setActiveReading('nutrients');
            }}
            onBlur={() => setActiveReading(null)}
            onClick={() => activateOnTouch('nutrients')}
          >
            <NutrientOrbVisual meal={meal} detail active />
          </button>
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
        </article>

        <article className={styles.photoPanel}>
          <button
            type="button"
            className={styles.photoFrame}
            aria-label="Show meal reading"
            onPointerEnter={(event) => activateOnPointer(event, 'meal')}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'touch') setActiveReading(null);
            }}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible'))
                setActiveReading('meal');
            }}
            onBlur={() => setActiveReading(null)}
            onClick={() => activateOnTouch('meal')}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={meal.image.alt} decoding="async" />
            ) : (
              <span className={styles.imagePlaceholder} aria-hidden="true" />
            )}
          </button>
          <div ref={readoutRef} className={styles.nutrientReadout}>
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
                    data-nutrient-row={key}
                  >
                    <strong>{nutrient.label}</strong>
                    <span>{percent}</span>
                    <small>{formatAmount(value.amount, nutrient.unit)}</small>
                  </div>
                );
              })}
            </div>
          </div>
          {imageFailed ? (
            <p className={styles.imageError}>IMAGE UNAVAILABLE</p>
          ) : null}
        </article>
        {connectors.length > 0 ? (
          <svg
            className={styles.nutrientConnectors}
            viewBox={`0 0 ${connectorSize.width} ${connectorSize.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {connectors.map((connector) => {
              const color = nutrientByKey[connector.key].color;
              const middleX =
                connector.startX + (connector.endX - connector.startX) * 0.56;
              return (
                <g key={connector.key}>
                  <path
                    d={`M ${connector.startX} ${connector.startY} C ${middleX} ${connector.startY}, ${middleX} ${connector.endY}, ${connector.endX} ${connector.endY}`}
                    stroke={color}
                    strokeWidth="1.2"
                    strokeDasharray="4 5"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={connector.startX}
                    cy={connector.startY}
                    r="5"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.8"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
        ) : null}
      </section>
      <InfoPopover label="About the nutrition calculations and guidance">
        <p>
          <strong>Hover to read</strong>
          Hover over the Orb to see its nutrient breakdown over the photo. Hover
          over the photo to read the meal suggestion over the Orb. On a touch
          screen, tap either one.
        </p>
        <p>
          <strong>Daily Value percentage</strong>
          %DV is calculated as the estimated nutrient amount in the pictured
          meal divided by the FDA Daily Value, multiplied by 100. The FDA uses
          5% DV or less as a general low threshold and 20% DV or more as a high
          threshold.
        </p>
        <p>
          <strong>Total sugar and Orb color</strong>
          Total sugar has no FDA Daily Value, so this project compares it with
          the collection’s static 90th-percentile total-sugar reference. Orb
          color area comes from the pre-analyzed relative share of the nine
          normalized nutrients; it is different from grams and from %DV.
        </p>
        <p>
          <strong>Meal guidance</strong>
          The next-meal note is a rule-based balancing cue from this static
          dataset, not an individualized meal prescription. FDA guidance uses
          %DV to balance higher- and lower-nutrient choices across the day; USDA
          MyPlate encourages fruits, vegetables, whole grains, and varied
          protein foods. There is no single required nutrient ratio for every
          meal. The total-sugar estimate cannot distinguish added from natural
          sugar.
        </p>
        <p>
          Sources:{' '}
          <a
            href="https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels"
            target="_blank"
            rel="noreferrer"
          >
            FDA Daily Value
          </a>{' '}
          ·{' '}
          <a
            href="https://www.myplate.gov/sites/default/files/2024-05/create-your-own-myplate-menu.pdf"
            target="_blank"
            rel="noreferrer"
          >
            USDA MyPlate
          </a>
        </p>
      </InfoPopover>
    </main>
  );
}
