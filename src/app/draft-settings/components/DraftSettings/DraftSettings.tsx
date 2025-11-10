"use client";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFriends } from "@/hooks";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { SelectWithLoading, NumberInputField } from "@/components/FormFields";
import {
  DraftSettingsFormValues,
  getDraftSettingsSchema,
  DRAFT_SIZE_OPTIONS,
  USER_ALLOWED_POINTS_OPTIONS,
} from "./constants";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { DEFAULT_DRAFT_SETTINGS } from "@/types/constants";
import { useMemo } from "react";

export default function DraftSettings() {
  const { t } = useTranslation();
  const { friends, isLoading } = useFriends();
  const router = useRouter();
  const form = useForm<DraftSettingsFormValues>({
    resolver: zodResolver(getDraftSettingsSchema(t)),
    defaultValues: {
      opponentId: "",
      user_allowed_points: DEFAULT_DRAFT_SETTINGS.user_allowed_points,
      draft_size: DEFAULT_DRAFT_SETTINGS.draft_size,
      gods_amount: DEFAULT_DRAFT_SETTINGS.gods_amount,
      titans_amount: DEFAULT_DRAFT_SETTINGS.titans_amount,
    },
  });

  const {
    mutate: createSessionWithDraft,
    isPending: isCreatingSessionPending,
  } = api.sessions.createWithDraft.useMutation({
    onSuccess: ({ draft }) => {
      toast.success(t("sessionCreatedSuccessfully"));
      router.push(`/draft/${draft.id}`);
    },
    onError: (error) => {
      console.error("Error creating session:", error);
      toast.error(`${t("errorCreatingSession")}: ${error.message}`);
    },
  });

  const opponentOptions = useMemo(
    () =>
      friends.map((friend) => ({
        value: friend.id,
        label: friend.displayName,
      })),
    [friends]
  );

  const handleSubmit = (values: DraftSettingsFormValues) => {
    createSessionWithDraft(values);
  };

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 flex-1"
        >
          <div className="flex flex-col gap-6">
            <div className="max-w-[400px]">
              <SelectWithLoading
                control={form.control}
                name="opponentId"
                labelKey="selectYourOpponent"
                options={opponentOptions}
                isLoading={isLoading}
                emptyMessageKey="noFriendsYet"
              />
            </div>
            <div className="max-w-[400px]">
              <SelectWithLoading
                control={form.control}
                name="user_allowed_points"
                labelKey="userAllowedPoints"
                options={USER_ALLOWED_POINTS_OPTIONS}
                disabled={true}
              />
            </div>
            <div className="max-w-[400px]">
              <SelectWithLoading
                control={form.control}
                name="draft_size"
                labelKey="draftCount"
                options={DRAFT_SIZE_OPTIONS}
                disabled={true}
              />
            </div>
            <div className="max-w-[400px]">
              <NumberInputField
                control={form.control}
                name="titans_amount"
                labelKey="titansAmount"
              />
            </div>
            <div className="max-w-[400px]">
              <NumberInputField
                control={form.control}
                name="gods_amount"
                labelKey="godsAmount"
              />
            </div>
          </div>
          <div className="flex-shrink-0 mt-auto flex justify-end">
            <ShimmerButton
              type="submit"
              className="px-8 py-4 text-lg font-semibold"
              loading={form.formState.isSubmitting || isCreatingSessionPending}
              disabled={isLoading || friends.length === 0}
            >
              {form.formState.isSubmitting ? t("loading") : t("generateDraft")}
            </ShimmerButton>
          </div>
        </form>
      </Form>
      {(isLoading || isCreatingSessionPending) && <Loader />}
    </div>
  );
}
