import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "@/domain/content/time";

const NOW = new Date("2026-03-18T12:00:00Z");

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for times less than 1 minute ago', () => {
    const date = new Date(NOW.getTime() - 30_000); // 30s ago
    expect(formatRelativeTime(date.toISOString())).toBe("just now");
  });

  it('returns "just now" for the exact same time', () => {
    expect(formatRelativeTime(NOW.toISOString())).toBe("just now");
  });

  it("returns minutes ago for times < 1 hour", () => {
    const date = new Date(NOW.getTime() - 15 * 60_000); // 15 min ago
    expect(formatRelativeTime(date.toISOString())).toBe("15m ago");
  });

  it("returns 1m ago for exactly 1 minute ago", () => {
    const date = new Date(NOW.getTime() - 60_000);
    expect(formatRelativeTime(date.toISOString())).toBe("1m ago");
  });

  it("returns 59m ago for 59 minutes ago", () => {
    const date = new Date(NOW.getTime() - 59 * 60_000);
    expect(formatRelativeTime(date.toISOString())).toBe("59m ago");
  });

  it("returns hours ago for times < 24 hours", () => {
    const date = new Date(NOW.getTime() - 3 * 60 * 60_000); // 3h ago
    expect(formatRelativeTime(date.toISOString())).toBe("3h ago");
  });

  it("returns 1h ago for exactly 1 hour ago", () => {
    const date = new Date(NOW.getTime() - 60 * 60_000);
    expect(formatRelativeTime(date.toISOString())).toBe("1h ago");
  });

  it("returns 23h ago for 23 hours ago", () => {
    const date = new Date(NOW.getTime() - 23 * 60 * 60_000);
    expect(formatRelativeTime(date.toISOString())).toBe("23h ago");
  });

  it("returns days ago for times >= 24 hours", () => {
    const date = new Date(NOW.getTime() - 2 * 24 * 60 * 60_000); // 2 days ago
    expect(formatRelativeTime(date.toISOString())).toBe("2d ago");
  });

  it("returns 1d ago for exactly 24 hours ago", () => {
    const date = new Date(NOW.getTime() - 24 * 60 * 60_000);
    expect(formatRelativeTime(date.toISOString())).toBe("1d ago");
  });

  it("returns 7d ago for 1 week ago", () => {
    const date = new Date(NOW.getTime() - 7 * 24 * 60 * 60_000);
    expect(formatRelativeTime(date.toISOString())).toBe("7d ago");
  });
});
