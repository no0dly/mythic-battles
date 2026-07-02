import { useCallback, useMemo } from "react";
import { ALL_VALUE } from "@/types/constants";
import type { MapTypeValue } from "../types";
import {
  resolveNextSelection,
  toDisplaySelection,
  toFormValue,
} from "../utils/selection";

interface UseMapTypeSelectionParams {
  value?: MapTypeValue[];
  onValueChange?: (value: MapTypeValue[]) => void;
  optionCount: number;
}

export function useMapTypeSelection({
  value,
  onValueChange,
  optionCount,
}: UseMapTypeSelectionParams) {
  const selected = useMemo(
    () => toDisplaySelection(value, optionCount),
    [value, optionCount],
  );

  const handleValueChange = useCallback(
    (incoming: string[]) => {
      const next = resolveNextSelection(selected, incoming, optionCount);
      onValueChange?.(toFormValue(next));
    },
    [selected, optionCount, onValueChange],
  );

  return {
    selected,
    isAllSelected: selected.includes(ALL_VALUE),
    handleValueChange,
  };
}
