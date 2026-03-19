export type ApiError = { status: number; message: string };

/**
 * Generic fetch wrapper.  Accepts both relative paths (e.g. "/games") and
 * absolute URLs (e.g. "http://localhost:3000/games").
 */
export async function apiFetch<T>(
  pathOrUrl: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(pathOrUrl, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw {
      status: res.status,
      message: text || res.statusText,
    } satisfies ApiError;
  }

  return (await res.json()) as T;
}
