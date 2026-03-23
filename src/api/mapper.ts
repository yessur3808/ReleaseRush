/**
 * Maps Game-Tracker-Service response shapes to the ReleaseRush internal types.
 *
 * The service uses slightly different conventions:
 *  - Release statuses: "announced" | "upcoming" | "released" | "delayed" |
 *                      "canceled" | "unknown"
 *  - Platform names:   uppercase strings ("PC", "PS5", "Xbox Series X", …)
 *  - Response shape:   flat Game[] (no GamesDoc wrapper)
 *  - Confidence:       "official" | "likely" | "rumor"  (no "confirmed")
 *  - Source types:     "official_site" | "press_release" | …
 */

import type {
  Game,
  GameRelease,
  GamesDoc,
  Platform,
  Source,
  SourceType,
  Studio,
} from "../lib/types";

// ---------------------------------------------------------------------------
// Platform mapping (service uppercase → ReleaseRush lowercase Platform)
// ---------------------------------------------------------------------------

const PLATFORM_MAP: Record<string, Platform> = {
  PC: "pc",
  PS5: "ps5",
  PS4: "ps4",
  "Xbox Series X": "xbox_series",
  "Xbox One": "xbox_one",
  "Nintendo Switch": "switch",
  "Switch 2": "switch_2",
  iOS: "ios",
  Android: "android",
  VR: "vr",
};

function mapPlatform(raw: string): Platform {
  return PLATFORM_MAP[raw] ?? "other";
}

// ---------------------------------------------------------------------------
// Source type mapping
// ---------------------------------------------------------------------------

const SOURCE_TYPE_MAP: Record<string, SourceType> = {
  official_site: "official_website",
  press_release: "press_release",
  platform_store: "platform_store",
  youtube: "youtube",
  twitter_x: "twitter_x",
  discord: "discord",
  gaming_news: "gaming_news",
  gaming_blog: "gaming_blog",
  forum: "forum",
  reddit: "reddit",
  other: "other",
};

function mapSourceType(raw: string): SourceType {
  return SOURCE_TYPE_MAP[raw] ?? "other";
}

// ---------------------------------------------------------------------------
// Source mapping
// ---------------------------------------------------------------------------

function mapSource(raw: Record<string, unknown>): Source {
  return {
    type: mapSourceType(String(raw["type"] ?? "other")),
    isOfficial: Boolean(raw["isOfficial"] ?? false),
    name: String(raw["name"] ?? ""),
    url: raw["url"] !== undefined ? String(raw["url"]) : undefined,
    retrievedAt: raw["retrievedAt"] !== undefined ? String(raw["retrievedAt"]) : undefined,
    claim: raw["claim"] !== undefined ? String(raw["claim"]) : undefined,
    excerpt: raw["excerpt"] !== undefined ? String(raw["excerpt"]) : undefined,
    authorHandle: raw["authorHandle"] !== undefined ? String(raw["authorHandle"]) : undefined,
    reliability: (raw["reliability"] as Source["reliability"]) ?? "unknown",
  };
}

// ---------------------------------------------------------------------------
// Release mapping
// ---------------------------------------------------------------------------

function mapConfidence(raw: string | undefined): GameRelease["confidence"] {
  switch (raw) {
    case "official":
      return "confirmed";
    case "likely":
      return "likely";
    case "rumor":
      return "rumor";
    default:
      return "unknown";
  }
}

