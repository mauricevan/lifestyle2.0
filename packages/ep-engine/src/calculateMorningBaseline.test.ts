import { calculateMorningBaseline, mean } from "./calculateMorningBaseline";

describe("calculateMorningBaseline", () => {
  it("returns full budget when deviation is within threshold", () => {
    const result = calculateMorningBaseline({
      morningHrSamples: [68, 70, 69],
      last14DaysRollingAvg: [65, 66, 67, 68],
    });
    expect(result).toEqual({ amount: 100, status: "vol" });
  });

  it("returns maintenance budget when morning HR is elevated", () => {
    const result = calculateMorningBaseline({
      morningHrSamples: [85, 86, 84],
      last14DaysRollingAvg: [65, 66, 67, 68],
    });
    expect(result).toEqual({ amount: 50, status: "onderhoud" });
  });

  it("returns provisional status without rolling history", () => {
    const result = calculateMorningBaseline({
      morningHrSamples: [70, 72],
      last14DaysRollingAvg: [],
    });
    expect(result).toEqual({ amount: 100, status: "voorlopig" });
  });
});

describe("mean", () => {
  it("returns zero for empty array", () => {
    expect(mean([])).toBe(0);
  });
});
