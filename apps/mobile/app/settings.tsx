/**
 * Settings — export/delete data skeleton, emergency contact.
 */

import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { systemMessages } from "../src/copy/systemMessages";
import {
  deleteUserData,
  exportUserData,
} from "../src/services/sync/supabaseSync";
import { clearAllLocalData } from "../src/services/sync/localStore";
import { useRpmStore } from "../src/state/rpmStore";
import { tokens } from "../src/theme/tokens";

export default function SettingsScreen() {
  const userId = useRpmStore((s) => s.userId);

  const handleExport = async () => {
    if (!userId) {
      return;
    }
    const data = await exportUserData(userId);
    await Share.share({ message: JSON.stringify(data, null, 2) });
  };

  const handleDelete = () => {
    Alert.alert(systemMessages.deleteData, systemMessages.deleteConfirm, [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Verwijderen",
        style: "destructive",
        onPress: () => {
          void (async () => {
            if (userId) {
              await deleteUserData(userId);
            }
            await clearAllLocalData();
            router.replace("/onboarding/disclaimer");
          })();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Terug</Text>
      </Pressable>
      <Text style={styles.title}>{systemMessages.settingsTitle}</Text>
      <Pressable style={styles.row} onPress={() => void handleExport()}>
        <Text style={styles.rowText}>{systemMessages.exportData}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={handleDelete}>
        <Text style={[styles.rowText, styles.destructive]}>{systemMessages.deleteData}</Text>
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
  back: {
    marginBottom: tokens.space6,
  },
  backText: {
    color: tokens.colorTextSecondary,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: tokens.colorTextPrimary,
    marginBottom: tokens.space8,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colorSurface,
  },
  rowText: {
    fontSize: 16,
    color: tokens.colorTextPrimary,
  },
  destructive: {
    color: tokens.colorError,
  },
});
