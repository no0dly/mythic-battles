import type { z } from "zod";
import type { createFinishGameFormSchema } from "./utils";

export type FinishGameFormValues = z.infer<
  ReturnType<typeof createFinishGameFormSchema>
>;

