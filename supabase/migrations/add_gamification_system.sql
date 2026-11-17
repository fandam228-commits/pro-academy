-- ==============================================================================
-- Migration: Add Gamification System (XP Points, Daily Streak & Weekly Leaderboard)
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- ==============================================================================

-- 1. Create student_gamification table
CREATE TABLE IF NOT EXISTS student_gamification (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  grade_level TEXT NOT NULL DEFAULT 'Third Secondary (Baccalaureate)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create xp_transactions table for anti-farming audit log
CREATE TABLE IF NOT EXISTS xp_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'quiz_correct', 'quiz_bonus_90', 'mistake_resolved', 'translation_exercise', 'story_lesson'
  xp_earned INTEGER NOT NULL DEFAULT 0,
  reference_id TEXT, -- quizId, questionId, lessonId, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_sg_user_id ON student_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_sg_grade_weekly ON student_gamification(grade_level, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_sg_weekly_xp ON student_gamification(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_sg_total_xp ON student_gamification(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_xpt_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xpt_ref ON xp_transactions(user_id, action_type, reference_id);

-- 4. Row Level Security (RLS)
ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view gamification profiles" ON student_gamification;
CREATE POLICY "Public can view gamification profiles"
  ON student_gamification FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Students can update their own gamification" ON student_gamification;
CREATE POLICY "Students can update their own gamification"
  ON student_gamification FOR UPDATE
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can insert their own gamification" ON student_gamification;
CREATE POLICY "Students can insert their own gamification"
  ON student_gamification FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can view their own XP transactions" ON xp_transactions;
CREATE POLICY "Students can view their own XP transactions"
  ON xp_transactions FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can insert their own XP transactions" ON xp_transactions;
CREATE POLICY "Students can insert their own XP transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

-- 5. RPC Function: get_weekly_leaderboard(target_grade text)
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(target_grade TEXT DEFAULT NULL)
RETURNS TABLE (
  rank BIGINT,
  user_id TEXT,
  name TEXT,
  avatar TEXT,
  grade_level TEXT,
  weekly_xp INTEGER,
  total_xp INTEGER,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY sg.weekly_xp DESC, sg.total_xp DESC) AS rank,
    u.id AS user_id,
    COALESCE(u.name, 'طالب الأكاديمية') AS name,
    u.avatar,
    sg.grade_level,
    sg.weekly_xp,
    sg.total_xp,
    sg.current_streak
  FROM student_gamification sg
  LEFT JOIN users u ON u.id = sg.user_id
  WHERE (target_grade IS NULL OR target_grade = '' OR target_grade = 'all' OR sg.grade_level = target_grade)
  ORDER BY sg.weekly_xp DESC, sg.total_xp DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
