import { z } from "zod";

export const INVITE_MODE = {
  NAME: "name",
  EMAIL: "email",
} as const;

export type InviteMode = (typeof INVITE_MODE)[keyof typeof INVITE_MODE];

export type EmailFormValues = {
  email: string;
};

export const getEmailFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.pipe(
      z.string().min(1, t("emailRequired")),
      z.email({ message: t("emailInvalid") })
    ),
  });
