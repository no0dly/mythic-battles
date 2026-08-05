"use client";

import type { ChangeEvent } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LeaderboardFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function LeaderboardFilter({
  value,
  onValueChange,
}: LeaderboardFilterProps) {
  const { t } = useTranslation();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.target.value);
  }

  function handleClear() {
    onValueChange("");
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <Input
        value={value}
        onChange={handleChange}
        placeholder={t("leaderboard.filterPlaceholder")}
        className="pr-10"
        autoComplete="off"
        aria-label={t("leaderboard.filterPlaceholder")}
      />
      {value.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          aria-label={t("clearFilters")}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      ) : (
        <SearchIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
    </div>
  );
}
