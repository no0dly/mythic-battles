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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendsListForm from "@/app/components/FriendsListForm/FriendsListForm";
import { FriendsTab } from "./FriendsTab";
import { IncomingTab } from "./IncomingTab";
import { SentTab } from "./SentTab";
import { TAB_VALUES } from "./constants";
import { useFriends, usePendingRequests } from "@/hooks";

const FriendsList = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { friends, isLoading: friendsLoading } = useFriends();
  const { pendingRequests, isLoading: pendingLoading } = usePendingRequests();

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const isLoading = friendsLoading || pendingLoading;
  const hasIncoming = pendingRequests.length > 0;

  return (
    <>
      <Button
        variant="ghost"
        className="flex justify-between items-center group/item w-full h-auto p-0 hover:bg-transparent cursor-pointer"
        onClick={handleOpenModal}
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
        <DialogContent className="!max-w-xl flex flex-col max-h-[550px] !pb-4">
          <DialogHeader>
            <DialogTitle>{t("friends")}</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0">
            <Tabs defaultValue={TAB_VALUES.FRIENDS} className="flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-3 mb-3">
                <TabsTrigger value={TAB_VALUES.FRIENDS}>
                  {t("friends")}
                </TabsTrigger>
                <TabsTrigger value={TAB_VALUES.INCOMING} className="relative">
                  {t("friendRequests")}
                  {hasIncoming && (
                    <Badge
                      variant="notification"
                      className="ml-1 h-5 w-5 p-0 text-[10px] font-bold"
                    >
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value={TAB_VALUES.SENT}>
                  {t("sentRequests")}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto min-h-0 mb-4">
                <TabsContent value={TAB_VALUES.FRIENDS} className="mt-0">
                  <FriendsTab />
                </TabsContent>
                <TabsContent value={TAB_VALUES.INCOMING} className="mt-0">
                  <IncomingTab />
                </TabsContent>
                <TabsContent value={TAB_VALUES.SENT} className="mt-0">
                  <SentTab />
                </TabsContent>
              </div>
            </Tabs>

            <FriendsListForm isOpen={isOpen} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FriendsList;
