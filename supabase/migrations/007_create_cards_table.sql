create table public.cards (
  id uuid not null default extensions.uuid_generate_v4 (),
  unit_name text not null,
  unit_type text not null,
  cost integer not null,
  amount_of_card_activations integer null default 0,
  strategic_value integer null,
  talents text[] null,
  class text null,
  image_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint cards_pkey primary key (id),
  constraint cards_unit_name_key unique (unit_name),
  constraint cards_class_check check (
    (
      class = any (
        array[
          'AQUATIC'::text,
          'FIREPROOF'::text,
          'FLYING'::text,
          'BOREAL'::text,
          'HUGE'::text
        ]
      )
    )
  ),
  constraint cards_unit_type_check check (
    (
      unit_type = any (
        array[
          'hero'::text,
          'monster'::text,
          'god'::text,
          'titan'::text,
          'troop'::text,
          'jarl'::text,
          'art_of_war'::text,
          'troop_attachment'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_cards_unit_type on public.cards using btree (unit_type) TABLESPACE pg_default;

create index IF not exists idx_cards_cost on public.cards using btree (cost) TABLESPACE pg_default;

create index IF not exists idx_cards_class on public.cards using btree (class) TABLESPACE pg_default;

create index IF not exists idx_cards_strategic_value on public.cards using btree (strategic_value) TABLESPACE pg_default;

create trigger update_cards_updated_at BEFORE
update on cards for EACH row
execute FUNCTION update_updated_at_column ();