import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { supportedLngs } from "./config";

export const defaultNS = "translation" as const;

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      defaultNS,
      supportedLngs,
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      detection: {
        order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
        caches: ["cookie", "localStorage"],
      },
    });
}

export default i18n;


