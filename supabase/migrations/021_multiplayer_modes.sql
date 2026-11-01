-- Multiplayer draft modes: 1v1 (existing), ffa3 (3-player free-for-all), team2v2 (4-player teams).
-- Additive only: every legacy column keeps being written for 1v1, so older code keeps working.
-- Reverse with 021_multiplayer_modes_down.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT '1v1',
  ADD COLUMN IF NOT EXISTS player_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS player_teams jsonb NULL,
  ADD COLUMN IF NOT EXISTS player_scores jsonb NULL;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_mode_check;
ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_mode_check CHECK (mode = ANY (ARRAY['1v1'::text, 'ffa3'::text, 'team2v2'::text]));

UPDATE public.sessions
SET player_ids = ARRAY[player1_id, player2_id]
WHERE cardinality(player_ids) = 0;

CREATE INDEX IF NOT EXISTS idx_sessions_player_ids ON public.sessions USING gin (player_ids);

-- ---------------------------------------------------------------------------
-- drafts
-- ---------------------------------------------------------------------------
ALTER TABLE public.drafts
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT '1v1',
  ADD COLUMN IF NOT EXISTS player_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS player_teams jsonb NULL,
  ADD COLUMN IF NOT EXISTS turn_order uuid[] NULL,
  ADD COLUMN IF NOT EXISTS turn_index integer NOT NULL DEFAULT 0;

ALTER TABLE public.drafts DROP CONSTRAINT IF EXISTS drafts_mode_check;
ALTER TABLE public.drafts
  ADD CONSTRAINT drafts_mode_check CHECK (mode = ANY (ARRAY['1v1'::text, 'ffa3'::text, 'team2v2'::text]));

UPDATE public.drafts
SET player_ids = ARRAY[player1_id, player2_id]
WHERE cardinality(player_ids) = 0;

CREATE INDEX IF NOT EXISTS idx_drafts_player_ids ON public.drafts USING gin (player_ids);

-- Rows inserted by code that doesn't know about player_ids still get them.
CREATE OR REPLACE FUNCTION public.fill_player_ids_from_legacy_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.player_ids IS NULL OR cardinality(NEW.player_ids) = 0 THEN
    NEW.player_ids := ARRAY[NEW.player1_id, NEW.player2_id];
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fill_session_player_ids ON public.sessions;
CREATE TRIGGER fill_session_player_ids
  BEFORE INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.fill_player_ids_from_legacy_columns();

DROP TRIGGER IF EXISTS fill_draft_player_ids ON public.drafts;
CREATE TRIGGER fill_draft_player_ids
  BEFORE INSERT ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION public.fill_player_ids_from_legacy_columns();

-- ---------------------------------------------------------------------------
-- games
-- ---------------------------------------------------------------------------
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS winner_ids uuid[] NULL;

-- ---------------------------------------------------------------------------
-- draft_reset_requests
-- ---------------------------------------------------------------------------
ALTER TABLE public.draft_reset_requests
  ADD COLUMN IF NOT EXISTS required_approver_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS approved_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

UPDATE public.draft_reset_requests
SET required_approver_ids = ARRAY[opponent_id]
WHERE cardinality(required_approver_ids) = 0 AND opponent_id IS NOT NULL;

ALTER TABLE public.draft_reset_requests ALTER COLUMN opponent_id DROP NOT NULL;

ALTER TABLE public.draft_reset_requests DROP CONSTRAINT IF EXISTS draft_reset_requests_status_check;
ALTER TABLE public.draft_reset_requests
  ADD CONSTRAINT draft_reset_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired', 'declined'));

CREATE INDEX IF NOT EXISTS draft_reset_requests_required_approver_ids_idx
  ON public.draft_reset_requests USING gin (required_approver_ids);

-- ---------------------------------------------------------------------------
-- draft_ready_checks
-- ---------------------------------------------------------------------------
ALTER TABLE public.draft_ready_checks
  ADD COLUMN IF NOT EXISTS ready_player_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

UPDATE public.draft_ready_checks
SET ready_player_ids = array_remove(ARRAY[first_player_id, second_player_id], NULL)
WHERE cardinality(ready_player_ids) = 0;

