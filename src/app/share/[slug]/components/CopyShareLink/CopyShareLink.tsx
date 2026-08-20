"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COPY_FEEDBACK_MS } from "./constants";

export default function CopyShareLink() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t("shareLinkCopied"));
    } catch {
      toast.error(t("shareLinkCopyFailed"));
      return;
    }

    window.setTimeout(() => {
      setCopied(false);
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
