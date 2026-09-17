'use client';
/* oxlint-disable next/no-img-element -- signed Supabase URLs are dynamic */

import { useEffect, useMemo, useRef } from 'react';
import type { CollectionMeal } from '@/lib/meals';

type ColorFilmstripProps = {
  meals: readonly CollectionMeal[];
  nutrientLabel: string;
  selectedId: string | null;
  loading: boolean;
  message: string;
  isChoosingColor: boolean;
  onNeedImages: (mealIds: readonly string[]) => void;
  onCenter: (meal: CollectionMeal) => void;
  onOpen: (meal: CollectionMeal) => void;
};

export function ColorFilmstrip({
  meals,
  nutrientLabel,
  selectedId,
  loading,
  message,
  isChoosingColor,
  onNeedImages,
  onCenter,
  onOpen,
}: ColorFilmstripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticScroll = useRef(false);
  const sortedMeals = useMemo(() => [...meals], [meals]);
  const loopedMeals = useMemo(
    () => [...sortedMeals, ...sortedMeals, ...sortedMeals],
    [sortedMeals],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !loopedMeals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const ids = new Set<string>();
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.mealId;
          if (id) ids.add(id);
        }
        if (ids.size) onNeedImages([...ids]);
      },
      {
        root: scroller,
        rootMargin: '0px 100px',
        threshold: 0.01,
      },
    );

    scroller
      .querySelectorAll<HTMLElement>('[data-meal-id]')
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [loopedMeals, onNeedImages]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !selectedId || !sortedMeals.length) return;

    const matches = [
      ...scroller.querySelectorAll<HTMLElement>('[data-meal-id]'),
    ].filter((element) => element.dataset.mealId === selectedId);
    if (!matches.length) return;

    const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    const nearest =
      scroller.scrollLeft < 2
        ? matches[Math.floor(matches.length / 2)]
        : matches.reduce(
            (closest, element) => {
              const center = element.offsetLeft + element.offsetWidth / 2;
              const closestCenter =
                closest.offsetLeft + closest.offsetWidth / 2;
              return Math.abs(center - viewportCenter) <
                Math.abs(closestCenter - viewportCenter)
                ? element
                : closest;
            },
            matches[Math.floor(matches.length / 2)],
          );

    const target =
      nearest.offsetLeft + nearest.offsetWidth / 2 - scroller.clientWidth / 2;
    programmaticScroll.current = true;
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    scroller.scrollTo({ left: target, behavior: 'auto' });
    releaseTimer.current = setTimeout(() => {
      programmaticScroll.current = false;
    }, 720);
  }, [selectedId, sortedMeals]);

  function updateCenteredMeal() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    const elements = [
      ...scroller.querySelectorAll<HTMLElement>('[data-loop-index]'),
    ];
    const closest = elements.reduce<HTMLElement | undefined>(
      (current, element) => {
        if (!current) return element;
        const distance = Math.abs(
          element.offsetLeft + element.offsetWidth / 2 - viewportCenter,
        );
        const currentDistance = Math.abs(
          current.offsetLeft + current.offsetWidth / 2 - viewportCenter,
        );
        return distance < currentDistance ? element : current;
      },
      undefined,
    );
    if (!closest) return;
    const meal = loopedMeals[Number(closest.dataset.loopIndex)];
    if (meal && meal.id !== selectedId) onCenter(meal);
  }

  if (loading) {
    return (
      <output className="filmstrip-loading">
        <span />
        Reading the 265 collection…
      </output>
    );
  }

  if (!meals.length) {
    return (
      <output className="filmstrip-loading">
        {message || 'No photographs found.'}
      </output>
    );
  }

  return (
    <section
      className={`color-neighborhood ${isChoosingColor ? 'is-choosing' : ''}`}
      aria-label={`Meal photographs ordered by ${nutrientLabel}`}
      aria-busy={isChoosingColor}
    >
      <div className="filmstrip-fade filmstrip-fade-left" aria-hidden="true" />
      <div className="filmstrip-fade filmstrip-fade-right" aria-hidden="true" />
      <div
        className="color-filmstrip"
        ref={scrollerRef}
        onScroll={() => {
          if (programmaticScroll.current) return;
          if (scrollTimer.current) clearTimeout(scrollTimer.current);
          scrollTimer.current = setTimeout(updateCenteredMeal, 110);
        }}
      >
        {loopedMeals.map((meal, index) => {
          const selected = meal.id === selectedId;
          return (
            <button
              key={`${Math.floor(index / sortedMeals.length)}-${meal.id}`}
              className={`color-thumbnail ${selected ? 'selected' : ''}`}
              data-meal-id={meal.id}
              data-loop-index={index}
              onClick={() => (selected ? onOpen(meal) : onCenter(meal))}
              aria-label={
                selected ? `Open ${meal.title}` : `Center ${meal.title}`
              }
            >
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt=""
                  loading={selected ? 'eager' : 'lazy'}
                  fetchPriority={selected ? 'high' : 'auto'}
                  decoding="async"
                />
              ) : (
                <span className="color-thumbnail-placeholder" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
      <span className="center-guide" aria-hidden="true" />
    </section>
  );
}
