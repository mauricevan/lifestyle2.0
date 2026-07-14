/**
 * BLE device scanner UI for onboarding and settings.
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { systemMessages } from "../copy/systemMessages";
import {
  connectToBleDevice,
  reconnectPairedDevice,
  scanForHeartRateDevices,
  waitForFirstSample,
  type ScannedBleDevice,
} from "../services/wearable/ble/bleHeartRateClient";
import { requestBlePermissions } from "../services/wearable/ble/blePermissions";
import {
  getPairedBleDevice,
  savePairedBleDevice,
  type PairedBleDevice,
} from "../services/wearable/ble/bleDeviceStore";
import { tokens } from "../theme/tokens";

interface BlePairingPanelProps {
  onPaired: () => void;
}

export function BlePairingPanel({ onPaired }: BlePairingPanelProps) {
  const [devices, setDevices] = useState<ScannedBleDevice[]>([]);
  const [pairedDevice, setPairedDevice] = useState<PairedBleDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    setError(null);
    setIsScanning(true);
    const granted = await requestBlePermissions();
    if (!granted) {
      setError(systemMessages.blePermissionDenied);
      setIsScanning(false);
      return;
    }
    const found = await scanForHeartRateDevices(15_000);
    setDevices(found);
    setIsScanning(false);
    if (found.length === 0) {
      setError(systemMessages.bleNoDevices);
    }
  };

  useEffect(() => {
    void getPairedBleDevice().then(setPairedDevice);
    void startScan();
  }, []);

  const finishConnect = async (device: ScannedBleDevice) => {
    await connectToBleDevice(device.id);
    await savePairedBleDevice({ id: device.id, name: device.name });
    const gotSample = await waitForFirstSample(15_000);
    if (!gotSample) {
      setError(systemMessages.bleNoSignal);
      setIsConnecting(false);
      return;
    }
    onPaired();
  };

  const connect = async (device: ScannedBleDevice) => {
    setIsConnecting(true);
    setError(null);
    try {
      await finishConnect(device);
    } catch {
      setError(systemMessages.bleConnectFailed);
      setIsConnecting(false);
    }
  };

  const reconnect = async () => {
    if (!pairedDevice) {
      return;
    }
    setIsConnecting(true);
    setError(null);
    const gotSample = await reconnectPairedDevice();
    if (!gotSample) {
      setError(systemMessages.bleNoSignal);
      setIsConnecting(false);
      return;
    }
    onPaired();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{systemMessages.bleCloseWahoo}</Text>
      {pairedDevice ? (
        <Pressable
          style={styles.reconnectRow}
          onPress={() => void reconnect()}
          disabled={isConnecting}
        >
          <Text style={styles.reconnectTitle}>
            {systemMessages.bleReconnectPaired(pairedDevice.name)}
          </Text>
          <Text style={styles.reconnectMeta}>{systemMessages.bleReconnectHint}</Text>
        </Pressable>
      ) : null}
      {isScanning ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colorPrimary} />
          <Text style={styles.status}>{systemMessages.bleScanning}</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.deviceRow}
              onPress={() => void connect(item)}
              disabled={isConnecting}
            >
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceMeta}>
                {item.rssi !== null ? `${item.rssi} dBm` : systemMessages.bleTapToConnect}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            error ? <Text style={styles.error}>{error}</Text> : null
          }
        />
      )}
      {!isScanning ? (
        <Pressable style={styles.secondaryButton} onPress={() => void startScan()}>
          <Text style={styles.secondaryText}>{systemMessages.bleScanAgain}</Text>
        </Pressable>
      ) : null}
      {isConnecting ? (
        <Text style={styles.status}>{systemMessages.bleConnecting}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: tokens.space6,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: tokens.colorWarning,
    marginBottom: tokens.space4,
  },
  reconnectRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: tokens.space4,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorSurface,
    borderWidth: 1,
    borderColor: tokens.colorPrimary,
  },
  reconnectTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: tokens.colorPrimary,
  },
  reconnectMeta: {
    fontSize: 13,
    color: tokens.colorTextSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  center: {
    alignItems: "center",
    paddingVertical: tokens.space8,
  },
  status: {
    marginTop: tokens.space4,
    fontSize: 14,
    color: tokens.colorTextSecondary,
    textAlign: "center",
  },
  deviceRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colorBorder,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colorTextPrimary,
  },
  deviceMeta: {
    fontSize: 13,
    color: tokens.colorTextSecondary,
    marginTop: 4,
  },
  error: {
    fontSize: 14,
    color: tokens.colorError,
    lineHeight: 20,
    marginTop: tokens.space4,
  },
  secondaryButton: {
    marginTop: tokens.space6,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 15,
    color: tokens.colorPrimary,
    fontWeight: "600",
  },
});
