-- System user for solo practice drafts (player2 slot). Not used for login.
-- ID must match SOLO_PRACTICE_PLAYER_ID in src/types/constants.ts

DO $$
DECLARE
  practice_id uuid := '00000000-0000-0000-0000-000000000001';
  practice_email text := 'solo-practice@internal.mythic-battles.local';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = practice_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    SELECT
      practice_id,
      COALESCE((SELECT id FROM auth.instances LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid),
      'authenticated',
      'authenticated',
      practice_email,
      '',
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Practice Opponent"}'::jsonb,
      NOW(),
      NOW();
  END IF;

  INSERT INTO public.users (id, email, display_name)
  VALUES (practice_id, practice_email, 'Practice Opponent')
  ON CONFLICT (id) DO NOTHING;
END $$;
