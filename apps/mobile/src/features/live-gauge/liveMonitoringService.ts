/**
 * Live monitoring lifecycle — restart after BLE pairing.
 */

import {
  startBackgroundBleReconnect,
} from "../../services/background/backgroundBleReconnect";
import {
  startForegroundMonitoringNotification,
  stopForegroundMonitoringNotification,
} from "../../services/background/foregroundMonitoringService";
import { startLiveMonitoring } from "./hyperfocusMonitor";

let stopActiveMonitoring: (() => void) | null = null;
let stopBleReconnect: (() => void) | null = null;

export function beginLiveMonitoring(): void {
  stopActiveMonitoring?.();
  stopBleReconnect?.();
  stopActiveMonitoring = startLiveMonitoring();
  stopBleReconnect = startBackgroundBleReconnect();
  void startForegroundMonitoringNotification();
}

export function restartLiveMonitoring(): void {
  beginLiveMonitoring();
}

export async function endLiveMonitoring(): Promise<void> {
  stopActiveMonitoring?.();
  stopBleReconnect?.();
  stopActiveMonitoring = null;
  stopBleReconnect = null;
  await stopForegroundMonitoringNotification();
}
