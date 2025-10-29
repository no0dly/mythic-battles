"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ".";

export default function I18nInit({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || "en";
  }, [i18n.resolvedLanguage]);

  return children;
}
