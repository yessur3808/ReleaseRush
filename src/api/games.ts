import type { GamesDoc } from "../lib/types";
import { apiFetch } from "./client";
import { serviceGamesToDoc } from "./mapper";

/** Maximum page size accepted by the Game-Tracker-Service /games endpoint. */
const MAX_GAMES_PAGE_SIZE = 200;

/**
 * Fetches the full game list from the Game-Tracker-Service.
 *
 * The service returns a flat Game[] array.  We wrap it in a GamesDoc so the
 * rest of the app can continue using the same data shape.
 *
 * @param baseUrl  - Base URL of the running service, e.g. "http://localhost:3000"
 */
export async function fetchGamesFromService(baseUrl: string): Promise<GamesDoc> {
  const url = `${baseUrl.replace(/\/$/, "")}/games?limit=${MAX_GAMES_PAGE_SIZE}`;
  const raw = await apiFetch<unknown[]>(url);
  return serviceGamesToDoc(Array.isArray(raw) ? raw : []);
}
