"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchUsers } from "@/hooks/useUserProfile";
import { SEARCH_DEFAULTS } from "@/utils/users/constants";

export type SelectedUser = {
  id: string;
  displayName: string;
};

interface UserComboboxProps {
  value: SelectedUser | null;
  onValueChange: (user: SelectedUser | null) => void;
  disabled?: boolean;
}

export default function UserCombobox({
  value,
  onValueChange,
  disabled = false,
}: UserComboboxProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const debouncedQuery = useDebouncedValue(
    searchValue.trim(),
    SEARCH_DEFAULTS.DEBOUNCE_MS
  );
  const canSearch = debouncedQuery.length >= SEARCH_DEFAULTS.MIN_QUERY_LENGTH;

  const { users, isLoading } = useSearchUsers(
    debouncedQuery,
    SEARCH_DEFAULTS.LIMIT,
    { enabled: canSearch }
  );

  const searchResults = useMemo<SelectedUser[]>(
    () =>
      users.map((user) => ({
        id: user.id,
        displayName: user.displayName,
      })),
    [users]
  );

  const items = useMemo(() => {
    if (!value) return searchResults;
    if (searchResults.some((user) => user.id === value.id)) {
      return searchResults;
    }
    return [...searchResults, value];
  }, [searchResults, value]);

  const trimmedSearch = searchValue.trim();
  const isDebouncing =
    trimmedSearch !== debouncedQuery &&
    trimmedSearch.length >= SEARCH_DEFAULTS.MIN_QUERY_LENGTH;

  const emptyMessage = (() => {
    if (isLoading || isDebouncing) return t("loading");
    if (trimmedSearch.length < SEARCH_DEFAULTS.MIN_QUERY_LENGTH) {
      return t("friendInviteMinSearchHint");
    }
    return t("userNotFound");
  })();

  function getUserLabel(user: SelectedUser) {
    return user.displayName;
  }

  function isSameUser(item: SelectedUser, selected: SelectedUser | null) {
    return selected != null && item.id === selected.id;
  }

  function handleValueChange(nextValue: SelectedUser | null) {
    onValueChange(nextValue);
    if (nextValue) {
      setSearchValue("");
    }
  }

  function handleInputValueChange(
    nextSearchValue: string,
    details: { reason: string }
  ) {
    if (details.reason === "item-press") return;
    setSearchValue(nextSearchValue);
  }

  function renderUserItem(user: SelectedUser) {
    return (
      <ComboboxItem key={user.id} value={user}>
        {user.displayName}
      </ComboboxItem>
    );
  }

  return (
    <div className="w-full min-w-0 flex-1">
      <Combobox
        items={items}
        value={value}
        filter={null}
        disabled={disabled}
        itemToStringLabel={getUserLabel}
        isItemEqualToValue={isSameUser}
        onValueChange={handleValueChange}
        onInputValueChange={handleInputValueChange}
      >
        <ComboboxInput
          className="w-full"
          placeholder={t("friendNamePlaceholder")}
          disabled={disabled}
          showClear
          autoComplete="off"
        />
        {/* Portal to body + high z-index so panel overflow never clips it */}
        <ComboboxContent className="max-h-56 z-[100]">
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>{renderUserItem}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
