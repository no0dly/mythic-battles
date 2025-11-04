import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type TRPCContext = {
  headers: Headers;
  supabase: SupabaseClient<Database>;
  session: {
    user: {
      id: string;
      email?: string;
    };
  } | null;
};

export async function createTRPCContext(opts: { headers: Headers }): Promise<TRPCContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    headers: opts.headers,
    supabase,
    session: user ? { user: { id: user.id, email: user.email } } : null,
  };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware for protected procedures
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);


