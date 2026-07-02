"use client";

import { useTranslation } from "react-i18next";
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { DraftSettingsFormValues } from "@/app/draft-settings/components/DraftSettings/constants";
import { MultiselectForMapType } from "./MultiselectForMapType";

interface MultiSelectForMapTypeFieldProps {
  control: Control<DraftSettingsFormValues>;
  labelKey: string;
}

export function MultiSelectForMapTypeField({
  control,
  labelKey,
}: MultiSelectForMapTypeFieldProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name="maps"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(labelKey)}</FormLabel>
          <MultiselectForMapType
            value={field.value}
            onValueChange={field.onChange}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
