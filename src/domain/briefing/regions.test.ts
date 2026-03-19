import { describe, it, expect } from "vitest";
import {
  BRIEFING_REGIONS,
  DEFAULT_REGION,
  getRegionLabel,
  isValidRegion,
} from "@/domain/briefing/regions";

describe("BRIEFING_REGIONS", () => {
  it("contains exactly 5 regions", () => {
    expect(BRIEFING_REGIONS).toHaveLength(5);
  });

  it("includes all expected region ids", () => {
    const ids = BRIEFING_REGIONS.map((r) => r.id);
    expect(ids).toContain("africa");
    expect(ids).toContain("se-asia");
    expect(ids).toContain("europe");
    expect(ids).toContain("latam");
    expect(ids).toContain("middle-east");
  });

  it("each region has a non-empty label", () => {
    for (const r of BRIEFING_REGIONS) {
      expect(r.label.trim()).not.toBe("");
    }
  });
});

describe("DEFAULT_REGION", () => {
  it('defaults to "africa"', () => {
    expect(DEFAULT_REGION).toBe("africa");
  });

  it("is a valid region", () => {
    expect(isValidRegion(DEFAULT_REGION)).toBe(true);
  });
});

describe("getRegionLabel", () => {
  it("returns correct label for each region", () => {
    expect(getRegionLabel("africa")).toBe("Africa");
    expect(getRegionLabel("se-asia")).toBe("SE Asia");
    expect(getRegionLabel("europe")).toBe("Europe");
    expect(getRegionLabel("latam")).toBe("LATAM");
    expect(getRegionLabel("middle-east")).toBe("Middle East");
  });
});

describe("isValidRegion", () => {
  it("returns true for all valid region ids", () => {
    for (const r of BRIEFING_REGIONS) {
      expect(isValidRegion(r.id)).toBe(true);
    }
  });

  it("returns false for unknown strings", () => {
    expect(isValidRegion("unknown")).toBe(false);
    expect(isValidRegion("")).toBe(false);
    expect(isValidRegion("Asia")).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isValidRegion(null)).toBe(false);
    expect(isValidRegion(undefined)).toBe(false);
    expect(isValidRegion(42)).toBe(false);
  });
});
