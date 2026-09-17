import colorRecords from '@/data/image-colors.json';

type ImageColorRecord = {
  storagePath: string;
};

export function knownImageStoragePaths() {
  return (colorRecords as ImageColorRecord[])
    .map((record) => record.storagePath)
    .sort((first, second) =>
      first.localeCompare(second, undefined, { numeric: true }),
    );
}
