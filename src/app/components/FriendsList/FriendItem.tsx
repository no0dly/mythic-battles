"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { Trash2 } from "lucide-react";
import Image from "next/image";

interface FriendItemProps {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  initials: string;
  showAvatar: boolean;
}

export const FriendItem = ({
  id,
  email,
  displayName,
  avatarUrl,
  initials,
  showAvatar,
}: FriendItemProps) => {
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
    removeMutation.mutate({ friendId: id });
  };

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

          {/* Remove Button */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              {removeMutation.isPending ? "..." : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
