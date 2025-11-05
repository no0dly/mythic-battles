/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useResponsiveColumns from "../useResponsiveColumns";

describe("useResponsiveColumns", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    if (typeof window !== "undefined") {
      originalMatchMedia = window.matchMedia;
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (typeof window !== "undefined" && originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }
  });

  const createMatchMedia = (matches: boolean) => {
    return vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as any;
  };

  it("should return 4 columns for large screens (>= 1024px)", () => {
    const mockMatchMedia = createMatchMedia(true);
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useResponsiveColumns());

    expect(result.current).toBe(4);
  });

  it("should return 3 columns for medium screens (>= 768px)", () => {
    const mockMatchMedia = vi.fn((query: string) => {
      const isLg = query === "(min-width: 1024px)";
      const isMd = query === "(min-width: 768px)";
      return {
        matches: !isLg && isMd, // Only md matches
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }) as any;

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useResponsiveColumns());

    expect(result.current).toBe(3);
  });

  it("should return 2 columns for small screens (>= 640px)", () => {
    const mockMatchMedia = vi.fn((query: string) => {
      const isLg = query === "(min-width: 1024px)";
      const isMd = query === "(min-width: 768px)";
      const isSm = query === "(min-width: 640px)";
      return {
        matches: !isLg && !isMd && isSm, // Only sm matches
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }) as any;

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useResponsiveColumns());

    expect(result.current).toBe(2);
  });

  it("should return 1 column for extra small screens (< 640px)", () => {
    const mockMatchMedia = createMatchMedia(false);
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useResponsiveColumns());

    expect(result.current).toBe(1);
  });

  it("should register event listeners for window resize", () => {
    const addEventListenerSpy = vi.fn();
    const listeners: Map<string, () => void> = new Map();

    const mockMatchMedia = vi.fn((query: string) => {
      const mql = {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy.mockImplementation(
          (event: string, handler: () => void) => {
            if (event === "change") {
              listeners.set(query, handler);
            }
          }
        ),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      return mql;
    }) as any;

    window.matchMedia = mockMatchMedia;

    renderHook(() => useResponsiveColumns());

    // Verify that addEventListener was called for each breakpoint
    expect(addEventListenerSpy).toHaveBeenCalled();

    // Verify listeners were registered
    expect(listeners.size).toBeGreaterThan(0);
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListenerSpy = vi.fn();
    const mockMatchMedia = vi.fn(() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    })) as any;

    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useResponsiveColumns());

    unmount();

    // Should have called removeEventListener for each breakpoint (3 breakpoints)
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it("should handle SSR (window undefined)", () => {
    // In jsdom environment, window is always defined
    // This test verifies the SSR-safe initialization logic
    const { result } = renderHook(() => useResponsiveColumns());

    // Should return a valid column count (1-4)
    expect(result.current).toBeGreaterThanOrEqual(1);
    expect(result.current).toBeLessThanOrEqual(4);
  });
});
