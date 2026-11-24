-- Let draft players publish a finished draft as a shared draft.
-- Snapshots keep pick order and pool with player ids replaced by seat labels (A..D),
-- so share pages stay anonymous.

ALTER TABLE public.shared_drafts
  ADD COLUMN IF NOT EXISTS source_draft_id uuid NULL,
  ADD COLUMN IF NOT EXISTS draft_history jsonb NULL,
  ADD COLUMN IF NOT EXISTS draft_pool uuid[] NULL;

ALTER TABLE public.shared_drafts DROP CONSTRAINT IF EXISTS shared_drafts_source_draft_id_fkey;
ALTER TABLE public.shared_drafts
  ADD CONSTRAINT shared_drafts_source_draft_id_fkey
  FOREIGN KEY (source_draft_id) REFERENCES public.drafts (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS shared_drafts_source_draft_id_key
  ON public.shared_drafts (source_draft_id);

DROP POLICY IF EXISTS "Draft players can share finished drafts" ON public.shared_drafts;
CREATE POLICY "Draft players can share finished drafts" ON public.shared_drafts
  FOR INSERT TO authenticated
  WITH CHECK (
    source_draft_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = source_draft_id
        AND d.draft_status = 'finished'
        AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "Draft players can unshare drafts" ON public.shared_drafts;
CREATE POLICY "Draft players can unshare drafts" ON public.shared_drafts
  FOR DELETE TO authenticated
  USING (
    source_draft_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = source_draft_id
        AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );
