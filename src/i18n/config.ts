export const languages = {
  en: "English",
  ru: "Русский",
} as const;

export type AppLanguage = keyof typeof languages;

export const supportedLngs = Object.keys(languages) as AppLanguage[];


