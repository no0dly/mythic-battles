"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import styles from "@/app/friends/components/FriendsPage/FriendsPage.module.css";

interface SentRequestItemProps {
  displayName: string;
  initials: string;
  avatarUrl: string;
  showAvatar: boolean;
  index?: number;
}

export default function SentRequestItem({
  displayName,
  initials,
  avatarUrl,
  showAvatar,
  index = 0,
}: SentRequestItemProps) {
  const { t } = useTranslation();

  return (
    <div
      className={styles.Row}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {showAvatar ? (
        <Image
          src={avatarUrl}
          height={44}
          width={44}
          alt={displayName}
          className={styles.Avatar}
        />
      ) : (
        <div className={styles.AvatarFallback}>{initials}</div>
      )}

      <p className={styles.RowName}>{displayName}</p>

      <Badge variant="pending" className="text-xs px-3 py-1 shrink-0">
        {t("friendshipStatusPending")}
      </Badge>
    </div>
  );
}
