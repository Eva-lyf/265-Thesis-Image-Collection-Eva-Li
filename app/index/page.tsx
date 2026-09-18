import IndexPage from '@/components/index/index-page';

export default function ImageIndexPage() {
  return (
    <IndexPage
      config={{
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
        bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || '265',
        prefix: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PREFIX || '',
      }}
    />
  );
}
