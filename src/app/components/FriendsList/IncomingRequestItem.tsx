"use client";

import { useTranslation } from "react-i18next";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";

interface IncomingRequestItemProps {
  request: {
    id: string;
    sender?: {
      id: string;
      email: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

export const IncomingRequestItem = ({ request }: IncomingRequestItemProps) => {
  const { t } = useTranslation();
  const utils = api.useUtils();

  const acceptMutation = api.friendships.acceptRequest.useMutation({
    onSuccess: () => {
      utils.friendships.getFriends.invalidate();
      utils.friendships.getPendingRequests.invalidate();
    },
    onError: (error) => {
      console.error("Error accepting request:", error);
    },
  });

  const rejectMutation = api.friendships.rejectRequest.useMutation({
    onSuccess: () => {
      utils.friendships.getPendingRequests.invalidate();
    },
    onError: (error) => {
      console.error("Error rejecting request:", error);
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate({ friendshipId: request.id });
  };

  const handleReject = () => {
    rejectMutation.mutate({ friendshipId: request.id });
  };

  if (!request.sender) {
    return null;
  }

  const isPending = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <UserCard user={request.sender}>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 h-8"
          >
            {acceptMutation.isPending ? "..." : t("acceptRequest")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isPending}
            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 px-4 h-8"
          >
            {rejectMutation.isPending ? "..." : t("rejectRequest")}
          </Button>
        </div>
      </UserCard>
    </div>
  );
};

