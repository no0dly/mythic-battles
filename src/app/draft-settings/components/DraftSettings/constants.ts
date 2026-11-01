import { z } from "zod";
import {
  ALL_VALUE,
  CARD_ORIGIN,
  CARD_ORIGIN_FULL_NAME,
  GAME_MODE,
  GAME_MODE_PLAYER_COUNT,
  GAME_MODE_VALUES,
  isPracticePlayerId,
} from "@/types/constants";
import type { CardOrigin, DraftSettings, GameMode } from "@/types/database.types";

/**
 * Draft settings form values (includes opponents in addition to draft settings)
 * Uses database format (snake_case)
 */
export type DraftSettingsFormValues = DraftSettings & {
  mode: GameMode;
  /** 1v1 opponent */
  opponentId: string;
  /**
   * Multiplayer slots, one per player after the creator.
   * 2v2: slot 0 is the creator's teammate, the rest are the other team.
   */
  opponentIds: string[];
  origins: (CardOrigin | typeof ALL_VALUE)[];
  maps: (string | typeof ALL_VALUE)[];
};

export const ORIGIN_OPTIONS = Object.entries(CARD_ORIGIN_FULL_NAME).map(
  ([value, label]) => ({ value, label })
);

export const TEAMMATE_SLOT = 0;

export const getTeammateFromSlots = (mode: GameMode, opponentIds: string[]): string | undefined =>
  mode === GAME_MODE.TEAM_2V2 ? opponentIds[TEAMMATE_SLOT] || undefined : undefined;

export const emptyOpponentSlots = (mode: GameMode): string[] =>
  Array.from({ length: GAME_MODE_PLAYER_COUNT[mode] - 1 }, () => "");

export const isPracticeSelection = (values: Pick<DraftSettingsFormValues, "mode" | "opponentId" | "opponentIds">): boolean =>
  values.mode === GAME_MODE.ONE_VS_ONE
    ? isPracticePlayerId(values.opponentId)
    : isPracticePlayerId(values.opponentIds[0] ?? "");

export const getDraftSettingsSchema = (t: (key: string) => string) =>
  z
    .object({
      mode: z.enum(GAME_MODE_VALUES),
      opponentId: z.string(),
      opponentIds: z.array(z.string()),
      user_allowed_points: z.number().min(1, t("requiredField")),
      draft_size: z.number().min(1, t("requiredField")),
      gods_amount: z.number().min(2, t("requiredField")),
      titans_amount: z.number().min(0, t("requiredField")),
      troop_attachment_amount: z.number().min(0, t("requiredField")),
      origins: z
        .array(z.union([z.enum(Object.values(CARD_ORIGIN)), z.literal(ALL_VALUE)]))
        .min(1, t("requiredField")),
      maps: z.array(z.string()).min(1, t("requiredField")),
    })
    .superRefine((values, ctx) => {
      if (values.mode === GAME_MODE.ONE_VS_ONE) {
        if (!values.opponentId) {
          ctx.addIssue({ code: "custom", path: ["opponentId"], message: t("requiredField") });
        }
        return;
      }

      if (isPracticeSelection(values)) return;

      values.opponentIds.forEach((id, index) => {
        if (!id) {
          ctx.addIssue({ code: "custom", path: ["opponentIds", index], message: t("requiredField") });
        }
      });
    });
