import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CardGallery from "../CardGallery";

import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/database.types";

// Mock tRPC
const mockCards: Card[] = [
  {
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
  },
  {
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
  },
];

const mockUseQuery = vi.fn();

vi.mock("@/trpc/client", () => ({
  api: {
    cards: {
      list: {
        useQuery: () => mockUseQuery(),
      },
    },
  },
}));

// Mock Loader
vi.mock("@/components/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

// Mock CardGalleryFilter
vi.mock("../CardGalleryFilter", () => ({
  default: () => <div data-testid="card-filter">Filter</div>,
}));

// Mock CardGalleryItem
vi.mock("../CardGalleryItem", () => ({
  default: ({
    item,
    onCardClickHandler,
  }: {
    item: (typeof mockCards)[0];
    onCardClickHandler: () => void;
  }) => (
    <button onClick={onCardClickHandler}>
      <div data-testid="card-item">{item.unit_name}</div>
    </button>
  ),
}));

describe("CardGallery Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default non-loading state
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  const renderWithProvider = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
      },
    });
    // Clear any cached queries
    queryClient.clear();
    return render(
      <QueryClientProvider client={queryClient}>
        <CardGallery />
      </QueryClientProvider>
    );
  };

  it("renders loading state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = renderWithProvider();

    expect(container.querySelector('[data-testid="loader"]')).toBeTruthy();
  });

  it("renders error state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
    });

    const { container } = renderWithProvider();

    expect(container.textContent).toMatch(/Failed to load cards/i);
  });

  it("renders cards when data is loaded", () => {
    mockUseQuery.mockReturnValue({
      data: mockCards,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithProvider();

    expect(container.querySelector('[data-testid="card-item"]')).toBeTruthy();
    expect(container.textContent).toContain("Zeus");
    expect(container.textContent).toContain("Ares");
  });

  it("renders empty state when no cards", async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { container } = renderWithProvider();

    // Wait for loader to disappear if it was showing initially
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loader"]')).toBeNull();
    });

    // Should render without cards but no error or loader
    // Note: Loader only shows when isLoading is true
    expect(container.querySelector('[data-testid="loader"]')).toBeNull();
    expect(container.textContent).not.toMatch(/Failed to load cards/i);
    // Should not have any cards rendered
    expect(container.querySelector('[data-testid="card-item"]')).toBeNull();
  });
});
