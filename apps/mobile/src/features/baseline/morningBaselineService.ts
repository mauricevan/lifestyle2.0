/**
 * Morning baseline flow — Flow A.
 */

import {
  buildBaselineRecord,
  calculateMorningBaseline,
} from "@rpm/ep-engine";
import { systemMessages } from "../../copy/systemMessages";
import { sendSystemNotification } from "../../services/notifications/notificationService";
import {
  loadRecentBaselines,
  saveLocalBaseline,
} from "../../services/sync/localStore";
import { pushBaselineToServer } from "../../services/sync/supabaseSync";
import { getWearableProvider } from "../../services/wearable/wearableFactory";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isMorningFallbackWindow(): boolean {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 9;
}

export async function runMorningBaseline(userId: string | null): Promise<{
  budget: number;
  status: "vol" | "onderhoud" | "voorlopig";
  message: string;
}> {
  const provider = getWearableProvider();
  const today = new Date();
  let wakeTime = new Date();
  wakeTime.setHours(7, 0, 0, 0);

  const sleep = await provider.getSleepAnalysis(today);
  if (sleep?.end) {
    wakeTime = sleep.end;
  } else if (!isMorningFallbackWindow()) {
    return { budget: 100, status: "voorlopig", message: systemMessages.morningProvisional(100) };
  }

  const samples = await provider.getMorningWindowSamples(wakeTime);
  const morningHr = samples.map((s: { bpm: number }) => s.bpm);
  const rolling = await loadRecentBaselines(14);
  const isProvisional = morningHr.length === 0 || rolling.length === 0;

  if (morningHr.length === 0) {
    const budget = { amount: 100, status: "voorlopig" as const };
    const message = systemMessages.morningProvisional(budget.amount);
    await sendSystemNotification("RPM", message);
    return { budget: budget.amount, status: budget.status, message };
  }

  const budget = calculateMorningBaseline({
    morningHrSamples: morningHr,
    last14DaysRollingAvg: rolling,
  });
  const baseline = buildBaselineRecord(morningHr, rolling, isProvisional);
  await saveLocalBaseline(todayKey(), baseline);
  if (userId) {
    await pushBaselineToServer(baseline, todayKey(), userId);
  }

  const message =
    budget.status === "onderhoud"
      ? systemMessages.morningMaintenance(budget.amount)
      : budget.status === "voorlopig"
        ? systemMessages.morningProvisional(budget.amount)
        : systemMessages.morningFullBudget(budget.amount);

  await sendSystemNotification("RPM", message);
  return { budget: budget.amount, status: budget.status, message };
}
