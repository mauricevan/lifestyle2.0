/**
 * @rpm/ep-engine — Pure EP calculation functions.
 */

import type { Baseline, EpBudget, RpmConfig } from "@rpm/shared-types";
import { DEFAULT_RPM_CONFIG } from "@rpm/shared-types";

export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getRollingAverage(last14Days: number[]): number {
  if (last14Days.length === 0) {
    return 0;
  }
  return mean(last14Days);
}

export interface MorningBaselineInput {
  morningHrSamples: number[];
  last14DaysRollingAvg: number[];
  config?: RpmConfig;
}

export function calculateMorningBaseline(input: MorningBaselineInput): EpBudget {
  const config = input.config ?? DEFAULT_RPM_CONFIG;
  const avgHr = mean(input.morningHrSamples);
  const rollingBaseline = getRollingAverage(input.last14DaysRollingAvg);
  const deviation = avgHr - rollingBaseline;

  if (
    rollingBaseline > 0 &&
    deviation > config.baselineElevatedThreshold
  ) {
    return { amount: config.maintenanceBudget, status: "onderhoud" };
  }

  if (rollingBaseline === 0) {
    return { amount: config.fullBudget, status: "voorlopig" };
  }

  return { amount: config.fullBudget, status: "vol" };
}

export function buildBaselineRecord(
  morningHrSamples: number[],
  last14DaysRollingAvg: number[],
  isProvisional = false
): Baseline {
  const value = mean(morningHrSamples);
  const rollingAverage = getRollingAverage(last14DaysRollingAvg);

  return {
    value,
    rollingAverage,
    deviation: value - rollingAverage,
    computedAt: new Date(),
    isProvisional,
  };
}
