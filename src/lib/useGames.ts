import { useEffect, useState } from "react";
import type { GamesDoc } from "./types";
import { GAMES_URL } from "./data";

export function useGames() {
  const [doc, setDoc] = useState<GamesDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(GAMES_URL, { cache: "no-store" });
        if (!res.ok)
          throw new Error(`Failed to load games.json (${res.status})`);
        const json = (await res.json()) as GamesDoc;
        if (alive) setDoc(json);
      } catch (e: unknown) {
        if (alive) {
          const message =
            e instanceof Error
              ? e.message
              : typeof e === "string"
                ? e
                : "Unknown error";
          setError(message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { doc, loading, error };
}
