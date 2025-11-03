"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FriendsListForm from "@/app/components/FriendsListForm/FriendsListForm";

interface Friend {
  id: string;
  email: string;
  name?: string;
}

// Mocked friends list
const MOCKED_FRIENDS: Friend[] = [
  { id: "1", email: "alice@example.com", name: "Alice" },
  { id: "2", email: "bob@example.com", name: "Bob" },
  { id: "3", email: "charlie@example.com", name: "Charlie" },
  { id: "4", email: "dave@example.com", name: "Dave" },
  { id: "5", email: "eve@example.com", name: "Eve" },
  { id: "6", email: "frank@example.com", name: "Frank" },
  { id: "7", email: "george@example.com", name: "George" },
  { id: "8", email: "hannah@example.com", name: "Hannah" },
  { id: "9", email: "ian@example.com", name: "Ian" },
  { id: "10", email: "jane@example.com", name: "Jane" },
  { id: "11", email: "karen@example.com", name: "Karen" },
  { id: "12", email: "larry@example.com", name: "Larry" },
  { id: "13", email: "mary@example.com", name: "Mary" },
  { id: "14", email: "nathan@example.com", name: "Nathan" },
  { id: "15", email: "olivia@example.com", name: "Olivia" },
  { id: "16", email: "patrick@example.com", name: "Patrick" },
  { id: "17", email: "quinn@example.com", name: "Quinn" },
];

function FriendsList() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const friends = MOCKED_FRIENDS;

  const onOpenModalHandler = () => {
    setIsOpen(true);
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
        <span className="font-semibold text-foreground">{friends.length}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md flex flex-col max-h-[470px] !pb-4">
          <DialogHeader>
            <DialogTitle>{t("friends")}</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              <div className="space-y-1">
                {friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("noFriendsYet")}
                  </p>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {friend.name || friend.email.split("@")[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {friend.email}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <FriendsListForm isOpen={isOpen} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FriendsList;
