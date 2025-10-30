"use client";

import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

type Props = {
  children: React.ReactNode;
};

function HeaderActions({ children }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <Button variant="link">{t("wiki")}</Button>
      {children}
    </div>
  );
}

export default HeaderActions;
