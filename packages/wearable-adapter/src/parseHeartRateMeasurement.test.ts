import { parseHeartRateMeasurement } from "./parseHeartRateMeasurement";

describe("parseHeartRateMeasurement", () => {
  it("parses uint8 heart rate", () => {
    expect(parseHeartRateMeasurement(new Uint8Array([0x00, 72]))).toBe(72);
  });

  it("parses uint16 heart rate", () => {
    expect(parseHeartRateMeasurement(new Uint8Array([0x01, 0x2a, 0x00]))).toBe(42);
  });

  it("rejects invalid values", () => {
    expect(parseHeartRateMeasurement(new Uint8Array([0x00, 10]))).toBeNull();
    expect(parseHeartRateMeasurement(new Uint8Array([0x00]))).toBeNull();
  });
});
