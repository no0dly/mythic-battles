"use client";

import { useTranslation } from "react-i18next";

export default function Hello() {
  const { t } = useTranslation();

  return <h1>{t("hello")}</h1>;
}
