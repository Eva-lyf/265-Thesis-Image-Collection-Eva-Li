# 265 Thesis Meal Collection — Eva Li

A visual meal archive explored through nutrient colors. Meal photographs live in Supabase Storage, while the complete one-time nutrition analysis is stored in the repository as a static dataset.

## Homepage

This project uses the Next.js/Vinext App Router. `app/page.tsx` is the homepage for `/` and is the framework equivalent of a traditional `index.html`.

## Current implementation

- All 67 JPG photographs are matched to nutrition records by exact filename.
- The nutrient spectrum expresses the collection's aggregate nutritional fingerprint.
- Each segment width is the collection mean of `amount / Daily Value`, normalized across the nine nutrients.
- Total sugar has no official Total Sugar Daily Value, so its project-level reference is the dataset's 90th-percentile total-sugar amount.
- Selecting a nutrient sorts every meal by that nutrient's absolute amount, highest first.
- Clicking a neighboring photograph centers it. Clicking the centered photograph opens its meal detail and data-driven Nutrient Orb.
- Calories influence the Orb's overall luminosity; the nine nutrient amounts control its colored light weights.

## Project structure

```text
app/
  page.tsx                         Homepage route and Supabase config
  globals.css                      Site-wide visual styles

components/collection/
  collection-page.tsx             Collection state, nutrient selection, image loading
  color-spectrum.tsx              Aggregate nutrient spectrum selector
  color-filmstrip.tsx             Nutrient-sorted horizontal meal carousel
  meal-detail.tsx                 Selected-meal detail view
  nutrient-orb.tsx                Meal-specific nutrient visualization

data/
  meal-nutrition.json             Single source of truth for all 67 meals
  meal-nutrition-audit.md         Human-readable audit with corresponding photos
  image-colors.json               JPG filename manifest retained from image preprocessing

lib/
  meals.ts                         Dataset adapter, %DV derivation, sorting, aggregate scores
  nutrients.ts                     Nutrient keys, labels, units, colors, and segment types
  supabase-storage.ts              Read-only Supabase Storage adapter
```

## Data rules

- Photographs come only from the Supabase Storage bucket configured by `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
- Meals bind to Storage objects through `imageFilename`; array indexes are never used.
- Nutrient amounts in `data/meal-nutrition.json` are the source of truth.
- Official-reference `%DV` values are derived at runtime from the stored amounts and fixed constants.
- Total sugar remains an absolute amount and uses the documented collection P90 only for normalized visualization.
- The browser performs no AI, image analysis, nutrition inference, or random nutrient generation.
- Dominant image color does not control nutrient sorting or the Nutrient Orb.
- Storage access uses short-lived, read-only signed URLs and loads only the selected image and its nearby carousel neighbors.

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

The site expects the public JPG files in the `265` bucket and uses only the public browser credentials stored in the environment. Never add a database password or `service_role` key to this repository.

## Deployment

The production site is hosted with OpenAI Sites:

<https://eva-li-265-thesis-collection.evali04.chatgpt.site/>
