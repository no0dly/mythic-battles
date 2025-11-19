import type { FinishGameFormValues } from "./types";

export const WIN_CONDITION_OPTIONS = [
  { value: "killedGod", label: "winConditionOptions.killedGod" },
  { value: "obtainedGems", label: "winConditionOptions.obtainedGems" },
] as const;

export const FINISH_GAME_FORM_DEFAULT_VALUES: FinishGameFormValues = {
  playerId: "",
  winCondition: "",
};

