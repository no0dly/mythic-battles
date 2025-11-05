import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CardGalleryItem from "../CardGalleryItem";
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

describe("CardGalleryItem Component", () => {
  it("renders card with all required information", () => {
    const mockHandler = vi.fn();
    render(
      <CardGalleryItem item={mockCardItem} onCardClickHandler={mockHandler} />
    );

    expect(screen.getByText(/Zeus/)).toBeTruthy();
    expect(screen.getByText(/5/)).toBeTruthy(); // Cost is shown
    expect(screen.getByText(CARD_TYPES.GOD)).toBeTruthy(); // Unit type badge
    const image = screen.getByAltText("Zeus");
    expect(image).toBeTruthy();
    expect(image.getAttribute("src")).toContain("/globe.svg");
  });

  it("calls onCardClickHandler when clicked", () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <CardGalleryItem item={mockCardItem} onCardClickHandler={mockHandler} />
    );

    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    fireEvent.click(button!);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
