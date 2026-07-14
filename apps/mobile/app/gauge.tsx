/**
 * Main gauge screen — one glance, one feeling.
 */

import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { RpmGauge } from "../src/components/RpmGauge";
import { EmergencyButton } from "../src/components/EmergencyButton";
import { systemMessages } from "../src/copy/systemMessages";
import { useRpmStore } from "../src/state/rpmStore";
import { tokens } from "../src/theme/tokens";

export default function GaugeScreen() {
  const epState = useRpmStore((s) => s.epState);
  const budget = epState?.budget ?? 100;
  const spent = epState?.spent ?? 0;
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const sensorStatus = epState?.sensorStatus ?? "connected";
  const currentHeartRate = useRpmStore((s) => s.currentHeartRate);
  const showBandButton =
    Platform.OS === "android" && sensorStatus === "disconnected";

  return (
    <View style={styles.container}>
      <Link href="/settings" asChild>
        <Pressable style={styles.systemButton} accessibilityLabel="Systeem">
          <Text style={styles.systemButtonText}>Systeem</Text>
        </Pressable>
      </Link>
      {showBandButton ? (
        <Pressable
          style={styles.bandButton}
          onPress={() => router.push("/onboarding/wearable")}
          accessibilityLabel={systemMessages.settingsRepairBand}
        >
          <Text style={styles.bandButtonText}>{systemMessages.settingsRepairBand}</Text>
        </Pressable>
      ) : null}
      <RpmGauge
        percentUsed={percentUsed}
        remaining={epState?.remaining ?? budget}
        isHyperfocusActive={epState?.isHyperfocusActive ?? false}
        sensorStatus={sensorStatus}
        currentHeartRate={currentHeartRate}
      />
      <EmergencyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colorBg,
    justifyContent: "center",
  },
  systemButton: {
    position: "absolute",
    top: 56,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  systemButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colorTextSecondary,
  },
  bandButton: {
    position: "absolute",
    top: 56,
    right: 20,
    backgroundColor: tokens.colorPrimary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: tokens.radiusMd,
    zIndex: 10,
  },
  bandButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
