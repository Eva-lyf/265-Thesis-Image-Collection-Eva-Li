# 265 Thesis Meal Collection — Eva Li

A visual meal archive explored through nutrient colors. The collection keeps meal photography in Supabase Storage and keeps pre-analyzed nutrient metadata in a versioned static dataset.

## Homepage

This project uses the Next.js/Vinext App Router. [`app/page.tsx`](app/page.tsx) is the homepage for `/` and is the framework equivalent of a traditional `index.html`. Vinext generates the final HTML during the build.

## Current phases

- Phase 1: reusable meal and nutrient data model with sample meal records.
- Phase 2: horizontal nutrient spectrum and Daily Value sorting for the meal collection.
- Phase 3 onward: meal detail and nutrient orb are intentionally not implemented yet.

## Project structure

```text
app/
  page.tsx                         Homepage route and public Supabase config
  layout.tsx                       Document metadata and global shell
  globals.css                      Site-wide visual styles

components/collection/
  collection-page.tsx             Storage loading and collection state
  nutrient-spectrum.tsx            Nutrient selector
  meal-collection.tsx              DV-sorted visual meal collection

data/meals.json                    Static pre-analyzed sample meal data

lib/
  meals.ts                         Meal types, validation, and sorting
  nutrients.ts                     Nutrient keys, labels, units, and colors
  supabase-storage.ts              Read-only Supabase Storage adapter

supabase/schema.sql                Optional Storage and editor policies
```

## Data rules

- Meal images come only from the public Supabase Storage bucket and optional folder configured by `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` and `NEXT_PUBLIC_SUPABASE_STORAGE_PREFIX`.
- Nutrient values, calories, ingredients, and guidance come only from `data/meals.json`.
- The browser does not run image analysis, AI, vision, or nutrition inference.
- Selecting a nutrient keeps every resolved meal and sorts the list by that nutrient's `dvPercent` from high to low.
- Nine sample records currently use `storageIndex` so they bind to the browser-compatible images in the sorted Storage listing. The final pre-analysis dataset should replace each index with an explicit `storagePath`.
- Storage access uses short-lived, read-only signed URLs created through the public SELECT policy. HEIC files remain in Storage but require conversion to JPG/WebP or enabled Supabase Image Transformations before browsers can display them.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run build
```

## Supabase setup

1. Keep the meal photographs in the public Storage bucket named `265`, or change `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
2. Run `supabase/schema.sql` if the bucket still needs public read and editor write policies.
3. Add the Supabase project URL and publishable key to `.env.local` and the Sites runtime environment.

Only public browser credentials belong in the environment. Never add a database password or `service_role` key to this repository.

## Deployment

The production site is hosted privately with OpenAI Sites:

<https://eva-li-265-thesis-collection.evali04.chatgpt.site/>
