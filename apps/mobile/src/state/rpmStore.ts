/**
 * Zustand store for RPM application state.
 */

import { create } from "zustand";
import type { Baseline, EpState, SensorStatus } from "@rpm/shared-types";
import { DEFAULT_RPM_CONFIG } from "@rpm/shared-types";
import {
  accumulateEpSpend,
  calculateBurnRate,
  detectHyperfocus,
} from "@rpm/ep-engine";
import { saveLocalEpState } from "../services/sync/localStore";
import { pushEpStateToServer } from "../services/sync/supabaseSync";

export interface RpmStore {
  userId: string | null;
  epState: EpState | null;
  baseline: Baseline | null;
  hyperfocusSamples: Array<{ timestamp: Date; hrBpm: number; stepsPerMinute: number }>;
  currentHeartRate: number | null;
  isOnboardingComplete: boolean;
  setUserId: (id: string | null) => void;
  setBaseline: (baseline: Baseline | null) => void;
  setOnboardingComplete: (value: boolean) => void;
  initEpState: (budget: number, status: EpState["status"]) => void;
  updateSensorStatus: (status: SensorStatus) => void;
  tickEp: (input: {
    currentHr: number;
    stepsPerMinute: number;
    isWorkoutActive: boolean;
    elapsedMs: number;
  }) => void;
  setHyperfocusActive: (active: boolean) => void;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultState(budget: number, status: EpState["status"]): EpState {
  return {
    date: todayKey(),
    budget,
    spent: 0,
    remaining: budget,
    status,
    burnRatePerHour: DEFAULT_RPM_CONFIG.baseBurnRate,
    isHyperfocusActive: false,
    sensorStatus: "connected",
    lastUpdatedAt: new Date(),
  };
}

export const useRpmStore = create<RpmStore>((set, get) => ({
  userId: null,
  epState: null,
  baseline: null,
  hyperfocusSamples: [],
  currentHeartRate: null,
  isOnboardingComplete: false,

  setUserId: (id) => set({ userId: id }),

  setBaseline: (baseline) => set({ baseline }),

  setOnboardingComplete: (value) => set({ isOnboardingComplete: value }),

  initEpState: (budget, status) => {
    const state = createDefaultState(budget, status);
    set({ epState: state });
    void saveLocalEpState(state);
  },

  updateSensorStatus: (status) => {
    const current = get().epState;
    if (!current) {
      return;
    }
    const updated = { ...current, sensorStatus: status, lastUpdatedAt: new Date() };
    set({ epState: updated });
    void saveLocalEpState(updated);
  },

  tickEp: ({ currentHr, stepsPerMinute, isWorkoutActive, elapsedMs }) => {
    const { epState, baseline, userId, hyperfocusSamples } = get();
    if (!epState) {
      return;
    }
    const baselineHr = baseline?.value ?? 65;
    const burnRate = calculateBurnRate({
      currentHr,
      baselineHr,
      stepsPerMinute,
      isWorkoutActive,
    });
    const accumulated = accumulateEpSpend({
      spent: epState.spent,
      budget: epState.budget,
      burnRatePerHour: burnRate,
      elapsedMs,
    });
    const nextSamples = [
      ...hyperfocusSamples,
      { timestamp: new Date(), hrBpm: currentHr, stepsPerMinute },
    ].slice(-30);
    const hyperfocus = detectHyperfocus(nextSamples, baselineHr, isWorkoutActive);
    const updated: EpState = {
      ...epState,
      spent: accumulated.spent,
      remaining: accumulated.remaining,
      burnRatePerHour: burnRate,
      isHyperfocusActive: hyperfocus.isActive,
      lastUpdatedAt: new Date(),
    };
    set({ epState: updated, hyperfocusSamples: nextSamples, currentHeartRate: currentHr });
    void saveLocalEpState(updated);
    if (userId) {
      void pushEpStateToServer(updated, userId);
    }
  },

  setHyperfocusActive: (active) => {
    const current = get().epState;
    if (!current) {
      return;
    }
    set({ epState: { ...current, isHyperfocusActive: active } });
  },
}));
