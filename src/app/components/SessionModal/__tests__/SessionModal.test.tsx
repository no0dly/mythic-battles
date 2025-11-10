import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SessionModal from "../SessionModal";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";

const mockUseQuery = vi.fn();

vi.mock("@/trpc/client", () => ({
  api: {
    games: {
      getBySessionId: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        game: "Game",
        won: "Won",
        createdBy: "Created by",
        sessionDetails: "Session Details",
        duration: "Duration",
        rounds: "Rounds",
        created: "created",
        noDraftAvailable: "noDraftAvailable",
        goToDraft: "goToDraft",
      };

      if (key === "playedVSPlayer" && params) {
        return `${params.player1} vs ${params.player2}`;
      }

      if (key === "showingGames" && params) {
        return "showingGames";
      }

      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/accordion-1", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AccordionItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

const baseSession: SessionWithPlayers = {
  id: "session-1",
  player1_id: "player-1",
  player2_id: "player-2",
  player1_session_score: 2,
  player2_session_score: 1,
  status: "draft",
  error_message: null,
  game_list: ["game-1"],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  finished_at: null,
  player1_name: "Zeus",
  player2_name: "Hades",
  player1_email: "zeus@example.com",
  player2_email: "hades@example.com",
};

describe("SessionModal", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("displays the created by information for each game", () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: "game-1",
          game_number: 1,
          created_by: "user-creator-id",
          created_by_name: "user-creator",
          winner_id: "player-1",
          session_id: "session-1",
          status: "draft",
          draft_id: null,
          draft: null,
          player1_game_score: 15,
          player2_game_score: 12,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          finished_at: null,
        },
      ],
      isLoading: false,
    });

    render(<SessionModal session={baseSession} clearSession={vi.fn()} />);

    expect(mockUseQuery).toHaveBeenCalledWith({
      sessionId: "session-1",
    });

    expect(screen.getByText(/Created by:/i)).toBeTruthy();
    expect(screen.getByText("user-creator")).toBeTruthy();
  });

  it("gracefully handles missing created_by details", () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: "game-1",
          game_number: 1,
          created_by: null,
          created_by_name: null,
          winner_id: null,
          session_id: "session-1",
          status: "draft",
          draft_id: null,
          draft: null,
          player1_game_score: 0,
          player2_game_score: 0,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          finished_at: null,
        },
      ],
      isLoading: false,
    });

    render(<SessionModal session={baseSession} clearSession={vi.fn()} />);

    expect(screen.queryByText(/Created by:/i)).toBeNull();
  });
});

