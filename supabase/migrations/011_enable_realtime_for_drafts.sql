-- Enable Realtime for drafts table
-- This allows clients to subscribe to changes in the drafts table
-- Idempotent: check if table is already in publication before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'drafts'
    AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drafts;
  END IF;
END $$;

