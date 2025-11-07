import { router } from "./trpc";
import { cardsRouter } from "./routers/cards";
import { friendshipsRouter } from "./routers/friendships";
import { usersRouter } from "./routers/users";
import { sessionsRouter } from "./routers/sessions";
import { gamesRouter } from "./routers/games";

export const appRouter = router({
  cards: cardsRouter,
  friendships: friendshipsRouter,
  users: usersRouter,
  sessions: sessionsRouter,
  games: gamesRouter,
});

export type AppRouter = typeof appRouter;


