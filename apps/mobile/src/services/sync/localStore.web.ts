/**
 * Web local persistence — AsyncStorage fallback (expo-sqlite WASM unavailable in Metro web).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Baseline, EpState } from "@rpm/shared-types";

const EP_STATE_PREFIX = "rpm:ep_state:";
const BASELINE_PREFIX = "rpm:baseline:";
const ONBOARDING_PREFIX = "rpm:onboarding:";

export async function saveLocalEpState(state: EpState): Promise<void> {
  await AsyncStorage.setItem(`${EP_STATE_PREFIX}${state.date}`, JSON.stringify(state));
}

export async function loadLocalEpState(date: string): Promise<EpState | null> {
  const raw = await AsyncStorage.getItem(`${EP_STATE_PREFIX}${date}`);
  if (!raw) {
    return null;
  }
  const parsed = JSON.parse(raw) as EpState;
  return { ...parsed, lastUpdatedAt: new Date(parsed.lastUpdatedAt) };
}

export async function saveLocalBaseline(date: string, baseline: Baseline): Promise<void> {
  await AsyncStorage.setItem(`${BASELINE_PREFIX}${date}`, JSON.stringify(baseline));
}

export async function loadRecentBaselines(limit = 14): Promise<number[]> {
  const keys = await AsyncStorage.getAllKeys();
  const baselineKeys = keys
    .filter((key) => key.startsWith(BASELINE_PREFIX))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, limit);
  const rows = await AsyncStorage.multiGet(baselineKeys);
  return rows
    .map(([, value]) => value)
    .filter((value): value is string => value !== null)
    .map((value) => (JSON.parse(value) as Baseline).value);
}

export async function setOnboardingFlag(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(`${ONBOARDING_PREFIX}${key}`, value);
}

export async function getOnboardingFlag(key: string): Promise<string | null> {
  return AsyncStorage.getItem(`${ONBOARDING_PREFIX}${key}`);
}

export async function clearAllLocalData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const rpmKeys = keys.filter((key) => key.startsWith("rpm:"));
  if (rpmKeys.length > 0) {
    await AsyncStorage.multiRemove(rpmKeys);
  }
}
