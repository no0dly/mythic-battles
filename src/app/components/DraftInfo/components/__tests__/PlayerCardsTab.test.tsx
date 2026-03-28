import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PlayerCardsTab } from "../PlayerCardsTab";
import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const makeCard = (id: string, cost: number): Card => ({
  id,
  unit_name: `Card ${id}`,
  unit_type: CARD_TYPES.TROOP,
  cost,
  amount_of_card_activations: 1,
  strategic_value: 1,
  talents: [],
  class: [],
  origin: null,
  extra: null,
  image_url: "/test.svg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
});

afterEach(cleanup);

describe("PlayerCardsTab", () => {
  it("shows card cost with no strikethrough when no override", () => {
    const card = makeCard("card-1", 3);
    render(
      <PlayerCardsTab
        user={undefined}
        playerCards={[card]}
        totalCost={3}
        costOverrides={new Map()}
        fallbackName="Player 1"
        borderColor="blue"
        onCardClick={vi.fn()}
      />
    );

    // No strikethrough elements should exist
    expect(screen.queryAllByText(/\(\d+\)/)).toHaveLength(0);
  });

  it("shows adjusted cost with strikethrough original when override exists", () => {
    const card = makeCard("card-1", 3);
    const overrides = new Map([["card-1", 1]]);

    render(
      <PlayerCardsTab
        user={undefined}
        playerCards={[card]}
        totalCost={1}
        costOverrides={overrides}
        fallbackName="Player 1"
        borderColor="blue"
        onCardClick={vi.fn()}
      />
    );

    // Strikethrough element shows original cost in parens
    const strikethrough = screen.getByText("(3)");
    expect(strikethrough.className).toContain("line-through");
  });

  it("only applies strikethrough to cards that have a cost override", () => {
    const card1 = makeCard("card-1", 3);
    const card2 = makeCard("card-2", 2);
    const overrides = new Map([["card-1", 1]]);

    render(
      <PlayerCardsTab
        user={undefined}
        playerCards={[card1, card2]}
        totalCost={3}
        costOverrides={overrides}
        fallbackName="Player 1"
        borderColor="blue"
        onCardClick={vi.fn()}
      />
    );

    // Only card-1 has a strikethrough
    const strikethroughs = screen.getAllByText(/\(\d+\)/);
    expect(strikethroughs).toHaveLength(1);
    expect(strikethroughs[0].textContent).toBe("(3)");
    expect(strikethroughs[0].className).toContain("line-through");
  });

  it("renders card name and type for each picked card", () => {
    const card = makeCard("card-1", 2);
    render(
      <PlayerCardsTab
        user={undefined}
        playerCards={[card]}
        totalCost={2}
        costOverrides={new Map()}
        fallbackName="Player 1"
        borderColor="blue"
        onCardClick={vi.fn()}
      />
    );

    expect(screen.getByText("Card card-1")).toBeTruthy();
  });
});
