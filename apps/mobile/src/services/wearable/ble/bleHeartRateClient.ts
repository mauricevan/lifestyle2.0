/**
 * BLE client for standard heart rate monitors (Wahoo TICKR, Polar, Garmin).
 */

import type { HeartRateSample } from "@rpm/shared-types";
import {
  decodeBase64ToBytes,
  parseHeartRateMeasurement,
} from "@rpm/wearable-adapter";
import { BleManager, type Characteristic, type Device } from "react-native-ble-plx";
import { HR_MEASUREMENT_UUID, HR_SERVICE_UUID } from "./bleConstants";
import { getPairedBleDevice } from "./bleDeviceStore";
import { addBleHeartRateSample } from "./bleSampleCache";

export interface ScannedBleDevice {
  id: string;
  name: string;
  rssi: number | null;
}

let manager: BleManager | null = null;
let connectedDevice: Device | null = null;
let monitorSubscription: { remove: () => void } | null = null;
let lastSampleAt: Date | null = null;

function getManager(): BleManager {
  if (!manager) {
    manager = new BleManager();
  }
  return manager;
}

export async function scanForHeartRateDevices(
  timeoutMs = 10_000
): Promise<ScannedBleDevice[]> {
  const ble = getManager();
  const found = new Map<string, ScannedBleDevice>();

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      ble.stopDeviceScan();
      resolve([...found.values()].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999)));
    }, timeoutMs);

    ble.startDeviceScan([HR_SERVICE_UUID], null, (error, device) => {
      if (error || !device) {
        return;
      }
      const name = device.name ?? device.localName ?? "Heart rate band";
      found.set(device.id, {
        id: device.id,
        name,
        rssi: device.rssi,
      });
    });
  });
}

function handleMeasurement(base64Value: string | null | undefined): void {
  if (!base64Value) {
    return;
  }
  const bpm = parseHeartRateMeasurement(decodeBase64ToBytes(base64Value));
  if (!bpm) {
    return;
  }
  const sample: HeartRateSample = { bpm, timestamp: new Date() };
  lastSampleAt = sample.timestamp;
  addBleHeartRateSample(sample);
  for (const listener of listeners) {
    listener(sample);
  }
}

const listeners = new Set<(sample: HeartRateSample) => void>();

export async function connectToBleDevice(deviceId: string): Promise<void> {
  await disconnectBleDevice();
  const ble = getManager();
  const device = await ble.connectToDevice(deviceId, { timeout: 15_000 });
  await device.discoverAllServicesAndCharacteristics();
  connectedDevice = device;
  device.onDisconnected(() => {
    connectedDevice = null;
    monitorSubscription = null;
  });
}

export async function connectToPairedDevice(): Promise<boolean> {
  const paired = await getPairedBleDevice();
  if (!paired) {
    return false;
  }
  await connectToBleDevice(paired.id);
  return true;
}

export function startBleHeartRateStream(
  callback: (sample: HeartRateSample) => void
): () => void {
  listeners.add(callback);
  void ensureMonitoring();
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      stopMonitoring();
    }
  };
}

async function ensureMonitoring(): Promise<void> {
  if (monitorSubscription) {
    return;
  }
  if (!connectedDevice) {
    const connected = await connectToPairedDevice();
    if (!connected || !connectedDevice) {
      return;
    }
  }
  const device = connectedDevice;
  if (!device) {
    return;
  }
  monitorSubscription = device.monitorCharacteristicForService(
    HR_SERVICE_UUID,
    HR_MEASUREMENT_UUID,
    (error, characteristic: Characteristic | null) => {
      if (error) {
        return;
      }
      handleMeasurement(characteristic?.value);
    }
  );
}

function stopMonitoring(): void {
  monitorSubscription?.remove();
  monitorSubscription = null;
}

export async function disconnectBleDevice(): Promise<void> {
  stopMonitoring();
  if (connectedDevice) {
    try {
      await connectedDevice.cancelConnection();
    } catch {
      // Device may already be disconnected.
    }
  }
  connectedDevice = null;
}

export function getBleLastSampleAt(): Date | null {
  return lastSampleAt;
}

export async function waitForFirstSample(timeoutMs = 12_000): Promise<boolean> {
  if (lastSampleAt && Date.now() - lastSampleAt.getTime() < 5_000) {
    return true;
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsubscribe();
      resolve(Boolean(lastSampleAt));
    }, timeoutMs);
    const unsubscribe = startBleHeartRateStream(() => {
      clearTimeout(timer);
      unsubscribe();
      resolve(true);
    });
    void ensureMonitoring();
  });
}
