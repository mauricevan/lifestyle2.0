/**
 * @rpm/wearable-adapter — Platform-agnostic wearable data interface.
 */

export type {
  HeartRateSample,
  PermissionResult,
  SensorStatus,
  SleepWindow,
  TimeWindow,
  Unsubscribe,
  WorkoutWindow,
} from "@rpm/shared-types";

export interface WearableProvider {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<import("@rpm/shared-types").PermissionResult>;
  subscribeHeartRate(
    callback: (sample: import("@rpm/shared-types").HeartRateSample) => void
  ): import("@rpm/shared-types").Unsubscribe;
  getMorningWindowSamples(wakeTime: Date): Promise<
    import("@rpm/shared-types").HeartRateSample[]
  >;
  getStepCount(window: import("@rpm/shared-types").TimeWindow): Promise<number>;
  getSleepAnalysis(date: Date): Promise<
    import("@rpm/shared-types").SleepWindow | null
  >;
  getActiveWorkouts(window: import("@rpm/shared-types").TimeWindow): Promise<
    import("@rpm/shared-types").WorkoutWindow[]
  >;
  getHrvRmssd?(window: import("@rpm/shared-types").TimeWindow): Promise<number | null>;
  getConnectionStatus(): import("@rpm/shared-types").SensorStatus;
}

export interface WearableProviderFactory {
  createProvider(): WearableProvider;
}

export {
  parseHeartRateMeasurement,
  decodeBase64ToBytes,
} from "./parseHeartRateMeasurement";
