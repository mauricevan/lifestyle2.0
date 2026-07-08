/**
 * Web wearable factory — mock provider only (no native health modules).
 */

import type { WearableProvider } from "@rpm/wearable-adapter";
import { mockWearableProvider } from "./mockWearableProvider";

export function getWearableProvider(): WearableProvider {
  return mockWearableProvider;
}
