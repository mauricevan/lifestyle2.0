/**
 * Main gauge screen — one glance, one feeling.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { RpmGauge } from "../src/components/RpmGauge";
import { EmergencyButton } from "../src/components/EmergencyButton";
import { useRpmStore } from "../src/state/rpmStore";
import { tokens } from "../src/theme/tokens";

export default function GaugeScreen() {
  const epState = useRpmStore((s) => s.epState);
  const budget = epState?.budget ?? 100;
  const spent = epState?.spent ?? 0;
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <View style={styles.container}>
      <Link href="/settings" asChild>
        <Pressable style={styles.settings} accessibilityLabel="Instellingen">
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </Link>
      <RpmGauge
        percentUsed={percentUsed}
        remaining={epState?.remaining ?? budget}
        isHyperfocusActive={epState?.isHyperfocusActive ?? false}
        sensorStatus={epState?.sensorStatus ?? "connected"}
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
  settings: {
    position: "absolute",
    top: 56,
    right: 20,
    padding: 8,
    opacity: 0.5,
  },
  settingsIcon: {
    fontSize: 20,
    color: tokens.colorTextSecondary,
  },
});
