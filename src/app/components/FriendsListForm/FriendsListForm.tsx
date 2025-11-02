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

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (values: FormValues) => {
    console.log(values);
    form.reset();
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
                      <Input className="flex-1" {...field} />
                    </FormControl>
                    <Button type="submit" className="h-9 px-3">
                      {t("addFriend")}
                    </Button>
                  </div>
                  <div className="min-h-[20px] -mt-0.5">
                    <FormMessage />
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
