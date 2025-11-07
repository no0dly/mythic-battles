CREATE OR REPLACE FUNCTION public.update_user_sessions_on_session_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add session ID to player1's sessions array
    UPDATE public.users
    SET sessions = coalesce(sessions, '[]'::jsonb) || to_jsonb(NEW.id)
    WHERE id = NEW.player1_id;

    -- Add session ID to player2's sessions array (if player2 exists)
    IF NEW.player2_id IS NOT NULL THEN
      UPDATE public.users
      SET sessions = coalesce(sessions, '[]'::jsonb) || to_jsonb(NEW.id)
      WHERE id = NEW.player2_id;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove session ID from player1's sessions array
    UPDATE public.users
    SET sessions = COALESCE(
      (
        SELECT jsonb_agg(elem)
        FROM jsonb_array_elements(coalesce(sessions, '[]'::jsonb)) elem
        WHERE elem::text != to_jsonb(OLD.id)::text
      ),
      '[]'::jsonb
    )
    WHERE id = OLD.player1_id;

    -- Remove session ID from player2's sessions array (if player2 exists)
    IF OLD.player2_id IS NOT NULL THEN
      UPDATE public.users
      SET sessions = COALESCE(
        (
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(coalesce(sessions, '[]'::jsonb)) elem
          WHERE elem::text != to_jsonb(OLD.id)::text
        ),
        '[]'::jsonb
      )
      WHERE id = OLD.player2_id;
    END IF;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Trigger for INSERT and DELETE operations
CREATE TRIGGER update_user_sessions_on_change
  AFTER INSERT OR DELETE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_sessions_on_session_change();


