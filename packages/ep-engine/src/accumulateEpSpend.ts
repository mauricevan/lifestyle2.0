/**
 * Accumulate EP spend over time from burn rate.
 */

export interface EpAccumulationInput {
  spent: number;
  budget: number;
  burnRatePerHour: number;
  elapsedMs: number;
}

export interface EpAccumulationResult {
  spent: number;
  remaining: number;
  percentUsed: number;
}

export function accumulateEpSpend(
  input: EpAccumulationInput
): EpAccumulationResult {
  const hours = input.elapsedMs / (1000 * 60 * 60);
  const increment = input.burnRatePerHour * hours;
  const spent = Math.min(input.budget, input.spent + increment);
  const remaining = Math.max(0, input.budget - spent);
  const percentUsed = input.budget > 0 ? (spent / input.budget) * 100 : 0;

  return { spent, remaining, percentUsed };
}

export function epToGaugeRpm(
  percentUsed: number,
  maxRpm = 8000
): number {
  const clamped = Math.min(100, Math.max(0, percentUsed));
  return Math.round((clamped / 100) * maxRpm);
}

export type GaugeZone = "green" | "yellow" | "red" | "orange";

export function getGaugeZone(percentUsed: number, isHyperfocus: boolean): GaugeZone {
  if (isHyperfocus) {
    return "orange";
  }
  if (percentUsed >= 85) {
    return "red";
  }
  if (percentUsed >= 60) {
    return "yellow";
  }
  return "green";
}
