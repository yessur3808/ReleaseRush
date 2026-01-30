/* =========================================================
   Updated types to support:
   - release classification (full game / DLC / season / etc.)
   - official vs rumor + sources
   - platforms per item
   - trailers (urls)
   - studio metadata
   - cover as URL or base64 (optional)
   - popularity sorting fields
   - deterministic "remove released items" support
   - (NEW) seasonWindow for live-service seasons/acts/resets:
     - current season start/end timestamps for "time left" calculations
   ========================================================= */

/* -------------------------
   Shared primitives
   ------------------------- */

export type ISODate = string; // e.g. "2026-03-27" (YYYY-MM-DD)
export type ISODateTime = string; // e.g. "2026-01-20T00:00:00Z" (UTC timestamp)

/**
 * Precision for a date or window.
 * - "day" is a full calendar date
 * - "month"/"quarter"/"year" are less precise windows
 * - "unknown" allows stable shape when you don't know precision yet
 */
export type DatePrecision = "day" | "month" | "quarter" | "year" | "unknown";

/** Confidence level for release or season timing assertions */
export type ReleaseConfidence = "confirmed" | "likely" | "rumor" | "unknown";

/** Optional: release geography granularity */
export type Region = "global" | "us" | "eu" | "jp" | "au" | "other";

/** When you need "as-of" time for filtering */
export type AsOf = ISODateTime;

/* -------------------------
   Platforms
   ------------------------- */

export type Platform =
  | "pc"
  | "ps5"
  | "ps4"
  | "xbox_series"
  | "xbox_one"
  | "switch"
  | "switch_2"
  | "ios"
  | "android"
  | "vr"
  | "other";

/* -------------------------
   Sources (official/rumor attribution)
   ------------------------- */

export type SourceType =
  | "official_website"
  | "publisher_site"
  | "developer_site"
  | "platform_store"
  | "press_release"
  | "twitter_x"
  | "youtube"
  | "discord"
  | "gaming_news"
  | "gaming_blog"
  | "forum"
  | "reddit"
  | "leak_aggregator"
  | "other";

export type SourceReliability = "high" | "medium" | "low" | "unknown";

export type Source = {
  /** What kind of source this is (store, press release, tweet, etc.) */
  type: SourceType;

  /** True if controlled by developer/publisher/platform owner */
  isOfficial: boolean;

  /** Human-readable name: "Rockstar Games", "Steam", "PlayStation Blog", "Reddit r/..." */
  name: string;

  /** Optional link to the source */
  url?: string;

  /** When you recorded/fetched it */
  retrievedAt?: ISODateTime;

  /** Short description of what this source claims */
  claim?: string;

  /** Optional social metadata */
  authorHandle?: string; // e.g. "@FortniteGame"
  excerpt?: string;
  reliability?: SourceReliability;
};

/* -------------------------
   Media (cover + trailers)
   ------------------------- */

export type ImageAsset =
  | {
      /** Remote image URL */
      kind: "url";
      url: string;
      mime?: string;
      width?: number;
      height?: number;
    }
  | {
      /** Embedded image payload (no `data:` prefix) */
      kind: "base64";
      mime: string; // required for base64
      data: string;
      width?: number;
      height?: number;
    };

export type TrailerPlatform =
  | "youtube"
  | "twitter_x"
  | "twitch"
  | "official_site"
  | "other";

export type TrailerLink = {
  /** Destination URL for the trailer */
  url: string;
  /** Display label: "Reveal Trailer", "Gameplay Trailer", etc. */
  label?: string;
  /** Where it is hosted */
  platform?: TrailerPlatform;
};

export type Media = {
  /** Preferred cover representation */
  cover?: ImageAsset;
  /** Optional list of trailer links */
  trailers?: TrailerLink[];

  /**
   * Back-compat field for older consumers.
   * Deprecated (prefer `media.cover`).
   */
  coverUrl?: string;
};

/* -------------------------
   Studio
   ------------------------- */

export type StudioLocation = {
  city?: string;
  region?: string; // state/province
  country?: string;
  hq?: boolean;
};

export type StudioType =
  | "developer"
  | "publisher"
  | "developer_publisher"
  | "unknown";

export type Studio = {
  /** Studio name; null allowed for rumors/unknown studios */
  name: string | null;
  type: StudioType;
  location?: StudioLocation | null;
  website?: string;
  description?: string;
  parentCompany?: string;
};

/* -------------------------
   Category (full game / dlc / season / etc.)
   ------------------------- */

export type CategoryType =
  | "full_game"
  | "dlc"
  | "season"
  | "event"
  | "update"
  | "store_reset"
  | "other";

