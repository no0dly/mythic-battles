"use client";

import { useTranslation } from "react-i18next";
import { SentRequestItem } from "./SentRequestItem";
import Loader from "@/components/Loader";
import { useSentRequests } from "@/hooks";

export const SentTab = () => {
  const { t } = useTranslation();
  const { sentRequests, isLoading } = useSentRequests();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {t("noSentRequests")}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {sentRequests.map((request) => {
        if (!request.recipient) return null;

        const { email, displayName, initials, avatarUrl, showAvatar } =
          request.recipient;

        return (
          <SentRequestItem
            key={request.id}
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
