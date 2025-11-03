import { z } from "zod";

export type FormValues = {
  email: string;
};

export const getFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .email({ message: t("emailInvalid") })
      .min(1, t("emailRequired")),
  });