-- ---------------------------------------------------------------------------
-- shared_drafts
-- ---------------------------------------------------------------------------
ALTER TABLE public.shared_drafts
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT '1v1',
  ADD COLUMN IF NOT EXISTS armies jsonb NULL;

ALTER TABLE public.shared_drafts DROP CONSTRAINT IF EXISTS shared_drafts_mode_check;
ALTER TABLE public.shared_drafts
  ADD CONSTRAINT shared_drafts_mode_check CHECK (mode = ANY (ARRAY['1v1'::text, 'ffa3'::text, 'team2v2'::text]));

-- ---------------------------------------------------------------------------
-- RLS: membership through player_ids. Existing two-player policies are kept.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "sessions_select_by_player_ids" ON public.sessions;
CREATE POLICY "sessions_select_by_player_ids" ON public.sessions
  FOR SELECT USING ((SELECT auth.uid()) = ANY (player_ids));

DROP POLICY IF EXISTS "sessions_update_by_player_ids" ON public.sessions;
CREATE POLICY "sessions_update_by_player_ids" ON public.sessions
  FOR UPDATE USING ((SELECT auth.uid()) = ANY (player_ids));

DROP POLICY IF EXISTS "games_select_by_player_ids" ON public.games;
CREATE POLICY "games_select_by_player_ids" ON public.games
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = games.session_id AND (SELECT auth.uid()) = ANY (s.player_ids)
    )
  );

DROP POLICY IF EXISTS "games_insert_by_player_ids" ON public.games;
CREATE POLICY "games_insert_by_player_ids" ON public.games
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = games.session_id AND (SELECT auth.uid()) = ANY (s.player_ids)
    )
  );

DROP POLICY IF EXISTS "games_update_by_player_ids" ON public.games;
CREATE POLICY "games_update_by_player_ids" ON public.games
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = games.session_id AND (SELECT auth.uid()) = ANY (s.player_ids)
    )
  );

DROP POLICY IF EXISTS "game_invitations_select_by_session_players" ON public.game_invitations;
CREATE POLICY "game_invitations_select_by_session_players" ON public.game_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = game_invitations.session_id AND (SELECT auth.uid()) = ANY (s.player_ids)
    )
  );

DROP POLICY IF EXISTS "game_invitations_update_by_session_players" ON public.game_invitations;
CREATE POLICY "game_invitations_update_by_session_players" ON public.game_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = game_invitations.session_id AND (SELECT auth.uid()) = ANY (s.player_ids)
    )
  );

DROP POLICY IF EXISTS "drafts_select_by_player_ids" ON public.drafts;
CREATE POLICY "drafts_select_by_player_ids" ON public.drafts
  FOR SELECT USING ((SELECT auth.uid()) = ANY (player_ids));

DROP POLICY IF EXISTS "drafts_insert_by_player_ids" ON public.drafts;
CREATE POLICY "drafts_insert_by_player_ids" ON public.drafts
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = ANY (player_ids));

DROP POLICY IF EXISTS "drafts_update_by_player_ids" ON public.drafts;
CREATE POLICY "drafts_update_by_player_ids" ON public.drafts
  FOR UPDATE USING ((SELECT auth.uid()) = ANY (player_ids));

DROP POLICY IF EXISTS "drafts_delete_by_player_ids" ON public.drafts;
CREATE POLICY "drafts_delete_by_player_ids" ON public.drafts
  FOR DELETE USING ((SELECT auth.uid()) = ANY (player_ids));

DROP POLICY IF EXISTS "draft_reset_requests_select_by_player_ids" ON public.draft_reset_requests;
CREATE POLICY "draft_reset_requests_select_by_player_ids" ON public.draft_reset_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_reset_requests.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "draft_reset_requests_insert_by_player_ids" ON public.draft_reset_requests;
CREATE POLICY "draft_reset_requests_insert_by_player_ids" ON public.draft_reset_requests
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = requester_id
    AND EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_reset_requests.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "draft_reset_requests_update_by_player_ids" ON public.draft_reset_requests;
