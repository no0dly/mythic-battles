import { z } from "zod";

export type ForgotPasswordFormValues = {
  email: string;
};

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});
