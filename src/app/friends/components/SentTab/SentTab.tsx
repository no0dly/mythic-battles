"use client";

import { useTranslation } from "react-i18next";
import SentRequestItem from "@/app/friends/components/SentRequestItem";
import Loader from "@/components/Loader";
import { useSentRequests } from "@/hooks";
import styles from "@/app/friends/components/FriendsPage/FriendsPage.module.css";

export default function SentTab() {
  const { t } = useTranslation();
  const { sentRequests, isLoading } = useSentRequests();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (sentRequests.length === 0) {
    return <p className={styles.Empty}>{t("noSentRequests")}</p>;
  }

  return (
    <div className={styles.List}>
      {sentRequests.map((request, index) => {
        if (!request.recipient) return null;

        const { displayName, initials, avatarUrl, showAvatar } =
          request.recipient;

        return (
          <SentRequestItem
            key={request.id}
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
