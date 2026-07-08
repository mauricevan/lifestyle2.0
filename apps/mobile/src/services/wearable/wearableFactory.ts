/**
 * Resolves platform-specific wearable provider.
 */

import { Platform } from "react-native";
import type { WearableProvider } from "@rpm/wearable-adapter";
import { healthConnectProvider } from "./healthConnectProvider";
import { healthKitProvider } from "./healthKitProvider";
import { mockWearableProvider } from "./mockWearableProvider";

export function getWearableProvider(): WearableProvider {
  if (Platform.OS === "ios") {
    return healthKitProvider;
  }
  if (Platform.OS === "android") {
    return healthConnectProvider;
  }
  return mockWearableProvider;
}
