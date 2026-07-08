/**
 * Always-visible emergency button.
 */

import { Linking, Pressable, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { systemMessages } from "../copy/systemMessages";
import { tokens } from "../theme/tokens";

const EMERGENCY_KEY = "emergency_contact_url";

export async function getEmergencyContactUrl(): Promise<string | null> {
  return AsyncStorage.getItem(EMERGENCY_KEY);
}

export async function setEmergencyContactUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(EMERGENCY_KEY, url);
}

export function EmergencyButton() {
  const handlePress = async () => {
    const url = await getEmergencyContactUrl();
    Alert.alert(systemMessages.emergencyButton, systemMessages.emergencyPrompt, [
      {
        text: "112",
        onPress: () => void Linking.openURL("tel:112"),
      },
      ...(url
        ? [{ text: "Hulpcontact", onPress: () => void Linking.openURL(url) }]
        : []),
      { text: "Sluiten", style: "cancel" as const },
    ]);
  };

  return (
    <Pressable style={styles.button} onPress={() => void handlePress()} accessibilityRole="button">
      <Text style={styles.label}>{systemMessages.emergencyButton}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    opacity: 0.7,
  },
  label: {
    color: tokens.colorTextSecondary,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
