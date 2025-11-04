import { router } from "./trpc";
import { exampleRouter } from "./routers/example";
import { cardsRouter } from "./routers/cards";
import { friendshipsRouter } from "./routers/friendships";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  example: exampleRouter,
  cards: cardsRouter,
  friendships: friendshipsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;


