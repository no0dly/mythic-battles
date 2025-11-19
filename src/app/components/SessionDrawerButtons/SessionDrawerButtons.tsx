"use client";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { type ReactNode } from "react";
import SessionDrawerButtonsAvailable from "./components/SessionDrawerButtonsAvailable";
import SessionDrawerButtonsDraft from "./components/SessionDrawerButtonsDraft";
import SessionDrawerButtonsInProgress from "./components/SessionDrawerButtonsInProgress";
import { SESSION_STATUS } from "@/types/constants";

interface SessionDrawerButtonsProps {
  session: SessionWithPlayers;
}

function SessionDrawerButtons({ session }: SessionDrawerButtonsProps) {
  return (
    {
      [SESSION_STATUS.DRAFT]: <SessionDrawerButtonsDraft session={session} />,
      [SESSION_STATUS.IN_PROGRESS]: (
        <SessionDrawerButtonsInProgress session={session} />
      ),
      [SESSION_STATUS.AVAILABLE]: (
        <SessionDrawerButtonsAvailable session={session} />
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
