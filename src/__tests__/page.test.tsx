import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home Page", () => {
  it("should render the page", () => {
    render(<Home />);
    const textElements = screen.getAllByText("Hello World");
    expect(textElements.length).toBeGreaterThan(0);
  });

  it("should have the correct heading", () => {
    render(<Home />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0].textContent).toBe("Hello World");
  });
});
