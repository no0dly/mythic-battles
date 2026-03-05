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
import { ALL_VALUE } from "@/types/constants";
import { api } from "@/trpc/client";
import type { DraftSettingsFormValues } from "@/app/draft-settings/components/DraftSettings/constants";

interface MultiselectForMapTypeProps {
  value?: (string | "all")[];
  onValueChange?: (value: (string | "all")[]) => void;
}

export function MultiselectForMapType({
  value: externalValue,
  onValueChange,
}: MultiselectForMapTypeProps) {
  const { t } = useTranslation();
  const { data: maps = [] } = api.maps.list.useQuery();

  const mapTypeOptions = React.useMemo(() => {
    const types = new Set<string>();
    maps.forEach((map) => {
      map.map_type?.forEach((type) => types.add(type));
    });
    return Array.from(types).sort();
  }, [maps]);

  const comboboxItems = [ALL_VALUE, ...mapTypeOptions];

  const [selected, setSelected] = React.useState<string[]>(() => {
    if (!externalValue || externalValue.length === 0) return [ALL_VALUE];
    if (externalValue.includes(ALL_VALUE)) return [ALL_VALUE];
    if (mapTypeOptions.length > 0 && externalValue.length === mapTypeOptions.length)
      return [ALL_VALUE];
    return externalValue as string[];
  });

  // Sync with external value changes
  React.useEffect(() => {
    if (!externalValue || externalValue.length === 0) {
      setSelected([ALL_VALUE]);
    } else if (externalValue.includes(ALL_VALUE)) {
      setSelected([ALL_VALUE]);
    } else {
      setSelected(externalValue as string[]);
    }
  }, [externalValue]);

  const isAllSelected = selected.includes(ALL_VALUE);

  const handleValueChange = (newValue: string[]) => {
    const hadAll = selected.includes(ALL_VALUE);
    const hasAll = newValue.includes(ALL_VALUE);

    let next: string[];

    if (!hadAll && hasAll) {
      next = [ALL_VALUE];
    } else if (hadAll && !hasAll) {
      next = [];
    } else {
      const nonAll = newValue.filter((v) => v !== ALL_VALUE);
      next =
        mapTypeOptions.length > 0 && nonAll.length === mapTypeOptions.length
          ? [ALL_VALUE]
          : nonAll;
    }

    setSelected(next);
    onValueChange?.(next.includes(ALL_VALUE) ? [ALL_VALUE] : next);
  };

  const anchor = useComboboxAnchor();

  const getLabel = (item: string) => (item === ALL_VALUE ? t("all") : item);

  return (
    <Combobox
      items={comboboxItems}
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
                <ComboboxChip key={item}>{getLabel(item)}</ComboboxChip>
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

export default MultiselectForMapType;
