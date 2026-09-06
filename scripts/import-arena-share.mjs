import { mkdir, readFile, writeFile } from 'node:fs/promises';

const cards = JSON.parse(await readFile('app/data/arena-keys.json', 'utf8'));
if (!Array.isArray(cards) || cards.length !== 132) {
  throw new Error(`Expected 132 Are.na cards, received ${cards?.length ?? 0}.`);
}

await mkdir('public/arena', { recursive: true });
await mkdir('app/data', { recursive: true });

const queue = [...cards];
const records = [];

async function worker() {
  while (queue.length) {
    const [id, key, label] = queue.shift();
    if (!Number.isInteger(id) || !key.startsWith(`${id}/original_`)) {
      throw new Error('Unexpected Are.na card data.');
    }
    const transform = {
      bucket: 'arena_images',
      key,
      edits: {
        resize: { width: 600, height: 600, fit: 'inside', withoutEnlargement: true },
        webp: { quality: 75 },
        flatten: { background: { r: 203, g: 203, b: 203 } },
        jpeg: { quality: 75 },
        rotate: null,
      },
    };
    const src = `https://images.are.na/${Buffer.from(JSON.stringify(transform)).toString('base64')}`;
    const output = `public/arena/${id}.webp`;
    try {
      await readFile(output);
    } catch {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`);
      await writeFile(output, Buffer.from(await response.arrayBuffer()));
    }
    records.push({
      id: `arena-${id}`,
      arena_id: id,
      title: label && label !== 'image' ? label : `Image ${id}`,
      url: `/arena/${id}.webp`,
      source_url: `https://www.are.na/block/${id}`,
    });
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));
records.sort((a, b) => b.arena_id - a.arena_id);
await writeFile('app/data/arena-photos-source.json', `${JSON.stringify(records, null, 2)}\n`);
console.log(`Downloaded ${records.length} Are.na images.`);
