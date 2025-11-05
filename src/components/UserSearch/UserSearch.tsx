"use client";

import { useState } from "react";
import { useSearchUsers } from "@/hooks/useUserProfile";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { FormItem } from "../ui/form";
import Image from "next/image";

interface UserSearchProps {
  onSelectUser?: (userId: string) => void;
}

export const UserSearch = ({ onSelectUser }: UserSearchProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const { users, isLoading, error } = useSearchUsers(query, 10);

  const handleUserClick = (userId: string) => {
    onSelectUser?.(userId);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{t("searchUsers")}</h3>

      {/* Search Input */}
      <div className="mb-4">
        <FormItem>
          <Label htmlFor="search">{t("searchUsers")}</Label>
          <Input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder.emailOrName")}
          />
        </FormItem>
      </div>

      {/* Results */}
      {isLoading && <p className="text-gray-500">{t("loading")}</p>}

      {error && (
        <p className="text-red-500">{t("errorSearchingUsers")}</p>
      )}

      {!isLoading && !error && query.length > 0 && users.length === 0 && (
        <p className="text-gray-500">{t("userNotFound")}</p>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* Avatar */}
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

              {/* User Info */}
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

