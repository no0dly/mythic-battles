"use client";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFriends } from "@/hooks";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle } from "lucide-react";
import {
  DraftSettingsFormValues,
  getDraftSettingsSchema,
  DRAFT_COUNT_OPTIONS,
  USER_ALLOWED_POINTS_OPTIONS,
} from "./constants";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";

export default function DraftSettings() {
  const { t } = useTranslation();
  const { friends, isLoading } = useFriends();
  const router = useRouter();
  const form = useForm<DraftSettingsFormValues>({
    resolver: zodResolver(getDraftSettingsSchema(t)),
    defaultValues: {
      opponentId: "",
      userAllowedPoints: 18,
      draftCount: 40,
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
          <div className="flex flex-col gap-20">
            <div className="max-w-[400px]">
              <FormField
                control={form.control}
                name="opponentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("selectYourOpponent")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          className={`w-full ${
                            isLoading ? "[&>svg:last-of-type]:hidden" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              isLoading
                                ? t("loading")
                                : t("chooseOneFromTheList")
                            }
                          />
                          {isLoading && (
                            <LoaderCircle className="h-4 w-4 animate-spin opacity-50 shrink-0 pointer-events-none" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {isLoading ? (
                            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              <span>{t("loading")}</span>
                            </div>
                          ) : friends.length === 0 ? (
                            <SelectItem value="no-friends" disabled>
                              {t("noFriendsYet")}
                            </SelectItem>
                          ) : (
                            friends.map((friend) => (
                              <SelectItem key={friend.id} value={friend.id}>
                                {friend.displayName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="max-w-[400px]">
              <FormField
                control={form.control}
                name="userAllowedPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("userAllowedPoints")}</FormLabel>
                    <FormControl>
                      <Select
                        disabled={true}
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("userAllowedPoints")} />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ALLOWED_POINTS_OPTIONS.map((count) => (
                            <SelectItem key={count} value={count.toString()}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="max-w-[400px]">
              <FormField
                control={form.control}
                name="draftCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("draftCount")}</FormLabel>
                    <FormControl>
                      <Select
                        disabled={true}
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("draftCount")} />
                        </SelectTrigger>
                        <SelectContent>
                          {DRAFT_COUNT_OPTIONS.map((count) => (
                            <SelectItem key={count} value={count.toString()}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
      {isLoading || (isCreatingSessionPending && <Loader />)}
    </div>
  );
}
