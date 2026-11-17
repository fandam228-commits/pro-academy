-- ==============================================================================
-- Migration: Create Pro Suite Expansion Pack
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- Modules:
--   1. Prepaid Access Codes (access_vouchers, user_subscriptions)
--   2. Interactive Essay & Paragraph Lab (essay_topics, user_essays)
--   3. Full Real-Time Exam Simulator (mock_exams, exam_attempts)
--   4. Spaced Repetition Vocabulary (vocab_cards, user_vocab_progress)
--   5. Center QR Attendance & Homework Sync (center_attendance, lesson_prerequisites)
-- ==============================================================================

-- 0. Extend users table with student_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'student_code'
  ) THEN
    ALTER TABLE users ADD COLUMN student_code TEXT UNIQUE;
  END IF;
END $$;

-- 1. Prepaid Access Vouchers & Subscriptions
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

-- 2. Essay & Paragraph Lab
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

-- 3. Mock Exams & Simulator Attempts
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

-- 4. Spaced Repetition Vocabulary Flashcards
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

-- 5. Center Attendance & Homework Sync
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON access_vouchers(code);
CREATE INDEX IF NOT EXISTS idx_user_subs_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_essays_user ON user_essays(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_att_user ON mock_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_cards_grade ON vocab_cards(grade_level, unit_name);
CREATE INDEX IF NOT EXISTS idx_uvp_user_review ON user_vocab_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_center_att_user ON center_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_center_att_code ON center_attendance(student_code);

-- Enable RLS
ALTER TABLE access_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE center_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_prerequisites ENABLE ROW LEVEL SECURITY;

-- Public/Student Read Policies
CREATE POLICY "Public can view published mock exams" ON mock_exams FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view essay topics" ON essay_topics FOR SELECT USING (true);
CREATE POLICY "Public can view vocab cards" ON vocab_cards FOR SELECT USING (true);

-- Student Personal Policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_user);
CREATE POLICY "Users can manage own essays" ON user_essays FOR ALL USING (auth.uid()::text = user_id OR user_id = current_user);
CREATE POLICY "Users can manage own exam attempts" ON mock_exam_attempts FOR ALL USING (auth.uid()::text = user_id OR user_id = current_user);
CREATE POLICY "Users can manage own vocab progress" ON user_vocab_progress FOR ALL USING (auth.uid()::text = user_id OR user_id = current_user);
CREATE POLICY "Users can view own attendance" ON center_attendance FOR SELECT USING (auth.uid()::text = user_id OR user_id = current_user);

