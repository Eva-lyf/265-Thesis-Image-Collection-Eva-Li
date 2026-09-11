'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { CollectionManager } from './collection-manager';
import { ColorControls } from './color-controls';
import { PhotoStrip } from './photo-strip';
import { PhotoViewer } from './photo-viewer';
import {
  analyzeImageDetails,
  distance,
  hslToRgb,
  rgbToHsl,
  type RGB,
} from '@/lib/color';
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
  initialPhotos: Photo[];
};

const acceptedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];
const maximumImageSize = 15 * 1024 * 1024;

export default function CollectionPage({
  config,
  initialPhotos,
}: CollectionPageProps) {
  const connected = configured(config);
  const temporaryUrls = useRef<string[]>([]);

  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [hsl, setHsl] = useState<RGB>([28, 46, 68]);
  const [previewHue, setPreviewHue] = useState<number | null>(null);
  const [stripRevealKey, setStripRevealKey] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [blend, setBlend] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(connected);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const selectedRgb = useMemo(() => hslToRgb(...hsl), [hsl]);
  const sortedPhotos = useMemo(
    () =>
      [...photos].sort(
        (a, b) => distance(a.rgb, selectedRgb) - distance(b.rgb, selectedRgb),
      ),
    [photos, selectedRgb],
  );
  const currentPhoto =
    photos.find((photo) => photo.id === pickedId) ?? sortedPhotos[0];
  const surroundingPhotos = currentPhoto
    ? sortedPhotos.filter((photo) => photo.id !== currentPhoto.id)
    : [];
  const neighborhood = currentPhoto
    ? [
        ...surroundingPhotos.filter((_, index) => index % 2 === 0).reverse(),
        currentPhoto,
        ...surroundingPhotos.filter((_, index) => index % 2 === 1),
      ]
    : [];

  useEffect(() => {
    const cloudConfig = { url: config.url, key: config.key };
    const urls = temporaryUrls.current;

    if (connected) {
      listPhotos(cloudConfig)
        .then((cloudPhotos) => {
          const merged = [...cloudPhotos, ...initialPhotos];
          setPhotos(
            merged.filter(
              (photo, index) =>
                merged.findIndex((candidate) =>
                  photo.arena_id
                    ? candidate.arena_id === photo.arena_id
                    : candidate.id === photo.id,
                ) === index,
            ),
          );
        })
        .catch((error) => setMessage(error.message))
        .finally(() => setLoading(false));
    }

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [config.key, config.url, connected, initialPhotos]);

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

  const selectPhoto = (photo: Photo) => {
    setPickedId(photo.id);
    setHsl(rgbToHsl(photo.rgb));
    setBlend(0);
    setStripRevealKey((key) => key + 1);
  };

  const selectColor = (color: RGB) => {
    setPickedId(null);
    setHsl(color);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');

    let count = 0;
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        let photo: Photo;

        if (connected) {
          if (!token) throw new Error('Sign in to save images.');
          photo = await uploadPhoto(config, file, token);
        } else {
          if (
            !acceptedImageTypes.includes(file.type) ||
            file.size > maximumImageSize
          ) {
            throw new Error(
              `${file.name}: use JPEG, PNG, WebP or AVIF, under 15 MB.`,
            );
          }

          const url = URL.createObjectURL(file);
          try {
            const details = await analyzeImageDetails(url);
            photo = {
              id: crypto.randomUUID(),
              title: file.name.replace(/\.[^.]+$/, ''),
              url,
              rgb: details.rgb,
              width: details.width,
              height: details.height,
              temporary: true,
            };
            temporaryUrls.current.push(url);
          } catch (error) {
            URL.revokeObjectURL(url);
            throw error;
          }
        }

        setPhotos((current) => [...current, photo]);
        count += 1;
      } catch (error) {
        errors.push((error as Error).message);
      }
    }

    const savedState = connected ? 'saved' : 'loaded for this preview';
    const errorText = errors.length ? ` ${errors.join(' ')}` : '';
    setMessage(
      `${count} image${count === 1 ? '' : 's'} ${savedState}.${errorText}`,
    );
    setBusy(false);
  };

  const removePhoto = async (id: string) => {
    setBusy(true);
    try {
      const photo = photos.find((candidate) => candidate.id === id);
      if (connected && !photo?.temporary && !photo?.bundled) {
        if (!token) throw new Error('Sign in first.');
        await deletePhoto(config, id, token);
      }

      setPhotos((current) =>
        current.filter((candidate) => candidate.id !== id),
      );
      setMessage(
        photo?.bundled
          ? 'Image hidden for this visit.'
          : 'Image removed from the collection.',
      );
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
        <a
          className="arena-link"
          href="https://www.are.na/eva-li-ppue5pcryww/parsons-studio-256"
          target="_blank"
          rel="noreferrer"
        >
          Are.na <ArrowUpRight size={14} />
        </a>
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
        previewing={previewHue !== null}
        revealKey={stripRevealKey}
        onSelect={selectPhoto}
      />

      <section className="explorer">
        <ColorControls
          hsl={hsl}
          previewHue={previewHue}
          onPreviewHue={setPreviewHue}
          onColorChange={selectColor}
          onColorCommit={() => setStripRevealKey((key) => key + 1)}
        />
        <PhotoViewer
          photo={currentPhoto}
          connected={connected}
          blend={blend}
          hovering={hovering}
          onBlendChange={setBlend}
          onHoverChange={setHovering}
          onMeasure={measurePhoto}
          onOpenCollection={() => setManagerOpen(true)}
        />
      </section>

      <footer>
        <span>265ThesisBrainstormCollectionEvaLI</span>
        <span>Objects. Places. Little things worth keeping.</span>
        <button onClick={() => setManagerOpen(true)} className="status-button">
          <i className="online" />
          ARE.NA · 132 IMAGES{connected ? ' · CLOUD CONNECTED' : ''}
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
