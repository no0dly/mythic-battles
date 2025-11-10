"use client";

import { useTranslation } from "react-i18next";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
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

interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithLoadingProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  labelKey?: string;
  options: readonly SelectOption[];
  isLoading?: boolean;
  placeholderKey?: string;
  emptyMessageKey?: string;
  disabled?: boolean;
}

export const SelectWithLoading = <T extends FieldValues>({
  control,
  name,
  labelKey,
  options,
  isLoading = false,
  placeholderKey,
  emptyMessageKey = "noFriendsYet",
  disabled = false,
}: SelectWithLoadingProps<T>) => {
  const { t } = useTranslation();

  // Determine placeholder
  const getPlaceholder = () => {
    if (isLoading) return t("loading");
    if (placeholderKey) return t(placeholderKey);
    if (labelKey) return t(labelKey);
    return "";
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Auto-detect if we need number conversion based on field value type
        const isNumberField = typeof field.value === "number";
        const stringValue = isNumberField
          ? field.value?.toString()
          : field.value;

        return (
          <FormItem>
            {labelKey && <FormLabel>{t(labelKey)}</FormLabel>}
            <FormControl>
              <Select
                value={stringValue}
                onValueChange={(value) => {
                  field.onChange(isNumberField ? Number(value) : value);
                }}
                disabled={isLoading || disabled}
              >
                <SelectTrigger
                  className={`w-full ${
                    isLoading ? "[&>svg:last-of-type]:hidden" : ""
                  }`}
                >
                  <SelectValue placeholder={getPlaceholder()} />
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
                  ) : options.length === 0 ? (
                    <SelectItem value="no-options" disabled>
                      {t(emptyMessageKey)}
                    </SelectItem>
                  ) : (
                    options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
