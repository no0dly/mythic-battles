import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CardGalleryModal from "../CardGalleryModal";
import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/database.types";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockCardItem: Card = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  unit_name: "Zeus",
  unit_type: CARD_TYPES.GOD,
  cost: 5,
  amount_of_card_activations: 1,
  strategic_value: 10,
  talents: [],
  class: "god",
  image_url: "/globe.svg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("CardGalleryModal Component", () => {

  it("renders modal with card information when selected", () => {
    const mockCloseHandler = vi.fn();
    render(
      <CardGalleryModal
        selected={mockCardItem}
        onCloseAction={mockCloseHandler}
      />
    );

    const modal = screen.getByTestId("card-modal");
    expect(modal).toBeTruthy();

    const title = screen.getByRole("heading", { name: "Zeus" });
    expect(title).toBeTruthy();

    const description = modal.querySelector('[data-slot="dialog-description"]');
    expect(description).toBeTruthy();
    expect(description?.textContent).toContain("Type:");
    expect(description?.textContent).toContain("god");
    expect(description?.textContent).toContain("Cost:");
    expect(description?.textContent).toContain("5");

    const image = screen.getByAltText("Zeus");
    expect(image).toBeTruthy();
    expect(image.getAttribute("src")).toContain("/globe.svg");
  });

  it("does not render modal when selected is null", () => {
    const mockCloseHandler = vi.fn();
    const { container } = render(
      <CardGalleryModal selected={null} onCloseAction={mockCloseHandler} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("component returns null when selected is null after rerender", () => {
    const mockCloseHandler = vi.fn();

    const { rerender, container } = render(
      <CardGalleryModal
        selected={mockCardItem}
        onCloseAction={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Zeus" })).toBeTruthy();

    // Simulate closing by setting selected to null
    rerender(
      <CardGalleryModal selected={null} onCloseAction={mockCloseHandler} />
    );

    expect(container.firstChild).toBeNull();
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
      class: "god",
      image_url: "/logo.svg",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    render(
      <CardGalleryModal
        selected={mockCardItem}
        onCloseAction={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Zeus" })).toBeTruthy();

    cleanup();

    render(
      <CardGalleryModal
        selected={differentCard}
        onCloseAction={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Ares" })).toBeTruthy();
    const modal = screen.getByTestId("card-modal");
    const description = modal.querySelector(
      '[data-slot="dialog-description"]'
    );
    expect(description?.textContent).toContain("Cost:");
    expect(description?.textContent).toContain("4");
    expect(description?.textContent).toContain("Strategic Value:");
    expect(description?.textContent).toContain("9");
    const image = screen.getByAltText("Ares");
    expect(image.getAttribute("src")).toContain("/logo.svg");
  });
});
