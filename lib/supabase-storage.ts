import type { Meal, ResolvedMeal } from './meals';

export type SupabaseStorageConfig = {
  url: string;
  key: string;
  bucket: string;
};

type StorageObject = {
  id: string | null;
  name: string;
  metadata?: { mimetype?: string } | null;
};

const imagePattern = /\.(avif|gif|heic|jpeg|jpg|png|webp)$/i;

export function storageConfigured(config: SupabaseStorageConfig) {
  return Boolean(config.url && config.key && config.bucket);
}

function publicUrl(config: SupabaseStorageConfig, path: string) {
  const encodedPath = path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${config.url}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${encodedPath}`;
}

async function listFolder(
  config: SupabaseStorageConfig,
  prefix = '',
): Promise<string[]> {
  const response = await fetch(
    `${config.url}/storage/v1/object/list/${encodeURIComponent(config.bucket)}`,
    {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix,
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Unable to read the Supabase Storage collection.');
  }

  const objects = (await response.json()) as StorageObject[];
  const paths: string[] = [];

  for (const object of objects) {
    const path = prefix ? `${prefix}/${object.name}` : object.name;
    if (object.id === null) paths.push(...(await listFolder(config, path)));
    else if (imagePattern.test(object.name)) paths.push(path);
  }

  return paths;
}

export async function loadMealsFromStorage(
  config: SupabaseStorageConfig,
  dataset: readonly Meal[],
): Promise<{ meals: ResolvedMeal[]; storageCount: number }> {
  if (!storageConfigured(config)) return { meals: [], storageCount: 0 };

  const storagePaths = (await listFolder(config)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  const resolved = dataset.flatMap((meal) => {
    const path =
      meal.image.storagePath ??
      (meal.image.storageIndex === undefined
        ? undefined
        : storagePaths[meal.image.storageIndex]);
    if (!path) return [];
    return [
      {
        ...meal,
        storagePath: path,
        imageUrl: publicUrl(config, path),
      },
    ];
  });

  return { meals: resolved, storageCount: storagePaths.length };
}
