"use client";

import { useEffect, useRef, useState } from "react";
import { FINE_POINTER_QUERY } from "./constants";

export function usePrefersFinePointer() {
  const [prefersFinePointer, setPrefersFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
    const update = () => setPrefersFinePointer(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersFinePointer;
}

export function useDismissOnOutsidePress(
  enabled: boolean,
  onDismiss: () => void,
  isExempt: (target: EventTarget | null) => boolean,
) {
  const onDismissRef = useRef(onDismiss);
  const isExemptRef = useRef(isExempt);

  useEffect(() => {
    onDismissRef.current = onDismiss;
    isExemptRef.current = isExempt;
  }, [onDismiss, isExempt]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (isExemptRef.current(event.target)) {
        return;
      }
      onDismissRef.current();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [enabled]);
}
