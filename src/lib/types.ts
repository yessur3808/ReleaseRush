export type ReleaseTBA = {
  status: "tba";
};

export type ReleaseAnnouncedDate = {
  status: "announced_date";
  dateISO: string; // YYYY-MM-DD
  datePrecision: "day" | "month" | "year";
};

export type ReleaseRecurringDaily = {
  status: "recurring_daily";
  timeUTC: string; // HH:MM (UTC)
};

export type GameRelease =
  | ReleaseTBA
  | ReleaseAnnouncedDate
  | ReleaseRecurringDaily;

export type ReleaseStatus = GameRelease["status"];

export type Game = {
  id: string;
  name: string;
  tags?: string[];
  coverUrl?: string;
  release: GameRelease;
};

export type GamesDoc = {
  generatedAt: string;
  games: Game[];
};

export type GameDoc = GamesDoc;
