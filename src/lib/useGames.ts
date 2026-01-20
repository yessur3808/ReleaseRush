import React from "react";
import type { GamesDoc } from "./types";
import { GAMES_URL } from "./data";

export function useGames() {
  const [doc, setDoc] = React.useState<GamesDoc | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
