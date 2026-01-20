import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
// import ar from "./locales/ar.json";
// import fr from "./locales/fr.json";

const resources = {
  en: { translation: en },
  // ar: { translation: ar },
  // fr: { translation: fr },
  // ru: { translation: ru}
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const RTL_LANGS = new Set(["ar", "fa", "he", "ur"]);

function applyDocumentDirection(lng: string) {
  const isRtl = RTL_LANGS.has(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
}

applyDocumentDirection(i18n.resolvedLanguage || i18n.language || "en");

i18n.on("languageChanged", (lng) => {
  applyDocumentDirection(lng);
});

export default i18n;
