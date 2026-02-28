"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useTranslation } from "react-i18next";
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ALL_VALUE, CARD_ORIGIN_FULL_NAME } from "@/types/constants";
import type { CardOrigin } from "@/types/database.types";
import type { DraftSettingsFormValues } from "@/app/draft-settings/components/DraftSettings/constants";

const ORIGIN_OPTIONS = Object.entries(CARD_ORIGIN_FULL_NAME).map(
  ([value, label]) => ({ value: value as CardOrigin, label })
);

const ORIGIN_LABEL_MAP = Object.fromEntries(
  ORIGIN_OPTIONS.map(({ value, label }) => [value, label])
);

const COMBOBOX_ITEMS = [ALL_VALUE, ...ORIGIN_OPTIONS.map((o) => o.value)];

interface MultiselectForOriginProps {
  value?: (CardOrigin | "all")[];
  onValueChange?: (value: (CardOrigin | "all")[]) => void;
}

export function MultiselectForOrigin({
  value: externalValue,
  onValueChange,
}: MultiselectForOriginProps) {
  const [selected, setSelected] = React.useState<string[]>(() => {
    if (!externalValue || externalValue.length === 0) return [ALL_VALUE];
    if (externalValue.includes(ALL_VALUE)) return [ALL_VALUE];
    if (externalValue.length === ORIGIN_OPTIONS.length) return [ALL_VALUE];
    return externalValue as string[];
  });

  const isAllSelected = selected.includes(ALL_VALUE);

  const handleValueChange = (newValue: string[]) => {
    const hadAll = selected.includes(ALL_VALUE);
    const hasAll = newValue.includes(ALL_VALUE);

    let next: string[];

    if (!hadAll && hasAll) {
      // User explicitly clicked "All"
      next = [ALL_VALUE];
    } else if (hadAll && !hasAll) {
      // User deselected "All"
      next = [];
    } else {
      // Normal selection — collapse to "All" if every individual origin is picked
      const nonAll = newValue.filter((v) => v !== ALL_VALUE);
      next = nonAll.length === ORIGIN_OPTIONS.length ? [ALL_VALUE] : nonAll;
    }

    setSelected(next);
    onValueChange?.(
      next.includes(ALL_VALUE)
        ? [ALL_VALUE]
        : (next as CardOrigin[])
    );
  };

  const { t } = useTranslation();
  const anchor = useComboboxAnchor();

  const getLabel = (item: string) =>
    item === ALL_VALUE ? t("all") : (ORIGIN_LABEL_MAP[item] ?? item);

  return (
    <Combobox
      items={COMBOBOX_ITEMS}
      multiple
      value={selected}
      onValueChange={handleValueChange}
    >
      <div className="relative">
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {isAllSelected ? (
              <ComboboxChip>{t("all")}</ComboboxChip>
            ) : (
              selected.map((item) => (
                <ComboboxChip key={item}>
                  {getLabel(item)}
                </ComboboxChip>
              ))
            )}
          </ComboboxValue>
          <ComboboxChipsInput />
        </ComboboxChips>
        {selected.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleValueChange([])}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 h-6 w-6 p-0 opacity-50 hover:opacity-100"
          >
            <XIcon className="pointer-events-none size-4" />
          </Button>
        )}
      </div>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{t("noItemsFound")}</ComboboxEmpty>
        <div className="p-1 pb-0">
          <ComboboxItem value={ALL_VALUE}>{t("all")}</ComboboxItem>
        </div>
        <ComboboxSeparator />
        <ComboboxList>
          {(item) =>
            item === ALL_VALUE ? null : (
              <ComboboxItem key={item} value={item} disabled={isAllSelected}>
                {getLabel(item)}
              </ComboboxItem>
            )
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

interface MultiSelectForOriginFieldProps {
  control: Control<DraftSettingsFormValues>;
  labelKey: string;
}

export function MultiSelectForOriginField({
  control,
  labelKey,
}: MultiSelectForOriginFieldProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name="origins"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(labelKey)}</FormLabel>
          <MultiselectForOrigin
            value={field.value}
            onValueChange={field.onChange}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default MultiselectForOrigin;
