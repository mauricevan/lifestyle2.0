/**
 * In-memory ring buffer for BLE heart rate samples.
 */

import type { HeartRateSample } from "@rpm/shared-types";

const MAX_SAMPLES = 500;
const samples: HeartRateSample[] = [];

export function addBleHeartRateSample(sample: HeartRateSample): void {
  samples.push(sample);
  if (samples.length > MAX_SAMPLES) {
    samples.splice(0, samples.length - MAX_SAMPLES);
  }
}

export function getBleSamplesInWindow(start: Date, end: Date): HeartRateSample[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return samples.filter((s) => {
    const t = s.timestamp.getTime();
    return t >= startMs && t <= endMs;
  });
}

export function getLatestBleSample(): HeartRateSample | null {
  const latest = samples.at(-1);
  return latest ?? null;
}

export function clearBleSampleCache(): void {
  samples.length = 0;
}
