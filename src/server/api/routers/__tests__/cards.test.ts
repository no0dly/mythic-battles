import { describe, it, expect } from "vitest";
import { createTRPCContext } from "../../trpc";
import { cardsRouter } from "../cards";

describe("cards router", () => {
  it("returns list of cards", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = cardsRouter.createCaller(ctx);

    const result = await caller.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns cards with correct structure", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = cardsRouter.createCaller(ctx);

    const result = await caller.list();

    result.forEach((card) => {
      expect(card).toHaveProperty("id");
      expect(card).toHaveProperty("title");
      expect(card).toHaveProperty("imageUrl");
      expect(card).toHaveProperty("shortDescription");
      expect(card).toHaveProperty("longDescription");
      expect(typeof card.id).toBe("string");
      expect(typeof card.title).toBe("string");
      expect(typeof card.imageUrl).toBe("string");
      expect(typeof card.shortDescription).toBe("string");
      expect(typeof card.longDescription).toBe("string");
    });
  });

  it("includes Zeus card in results", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = cardsRouter.createCaller(ctx);

    const result = await caller.list();

    const zeusCard = result.find((card) => card.id === "zeus");
    expect(zeusCard).toBeDefined();
    expect(zeusCard?.title).toBe("Zeus");
  });

  it("includes Ares card in results", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = cardsRouter.createCaller(ctx);

    const result = await caller.list();

    const aresCard = result.find((card) => card.id === "ares");
    expect(aresCard).toBeDefined();
    expect(aresCard?.title).toBe("Ares");
  });

  it("includes Athena card in results", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = cardsRouter.createCaller(ctx);

    const result = await caller.list();

    const athenaCard = result.find((card) => card.id === "athena");
    expect(athenaCard).toBeDefined();
    expect(athenaCard?.title).toBe("Athena");
  });
});

