/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { cardsRouter } from "../cards";
import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";
import { TRPCError } from "@trpc/server";

const TEST_CARD_UUID = "550e8400-e29b-41d4-a716-446655440001";

const mockCards: Card[] = [
  {
    id: TEST_CARD_UUID,
    unit_name: "Zeus",
    unit_type: CARD_TYPES.GOD,
    cost: 5,
    amount_of_card_activations: 1,
    strategic_value: 10,
    talents: [],
    class: "god",
    image_url: "/zeus.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    unit_name: "Ares",
    unit_type: CARD_TYPES.GOD,
    cost: 4,
    amount_of_card_activations: 1,
    strategic_value: 9,
    talents: [],
    class: "god",
    image_url: "/ares.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    unit_name: "Athena",
    unit_type: CARD_TYPES.HERO,
    cost: 5,
    amount_of_card_activations: 1,
    strategic_value: 8,
    talents: [],
    class: "hero",
    image_url: "/athena.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const createMockContext = (overrides = {}) => ({
  headers: new Headers(),
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: mockCards,
          error: null,
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockCards[0],
            error: null,
          })),
        })),
      })),
    })),
  },
  session: null,
  ...overrides,
});

describe("cardsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return list of cards", async () => {
      const ctx = createMockContext() as any;
      const caller = cardsRouter.createCaller(ctx);

      const result = await caller.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it("should return cards with correct structure", async () => {
      const ctx = createMockContext() as any;
      const caller = cardsRouter.createCaller(ctx);

      const result = await caller.list();

      result.forEach((card) => {
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("unit_name");
        expect(card).toHaveProperty("unit_type");
        expect(card).toHaveProperty("cost");
        expect(card).toHaveProperty("amount_of_card_activations");
        expect(card).toHaveProperty("strategic_value");
        expect(card).toHaveProperty("talents");
        expect(card).toHaveProperty("class");
        expect(card).toHaveProperty("image_url");
        expect(card).toHaveProperty("created_at");
        expect(card).toHaveProperty("updated_at");
        expect(typeof card.id).toBe("string");
        expect(typeof card.unit_name).toBe("string");
        expect(typeof card.unit_type).toBe("string");
        expect(typeof card.cost).toBe("number");
      });
    });

    it("should call supabase.from with 'cards' table", async () => {
      const ctx = createMockContext() as any;
      const caller = cardsRouter.createCaller(ctx);

      await caller.list();

      expect(ctx.supabase.from).toHaveBeenCalledWith("cards");
    });

    it("should order cards by unit_name ascending", async () => {
      const mockOrder = vi.fn(() => ({
        data: mockCards,
        error: null,
      }));
      const mockSelect = vi.fn(() => ({
        order: mockOrder,
      }));
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: mockSelect,
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      await caller.list();

      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("unit_name", { ascending: true });
    });

    it("should return empty array when no cards exist", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      const result = await caller.list();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should throw error when database query fails", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => ({
                data: null,
                error: { message: "Database error" },
              })),
            })),
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      await expect(caller.list()).rejects.toThrow(TRPCError);
      await expect(caller.list()).rejects.toThrow("Failed to fetch cards");
    });

    it("should handle null data by returning empty array", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      const result = await caller.list();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return card by ID", async () => {
      const ctx = createMockContext() as any;
      const caller = cardsRouter.createCaller(ctx);

      const result = await caller.getById({ id: TEST_CARD_UUID });

      expect(result).toBeDefined();
      expect(result.id).toBe(TEST_CARD_UUID);
      expect(result.unit_name).toBe("Zeus");
    });

    it("should call supabase.from with 'cards' table", async () => {
      const ctx = createMockContext() as any;
      const caller = cardsRouter.createCaller(ctx);

      await caller.getById({ id: TEST_CARD_UUID });

      expect(ctx.supabase.from).toHaveBeenCalledWith("cards");
    });

    it("should query with correct ID", async () => {
      const mockSingle = vi.fn(() => ({
        data: mockCards[0],
        error: null,
      }));
      const mockEq = vi.fn(() => ({
        single: mockSingle,
      }));
      const mockSelect = vi.fn(() => ({
        eq: mockEq,
      }));
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: mockSelect,
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      await caller.getById({ id: TEST_CARD_UUID });

      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", TEST_CARD_UUID);
      expect(mockSingle).toHaveBeenCalled();
    });

    it("should throw error when card not found", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440999";
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: null,
                  error: { message: "Not found" },
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      await expect(
        caller.getById({ id: nonExistentId })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.getById({ id: nonExistentId })
      ).rejects.toThrow("Card not found");
    });

    it("should throw error when data is null", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: null,
                  error: null,
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = cardsRouter.createCaller(ctx);

      await expect(
        caller.getById({ id: TEST_CARD_UUID })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.getById({ id: TEST_CARD_UUID })
      ).rejects.toThrow("Card not found");
    });

    it("should validate UUID format", async () => {
      const ctx = createMockContext() as any;
      const caller = cardsRouter.createCaller(ctx);

      // This should fail validation due to zod schema
      await expect(
        caller.getById({ id: "invalid-uuid" })
      ).rejects.toThrow();
    });
  });
});

