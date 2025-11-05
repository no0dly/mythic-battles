"use client";

import { useTranslation } from "react-i18next";
import { FriendItem } from "./FriendItem";
import Loader from "@/components/Loader";
import { useFriends } from "@/hooks";

export const FriendsTab = () => {
  const { t } = useTranslation();
  const { friends, isLoading } = useFriends();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {t("noFriendsYet")}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {friends.map((friend) => (
        <FriendItem
          key={friend.id}
          id={friend.id}
          email={friend.email}
          avatarUrl={friend.avatarUrl}
          displayName={friend.displayName}
          initials={friend.initials}
          showAvatar={friend.showAvatar}
        />
      ))}
    </div>
  );
};

