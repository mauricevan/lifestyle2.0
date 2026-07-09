/**
 * BLE wearable provider — direct heart rate from chest/arm bands.
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
import {
  connectToPairedDevice,
  getBleLastSampleAt,
  startBleHeartRateStream,
} from "./bleHeartRateClient";
import { requestBlePermissions } from "./blePermissions";
import { hasPairedBleDevice } from "./bleDeviceStore";
import { getBleSamplesInWindow } from "./bleSampleCache";
import { BleManager } from "react-native-ble-plx";

function mapBleStatus(lastAt: Date | null): SensorStatus {
  if (!lastAt) {
    return "disconnected";
  }
  const ageMs = Date.now() - lastAt.getTime();
  if (ageMs > 2 * 60 * 1000) {
    return "disconnected";
  }
  if (ageMs > 45_000) {
    return "degraded";
  }
  return "connected";
}

export const bleHeartRateProvider: WearableProvider = {
  async isAvailable() {
    const manager = new BleManager();
    const state = await manager.state();
    await manager.destroy();
    return state === "PoweredOn";
  },

  async requestPermissions(): Promise<PermissionResult> {
    const granted = await requestBlePermissions();
    return {
      granted,
      missingPermissions: granted ? [] : ["Bluetooth"],
    };
  },

  subscribeHeartRate(callback) {
    let active = true;
    const wrapped = (sample: HeartRateSample) => {
      if (active) {
        callback(sample);
      }
    };
    const unsubscribe = startBleHeartRateStream(wrapped);
    void connectToPairedDevice();
    return () => {
      active = false;
      unsubscribe();
    };
  },

  async getMorningWindowSamples(wakeTime) {
    const end = new Date(wakeTime.getTime() + 5 * 60 * 1000);
    return getBleSamplesInWindow(wakeTime, end);
  },

  async getStepCount() {
    return 0;
  },

  async getSleepAnalysis() {
    return null;
  },

  async getActiveWorkouts() {
    return [];
  },

  getConnectionStatus() {
    return mapBleStatus(getBleLastSampleAt());
  },
};

export async function isBleHeartRateActive(): Promise<boolean> {
  return hasPairedBleDevice();
}
