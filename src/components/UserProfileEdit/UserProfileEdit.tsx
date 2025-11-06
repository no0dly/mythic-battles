"use client";

import { useState } from "react";
import { useUpdateProfile } from "@/hooks/useUserProfile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { validateProfileUpdate } from "@/utils/users";
import type { UserProfile } from "@/types/database.types";
import { api } from "@/trpc/client";

interface UserProfileEditProps {
  user: UserProfile;
  onSuccess?: () => void;
}

export const UserProfileEdit = ({ user, onSuccess }: UserProfileEditProps) => {
  const { t } = useTranslation();
  const { updateProfile, isLoading, error } = useUpdateProfile();
  const utils = api.useUtils();

  const [displayName, setDisplayName] = useState(user.display_name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      display_name: displayName,
      avatar_url: avatarUrl,
    };

    const validation = validateProfileUpdate(updateData);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);

    updateProfile(updateData, {
      onSuccess: () => {
        void utils.users.getCurrentUser.invalidate();
        onSuccess?.();
      },
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{t("updateProfile")}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name */}
        <div>
          <Label htmlFor="displayName">{t("displayName")}</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("displayName")}
            maxLength={50}
            disabled={isLoading}
          />
        </div>

        {/* Avatar URL */}
        <div>
          <Label htmlFor="avatarUrl">{t("avatar")}</Label>
          <Input
            id="avatarUrl"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={isLoading}
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <ul className="list-disc list-inside text-sm text-red-600">
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* API Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-600">{t("errorUpdatingProfile")}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "..." : t("updateProfile")}
        </Button>
      </form>
    </Card>
  );
};
