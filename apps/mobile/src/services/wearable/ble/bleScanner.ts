/**
 * BLE scan helpers for heart rate bands.
 */

import type { Device } from "react-native-ble-plx";
import { BleManager } from "react-native-ble-plx";
import { HR_DEVICE_NAME_HINTS } from "./bleConstants";

export interface ScannedBleDevice {
  id: string;
  name: string;
  rssi: number | null;
}

function matchesHrDevice(device: Device): boolean {
  const name = (device.name ?? device.localName ?? "").toUpperCase();
  if (HR_DEVICE_NAME_HINTS.some((hint) => name.includes(hint))) {
    return true;
  }
  const services = device.serviceUUIDs ?? [];
  return services.some((uuid) => uuid.toUpperCase().includes("180D"));
}

export async function scanForHeartRateDevices(
  manager: BleManager,
  timeoutMs = 15_000
): Promise<ScannedBleDevice[]> {
  manager.stopDeviceScan();
  const found = new Map<string, ScannedBleDevice>();

  return new Promise((resolve) => {
    const finish = () => {
      manager.stopDeviceScan();
      resolve([...found.values()].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999)));
    };
    const timer = setTimeout(finish, timeoutMs);

    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        clearTimeout(timer);
        finish();
        return;
      }
      if (!device || !matchesHrDevice(device)) {
        return;
      }
      const name = device.name ?? device.localName ?? "Heart rate band";
      found.set(device.id, { id: device.id, name, rssi: device.rssi });
    });
  });
}
