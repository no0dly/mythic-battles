import { z } from "zod";

export type LoginFormValues = {
  email: string;
  password: string;
};

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
