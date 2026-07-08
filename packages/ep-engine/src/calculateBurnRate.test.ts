import { calculateBurnRate } from "./calculateBurnRate";

describe("calculateBurnRate", () => {
  const baseline = 65;

  it("returns base rate during normal activity", () => {
    expect(
      calculateBurnRate({ currentHr: 75, baselineHr: baseline, stepsPerMinute: 80 })
    ).toBe(15);
  });

  it("inflates rate during sedentary hyperfocus", () => {
    expect(
      calculateBurnRate({ currentHr: 90, baselineHr: baseline, stepsPerMinute: 2 })
    ).toBe(20);
  });

  it("caps inflation at 40 EP per hour", () => {
    expect(
      calculateBurnRate({ currentHr: 110, baselineHr: baseline, stepsPerMinute: 0 })
    ).toBe(40);
  });

  it("ignores hyperfocus during workout", () => {
    expect(
      calculateBurnRate({
        currentHr: 110,
        baselineHr: baseline,
        stepsPerMinute: 0,
        isWorkoutActive: true,
      })
    ).toBe(15);
  });
});
