/**
 * Analog RPM gauge component.
 */

import Svg, { Circle, Line, Path } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { epToGaugeRpm, getGaugeZone } from "@rpm/ep-engine";
import { DEFAULT_RPM_CONFIG } from "@rpm/shared-types";
import { gaugeZoneColors, tokens } from "../theme/tokens";
import { systemMessages } from "../copy/systemMessages";

interface RpmGaugeProps {
  percentUsed: number;
  remaining: number;
  isHyperfocusActive: boolean;
  sensorStatus: "connected" | "degraded" | "disconnected";
  currentHeartRate: number | null;
}

function needlePath(angleDeg: number, size: number): string {
  const center = size / 2;
  const radius = size * 0.38;
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const x = center + radius * Math.cos(angleRad);
  const y = center + radius * Math.sin(angleRad);
  return `M ${center} ${center} L ${x} ${y}`;
}

export function RpmGauge({
  percentUsed,
  remaining,
  isHyperfocusActive,
  sensorStatus,
  currentHeartRate,
}: RpmGaugeProps) {
  const rpm = epToGaugeRpm(percentUsed, DEFAULT_RPM_CONFIG.gaugeMaxRpm);
  const zone = getGaugeZone(percentUsed, isHyperfocusActive);
  const color = gaugeZoneColors[zone];
  const angle = (rpm / DEFAULT_RPM_CONFIG.gaugeMaxRpm) * 270 - 135;
  const size = 280;

  const statusLine =
    sensorStatus === "disconnected"
      ? systemMessages.sensorDisconnected
      : sensorStatus === "degraded"
        ? systemMessages.sensorDegraded
        : systemMessages.gaugeStatus(remaining);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.42}
          stroke={tokens.colorSurface}
          strokeWidth={12}
          fill="none"
        />
        <Path
          d={needlePath(angle, size)}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2}
          y2={size / 2}
          stroke={color}
          strokeWidth={8}
        />
      </Svg>
      <Text style={styles.rpm}>{rpm}</Text>
      <Text style={styles.rpmLabel}>RPM</Text>
      {currentHeartRate !== null && sensorStatus !== "disconnected" ? (
        <Text style={styles.heartRate}>
          {systemMessages.heartRateLive(currentHeartRate)}
        </Text>
      ) : null}
      <Text style={[styles.status, { color }]}>{statusLine}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.space8,
  },
  rpm: {
    fontSize: 48,
    fontWeight: "700",
    color: tokens.colorTextPrimary,
    marginTop: -tokens.space6,
  },
  rpmLabel: {
    fontSize: 14,
    color: tokens.colorTextSecondary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heartRate: {
    marginTop: tokens.space4,
    fontSize: 18,
    fontWeight: "600",
    color: tokens.colorSuccess,
  },
  status: {
    marginTop: tokens.space4,
    fontSize: 16,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 24,
  },
});
