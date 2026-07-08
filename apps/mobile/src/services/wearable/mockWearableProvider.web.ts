/**
 * Web mock wearable — faster HR updates for browser demo.
 */

import type { WearableProvider } from "@rpm/wearable-adapter";
import type {
  HeartRateSample,
  PermissionResult,
  SensorStatus,
  SleepWindow,
  TimeWindow,
  WorkoutWindow,
} from "@rpm/shared-types";

let connected = true;
let hrBpm = 68;

export const mockWearableProvider: WearableProvider = {
  async isAvailable() {
    return true;
  },

  async requestPermissions(): Promise<PermissionResult> {
    connected = true;
    return { granted: true, missingPermissions: [] };
  },

  subscribeHeartRate(callback) {
    callback({ bpm: hrBpm, timestamp: new Date() });
    const interval = setInterval(() => {
      hrBpm = 62 + Math.round(Math.random() * 28);
      callback({ bpm: hrBpm, timestamp: new Date() });
    }, 2000);
    return () => clearInterval(interval);
  },

  async getMorningWindowSamples(wakeTime) {
    const samples: HeartRateSample[] = [];
    for (let i = 0; i < 5; i += 1) {
      samples.push({
        bpm: 68 + i,
        timestamp: new Date(wakeTime.getTime() + i * 60 * 1000),
      });
    }
    return samples;
  },

  async getStepCount(_window: TimeWindow) {
    return Math.floor(Math.random() * 200);
  },

  async getSleepAnalysis(date) {
    const start = new Date(date);
    start.setHours(23, 0, 0, 0);
    start.setDate(start.getDate() - 1);
    const end = new Date(date);
    end.setHours(7, 0, 0, 0);
    return { start, end, source: "mock" } satisfies SleepWindow;
  },

  async getActiveWorkouts(_window: TimeWindow): Promise<WorkoutWindow[]> {
    return [];
  },

  getConnectionStatus(): SensorStatus {
    return connected ? "connected" : "disconnected";
  },
};
