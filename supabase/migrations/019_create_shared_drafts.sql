-- Public anonymous draft snapshots for share URLs.
-- One row = one draft (Player 1 / Player 2 card lists). No user FKs.
-- Insert draft rows separately; this migration only creates the table.

create table public.shared_drafts (
  id uuid not null default extensions.uuid_generate_v4 (),
  slug text not null,
  title text not null,
  player1_card_ids uuid[] not null,
  player2_card_ids uuid[] not null,
  map_id text null,
  map_side text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint shared_drafts_pkey primary key (id),
  constraint shared_drafts_slug_key unique (slug),
  constraint shared_drafts_slug_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint shared_drafts_map_id_fkey foreign KEY (map_id) references public.maps (id) on delete set null,
  constraint shared_drafts_map_side_check check (
    map_side is null or map_side = any (array['A'::text, 'B'::text])
  )
);

create trigger update_shared_drafts_updated_at BEFORE
update on shared_drafts for EACH row
execute FUNCTION update_updated_at_column ();

ALTER TABLE public.shared_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shared_drafts'
      AND policyname = 'Anyone can view shared drafts'
  ) THEN
    CREATE POLICY "Anyone can view shared drafts"
      ON public.shared_drafts
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
