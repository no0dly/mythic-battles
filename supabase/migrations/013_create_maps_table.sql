-- Create maps table
create table public.maps (
  id text not null,
  name text not null,
  image_url text not null,
  origin text not null,
  map_type text[] null,
  created_at timestamp with time zone null default now(),
  constraint maps_pkey primary key (id),
  constraint maps_origin_check check (
    origin = any (
      array[
        'ASG'::text,
        'CHT'::text,
        'COR'::text,
        'CRT'::text,
        'DIO'::text,
        'DUA'::text,
        'ECH'::text,
        'ETE'::text,
        'HEP'::text,
        'HER'::text,
        'ISF_COR'::text,
        'Jarl'::text,
        'JOR'::text,
        'JUD'::text,
        'KEE'::text,
        'KET'::text,
        'KRA'::text,
        'MAN'::text,
        'NID'::text,
        'OED'::text,
        'PAN'::text,
        'Polemarch'::text,
        'POS'::text,
        'RAG'::text,
        'RAG_COR'::text,
        'RIS'::text,
        'SUR'::text,
        'Tjati'::text,
        'TRO'::text,
        'YMI'::text,
        'Thermopylae'::text
      ]
    )
  )
) TABLESPACE pg_default;

create index if not exists idx_maps_origin on public.maps using btree (origin) TABLESPACE pg_default;

-- RLS
alter table public.maps enable row level security;

create policy "Maps are publicly readable"
  on public.maps for select
  to authenticated, anon
  using (true);

-- Seed data (24 maps)
insert into public.maps (id, name, image_url, origin) values
  ('ASG_BIFROST',                  'Bifrost',                   'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/ASG-Bifrost.jpg',                    'ASG'),
  ('ASG_VALHOLL',                  'Valholl',                   'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/ASG-Valholl.jpg',                    'ASG'),
  ('COR_MINOS_LABYRINTH',          'Minos Labyrinth',           'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/COR-Minos%20Labyrinth.jpg',          'COR'),
  ('COR_OLYMPUS_IN_RUINS',         'Olympus in Ruins',          'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/COR-Olympus%20in%20Ruins.jpg',       'COR'),
  ('COR_STYX_RIVER',               'Styx River',                'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/COR-Styx%20River.jpg',               'COR'),
  ('COR_TARTARUS',                 'Tartarus',                  'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/COR-Tartarus.jpg',                   'COR'),
  ('HEP_FORGE',                    'Forge',                     'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/HEP-Forge.jpg',                      'HEP'),
  ('HEP_VOLCANO',                  'Volcano',                   'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/HEP-Volcano.jpg',                    'HEP'),
  ('HER_GARDEN_OF_THE_HESPERODES', 'Garden of the Hesperodes',  'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/HER-Garden%20of%20the%20Hesperodes.jpg', 'HER'),
  ('HER_LERNEAN_SWAMP',            'Lernean Swamp',             'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/HER-Lernean%20Swamp.jpg',            'HER'),
  ('ISF_COR_COURT_OF_OSIRIS',      'Court of Osiris',           'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/ISF_COR-Court%20of%20Osiris.jpg',   'ISF_COR'),
  ('ISF_COR_MEMPHIS',              'Memphis',                   'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/ISF_COR-Memphis.jpg',               'ISF_COR'),
  ('ISF_COR_NUN',                  'Nun',                       'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/ISF_COR-Nun.jpg',                   'ISF_COR'),
  ('ISF_COR_THE_BREACH',           'The Breach',                'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/ISF_COR-The%20Breach.jpg',          'ISF_COR'),
  ('KRA_NOATUN',                   'Noatun',                    'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/KRA-Noatun.jpg',                     'KRA'),
  ('KRA_VINLAND',                  'Vinland',                   'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/KRA-Vinland.jpg',                    'KRA'),
  ('POS_AEGEAN_SEA',               'Aegean Sea',                'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/POS-Aegean%20Sea.jpg',               'POS'),
  ('POS_POLYPHEMUS_ISLAND',        'Polyphemus Island',         'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/POS-Polyphemus%20Island.jpg',        'POS'),
  ('RAG_COR_MIMIRS_WELL',          'Mimir''s Well',             'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/RAG_COR-Mimir''s%20Well.jpg',        'RAG_COR'),
  ('RAG_COR_NAGLFAR',              'Naglfar',                   'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/RAG_COR-Naglfar.jpg',               'RAG_COR'),
  ('RAG_COR_RAID_ON_HEDEBY',       'Raid on Hedeby',            'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/RAG_COR-Raid%20on%20Hedeby.jpg',    'RAG_COR'),
  ('RAG_COR_VIGRID',               'Vigrid',                    'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/RAG_COR-Vigrid.jpg',                'RAG_COR'),
  ('THERMOPYLAE_DEEP_SEA',         'Deep Sea',                  'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/Thermopylae-Deep%20Sea.jpg',        'Thermopylae'),
  ('THERMOPYLAE_THERMOPYLAE',      'Thermopylae',               'https://xlzywbaaazcbkghoywse.supabase.co/storage/v1/object/public/mythic-creatures/maps/Thermopylae-Thermopylae.jpg',       'Thermopylae');
