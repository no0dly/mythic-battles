"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { supportedLngs } from "./config";
import en from "./locales/en/translation";
import ru from "./locales/ru/translation";

export const defaultNS = "translation" as const;

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      defaultNS,
      resources: {
        en: { translation: en },
        ru: { translation: ru },
      },
      supportedLngs,
      load: "languageOnly",
      nonExplicitSupportedLngs: true,
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
      detection: {
        order: ["querystring", "cookie", "localStorage", "navigator"],
        caches: ["cookie", "localStorage"],
      },
    });
}

export type TranslationKey = keyof typeof en;

export default i18n;
