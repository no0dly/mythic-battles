import {
  describe,
  expect,
  it,
  vi,
  afterEach,
  beforeEach,
  beforeAll,
} from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === "playedVSPlayer" && params) {
        return `${params.player1} vs ${params.player2}`;
      }
      return key;
    },
  }),
}));

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (open ? <div>{children}</div> : null),
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
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
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

const mockGamesList = vi.hoisted(() =>
  vi.fn(({ session }: { session: SessionWithPlayers }) => (
    <div data-testid="games-list">
      {session.id}-{session.player1_name}-{session.player2_name}
    </div>
  ))
);

vi.mock("../GamesList", () => ({
  __esModule: true,
  GamesList: (props: Parameters<typeof mockGamesList>[0]) =>
    mockGamesList(props),
}));

vi.mock("@/app/components/GamesList", () => ({
  __esModule: true,
  GamesList: (props: Parameters<typeof mockGamesList>[0]) =>
    mockGamesList(props),
}));

vi.mock("../SessionDrawerButtons", () => ({
  __esModule: true,
  default: () => <div data-testid="session-modal-buttons" />,
}));

vi.mock("../SessionDrawerButtons/SessionDrawerButtons", () => ({
  __esModule: true,
  default: () => <div data-testid="session-modal-buttons" />,
}));

vi.mock("@/app/components/SessionDrawerButtons", () => ({
  __esModule: true,
  default: () => <div data-testid="session-modal-buttons" />,
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

describe("SessionDrawer", () => {
  let SessionDrawer: typeof import("../SessionDrawer").default;

  beforeAll(async () => {
    SessionDrawer = (await import("../SessionDrawer")).default;
  });
  beforeEach(() => {
    mockGamesList.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders session information and passes props to GamesList", () => {
    render(<SessionDrawer session={baseSession} clearSession={vi.fn()} />);

    expect(screen.getByText("Zeus vs Hades 2-1")).toBeTruthy();
    expect(screen.getByTestId("session-modal-buttons")).toBeTruthy();
    expect(mockGamesList).toHaveBeenCalledWith(
      expect.objectContaining({
        session: baseSession,
      })
    );
  });

  it("returns null when session is null", () => {
    const { container } = render(
      <SessionDrawer session={null} clearSession={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });
});
