import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { InfoPopup } from "../InfoPopup";
import { FINE_POINTER_QUERY } from "../constants";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === FINE_POINTER_QUERY ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("InfoPopup", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
  });

  describe("on touch / coarse pointers", () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it("opens the popup on click", async () => {
      render(
        <InfoPopup content="Blocker units stop enemy movement.">
          <span>Block</span>
        </InfoPopup>,
      );

      fireEvent.click(screen.getByText("Block"));

      expect(
        await screen.findByText("Blocker units stop enemy movement."),
      ).toBeTruthy();
    });

    it("closes the popup when pressing outside", async () => {
      render(
        <div>
          <InfoPopup content="Blocker units stop enemy movement.">
            <span>Block</span>
          </InfoPopup>
          <button type="button">Outside</button>
        </div>,
      );

      fireEvent.click(screen.getByText("Block"));
      expect(
        await screen.findByText("Blocker units stop enemy movement."),
      ).toBeTruthy();

      fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));

      await waitFor(() => {
        expect(screen.queryByText("Blocker units stop enemy movement.")).toBeNull();
      });
    });
  });

  describe("on fine pointers", () => {
    beforeEach(() => {
      mockMatchMedia(true);
    });

    it("uses a hover tooltip instead of a click popover", async () => {
      render(
        <InfoPopup content="Blocker units stop enemy movement.">
          <span>Block</span>
        </InfoPopup>,
      );

      await waitFor(() => {
        expect(screen.getByText("Block").getAttribute("aria-haspopup")).toBeNull();
      });
    });
  });
});
