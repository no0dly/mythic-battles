"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchUsers } from "@/hooks/useUserProfile";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { FormItem } from "../ui/form";
import Image from "next/image";
import { SEARCH_DEFAULTS } from "@/utils/users/constants";

interface UserSearchProps {
  onSelectUser?: (userId: string) => void;
}

export const UserSearch = ({ onSelectUser }: UserSearchProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(
    query.trim(),
    SEARCH_DEFAULTS.DEBOUNCE_MS
  );
  const canSearch = debouncedQuery.length >= SEARCH_DEFAULTS.MIN_QUERY_LENGTH;
  const { users, isLoading, error } = useSearchUsers(
    debouncedQuery,
    SEARCH_DEFAULTS.LIMIT,
    { enabled: canSearch }
  );

  const handleUserClick = (userId: string) => {
    onSelectUser?.(userId);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{t("searchUsers")}</h3>

      <div className="mb-4">
        <FormItem>
          <Label htmlFor="search">{t("searchByName")}</Label>
          <Input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("friendNamePlaceholder")}
          />
        </FormItem>
      </div>

      {isLoading && canSearch && (
        <p className="text-gray-500">{t("loading")}</p>
      )}

      {error && <p className="text-red-500">{t("errorSearchingUsers")}</p>}

      {!isLoading && !error && query.trim().length > 0 && !canSearch && (
        <p className="text-gray-500">{t("friendInviteMinSearchHint")}</p>
      )}

      {!isLoading && !error && canSearch && users.length === 0 && (
        <p className="text-gray-500">{t("userNotFound")}</p>
      )}

      {!isLoading && !error && canSearch && users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex-shrink-0">
                {user.showAvatar ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={50}
                    height={50}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.initials}
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold">{user.displayName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
