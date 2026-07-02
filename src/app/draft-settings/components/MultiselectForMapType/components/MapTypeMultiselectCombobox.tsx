"use client";

import { XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { ALL_VALUE } from "@/types/constants";

interface MapTypeMultiselectComboboxProps {
  options: string[];
  selected: string[];
  isAllSelected: boolean;
  onValueChange: (value: string[]) => void;
  getLabel: (item: string) => string;
}

export function MapTypeMultiselectCombobox({
  options,
  selected,
  isAllSelected,
  onValueChange,
  getLabel,
}: MapTypeMultiselectComboboxProps) {
  const { t } = useTranslation();
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={[ALL_VALUE, ...options]}
      multiple
      value={selected}
      onValueChange={onValueChange}
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
            onClick={() => onValueChange([])}
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
