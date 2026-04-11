-- Create draft_ready_checks table
CREATE TABLE IF NOT EXISTS draft_ready_checks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id         UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  game_id          UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  first_player_id  UUID NOT NULL REFERENCES auth.users(id),
  second_player_id UUID REFERENCES auth.users(id),
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT draft_ready_checks_status_check CHECK (status IN ('pending', 'expired'))
);

-- Only one pending ready check per draft at a time
CREATE UNIQUE INDEX IF NOT EXISTS draft_ready_checks_draft_id_pending_idx
  ON draft_ready_checks(draft_id)
  WHERE status = 'pending';

-- Index for fast lookup by draft_id
CREATE INDEX IF NOT EXISTS draft_ready_checks_draft_id_idx ON draft_ready_checks(draft_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_draft_ready_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER draft_ready_checks_updated_at
  BEFORE UPDATE ON draft_ready_checks
  FOR EACH ROW EXECUTE FUNCTION update_draft_ready_checks_updated_at();

-- RLS
ALTER TABLE draft_ready_checks ENABLE ROW LEVEL SECURITY;

-- Both participants of the draft can read
CREATE POLICY "draft_ready_checks_select" ON draft_ready_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_ready_checks.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Only participants can insert
CREATE POLICY "draft_ready_checks_insert" ON draft_ready_checks
  FOR INSERT
  WITH CHECK (
    auth.uid() = first_player_id
    AND EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_ready_checks.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Only participants can update
CREATE POLICY "draft_ready_checks_update" ON draft_ready_checks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_ready_checks.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Only participants can delete
CREATE POLICY "draft_ready_checks_delete" ON draft_ready_checks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM drafts
      WHERE drafts.id = draft_ready_checks.draft_id
        AND (drafts.player1_id = auth.uid() OR drafts.player2_id = auth.uid())
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE draft_ready_checks;
