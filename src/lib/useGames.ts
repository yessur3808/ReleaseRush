import { useEffect, useMemo, useState } from "react";
import type { GamesDoc } from "./types";
import { GAMES_URL } from "./data";
import { fetchGamesFromService } from "../api/games";

const TEMPLATE_TOKEN_PATTERN = /^\$\{.+\}$/;

function isValidServiceUrl(value: string): boolean {
  const candidate = value.trim();
  if (!candidate || TEMPLATE_TOKEN_PATTERN.test(candidate)) return false;

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns the configured Game-Tracker-Service base URL, or null if not set.
 *
 * Checks (in order):
 *  1. Runtime env: window.__env__.GAMES_API_URL   (set via /env.json at boot)
 *  2. Build-time:  import.meta.env.VITE_API_BASE_URL
 */
function getServiceUrl(): string | null {
  const runtime =
    typeof window !== "undefined" &&
    (window.__env__ as Record<string, unknown> | undefined)?.["GAMES_API_URL"];
  if (runtime && typeof runtime === "string" && isValidServiceUrl(runtime)) {
    return runtime.trim();
  }

  const buildTime = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (buildTime && isValidServiceUrl(buildTime)) {
    return buildTime.trim();
  }

  return null;
}

type UseGamesParams = {
  platform?: string | string[];
  categoryType?: string;
  availability?: string;
  q?: string;
  limit?: number;
};

export function useGames(params?: UseGamesParams) {
  const [doc, setDoc] = useState<GamesDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable serialisation so the effect only re-runs when params actually change
  const paramsKey = useMemo(() => JSON.stringify(params ?? null), [params]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setLoading(true);

        const serviceUrl = getServiceUrl();

        let result: GamesDoc;

        if (serviceUrl) {
          // Live service path
          result = await fetchGamesFromService(serviceUrl);
        } else {
          // Static JSON fallback
          const res = await fetch(GAMES_URL, {
            cache: "no-store",
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Failed to load games (${res.status})`);
          result = (await res.json()) as GamesDoc;
        }

        if (!controller.signal.aborted) setDoc(result);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const message =
          e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
        if (!controller.signal.aborted) {
          setError(message);
          setDoc(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [paramsKey]);

  return { doc, loading, error };
}
