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
import { scanForHeartRateDevices as runBleScan } from "./bleScanner";

export type { ScannedBleDevice } from "./bleScanner";

let manager: BleManager | null = null;
let connectedDevice: Device | null = null;
let activeDeviceId: string | null = null;
let monitorSubscription: { remove: () => void } | null = null;
let lastSampleAt: Date | null = null;
let connectInFlight: Promise<void> | null = null;

function getManager(): BleManager {
  if (!manager) {
    manager = new BleManager();
  }
  return manager;
}

function isAlreadyConnectedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("already connected")
  );
}

export async function scanForHeartRateDevices(
  timeoutMs = 15_000
): Promise<import("./bleScanner").ScannedBleDevice[]> {
  await disconnectBleDevice();
  return runBleScan(getManager(), timeoutMs);
}

export async function reconnectPairedDevice(): Promise<boolean> {
  const paired = await getPairedBleDevice();
  if (!paired) {
    return false;
  }
  await connectToBleDevice(paired.id);
  return await waitForFirstSample(15_000);
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

async function attachToDevice(device: Device): Promise<void> {
  await device.discoverAllServicesAndCharacteristics();
  connectedDevice = device;
  activeDeviceId = device.id;
  device.onDisconnected(() => {
    if (connectedDevice?.id === device.id) {
      connectedDevice = null;
      activeDeviceId = null;
      monitorSubscription = null;
    }
  });
}

async function connectInternal(deviceId: string): Promise<void> {
  const ble = getManager();
  if (activeDeviceId === deviceId && connectedDevice) {
    const stillConnected = await connectedDevice.isConnected();
    if (stillConnected) {
      return;
    }
  }
  if (activeDeviceId && activeDeviceId !== deviceId) {
    await disconnectBleDevice();
  }
  try {
    const device = await ble.connectToDevice(deviceId, { timeout: 15_000 });
    await attachToDevice(device);
  } catch (error) {
    if (!isAlreadyConnectedError(error)) {
      throw error;
    }
    const [device] = await ble.devices([deviceId]);
    if (!device) {
      throw error;
    }
    await attachToDevice(device);
  }
}

export async function connectToBleDevice(deviceId: string): Promise<void> {
  if (connectInFlight) {
    await connectInFlight;
    if (activeDeviceId === deviceId) {
      return;
    }
  }
  connectInFlight = connectInternal(deviceId);
  try {
    await connectInFlight;
  } finally {
    connectInFlight = null;
  }
}

export async function connectToPairedDevice(): Promise<boolean> {
  const paired = await getPairedBleDevice();
  if (!paired) {
    return false;
  }
  await connectToBleDevice(paired.id);
  return Boolean(connectedDevice);
}

export function startBleHeartRateStream(
  callback: (sample: HeartRateSample) => void
): () => void {
  listeners.add(callback);
  void ensureMonitoring();
  return () => {
    listeners.delete(callback);
  };
}

async function ensureMonitoring(): Promise<void> {
  if (!connectedDevice) {
    const connected = await connectToPairedDevice();
    if (!connected || !connectedDevice) {
      return;
    }
  }
  if (monitorSubscription) {
    return;
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
  if (!connectedDevice) {
    activeDeviceId = null;
    return;
  }
  try {
    await connectedDevice.cancelConnection();
  } catch {
    // Device may already be disconnected.
  }
  connectedDevice = null;
  activeDeviceId = null;
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
