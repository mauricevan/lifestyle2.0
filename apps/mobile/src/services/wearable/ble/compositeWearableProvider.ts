/**
 * Android composite provider — BLE heart rate + Health Connect steps/sleep.
 */

import type { WearableProvider } from "@rpm/wearable-adapter";
import { healthConnectProvider } from "../healthConnectProvider";
import { bleHeartRateProvider, isBleHeartRateActive } from "./bleHeartRateProvider";
import { hasPairedBleDeviceSync } from "./bleDeviceStore";

async function resolveHeartRateProvider(): Promise<WearableProvider> {
  if (await isBleHeartRateActive()) {
    return bleHeartRateProvider;
  }
  return healthConnectProvider;
}

export const compositeWearableProvider: WearableProvider = {
  async isAvailable() {
    const bleOk = await bleHeartRateProvider.isAvailable();
    const hcOk = await healthConnectProvider.isAvailable();
    return bleOk || hcOk;
  },

  async requestPermissions() {
    const ble = await bleHeartRateProvider.requestPermissions();
    const hc = await healthConnectProvider.requestPermissions();
    return {
      granted: ble.granted && hc.granted,
      missingPermissions: [...ble.missingPermissions, ...hc.missingPermissions],
    };
  },

  subscribeHeartRate(callback) {
    let innerUnsub: (() => void) | undefined;
    let cancelled = false;
    void resolveHeartRateProvider().then((provider) => {
      if (cancelled) {
        return;
      }
      innerUnsub = provider.subscribeHeartRate(callback);
    });
    return () => {
      cancelled = true;
      innerUnsub?.();
    };
  },

  async getMorningWindowSamples(wakeTime) {
    const provider = await resolveHeartRateProvider();
    return provider.getMorningWindowSamples(wakeTime);
  },

  async getStepCount(window) {
    return healthConnectProvider.getStepCount(window);
  },

  async getSleepAnalysis(date) {
    return healthConnectProvider.getSleepAnalysis(date);
  },

  async getActiveWorkouts(window) {
    return healthConnectProvider.getActiveWorkouts(window);
  },

  getConnectionStatus() {
    if (hasPairedBleDeviceSync()) {
      return bleHeartRateProvider.getConnectionStatus();
    }
    return healthConnectProvider.getConnectionStatus();
  },
};
