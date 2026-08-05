"use client";

import { useTranslation } from "react-i18next";
import FriendItem from "@/app/friends/components/FriendItem";
import Loader from "@/components/Loader";
import { useFriends } from "@/hooks";
import styles from "@/app/friends/components/FriendsPage/FriendsPage.module.css";

export default function FriendsTab() {
  const { t } = useTranslation();
  const { friends, isLoading } = useFriends();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (friends.length === 0) {
    return <p className={styles.Empty}>{t("noFriendsYet")}</p>;
  }

  return (
    <div className={styles.List}>
      {friends.map((friend, index) => (
        <FriendItem
          key={friend.id}
          id={friend.id}
          avatarUrl={friend.avatarUrl}
          displayName={friend.displayName}
          initials={friend.initials}
          showAvatar={friend.showAvatar}
          index={index}
        />
      ))}
    </div>
  );
}
