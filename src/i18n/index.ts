import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ru from "./locales/ru.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import ja from "./locales/ja.json";
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";
import id from "./locales/id.json";
// Future: import ar from "./locales/ar.json";
// Future: import fa from "./locales/fa.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "zh-CN", label: "Mandarin (Simplified)", nativeLabel: "中文（简体）" },
  { code: "zh-TW", label: "Cantonese (Traditional)", nativeLabel: "中文（繁體）" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia" },
  // Future RTL languages – uncomment when locale files are ready:
  // { code: "ar", label: "Arabic", nativeLabel: "العربية", rtl: true },
  // { code: "fa", label: "Farsi", nativeLabel: "فارسی", rtl: true },
] as const;

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  ru: { translation: ru },
  de: { translation: de },
  pt: { translation: pt },
  ja: { translation: ja },
  "zh-CN": { translation: zhCN },
  "zh-TW": { translation: zhTW },
  id: { translation: id },
} as const;

const RTL_LANGS = new Set(["ar", "fa", "he", "ur"]);

function applyDocumentDirection(lng: string) {
  const isRtl = RTL_LANGS.has(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      // Detection order: cookie first (user preference), then browser language
      order: ["cookie", "navigator", "htmlTag"],
      caches: ["cookie"],
      lookupCookie: "rr_lang",
      cookieOptions: {
        path: "/",
        sameSite: "lax" as const,
        // 1 year expiry
        maxAge: 60 * 60 * 24 * 365,
      },
    },
  });

applyDocumentDirection(i18n.resolvedLanguage || i18n.language || "en");

i18n.on("languageChanged", (lng) => {
  applyDocumentDirection(lng);
});

export default i18n;
