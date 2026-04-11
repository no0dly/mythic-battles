import { router } from "./trpc";
import { cardsRouter } from "./routers/cards";
import { friendshipsRouter } from "./routers/friendships";
import { usersRouter } from "./routers/users";
import { sessionsRouter } from "./routers/sessions";
import { gamesRouter } from "./routers/games";
import { draftsRouter } from "./routers/drafts";
import { gameInvitationsRouter } from "./routers/game-invitations";
import { mapsRouter } from "./routers/maps";
import { draftResetRequestsRouter } from "./routers/draft-reset-requests";
import { draftReadyChecksRouter } from "./routers/draft-ready-checks";

export const appRouter = router({
  cards: cardsRouter,
  friendships: friendshipsRouter,
  users: usersRouter,
  sessions: sessionsRouter,
  games: gamesRouter,
  drafts: draftsRouter,
  gameInvitations: gameInvitationsRouter,
  maps: mapsRouter,
  draftResetRequests: draftResetRequestsRouter,
  draftReadyChecks: draftReadyChecksRouter,
});

export type AppRouter = typeof appRouter;