export type Category = {
  /** High-level classification for the entry */
  type: CategoryType;

  /** Optional: additional free-form classifier */
  subtype?: string;

  /** Optional: franchise / series grouping */
  franchise?: string;

  /** Optional: display label override */
  label?: string;
};

/* Optional details for DLC/season. Include only when relevant. */
export type DLCDetails = {
  /** DLC display name (e.g. "Phantom Liberty") */
  name: string;

  /** DLC type */
  kind?:
    | "expansion"
    | "story_pack"
    | "season_pass"
    | "cosmetic_pack"
    | "bundle"
    | "other";

  /** Whether base game is required */
  requiresBaseGame?: boolean;

  /** Platforms the DLC applies to (if different from the base entry) */
  platforms?: Platform[];

  /** Optional: bundle relationships */
  includedWith?: string[];

  /** Optional: description blurb */
  description?: string;
};

export type SeasonDetails = {
  /** Season name, if known */
  name?: string;
  /** Numeric season counter, if applicable */
  number?: number;
  /** Chapter counter, if applicable */
  chapter?: number;
  /** Whether a battle pass exists */
  battlePass?: boolean;
  /** Optional season theme */
  theme?: string;
};

/* -------------------------
   Season window (NEW)
   ------------------------- */

/**
 * Where the season boundaries come from.
 * - "official": first-party announcement / in-game / official site
 * - "press": reputable press reporting official info
 * - "community": community tracking / wiki / aggregators
 * - "computed": derived (e.g. cadence-based estimate)
 * - "unknown": not sure / placeholder
 */
export type SeasonWindowSourceKind =
  | "official"
  | "press"
  | "community"
  | "computed"
  | "unknown";

/** Data needed to compute time-left for the current season/act/reset */
export type SeasonWindowCurrent = {
  /** Optional: "Chapter 6 Season 2", "Season 14", "Episode 9 Act 2", etc. */
  label?: string | null;

  /** Season start timestamp (preferred for countdown accuracy); null when unknown */
  startISO: ISODateTime | null;

  /** Season end timestamp (preferred for countdown accuracy); null when unknown */
  endISO: ISODateTime | null;

  /** Timezone of the timestamps; store "UTC" when using Z timestamps */
  timezone?: "UTC" | string;

  /** Precision of the timestamps */
  precision?: "minute" | "day" | "unknown";

  /** True if the season window is confirmed by an official source */
  isOfficial: boolean;

  /** Confidence about the start/end values */
  confidence: "confirmed" | "likely" | "estimate" | "unknown";

  /** Where this window info was sourced/derived from */
  sourceKind?: SeasonWindowSourceKind;

  /** Optional notes to explain caveats */
  notes?: string | null;

  /** Optional sources that support the season window specifically */
  sources?: Source[];
};

/** Container for season timing info (expandable later for previous/next) */
export type SeasonWindow = {
  /** Current live season boundaries */
  current: SeasonWindowCurrent;
};

/* -------------------------
   Release (expanded)
   ------------------------- */

export type ReleaseBase = {
  /**
   * Whether the *release info* is official.
   * You can compute this from sources[] in your pipeline,
   * but storing it makes filtering fast.
   */
  isOfficial: boolean;

  /** Confidence about the release timing */
  confidence: ReleaseConfidence;

  /** Optional: last update timestamp for this release object */
  updatedAt?: ISODateTime;

  /**
   * Optional: sources that specifically support THIS release record.
   * (Useful if Game.sources includes lots of unrelated refs like trailers, studio pages, etc.)
   */
  sources?: Source[];

  /**
   * Optional qualifiers:
   * - region: if the date/window applies only to a geography
   * - platforms: if this date/window applies only to certain platforms
   */
  region?: Region;
  platforms?: Platform[];

  /**
   * Optional: normalized explicit fields so consumers can rely on them existing,
   * even when status is not "announced_date".
   * (If you use these, keep them consistent across statuses.)
   */
  dateISO?: ISODate | null;
  datePrecision?: DatePrecision;
};

export type ReleaseTBA = ReleaseBase & {
  /** No public date/window */
  status: "tba";
};

export type ReleaseAnnouncedDate = ReleaseBase & {
  /** Publicly announced release date */
  status: "announced_date";
  dateISO: ISODate; // required here
  /**
   * If omitted, consumers can treat it as "day" for strict dates.
   * Keep it optional to reduce data entry burden.
   */
  datePrecision?: Exclude<DatePrecision, "unknown">;
};

