import { Game } from "../lib/types";

export const msUntilNextUtcTime = (hhmm: string) => {
  const [hh, mm] = hhmm.split(":").map((x) => Number(x));
  const now = new Date();
  const target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0, 0),
  );
  let diff = target.getTime() - now.getTime();
  if (diff <= 0) diff += 24 * 60 * 60 * 1000;
  return diff;
};

export const clamp0 = (ms: number) => {
  return Math.max(0, ms);
};

export const splitMs = (ms: number) => {
  const total = Math.floor(clamp0(ms) / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s };
};

export const pad2 = (n: number) => {
  return String(n).padStart(2, "0");
};

/**
 * Format a YYYY-MM-DD calendar date as a human-readable UTC string.
 * Example: "2026-03-27" → "Mar 27, 2026 (UTC)"
 *
 * The date is always interpreted as UTC midnight so the output is
 * consistent regardless of the viewer's local timezone.
 */
export const formatDateISO = (dateISO: string): string => {
  const [y, mo, d] = dateISO.split("-").map(Number);
  if (!y || !mo || !d) return dateISO;
  const date = new Date(Date.UTC(y, mo - 1, d));
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
  return `${label} (UTC)`;
};

/**
 * Format an ISO 8601 datetime string (with Z / offset) as a
 * human-readable UTC string.
 * Example: "2026-01-20T00:00:00Z" → "Jan 20, 2026, 00:00 UTC"
 */
export const formatISODateTime = (iso: string): string => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${label} UTC`;
};

export const releaseMetaLabel = (game: Game) => {
  switch (game.release.status) {
    case "tba":
      return "Release: TBA";
    case "announced_date":
      return `Release: ${formatDateISO(game.release.dateISO)}`;
    case "recurring_daily":
      return `Resets daily at ${game.release.timeUTC} UTC`;
  }
};

export const msLeftForGame = (game: Game, nowMs: number) => {
  switch (game.release.status) {
    case "tba":
      return null;

    case "announced_date": {
      // Use UTC midnight so the countdown is identical for every viewer
      // regardless of their local timezone.
      const [y, mo, d] = game.release.dateISO.split("-").map(Number);
      const target = Date.UTC(y, mo - 1, d, 0, 0, 0, 0);
      return target - nowMs;
    }

    case "recurring_daily":
      return msUntilNextUtcTime(game.release.timeUTC);
  }
};
