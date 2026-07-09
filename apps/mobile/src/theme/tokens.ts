/**
 * Design tokens for RPM mobile UI.
 */

export const tokens = {
  colorPrimary: "#16a34a",
  colorAccent: "#d97706",
  colorBg: "#0f0f0f",
  colorSurface: "#1a1a1a",
  colorBorder: "#2a2a2a",
  colorTextPrimary: "#f5f5f5",
  colorTextSecondary: "#a3a3a3",
  colorSuccess: "#16a34a",
  colorWarning: "#d97706",
  colorError: "#dc2626",
  colorOrange: "#ea580c",
  gaugeGreen: "#16a34a",
  gaugeYellow: "#ca8a04",
  gaugeRed: "#dc2626",
  gaugeOrange: "#ea580c",
  space4: 16,
  space6: 24,
  space8: 32,
  radiusMd: 8,
  fontBody: "System",
} as const;

export const gaugeZoneColors = {
  green: tokens.gaugeGreen,
  yellow: tokens.gaugeYellow,
  red: tokens.gaugeRed,
  orange: tokens.gaugeOrange,
} as const;
