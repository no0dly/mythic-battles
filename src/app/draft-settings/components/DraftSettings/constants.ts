import { z } from "zod";
import { ALL_VALUE, CARD_ORIGIN, CARD_ORIGIN_FULL_NAME } from "@/types/constants";
import type { CardOrigin, DraftSettings } from "@/types/database.types";

/**
 * Draft settings form values (includes opponentId in addition to draft settings)
 * Uses database format (snake_case)
 */
export type DraftSettingsFormValues = DraftSettings & {
  opponentId: string;
  origins: (CardOrigin | typeof ALL_VALUE)[];
  maps: (string | typeof ALL_VALUE)[];
};

export const ORIGIN_OPTIONS = Object.entries(CARD_ORIGIN_FULL_NAME).map(
  ([value, label]) => ({ value, label })
);

export const getDraftSettingsSchema = (t: (key: string) => string) =>
  z.object({
    opponentId: z.string().min(1, t("requiredField")),
    user_allowed_points: z.number().min(1, t("requiredField")),
    draft_size: z.number().min(1, t("requiredField")),
    gods_amount: z.number().min(2, t("requiredField")),
    titans_amount: z.number().min(0, t("requiredField")),
    troop_attachment_amount: z.number().min(0, t("requiredField")),
    origins: z
      .array(z.union([z.enum(Object.values(CARD_ORIGIN)), z.literal(ALL_VALUE)]))
      .min(1, t("requiredField")),
    maps: z.array(z.string()).min(1, t("requiredField")),
  });
