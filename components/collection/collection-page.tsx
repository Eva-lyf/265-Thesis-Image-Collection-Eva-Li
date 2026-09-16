'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { CollectionManager } from './collection-manager';
import { ColorControls } from './color-controls';
import { PhotoStrip } from './photo-strip';
import { PhotoViewer } from './photo-viewer';
import { distance, hslToRgb, rgbToHsl, type RGB } from '@/lib/color';
import {
  configured,
  deletePhoto,
  listPhotos,
  uploadPhoto,
  type Config,
  type Photo,
} from '@/lib/collection';

type CollectionPageProps = {
  config: Config;
};

export default function CollectionPage({ config }: CollectionPageProps) {
  const connected = configured(config);
  const colorSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingColor = useRef<RGB | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hsl, setHsl] = useState<RGB>([28, 46, 68]);
  const [resultHsl, setResultHsl] = useState<RGB>([28, 46, 68]);
  const [previewHue, setPreviewHue] = useState<number | null>(null);
  const [stripRevealKey, setStripRevealKey] = useState(0);
  const [photoRevealKey, setPhotoRevealKey] = useState(0);
  const [colorResultsLoading, setColorResultsLoading] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [blend, setBlend] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(connected);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const selectedRgb = useMemo(() => hslToRgb(...resultHsl), [resultHsl]);
  const sortedPhotos = useMemo(
    () =>
      [...photos].sort(
        (a, b) => distance(a.rgb, selectedRgb) - distance(b.rgb, selectedRgb),
      ),
    [photos, selectedRgb],
  );
  const anchorPhoto = sortedPhotos[0];
  const currentPhoto =
    photos.find((photo) => photo.id === pickedId) ?? anchorPhoto;
  const surroundingPhotos = anchorPhoto
    ? sortedPhotos.filter((photo) => photo.id !== anchorPhoto.id)
    : [];
  const neighborhood = anchorPhoto
    ? [
        ...surroundingPhotos.filter((_, index) => index % 2 === 0).reverse(),
        anchorPhoto,
        ...surroundingPhotos.filter((_, index) => index % 2 === 1),
      ]
    : [];

  useEffect(() => {
    const cloudConfig = { url: config.url, key: config.key };
    let cancelled = false;
    let syncing = false;

    const syncPhotos = async () => {
      if (!connected || syncing) {
        if (!connected) setLoading(false);
        return;
      }

      syncing = true;
      try {
        const cloudPhotos = await listPhotos(cloudConfig);
        if (!cancelled) setPhotos(cloudPhotos);
      } catch (error) {
        if (!cancelled) setMessage((error as Error).message);
      } finally {
        syncing = false;
        if (!cancelled) setLoading(false);
      }
    };

    void syncPhotos();
    const interval = window.setInterval(() => void syncPhotos(), 5 * 60 * 1000);
    const syncOnFocus = () => void syncPhotos();
    window.addEventListener('focus', syncOnFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', syncOnFocus);
    };
  }, [config.key, config.url, connected]);

  useEffect(
    () => () => {
      if (colorSettleTimer.current) clearTimeout(colorSettleTimer.current);
    },
    [],
  );

  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: unknown,
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;

    const life = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: 'select_collection_color',
          description:
            'Select a hue in the visible image collection and show the closest images.',
          inputSchema: {
            type: 'object',
            properties: { hue: { type: 'number', minimum: 0, maximum: 359 } },
            required: ['hue'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute(input: unknown) {
            const hue = (input as { hue?: unknown })?.hue;
            if (
              typeof hue !== 'number' ||
              !Number.isFinite(hue) ||
              hue < 0 ||
              hue > 359
            ) {
              throw new Error('Hue must be a number from 0 to 359.');
            }
            setHsl((current) => [hue, current[1], current[2]]);
            setPickedId(null);
            return { hue };
          },
        },
        { signal: life.signal },
      ),
    ).catch(() => {});

    return () => life.abort();
  }, []);

  const revealColorResults = (color = pendingColor.current) => {
    if (colorSettleTimer.current) clearTimeout(colorSettleTimer.current);
    colorSettleTimer.current = null;
    pendingColor.current = null;
    if (color) {
      setPickedId(null);
      setResultHsl(color);
    }
    setColorResultsLoading(false);
    setStripRevealKey((key) => key + 1);
    setPhotoRevealKey((key) => key + 1);
  };

  const beginToneAdjustment = (color: RGB) => {
    pendingColor.current = color;
    setColorResultsLoading(true);
    if (colorSettleTimer.current) clearTimeout(colorSettleTimer.current);
    colorSettleTimer.current = null;
  };

  const scheduleColorResults = (color: RGB, delay: number) => {
    pendingColor.current = color;
    if (colorSettleTimer.current) clearTimeout(colorSettleTimer.current);
    colorSettleTimer.current = setTimeout(
      () => revealColorResults(color),
      delay,
    );
  };

  const selectPhoto = (photo: Photo) => {
    setPickedId(photo.id);
    setHsl(rgbToHsl(photo.rgb));
    setBlend(0);
    revealColorResults(null);
  };

  const selectColor = (color: RGB) => {
    if (colorSettleTimer.current) clearTimeout(colorSettleTimer.current);
    colorSettleTimer.current = null;
    pendingColor.current = null;
    setPickedId(null);
    setHsl(color);
    setResultHsl(color);
  };

  const adjustTone = (color: RGB) => {
    setHsl(color);
    beginToneAdjustment(color);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!connected) {
      setMessage('Connect Supabase before adding photographs.');
      return;
    }
    if (!token) {
      setMessage('Sign in to save images.');
      return;
    }

    setBusy(true);
    setMessage('');

    let count = 0;
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const photo = await uploadPhoto(config, file, token);
        setPhotos((current) => [...current, photo]);
        count += 1;
      } catch (error) {
        errors.push((error as Error).message);
      }
    }

    const errorText = errors.length ? ` ${errors.join(' ')}` : '';
    setMessage(`${count} image${count === 1 ? '' : 's'} saved.${errorText}`);
    setBusy(false);
  };

  const removePhoto = async (id: string) => {
    setBusy(true);
    try {
      const photo = photos.find((candidate) => candidate.id === id);
      if (!connected) throw new Error('Connect Supabase first.');
      if (!token) throw new Error('Sign in first.');
      if (!photo) throw new Error('Image not found.');
      await deletePhoto(config, photo, token);

      setPhotos((current) =>
        current.filter((candidate) => candidate.id !== id),
      );
      setMessage('Image removed from the collection.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const measurePhoto = (id: string, width: number, height: number) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === id ? { ...photo, width, height } : photo,
      ),
    );
  };

  return (
    <main className="collection-shell">
      <header className="masthead">
        <button className="glass-button" onClick={() => setManagerOpen(true)}>
          <Plus size={15} /> Collection
          <span className="count">
            {photos.length.toString().padStart(2, '0')}
          </span>
        </button>
      </header>

      <PhotoStrip
        photos={neighborhood}
        currentId={currentPhoto?.id}
        loading={loading}
        previewing={previewHue !== null || colorResultsLoading}
        revealKey={stripRevealKey}
        onSelect={selectPhoto}
      />

      <section className="explorer">
        <ColorControls
          hsl={hsl}
          previewHue={previewHue}
          onPreviewHue={setPreviewHue}
          onColorChange={selectColor}
          onColorCommit={revealColorResults}
          onToneChange={adjustTone}
          onToneCommit={() => {
            if (pendingColor.current) {
              scheduleColorResults(pendingColor.current, 120);
            }
          }}
        />
        <PhotoViewer
          photo={currentPhoto}
          connected={connected}
          blend={blend}
          hovering={hovering}
          loadingColor={colorResultsLoading}
          revealKey={photoRevealKey}
          onBlendChange={setBlend}
          onHoverChange={setHovering}
          onMeasure={measurePhoto}
          onOpenCollection={() => setManagerOpen(true)}
        />
      </section>

      <footer>
        <span>265ThesisBrainstormCollectionEvaLI</span>
        <button onClick={() => setManagerOpen(true)} className="status-button">
          <i className={connected ? 'online' : 'offline'} />
          SUPABASE · {connected ? `${photos.length} IMAGES` : 'NOT CONNECTED'}
        </button>
      </footer>

      {message && !managerOpen && (
        <output className="inline-message">{message}</output>
      )}

      <CollectionManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        config={config}
        connected={connected}
        photos={photos}
        token={token}
        onTokenChange={setToken}
        busy={busy}
        onBusyChange={setBusy}
        message={message}
        onMessageChange={setMessage}
        onAddFiles={addFiles}
        onRemove={removePhoto}
      />
    </main>
  );
}
