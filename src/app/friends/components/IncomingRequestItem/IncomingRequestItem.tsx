"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import Image from "next/image";
import { toast } from "sonner";
import styles from "@/app/friends/components/FriendsPage/FriendsPage.module.css";

interface IncomingRequestItemProps {
  friendshipId: string;
  displayName: string;
  initials: string;
  avatarUrl: string;
  showAvatar: boolean;
  index?: number;
}

export default function IncomingRequestItem({
  friendshipId,
  displayName,
  initials,
  avatarUrl,
  showAvatar,
  index = 0,
}: IncomingRequestItemProps) {
  const { t } = useTranslation();
  const utils = api.useUtils();

  const { mutate: acceptRequest, isPending: isAccepting } =
    api.friendships.acceptRequest.useMutation({
      onSuccess: () => {
        utils.friendships.getFriends.invalidate();
        utils.friendships.getPendingRequests.invalidate();
        toast.success(t("friendRequestAccepted"));
      },
      onError: (error) => {
        toast.error(error.message || t("errorAcceptingRequest"));
      },
    });

  const { mutate: rejectRequest, isPending: isRejecting } =
    api.friendships.rejectRequest.useMutation({
      onSuccess: () => {
        utils.friendships.getPendingRequests.invalidate();
        toast.success(t("friendRequestRejected"));
      },
      onError: (error) => {
        toast.error(error.message || t("errorRejectingRequest"));
      },
    });

  const isPending = isAccepting || isRejecting;

  function handleAccept() {
    acceptRequest({ friendshipId });
  }

  function handleReject() {
    rejectRequest({ friendshipId });
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

      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white px-3 h-8"
        >
          {isAccepting ? "..." : t("acceptRequest")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isPending}
          className="border-destructive/60 text-destructive hover:bg-destructive/10 px-3 h-8"
        >
          {isRejecting ? "..." : t("rejectRequest")}
        </Button>
      </div>
    </div>
  );
}
