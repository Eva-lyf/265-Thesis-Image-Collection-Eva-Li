# 265 Thesis Meal Collection — Eva Li

A visual archive of 67 meals and their nutrient color identities.

## Site

Both `/` and `/index` open the same collection grid. Visitors can switch between meal photographs and nutrient Orbs, flip each card, and reorder the complete collection by a nutrient percentage.

## Data and images

- `data/meal-nutrition.json` is the static nutrition source of truth.
- `data/nutrient-orb-v2.json` contains the nine nutrient color proportions used by each Orb.
- Photographs load read-only from the Supabase Storage `265` bucket.
- Filenames connect Storage objects to nutrition records.
- The browser performs no AI analysis or nutrient generation.

## Main files

```text
app/page.tsx                         Homepage alias
app/index/page.tsx                   Collection route and Supabase config
components/index/index-page.tsx      Grid, filtering, image loading, and Orbs
components/index/index-page.module.css
lib/meals.ts                         Static dataset adapter
lib/nutrients.ts                     Nutrient definitions and colors
lib/nutrient-visuals.ts              High-sugar and high-sodium color emphasis
lib/supabase-storage.ts              Read-only image loading
```

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Checks:

```bash
npm run lint
npm run build
```

Production: <https://eva-li-265-thesis-collection.evali04.chatgpt.site/>
