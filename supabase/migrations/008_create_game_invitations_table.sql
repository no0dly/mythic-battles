create table public.game_invitations (
  id uuid not null default extensions.uuid_generate_v4 (),
  game_id uuid not null,
  session_id uuid not null,
  inviter_id uuid not null,
  invitee_id uuid not null,
  status text not null default 'pending'::text,
  message text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  responded_at timestamp with time zone null,
  constraint game_invitations_pkey primary key (id),
  constraint game_invitations_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE,
  constraint game_invitations_invitee_id_fkey foreign KEY (invitee_id) references users (id) on delete CASCADE,
  constraint game_invitations_inviter_id_fkey foreign KEY (inviter_id) references users (id) on delete CASCADE,
  constraint game_invitations_session_id_fkey foreign KEY (session_id) references sessions (id) on delete CASCADE,
  constraint game_invitations_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'accepted'::text,
          'rejected'::text,
          'cancelled'::text,
          'expired'::text
        ]
      )
    )
  ),
  constraint game_invitations_check check ((inviter_id <> invitee_id))
) TABLESPACE pg_default;

create index IF not exists idx_game_invitations_game on public.game_invitations using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_invitations_session on public.game_invitations using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_game_invitations_inviter on public.game_invitations using btree (inviter_id) TABLESPACE pg_default;

create index IF not exists idx_game_invitations_invitee on public.game_invitations using btree (invitee_id) TABLESPACE pg_default;

create index IF not exists idx_game_invitations_status on public.game_invitations using btree (status) TABLESPACE pg_default;

create trigger update_game_invitations_updated_at BEFORE
update on game_invitations for EACH row
execute FUNCTION update_updated_at_column ();