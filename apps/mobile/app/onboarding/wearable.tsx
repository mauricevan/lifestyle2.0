/**
 * Onboarding step 2 — wearable permissions.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { systemMessages } from "../../src/copy/systemMessages";
import { setOnboardingFlag } from "../../src/services/sync/localStore";
import { getWearableProvider } from "../../src/services/wearable/wearableFactory";
import { tokens } from "../../src/theme/tokens";

export default function WearableScreen() {
  const connect = async () => {
    const provider = getWearableProvider();
    const available = await provider.isAvailable();
    if (!available) {
      router.push("/onboarding/done");
      return;
    }
    await provider.requestPermissions();
    await setOnboardingFlag("wearable_connected", "true");
    router.push("/onboarding/done");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{systemMessages.onboardingWearableTitle}</Text>
      <Text style={styles.body}>{systemMessages.onboardingWearableBody}</Text>
      <Pressable style={styles.button} onPress={() => void connect()}>
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
    justifyContent: "center",
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
    marginBottom: tokens.space8,
  },
  button: {
    backgroundColor: tokens.colorPrimary,
    paddingVertical: 16,
    borderRadius: tokens.radiusMd,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
