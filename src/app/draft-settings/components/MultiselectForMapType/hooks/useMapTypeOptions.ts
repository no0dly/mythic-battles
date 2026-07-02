import { useMemo } from "react";
import { api } from "@/trpc/client";

export function useMapTypeOptions() {
  const { data: maps = [] } = api.maps.list.useQuery();

  const mapTypeOptions = useMemo(() => {
    const types = new Set<string>();
    maps.forEach((map) => {
      map.map_type?.forEach((type) => types.add(type));
    });
    return Array.from(types).sort();
  }, [maps]);

  return mapTypeOptions;
}
