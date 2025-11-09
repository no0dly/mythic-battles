"use client";

import { useTranslation } from "react-i18next";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { DraftSettingsFormValues } from "@/app/draft-settings/components/DraftSettings/constants";

interface NumberInputFieldProps {
  control: Control<DraftSettingsFormValues>;
  name: "gods_amount" | "titans_amount";
  labelKey: string;
}

export const NumberInputField = ({
  control,
  name,
  labelKey,
}: NumberInputFieldProps) => {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(labelKey)}</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
