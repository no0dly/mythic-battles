-- Apply win/loss statistics for both players when a game is marked finished.
-- Runs as SECURITY DEFINER so it can update both users rows (RLS only allows
-- a player to update their own profile). Kept in private so it is not an RPC.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.apply_game_result_to_user_statistics(
  p_user_id uuid,
  p_is_win boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
  v_wins int;
  v_losses int;
  v_longest_win int;
  v_longest_loss int;
  v_new_wins int;
  v_new_losses int;
  v_new_total int;
BEGIN
  SELECT statistics INTO v_stats
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user % not found', p_user_id;
  END IF;

  v_wins := COALESCE((v_stats->>'wins')::int, 0);
  v_losses := COALESCE((v_stats->>'losses')::int, 0);
  v_longest_win := COALESCE((v_stats->>'longest_win_streak')::int, 0);
  v_longest_loss := COALESCE((v_stats->>'longest_loss_streak')::int, 0);

  v_new_wins := CASE WHEN p_is_win THEN v_wins + 1 ELSE v_wins END;
  v_new_losses := CASE WHEN p_is_win THEN v_losses ELSE v_losses + 1 END;
  v_new_total := COALESCE((v_stats->>'total_games')::int, 0) + 1;

  UPDATE public.users
  SET statistics = jsonb_build_object(
    'wins', v_new_wins,
    'losses', v_new_losses,
    'total_games', v_new_total,
    'longest_win_streak', CASE
      WHEN p_is_win THEN GREATEST(v_longest_win, v_new_wins)
      ELSE v_longest_win
    END,
    'longest_loss_streak', CASE
      WHEN NOT p_is_win THEN GREATEST(v_longest_loss, v_new_losses)
      ELSE v_longest_loss
    END
  )
  WHERE id = p_user_id;
END;
$$;

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

DROP TRIGGER IF EXISTS apply_match_statistics_on_game_finish ON public.games;

CREATE TRIGGER apply_match_statistics_on_game_finish
AFTER UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION private.handle_finished_game_statistics();

REVOKE ALL ON FUNCTION private.apply_game_result_to_user_statistics(uuid, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.handle_finished_game_statistics() FROM PUBLIC, anon, authenticated;