-- ==============================================================================
-- Seed Data: Sample Vouchers
-- ==============================================================================
INSERT INTO access_vouchers (code, grade_level, access_scope, duration_days, is_used, batch_label)
VALUES
  ('PRO-8492-XK', '3rd_sec', 'full_month', 30, false, 'دفعة التأسيس الأولى 2027'),
  ('PRO-2027-EG', '3rd_sec', 'full_month', 30, false, 'كروت كفر الزيات - أوائل الثانوية'),
  ('PRO-UNIT-01', '3rd_sec', 'single_unit', 14, false, 'كارت الوحدة الأولى - Read all about it'),
  ('PRO-EXAM-99', '3rd_sec', 'exam_pack', 60, false, 'باقة بنك الامتحانات الشاملة'),
  ('PRO-PREP-33', '3rd_prep', 'full_month', 30, false, 'كروت الشهادة الإعدادية - تيرم أول')
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- Seed Data: Thanaweya Amma Essay Topics
-- ==============================================================================
INSERT INTO essay_topics (id, grade_level, title_en, title_ar, min_words, idea_bank_ar, helper_vocab, model_essay)
VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  '3rd_sec',
  'The Role of Youth in Sustainable Development and National Megaprojects',
  'دور الشباب في التنمية المستدامة والمشروعات القومية الكبرى',
  180,
  '[
    "الشباب هم العمود الفقري لأي نهضة تنموية بفضل طاقتهم وإبداعهم.",
    "المشروعات القومية في مصر (العاصمة الإدارية، استصلاح الأراضي، حياة كريمة) تفتح آفاقاً واعدة لتمكين الشباب.",
    "دور التحول الرقمي وريادة الأعمال في تعزيز الاقتصاد الأخضر والمستدام.",
    "واجب الدولة في توفير التدريب والتعليم المهني المتقدم لمواكبة متطلبات سوق العمل العالمي."
  ]'::jsonb,
  '[
    {"word": "cornerstone", "meaning_ar": "حجر زاوية / ركيزة أساسية"},
    {"word": "sustainable development", "meaning_ar": "التنمية المستدامة"},
    {"word": "megaprojects", "meaning_ar": "المشروعات القومية العملاقة"},
    {"word": "entrepreneurship", "meaning_ar": "ريادة الأعمال"},
    {"word": "pave the way", "meaning_ar": "يمهد الطريق"},
    {"word": "digital transformation", "meaning_ar": "التحول الرقمي"},
    {"word": "unwavering determination", "meaning_ar": "عزيمة لا تلين"}
  ]'::jsonb,
  'Youth represent the driving force and heartbeat of any thriving nation. In modern Egypt, young citizens constitute more than sixty percent of the population, transforming them into an indispensable cornerstone for sustainable development. First and foremost, national megaprojects such as the New Administrative Capital, renewable energy stations in Benban, and the monumental Hayah Karima initiative offer unprecedented horizons for young professionals, engineers, and digital innovators. Furthermore, the advent of digital transformation has motivated countless youth to embrace entrepreneurship, establishing green startups that resolve pressing societal issues while bolstering national economic resilience. In addition to technical competencies, youth bring enthusiastic energy and an innovative mindset necessary to confront global challenges such as climate change and resource scarcity. Consequently, investing in high-quality technical education and vocational training is an imperative national priority. By equipping the upcoming generation with modern linguistic, scientific, and leadership tools, Egypt guarantees that its ambitious Vision 2030 will not only be realized, but also surpassed. In conclusion, empowered youth combined with national vision are the definitive guarantee of an inspiring and self-sufficient future.'
),
(
  'e1000000-0000-0000-0000-000000000002',
  '3rd_sec',
  'Artificial Intelligence in Modern Education: Opportunities and Ethical Challenges',
  'الذكاء الاصطناعي في التعليم الحديث: الفرص الواعدة والتحديات الأخلاقية',
  180,
  '[
    "تخصيص مسارات التعلم لكل طالب وفق قدراته وسرعته الاستيعابية.",
    "توفير معلمين افتراضيين ومساعدين أذكياء متاحين على مدار الساعة.",
    "خطر الاعتماد المفرط وإضعاف مهارات التفكير النقدي والإبداع البشري.",
    "الحاجة الملحة لضوابط أخلاقية تحمي النزاهة الأكاديمية والخصوصية."
  ]'::jsonb,
  '[
    {"word": "personalized learning", "meaning_ar": "التعلم المخصص وفق حاجة الطالب"},
    {"word": "unprecedented revolution", "meaning_ar": "ثورة غير مسبوقة"},
    {"word": "critical thinking", "meaning_ar": "التفكير النقدي"},
    {"word": "academic integrity", "meaning_ar": "النزاهة والأمانة الأكاديمية"},
    {"word": "double-edged sword", "meaning_ar": "سلاح ذو حدين"},
    {"word": "ethical boundaries", "meaning_ar": "الحدود والضوابط الأخلاقية"},
    {"word": "cognitive abilities", "meaning_ar": "القدرات المعرفية والذهنية"}
  ]'::jsonb,
  'Artificial intelligence has sparked an unprecedented revolution across the global educational landscape. As intelligent algorithms integrate into daily classroom routines, they present tremendous educational opportunities paired with complex ethical dilemmas. On the positive side, AI-powered systems facilitate truly personalized learning. Students no longer have to adhere strictly to a uniform pace; rather, adaptive learning platforms analyze individual weaknesses, generating tailored explanations and targeted drills to ensure complete subject mastery. Moreover, round-the-clock intelligent tutoring democratizes access to exceptional academic support regardless of geographic or financial constraints. On the other hand, artificial intelligence remains a genuine double-edged sword. Over-reliance on automated generative tools can severely undermine genuine critical thinking, analytical reasoning, and originality. When learners delegate essay writing and problem solving to algorithms, their organic cognitive growth is inevitably compromised. Furthermore, preserving academic integrity and protecting sensitive personal data require robust legislative frameworks and proactive institutional monitoring. In conclusion, artificial intelligence should be embraced not as a replacement for human educators, but as a powerful catalyst to augment student potential within strictly guided ethical boundaries.'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Seed Data: 12 Essential Flashcards for 3rd Secondary (Units 1 & 2)
-- ==============================================================================
INSERT INTO vocab_cards (id, grade_level, unit_name, word, part_of_speech, meaning_ar, example_en, synonyms)
VALUES
  ('v1000000-0000-0000-0000-000000000001', '3rd_sec', 'Unit 1: Read all about it', 'piracy', 'noun', 'القرصنة الإلكترونية أو الأدبية', 'Digital piracy violates intellectual property and deprives authors of their rights.', ARRAY['copyright infringement', 'bootlegging', 'theft']),
  ('v1000000-0000-0000-0000-000000000002', '3rd_sec', 'Unit 1: Read all about it', 'casualty', 'noun', 'ضحية أو مصاب في حادث أو معركة', 'The severe road accident resulted in no human casualties thanks to safety airbags.', ARRAY['victim', 'fatality', 'loss']),
  ('v1000000-0000-0000-0000-000000000003', '3rd_sec', 'Unit 1: Read all about it', 'compensate', 'verb', 'يعوّض مالياً أو معنوياً', 'The insurance enterprise promised to compensate the factory owner for the damage.', ARRAY['reimburse', 'repay', 'make up for']),
  ('v1000000-0000-0000-0000-000000000004', '3rd_sec', 'Unit 1: Read all about it', 'investigate', 'verb', 'يتحرى أو يحقق في ملابسات قضية', 'Detectives were dispatched to investigate the cause of the sudden power failure.', ARRAY['examine', 'probe', 'inspect']),
  ('v1000000-0000-0000-0000-000000000005', '3rd_sec', 'Unit 1: Read all about it', 'spin', 'noun / verb', 'توجيه / تحريف المعنى لإبراز جانب محدد', 'Tabloid editors often put a positive spin on controversial celebrity news.', ARRAY['bias', 'slant', 'twist']),
  ('v1000000-0000-0000-0000-000000000006', '3rd_sec', 'Unit 1: Read all about it', 'omission', 'noun', 'إغفال أو حذف متعمد للمعلومات', 'Bias by omission occurs when journalists intentionally leave out crucial facts.', ARRAY['exclusion', 'deletion', 'neglect']),
  ('v1000000-0000-0000-0000-000000000007', '3rd_sec', 'Unit 2: Her story', 'prejudice', 'noun', 'التحيز غير العادل أو التعصب المسبق', 'Dr. Aisha Abd El-Rahman challenged academic prejudice against female authors.', ARRAY['bias', 'discrimination', 'preconception']),
  ('v1000000-0000-0000-0000-000000000008', '3rd_sec', 'Unit 2: Her story', 'stereotype', 'noun', 'صورة نمطية أو فكرة قولبية جامدة', 'We must discard the outdated stereotype that girls cannot excel in physics.', ARRAY['conventional image', 'cliché', 'label']),
  ('v1000000-0000-0000-0000-000000000009', '3rd_sec', 'Unit 2: Her story', 'contribution', 'noun', 'إسهام أو مشاركة فعالة', 'Scientists made an invaluable contribution to the development of new vaccines.', ARRAY['input', 'donation', 'addition']),
  ('v1000000-0000-0000-0000-000000000010', '3rd_sec', 'Unit 2: Her story', 'pharmacist', 'noun', 'صيدلي متخصص في تحضير وتوزيع الدواء', 'The pharmacist explained the exact dosage schedule to the elderly patient.', ARRAY['chemist', 'druggist', 'apothecary']),
  ('v1000000-0000-0000-0000-000000000011', '3rd_sec', 'Unit 2: Her story', 'inspire', 'verb', 'يُلهم أو يبث الحماس في نفوس الآخرين', 'Mr. Habib El Rahman aims to inspire all students to attain full marks in English.', ARRAY['motivate', 'encourage', 'stimulate']),
  ('v1000000-0000-0000-0000-000000000012', '3rd_sec', 'Unit 2: Her story', 'overcome', 'verb', 'يتغلب على الصعاب أو العقبات', 'With perseverance and continuous practice, any learner can overcome grammar pitfalls.', ARRAY['conquer', 'defeat', 'surmount'])
ON CONFLICT (id) DO NOTHING;
