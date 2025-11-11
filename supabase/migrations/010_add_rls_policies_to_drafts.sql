-- Enable Row Level Security for drafts table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
    AND c.relname = 'drafts'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS Policies for drafts (idempotent - create only if not exists)

-- Users can view drafts where they are participants (player1_id or player2_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'drafts' 
    AND policyname = 'Users can view their drafts'
  ) THEN
    CREATE POLICY "Users can view their drafts"
      ON public.drafts
      FOR SELECT
      USING (
        auth.uid() = player1_id OR auth.uid() = player2_id
      );
  END IF;
END $$;

-- Users can create drafts (as player1_id or player2_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'drafts' 
    AND policyname = 'Users can create drafts'
  ) THEN
    CREATE POLICY "Users can create drafts"
      ON public.drafts
      FOR INSERT
      WITH CHECK (
        auth.uid() = player1_id OR auth.uid() = player2_id
      );
  END IF;
END $$;

-- Users can update drafts where they are participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'drafts' 
    AND policyname = 'Users can update their drafts'
  ) THEN
    CREATE POLICY "Users can update their drafts"
      ON public.drafts
      FOR UPDATE
      USING (
        auth.uid() = player1_id OR auth.uid() = player2_id
      )
      WITH CHECK (
        auth.uid() = player1_id OR auth.uid() = player2_id
      );
  END IF;
END $$;

-- Users can delete drafts where they are participants (optional, if needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'drafts' 
    AND policyname = 'Users can delete their drafts'
  ) THEN
    CREATE POLICY "Users can delete their drafts"
      ON public.drafts
      FOR DELETE
      USING (
        auth.uid() = player1_id OR auth.uid() = player2_id
      );
  END IF;
END $$;

