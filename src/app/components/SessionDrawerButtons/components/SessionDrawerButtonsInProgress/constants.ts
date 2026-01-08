import { WIN_CONDITION } from "@/types/constants";
import type { FinishGameFormValues } from "./types";

export const WIN_CONDITION_OPTIONS = [
  { value: WIN_CONDITION.KILLED_GOD, label: "winConditionOptions.killedGod" },
  { value: WIN_CONDITION.OBTAINED_GEMS, label: "winConditionOptions.obtainedGems" },
] as const;

export const FINISH_GAME_FORM_DEFAULT_VALUES: FinishGameFormValues = {
  playerId: "",
  winCondition: "",
};

