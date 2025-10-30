import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";
import { headers } from "next/headers";

export async function getServerApi() {
  const h = headers();
  const ctx = await createTRPCContext({ headers: h as unknown as Headers });
  return appRouter.createCaller(ctx);
}


