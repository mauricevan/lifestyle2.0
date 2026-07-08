/**
 * Onboarding step 3 — system active.
 */

import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { systemMessages } from "../../src/copy/systemMessages";
import { runMorningBaseline } from "../../src/features/baseline/morningBaselineService";
import { ensureAnonymousSession } from "../../src/services/supabase/client";
import { useRpmStore } from "../../src/state/rpmStore";
import { tokens } from "../../src/theme/tokens";

export default function DoneScreen() {
  const [isFinishing, setIsFinishing] = useState(false);
  const setOnboardingComplete = useRpmStore((s) => s.setOnboardingComplete);
  const initEpState = useRpmStore((s) => s.initEpState);
  const setUserId = useRpmStore((s) => s.setUserId);

  const finish = async () => {
    if (isFinishing) {
      return;
    }
    setIsFinishing(true);
    try {
      const userId = await ensureAnonymousSession();
      setUserId(userId);
      const baseline = await runMorningBaseline(userId);
      initEpState(baseline.budget, baseline.status);
      setOnboardingComplete(true);
      router.replace("/gauge");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{systemMessages.onboardingDoneTitle}</Text>
      <Text style={styles.body}>{systemMessages.onboardingDoneBody}</Text>
      <Pressable
        style={[styles.button, isFinishing && styles.buttonDisabled]}
        onPress={() => void finish()}
        disabled={isFinishing}
        accessibilityState={{ disabled: isFinishing, busy: isFinishing }}
      >
        {isFinishing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{systemMessages.onboardingGoToGauge}</Text>
        )}
      </Pressable>
      {isFinishing ? (
        <Text style={styles.hint}>{systemMessages.onboardingFinishing}</Text>
      ) : null}
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
    minHeight: 52,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    marginTop: tokens.space4,
    fontSize: 14,
    color: tokens.colorTextSecondary,
    textAlign: "center",
  },
});
