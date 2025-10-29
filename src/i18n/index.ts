"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
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
      detection: {
        order: ["querystring", "cookie", "localStorage", "navigator"],
        caches: ["cookie", "localStorage"],
      },
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      initImmediate: false,
    });
}

export default i18n;


