"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues, getFormSchema } from "./constants";
import { api } from "@/trpc/client";

interface FriendsListFormProps {
  isOpen: boolean;
}

export default function FriendsListForm({ isOpen }: FriendsListFormProps) {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      email: "",
    },
  });

  const utils = api.useUtils();
  
  const sendRequestMutation = api.friendships.sendRequest.useMutation({
    onSuccess: () => {
      utils.friendships.getSentRequests.invalidate();
      form.reset();
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (values: FormValues) => {
    sendRequestMutation.mutate({ friendEmail: values.email });
  };

  return (
    <div className="space-y-2 border-t pt-2 mt-auto pb-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <div className="space-y-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("friendEmail")}</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input 
                        className="flex-1" 
                        {...field}
                        disabled={sendRequestMutation.isPending}
                      />
                    </FormControl>
                    <Button 
                      type="submit" 
                      className="h-9 px-3"
                      disabled={sendRequestMutation.isPending}
                    >
                      {sendRequestMutation.isPending ? "..." : t("addFriend")}
                    </Button>
                  </div>
                  <div className="min-h-[20px] -mt-0.5">
                    <FormMessage />
                    {sendRequestMutation.isSuccess && (
                      <p className="text-xs text-green-600 dark:text-green-500">
                        {t("friendRequestSent")}
                      </p>
                    )}
                    {sendRequestMutation.isError && (
                      <p className="text-xs text-destructive">
                        {sendRequestMutation.error?.message || t("errorSendingRequest")}
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
