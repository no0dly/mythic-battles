"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useFriends, usePendingRequests, useSentRequests } from "@/hooks";
import styles from "./FriendsHomeLink.module.css";

export default function FriendsHomeLink() {
  const { t } = useTranslation();
  const { friends, isLoading: friendsLoading } = useFriends();
  const { pendingRequests, isLoading: pendingLoading } = usePendingRequests();
  const { sentRequests, isLoading: sentLoading } = useSentRequests();

  const isLoading = friendsLoading || pendingLoading || sentLoading;
  const hasIncoming = pendingRequests.length > 0;
  const hasSent = sentRequests.length > 0;

  return (
    <div className={styles.Wrap}>
      <Link href="/friends" className={styles.Link}>
        <span className={styles.Title}>{t("friends")}</span>
        <span className={styles.Count}>
          {isLoading ? "..." : `(${friends.length})`}
        </span>
      </Link>

      {(hasIncoming || hasSent) && (
        <div className={styles.Tags}>
          {hasIncoming && (
            <Link
              href="/friends"
              className={`${styles.Tag} ${styles.TagIncoming}`}
            >
              {pendingRequests.length === 1
                ? t("friendsNewRequestTag")
                : t("friendsNewRequestsTag")}
            </Link>
          )}
          {hasSent && (
            <Link
              href="/friends"
              className={`${styles.Tag} ${styles.TagAwaiting}`}
            >
              {sentRequests.length === 1
                ? t("friendsAwaitingResponseTag")
                : t("friendsAwaitingResponsesTag")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
