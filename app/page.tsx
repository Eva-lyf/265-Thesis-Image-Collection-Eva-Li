import CollectionPage from '@/components/collection/collection-page';

export default function HomePage() {
  return (
    <CollectionPage
      config={{
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      }}
    />
  );
}
