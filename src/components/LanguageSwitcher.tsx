"use client";

import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import {
  AppLanguage,
  languages as languageMeta,
  supportedLngs,
} from "../i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languageCodes = supportedLngs;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || "en";

  const onChangeLanguageHandler = (value: AppLanguage) => () => {
    i18n.changeLanguage(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageCodes.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={onChangeLanguageHandler(code)}
            className={
              currentLanguage === code ? "bg-accent text-accent-foreground" : ""
            }
          >
            {languageMeta[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
