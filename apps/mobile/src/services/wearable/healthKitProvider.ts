/**
 * Apple HealthKit wearable provider (iOS).
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
import { Platform } from "react-native";

const READ_TYPES = [
  "HKQuantityTypeIdentifierHeartRate",
  "HKQuantityTypeIdentifierStepCount",
  "HKCategoryTypeIdentifierSleepAnalysis",
  "HKWorkoutTypeIdentifier",
] as const;

let lastSampleAt: Date | null = null;

async function getHealthKit() {
  if (Platform.OS !== "ios") {
    return null;
  }
  try {
    return await import("@kingstinct/react-native-healthkit");
  } catch {
    return null;
  }
}

function mapStatus(lastAt: Date | null): SensorStatus {
  if (!lastAt) {
    return "disconnected";
  }
  const ageMs = Date.now() - lastAt.getTime();
  if (ageMs > 10 * 60 * 1000) {
    return "disconnected";
  }
  if (ageMs > 3 * 60 * 1000) {
    return "degraded";
  }
  return "connected";
}

function dateFilter(start: Date, end: Date) {
  return { filter: { date: { startDate: start, endDate: end } } };
}

export const healthKitProvider: WearableProvider = {
  async isAvailable() {
    const hk = await getHealthKit();
    if (!hk) {
      return false;
    }
    return hk.isHealthDataAvailable();
  },

  async requestPermissions(): Promise<PermissionResult> {
    const hk = await getHealthKit();
    if (!hk) {
      return { granted: false, missingPermissions: ["HealthKit"] };
    }
    await hk.requestAuthorization({ toRead: [...READ_TYPES] });
    return { granted: true, missingPermissions: [] };
  },

  subscribeHeartRate(callback) {
    let active = true;
    const poll = async () => {
      while (active) {
        const now = new Date();
        const window = { start: new Date(now.getTime() - 5 * 60 * 1000), end: now };
        const samples = await readHeartRate(window);
        const latest = samples[samples.length - 1];
        if (latest) {
          lastSampleAt = latest.timestamp;
          callback(latest);
        }
        await new Promise((resolve) => setTimeout(resolve, 60_000));
      }
    };
    void poll();
    return () => {
      active = false;
    };
  },

  async getMorningWindowSamples(wakeTime) {
    const end = new Date(wakeTime.getTime() + 5 * 60 * 1000);
    return readHeartRate({ start: wakeTime, end });
  },

  async getStepCount(window: TimeWindow) {
    const hk = await getHealthKit();
    if (!hk) {
      return 0;
    }
    const result = await hk.queryStatisticsForQuantity(
      "HKQuantityTypeIdentifierStepCount",
      ["cumulativeSum"],
      dateFilter(window.start, window.end)
    );
    return result?.sumQuantity?.quantity ?? 0;
  },

  async getSleepAnalysis(date) {
    const hk = await getHealthKit();
    if (!hk) {
      return null;
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 1);
    const end = new Date(date);
    end.setHours(12, 0, 0, 0);
    const sleepSamples = await hk.queryCategorySamples(
      "HKCategoryTypeIdentifierSleepAnalysis",
      { limit: -1, ...dateFilter(start, end), ascending: true }
    );
    if (!sleepSamples || sleepSamples.length === 0) {
      return null;
    }
    const lastSample = sleepSamples[sleepSamples.length - 1]!;
    return {
      start: new Date(lastSample.startDate),
      end: new Date(lastSample.endDate),
      source: "HealthKit",
    };
  },

  async getActiveWorkouts(window: TimeWindow): Promise<WorkoutWindow[]> {
    const hk = await getHealthKit();
    if (!hk) {
      return [];
    }
    const workouts = await hk.queryWorkoutSamples({
      limit: -1,
      ...dateFilter(window.start, window.end),
    });
    const mapped: WorkoutWindow[] = [];
    for (const workout of workouts ?? []) {
      mapped.push({
        start: new Date(workout.startDate),
        end: new Date(workout.endDate),
        activityType: String(workout.workoutActivityType),
      });
    }
    return mapped;
  },

  getConnectionStatus() {
    return mapStatus(lastSampleAt);
  },
};

async function readHeartRate(window: TimeWindow): Promise<HeartRateSample[]> {
  const hk = await getHealthKit();
  if (!hk) {
    return [];
  }
  const hrSamples = await hk.queryQuantitySamples(
    "HKQuantityTypeIdentifierHeartRate",
    { limit: -1, ...dateFilter(window.start, window.end), ascending: true }
  );
  return (hrSamples ?? []).map((sample) => ({
    bpm: sample.quantity,
    timestamp: new Date(sample.startDate),
  }));
}
