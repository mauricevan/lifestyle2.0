/**
 * Live EP burn rate based on HR and activity.
 */

import type { RpmConfig } from "@rpm/shared-types";
import { DEFAULT_RPM_CONFIG } from "@rpm/shared-types";

export interface BurnRateInput {
  currentHr: number;
  baselineHr: number;
  stepsPerMinute: number;
  isWorkoutActive?: boolean;
  config?: RpmConfig;
}

export function calculateBurnRate(input: BurnRateInput): number {
  const config = input.config ?? DEFAULT_RPM_CONFIG;

  if (input.isWorkoutActive) {
    return config.baseBurnRate;
  }

  const isSedentary = input.stepsPerMinute < config.stepThresholdPerMin;
  const hrDelta = input.currentHr - input.baselineHr;

  if (!isSedentary || hrDelta <= config.hyperfocusThreshold) {
    return config.baseBurnRate;
  }

  if (hrDelta > 40) {
    return 40;
  }
  if (hrDelta > 30) {
    return 28;
  }

  return config.baseBurnRate + (hrDelta - config.hyperfocusThreshold);
}
