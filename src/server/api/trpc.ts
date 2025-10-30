import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export type TRPCContext = {
  headers: Headers;
};

export async function createTRPCContext(opts: { headers: Headers }): Promise<TRPCContext> {
  return {
    headers: opts.headers,
  };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;


