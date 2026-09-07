import CollectionPage from '@/components/collection/collection-page';
import arenaPhotos from './data/arena-photos.json';
import type { Photo } from '@/lib/collection';

const initialPhotos = (arenaPhotos as unknown as Photo[]).map((photo) => ({
  ...photo,
  bundled: true,
}));

export default function HomePage() {
  return (
    <CollectionPage
      initialPhotos={initialPhotos}
      config={{
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      }}
    />
  );
}
