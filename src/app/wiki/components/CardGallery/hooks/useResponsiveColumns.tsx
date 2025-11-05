import { useEffect, useState } from "react";

const BREAKPOINTS = [
  { media: "(min-width: 1024px)", cols: 4 }, // lg
  { media: "(min-width: 768px)", cols: 3 }, // md
  { media: "(min-width: 640px)", cols: 2 }, // sm
] as const;

/**
 * Hook to get responsive column count using matchMedia
 * Checks breakpoints from largest to smallest
 */
export default function useResponsiveColumns(): number {
  const [columns, setColumns] = useState(() => {
    // SSR-safe initial value
    if (typeof window === "undefined") return 4;

    // Initialize with current breakpoint
    const mqls = BREAKPOINTS.map(({ media }) => window.matchMedia(media));
    const matched = BREAKPOINTS.find((_, i) => mqls[i]?.matches);
    return matched?.cols ?? 1;
  });

  useEffect(() => {
    const mqls = BREAKPOINTS.map(({ media }) => window.matchMedia(media));

    const updateColumns = () => {
      // Find first matching breakpoint (largest first)
      const matched = BREAKPOINTS.find((_, i) => mqls[i]?.matches);
      setColumns(matched?.cols ?? 1);
    };

    // Initial update
    updateColumns();

    // Listen for changes
    mqls.forEach((mql) => mql.addEventListener("change", updateColumns));

    // Cleanup
    return () => {
      mqls.forEach((mql) => mql.removeEventListener("change", updateColumns));
    };
  }, []);

  return columns;
}
