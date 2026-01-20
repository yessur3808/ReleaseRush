import type { Game } from "../../lib/types";

export type StatusFilter = "all" | Game["release"]["status"];
export type SortKey = "az" | "soonest" | "latest" | "daily_first";

export const releaseSortValue = (g: Game, nowMs: number) => {
  switch (g.release.status) {
    case "announced_date": {
      const iso = g.release.dateISO; // YYYY-MM-DD
      const [y, mo, d] = iso.split("-").map(Number);
      const day = Number.isFinite(d) ? d : 1;
      const month = Number.isFinite(mo) ? mo : 1;
      return new Date(y, month - 1, day, 0, 0, 0, 0).getTime();
    }

    case "recurring_daily": {
      const [hh, mm] = g.release.timeUTC.split(":").map(Number);
      const now = new Date(nowMs);
      const targetToday = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hh,
        mm,
        0,
        0
      );
      return targetToday > nowMs
        ? targetToday
        : targetToday + 24 * 60 * 60 * 1000;
    }

    case "tba":
      return Number.POSITIVE_INFINITY;
  }
};
