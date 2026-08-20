import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { applyMatchStatistics } from "../helpers";
import { SOLO_PRACTICE_PLAYER_ID } from "@/types/constants";
import type { Statistics } from "@/types/database.types";

const WINNER_ID = "00000000-0000-0000-0000-000000000011";
const LOSER_ID = "00000000-0000-0000-0000-000000000022";

const defaultStats: Statistics = {
  wins: 2,
  losses: 1,
  total_games: 3,
  longest_win_streak: 2,
  longest_loss_streak: 1,
};

type StatsByUser = Record<string, Statistics>;

const createUsersClient = (
  statsByUser: StatsByUser,
  options?: { failUpdateFor?: string }
) => {
  const updatedUserIds: string[] = [];
  const updatedPayloads: Record<string, Statistics> = {};

  const from = vi.fn((table: string) => {
    expect(table).toBe("users");

    return {
      select: vi.fn(() => ({
        eq: vi.fn((_column: string, userId: string) => ({
          single: vi.fn(async () => {
            const statistics = statsByUser[userId];
            if (!statistics) {
              return { data: null, error: { code: "PGRST116" } };
            }
            return { data: { statistics }, error: null };
          }),
        })),
      })),
      update: vi.fn((payload: { statistics: Statistics }) => ({
        eq: vi.fn((_column: string, userId: string) => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => {
              if (options?.failUpdateFor === userId) {
                return { data: null, error: null };
              }
              updatedUserIds.push(userId);
              updatedPayloads[userId] = payload.statistics;
              return { data: { id: userId }, error: null };
            }),
          })),
        })),
      })),
    };
  });

  return { from, updatedUserIds, updatedPayloads };
};

describe("applyMatchStatistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates both winner and loser statistics", async () => {
    const client = createUsersClient({
      [WINNER_ID]: defaultStats,
      [LOSER_ID]: defaultStats,
    });

    await applyMatchStatistics(client as never, WINNER_ID, LOSER_ID);

    expect(client.updatedUserIds).toEqual([WINNER_ID, LOSER_ID]);
    expect(client.updatedPayloads[WINNER_ID]).toMatchObject({
      wins: 3,
      losses: 1,
      total_games: 4,
    });
    expect(client.updatedPayloads[LOSER_ID]).toMatchObject({
      wins: 2,
      losses: 2,
      total_games: 4,
    });
  });

  it("skips the practice dummy loser", async () => {
    const client = createUsersClient({
      [WINNER_ID]: defaultStats,
    });

    await applyMatchStatistics(
      client as never,
      WINNER_ID,
      SOLO_PRACTICE_PLAYER_ID
    );

    expect(client.updatedUserIds).toEqual([WINNER_ID]);
  });

  it("throws when the opponent update returns no row", async () => {
    const client = createUsersClient(
      {
        [WINNER_ID]: defaultStats,
        [LOSER_ID]: defaultStats,
      },
      { failUpdateFor: LOSER_ID }
    );

    await expect(
      applyMatchStatistics(client as never, WINNER_ID, LOSER_ID)
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update loser statistics",
    } satisfies Partial<TRPCError>);
  });
});
