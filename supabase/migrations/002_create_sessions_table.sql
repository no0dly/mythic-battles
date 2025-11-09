create table public.sessions (
  id uuid not null default extensions.uuid_generate_v4 (),
  player1_id uuid not null,
  player2_id uuid not null,
  player1_session_score integer null default 0,
  player2_session_score integer null default 0,
  status text not null default 'available'::text,
  error_message text null,
  game_list jsonb null default '[]'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  finished_at timestamp with time zone null,
  constraint sessions_pkey primary key (id),
  constraint sessions_player1_id_fkey foreign KEY (player1_id) references users (id) on delete CASCADE,
  constraint sessions_player2_id_fkey foreign KEY (player2_id) references users (id) on delete CASCADE,
  constraint sessions_check check ((player1_id <> player2_id)),
  constraint sessions_status_check check (
    (
      status = any (
        array[
          'available'::text,
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

create index IF not exists idx_sessions_player1 on public.sessions using btree (player1_id) TABLESPACE pg_default;

create index IF not exists idx_sessions_player2 on public.sessions using btree (player2_id) TABLESPACE pg_default;

create index IF not exists idx_sessions_status on public.sessions using btree (status) TABLESPACE pg_default;

create index IF not exists idx_sessions_game_list on public.sessions using gin (game_list) TABLESPACE pg_default;

create trigger update_sessions_updated_at BEFORE
update on sessions for EACH row
execute FUNCTION update_updated_at_column ();