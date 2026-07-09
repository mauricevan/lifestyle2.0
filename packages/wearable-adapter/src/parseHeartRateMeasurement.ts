/**
 * Parses BLE Heart Rate Measurement characteristic (Bluetooth SIG 0x2A37).
 */

export function parseHeartRateMeasurement(data: Uint8Array): number | null {
  if (data.length < 2) {
    return null;
  }
  const flags = data[0] ?? 0;
  const isUint16 = (flags & 0x01) !== 0;
  const offset = 1;
  const rawBpm = isUint16
    ? (data[offset] ?? 0) + ((data[offset + 1] ?? 0) << 8)
    : (data[offset] ?? 0);
  if (rawBpm < 30 || rawBpm > 250) {
    return null;
  }
  return rawBpm;
}

export function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
