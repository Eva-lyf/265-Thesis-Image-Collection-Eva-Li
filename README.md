# 265 Thesis Image Collection — Eva Li

An interactive color-based archive for Eva Li’s thesis image collection. The site contains 132 photographs imported from a private Are.na channel and lets visitors explore them through hue, saturation, and lightness.

## Homepage

This project uses the Next.js/Vinext App Router. [`app/page.tsx`](app/page.tsx) is the homepage for `/` and is the framework equivalent of a traditional `index.html`. Vinext generates the final HTML during the build, so a separate handwritten `index.html` is neither needed nor used.

## Project structure

```text
app/
  page.tsx                         Homepage route
  layout.tsx                       Document metadata and global shell
  globals.css                      Site-wide visual styles
  data/                            Generated Are.na photo metadata

components/
  collection/
    collection-page.tsx            Page state and data orchestration
    photo-strip.tsx                Scrollable color-neighborhood strip
    color-controls.tsx             Color wheel, lightness, and saturation
    photo-viewer.tsx               Selected photograph and color dissolve
    collection-manager.tsx         Upload, sign-in, and delete dialog
  ui/                              Reusable interface primitives

lib/
  color.ts                         Color analysis and OKLab matching
  collection.ts                    Supabase photo storage and records

public/arena/                      Local WebP copies of the 132 photographs
scripts/                           Are.na import and color extraction tools
supabase/schema.sql                Database, storage, and access policies
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Collection data

The private Are.na share link supplied by the owner was used to collect all 132 channel images. The repository contains local 600 px WebP copies so the live page does not expose the private share token. Average colors and image dimensions are generated ahead of time and stored in `app/data/arena-photos.json`.

The current site works without a database. Until Supabase is connected, additional uploads are temporary and disappear after a reload.

## Supabase setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Create an email/password user in Authentication → Users.
3. Add that user’s UUID to `collection_editors` using the example statement at the bottom of the schema.
4. Copy `.env.example` to `.env.local` and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Add the same two public values to the hosting environment and deploy again.

Never add a database password or `service_role` key to this repository. `.env.local` and other environment files are ignored by Git.

Supported uploads: JPEG, PNG, WebP, and AVIF up to 15 MB. Convert HEIC files before uploading.

## Deployment

The production site is hosted privately with OpenAI Sites:

<https://eva-li-265-thesis-collection.evali04.chatgpt.site/>
