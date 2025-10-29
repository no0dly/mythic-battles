export const languages = {
  en: "English",
  ru: "Русский",
} as const;

export type AppLanguageFE = keyof typeof languages;

export const supportedLngs = Object.keys(languages) as AppLanguageFE[];
