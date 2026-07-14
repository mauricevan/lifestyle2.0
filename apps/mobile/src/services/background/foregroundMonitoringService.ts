/**
 * Android ongoing notification while RPM monitors heart rate.
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { systemMessages } from "../../copy/systemMessages";

const MONITORING_CHANNEL_ID = "rpm-monitoring";
const MONITORING_NOTIFICATION_ID = "rpm-monitoring-active";

export async function startForegroundMonitoringNotification(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(MONITORING_CHANNEL_ID, {
    name: "RPM monitoring",
    importance: Notifications.AndroidImportance.LOW,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  await Notifications.scheduleNotificationAsync({
    identifier: MONITORING_NOTIFICATION_ID,
    content: {
      title: systemMessages.foregroundNotificationTitle,
      body: systemMessages.foregroundNotificationBody,
      sticky: true,
      priority: Notifications.AndroidNotificationPriority.LOW,
      data: { type: "foreground_monitoring" },
    },
    trigger: null,
  });
}

export async function stopForegroundMonitoringNotification(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.dismissNotificationAsync(MONITORING_NOTIFICATION_ID);
}
