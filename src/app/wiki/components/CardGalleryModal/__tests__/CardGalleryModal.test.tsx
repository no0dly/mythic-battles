import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CardGalleryModal from "../CardGalleryModal";
import type { CardItem } from "../../CardGalleryItem";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockCardItem: CardItem = {
  id: "zeus",
  title: "Zeus",
  imageUrl: "/globe.svg",
  shortDescription: "King of the gods",
  longDescription: "Full description of Zeus with all details",
};

describe("CardGalleryModal Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
    expect(description?.textContent).toBe(
      "Full description of Zeus with all details"
    );

    const image = screen.getByAltText("Zeus");
    expect(image).toBeTruthy();
    expect(image.getAttribute("src")).toContain("/globe.svg");
  });

  it("does not render modal when selected is null", () => {
    const mockCloseHandler = vi.fn();
    render(
      <CardGalleryModal selected={null} onCloseAction={mockCloseHandler} />
    );

    expect(screen.queryByTestId("card-modal")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Zeus" })).toBeNull();
  });

  it("calls onCloseAction when dialog open state changes to false", async () => {
    const mockCloseHandler = vi.fn();

    const { rerender } = render(
      <CardGalleryModal
        selected={mockCardItem}
        onCloseAction={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Zeus" })).toBeTruthy();

    // Simulate closing the dialog by setting selected to null
    rerender(
      <CardGalleryModal selected={null} onCloseAction={mockCloseHandler} />
    );

    vi.advanceTimersByTime(400);

    await waitFor(
      () => {
        expect(mockCloseHandler).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it("updates modal content when selected changes", async () => {
    const mockCloseHandler = vi.fn();
    const differentCard: CardItem = {
      id: "ares",
      title: "Ares",
      imageUrl: "/logo.svg",
      shortDescription: "God of war",
      longDescription: "Full description of Ares",
    };

    const { rerender } = render(
      <CardGalleryModal
        selected={mockCardItem}
        onCloseAction={mockCloseHandler}
      />
    );

    expect(screen.getByRole("heading", { name: "Zeus" })).toBeTruthy();

    rerender(
      <CardGalleryModal
        selected={differentCard}
        onCloseAction={mockCloseHandler}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ares" })).toBeTruthy();
      expect(screen.queryByRole("heading", { name: "Zeus" })).toBeNull();
      const modal = screen.getByTestId("card-modal");
      const description = modal.querySelector(
        '[data-slot="dialog-description"]'
      );
      expect(description?.textContent).toBe("Full description of Ares");
      const image = screen.getByAltText("Ares");
      expect(image.getAttribute("src")).toContain("/logo.svg");
    });
  });
});
