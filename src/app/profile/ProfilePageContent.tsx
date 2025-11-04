"use client";

import { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import { UserProfileEdit } from "@/components/UserProfileEdit";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTranslation } from "react-i18next";
import type { User } from "@supabase/supabase-js";
import PageLayout from "@/components/PageLayout";

interface ProfilePageContentProps {
  user: User;
  handleSignOut: () => Promise<void>;
}

export const ProfilePageContent = ({
  handleSignOut,
}: ProfilePageContentProps) => {
  const { t } = useTranslation();
  const { user: userProfile, isLoading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <PageLayout title="profile">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isEditing && userProfile ? (
              <UserProfileEdit
                user={userProfile}
                onSuccess={() => setIsEditing(false)}
              />
            ) : (
              <>
                <UserProfile />
                <div className="flex items-center gap-2 mb-6">
                  {!isLoading && userProfile && (
                    <Button onClick={() => setIsEditing(true)}>
                      {t("updateProfile")}
                    </Button>
                  )}
                  <form action={handleSignOut}>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t("logout")}
                    </Button>
                  </form>
                </div>
              </>
            )}

            {isEditing && (
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="w-full"
              >
                {t("cancel")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
