import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { DraftPoolTab } from "../DraftPoolTab/DraftPoolTab";
import type { Card, DraftPick } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";
import { draftPoolCardElementId } from "../DraftPoolTab/constants";

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

vi.mock("../CardPreviewPanel", () => ({
  CardPreviewPanel: ({ card }: { card: Card }) => (
    <div>{card.unit_name}-preview</div>
  ),
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

const makePick = (cardId: string, pickNumber: number): DraftPick => ({
  card_id: cardId,
  player_id: "player-1",
  pick_number: pickNumber,
  timestamp: "2024-01-01T00:00:00Z",
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DraftPoolTab", () => {
  it("opens the inspector immediately when a pool card is clicked", () => {
    const card = makeCard("zeus", "Zeus");
    const pick = makePick("zeus", 1);

    render(
      <DraftPoolTab
        poolCards={[card]}
        picksByCardId={new Map([["zeus", [pick]]])}
        player1Picks={[{ pick, card }]}
        player2Picks={[]}
        player1TotalCost={2}
        player2TotalCost={0}
        player1Id="player-1"
        player1={undefined}
        player2={undefined}
      />
    );

    fireEvent.click(document.getElementById(draftPoolCardElementId("zeus"))!);
    expect(screen.getByRole("dialog", { name: "Zeus" })).toBeTruthy();
    expect(screen.getByText("Zeus-preview")).toBeTruthy();
  });

  it("scrolls to the pool card then opens the inspector from a player name", async () => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    const scrollIntoView = HTMLElement.prototype.scrollIntoView as ReturnType<
      typeof vi.fn
    >;
    const card = makeCard("zeus", "Zeus");
    const pick = makePick("zeus", 1);

    render(
      <DraftPoolTab
        poolCards={[card]}
        picksByCardId={new Map([["zeus", [pick]]])}
        player1Picks={[{ pick, card }]}
        player2Picks={[]}
        player1TotalCost={2}
        player2TotalCost={0}
        player1Id="player-1"
        player1={undefined}
        player2={undefined}
      />
    );

    const railButton = screen
      .getAllByRole("button", { hidden: true })
      .find((button) => button.textContent?.includes("Zeus") && !button.id);
    fireEvent.click(railButton!);

    expect(scrollIntoView).toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Zeus" })).toBeNull();

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Zeus" })).toBeTruthy();
    });
    expect(screen.getByText("pickNumber")).toBeTruthy();
  });
});