export type ReleaseAnnouncedWindow = ReleaseBase & {
  /** Publicly announced window (year/quarter/month/label) */
  status: "announced_window";
  window: {
    year?: number;
    quarter?: 1 | 2 | 3 | 4;
    month?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    label?: string; // e.g. "2026", "2026-Q4", "Spring 2026"
  };
};

export type ReleaseRecurringDaily = ReleaseBase & {
  /** Happens every day at a known UTC time */
  status: "recurring_daily";
  timeUTC: string; // "HH:MM" (UTC)
};

export type ReleaseRecurringWeekly = ReleaseBase & {
  /** Happens weekly at a known UTC time */
  status: "recurring_weekly";
  /** 0 (Sunday) - 6 (Saturday) */
  dayOfWeekUTC: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timeUTC: string; // "HH:MM" (UTC)
};

/**
 * KEY CHANGE:
 * If status is "released", require a dateISO so you can reliably filter released items.
 */
export type ReleaseReleased = ReleaseBase & {
  /** Already released */
  status: "released";

  /** Actual release date (required for deterministic filtering) */
  dateISO: ISODate;

  /** Optional: exact timestamp if known */
  releasedAt?: ISODateTime;
};

/** Optional but useful in real-world datasets */
export type ReleaseCancelled = ReleaseBase & {
  /** Cancelled and not expected to ship */
  status: "cancelled";

  /** Optional: when it was cancelled (YYYY-MM-DD) */
  dateISO?: ISODate;

  /** Optional: reason or notes */
  reason?: string;
};

export type ReleaseDelayed = ReleaseBase & {
  /** Delayed from a previous date/window */
  status: "delayed";

  /** Previous known date/window (if any) */
  previous?: {
    dateISO?: ISODate;
    windowLabel?: string;
  };

  /** Optional note about the delay */
  note?: string;
};

export type GameRelease =
  | ReleaseTBA
  | ReleaseAnnouncedDate
  | ReleaseAnnouncedWindow
  | ReleaseRecurringDaily
  | ReleaseRecurringWeekly
  | ReleaseReleased
  | ReleaseCancelled
  | ReleaseDelayed;

export type ReleaseStatus = GameRelease["status"];

/* -------------------------
   Popularity (for sorting)
   ------------------------- */

export type PopularityTier =
  | "blockbuster"
  | "very_popular_live_service"
  | "popular"
  | "niche"
  | "unknown_or_rumor";

/**
 * Optional: single-field classification to simplify filtering in clients.
 * You can compute this from release.status in your pipeline.
 */
export type Availability = "upcoming" | "released" | "cancelled" | "unknown";

/* -------------------------
   Main Game item
   ------------------------- */

export type Game = {
  /** Stable identifier (slug) */
  id: string;

  /** Display name for the entry (can be "Fortnite — Season X", "GTA VI", etc.) */
  name: string;

  /**
   * Canonical title (optional). Useful if name is a specific release item.
   * Example: name="Fortnite — Chapter 6 Season 3", title="Fortnite"
   */
  title?: string;

  /** Optional: tag list for filtering/search */
  tags?: string[];

  /** Structured category */
  category: Category;

  /** Platform list (for filtering). If not known, store [] or omit based on your conventions. */
  platforms: Platform[];

  /** Rich media model (cover + trailers) */
  media?: Media;

  /**
   * Back-compat with earlier data.
   * Deprecated (prefer media.cover.kind==="url").
   */
  coverUrl?: string;

  /** Release details */
  release: GameRelease;

  /**
   * Optional: computed helper for clients.
   * If present, should match release.status semantics.
   */
  availability?: Availability;

  /** Attribution (general; not necessarily release-specific) */
  sources: Source[];

  /** Studio metadata */
  studio?: Studio;

  /** Optional: DLC specifics when relevant */
  dlc?: DLCDetails;

  /** Optional: season metadata (name/number/etc.) */
  season?: SeasonDetails;

  /**
   * NEW: season timing boundaries for countdowns.
   * Intended for category.type==="season" (and optionally "update"/"event" if you timebox those).
   */
  seasonWindow?: SeasonWindow;

  /** Sorting helpers */
  popularityTier?: PopularityTier;
  popularityRank?: number;
};

export type GamesDoc = {
  /** When this document was generated */
  generatedAt: ISODateTime;

  /**
   * Optional: moment you consider "released vs upcoming" for filtering.
   * Usually same as generatedAt, but explicitly storing it makes behavior deterministic.
   */
  asOf?: AsOf;

  /** Schema version string */
  schemaVersion: string;

  /** Game list */
  games: Game[];
};

export type GameDoc = GamesDoc;
