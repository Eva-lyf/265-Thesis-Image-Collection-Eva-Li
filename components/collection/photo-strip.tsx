'use client';
/* oxlint-disable next/no-img-element -- the strip uses local and temporary object URLs */

import { useEffect, useRef } from 'react';
import { hex } from '@/lib/color';
import type { Photo } from '@/lib/collection';

type PhotoStripProps = {
  photos: Photo[];
  currentId?: string;
  loading: boolean;
  previewing: boolean;
  revealKey: number;
  onSelect: (photo: Photo) => void;
};

export function PhotoStrip({
  photos,
  currentId,
  loading,
  previewing,
  revealKey,
  onSelect,
}: PhotoStripProps) {
  const photoButtons = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!currentId) return;
    photoButtons.current.get(currentId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [currentId, revealKey]);

  return (
    <section
      className={`filmstrip ${previewing ? 'is-previewing' : ''}`}
      aria-label="Closest colors"
    >
      {photos.length ? (
        <div className="thumbs" key={revealKey}>
          {photos.map((photo) => (
            <button
              ref={(node) => {
                if (node) photoButtons.current.set(photo.id, node);
                else photoButtons.current.delete(photo.id);
              }}
              key={photo.id}
              className={`thumbnail ${currentId === photo.id ? 'selected' : ''}`}
              onClick={() => onSelect(photo)}
              title={`${photo.title} · ${hex(photo.rgb)}`}
              aria-label={`View ${photo.title}`}
              aria-pressed={currentId === photo.id}
            >
              <img src={photo.url} alt={photo.title} />
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-strip">
          {loading
            ? 'Loading your collection…'
            : 'Your images will find their place along the spectrum.'}
        </div>
      )}
    </section>
  );
}
