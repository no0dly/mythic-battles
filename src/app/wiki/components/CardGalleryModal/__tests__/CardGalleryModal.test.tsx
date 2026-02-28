import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CardGalleryModal from "../CardGalleryModal";
import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params) {
        const value = Object.values(params).join(" ");
        return `${key} ${value}`.trim();
      }
      return key;
    },
  }),
}));

const mockCard: Card = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  unit_name: "Zeus",
  unit_type: CARD_TYPES.GOD,
  cost: 5,
  amount_of_card_activations: 1,
  strategic_value: 10,
  talents: [],
  class: ["terrestrial"],
  origin: null,
  image_url: "/globe.svg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("CardGalleryModal Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders modal with card information when selected", () => {
    const mockCloseHandler = vi.fn();
    render(
      <CardGalleryModal
        isShown
        card={mockCard}
        onCloseModal={mockCloseHandler}
      />
    );

    const modal = screen.getByTestId("card-modal");
    expect(modal).toBeTruthy();

    const title = screen.getByRole("heading", { name: "Zeus" });
    expect(title).toBeTruthy();

    const typeRow = screen.getByText(/type:/i).parentElement;
    const classRow = screen.getByText(/class:/i).parentElement;
    const costRow = screen.getByText(/cost:/i).parentElement;

    expect(typeRow?.textContent).toMatch(/god/i);
    expect(classRow?.textContent).toMatch(/terrestrial/i);
    expect(costRow?.textContent).toMatch(/5/i);

    const image = screen.getByAltText("Zeus");
    expect(image).toBeTruthy();
    expect(image.getAttribute("src")).toContain("/globe.svg");
  });

  it("updates modal content when selected changes", () => {
    const mockCloseHandler = vi.fn();
    const differentCard: Card = {
      id: "550e8400-e29b-41d4-a716-446655440002",
      unit_name: "Ares",
      unit_type: CARD_TYPES.GOD,
      cost: 4,
      amount_of_card_activations: 1,
      strategic_value: 9,
      talents: [],
      class: ["terrestrial"],
      origin: null,
      image_url: "/logo.svg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    render(
      <CardGalleryModal
        isShown
        card={mockCard}
        onCloseModal={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Zeus" })).toBeTruthy();

    cleanup();

    render(
      <CardGalleryModal
        isShown
        card={differentCard}
        onCloseModal={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Ares" })).toBeTruthy();
    const updatedCostRow = screen.getByText(/cost:/i).parentElement;
    const strategicRow = screen.getByText(/strategicValue:/i).parentElement;

    expect(updatedCostRow?.textContent).toMatch(/4/);
    expect(strategicRow?.textContent).toMatch(/9/);
    const image = screen.getByAltText("Ares");
    expect(image.getAttribute("src")).toContain("/logo.svg");
  });

  it("renders modal with troop_attachment card type", () => {
    const mockCloseHandler = vi.fn();
    const troopAttachmentCard: Card = {
      id: "550e8400-e29b-41d4-a716-446655440003",
      unit_name: "Spartan Shield",
      unit_type: CARD_TYPES.TROOP_ATTACHMENT,
      cost: 2,
      amount_of_card_activations: 1,
      strategic_value: 5,
      talents: [],
      class: [],
      origin: null,
      image_url: "/shield.svg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    render(
      <CardGalleryModal
        isShown
        card={troopAttachmentCard}
        onCloseModal={mockCloseHandler}
      />
    );

    const modal = screen.getByTestId("card-modal");
    expect(modal).toBeTruthy();

    const title = screen.getByRole("heading", { name: "Spartan Shield" });
    expect(title).toBeTruthy();

    const typeRow = screen.getByText(/type:/i).parentElement;
    expect(typeRow?.textContent).toMatch(/troop_attachment/i);

    const costRow = screen.getByText(/cost:/i).parentElement;
    expect(costRow?.textContent).toMatch(/2/i);
  });
});
