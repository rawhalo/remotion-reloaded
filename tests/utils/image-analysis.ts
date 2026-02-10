import crypto from "node:crypto";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export function imageHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function parsePng(buffer: Buffer): PNG {
  return PNG.sync.read(buffer);
}

export function findRedBoxLeftX(buffer: Buffer): number {
  const png = parsePng(buffer);

  let minX = Number.POSITIVE_INFINITY;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];

      if (a > 220 && r > 220 && g < 70 && b < 70) {
        minX = Math.min(minX, x);
      }
    }
  }

  if (!Number.isFinite(minX)) {
    throw new Error("Could not detect red box in rendered frame");
  }

  return minX;
}

export function pixelDiffStats(
  baseline: Buffer,
  candidate: Buffer,
  threshold = 0.1,
): { diffPixels: number; ratio: number; totalPixels: number } {
  const a = parsePng(baseline);
  const b = parsePng(candidate);

  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(
      `Image dimensions differ (${a.width}x${a.height} vs ${b.width}x${b.height})`,
    );
  }

  const totalPixels = a.width * a.height;
  const diffPixels = pixelmatch(a.data, b.data, null, a.width, a.height, {
    threshold,
  });

  return {
    diffPixels,
    ratio: diffPixels / totalPixels,
    totalPixels,
  };
}

export function sharpnessScore(buffer: Buffer): number {
  const png = parsePng(buffer);

  let sum = 0;
  let samples = 0;

  for (let y = 0; y < png.height; y++) {
    for (let x = 1; x < png.width; x++) {
      const idx = (png.width * y + x) * 4;
      const leftIdx = (png.width * y + (x - 1)) * 4;

      const luminance =
        0.2126 * png.data[idx] +
        0.7152 * png.data[idx + 1] +
        0.0722 * png.data[idx + 2];
      const leftLuminance =
        0.2126 * png.data[leftIdx] +
        0.7152 * png.data[leftIdx + 1] +
        0.0722 * png.data[leftIdx + 2];

      sum += Math.abs(luminance - leftLuminance);
      samples++;
    }
  }

  return samples > 0 ? sum / samples : 0;
}
