import { detectHyperfocus } from "./detectHyperfocus";

describe("detectHyperfocus", () => {
  const baseline = 65;
  const config = {
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

  it("detects sustained hyperfocus after 20 minutes", () => {
    const start = new Date("2026-01-01T10:00:00Z");
    const samples = Array.from({ length: 21 }, (_, index) => ({
      timestamp: new Date(start.getTime() + index * 60 * 1000),
      hrBpm: 90,
      stepsPerMinute: 0,
    }));

    const result = detectHyperfocus(samples, baseline, false, config);
    expect(result.isActive).toBe(true);
    expect(result.hrDelta).toBe(25);
  });

  it("ignores short HR spikes", () => {
    const start = new Date("2026-01-01T10:00:00Z");
    const samples = Array.from({ length: 5 }, (_, index) => ({
      timestamp: new Date(start.getTime() + index * 60 * 1000),
      hrBpm: 95,
      stepsPerMinute: 0,
    }));

    expect(detectHyperfocus(samples, baseline, false, config).isActive).toBe(false);
  });

  it("ignores hyperfocus during workout", () => {
    const start = new Date("2026-01-01T10:00:00Z");
    const samples = Array.from({ length: 25 }, (_, index) => ({
      timestamp: new Date(start.getTime() + index * 60 * 1000),
      hrBpm: 95,
      stepsPerMinute: 0,
    }));

    expect(detectHyperfocus(samples, baseline, true, config).isActive).toBe(false);
  });
});
