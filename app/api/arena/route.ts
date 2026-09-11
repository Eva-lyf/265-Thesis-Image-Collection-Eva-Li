const channelContentsUrl =
  'https://api.are.na/v2/channels/parsons-studio-256/contents';

type ArenaBlock = {
  class?: string;
  id?: number;
  title?: string | null;
  generated_title?: string | null;
  image?: {
    filename?: string;
    updated_at?: string;
    display?: { url?: string };
    original?: { url?: string };
  };
};

export async function GET() {
  const images: unknown[] = [];

  try {
    for (let page = 1; page <= 100; page += 1) {
      const response = await fetch(
        `${channelContentsUrl}?per=100&page=${page}`,
        {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        const privateChannel =
          response.status === 401 || response.status === 403;
        return Response.json(
          {
            error: privateChannel
              ? 'This Are.na channel is private.'
              : 'Are.na is unavailable. Please try again later.',
          },
          { status: privateChannel ? 403 : 502 },
        );
      }

      const data = (await response.json()) as { contents?: ArenaBlock[] };
      const blocks = data.contents;
      if (!Array.isArray(blocks)) {
        return Response.json(
          { error: 'Are.na returned an unexpected response.' },
          { status: 502 },
        );
      }

      for (const block of blocks) {
        const imageUrl =
          block.image?.display?.url || block.image?.original?.url;
        if (block.class !== 'Image' || !block.id || !imageUrl) continue;

        images.push({
          id: `arena-${block.id}`,
          arena_id: block.id,
          title:
            block.title ||
            block.generated_title ||
            block.image?.filename ||
            `Image ${block.id}`,
          url: imageUrl,
          source_url: `https://www.are.na/block/${block.id}`,
          arena_updated_at: block.image?.updated_at,
        });
      }

      if (blocks.length < 100) {
        return Response.json(
          { images, synced_at: new Date().toISOString() },
          { headers: { 'Cache-Control': 'no-store' } },
        );
      }
    }

    return Response.json(
      { error: 'This channel is too large to sync in one request.' },
      { status: 422 },
    );
  } catch {
    return Response.json(
      { error: 'Could not reach Are.na. Please try again later.' },
      { status: 502 },
    );
  }
}
