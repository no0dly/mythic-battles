"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import SessionDrawer from "../SessionDrawer";
import { api } from "@/trpc/client";
import Loader from "@/components/Loader/Loader";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";

function SessionsCard() {
  const { t } = useTranslation();
  const [selectedSession, setSelectedSession] =
    useState<SessionWithPlayers | null>(null);

  const {
    data: sessions,
    isLoading,
    error,
  } = api.sessions.getUserSessions.useQuery();

  const onSelectSessionHandler = (session: SessionWithPlayers) => () => {
    setSelectedSession(session);
  };

  const onClearSessionHandler = () => {
    setSelectedSession(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-sm text-muted-foreground text-center self-center self-justify-center height-full w-full">
          <Loader local />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-sm text-destructive text-center self-center self-justify-center height-full w-full">
          {t("errorLoadingSessions", { message: error.message })}
        </div>
      );
    }

    if (!sessions || sessions.length === 0) {
      return (
        <div className="text-sm text-muted-foreground text-center self-center self-justify-center height-full w-full">
          {t("noSessionsFound")}
        </div>
      );
    }

    return (
      <ul className="space-y-2 w-full max-h-[300px] overflow-auto">
        {sessions.map((session) => {
          const {
            id,
            player1_name,
            player2_name,
            player1_session_score,
            player2_session_score,
            status,
          } = session;
          return (
            <li
              key={id}
              role="button"
              onClick={onSelectSessionHandler(session)}
              className="group/session flex items-center justify-between p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200 gap-2 sm:gap-4 cursor-pointer w-full min-w-0"
            >
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground group-hover/session:text-gray-600 transition-colors truncate">
                  {t("playedVSPlayer", {
                    player1: player1_name,
                    player2: player2_name,
                  })}
                </span>
                <span className="font-bold text-emerald-600 text-xs flex-shrink-0">
                  {`(${player1_session_score}-${player2_session_score})`}
                </span>
              </div>
              <Badge variant={status} className="flex-shrink-0">
                {t(status)}
              </Badge>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="relative group w-full md:w-fit md:min-w-[320px]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative border-2 border-foreground rounded-2xl p-3 md:p-4 bg-background transition-shadow duration-300">
        <div className="flex min-h-[200px]">{renderContent()}</div>
      </div>
      <SessionDrawer
        session={selectedSession}
        clearSession={onClearSessionHandler}
      />
    </div>
  );
}

export default SessionsCard;
