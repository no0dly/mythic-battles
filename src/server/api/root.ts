import { router } from "./trpc";
import { exampleRouter } from "./routers/example";
import { cardsRouter } from "./routers/cards";

export const appRouter = router({
  example: exampleRouter,
  cards: cardsRouter,
});

export type AppRouter = typeof appRouter;


