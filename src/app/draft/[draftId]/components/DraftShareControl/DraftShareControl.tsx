"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Copy, ExternalLink, Globe, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SHARE_PATH_PREFIX, SHARE_TITLE_MAX_LENGTH } from "@/utils/shared-drafts/constants";
import { SHARE_TITLE_INPUT_ID } from "./constants";
import type { DraftShareControlProps } from "./types";

export default function DraftShareControl({ draftId, finishedAt }: DraftShareControlProps) {
  const { t } = useTranslation();
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");

  const { data: share, isLoading } = api.sharedDrafts.getByDraftId.useQuery({ draftId });

  const refreshShare = () => utils.sharedDrafts.getByDraftId.invalidate({ draftId });

  const publishMutation = api.sharedDrafts.publish.useMutation({
    onSuccess: async () => {
      await refreshShare();
      setIsDialogOpen(false);
      toast.success(t("shareDraftPublished"));
    },
    onError: (error) => {
      toast.error(error.message || t("shareDraftPublishFailed"));
    },
  });

  const unpublishMutation = api.sharedDrafts.unpublish.useMutation({
    onSuccess: async () => {
      await refreshShare();
      toast.success(t("shareDraftUnpublished"));
    },
    onError: (error) => {
      toast.error(error.message || t("shareDraftUnpublishFailed"));
    },
  });

  const openDialog = () => {
    setTitle(
      t("shareDraftDefaultTitle", {
        date: new Date(finishedAt).toLocaleDateString(),
      }),
    );
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    publishMutation.mutate({ draftId, title: title.trim() });
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("shareLinkCopied"));
    } catch {
      toast.error(t("shareLinkCopyFailed"));
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="animate-spin" />
        {t("shareDraftMakePublic")}
      </Button>
    );
  }

  if (share) {
    const sharePath = `${SHARE_PATH_PREFIX}${share.slug}`;
    return (
      <div className="flex flex-wrap items-center gap-2" data-testid="draft-share-control">
        <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-800">
          <Globe />
          {t("shareDraftPublicBadge")}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(`${window.location.origin}${sharePath}`)}
          data-testid="draft-share-copy"
        >
          <Copy />
          {t("copyShareLink")}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={sharePath} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            {t("shareDraftOpenLink")}
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => unpublishMutation.mutate({ draftId })}
          disabled={unpublishMutation.isPending}
          data-testid="draft-share-unpublish"
        >
          {unpublishMutation.isPending ? <Loader2 className="animate-spin" /> : <Lock />}
          {t("shareDraftMakePrivate")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openDialog}
        data-testid="draft-share-publish"
      >
        <Globe />
        {t("shareDraftMakePublic")}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t("shareDraftDialogTitle")}</DialogTitle>
              <DialogDescription>{t("shareDraftDialogDescription")}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor={SHARE_TITLE_INPUT_ID}>{t("shareDraftTitleLabel")}</Label>
              <Input
                id={SHARE_TITLE_INPUT_ID}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={SHARE_TITLE_MAX_LENGTH}
                required
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={publishMutation.isPending || title.trim().length === 0}
                data-testid="draft-share-confirm"
              >
                {publishMutation.isPending && <Loader2 className="animate-spin" />}
                {t("shareDraftMakePublic")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
