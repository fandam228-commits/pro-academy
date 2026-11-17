-- ==============================================================================
-- Master SQL Verification, Schema Fix & Idempotent Migration Script
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- Description:
--   Ensures all tables, columns, indexes, foreign keys, triggers, RLS policies,
--   and RPC functions exist idempotently with zero errors or schema conflicts.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Users Table Extensions & Verification
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  password TEXT,
  grade TEXT,
  stage TEXT,
  phone TEXT,
  parent_phone TEXT,
  student_code TEXT UNIQUE,
  streak INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all optional/recently added columns exist on users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'student_code') THEN
    ALTER TABLE users ADD COLUMN student_code TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak') THEN
    ALTER TABLE users ADD COLUMN streak INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
    ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
    ALTER TABLE users ADD COLUMN avatar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'parent_phone') THEN
    ALTER TABLE users ADD COLUMN parent_phone TEXT;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Smart Mistakes Bank (user_mistakes)
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_question_id ON user_mistakes(question_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_status ON user_mistakes(status);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_status ON user_mistakes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_updated_at ON user_mistakes(updated_at DESC);

-- Trigger for updated_at
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

-- ------------------------------------------------------------------------------
-- 3. Gamification System & XP Audit (student_gamification & xp_transactions)
-- ------------------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS xp_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sg_user_id ON student_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_sg_grade_weekly ON student_gamification(grade_level, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_sg_weekly_xp ON student_gamification(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_sg_total_xp ON student_gamification(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_xpt_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xpt_ref ON xp_transactions(user_id, action_type, reference_id);

-- ------------------------------------------------------------------------------
-- 4. Translation Academy (translation_exercises & user_translation_attempts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS translation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  direction TEXT NOT NULL DEFAULT 'en_to_ar', -- 'en_to_ar' | 'ar_to_en'
  exercise_type TEXT NOT NULL DEFAULT 'written', -- 'written' | 'mcq'
  difficulty TEXT NOT NULL DEFAULT 'standard', -- 'standard' | 'advanced' | 'exam_past'
  source_text TEXT NOT NULL,
  model_answer TEXT NOT NULL,
  alternative_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_vocabulary JSONB NOT NULL DEFAULT '[]'::jsonb,
  mcq_options JSONB,
  grammar_tip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_translation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  exercise_id UUID NOT NULL REFERENCES translation_exercises(id) ON DELETE CASCADE,
  user_input TEXT NOT NULL,
  accuracy_score INTEGER NOT NULL DEFAULT 0,
  matched_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  missed_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trans_ex_lookup ON translation_exercises(grade_level, direction, exercise_type);
CREATE INDEX IF NOT EXISTS idx_trans_ex_diff ON translation_exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_trans_att_user ON user_translation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_att_exercise ON user_translation_attempts(exercise_id);

-- ------------------------------------------------------------------------------
-- 5. Literature & Novel World (novel_chapters & student_literature_progress)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS novel_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  novel_title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_ar TEXT NOT NULL,
  audio_url TEXT,
  key_vocabulary JSONB NOT NULL DEFAULT '[]'::jsonb,
  characters JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_quotations JSONB NOT NULL DEFAULT '[]'::jsonb,
  critical_thinking_qs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_literature_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  chapter_id UUID NOT NULL REFERENCES novel_chapters(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  audio_completed BOOLEAN NOT NULL DEFAULT false,
  critical_thinking_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slp_user_chapter_unique UNIQUE (user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_nc_grade_novel ON novel_chapters(grade_level, novel_title, chapter_number);
CREATE INDEX IF NOT EXISTS idx_slp_user ON student_literature_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_slp_chapter ON student_literature_progress(chapter_id);

-- ------------------------------------------------------------------------------
-- 6. Prepaid Access Codes (access_vouchers & user_subscriptions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  access_scope TEXT NOT NULL DEFAULT 'full_month', -- 'full_month' | 'single_unit' | 'exam_pack'
  target_unit_id TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by TEXT,
  used_at TIMESTAMPTZ,
  batch_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  voucher_id UUID REFERENCES access_vouchers(id) ON DELETE SET NULL,
  grade_level TEXT NOT NULL,
  access_scope TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON access_vouchers(code);
CREATE INDEX IF NOT EXISTS idx_user_subs_user ON user_subscriptions(user_id);

-- ------------------------------------------------------------------------------
-- 7. Essay & Paragraph Lab (essay_topics & user_essays)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS essay_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  min_words INTEGER NOT NULL DEFAULT 180,
  idea_bank_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  helper_vocab JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_essay TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  topic_id UUID NOT NULL REFERENCES essay_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  quality_score INTEGER NOT NULL DEFAULT 0,
  feedback_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_essays_user ON user_essays(user_id);

-- ------------------------------------------------------------------------------
-- 8. Mock Exams & Simulator (mock_exams, mock_exam_attempts & exam_attempts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  sections_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  exam_id UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  section_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_exam_att_user ON mock_exam_attempts(user_id);

-- Support curriculum exam_attempts table if not present
CREATE TABLE IF NOT EXISTS exam_attempts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  user_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  detailed_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_att_student ON exam_attempts(student_id);

-- ------------------------------------------------------------------------------
-- 9. Spaced Repetition Vocabulary (vocab_cards & user_vocab_progress)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vocab_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT '3rd_sec',
  unit_name TEXT NOT NULL,
  word TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  meaning_ar TEXT NOT NULL,
  example_en TEXT NOT NULL,
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_vocab_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  card_id UUID NOT NULL REFERENCES vocab_cards(id) ON DELETE CASCADE,
  mastery_level INTEGER NOT NULL DEFAULT 0, -- 0=new, 1=learning, 2=familiar, 3=mastered
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uvp_user_card_unique UNIQUE (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_vocab_cards_grade ON vocab_cards(grade_level, unit_name);
CREATE INDEX IF NOT EXISTS idx_uvp_user_review ON user_vocab_progress(user_id, next_review_at);

-- ------------------------------------------------------------------------------
-- 10. Center Attendance & Homework Gate (center_attendance & lesson_prerequisites)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS center_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  student_code TEXT,
  session_title TEXT NOT NULL,
  attended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  homework_completed BOOLEAN NOT NULL DEFAULT false,
  parent_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  require_prev_homework BOOLEAN NOT NULL DEFAULT true,
  prev_homework_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_center_att_user ON center_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_center_att_code ON center_attendance(student_code);
CREATE INDEX IF NOT EXISTS idx_peer_ch_code ON peer_challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_peer_ch_creator ON peer_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_peer_ch_status ON peer_challenges(status);

-- ------------------------------------------------------------------------------
-- 11. Enable Row Level Security (RLS) on All Tables
-- ------------------------------------------------------------------------------
ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_translation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_literature_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE center_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_challenges ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 12. Idempotent RLS Security Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view challenges by invite code" ON peer_challenges;
CREATE POLICY "Public can view challenges by invite code" ON peer_challenges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create challenges" ON peer_challenges;
CREATE POLICY "Authenticated users can create challenges" ON peer_challenges FOR INSERT
  WITH CHECK (auth.uid()::text = creator_id OR current_setting('request.jwt.claim.sub', true) = creator_id OR creator_id = current_user);

DROP POLICY IF EXISTS "Participants can update challenge results" ON peer_challenges;
CREATE POLICY "Participants can update challenge results" ON peer_challenges FOR UPDATE
  USING (auth.uid()::text = creator_id OR auth.uid()::text = challenger_id OR current_setting('request.jwt.claim.sub', true) = creator_id OR current_setting('request.jwt.claim.sub', true) = challenger_id OR creator_id = current_user OR challenger_id = current_user);
-- user_mistakes
DROP POLICY IF EXISTS "Students can view their own mistakes" ON user_mistakes;
CREATE POLICY "Students can view their own mistakes" ON user_mistakes FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Students can insert their own mistakes" ON user_mistakes;
CREATE POLICY "Students can insert their own mistakes" ON user_mistakes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Students can update their own mistakes" ON user_mistakes;
CREATE POLICY "Students can update their own mistakes" ON user_mistakes FOR UPDATE
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Students can delete their own mistakes" ON user_mistakes;
CREATE POLICY "Students can delete their own mistakes" ON user_mistakes FOR DELETE
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

-- student_gamification
DROP POLICY IF EXISTS "Public can view gamification profiles" ON student_gamification;
CREATE POLICY "Public can view gamification profiles" ON student_gamification FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can update their own gamification" ON student_gamification;
CREATE POLICY "Students can update their own gamification" ON student_gamification FOR UPDATE
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Students can insert their own gamification" ON student_gamification;
CREATE POLICY "Students can insert their own gamification" ON student_gamification FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

-- xp_transactions
DROP POLICY IF EXISTS "Students can view their own XP transactions" ON xp_transactions;
CREATE POLICY "Students can view their own XP transactions" ON xp_transactions FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Students can insert their own XP transactions" ON xp_transactions;
CREATE POLICY "Students can insert their own XP transactions" ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

-- translation_exercises & user_translation_attempts
DROP POLICY IF EXISTS "Public can view translation exercises" ON translation_exercises;
CREATE POLICY "Public can view translation exercises" ON translation_exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own translation attempts" ON user_translation_attempts;
CREATE POLICY "Users can view their own translation attempts" ON user_translation_attempts FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Users can insert their own translation attempts" ON user_translation_attempts;
CREATE POLICY "Users can insert their own translation attempts" ON user_translation_attempts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

-- novel_chapters & student_literature_progress
DROP POLICY IF EXISTS "Public can view novel chapters" ON novel_chapters;
CREATE POLICY "Public can view novel chapters" ON novel_chapters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can view their own literature progress" ON student_literature_progress;
CREATE POLICY "Students can view their own literature progress" ON student_literature_progress FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Students can manage their own literature progress" ON student_literature_progress;
CREATE POLICY "Students can manage their own literature progress" ON student_literature_progress FOR ALL
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

-- Pro Suite: Vouchers, Subscriptions, Essays, Mock Exams, Vocab, Center
DROP POLICY IF EXISTS "Public can view published mock exams" ON mock_exams;
CREATE POLICY "Public can view published mock exams" ON mock_exams FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public can view essay topics" ON essay_topics;
CREATE POLICY "Public can view essay topics" ON essay_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view vocab cards" ON vocab_cards;
CREATE POLICY "Public can view vocab cards" ON vocab_cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Users can manage own essays" ON user_essays;
CREATE POLICY "Users can manage own essays" ON user_essays FOR ALL
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Users can manage own mock exam attempts" ON mock_exam_attempts;
CREATE POLICY "Users can manage own mock exam attempts" ON mock_exam_attempts FOR ALL
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Users can manage own exam attempts" ON exam_attempts;
CREATE POLICY "Users can manage own exam attempts" ON exam_attempts FOR ALL
  USING (auth.uid()::text = student_id OR current_setting('request.jwt.claim.sub', true) = student_id OR student_id = current_user);

DROP POLICY IF EXISTS "Users can manage own vocab progress" ON user_vocab_progress;
CREATE POLICY "Users can manage own vocab progress" ON user_vocab_progress FOR ALL
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

DROP POLICY IF EXISTS "Users can view own center attendance" ON center_attendance;
CREATE POLICY "Users can view own center attendance" ON center_attendance FOR SELECT
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claim.sub', true) = user_id OR user_id = current_user);

-- ------------------------------------------------------------------------------
-- 13. RPC Function: get_weekly_leaderboard(target_grade text)
-- ------------------------------------------------------------------------------
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
