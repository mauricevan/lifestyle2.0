/**
 * Hyperfocus detection from HR and step patterns.
 */

import type { HeartRateSample, RpmConfig } from "@rpm/shared-types";
import { DEFAULT_RPM_CONFIG } from "@rpm/shared-types";

export interface HyperfocusSample {
  timestamp: Date;
  hrBpm: number;
  stepsPerMinute: number;
}

export interface HyperfocusDetectionResult {
  isActive: boolean;
  durationMs: number;
  hrDelta: number;
}

export function detectHyperfocus(
  samples: HyperfocusSample[],
  baselineHr: number,
  isWorkoutActive = false,
  config: RpmConfig = DEFAULT_RPM_CONFIG
): HyperfocusDetectionResult {
  if (isWorkoutActive || samples.length === 0) {
    return { isActive: false, durationMs: 0, hrDelta: 0 };
  }

  const qualifying = samples.filter(
    (sample) =>
      sample.stepsPerMinute < config.stepThresholdPerMin &&
      sample.hrBpm - baselineHr > config.hyperfocusThreshold
  );

  if (qualifying.length === 0) {
    return { isActive: false, durationMs: 0, hrDelta: 0 };
  }

  const first = qualifying[0]!;
  const last = qualifying[qualifying.length - 1]!;
  const durationMs = last.timestamp.getTime() - first.timestamp.getTime();
  const maxHr = Math.max(...qualifying.map((s) => s.hrBpm));
  const hrDelta = maxHr - baselineHr;

  return {
    isActive: durationMs >= config.hyperfocusMinDurationMs,
    durationMs,
    hrDelta,
  };
}

export function samplesFromHeartRate(
  hrSamples: HeartRateSample[],
  stepsPerMinute: number
): HyperfocusSample[] {
  return hrSamples.map((sample) => ({
    timestamp: sample.timestamp,
    hrBpm: sample.bpm,
    stepsPerMinute,
  }));
}
