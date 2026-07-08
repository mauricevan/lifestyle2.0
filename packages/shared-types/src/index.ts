/**
 * @rpm/shared-types — Core domain types and default configuration for RPM.
 */

export type EpBudgetStatus = "vol" | "onderhoud" | "voorlopig";

export type SensorStatus = "connected" | "degraded" | "disconnected";

export type ForestClassification = "STOP" | "CONTINUE";

export interface RpmConfig {
  baselineElevatedThreshold: number;
  hyperfocusThreshold: number;
  stepThresholdPerMin: number;
  baseBurnRate: number;
  hyperfocusMinDurationMs: number;
  morningWindowMs: number;
  fullBudget: number;
  maintenanceBudget: number;
  gaugeMaxRpm: number;
}

export const DEFAULT_RPM_CONFIG: RpmConfig = {
  baselineElevatedThreshold: 8,
  hyperfocusThreshold: 20,
  stepThresholdPerMin: 10,
  baseBurnRate: 15,
  hyperfocusMinDurationMs: 20 * 60 * 1000,
  morningWindowMs: 5 * 60 * 1000,
  fullBudget: 100,
  maintenanceBudget: 50,
  gaugeMaxRpm: 8000,
};

export interface HeartRateSample {
  bpm: number;
  timestamp: Date;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface SleepWindow {
  start: Date;
  end: Date;
  source: string;
}

export interface WearableSample {
  heartRate?: HeartRateSample;
  steps?: number;
  hrvRmssd?: number;
}

export interface Baseline {
  value: number;
  hrvFloor?: number;
  rollingAverage: number;
  deviation: number;
  computedAt: Date;
  isProvisional: boolean;
}

export interface EpBudget {
  amount: number;
  status: EpBudgetStatus;
}

export interface EpState {
  date: string;
  budget: number;
  spent: number;
  remaining: number;
  status: EpBudgetStatus;
  burnRatePerHour: number;
  isHyperfocusActive: boolean;
  sensorStatus: SensorStatus;
  lastUpdatedAt: Date;
}

export interface HyperfocusSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  maxHrDelta: number;
  epInflated: number;
}

export interface PermissionResult {
  granted: boolean;
  missingPermissions: string[];
}

export type Unsubscribe = () => void;

export interface WorkoutWindow {
  start: Date;
  end: Date;
  activityType: string;
}
