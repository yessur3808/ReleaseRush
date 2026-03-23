import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { clamp0, splitMs, pad2, formatDateISO, formatISODateTime } from "../utils/time";

describe("clamp0", () => {
  it("returns the value when positive", () => {
    expect(clamp0(5000)).toBe(5000);
  });

  it("returns 0 when negative", () => {
    expect(clamp0(-100)).toBe(0);
  });

  it("returns 0 when zero", () => {
    expect(clamp0(0)).toBe(0);
  });
});

describe("splitMs", () => {
  it("splits exactly 1 day into d=1, h=0, m=0, s=0", () => {
    const ms = 24 * 60 * 60 * 1000;
    expect(splitMs(ms)).toEqual({ d: 1, h: 0, m: 0, s: 0 });
  });

  it("splits 0ms into all zeros", () => {
    expect(splitMs(0)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
  });

  it("splits 90 seconds correctly", () => {
    expect(splitMs(90_000)).toEqual({ d: 0, h: 0, m: 1, s: 30 });
  });

  it("splits 1 hour 30 minutes correctly", () => {
    const ms = (1 * 3600 + 30 * 60) * 1000;
    expect(splitMs(ms)).toEqual({ d: 0, h: 1, m: 30, s: 0 });
  });

  it("clamps negative ms to 0", () => {
    expect(splitMs(-5000)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
  });
});

describe("pad2", () => {
  it("pads single digit with leading zero", () => {
    expect(pad2(5)).toBe("05");
  });

  it("does not pad two-digit numbers", () => {
    expect(pad2(15)).toBe("15");
  });

  it("pads zero", () => {
    expect(pad2(0)).toBe("00");
  });
});

describe("formatDateISO", () => {
  it("formats a valid ISO date string", () => {
    expect(formatDateISO("2026-03-27")).toBe("Mar 27, 2026 (UTC)");
  });

  it("returns the original string for invalid input", () => {
    expect(formatDateISO("not-a-date")).toBe("not-a-date");
  });

  it("formats January correctly", () => {
    expect(formatDateISO("2025-01-01")).toBe("Jan 1, 2025 (UTC)");
  });
});

describe("formatISODateTime", () => {
  it("formats a valid ISO datetime string", () => {
    expect(formatISODateTime("2026-01-20T00:00:00Z")).toBe("Jan 20, 2026, 00:00 UTC");
  });

  it("returns original string for invalid datetime", () => {
    expect(formatISODateTime("not-valid")).toBe("not-valid");
  });
});

describe("msUntilNextUtcTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it("returns a positive number of milliseconds", async () => {
    // Set a fixed time: 2026-01-01 10:00:00 UTC
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const { msUntilNextUtcTime } = await import("../utils/time");
    const ms = msUntilNextUtcTime("15:00");
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it("wraps around to next day when target has already passed", async () => {
    // Set time to 20:00 UTC, target is 10:00 (already passed today)
    vi.setSystemTime(new Date("2026-01-01T20:00:00Z"));
    const { msUntilNextUtcTime } = await import("../utils/time");
    const ms = msUntilNextUtcTime("10:00");
    // Should be ~14 hours until next day's 10:00
    expect(ms).toBeGreaterThan(13 * 60 * 60 * 1000);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});
