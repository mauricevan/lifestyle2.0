/**
 * Persists paired BLE heart rate device in local onboarding storage.
 */

import {
  getOnboardingFlag,
  setOnboardingFlag,
} from "../../sync/localStore";

const DEVICE_ID_KEY = "ble_device_id";
const DEVICE_NAME_KEY = "ble_device_name";

let pairedIdCache: string | null = null;

export async function hydrateBleDeviceCache(): Promise<void> {
  pairedIdCache = await getOnboardingFlag(DEVICE_ID_KEY);
}

export function hasPairedBleDeviceSync(): boolean {
  return Boolean(pairedIdCache);
}

export interface PairedBleDevice {
  id: string;
  name: string;
}

export async function getPairedBleDevice(): Promise<PairedBleDevice | null> {
  const id = await getOnboardingFlag(DEVICE_ID_KEY);
  if (!id) {
    return null;
  }
  const name = (await getOnboardingFlag(DEVICE_NAME_KEY)) ?? "Heart rate band";
  return { id, name };
}

export async function savePairedBleDevice(device: PairedBleDevice): Promise<void> {
  pairedIdCache = device.id;
  await setOnboardingFlag(DEVICE_ID_KEY, device.id);
  await setOnboardingFlag(DEVICE_NAME_KEY, device.name);
}

export async function clearPairedBleDevice(): Promise<void> {
  pairedIdCache = null;
  await setOnboardingFlag(DEVICE_ID_KEY, "");
  await setOnboardingFlag(DEVICE_NAME_KEY, "");
}

export async function hasPairedBleDevice(): Promise<boolean> {
  if (pairedIdCache) {
    return true;
  }
  const id = await getOnboardingFlag(DEVICE_ID_KEY);
  pairedIdCache = id;
  return Boolean(id);
}
