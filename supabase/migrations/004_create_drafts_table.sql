create table public.drafts (
  id uuid not null default extensions.uuid_generate_v4 (),
  game_id uuid not null,
  player1_id uuid not null,
  player2_id uuid not null,
  draft_total_cost integer not null default 40,
  player_allowed_points integer not null default 18,
  initial_roll jsonb null default '[]'::jsonb,
  first_turn_user_id uuid null,
  draft_status text not null default 'rollForTurn'::text,
  draft_history jsonb null default '{"picks": []}'::jsonb,
  current_turn_user_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint drafts_pkey primary key (id),
  constraint drafts_player1_id_fkey foreign KEY (player1_id) references users (id) on delete CASCADE,
  constraint drafts_player2_id_fkey foreign KEY (player2_id) references users (id) on delete CASCADE,
  constraint drafts_current_turn_user_id_fkey foreign KEY (current_turn_user_id) references users (id) on delete set null,
  constraint drafts_first_turn_user_id_fkey foreign KEY (first_turn_user_id) references users (id) on delete set null,
  constraint drafts_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE,
  constraint drafts_player_allowed_points_check check ((player_allowed_points > 0)),
  constraint drafts_draft_status_check check (
    (
      draft_status = any (
        array[
          'rollForTurn'::text,
          'draft'::text,
          'resetRequested'::text,
          'finished'::text
        ]
      )
    )
  ),
  constraint drafts_draft_total_cost_check check ((draft_total_cost > 0)),
  constraint drafts_check check ((player1_id <> player2_id))
) TABLESPACE pg_default;

create index IF not exists idx_drafts_game on public.drafts using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_drafts_player1 on public.drafts using btree (player1_id) TABLESPACE pg_default;

create index IF not exists idx_drafts_player2 on public.drafts using btree (player2_id) TABLESPACE pg_default;

create index IF not exists idx_drafts_status on public.drafts using btree (draft_status) TABLESPACE pg_default;

create index IF not exists idx_drafts_current_turn on public.drafts using btree (current_turn_user_id) TABLESPACE pg_default;

create index IF not exists idx_drafts_initial_roll on public.drafts using gin (initial_roll) TABLESPACE pg_default;

create index IF not exists idx_drafts_draft_history on public.drafts using gin (draft_history) TABLESPACE pg_default;

create trigger update_drafts_updated_at BEFORE
update on drafts for EACH row
execute FUNCTION update_updated_at_column ();