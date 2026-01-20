import { Game } from "../lib/types";

export const msUntilNextUtcTime = (hhmm: string) => {
  const [hh, mm] = hhmm.split(":").map((x) => Number(x));
  const now = new Date();
  const target = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hh,
      mm,
      0,
      0
    )
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

export const releaseMetaLabel = (game: Game) => {
  switch (game.release.status) {
    case "tba":
      return "Release: TBA";
    case "announced_date":
      return `Release: ${game.release.dateISO}`;
    case "recurring_daily":
      return `Resets daily at ${game.release.timeUTC} UTC`;
  }
};

export const msLeftForGame = (game: Game, nowMs: number) => {
  switch (game.release.status) {
    case "tba":
      return null;

    case "announced_date": {
      // local midnight for “day precision”
      const [y, mo, d] = game.release.dateISO.split("-").map(Number);
      const target = new Date(y, mo - 1, d, 0, 0, 0, 0).getTime();
      return target - nowMs;
    }

    case "recurring_daily":
      return msUntilNextUtcTime(game.release.timeUTC);
  }
};
