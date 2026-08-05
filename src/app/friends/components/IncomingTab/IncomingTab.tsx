"use client";

import { useTranslation } from "react-i18next";
import IncomingRequestItem from "@/app/friends/components/IncomingRequestItem";
import Loader from "@/components/Loader";
import { usePendingRequests } from "@/hooks";
import styles from "@/app/friends/components/FriendsPage/FriendsPage.module.css";

export default function IncomingTab() {
  const { t } = useTranslation();
  const { pendingRequests, isLoading } = usePendingRequests();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return <p className={styles.Empty}>{t("noFriendRequests")}</p>;
  }

  return (
    <div className={styles.List}>
      {pendingRequests.map((request, index) => {
        if (!request.sender) return null;

        const { displayName, initials, avatarUrl, showAvatar } = request.sender;

        return (
          <IncomingRequestItem
            key={request.id}
            friendshipId={request.id}
            displayName={displayName}
            initials={initials}
            avatarUrl={avatarUrl}
            showAvatar={showAvatar}
            index={index}
          />
        );
      })}
    </div>
  );
}
