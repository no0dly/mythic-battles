"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FriendsListForm from "@/app/components/FriendsListForm/FriendsListForm";
import { FriendItem } from "./FriendItem";
import { IncomingRequestItem } from "./IncomingRequestItem";
import { SentRequestItem } from "./SentRequestItem";
import { api } from "@/trpc/client";

type TabValue = "friends" | "incoming" | "sent";

function FriendsList() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("friends");

  const { data: friends = [], isLoading: friendsLoading } = api.friendships.getFriends.useQuery();
  const { data: pendingRequests = [], isLoading: pendingLoading } = api.friendships.getPendingRequests.useQuery();
  const { data: sentRequests = [], isLoading: sentLoading } = api.friendships.getSentRequests.useQuery();

  const onOpenModalHandler = () => {
    setIsOpen(true);
  };

  const isLoading = friendsLoading || pendingLoading || sentLoading;
  const hasIncoming = pendingRequests.length > 0;

  const renderTabContent = () => {
    if (activeTab === "friends") {
      if (friendsLoading) {
        return (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("loading")}
          </p>
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
            <FriendItem key={friend.id} friend={friend} />
          ))}
        </div>
      );
    }

    if (activeTab === "incoming") {
      if (pendingLoading) {
        return (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("loading")}
          </p>
        );
      }
      if (pendingRequests.length === 0) {
        return (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noFriendRequests")}
          </p>
        );
      }
      return (
        <div className="space-y-1">
          {pendingRequests.map((request) => (
            <IncomingRequestItem key={request.id} request={request} />
          ))}
        </div>
      );
    }

    if (activeTab === "sent") {
      if (sentLoading) {
        return (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("loading")}
          </p>
        );
      }
      if (sentRequests.length === 0) {
        return (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noSentRequests")}
          </p>
        );
      }
      return (
        <div className="space-y-1">
          {sentRequests.map((request) => (
            <SentRequestItem key={request.id} request={request} />
          ))}
        </div>
      );
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex justify-between items-center group/item w-full h-auto p-0 hover:bg-transparent cursor-pointer"
        onClick={onOpenModalHandler}
      >
        <span className="text-foreground/70 font-medium underline decoration-foreground/70 underline-offset-4 transition-all duration-200 group-hover/item:no-underline">
          {t("friends")}
        </span>
        <div className="flex items-center gap-2">
          {hasIncoming && (
            <Badge variant="notification" className="h-6 w-6 p-0 text-[10px] font-bold">
              {pendingRequests.length}
            </Badge>
          )}
          <span className="font-semibold text-foreground">
            {isLoading ? "..." : friends.length}
          </span>
        </div>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md flex flex-col max-h-[550px] !pb-4">
          <DialogHeader>
            <DialogTitle>{t("friends")}</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex gap-2 mb-3 border-b pb-2">
              <Button
                variant={activeTab === "friends" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("friends")}
                className="flex-1"
              >
                {t("friends")}
              </Button>
              <Button
                variant={activeTab === "incoming" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("incoming")}
                className="flex-1 relative"
              >
                {t("friendRequests")}
                {hasIncoming && (
                  <Badge
                    variant="notification"
                    className="ml-1 h-5 w-5 p-0 text-[10px] font-bold"
                  >
                    {pendingRequests.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === "sent" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("sent")}
                className="flex-1"
              >
                {t("sentRequests")}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              {renderTabContent()}
            </div>

            <FriendsListForm isOpen={isOpen} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FriendsList;
