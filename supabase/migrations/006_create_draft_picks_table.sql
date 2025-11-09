create table public.draft_picks (
  id uuid not null default extensions.uuid_generate_v4 (),
  draft_id uuid not null,
  player_id uuid not null,
  card_id uuid not null,
  pick_order integer not null,
  created_at timestamp with time zone null default now(),
  constraint draft_picks_pkey primary key (id),
  constraint draft_picks_draft_id_pick_order_key unique (draft_id, pick_order),
  constraint draft_picks_draft_id_player_id_card_id_key unique (draft_id, player_id, card_id),
  constraint draft_picks_card_id_fkey foreign KEY (card_id) references cards (id) on delete RESTRICT,
  constraint draft_picks_draft_id_fkey foreign KEY (draft_id) references drafts (id) on delete CASCADE,
  constraint draft_picks_player_id_fkey foreign KEY (player_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_draft_picks_draft on public.draft_picks using btree (draft_id) TABLESPACE pg_default;

create index IF not exists idx_draft_picks_player on public.draft_picks using btree (player_id) TABLESPACE pg_default;

create index IF not exists idx_draft_picks_card on public.draft_picks using btree (card_id) TABLESPACE pg_default;

create index IF not exists idx_draft_picks_order on public.draft_picks using btree (draft_id, pick_order) TABLESPACE pg_default;