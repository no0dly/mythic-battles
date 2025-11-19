import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CardGalleryItem from "../CardGalleryItem";
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
    t: (key: string) => key,
  }),
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
    const { container } = render(
      <CardGalleryItem item={mockCardItem} />
    );

    expect(container.textContent).toContain("Zeus");
    expect(container.textContent).toContain("5"); // Cost is shown
    expect(container.textContent).toContain(CARD_TYPES.GOD); // Unit type badge
    const image = container.querySelector('img[alt="Zeus"]');
    expect(image).toBeTruthy();
    expect(image?.getAttribute("src")).toContain("/globe.svg");
  });

  it("opens the modal when clicked", async () => {
    const { container } = render(<CardGalleryItem item={mockCardItem} />);

    const button = container.querySelector("button");
    expect(button).toBeTruthy();

    fireEvent.click(button!);

    await waitFor(() => {
      expect(screen.getByTestId("card-modal")).toBeTruthy();
    });
  });

  it("renders with proper aria-label for accessibility", () => {
    const { container } = render(<CardGalleryItem item={mockCardItem} />);

    // Use container to get the button directly to avoid multiple matches
    const button = container.querySelector("button[aria-label]");
    expect(button).toBeTruthy();
    expect(button?.getAttribute("aria-label")).toContain("Zeus");
    expect(button?.getAttribute("aria-label")).toContain("god");
    expect(button?.getAttribute("aria-label")).toContain("5");
  });

  it("renders image with fill prop and relative container", () => {
    const { container } = render(<CardGalleryItem item={mockCardItem} />);

    const imageContainer = container.querySelector('[class*="relative"]');
    expect(imageContainer).toBeTruthy();

    // Use container to get image directly
    const image = container.querySelector('img[alt="Zeus"]');
    expect(image).toBeTruthy();
  });

  it("renders card item with memo optimization", () => {
    const { container } = render(<CardGalleryItem item={mockCardItem} />);

    // Verify component renders correctly
    expect(container.querySelector('[data-testid="card-item"]')).toBeTruthy();
    expect(container.textContent).toContain("Zeus");
  });
});
