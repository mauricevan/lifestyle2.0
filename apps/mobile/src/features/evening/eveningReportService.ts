/**
 * Evening landing report — Flow D.
 */

import { systemMessages } from "../../copy/systemMessages";
import { speakEveningReport } from "../../services/speech/ttsService";
import type { EpState } from "@rpm/shared-types";

const DEFAULT_EVENING_HOUR = 22;
const DEFAULT_EVENING_MINUTE = 30;

export function buildEveningMessage(state: EpState): string {
  if (state.remaining <= 0) {
    return systemMessages.eveningOver();
  }
  return systemMessages.eveningCool(state.remaining);
}

export function shouldTriggerEveningReport(lastActivityAt: Date): boolean {
  const now = new Date();
  const evening = new Date();
  evening.setHours(DEFAULT_EVENING_HOUR, DEFAULT_EVENING_MINUTE, 0, 0);
  const inactiveMs = now.getTime() - lastActivityAt.getTime();
  return now >= evening || inactiveMs >= 30 * 60 * 1000;
}

export function deliverEveningReport(state: EpState): void {
  speakEveningReport(buildEveningMessage(state));
}

export function startEveningScheduler(getState: () => EpState | null): () => void {
  let delivered = false;
  let lastActivity = new Date();
  const interval = setInterval(() => {
    const state = getState();
    if (!state || delivered) {
      return;
    }
    lastActivity = state.lastUpdatedAt;
    if (shouldTriggerEveningReport(lastActivity)) {
      deliverEveningReport(state);
      delivered = true;
    }
  }, 60_000);
  return () => clearInterval(interval);
}
