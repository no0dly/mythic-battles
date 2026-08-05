"use client";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EmailFormValues,
  getEmailFormSchema,
} from "../../constants";
import { useSendFriendRequest } from "@/hooks";

export default function FriendInviteEmailTab() {
  const { t } = useTranslation();
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(getEmailFormSchema(t)),
    defaultValues: { email: "" },
  });

  function handleRequestSuccess() {
    emailForm.reset();
    emailForm.clearErrors();
  }

  const { sendRequest, isPending } = useSendFriendRequest(handleRequestSuccess);

  function handleSubmit(values: EmailFormValues) {
    sendRequest({ friendEmail: values.email.trim() });
  }

  return (
    <Form {...emailForm}>
      <form
        onSubmit={emailForm.handleSubmit(handleSubmit)}
        className="grid gap-2"
      >
        <Label className="text-sm font-medium leading-none">
          {t("friendEmail")}
        </Label>

        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem className="gap-2">
              <div className="flex h-9 items-center gap-2">
                <FormControl>
                  <Input
                    className="h-9 flex-1"
                    {...field}
                    disabled={isPending}
                    placeholder={t("friendEmailPlaceholder")}
                    autoComplete="off"
                  />
                </FormControl>
                <Button
                  type="submit"
                  className="h-9 px-3 shrink-0"
                  disabled={isPending}
                >
                  {isPending ? "..." : t("addFriend")}
                </Button>
              </div>
              <div className="min-h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
