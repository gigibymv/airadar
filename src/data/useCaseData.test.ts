import { describe, it, expect } from "vitest";
import {
  normalizeUseCaseType,
  normalizeUseCaseCategory,
  isPersonUseCase,
  isCompanyUseCase,
} from "@/data/useCaseData";

describe("normalizeUseCaseType", () => {
  it('returns "person" for "person"', () => {
    expect(normalizeUseCaseType("person")).toBe("person");
  });

  it('returns "company" for "company"', () => {
    expect(normalizeUseCaseType("company")).toBe("company");
  });

  it('returns "company" for aliases: organization, org, enterprise, business, team', () => {
    expect(normalizeUseCaseType("organization")).toBe("company");
    expect(normalizeUseCaseType("org")).toBe("company");
    expect(normalizeUseCaseType("enterprise")).toBe("company");
    expect(normalizeUseCaseType("business")).toBe("company");
    expect(normalizeUseCaseType("team")).toBe("company");
  });

  it("is case-insensitive", () => {
    expect(normalizeUseCaseType("COMPANY")).toBe("company");
    expect(normalizeUseCaseType("Organization")).toBe("company");
    expect(normalizeUseCaseType("PERSON")).toBe("person");
  });

  it('defaults to "person" for unknown strings', () => {
    expect(normalizeUseCaseType("unknown")).toBe("person");
    expect(normalizeUseCaseType("individual")).toBe("person");
  });

  it('defaults to "person" for non-string values', () => {
    expect(normalizeUseCaseType(null)).toBe("person");
    expect(normalizeUseCaseType(undefined)).toBe("person");
    expect(normalizeUseCaseType(42)).toBe("person");
  });

  it('defaults to "person" for empty string', () => {
    expect(normalizeUseCaseType("")).toBe("person");
    expect(normalizeUseCaseType("   ")).toBe("person");
  });
});

describe("normalizeUseCaseCategory", () => {
  it("returns known categories unchanged", () => {
    expect(normalizeUseCaseCategory("productivity")).toBe("productivity");
    expect(normalizeUseCaseCategory("healthcare")).toBe("healthcare");
    expect(normalizeUseCaseCategory("finance")).toBe("finance");
    expect(normalizeUseCaseCategory("marketing")).toBe("marketing");
    expect(normalizeUseCaseCategory("operations")).toBe("operations");
    expect(normalizeUseCaseCategory("engineering")).toBe("engineering");
    expect(normalizeUseCaseCategory("education")).toBe("education");
    expect(normalizeUseCaseCategory("legal")).toBe("legal");
    expect(normalizeUseCaseCategory("hr")).toBe("hr");
    expect(normalizeUseCaseCategory("other")).toBe("other");
  });

  it("normalizes aliases", () => {
    expect(normalizeUseCaseCategory("health-care")).toBe("healthcare");
    expect(normalizeUseCaseCategory("financial")).toBe("finance");
    expect(normalizeUseCaseCategory("growth")).toBe("marketing");
    expect(normalizeUseCaseCategory("support")).toBe("customer-support");
    expect(normalizeUseCaseCategory("customer-service")).toBe("customer-support");
    expect(normalizeUseCaseCategory("ops")).toBe("operations");
    expect(normalizeUseCaseCategory("software-engineering")).toBe("engineering");
    expect(normalizeUseCaseCategory("edtech")).toBe("education");
    expect(normalizeUseCaseCategory("compliance")).toBe("legal");
    expect(normalizeUseCaseCategory("human-resources")).toBe("hr");
    expect(normalizeUseCaseCategory("recruiting")).toBe("hr");
  });

  it("normalizes underscores and spaces to hyphens before matching", () => {
    expect(normalizeUseCaseCategory("customer_support")).toBe("customer-support");
    expect(normalizeUseCaseCategory("customer support")).toBe("customer-support");
  });

  it("is case-insensitive", () => {
    expect(normalizeUseCaseCategory("Healthcare")).toBe("healthcare");
    expect(normalizeUseCaseCategory("FINANCE")).toBe("finance");
  });

  it('defaults to "productivity" for unknown values', () => {
    expect(normalizeUseCaseCategory("unknown")).toBe("productivity");
    expect(normalizeUseCaseCategory("")).toBe("productivity");
    expect(normalizeUseCaseCategory(null)).toBe("productivity");
    expect(normalizeUseCaseCategory(undefined)).toBe("productivity");
  });
});

describe("isPersonUseCase", () => {
  it('returns true for "person"', () => {
    expect(isPersonUseCase("person")).toBe(true);
  });

  it('returns false for "company"', () => {
    expect(isPersonUseCase("company")).toBe(false);
  });
});

describe("isCompanyUseCase", () => {
  it('returns true for "company"', () => {
    expect(isCompanyUseCase("company")).toBe(true);
  });

  it('returns false for "person"', () => {
    expect(isCompanyUseCase("person")).toBe(false);
  });
});
