#!/usr/bin/env python3
"""Extract one stable dominant color per image without runtime dependencies."""

from __future__ import annotations

import argparse
import colorsys
import json
import struct
import subprocess
import tempfile
from collections import defaultdict
from pathlib import Path


def read_bmp(path: Path) -> list[tuple[int, int, int]]:
    data = path.read_bytes()
    offset = struct.unpack_from("<I", data, 10)[0]
    width = struct.unpack_from("<i", data, 18)[0]
    height = struct.unpack_from("<i", data, 22)[0]
    bits = struct.unpack_from("<H", data, 28)[0]
    if bits != 24:
        raise ValueError(f"Expected a 24-bit BMP, received {bits}-bit")

    row_size = ((abs(width) * 3 + 3) // 4) * 4
    pixels: list[tuple[int, int, int]] = []
    for y in range(abs(height)):
        row = offset + y * row_size
        for x in range(abs(width)):
            blue, green, red = data[row + x * 3 : row + x * 3 + 3]
            pixels.append((red, green, blue))
    return pixels


def dominant_color(path: Path) -> tuple[int, int, int]:
    with tempfile.NamedTemporaryFile(suffix=".bmp") as temp:
        subprocess.run(
            [
                "sips",
                "-z",
                "48",
                "48",
                "-s",
                "format",
                "bmp",
                str(path),
                "--out",
                temp.name,
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        pixels = read_bmp(Path(temp.name))

    buckets: dict[tuple[int, int, int], list[tuple[int, int, int]]] = defaultdict(list)
    for red, green, blue in pixels:
        maximum = max(red, green, blue)
        minimum = min(red, green, blue)
        saturation = 0 if maximum == 0 else (maximum - minimum) / maximum
        luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255
        if luminance > 0.96 and saturation < 0.08:
            continue
        buckets[(red // 32, green // 32, blue // 32)].append((red, green, blue))

    if not buckets:
        buckets[(7, 7, 7)] = pixels

    def score(values: list[tuple[int, int, int]]) -> float:
        saturation = sum(
            colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)[1]
            for red, green, blue in values
        ) / len(values)
        return len(values) * (0.65 + saturation * 0.35)

    values = max(buckets.values(), key=score)
    return tuple(round(sum(pixel[channel] for pixel in values) / len(values)) for channel in range(3))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("images", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text())
    records = []
    for entry in manifest:
        source = args.images / entry["jpg"]
        red, green, blue = dominant_color(source)
        hue, lightness, saturation = colorsys.rgb_to_hls(
            red / 255, green / 255, blue / 255
        )
        records.append(
            {
                "storagePath": f"{Path(entry['original']).stem}.jpg",
                "dominantHex": f"#{red:02X}{green:02X}{blue:02X}",
                "hue": round(hue * 360, 2),
                "saturation": round(saturation * 100, 2),
                "lightness": round(lightness * 100, 2),
            }
        )

    records.sort(key=lambda record: record["storagePath"].lower())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(records, indent=2) + "\n")
    print(f"Wrote {len(records)} dominant-color records to {args.output}")


if __name__ == "__main__":
    main()
