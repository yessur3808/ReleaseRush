export const RTL_LANGS = new Set(["ar", "fa", "he", "ur"]);

export function isRtlLanguage(languageTag: string): boolean {
  const base = (languageTag ?? "").split(/[-_]/)[0];
  return RTL_LANGS.has(base);
}
