-- ==============================================================================
-- Migration: Create 1v1 Peer Challenges System (تحدي الأصدقاء 1v1)
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- Description:
--   Enables students to generate 5-question timed battle challenges, share
--   invite links via WhatsApp, and compete head-to-head on score and speed.
-- ==============================================================================

-- 1. Create peer_challenges table
CREATE TABLE IF NOT EXISTS peer_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT NOT NULL UNIQUE,
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_score INTEGER NOT NULL DEFAULT 0,
  creator_time_seconds INTEGER NOT NULL DEFAULT 0,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenger_id TEXT,
  challenger_name TEXT,
  challenger_score INTEGER,
  challenger_time_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'completed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_peer_ch_code ON peer_challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_peer_ch_creator ON peer_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_peer_ch_challenger ON peer_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_peer_ch_status ON peer_challenges(status);
CREATE INDEX IF NOT EXISTS idx_peer_ch_created ON peer_challenges(created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE peer_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view challenges by invite code" ON peer_challenges;
CREATE POLICY "Public can view challenges by invite code"
  ON peer_challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create challenges" ON peer_challenges;
CREATE POLICY "Authenticated users can create challenges"
  ON peer_challenges FOR INSERT
  WITH CHECK (
    auth.uid()::text = creator_id
    OR current_setting('request.jwt.claim.sub', true) = creator_id
    OR creator_id = current_user
  );

DROP POLICY IF EXISTS "Participants can update challenge results" ON peer_challenges;
CREATE POLICY "Participants can update challenge results"
  ON peer_challenges FOR UPDATE
  USING (
    auth.uid()::text = creator_id
    OR auth.uid()::text = challenger_id
    OR current_setting('request.jwt.claim.sub', true) = creator_id
    OR current_setting('request.jwt.claim.sub', true) = challenger_id
    OR creator_id = current_user
    OR challenger_id = current_user
  );
