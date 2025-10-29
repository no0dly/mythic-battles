"use client";

import { useTranslation } from "react-i18next";
import {
  AppLanguage,
  languages as languageMeta,
  supportedLngs,
} from "../i18n/config";

const languageCodes = supportedLngs;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label htmlFor="lang">Language</label>
      <select
        id="lang"
        value={i18n.resolvedLanguage}
        onChange={(e) => i18n.changeLanguage(e.target.value as AppLanguage)}
      >
        {languageCodes.map((code) => (
          <option key={code} value={code}>
            {languageMeta[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
