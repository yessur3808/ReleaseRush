declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __env__: { GA_MEASUREMENT_ID?: string };
  }
}

const MEASUREMENT_ID =
  window.__env__?.GA_MEASUREMENT_ID ??
  ((import.meta.env.VITE_GA_MEASUREMENT_ID ||
    // keep legacy name fallback if you used it earlier
    (import.meta.env as Record<string, unknown>).GA_MEASUREMENT_ID) as string | undefined) ??
  "";

/**
 * If GA is missing/misconfigured, we no-op.
 * If GA throws (rare, but can happen with blockers / partial loads), we catch once and permanently disable.
 */
let disabledBecauseError = false;
let warnedNoId = false;
let warnedNoGtag = false;
let warnedError = false;

function warnOnce(kind: "no-id" | "no-gtag" | "error", message: string, err?: unknown) {
  // keep logs in dev; avoid noisy prod consoles if you want
  if (!import.meta.env.DEV) return;

  if (kind === "no-id" && warnedNoId) return;
  if (kind === "no-gtag" && warnedNoGtag) return;
  if (kind === "error" && warnedError) return;

  if (kind === "no-id") warnedNoId = true;
  if (kind === "no-gtag") warnedNoGtag = true;
  if (kind === "error") warnedError = true;

  console.warn(message, err);
}

/** True if GA is configured and appears available */
export function gaEnabled() {
  if (disabledBecauseError) return false;

  if (typeof window === "undefined") return false;

  if (!MEASUREMENT_ID) {
    warnOnce("no-id", "[GA4] Measurement ID is missing; analytics disabled.");
    return false;
  }

  if (typeof window.gtag !== "function") {
    // Common when the script is blocked by an ad/tracker blocker or hasn't loaded yet.
    warnOnce(
      "no-gtag",
      "[GA4] window.gtag is not available (blocked or not loaded yet); analytics disabled for now.",
    );
    return false;
  }

  return true;
}

/** Internal safe wrapper so GA failures never break the app */
function safeGtag(...args: Parameters<NonNullable<Window["gtag"]>>) {
  if (!gaEnabled()) return;

  try {
    window.gtag!(...args);
  } catch (err) {
    disabledBecauseError = true;
    warnOnce("error", "[GA4] gtag call failed; analytics disabled for this session.", err);
  }
}

/** Track SPA page views */
export function trackPageView(path: string, title?: string) {
  safeGtag("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_title: title ?? document.title,
  });
}

/** Track custom events */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) {
  safeGtag("event", name, params ?? {});
}
