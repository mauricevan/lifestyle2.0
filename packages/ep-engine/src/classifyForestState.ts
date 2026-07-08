/**
 * Forest mode classification stub for Phase 3.
 */

import type { Baseline, ForestClassification } from "@rpm/shared-types";

export interface ForestStateInput {
  hrvRmssd: number;
  hr: number;
  baseline: Baseline;
}

export function classifyForestState(input: ForestStateInput): ForestClassification {
  const hrElevated = input.hr > input.baseline.value + 15;
  const hrvFloor = input.baseline.hrvFloor ?? 20;
  const hrvSuppressed = input.hrvRmssd < hrvFloor;
  const hrvRecovering = input.hrvRmssd >= hrvFloor;

  if (hrElevated && hrvSuppressed) {
    return "STOP";
  }
  if (hrElevated && hrvRecovering) {
    return "CONTINUE";
  }
  return "CONTINUE";
}
