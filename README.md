# 265ThesisBrainstormCollectionEvaLI

White, minimal color explorer based on Eva Li’s supplied sketch. Drag or use arrow keys on the color ring; adjust lightness and saturation; hover or tap a photograph to blend it into its average color. Nearby images are ranked by Euclidean distance in OKLab. The mean uses alpha-weighted sRGB pixels sampled proportionally across the whole image (maximum 160 px along the longest edge).

## Current data status

The private Are.na share link provided by the owner was used to collect all 132 channel images. The site carries local 600 px WebP copies so the collection remains visible without exposing the private share token in browser code. Average colors are generated ahead of time and saved with the image metadata. Until Supabase is configured, additional uploads are temporary and clear on reload. The HEIC attachment was treated as a layout reference, not as gallery content.

## Connect Supabase

1. Create a Supabase project. Run `supabase/schema.sql` once in its SQL Editor. This creates a publicly readable photo collection and public Storage bucket; only designated editors can write. Do not use the public bucket for private photos.
2. Create your email/password account in Authentication → Users; add its UUID to `collection_editors` using the commented statement at the end of the SQL file. There is intentionally no public sign-up UI.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. These are public project connection values, never the service-role key or database password. Set the same variables in the hosting environment and rebuild for deployment.
4. Open Collection, sign in, and upload photos. They are stored in Supabase Storage with metadata and mean RGB in the database. Editor sessions remain in memory; reload or sign out to clear them. Expired sessions require signing in again.
5. The initial Are.na collection is already bundled with the site. After the Supabase project is connected, new uploads are stored in Supabase and merged with the 132 initial images.

Deleting removes the collection record, not the original Are.na block. Uploaded storage objects are retained when a record is deleted, to avoid destructive file removal and permit manual recovery; clean unused objects in Supabase Storage when desired. Failed insert uploads attempt to clean up the newly uploaded file.

JPEG, PNG, WebP and AVIF supported, up to 15 MB each. Convert HEIC to JPEG before gallery upload.

## Development

`npm install`, `npm run dev`, `npm run build`. Uses the generated Vinext/React Sites scaffold and Supabase’s HTTP APIs. No service credentials are embedded. API route `/api/arena` reads only the fixed user-requested channel.

The optional `select_collection_color` WebMCP tool changes the visible hue. Unsupported browsers work normally.

## Validation

Production build and TypeScript checks pass. Pure color checks cover alpha weighting, exact RGB/HSL round trips and nearest-color ordering. The WebMCP tool was verified in the local preview with a valid hue, an invalid hue, and state read-back. Broader visual/browser testing and live Supabase writes have not been performed; Supabase is not provisioned yet.
