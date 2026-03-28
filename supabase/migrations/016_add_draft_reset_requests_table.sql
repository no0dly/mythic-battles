-- Create draft_reset_requests table
CREATE TABLE IF NOT EXISTS draft_reset_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id     UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  game_id      UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  opponent_id  UUID NOT NULL REFERENCES auth.users(id),
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT draft_reset_requests_status_check CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired'))
);

-- Index for fast lookup by draft_id
CREATE INDEX IF NOT EXISTS draft_reset_requests_draft_id_idx ON draft_reset_requests(draft_id);

-- Index for fast lookup by opponent_id (used in notification subscriptions)
CREATE INDEX IF NOT EXISTS draft_reset_requests_opponent_id_idx ON draft_reset_requests(opponent_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_draft_reset_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER draft_reset_requests_updated_at
  BEFORE UPDATE ON draft_reset_requests
  FOR EACH ROW EXECUTE FUNCTION update_draft_reset_requests_updated_at();

-- RLS
ALTER TABLE draft_reset_requests ENABLE ROW LEVEL SECURITY;

-- Both participants of the draft can read
CREATE POLICY "draft_reset_requests_select" ON draft_reset_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_reset_requests.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Only participants can insert
CREATE POLICY "draft_reset_requests_insert" ON draft_reset_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id
    AND EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_reset_requests.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Only participants can update
CREATE POLICY "draft_reset_requests_update" ON draft_reset_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_reset_requests.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE draft_reset_requests;
