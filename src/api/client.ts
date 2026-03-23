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

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("json")) {
    const bodyPreview = (await res.text().catch(() => ""))
      .replace(/\s+/g, " ")
      .slice(0, 140);
    throw new Error(
      `Expected JSON from ${pathOrUrl} but received '${contentType || "unknown"}' (${res.status}). ` +
        `Response preview: ${bodyPreview || "<empty>"}`,
    );
  }

  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from ${pathOrUrl} (${res.status}): ${String(error)}`,
    );
  }
}
