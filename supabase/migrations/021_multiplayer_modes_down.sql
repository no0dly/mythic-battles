-- Reverts 021_multiplayer_modes.sql.
-- Not applied automatically: run it manually only if the multiplayer schema has to be removed.
-- Multiplayer sessions (mode <> '1v1') cannot be represented in the old schema and are deleted,
-- together with their games, drafts and invitations (ON DELETE CASCADE). 1v1 data is untouched.

BEGIN;

DELETE FROM public.sessions WHERE mode <> '1v1';

-- ---------------------------------------------------------------------------
-- draft_reset_requests
-- ---------------------------------------------------------------------------
DELETE FROM public.draft_reset_requests WHERE opponent_id IS NULL;

UPDATE public.draft_reset_requests SET status = 'cancelled' WHERE status = 'declined';

ALTER TABLE public.draft_reset_requests DROP CONSTRAINT IF EXISTS draft_reset_requests_status_check;
ALTER TABLE public.draft_reset_requests
  ADD CONSTRAINT draft_reset_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired'));

ALTER TABLE public.draft_reset_requests ALTER COLUMN opponent_id SET NOT NULL;

DROP INDEX IF EXISTS public.draft_reset_requests_required_approver_ids_idx;

ALTER TABLE public.draft_reset_requests
  DROP COLUMN IF EXISTS required_approver_ids,
  DROP COLUMN IF EXISTS approved_ids;

-- ---------------------------------------------------------------------------
-- Match statistics: restore the function from migration 020 unchanged.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.handle_finished_game_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_player1 uuid;
  v_player2 uuid;
  v_loser uuid;
  v_caller uuid := (SELECT auth.uid());
  -- Must match SOLO_PRACTICE_PLAYER_ID in src/types/constants.ts
  v_practice uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF OLD.status = 'finished' OR NEW.status IS DISTINCT FROM 'finished' THEN
    RETURN NEW;
  END IF;

  -- Practice games have no winner and should not affect ranked stats.
  IF NEW.winner_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT player1_id, player2_id
  INTO v_player1, v_player2
  FROM public.sessions
  WHERE id = NEW.session_id;

  IF v_player1 IS NULL THEN
    RAISE EXCEPTION 'session % not found', NEW.session_id;
  END IF;

  IF v_caller IS DISTINCT FROM v_player1 AND v_caller IS DISTINCT FROM v_player2 THEN
    RAISE EXCEPTION 'not authorized to apply match statistics';
  END IF;

  IF NEW.winner_id IS DISTINCT FROM v_player1 AND NEW.winner_id IS DISTINCT FROM v_player2 THEN
    RAISE EXCEPTION 'winner is not part of this session';
  END IF;

  v_loser := CASE
    WHEN NEW.winner_id = v_player1 THEN v_player2
    ELSE v_player1
  END;

  PERFORM private.apply_game_result_to_user_statistics(NEW.winner_id, true);

  IF v_loser IS DISTINCT FROM v_practice THEN
    PERFORM private.apply_game_result_to_user_statistics(v_loser, false);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_finished_game_statistics() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS policies added by 021
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "sessions_select_by_player_ids" ON public.sessions;
DROP POLICY IF EXISTS "sessions_update_by_player_ids" ON public.sessions;
DROP POLICY IF EXISTS "games_select_by_player_ids" ON public.games;
DROP POLICY IF EXISTS "games_insert_by_player_ids" ON public.games;
DROP POLICY IF EXISTS "games_update_by_player_ids" ON public.games;
DROP POLICY IF EXISTS "game_invitations_select_by_session_players" ON public.game_invitations;
DROP POLICY IF EXISTS "game_invitations_update_by_session_players" ON public.game_invitations;
DROP POLICY IF EXISTS "drafts_select_by_player_ids" ON public.drafts;
DROP POLICY IF EXISTS "drafts_insert_by_player_ids" ON public.drafts;
DROP POLICY IF EXISTS "drafts_update_by_player_ids" ON public.drafts;
DROP POLICY IF EXISTS "drafts_delete_by_player_ids" ON public.drafts;
DROP POLICY IF EXISTS "draft_reset_requests_select_by_player_ids" ON public.draft_reset_requests;
DROP POLICY IF EXISTS "draft_reset_requests_insert_by_player_ids" ON public.draft_reset_requests;
DROP POLICY IF EXISTS "draft_reset_requests_update_by_player_ids" ON public.draft_reset_requests;
DROP POLICY IF EXISTS "draft_ready_checks_select_by_player_ids" ON public.draft_ready_checks;
DROP POLICY IF EXISTS "draft_ready_checks_insert_by_player_ids" ON public.draft_ready_checks;
DROP POLICY IF EXISTS "draft_ready_checks_update_by_player_ids" ON public.draft_ready_checks;
DROP POLICY IF EXISTS "draft_ready_checks_delete_by_player_ids" ON public.draft_ready_checks;

-- ---------------------------------------------------------------------------
-- Triggers and columns
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS fill_session_player_ids ON public.sessions;
DROP TRIGGER IF EXISTS fill_draft_player_ids ON public.drafts;
DROP FUNCTION IF EXISTS public.fill_player_ids_from_legacy_columns();

DROP INDEX IF EXISTS public.idx_sessions_player_ids;
DROP INDEX IF EXISTS public.idx_drafts_player_ids;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_mode_check;
ALTER TABLE public.sessions
  DROP COLUMN IF EXISTS mode,
  DROP COLUMN IF EXISTS player_ids,
  DROP COLUMN IF EXISTS player_teams,
  DROP COLUMN IF EXISTS player_scores;

ALTER TABLE public.drafts DROP CONSTRAINT IF EXISTS drafts_mode_check;
ALTER TABLE public.drafts
  DROP COLUMN IF EXISTS mode,
  DROP COLUMN IF EXISTS player_ids,
  DROP COLUMN IF EXISTS player_teams,
  DROP COLUMN IF EXISTS turn_order,
  DROP COLUMN IF EXISTS turn_index;

ALTER TABLE public.games DROP COLUMN IF EXISTS winner_ids;

ALTER TABLE public.draft_ready_checks DROP COLUMN IF EXISTS ready_player_ids;

ALTER TABLE public.shared_drafts DROP CONSTRAINT IF EXISTS shared_drafts_mode_check;
ALTER TABLE public.shared_drafts
  DROP COLUMN IF EXISTS mode,
  DROP COLUMN IF EXISTS armies;

-- ---------------------------------------------------------------------------
-- Extra practice opponents (sessions referencing them cascade on delete)
-- ---------------------------------------------------------------------------
DELETE FROM public.users
WHERE id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

DELETE FROM auth.users
WHERE id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

COMMIT;
