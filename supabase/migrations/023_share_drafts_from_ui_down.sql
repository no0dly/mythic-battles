DROP POLICY IF EXISTS "Draft players can unshare drafts" ON public.shared_drafts;
DROP POLICY IF EXISTS "Draft players can share finished drafts" ON public.shared_drafts;

DROP INDEX IF EXISTS public.shared_drafts_source_draft_id_key;
ALTER TABLE public.shared_drafts DROP CONSTRAINT IF EXISTS shared_drafts_source_draft_id_fkey;

ALTER TABLE public.shared_drafts
  DROP COLUMN IF EXISTS draft_pool,
  DROP COLUMN IF EXISTS draft_history,
  DROP COLUMN IF EXISTS source_draft_id;
