import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/trpc/client";

export function useSendFriendRequest(onSuccess?: () => void) {
  const { t } = useTranslation();
  const utils = api.useUtils();

  const sendRequestMutation = api.friendships.sendRequest.useMutation({
    onSuccess: () => {
      utils.friendships.getSentRequests.invalidate();
      toast.success(t("friendRequestSent"));
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || t("errorSendingRequest"));
    },
  });

  return {
    sendRequest: sendRequestMutation.mutate,
    isPending: sendRequestMutation.isPending,
  };
}
