import type { CollectionMeal, Meal } from './meals';

export type SupabaseStorageConfig = {
  url: string;
  key: string;
  bucket: string;
  prefix?: string;
};

type StorageObject = {
  id: string | null;
  name: string;
  metadata?: { mimetype?: string } | null;
};

const imagePattern = /\.(avif|gif|heic|jpeg|jpg|png|webp)$/i;
const webImagePattern = /\.(avif|gif|jpeg|jpg|png|webp)$/i;

export function storageConfigured(config: SupabaseStorageConfig) {
  return Boolean(config.url && config.key && config.bucket);
}

function encodeStoragePath(path: string) {
  return path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

export async function loadStorageImageUrl(
  config: SupabaseStorageConfig,
  path: string,
) {
  const response = await fetch(
    `${config.url}/storage/v1/object/sign/${encodeURIComponent(config.bucket)}/${encodeStoragePath(path)}`,
    {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 86400 }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to open ${path} from Supabase Storage.`);
  }

  const data = (await response.json()) as { signedURL?: string };
  if (!data.signedURL) {
    throw new Error(`Supabase did not return a readable URL for ${path}.`);
  }

  return `${config.url}/storage/v1${data.signedURL}`;
}

export function mealsForStoragePaths(
  displayablePaths: readonly string[],
  dataset: readonly Meal[],
) {
  return displayablePaths.map((path, index): CollectionMeal => {
    const meal = dataset[index];
    if (meal) {
      return {
        ...meal,
        storagePath: path,
        imageUrl: '',
        analysisStatus: 'analyzed',
      };
    }

    const mealNumber = String(index + 1).padStart(3, '0');
    return {
      id: `meal-${mealNumber}`,
      title: `Meal ${mealNumber}`,
      image: { alt: `Meal ${mealNumber} from the 265 collection` },
      imageUrl: '',
      storagePath: path,
      calories: null,
      ingredients: [],
      nutrients: null,
      analysisStatus: 'pending',
    };
  });
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
): Promise<{
  meals: CollectionMeal[];
  storageCount: number;
  displayableCount: number;
}> {
  if (!storageConfigured(config)) {
    return { meals: [], storageCount: 0, displayableCount: 0 };
  }

  const storagePaths = (await listFolder(config, config.prefix?.trim())).sort(
    (a, b) => a.localeCompare(b, undefined, { numeric: true }),
  );
  const browserImages = storagePaths.filter((path) =>
    webImagePattern.test(path),
  );
  const convertedImages = browserImages.filter((path) =>
    path.toLowerCase().startsWith('jpg/'),
  );
  const displayablePaths = convertedImages.length
    ? convertedImages
    : browserImages.filter((path) => !path.includes('/'));

  const resolved = mealsForStoragePaths(displayablePaths, dataset);

  return {
    meals: resolved,
    storageCount: storagePaths.length,
    displayableCount: displayablePaths.length,
  };
}