CREATE POLICY "draft_reset_requests_update_by_player_ids" ON public.draft_reset_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_reset_requests.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "draft_ready_checks_select_by_player_ids" ON public.draft_ready_checks;
CREATE POLICY "draft_ready_checks_select_by_player_ids" ON public.draft_ready_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_ready_checks.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "draft_ready_checks_insert_by_player_ids" ON public.draft_ready_checks;
CREATE POLICY "draft_ready_checks_insert_by_player_ids" ON public.draft_ready_checks
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = first_player_id
    AND EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_ready_checks.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "draft_ready_checks_update_by_player_ids" ON public.draft_ready_checks;
CREATE POLICY "draft_ready_checks_update_by_player_ids" ON public.draft_ready_checks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_ready_checks.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

DROP POLICY IF EXISTS "draft_ready_checks_delete_by_player_ids" ON public.draft_ready_checks;
CREATE POLICY "draft_ready_checks_delete_by_player_ids" ON public.draft_ready_checks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.id = draft_ready_checks.draft_id AND (SELECT auth.uid()) = ANY (d.player_ids)
    )
  );

-- ---------------------------------------------------------------------------
-- Match statistics: every winner gets a win, every other non-practice player a loss.
-- For 1v1 this produces exactly the same result as migration 020.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.handle_finished_game_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_players uuid[];
  v_winners uuid[];
  v_player uuid;
  v_caller uuid := (SELECT auth.uid());
  -- Must match PRACTICE_PLAYER_IDS in src/types/constants.ts
  v_practice uuid[] := ARRAY[
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid
  ];
BEGIN
  IF OLD.status = 'finished' OR NEW.status IS DISTINCT FROM 'finished' THEN
    RETURN NEW;
  END IF;

  -- Practice games have no winner and should not affect ranked stats.
  IF NEW.winner_id IS NULL AND COALESCE(cardinality(NEW.winner_ids), 0) = 0 THEN
    RETURN NEW;
  END IF;

  SELECT CASE
    WHEN cardinality(player_ids) > 0 THEN player_ids
    ELSE ARRAY[player1_id, player2_id]
  END
  INTO v_players
  FROM public.sessions
  WHERE id = NEW.session_id;

  IF v_players IS NULL THEN
    RAISE EXCEPTION 'session % not found', NEW.session_id;
  END IF;

  IF v_caller IS NULL OR NOT (v_caller = ANY (v_players)) THEN
    RAISE EXCEPTION 'not authorized to apply match statistics';
  END IF;

  v_winners := CASE
    WHEN COALESCE(cardinality(NEW.winner_ids), 0) > 0 THEN NEW.winner_ids
    ELSE ARRAY[NEW.winner_id]
  END;

  IF NOT (v_winners <@ v_players) THEN
    RAISE EXCEPTION 'winner is not part of this session';
  END IF;

  FOREACH v_player IN ARRAY v_players LOOP
    IF v_player = ANY (v_winners) THEN
      PERFORM private.apply_game_result_to_user_statistics(v_player, true);
    ELSIF NOT (v_player = ANY (v_practice)) THEN
      PERFORM private.apply_game_result_to_user_statistics(v_player, false);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_finished_game_statistics() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Extra practice opponents for 3- and 4-player practice drafts.
-- IDs must match PRACTICE_PLAYER_IDS in src/types/constants.ts
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_practice record;
BEGIN
  FOR v_practice IN
    SELECT * FROM (VALUES
      ('00000000-0000-0000-0000-000000000002'::uuid, 'solo-practice-2@internal.mythic-battles.local', 'Practice Opponent 2'),
      ('00000000-0000-0000-0000-000000000003'::uuid, 'solo-practice-3@internal.mythic-battles.local', 'Practice Opponent 3')
    ) AS t(id, email, display_name)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_practice.id) THEN
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
        v_practice.id,
        COALESCE((SELECT id FROM auth.instances LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid),
        'authenticated',
        'authenticated',
        v_practice.email,
        '',
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('display_name', v_practice.display_name),
        NOW(),
        NOW();
    END IF;

    INSERT INTO public.users (id, email, display_name)
    VALUES (v_practice.id, v_practice.email, v_practice.display_name)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

COMMIT;
