'use client';
/* oxlint-disable next/no-img-element -- the viewer supports local object URLs */

import { ArrowUpRight } from 'lucide-react';
import { hex, rgbToHsl } from '@/lib/color';
import type { Photo } from '@/lib/collection';

type PhotoViewerProps = {
  photo?: Photo;
  connected: boolean;
  blend: number;
  hovering: boolean;
  loadingColor: boolean;
  revealKey: number;
  onBlendChange: (value: number) => void;
  onHoverChange: (hovering: boolean) => void;
  onMeasure: (id: string, width: number, height: number) => void;
  onOpenCollection: () => void;
};

export function PhotoViewer({
  photo,
  connected,
  blend,
  hovering,
  loadingColor,
  revealKey,
  onBlendChange,
  onHoverChange,
  onMeasure,
  onOpenCollection,
}: PhotoViewerProps) {
  if (!photo) {
    return (
      <div className="photo-panel">
        <button
          className="photo-stage empty-stage"
          aria-label="Open the collection manager"
          onClick={onOpenCollection}
        >
          <div className="empty-content">
            <span className="empty-symbol">＋</span>
            <h1>A collection in the making.</h1>
            <p>
              {connected
                ? 'Add your first image to begin exploring.'
                : 'Your Are.na images aren’t connected yet.'}
              <br />
              {connected
                ? 'Every photograph has a color to discover.'
                : 'Add a few images to try the experience.'}
            </p>
            <span className="empty-action">
              {connected ? 'Add images' : 'Try your images'}{' '}
              <ArrowUpRight size={13} />
            </span>
          </div>
        </button>
      </div>
    );
  }

  const amount = hovering ? 100 : blend;
  const frameRatio =
    photo.width && photo.height ? photo.width / photo.height : 1;
  const revealTextColor = rgbToHsl(photo.rgb)[2] > 58 ? '#222' : '#fff';

  return (
    <div className="photo-panel">
      <button
        className={`photo-stage image-stage ${frameRatio < 1 ? 'portrait' : 'landscape'} ${loadingColor ? 'is-loading' : ''}`}
        onPointerEnter={() => onHoverChange(true)}
        onPointerLeave={() => onHoverChange(false)}
        onFocus={() => onHoverChange(true)}
        onBlur={() => onHoverChange(false)}
        onClick={() => {
          onHoverChange(false);
          onBlendChange(blend === 100 ? 0 : 100);
        }}
        aria-label={`${photo.title}. Toggle image and blended color ${hex(photo.rgb)}.`}
        style={{
          background: hex(photo.rgb),
          aspectRatio:
            photo.width && photo.height
              ? `${photo.width}/${photo.height}`
              : '1/1',
        }}
      >
        <img
          key={`${photo.id}-${revealKey}`}
          src={photo.url}
          alt={photo.title}
          onLoad={(event) => {
            if (photo.width && photo.height) return;
            const width = event.currentTarget.naturalWidth;
            const height = event.currentTarget.naturalHeight;
            if (width && height) onMeasure(photo.id, width, height);
          }}
          style={{
            filter: loadingColor ? 'blur(32px)' : `blur(${amount * 0.55}px)`,
            opacity: loadingColor ? 0.08 : 1 - amount / 100,
            transform: loadingColor
              ? 'scale(1.06)'
              : `scale(${1 + amount * 0.003})`,
          }}
        />
        <span
          className="color-reveal"
          style={{ opacity: amount / 100, color: revealTextColor }}
        >
          <strong>{hex(photo.rgb)}</strong>
        </span>
      </button>
    </div>
  );
}
