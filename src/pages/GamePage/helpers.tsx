import { Game, ImageAsset, Platform, Source, TrailerLink } from "../../lib/types";
import { formatDateISO } from "../../utils";

import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ComputerIcon from "@mui/icons-material/Computer";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import PublicIcon from "@mui/icons-material/Public";
import NewspaperIcon from "@mui/icons-material/Newspaper";

export const platformLabel = (p: Platform): string => {
  switch (p) {
    case "pc":
      return "PC";
    case "ps5":
      return "PS5";
    case "ps4":
      return "PS4";
    case "xbox_series":
      return "Xbox Series";
    case "xbox_one":
      return "Xbox One";
    case "switch":
      return "Switch";
    case "switch_2":
      return "Switch 2";
    case "ios":
      return "iOS";
    case "android":
      return "Android";
    case "vr":
      return "VR";
    default:
      return "Other";
  }
};

export const platformIcon = (p: Platform) => {
  switch (p) {
    case "pc":
      return <ComputerIcon fontSize="small" />;
    case "ios":
    case "android":
      return <SmartphoneIcon fontSize="small" />;
    case "ps5":
    case "ps4":
    case "xbox_series":
    case "xbox_one":
    case "switch":
    case "switch_2":
      return <VideogameAssetIcon fontSize="small" />;
    default:
      return <SportsEsportsIcon fontSize="small" />;
  }
};

export const sourceIcon = (s: Source) => {
  return s.isOfficial ? <PublicIcon fontSize="small" /> : <NewspaperIcon fontSize="small" />;
};

export const categoryText = (game: Game): string => {
  const { category } = game;
  const base =
    category.label ??
    (category.type === "full_game"
      ? "Full game"
      : category.type === "dlc"
        ? "DLC"
        : category.type === "season"
          ? "Season"
          : category.type === "event"
            ? "Event"
            : category.type === "update"
              ? "Update"
              : category.type === "store_reset"
                ? "Store reset"
                : "Other");

  return category.subtype ? `${base} · ${category.subtype}` : base;
};

export const releasePrimaryChipLabel = (
  game: Game,
  t: (k: string, opts?: Record<string, unknown>) => string,
): string => {
  const st = game.release.status;
  if (st === "announced_date" || st === "announced_window") return t("pages.game.countdown.release");
  if (st === "recurring_daily" || st === "recurring_weekly") return t("pages.game.countdown.resets_daily");
  if (st === "released") return t("pages.game.meta.released") ?? "Released";
  if (st === "cancelled") return t("pages.game.meta.cancelled") ?? "Cancelled";
  if (st === "delayed") return t("pages.game.meta.delayed") ?? "Delayed";
  return t("pages.game.meta.tba");
};

export const releaseSecondaryLine = (game: Game): string | null => {
  const r = game.release;
  switch (r.status) {
    case "announced_date":
      return formatDateISO(r.dateISO);
    case "released":
      return `Released: ${formatDateISO(r.dateISO)}`;
    case "announced_window":
      return r.window.label ?? "Release window";
    case "recurring_daily":
      return `Daily · ${r.timeUTC} UTC`;
    case "recurring_weekly":
      return `Weekly · ${r.dayOfWeekUTC} @ ${r.timeUTC} UTC`;
    case "cancelled":
      return r.dateISO ? `Cancelled: ${formatDateISO(r.dateISO)}` : "Cancelled";
    case "delayed":
      return r.note ?? "Delayed";
    default:
      return null;
  }
};

export const coverAssetToUrl = (asset: ImageAsset): string => {
  if (asset.kind === "url") return asset.url;
  return `data:${asset.mime};base64,${asset.data}`;
};

export const pickCoverUrl = (game: Game): string | null => {
  if (game.media?.cover) return coverAssetToUrl(game.media.cover);
  return game.coverUrl ?? game.media?.coverUrl ?? null;
};

export const pickTrailers = (game: Game): TrailerLink[] => {
  return game.media?.trailers ?? [];
};

export const pickSourcesForDisplay = (game: Game): Source[] => {
  const releaseSources = game.release.sources ?? [];
  const all = [...releaseSources, ...game.sources];

  const seen = new Set<string>();
  const deduped: Source[] = [];
  for (const s of all) {
    const key = `${s.url ?? ""}::${s.name}::${s.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }
  return deduped;
};

export const pickTopSources = (sources: Source[], max: number): Source[] => {
  const copy = [...sources];
  copy.sort((a, b) => {
    const ao = a.isOfficial ? 0 : 1;
    const bo = b.isOfficial ? 0 : 1;
    if (ao !== bo) return ao - bo;

    const au = a.url ? 0 : 1;
    const bu = b.url ? 0 : 1;
    if (au !== bu) return au - bu;

    return a.name.localeCompare(b.name);
  });
  return copy.slice(0, max);
};
