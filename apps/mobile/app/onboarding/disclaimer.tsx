/**
 * Onboarding step 1 — medical disclaimer.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { systemMessages } from "../../src/copy/systemMessages";
import { setOnboardingFlag } from "../../src/services/sync/localStore";
import { tokens } from "../../src/theme/tokens";

export default function DisclaimerScreen() {
  const accept = async () => {
    await setOnboardingFlag("disclaimer_accepted", "true");
    router.push("/onboarding/wearable");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{systemMessages.disclaimerTitle}</Text>
      <Text style={styles.body}>{systemMessages.disclaimerBody}</Text>
      <Pressable style={styles.button} onPress={() => void accept()}>
        <Text style={styles.buttonText}>{systemMessages.disclaimerAccept}</Text>
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
