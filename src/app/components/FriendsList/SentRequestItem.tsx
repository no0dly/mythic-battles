"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface SentRequestItemProps {
  email: string;
  displayName: string;
  initials: string;
  avatarUrl: string;
  showAvatar: boolean;
}

export const SentRequestItem = ({
  email,
  displayName,
  initials,
  avatarUrl,
  showAvatar,
}: SentRequestItemProps) => {
  const { t } = useTranslation();

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

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <Badge variant="pending" className="text-xs px-3 py-1">
              {t("friendshipStatusPending")}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
