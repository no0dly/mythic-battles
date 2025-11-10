create table public.games (
  id uuid not null default extensions.uuid_generate_v4 (),
  session_id uuid not null,
  game_number integer not null,
  status text not null default 'available'::text,
  winner_id uuid null,
  draft_id uuid null,
  created_by uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  finished_at timestamp with time zone null,
  constraint games_pkey primary key (id),
  constraint games_session_id_game_number_key unique (session_id, game_number),
  constraint games_created_by_fkey foreign KEY (created_by) references users (id),
  constraint games_session_id_fkey foreign KEY (session_id) references sessions (id) on delete CASCADE,
  constraint games_draft_id_fkey foreign KEY (draft_id) references drafts (id) on delete set null,
  constraint games_winner_id_fkey foreign KEY (winner_id) references users (id) on delete set null,
  constraint games_status_check check (
    (
      status = any (
        array[
          'inviteToDraft'::text,
          'draft'::text,
          'draftResetRequest'::text,
          'inProgress'::text,
          'error'::text,
          'finished'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_games_session on public.games using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_games_status on public.games using btree (status) TABLESPACE pg_default;

create index IF not exists idx_games_draft on public.games using btree (draft_id) TABLESPACE pg_default;

create trigger update_games_updated_at BEFORE
update on games for EACH row
execute FUNCTION update_updated_at_column ();