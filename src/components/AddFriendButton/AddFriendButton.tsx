"use client";

import { useTranslation } from "react-i18next";
import {
  Clock3,
  Loader2,
  UserCheck,
  UserPlus,
  UserRoundPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { api } from "@/trpc/client";
import {
  FRIENDSHIP_UI_STATUS,
  type FriendshipUiStatus,
} from "@/hooks/useFriendshipStatus";
import { cn } from "@/lib/utils";
import StatusIcon from "./components/StatusIcon";
import { ACTION_SLOT_CLASS } from "./constants";

interface AddFriendButtonProps {
  userId: string;
  status: FriendshipUiStatus;
}

export default function AddFriendButton({ userId, status }: AddFriendButtonProps) {
  const { t } = useTranslation();
  const utils = api.useUtils();

  const sendRequestMutation = api.friendships.sendRequest.useMutation({
    onSuccess: () => {
      utils.friendships.getSentRequests.invalidate();
      toast.success(t("friendRequestSent"));
    },
    onError: (error) => {
      toast.error(error.message || t("errorSendingRequest"));
    },
  });

  if (status === FRIENDSHIP_UI_STATUS.SELF) {
    return <div className={ACTION_SLOT_CLASS} aria-hidden />;
  }

  if (status === FRIENDSHIP_UI_STATUS.FRIEND) {
    return (
      <StatusIcon
        label={t("friendshipStatusAccepted")}
        className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/25 via-teal-500/20 to-cyan-500/25 text-emerald-700 dark:text-emerald-300"
      >
        <UserCheck className="h-4 w-4" aria-hidden />
      </StatusIcon>
    );
  }

  if (status === FRIENDSHIP_UI_STATUS.PENDING_SENT) {
    return (
      <StatusIcon
        label={t("friendRequestSent")}
        className="border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300"
      >
        <Clock3 className="h-4 w-4" aria-hidden />
      </StatusIcon>
    );
  }

  if (status === FRIENDSHIP_UI_STATUS.PENDING_INCOMING) {
    return (
      <StatusIcon
        label={t("friendRequests")}
        className="border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300"
      >
        <UserRoundPen className="h-4 w-4" aria-hidden />
      </StatusIcon>
    );
  }

  const isSending = sendRequestMutation.isPending;

  function handleSendRequest() {
    sendRequestMutation.mutate({ friendId: userId });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={isSending}
          aria-label={t("addFriend")}
          className={cn(
            ACTION_SLOT_CLASS,
            "cursor-pointer rounded-full border-blue-200/80 bg-blue-50/80 text-blue-700",
            "hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800",
            "dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
            "dark:hover:border-blue-400/50 dark:hover:bg-blue-500/20 dark:hover:text-blue-200"
          )}
          onClick={handleSendRequest}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <UserPlus className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("addFriend")}</TooltipContent>
    </Tooltip>
  );
}
