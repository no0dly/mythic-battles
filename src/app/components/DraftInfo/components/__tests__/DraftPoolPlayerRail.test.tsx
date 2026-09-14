import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DraftPoolPlayerRail } from "../DraftPoolTab/DraftPoolPlayerRail";
import type { Card, DraftPick } from "@/types/database.types";
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

const makeCard = (id: string, name: string): Card => ({
  id,
  unit_name: name,
  unit_type: CARD_TYPES.HERO,
  cost: 2,
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

const makePick = (cardId: string, pickNumber: number, auto = false): DraftPick => ({
  card_id: cardId,
  player_id: "player-1",
  pick_number: pickNumber,
  timestamp: "2024-01-01T00:00:00Z",
  auto,
});

afterEach(cleanup);

describe("DraftPoolPlayerRail", () => {
  it("renders clickable unit names and reports pick number on click", () => {
    const onPickClick = vi.fn();
    const card = makeCard("zeus", "Zeus");

    render(
      <DraftPoolPlayerRail
        user={undefined}
        fallbackName="Player 1"
        picks={[{ pick: makePick("zeus", 3), card }]}
        totalCost={2}
        accent="blue"
        activeCardId={null}
        activePickNumber={null}
        onPickClick={onPickClick}
      />
    );

    expect(screen.getByText("Zeus")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Zeus/, hidden: true }));
    expect(onPickClick).toHaveBeenCalledWith("zeus", 3);
  });

  it("marks auto companion picks", () => {
    const card = makeCard("companion", "Companion");

    render(
      <DraftPoolPlayerRail
        user={undefined}
        fallbackName="Player 1"
        picks={[{ pick: makePick("companion", 2, true), card }]}
        totalCost={0}
        accent="green"
        activeCardId={null}
        activePickNumber={null}
        onPickClick={vi.fn()}
      />
    );

    expect(screen.getByText("autoPick")).toBeTruthy();
  });
});
