import { z } from "zod";

export type DraftSettingsFormValues = {
  opponentId: string;
  userAllowedPoints: number;
  draftCount: number;
};

export const DRAFT_COUNT_OPTIONS = [20, 30, 40, 50, 60] as const;
export const USER_ALLOWED_POINTS_OPTIONS = [18] as const;
export const getDraftSettingsSchema = (t: (key: string) => string) =>
  z.object({
    opponentId: z.string().min(1, t("requiredField")),
    userAllowedPoints: z.number().min(1),
    draftCount: z.number().min(1),
  });

