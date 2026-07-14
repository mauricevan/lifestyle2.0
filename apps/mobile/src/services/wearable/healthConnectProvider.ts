/**
 * Google Health Connect wearable provider (Android).
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

let lastSampleAt: Date | null = null;
let isHealthConnectReady = false;

async function getHealthConnect() {
  if (Platform.OS !== "android") {
    return null;
  }
  try {
    return await import("react-native-health-connect");
  } catch {
    return null;
  }
}

async function ensureHealthConnectReady(): Promise<boolean> {
  const hc = await getHealthConnect();
  if (!hc) {
    return false;
  }
  if (isHealthConnectReady) {
    return true;
  }
  const status = await hc.getSdkStatus();
  if (status !== hc.SdkAvailabilityStatus.SDK_AVAILABLE) {
    return false;
  }
  await hc.initialize();
  isHealthConnectReady = true;
  return true;
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

const PERMISSIONS = [
  { accessType: "read" as const, recordType: "Steps" as const },
  { accessType: "read" as const, recordType: "HeartRate" as const },
  { accessType: "read" as const, recordType: "SleepSession" as const },
];

export const healthConnectProvider: WearableProvider = {
  async isAvailable() {
    const hc = await getHealthConnect();
    if (!hc) {
      return false;
    }
    const statusResult = await hc.getSdkStatus();
    return statusResult === hc.SdkAvailabilityStatus.SDK_AVAILABLE;
  },

  async requestPermissions(): Promise<PermissionResult> {
    const hc = await getHealthConnect();
    if (!hc) {
      return { granted: false, missingPermissions: ["HealthConnect"] };
    }
    await hc.initialize();
    isHealthConnectReady = true;
    const granted = await hc.requestPermission(PERMISSIONS);
    const isGranted = granted.length === PERMISSIONS.length;
    return {
      granted: isGranted,
      missingPermissions: isGranted ? [] : ["HealthConnect"],
    };
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
    const ready = await ensureHealthConnectReady();
    if (!ready) {
      return 0;
    }
    const hc = await getHealthConnect();
    if (!hc) {
      return 0;
    }
    const result = await hc.readRecords("Steps", {
      timeRangeFilter: {
        operator: "between",
        startTime: window.start.toISOString(),
        endTime: window.end.toISOString(),
      },
    });
    return (result.records ?? []).reduce(
      (sum: number, record: { count?: number }) => sum + (record.count ?? 0),
      0
    );
  },

  async getSleepAnalysis(date) {
    const ready = await ensureHealthConnectReady();
    if (!ready) {
      return null;
    }
    const hc = await getHealthConnect();
    if (!hc) {
      return null;
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const result = await hc.readRecords("SleepSession", {
      timeRangeFilter: {
        operator: "between",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    });
    const session = result.records?.[0];
    if (!session) {
      return null;
    }
    return {
      start: new Date(session.startTime),
      end: new Date(session.endTime),
      source: "HealthConnect",
    };
  },

  async getActiveWorkouts(_window: TimeWindow): Promise<WorkoutWindow[]> {
    return [];
  },

  getConnectionStatus() {
    return mapStatus(lastSampleAt);
  },
};

async function readHeartRate(window: TimeWindow): Promise<HeartRateSample[]> {
  const ready = await ensureHealthConnectReady();
  if (!ready) {
    return [];
  }
  const hc = await getHealthConnect();
  if (!hc) {
    return [];
  }
  const result = await hc.readRecords("HeartRate", {
    timeRangeFilter: {
      operator: "between",
      startTime: window.start.toISOString(),
      endTime: window.end.toISOString(),
    },
  });
  const samples: HeartRateSample[] = [];
  for (const record of result.records ?? []) {
    for (const sample of record.samples ?? []) {
      samples.push({
        bpm: sample.beatsPerMinute,
        timestamp: new Date(sample.time),
      });
    }
  }
  return samples.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
