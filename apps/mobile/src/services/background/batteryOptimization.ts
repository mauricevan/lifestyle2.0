/**
 * Open Android app settings for battery optimization (Realme/OPPO guidance in copy).
 */

import { Linking, Platform } from "react-native";

export function openBatteryOptimizationSettings(): void {
  if (Platform.OS !== "android") {
    return;
  }
  void Linking.openSettings();
}
