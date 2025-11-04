"use client";

import { useTranslation } from "react-i18next";
import { UserCard } from "@/components/UserCard";
import { Badge } from "@/components/ui/badge";

interface SentRequestItemProps {
  request: {
    id: string;
    recipient?: {
      id: string;
      email: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

export const SentRequestItem = ({ request }: SentRequestItemProps) => {
  const { t } = useTranslation();

  if (!request.recipient) {
    return null;
  }

  return (
    <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <UserCard user={request.recipient}>
        <Badge variant="pending" className="text-xs px-3 py-1">
          {t("friendshipStatusPending")}
        </Badge>
      </UserCard>
    </div>
  );
};

