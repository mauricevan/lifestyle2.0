/**
 * Hyperfocus detection and notification — Flow B step 1.
 */

import { systemMessages } from "../../copy/systemMessages";
import { sendSystemNotification } from "../../services/notifications/notificationService";
import { getWearableProvider } from "../../services/wearable/wearableFactory";
import { useRpmStore } from "../../state/rpmStore";

let lastHyperfocusNotifyAt = 0;

export function startLiveMonitoring(): () => void {
  const provider = getWearableProvider();
  let lastTickAt = Date.now();
  let stepsCache = 0;

  const stepInterval = setInterval(async () => {
    const now = new Date();
    const window = { start: new Date(now.getTime() - 60_000), end: now };
    stepsCache = await provider.getStepCount(window);
  }, 60_000);

  const unsubscribe = provider.subscribeHeartRate((sample) => {
    const store = useRpmStore.getState();
    const elapsedMs = Date.now() - lastTickAt;
    lastTickAt = Date.now();
    const stepsPerMinute = stepsCache;

    void provider.getActiveWorkouts({
      start: new Date(Date.now() - 60 * 60 * 1000),
      end: new Date(),
    }).then((workouts) => {
      const isWorkoutActive = workouts.length > 0;
      store.tickEp({
        currentHr: sample.bpm,
        stepsPerMinute,
        isWorkoutActive,
        elapsedMs,
      });
      store.updateSensorStatus(provider.getConnectionStatus());

      const state = useRpmStore.getState().epState;
      if (state?.isHyperfocusActive && Date.now() - lastHyperfocusNotifyAt > 15 * 60_000) {
        lastHyperfocusNotifyAt = Date.now();
        void sendSystemNotification(
          systemMessages.hyperfocusPushTitle,
          systemMessages.hyperfocusSoft
        );
      }
    });
  });

  return () => {
    clearInterval(stepInterval);
    unsubscribe();
  };
}
