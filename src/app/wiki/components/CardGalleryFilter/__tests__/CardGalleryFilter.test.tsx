/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CardGalleryFilter from "../CardGalleryFilter";
import { MAPS_FILTER_VALUE } from "@/app/wiki/components/CardGallery/utils";

// ---------------------------------------------------------------------------
// Mock the hook — component test only verifies rendering and wiring
// ---------------------------------------------------------------------------
const mockHook = {
  mapsSelected: false,
  hasActiveFilters: false,
  onInputChangeHandler: vi.fn(),
  typeOptions: [
    { value: "hero", label: "Hero" },
    { value: "maps", label: "Maps" },
  ],
  costOptions: [
    { value: "3", label: "3" },
    { value: "5", label: "5" },
  ],
  mapTypeOptions: [{ value: "ruins", label: "Ruins" }],
  multiSelectTypeValue: [] as string[],
  multiSelectCostValue: [] as string[],
  multiSelectMapTypeValue: [] as string[],
  handleTypeChange: vi.fn(),
  handleCostChange: vi.fn(),
  handleMapTypeChange: vi.fn(),
  clearFilters: vi.fn(),
};

vi.mock("../hooks/useCardGalleryFilter", () => ({
  useCardGalleryFilter: () => mockHook,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, ...props }: any) => <input onChange={onChange} {...props} />,
}));
vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));
vi.mock("@/components/ui/multi-select", () => ({
  MultiSelect: ({ onValueChange, placeholder, options }: any) => (
    <div data-testid="multi-select" data-placeholder={placeholder}>
      {(options ?? []).map((opt: any) => (
        <button key={opt.value} data-testid={`option-${opt.value}`} onClick={() => onValueChange([opt.value])}>
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderFilter = (uniqueCosts: number[] = [3, 5]) =>
  render(<CardGalleryFilter uniqueCosts={uniqueCosts} />);

beforeEach(() => {
  vi.clearAllMocks();
  mockHook.mapsSelected = false;
  mockHook.hasActiveFilters = false;
  mockHook.multiSelectTypeValue = [];
  mockHook.multiSelectCostValue = [];
  mockHook.multiSelectMapTypeValue = [];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("CardGalleryFilter", () => {
  describe("rendering", () => {
    it("renders search input", () => {
      renderFilter();
      expect(screen.getByLabelText("searchByName")).toBeTruthy();
    });

    it("renders two multi-selects when maps not selected", () => {
      renderFilter();
      expect(screen.getAllByTestId("multi-select")).toHaveLength(2);
    });

    it("renders two multi-selects when maps is selected", () => {
      mockHook.mapsSelected = true;
      renderFilter();
      expect(screen.getAllByTestId("multi-select")).toHaveLength(2);
    });

    it("renders cost options when maps not selected", () => {
      renderFilter();
      expect(screen.getByTestId("option-3")).toBeTruthy();
      expect(screen.getByTestId("option-5")).toBeTruthy();
    });

    it("renders map type options instead of cost when maps is selected", () => {
      mockHook.mapsSelected = true;
      renderFilter();
      expect(screen.getByTestId("option-ruins")).toBeTruthy();
      expect(screen.queryByTestId("option-3")).toBeNull();
    });
  });

  describe("clear button", () => {
    it("does not render clear button when no filters are active", () => {
      renderFilter();
      expect(screen.queryByText("clearFilters")).toBeNull();
    });

    it("renders clear button when filters are active", () => {
      mockHook.hasActiveFilters = true;
      renderFilter();
      expect(screen.getByText("clearFilters")).toBeTruthy();
    });

    it("calls clearFilters when clear button is clicked", () => {
      mockHook.hasActiveFilters = true;
      renderFilter();
      fireEvent.click(screen.getByText("clearFilters"));
      expect(mockHook.clearFilters).toHaveBeenCalledOnce();
    });
  });

  describe("handler wiring", () => {
    it("calls onInputChangeHandler when search input changes", () => {
      renderFilter();
      fireEvent.change(screen.getByLabelText("searchByName"), {
        target: { value: "zeus" },
      });
      expect(mockHook.onInputChangeHandler).toHaveBeenCalled();
    });

    it("calls handleTypeChange when a type option is clicked", () => {
      renderFilter();
      fireEvent.click(screen.getByTestId("option-hero"));
      expect(mockHook.handleTypeChange).toHaveBeenCalledWith(["hero"]);
    });

    it("calls handleCostChange when a cost option is clicked", () => {
      renderFilter();
      fireEvent.click(screen.getByTestId("option-3"));
      expect(mockHook.handleCostChange).toHaveBeenCalledWith(["3"]);
    });

    it("calls handleMapTypeChange when a map type option is clicked", () => {
      mockHook.mapsSelected = true;
      renderFilter();
      fireEvent.click(screen.getByTestId("option-ruins"));
      expect(mockHook.handleMapTypeChange).toHaveBeenCalledWith(["ruins"]);
    });
  });
});
