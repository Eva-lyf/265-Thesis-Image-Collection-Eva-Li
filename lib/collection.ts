import { analyzeImageDetails, type RGB } from './color';
export type Photo = {
  id: string;
  title: string;
  url: string;
  rgb: RGB;
  width?: number;
  height?: number;
  source_url?: string;
  storage_path?: string;
  arena_id?: number;
  arena_updated_at?: string;
  temporary?: boolean;
  bundled?: boolean;
};
export type ArenaPhotoSource = Omit<
  Photo,
  'rgb' | 'width' | 'height' | 'storage_path' | 'temporary' | 'bundled'
> & { arena_id: number };
export type Config = { url: string; key: string };
export function configured(c: Config) {
  return !!c.url && !!c.key;
}
async function request(
  c: Config,
  path: string,
  options: RequestInit = {},
  token?: string,
) {
  const headers = new Headers(options.headers);
  headers.set('apikey', c.key);
  headers.set('Authorization', `Bearer ${token || c.key}`);
  const res = await fetch(`${c.url}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    let message = 'Unable to connect to the collection.';
    try {
      const e = (await res.json()) as {
        msg?: string;
        message?: string;
        error_description?: string;
      };
      message = e.msg || e.message || e.error_description || message;
    } catch {}
    throw new Error(message);
  }
  return res;
}
export async function listPhotos(c: Config): Promise<Photo[]> {
  const res = await request(
    c,
    '/rest/v1/photos?select=*&order=created_at.desc',
  );
  return res.json();
}
export async function listArenaPhotos(): Promise<ArenaPhotoSource[]> {
  const response = await fetch('/api/arena', { cache: 'no-store' });
  const data = (await response.json()) as {
    images?: ArenaPhotoSource[];
    error?: string;
  };

  if (!response.ok || !Array.isArray(data.images)) {
    throw new Error(data.error || 'Could not sync with Are.na.');
  }

  return data.images;
}

export async function prepareArenaPhotos(
  sources: ArenaPhotoSource[],
  knownPhotos: Iterable<Photo>,
): Promise<Photo[]> {
  const knownById = new Map<number, Photo>();
  for (const photo of knownPhotos) {
    if (photo.arena_id) knownById.set(photo.arena_id, photo);
  }

  const prepared: Photo[] = [];
  let cursor = 0;

  const prepareNext = async () => {
    while (cursor < sources.length) {
      const index = cursor;
      cursor += 1;
      const source = sources[index];
      const known = knownById.get(source.arena_id);

      if (known) {
        prepared[index] = {
          ...known,
          id: source.id,
          arena_id: source.arena_id,
          title: source.title,
          source_url: source.source_url,
          arena_updated_at: source.arena_updated_at,
        };
        continue;
      }

      try {
        const details = await analyzeImageDetails(source.url);
        prepared[index] = { ...source, ...details };
      } catch {
        prepared[index] = { ...source, rgb: [128, 128, 128] };
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(4, sources.length) }, prepareNext),
  );
  return prepared;
}
export async function signIn(c: Config, email: string, password: string) {
  const r = await request(c, '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return r.json() as Promise<{ access_token: string }>;
}
export async function uploadPhoto(
  c: Config,
  file: File,
  token: string,
): Promise<Photo> {
  if (
    !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)
  )
    throw new Error(`${file.name}: use JPEG, PNG, WebP or AVIF.`);
  if (file.size > 15 * 1024 * 1024)
    throw new Error(`${file.name}: maximum size is 15 MB.`);
  const local = URL.createObjectURL(file);
  let details: { rgb: RGB; width: number; height: number };
  try {
    details = await analyzeImageDetails(local);
  } finally {
    URL.revokeObjectURL(local);
  }
  const id = crypto.randomUUID(),
    extension = file.type.split('/')[1],
    path = `${id}.${extension}`;
  await request(
    c,
    `/storage/v1/object/collection/${path}`,
    { method: 'POST', headers: { 'Content-Type': file.type }, body: file },
    token,
  );
  const photo: Photo = {
    id,
    title: file.name.replace(/\.[^.]+$/, ''),
    url: `${c.url}/storage/v1/object/public/collection/${path}`,
    rgb: details.rgb,
    width: details.width,
    height: details.height,
    storage_path: path,
  };
  try {
    await savePhoto(c, photo, token);
  } catch (e) {
    try {
      await request(
        c,
        `/storage/v1/object/collection`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefixes: [path] }),
        },
        token,
      );
    } catch {}
    throw e;
  }
  return photo;
}
export async function savePhoto(c: Config, p: Photo, token: string) {
  await request(
    c,
    '/rest/v1/photos?on_conflict=arena_id',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(p),
    },
    token,
  );
}
export async function deletePhoto(c: Config, id: string, token: string) {
  const res = await request(
    c,
    `/rest/v1/photos?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: { Prefer: 'return=representation' } },
    token,
  );
  const removed = (await res.json()) as Photo[];
  if (!removed.length)
    throw new Error(
      'Image was not removed. Check that your account is an approved editor.',
    );
}
