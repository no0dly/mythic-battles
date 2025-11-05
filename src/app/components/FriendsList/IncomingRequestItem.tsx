"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import Image from "next/image";

interface IncomingRequestItemProps {
  friendshipId: string;
  email: string;
  displayName: string;
  initials: string;
  avatarUrl: string;
  showAvatar: boolean;
}

export const IncomingRequestItem = ({
  friendshipId,
  email,
  displayName,
  initials,
  avatarUrl,
  showAvatar,
}: IncomingRequestItemProps) => {
  const { t } = useTranslation();
  const utils = api.useUtils();

  const { mutate: acceptRequest, isPending: isAccepting } =
    api.friendships.acceptRequest.useMutation({
      onSuccess: () => {
        utils.friendships.getFriends.invalidate();
        utils.friendships.getPendingRequests.invalidate();
      },
      onError: (error) => {
        console.error("Error accepting request:", error);
      },
    });

  const { mutate: rejectRequest, isPending: isRejecting } =
    api.friendships.rejectRequest.useMutation({
      onSuccess: () => {
        utils.friendships.getPendingRequests.invalidate();
      },
      onError: (error) => {
        console.error("Error rejecting request:", error);
      },
    });

  const handleAccept = () => {
    acceptRequest({ friendshipId });
  };

  const handleReject = () => {
    rejectRequest({ friendshipId });
  };

  const isPending = isAccepting || isRejecting;

  return (
    <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {showAvatar ? (
              <Image
                src={avatarUrl}
                height={50}
                width={50}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-grow min-w-0">
            <p className="font-semibold truncate">{displayName}</p>
            <p className="text-sm text-gray-600 truncate">{email}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 h-8"
              >
                {isAccepting ? "..." : t("acceptRequest")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isPending}
                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 px-4 h-8"
              >
                {isRejecting ? "..." : t("rejectRequest")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
