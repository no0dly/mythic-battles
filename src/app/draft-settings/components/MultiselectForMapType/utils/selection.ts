import { ALL_VALUE } from "@/types/constants";
import type { MapTypeValue } from "../types";

export function toDisplaySelection(
  value: MapTypeValue[] | undefined,
  optionCount: number,
): string[] {
  if (!value?.length) return [];
  if (value.includes(ALL_VALUE)) return [ALL_VALUE];
  if (optionCount > 0 && value.length === optionCount) return [ALL_VALUE];
  return value as string[];
}

export function resolveNextSelection(
  current: string[],
  incoming: string[],
  optionCount: number,
): string[] {
  const hadAll = current.includes(ALL_VALUE);
  const hasAll = incoming.includes(ALL_VALUE);

  if (!hadAll && hasAll) return [ALL_VALUE];
  if (hadAll && !hasAll) return [];

  const nonAll = incoming.filter((item) => item !== ALL_VALUE);
  return optionCount > 0 && nonAll.length === optionCount ? [ALL_VALUE] : nonAll;
}

export function toFormValue(next: string[]): MapTypeValue[] {
  return next.includes(ALL_VALUE) ? [ALL_VALUE] : next;
}
