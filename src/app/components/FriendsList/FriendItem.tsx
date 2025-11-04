"use client";

import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { Trash2 } from "lucide-react";

interface FriendItemProps {
  friend: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string;
  };
}

export const FriendItem = ({ friend }: FriendItemProps) => {
  const utils = api.useUtils();

  const removeMutation = api.friendships.removeFriend.useMutation({
    onSuccess: () => {
      utils.friendships.getFriends.invalidate();
    },
    onError: (error) => {
      console.error("Error removing friend:", error);
    },
  });

  const handleRemove = () => {
    removeMutation.mutate({ friendId: friend.id });
  };

  return (
    <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <UserCard user={friend}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={removeMutation.isPending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
        >
          {removeMutation.isPending ? "..." : <Trash2 className="h-4 w-4" />}
        </Button>
      </UserCard>
    </div>
  );
};

