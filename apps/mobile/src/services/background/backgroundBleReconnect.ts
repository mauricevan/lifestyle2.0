/**
 * Reconnect BLE when app returns from background or screen lock.
 */

import { AppState, type AppStateStatus } from "react-native";
import { connectToPairedDevice } from "../wearable/ble/bleHeartRateClient";
import { hasPairedBleDevice } from "../wearable/ble/bleDeviceStore";

export function startBackgroundBleReconnect(): () => void {
  const onStateChange = (state: AppStateStatus) => {
    if (state !== "active" && state !== "background") {
      return;
    }
    void reconnectIfPaired();
  };

  const subscription = AppState.addEventListener("change", onStateChange);
  return () => subscription.remove();
}

async function reconnectIfPaired(): Promise<void> {
  if (!(await hasPairedBleDevice())) {
    return;
  }
  try {
    await connectToPairedDevice();
  } catch {
    // Retry on next app state change.
  }
}
