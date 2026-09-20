import MealDetailPage from '@/components/detail/meal-detail-page';
import { meals } from '@/lib/meals';

type MealPageProps = {
  params: Promise<{ mealId: string }>;
};

export function generateStaticParams() {
  return meals.map((meal) => ({ mealId: meal.id }));
}

export default async function MealPage({ params }: MealPageProps) {
  const { mealId } = await params;
  const meal = meals.find((candidate) => candidate.id === mealId);

  return (
    <MealDetailPage
      meal={meal ?? null}
      config={{
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
        bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || '265',
        prefix: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PREFIX || '',
      }}
    />
  );
}
