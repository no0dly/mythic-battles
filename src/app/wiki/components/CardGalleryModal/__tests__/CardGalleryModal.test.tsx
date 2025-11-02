import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
    const differentCard: CardItem = {
      id: "ares",
      title: "Ares",
      imageUrl: "/logo.svg",
      shortDescription: "God of war",
      longDescription: "Full description of Ares",
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
    expect(description?.textContent).toBe("Full description of Ares");
    const image = screen.getByAltText("Ares");
    expect(image.getAttribute("src")).toContain("/logo.svg");
  });
});
