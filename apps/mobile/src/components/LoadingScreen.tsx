/**
 * Full-screen loading state — bootstrap and async actions.
 */

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { tokens } from "../theme/tokens";

interface LoadingScreenProps {
  message: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={tokens.colorPrimary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colorBg,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.space8,
  },
  message: {
    marginTop: tokens.space6,
    fontSize: 16,
    lineHeight: 24,
    color: tokens.colorTextSecondary,
    textAlign: "center",
    maxWidth: 320,
  },
});
