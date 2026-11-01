/** Postgres "undefined_column": the multiplayer migration hasn't been applied yet. */
const UNDEFINED_COLUMN = "42703";

/** PostgREST `or` filter matching sessions/drafts where the user is any participant. */
export const participantFilter = (userId: string, legacy = false): string =>
  legacy
    ? `player1_id.eq.${userId},player2_id.eq.${userId}`
    : `player1_id.eq.${userId},player2_id.eq.${userId},player_ids.cs.{${userId}}`;

/**
 * Runs a query that filters on multiplayer columns, retrying with the legacy
 * 1v1 columns when the database doesn't have them yet.
 */
export async function withLegacyColumnFallback<R extends { error: { code?: string } | null }>(
  run: (legacy: boolean) => PromiseLike<R>
): Promise<R> {
  const result = await run(false);
  return result.error?.code === UNDEFINED_COLUMN ? run(true) : result;
}
