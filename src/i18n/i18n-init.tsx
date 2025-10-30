"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ".";

export default function I18nInitFE({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  // hack to prevent server rendering for client components
  // i think it can be replaced by adding new hook that will do same but just for translations
  useEffect(() => {
    if (i18n.isInitialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInitialized(true);
    }
  }, [i18n]);

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || "en";
  }, [i18n.resolvedLanguage]);

  if (!isInitialized) {
    return null;
  }

  return children;
}
