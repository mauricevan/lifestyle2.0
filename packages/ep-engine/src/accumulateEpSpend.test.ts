import { accumulateEpSpend, epToGaugeRpm, getGaugeZone } from "./accumulateEpSpend";

describe("accumulateEpSpend", () => {
  it("accumulates spend based on burn rate and elapsed time", () => {
    const result = accumulateEpSpend({
      spent: 10,
      budget: 100,
      burnRatePerHour: 30,
      elapsedMs: 60 * 60 * 1000,
    });
    expect(result.spent).toBe(40);
    expect(result.remaining).toBe(60);
    expect(result.percentUsed).toBe(40);
  });

  it("does not exceed budget", () => {
    const result = accumulateEpSpend({
      spent: 90,
      budget: 100,
      burnRatePerHour: 40,
      elapsedMs: 60 * 60 * 1000,
    });
    expect(result.spent).toBe(100);
    expect(result.remaining).toBe(0);
  });
});

describe("gauge helpers", () => {
  it("maps percent to RPM", () => {
    expect(epToGaugeRpm(50)).toBe(4000);
  });

  it("returns orange zone during hyperfocus", () => {
    expect(getGaugeZone(30, true)).toBe("orange");
  });
});
