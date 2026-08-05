"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import styles from "@/app/friends/components/FriendsPage/FriendsPage.module.css";

interface FriendItemProps {
  id: string;
  displayName: string;
  avatarUrl: string;
  initials: string;
  showAvatar: boolean;
  index?: number;
}

export default function FriendItem({
  id,
  displayName,
  avatarUrl,
  initials,
  showAvatar,
  index = 0,
}: FriendItemProps) {
  const { t } = useTranslation();
  const utils = api.useUtils();

  const removeMutation = api.friendships.removeFriend.useMutation({
    onSuccess: () => {
      utils.friendships.getFriends.invalidate();
      toast.success(t("friendRemoved"));
    },
    onError: (error) => {
      toast.error(error.message || t("errorRemovingFriend"));
    },
  });

  function handleRemove() {
    removeMutation.mutate({ friendId: id });
  }

  return (
    <div
      className={styles.Row}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {showAvatar ? (
        <Image
          src={avatarUrl}
          height={44}
          width={44}
          alt={displayName}
          className={styles.Avatar}
        />
      ) : (
        <div className={styles.AvatarFallback}>{initials}</div>
      )}

      <p className={styles.RowName}>{displayName}</p>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={removeMutation.isPending}
        aria-label={t("removeFriend")}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
      >
        {removeMutation.isPending ? "..." : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
