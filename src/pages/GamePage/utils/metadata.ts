// metadata.ts
import { ImageAsset, TrailerLink } from "../../../lib/types";
import { coverAssetToUrl } from "../helpers";

export type TrailerProvider = "youtube" | "vimeo" | "other";

export type TrailerMeta = {
  url: string;
  label: string;
  provider: TrailerProvider;
  id: string | null; // video id when detected
  thumbUrl: string | null; // best-effort thumbnail
};

export type TrailerLinkWithCover = TrailerLink & { cover?: ImageAsset | null };

export function safeUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

export function detectProvider(url: string): TrailerProvider {
  const u = safeUrl(url);
  if (!u) return "other";

  const host = normalizeHost(u.hostname);
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host.endsWith("vimeo.com")) return "vimeo";
  return "other";
}

export function parseYouTubeId(url: string): string | null {
  const u = safeUrl(url);
  if (!u) return null;

  const host = normalizeHost(u.hostname);

  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return id ?? null;
  }

  // youtube.com/...
  if (host.endsWith("youtube.com")) {
    // /watch?v=<id>
    const v = u.searchParams.get("v");
    if (v) return v;

    // /shorts/<id>
    const shorts = u.pathname.match(/\/shorts\/([^/]+)/)?.[1];
    if (shorts) return shorts;

    // /embed/<id>
    const embed = u.pathname.match(/\/embed\/([^/]+)/)?.[1];
    if (embed) return embed;
  }

  return null;
}

/**
 * YouTube thumbnails:
 * - maxresdefault can 404 on some videos
 * - hqdefault is usually safe
 *
 * You can upgrade later by trying maxres first with an <img onError> fallback.
 */
export function youTubeThumbUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function parseVimeoId(url: string): string | null {
  const u = safeUrl(url);
  if (!u) return null;

  const host = normalizeHost(u.hostname);
  if (!host.endsWith("vimeo.com")) return null;

  // vimeo.com/<id> or player.vimeo.com/video/<id>
  const id = u.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
  return id ?? null;
}

function defaultLabel(
  tr: TrailerLink,
  idx: number,
  t: (k: string, opts?: Record<string, unknown>) => string,
) {
  return tr.label ?? `${t("pages.game.links.trailer")} ${idx + 1}`;
}

export function getTrailerMeta(
  tr: TrailerLinkWithCover,
  idx: number,
  t: (k: string, opts?: Record<string, unknown>) => string,
  fallbackCoverUrl: string | null,
): TrailerMeta {
  const label = defaultLabel(tr, idx, t);

  // Prefer explicit cover from your data model
  const assetThumb = tr.cover ? coverAssetToUrl(tr.cover) : null;
  if (assetThumb) {
    return {
      url: tr.url,
      label,
      provider: detectProvider(tr.url), // could still be youtube/vimeo
      id: null,
      thumbUrl: assetThumb,
    };
  }

  const provider = detectProvider(tr.url);

  if (provider === "youtube") {
    const id = parseYouTubeId(tr.url);
    return {
      url: tr.url,
      label,
      provider,
      id,
      thumbUrl: id ? youTubeThumbUrl(id) : fallbackCoverUrl,
    };
  }

  if (provider === "vimeo") {
    const id = parseVimeoId(tr.url);
    // Vimeo thumb requires oEmbed/API; fallback for now
    return {
      url: tr.url,
      label,
      provider,
      id,
      thumbUrl: fallbackCoverUrl,
    };
  }

  return {
    url: tr.url,
    label,
    provider: "other",
    id: null,
    thumbUrl: fallbackCoverUrl,
  };
}
