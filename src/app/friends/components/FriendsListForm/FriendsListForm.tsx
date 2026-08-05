"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { INVITE_MODE, type InviteMode } from "./constants";
import FriendInviteNameTab from "./components/FriendInviteNameTab";
import FriendInviteEmailTab from "./components/FriendInviteEmailTab";

export default function FriendsListForm() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<InviteMode>(INVITE_MODE.NAME);

  function handleNameModeClick() {
    setMode(INVITE_MODE.NAME);
  }

  function handleEmailModeClick() {
    setMode(INVITE_MODE.EMAIL);
  }

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label={t("friendsInviteTitle")}
        className="bg-muted text-muted-foreground grid h-9 w-full grid-cols-2 items-center rounded-lg p-[3px]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === INVITE_MODE.NAME}
          className={cn(
            "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-[color,box-shadow]",
            mode === INVITE_MODE.NAME
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
          onClick={handleNameModeClick}
        >
          {t("friendInviteByName")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === INVITE_MODE.EMAIL}
          className={cn(
            "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-[color,box-shadow]",
            mode === INVITE_MODE.EMAIL
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
          onClick={handleEmailModeClick}
        >
          {t("friendInviteByEmail")}
        </button>
      </div>

      {mode === INVITE_MODE.NAME ? (
        <FriendInviteNameTab />
      ) : (
        <FriendInviteEmailTab />
      )}
    </div>
  );
}
