"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UserCombobox, { type SelectedUser } from "@/components/UserCombobox";
import { useSendFriendRequest } from "@/hooks";

export default function FriendInviteNameTab() {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  function handleRequestSuccess() {
    setSelectedUser(null);
  }

  const { sendRequest, isPending } = useSendFriendRequest(handleRequestSuccess);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedUser) return;
    sendRequest({ friendId: selectedUser.id });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <Label className="text-sm font-medium leading-none">
        {t("friendName")}
      </Label>

      <div className="flex h-9 items-center gap-2">
        <UserCombobox
          value={selectedUser}
          disabled={isPending}
          onValueChange={setSelectedUser}
        />
        <Button
          type="submit"
          className="h-9 px-3 shrink-0"
          disabled={!selectedUser || isPending}
        >
          {isPending ? "..." : t("addFriend")}
        </Button>
      </div>

      <div className="min-h-5" aria-hidden />
    </form>
  );
}