function mapRelease(raw: Record<string, unknown>): GameRelease {
  const status = String(raw["status"] ?? "unknown");
  const dateISO = raw["dateISO"] ? String(raw["dateISO"]) : undefined;
  const datePrecision = raw["datePrecision"]
    ? (String(raw["datePrecision"]) as GameRelease["datePrecision"])
    : undefined;
  const isOfficial = Boolean(raw["isOfficial"] ?? false);
  const confidence = mapConfidence(raw["confidence"] as string | undefined);
  const releaseSources = Array.isArray(raw["sources"])
    ? (raw["sources"] as Record<string, unknown>[]).map(mapSource)
    : [];

  const base = { isOfficial, confidence, sources: releaseSources };

  // Map service status to ReleaseRush release type
  if (status === "released") {
    if (!dateISO) {
      // Service returned "released" without a date — treat as TBA to avoid
      // displaying a misleading release date
      console.warn(`[mapper] Game has status "released" but no dateISO — falling back to "tba"`);
      return { ...base, status: "tba" };
    }
    return {
      ...base,
      status: "released",
      dateISO,
      datePrecision: datePrecision ?? "day",
    };
  }

  if (status === "delayed") {
    return { ...base, status: "delayed" };
  }

  if (status === "canceled") {
    return { ...base, status: "cancelled" };
  }

  if (status === "announced" || status === "upcoming") {
    if (dateISO) {
      // Strip "unknown" precision — ReleaseAnnouncedDate only allows day/month/quarter/year
      const safePrecision = datePrecision === "unknown" ? undefined : datePrecision;
      return {
        ...base,
        status: "announced_date",
        dateISO,
        datePrecision: safePrecision ?? "day",
      };
    }

    const aw = raw["announced_window"] as Record<string, unknown> | undefined;
    if (aw) {
      const month = aw["month"] as number | undefined;
      return {
        ...base,
        status: "announced_window",
        window: {
          year: aw["year"] as number | undefined,
          quarter: aw["quarter"] as 1 | 2 | 3 | 4 | undefined,
          // Cast month to the union — values outside 1-12 are server bugs
          month: (month !== undefined && month >= 1 && month <= 12 ? month : undefined) as
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9
            | 10
            | 11
            | 12
            | undefined,
          label: aw["label"] as string | undefined,
        },
      };
    }

    return { ...base, status: "tba" };
  }

  // "unknown" or anything else → TBA
  return { ...base, status: "tba" };
}

// ---------------------------------------------------------------------------
// Category mapping
// ---------------------------------------------------------------------------

function mapCategory(raw: Record<string, unknown> | undefined): Game["category"] {
  if (!raw) return { type: "full_game" };

  const type = String(raw["type"] ?? "other") as Game["category"]["type"];
  return {
    type,
    subtype: raw["subtype"] as string | undefined,
    franchise: raw["franchise"] as string | undefined,
    label: raw["label"] as string | undefined,
  };
}

// ---------------------------------------------------------------------------
// Main game mapper
// ---------------------------------------------------------------------------

/**
 * Maps a single raw service Game object to a ReleaseRush Game.
 */
export function mapServiceGame(raw: Record<string, unknown>): Game {
  const platforms = Array.isArray(raw["platforms"])
    ? (raw["platforms"] as string[]).map(mapPlatform)
    : [];

  const sources = Array.isArray(raw["sources"])
    ? (raw["sources"] as Record<string, unknown>[]).map(mapSource)
    : [];

  const rawRelease = (raw["release"] as Record<string, unknown> | undefined) ?? {};
  const release = mapRelease(rawRelease);

  const rawStudio = raw["studio"] as Record<string, unknown> | undefined;
  const studio: Studio | undefined = rawStudio
    ? {
        name: rawStudio["name"] as string | null,
        type: (rawStudio["type"] as Studio["type"]) ?? "unknown",
        website: rawStudio["website"] as string | undefined,
        description: rawStudio["description"] as string | undefined,
        parentCompany: rawStudio["parentCompany"] as string | undefined,
      }
    : undefined;

  // Preserve media if the service returns it; fall back to coverUrl
  const rawMedia = raw["media"] as Record<string, unknown> | undefined;
  const media = rawMedia ? (rawMedia as Game["media"]) : undefined;

  return {
    id: String(raw["id"] ?? ""),
    name: String(raw["name"] ?? ""),
    title: raw["title"] as string | undefined,
    tags: Array.isArray(raw["tags"]) ? (raw["tags"] as string[]) : undefined,
    category: mapCategory(raw["category"] as Record<string, unknown> | undefined),
    platforms,
    media,
    coverUrl: raw["coverUrl"] as string | undefined,
    release,
    availability: raw["availability"] as Game["availability"] | undefined,
    sources,
    studio,
    popularityTier: raw["popularityTier"] as Game["popularityTier"] | undefined,
    popularityRank: raw["popularityRank"] as number | undefined,
  };
}

/**
 * Wraps a Game-Tracker-Service Game[] response into a ReleaseRush GamesDoc.
 */
export function serviceGamesToDoc(raw: unknown[]): GamesDoc {
  const games = raw
    .filter((g): g is Record<string, unknown> => typeof g === "object" && g !== null)
    .map(mapServiceGame);

  return {
    generatedAt: new Date().toISOString(),
    schemaVersion: "service",
    games,
  };
}
