/**
 * App bootstrap hook — auth, sync, monitoring.
 */

import { useEffect } from "react";
import { ensureAnonymousSession } from "../services/supabase/client";
import { getOnboardingFlag } from "../services/sync/localStore";
import { mergeEpState, subscribeEpStateRealtime } from "../services/sync/supabaseSync";
import { requestNotificationPermissions } from "../services/notifications/notificationService";
import { runMorningBaseline } from "../features/baseline/morningBaselineService";
import { startLiveMonitoring } from "../features/live-gauge/hyperfocusMonitor";
import { startEveningScheduler } from "../features/evening/eveningReportService";
import { useRpmStore } from "../state/rpmStore";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useRpmBootstrap(): { isReady: boolean; needsOnboarding: boolean } {
  const setUserId = useRpmStore((s) => s.setUserId);
  const setOnboardingComplete = useRpmStore((s) => s.setOnboardingComplete);
  const initEpState = useRpmStore((s) => s.initEpState);
  const isOnboardingComplete = useRpmStore((s) => s.isOnboardingComplete);

  useEffect(() => {
    let stopMonitoring: (() => void) | undefined;
    let stopEvening: (() => void) | undefined;
    let stopRealtime: (() => void) | undefined;

    const boot = async () => {
      await requestNotificationPermissions();
      const disclaimer = await getOnboardingFlag("disclaimer_accepted");
      const wearable = await getOnboardingFlag("wearable_connected");
      const completeFromStorage = disclaimer === "true" && wearable === "true";
      const complete = completeFromStorage || isOnboardingComplete;
      setOnboardingComplete(complete);

      const userId = await ensureAnonymousSession();
      setUserId(userId);

      if (!complete) {
        return;
      }

      const merged = userId
        ? await mergeEpState(todayKey(), userId, useRpmStore.getState().epState)
        : null;

      if (merged) {
        useRpmStore.setState({ epState: merged });
      } else if (!useRpmStore.getState().epState) {
        const baseline = await runMorningBaseline(userId);
        initEpState(baseline.budget, baseline.status);
      }

      stopMonitoring = startLiveMonitoring();
      stopEvening = startEveningScheduler(() => useRpmStore.getState().epState);
      if (userId) {
        stopRealtime = subscribeEpStateRealtime(userId, (state) => {
          useRpmStore.setState({ epState: state });
        });
      }
    };

    void boot();
    return () => {
      stopMonitoring?.();
      stopEvening?.();
      stopRealtime?.();
    };
  }, [initEpState, isOnboardingComplete, setOnboardingComplete, setUserId]);

  return {
    isReady: true,
    needsOnboarding: !isOnboardingComplete,
  };
}
