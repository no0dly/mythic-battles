"use client";
import { Button } from "@/components/ui/button";
import type { SessionStatus } from "@/types/database.types";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

interface SessionModalButtonsProps {
  status: SessionStatus;
  hasGames: boolean;
  sessionID: string | null;
}

type ButtonConfig = {
  labelKey: string;
  variant: "default" | "outline";
  onClick: (sessionID: string | null) => void;
  fullWidth?: boolean;
};

type ButtonGroupConfig = ButtonConfig[];

function SessionModalButtons({
  status,
  hasGames,
  sessionID,
}: SessionModalButtonsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const goToDraftHandler = (sessionID: string | null) => {
    // TODO: Implement go to draft functionality
    console.log("Go to draft", sessionID);
  };

  const goToGameHandler = (sessionID: string | null) => {
    // TODO: Implement go to game functionality
    console.log("Go to game", sessionID);
  };

  const startNewGameHandler = (sessionID: string | null) => {
    if (!sessionID) return;
    // Перенаправить на страницу настроек драфта с передачей sessionId
    router.push(`/draft-settings?sessionId=${sessionID}`);
  };

  const finishHandler = (sessionID: string | null) => {
    // TODO: Implement finish functionality
    console.log("Finish session", sessionID);
  };

  const buttonConfigs: Record<string, ButtonGroupConfig> = {
    draft: [
      {
        labelKey: "goToDraft",
        variant: "default",
        onClick: goToDraftHandler,
        fullWidth: true,
      },
    ],
    inProgress: [
      {
        labelKey: "goToGame",
        variant: "default",
        onClick: goToGameHandler,
        fullWidth: true,
      },
    ],
    available: [
      {
        labelKey: "startNewGame",
        variant: "default" as const,
        onClick: startNewGameHandler,
        fullWidth: !hasGames,
      },
      ...(hasGames
        ? ([
            {
              labelKey: "finish",
              variant: "outline" as const,
              onClick: finishHandler,
              fullWidth: false,
            },
          ] as ButtonGroupConfig)
        : []),
    ],
  };

  const currentButtonConfigs = buttonConfigs[status];

  if (!currentButtonConfigs) {
    return null;
  }

  return (
    <>
      {currentButtonConfigs.map((config, index) => (
        <Button
          key={index}
          onClick={() => config.onClick(sessionID)}
          variant={config.variant}
          size="lg"
          className={
            config.fullWidth ? "whitespace-nowrap w-full" : "whitespace-nowrap"
          }
        >
          {t(config.labelKey)}
        </Button>
      ))}
    </>
  );
}

export default SessionModalButtons;
