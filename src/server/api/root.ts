import { router } from "./trpc";
import { cardsRouter } from "./routers/cards";
import { friendshipsRouter } from "./routers/friendships";
import { usersRouter } from "./routers/users";
import { sessionsRouter } from "./routers/sessions";
import { gamesRouter } from "./routers/games";
import { draftsRouter } from "./routers/drafts";
import { gameInvitationsRouter } from "./routers/game-invitations";
import { mapsRouter } from "./routers/maps";

export const appRouter = router({
  cards: cardsRouter,
  friendships: friendshipsRouter,
  users: usersRouter,
  sessions: sessionsRouter,
  games: gamesRouter,
  drafts: draftsRouter,
  gameInvitations: gameInvitationsRouter,
  maps: mapsRouter,
});

export type AppRouter = typeof appRouter;


