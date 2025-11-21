"use client";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import SessionDrawerButtonsAvailable from "./components/SessionDrawerButtonsAvailable";
import SessionDrawerButtonsDraft from "./components/SessionDrawerButtonsDraft";
import SessionDrawerButtonsInProgress from "./components/SessionDrawerButtonsInProgress";
import { SESSION_STATUS } from "@/types/constants";

interface SessionDrawerButtonsProps {
  session: SessionWithPlayers;
  clearSession: () => void;
}

function SessionDrawerButtons({
  session,
  clearSession,
}: SessionDrawerButtonsProps) {
  return (
    {
      [SESSION_STATUS.DRAFT]: <SessionDrawerButtonsDraft session={session} />,
      [SESSION_STATUS.IN_PROGRESS]: (
        <SessionDrawerButtonsInProgress
          session={session}
          clearSession={clearSession}
        />
      ),
      [SESSION_STATUS.AVAILABLE]: (
        <SessionDrawerButtonsAvailable
          session={session}
          clearSession={clearSession}
        />
      ),
      [SESSION_STATUS.DRAFT_RESET_REQUEST]: (
        <SessionDrawerButtonsDraft session={session} />
      ),
      [SESSION_STATUS.ERROR]: null,
      [SESSION_STATUS.FINISHED]: null,
      [SESSION_STATUS.INVITE_TO_DRAFT]: null,
    }[session.status] ?? null
  );
}

export default SessionDrawerButtons;
