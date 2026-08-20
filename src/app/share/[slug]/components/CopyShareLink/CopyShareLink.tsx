"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COPY_FEEDBACK_MS } from "./constants";

export default function CopyShareLink() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t("shareLinkCopied"));
    } catch {
      toast.error(t("shareLinkCopyFailed"));
      return;
    }

    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimeoutRef.current = null;
    }, COPY_FEEDBACK_MS);
  }, [t]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      data-testid="copy-share-link"
      aria-label={t("copyShareLink")}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? t("shareLinkCopied") : t("copyShareLink")}
    </Button>
  );
}
