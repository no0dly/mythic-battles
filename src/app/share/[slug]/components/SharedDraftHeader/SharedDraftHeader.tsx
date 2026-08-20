"use client";

import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import CopyShareLink from "../CopyShareLink/CopyShareLink";

interface SharedDraftHeaderProps {
  title: string;
}

export default function SharedDraftHeader({ title }: SharedDraftHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-purple-700">
          <ClipboardList className="h-6 w-6" />
          <h3 className="text-2xl font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("sharedDraftDescription")}
        </p>
      </div>
      <CopyShareLink />
    </div>
  );
}
