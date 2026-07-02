import { ALL_VALUE } from "@/types/constants";

export type MapTypeValue = string | typeof ALL_VALUE;

export interface MultiselectForMapTypeProps {
  value?: MapTypeValue[];
  onValueChange?: (value: MapTypeValue[]) => void;
}
