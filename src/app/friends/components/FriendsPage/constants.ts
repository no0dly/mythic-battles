import { ValueOf } from "@/types/interfaces";


export const TAB_VALUES = {
  FRIENDS: "friends",
  INCOMING: "incoming",
  SENT: "sent",
} as const;

export type TabValuesType = ValueOf<typeof TAB_VALUES>;

