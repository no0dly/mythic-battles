import { z } from "zod";
import type { TFunction } from "i18next";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { WIN_CONDITION_OPTIONS } from "./constants";

const isWinConditionValue = (value: string) =>
  WIN_CONDITION_OPTIONS.some((option) => option.value === value);

export const createFinishGameFormSchema = (t: TFunction) =>
  z.object({
    playerId: z.string().min(1, t("selectPlayer")),
    winCondition: z
      .string()
      .min(1, t("selectOutcome"))
      .refine(isWinConditionValue, t("selectOutcome")),
  });

export const mapSessionPlayersToOptions = (session: SessionWithPlayers) => [
  { id: session.player1_id, name: session.player1_name },
  { id: session.player2_id, name: session.player2_name },
];

