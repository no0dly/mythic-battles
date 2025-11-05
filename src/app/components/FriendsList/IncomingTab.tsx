"use client";

import { useTranslation } from "react-i18next";
import { IncomingRequestItem } from "./IncomingRequestItem";
import Loader from "@/components/Loader";
import { usePendingRequests } from "@/hooks";

export const IncomingTab = () => {
  const { t } = useTranslation();
  const { pendingRequests, isLoading } = usePendingRequests();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {t("noFriendRequests")}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {pendingRequests.map((request) => {
        if (!request.sender) return null;

        const { email, displayName, initials, avatarUrl, showAvatar } =
          request.sender;

        return (
          <IncomingRequestItem
            key={request.id}
            friendshipId={request.id}
            email={email}
            displayName={displayName}
            initials={initials}
            avatarUrl={avatarUrl}
            showAvatar={showAvatar}
          />
        );
      })}
    </div>
  );
};
