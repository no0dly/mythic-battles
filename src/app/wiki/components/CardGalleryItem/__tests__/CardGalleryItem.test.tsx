import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CardGalleryItem, { type CardItem } from "../CardGalleryItem";

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
  longDescription: "Full description of Zeus",
};

describe("CardGalleryItem Component", () => {
  it("renders card with all required information", () => {
    const mockHandler = vi.fn();
    render(
      <CardGalleryItem item={mockCardItem} onCardClickHandler={mockHandler} />
    );

    expect(screen.getByText("Zeus")).toBeTruthy();
    expect(screen.getByText("King of the gods")).toBeTruthy();
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
