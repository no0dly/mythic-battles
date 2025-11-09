create view public.drafts_with_state as
select
  id,
  game_id,
  player1_id,
  player2_id,
  draft_total_cost,
  player_allowed_points,
  initial_roll,
  first_turn_user_id,
  draft_status,
  draft_history,
  current_turn_user_id,
  created_at,
  updated_at,
  player_allowed_points - COALESCE(
    (
      select
        sum(c.cost) as sum
      from
        draft_picks dp
        join cards c on dp.card_id = c.id
      where
        dp.draft_id = d.id
        and dp.player_id = d.player1_id
    ),
    0::bigint
  ) as player1_remaining_points,
  player_allowed_points - COALESCE(
    (
      select
        sum(c.cost) as sum
      from
        draft_picks dp
        join cards c on dp.card_id = c.id
      where
        dp.draft_id = d.id
        and dp.player_id = d.player2_id
    ),
    0::bigint
  ) as player2_remaining_points
from
  drafts d;