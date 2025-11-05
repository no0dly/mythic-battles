"use client";

import { Card } from "@/components/ui/card";
import { formatDisplayName, getUserInitials, hasAvatar } from "@/utils/users";
import Image from "next/image";

interface UserCardProps {
  email: string;
  displayName: string;
  avatarUrl: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const UserCard = ({
  email,
  displayName,
  avatarUrl,
  onClick,
  children,
}: UserCardProps) => {
  const formattedDisplayName = formatDisplayName(displayName, email);
  const initials = getUserInitials(displayName, email);
  const showAvatar = hasAvatar(avatarUrl);

  return (
    <Card
      className={`p-4 ${
        onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Image
              src={avatarUrl}
              height={50}
              width={50}
              alt={formattedDisplayName}
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
          <p className="font-semibold truncate">{formattedDisplayName}</p>
          <p className="text-sm text-gray-600 truncate">{email}</p>
        </div>

        {/* Additional content */}
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
    </Card>
  );
};
