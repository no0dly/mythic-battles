import Image from "next/image";
import { getUserInitials, hasAvatar, formatDisplayName } from "@/utils/users";

interface PlayerAvatarProps {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-base",
};

export const PlayerAvatar = ({
  email,
  display_name,
  avatar_url,
  size = "md",
}: PlayerAvatarProps) => {
  const displayName = formatDisplayName(display_name, email);
  const initials = getUserInitials(display_name, email);
  const showAvatar = hasAvatar(avatar_url);

  if (showAvatar) {
    return (
      <Image
        src={avatar_url}
        alt={displayName}
        width={size === "lg" ? 64 : size === "md" ? 40 : 32}
        height={size === "lg" ? 64 : size === "md" ? 40 : 32}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-500 font-bold text-white`}
    >
      {initials}
    </div>
  );
};
