"use client";

import { useTranslation } from "react-i18next";
import { Control } from "react-hook-form";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  GAME_MODE_LABEL_KEYS,
  GAME_MODE_PLAYER_COUNT,
  GAME_MODE_VALUES,
} from "@/types/constants";
import type { GameMode } from "@/types/database.types";
import type { DraftSettingsFormValues } from "@/app/draft-settings/components/DraftSettings/constants";

interface GameModeFieldProps {
  control: Control<DraftSettingsFormValues>;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export function GameModeField({ control, onModeChange, disabled = false }: GameModeFieldProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name="mode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("gameModeLabel")}</FormLabel>
          <div role="radiogroup" className="grid grid-cols-3 gap-2" data-testid="game-mode-field">
            {GAME_MODE_VALUES.map((mode) => {
              const isSelected = field.value === mode;
              return (
                <Button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  variant={isSelected ? "default" : "outline"}
                  disabled={disabled}
                  onClick={() => {
                    if (isSelected) return;
                    field.onChange(mode);
                    onModeChange(mode);
                  }}
                  className="h-auto min-w-0 flex-col gap-1 whitespace-normal px-2 py-2 text-center"
                >
                  <span className="font-semibold leading-tight break-words">
                    {t(GAME_MODE_LABEL_KEYS[mode])}
                  </span>
                  <span className="flex items-center gap-1 text-xs opacity-80">
                    <Users className="size-3 shrink-0" />
                    {t("gameModePlayerCount", { count: GAME_MODE_PLAYER_COUNT[mode] })}
                  </span>
                </Button>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
