-- ==============================================================================
-- Migration: Create user_mistakes table for Smart Mistakes Bank (بنك أخطائي الذكي)
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS user_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  wrong_answer TEXT,
  mistake_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'unresolved', -- 'unresolved' | 'mastered'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_mistakes_user_question_unique UNIQUE (user_id, question_id)
);

-- 2. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_question_id ON user_mistakes(question_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_status ON user_mistakes(status);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_status ON user_mistakes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_updated_at ON user_mistakes(updated_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
DROP POLICY IF EXISTS "Students can view their own mistakes" ON user_mistakes;
CREATE POLICY "Students can view their own mistakes"
  ON user_mistakes FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can insert their own mistakes" ON user_mistakes;
CREATE POLICY "Students can insert their own mistakes"
  ON user_mistakes FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can update their own mistakes" ON user_mistakes;
CREATE POLICY "Students can update their own mistakes"
  ON user_mistakes FOR UPDATE
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can delete their own mistakes" ON user_mistakes;
CREATE POLICY "Students can delete their own mistakes"
  ON user_mistakes FOR DELETE
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

-- 5. Trigger to automatically update updated_at timestamp on edit
CREATE OR REPLACE FUNCTION update_user_mistakes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_mistakes_timestamp ON user_mistakes;
CREATE TRIGGER trg_user_mistakes_timestamp
  BEFORE UPDATE ON user_mistakes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_mistakes_timestamp();
