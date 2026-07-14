/**
 * Onboarding step 2 — BLE band pairing (Android) or Health permissions (iOS).
 */

import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { BlePairingPanel } from "../../src/components/BlePairingPanel";
import { systemMessages } from "../../src/copy/systemMessages";
import { restartLiveMonitoring } from "../../src/features/live-gauge/liveMonitoringService";
import { setOnboardingFlag } from "../../src/services/sync/localStore";
import { getWearableProvider } from "../../src/services/wearable/wearableFactory";
import { healthConnectProvider } from "../../src/services/wearable/wearableFactory";
import { useRpmStore } from "../../src/state/rpmStore";
import { tokens } from "../../src/theme/tokens";

async function grantHealthConnectAccess(): Promise<void> {
  const available = await healthConnectProvider.isAvailable();
  if (available) {
    await healthConnectProvider.requestPermissions();
  }
}

export default function WearableScreen() {
  const isOnboardingComplete = useRpmStore((s) => s.isOnboardingComplete);

  const finishPairing = async () => {
    await grantHealthConnectAccess();
    await setOnboardingFlag("wearable_connected", "true");
    restartLiveMonitoring();
    if (isOnboardingComplete) {
      router.replace("/gauge");
      return;
    }
    router.push("/onboarding/done");
  };

  const connectIos = async () => {
    const provider = getWearableProvider();
    const available = await provider.isAvailable();
    if (!available) {
      await finishPairing();
      return;
    }
    await provider.requestPermissions();
    await finishPairing();
  };

  if (Platform.OS === "android") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{systemMessages.onboardingWearableTitle}</Text>
        <Text style={styles.body}>{systemMessages.onboardingWearableBody}</Text>
        <BlePairingPanel onPaired={() => void finishPairing()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{systemMessages.onboardingWearableTitle}</Text>
      <Text style={styles.body}>{systemMessages.onboardingWearableBody}</Text>
      <Pressable style={styles.button} onPress={() => void connectIos()}>
        <Text style={styles.buttonText}>{systemMessages.onboardingWearableConnect}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colorBg,
    padding: tokens.space8,
    paddingTop: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: tokens.colorTextPrimary,
    marginBottom: tokens.space6,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.colorTextSecondary,
  },
  button: {
    backgroundColor: tokens.colorPrimary,
    paddingVertical: 16,
    borderRadius: tokens.radiusMd,
    alignItems: "center",
    marginTop: tokens.space8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
