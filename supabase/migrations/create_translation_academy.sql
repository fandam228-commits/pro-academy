-- ==============================================================================
-- Migration: Create Interactive Translation Academy System
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- ==============================================================================

-- 1. Create translation_exercises table
CREATE TABLE IF NOT EXISTS translation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT '3rd_sec', -- '1st_prep', '2nd_prep', '3rd_prep', '1st_sec', '2nd_sec', '3rd_sec'
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

-- 2. Create user_translation_attempts table
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

-- 3. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_trans_ex_lookup ON translation_exercises(grade_level, direction, exercise_type);
CREATE INDEX IF NOT EXISTS idx_trans_ex_diff ON translation_exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_trans_att_user ON user_translation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_att_exercise ON user_translation_attempts(exercise_id);

-- 4. Row Level Security
ALTER TABLE translation_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_translation_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view translation exercises" ON translation_exercises;
CREATE POLICY "Public can view translation exercises"
  ON translation_exercises FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view their own attempts" ON user_translation_attempts;
CREATE POLICY "Users can view their own attempts"
  ON user_translation_attempts FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Users can insert their own attempts" ON user_translation_attempts;
CREATE POLICY "Users can insert their own attempts"
  ON user_translation_attempts FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

-- 5. Seed 6 High-Value Thanaweya Amma Sample Exercises
INSERT INTO translation_exercises (
  id, grade_level, direction, exercise_type, difficulty, source_text, model_answer, alternative_answers, key_vocabulary, mcq_options, grammar_tip
) VALUES 
(
  'e1000000-0000-0000-0000-000000000001',
  '3rd_sec',
  'en_to_ar',
  'written',
  'exam_past',
  'Modern technology plays a vital role in reforming the educational system and preparing students for the labor market.',
  'تلعب التكنولوجيا الحديثة دوراً حيوياً في إصلاح المنظومة التعليمية وإعداد الطلاب لسوق العمل.',
  '["تؤدي التكنولوجيا الحديثة دوراً بالغ الأهمية في إصلاح نظام التعليم وتأهيل الطلاب لسوق العمل.", "تسهم التكنولوجيا الحديثة بشكل حيوي في تطوير المنظومة التعليمية وتجهيز الطلاب لسوق العمل."]'::jsonb,
  '[
    {"term": "modern technology", "synonyms": ["current technology", "advanced tech"], "meaning_ar": "التكنولوجيا الحديثة", "weight": 2},
    {"term": "vital role", "synonyms": ["crucial role", "essential role", "key role"], "meaning_ar": "دوراً حيوياً", "weight": 3},
    {"term": "reforming", "synonyms": ["reforming the", "developing", "improving"], "meaning_ar": "إصلاح / تطوير", "weight": 2},
    {"term": "educational system", "synonyms": ["education system"], "meaning_ar": "المنظومة التعليمية / نظام التعليم", "weight": 2},
    {"term": "labor market", "synonyms": ["job market", "work market"], "meaning_ar": "سوق العمل", "weight": 3}
  ]'::jsonb,
  NULL,
  'لاحظ استخدام زمن المضارع البسيط (plays) للتعبير عن حقيقة عامة، وترجمة plays a vital role بـ (تلعب دوراً حيوياً أو تؤدي دوراً بالغ الأهمية).'
),
(
  'e1000000-0000-0000-0000-000000000002',
  '3rd_sec',
  'en_to_ar',
  'mcq',
  'exam_past',
  'Egypt has launched massive green projects to generate clean energy and combat climate change.',
  'أطلقت مصر مشروعات خضراء ضخمة لتوليد الطاقة النظيفة ومكافحة تغير المناخ.',
  '[]'::jsonb,
  '[
    {"term": "massive green projects", "synonyms": ["huge green projects"], "meaning_ar": "مشروعات خضراء ضخمة", "weight": 3},
    {"term": "clean energy", "synonyms": ["renewable energy"], "meaning_ar": "الطاقة النظيفة", "weight": 2},
    {"term": "combat climate change", "synonyms": ["fight climate change"], "meaning_ar": "مكافحة تغير المناخ", "weight": 3}
  ]'::jsonb,
  '{
    "options": [
      "أطلقت مصر مشروعات خضراء ضخمة لتوليد الطاقة النظيفة ومكافحة تغير المناخ.",
      "أطلقت مصر مشروعات خضراء ضئيلة لتوليد الطاقة النظيفة ومكافحة تغير المناخ.",
      "كانت مصر تطلق مشروعات خضراء ضخمة لحرق الطاقة النظيفة وتأييد تغير المناخ.",
      "ستطلق مصر مشروعات خضراء ضخمة لترشيد الطاقة المتجددة ومواكبة تغير المناخ."
    ],
    "correct_index": 0,
    "trap_explanations": {
      "0": "الإجابة الصحيحة تماماً ودقيقة لغوياً واصطلاحياً وفق مواصفات امتحان الثانوية العامة.",
      "1": "فخ الكلمات المتضادة: ترجمة massive بـ ضئيلة بدلاً من ضخمة أو هائلة.",
      "2": "فخ المعنى العكسي: generate تعني توليد وليس حرق، و combat تعني مكافحة ومحاربة وليس تأييد.",
      "3": "فخ الأزمنة: has launched مضارع تام يدل على وقوع الحدث وإتمامه بالفعل وليس مستقبلاً (ستطلق)."
    }
  }'::jsonb,
  'المضارع التام (has launched) يُترجم إلى العربية بصيغة الماضي المؤكد (أطلقت / لقد أطلقت). كلمة combat تعني يكافح أو يتصدى.'
),
(
  'e1000000-0000-0000-0000-000000000003',
  '3rd_sec',
  'en_to_ar',
  'written',
  'advanced',
  'Sustainable development aims to meet the needs of the present without compromising the ability of future generations to meet theirs.',
  'تهدف التنمية المستدامة إلى تلبية احتياجات الحاضر دون المساس بقدرة الأجيال القادمة على تلبية احتياجاتها.',
  '["تسعى التنمية المستدامة لتوفير متطلبات الحاضر دون الإضرار بقدرة أجيال المستقبل على تلبية متطلباتهم.", "تهدف التنمية المستدامة إلى الوفاء باحتياجات الحاضر دون المساومة على قدرة الأجيال المستقبلية."]'::jsonb,
  '[
    {"term": "sustainable development", "synonyms": ["lasting development"], "meaning_ar": "التنمية المستدامة", "weight": 3},
    {"term": "meet the needs", "synonyms": ["fulfill the needs", "satisfy the needs"], "meaning_ar": "تلبية الاحتياجات", "weight": 3},
    {"term": "without compromising", "synonyms": ["without harming", "without jeopardizing"], "meaning_ar": "دون المساس بـ / دون الإضرار بـ", "weight": 3},
    {"term": "future generations", "synonyms": ["coming generations", "generations to come"], "meaning_ar": "الأجيال القادمة / المستقبلية", "weight": 2}
  ]'::jsonb,
  NULL,
  'تعبير without compromising يُترجم اصطلاحياً إلى (دون المساس بـ أو دون الإضرار بـ) وليس ترجمة حرفية.'
),
(
  'e1000000-0000-0000-0000-000000000004',
  '3rd_sec',
  'ar_to_en',
  'written',
  'standard',
  'يعد المتحف المصري الكبير صرحاً حضارياً يجذب ملايين السياح من جميع أنحاء العالم سنوياً.',
  'The Grand Egyptian Museum is considered a cultural monument that attracts millions of tourists from all over the world annually.',
  '["The Grand Egyptian Museum is a civilizational landmark that attracts millions of tourists from around the world every year.", "The Grand Egyptian Museum represents a cultural edifice attracting millions of tourists worldwide every year."]'::jsonb,
  '[
    {"term": "the grand egyptian museum", "synonyms": ["grand egyptian museum", "gem"], "meaning_ar": "المتحف المصري الكبير", "weight": 3},
    {"term": "cultural monument", "synonyms": ["civilizational landmark", "cultural edifice", "landmark"], "meaning_ar": "صرح حضاري / معلم حضاري", "weight": 3},
    {"term": "attracts", "synonyms": ["draws", "appeals to"], "meaning_ar": "يجذب", "weight": 2},
    {"term": "millions of tourists", "synonyms": ["millions of visitors"], "meaning_ar": "ملايين السياح", "weight": 2},
    {"term": "from all over the world", "synonyms": ["from around the world", "worldwide", "from across the globe"], "meaning_ar": "من جميع أنحاء العالم", "weight": 2},
    {"term": "annually", "synonyms": ["every year", "each year", "yearly"], "meaning_ar": "سنوياً", "weight": 2}
  ]'::jsonb,
  NULL,
  'عند الترجمة من العربية إلى الإنجليزية، ابدأ بالفاعل (The Grand Egyptian Museum) متبوعاً بالفعل، واستخدم المضارع البسيط (attracts) لأنها حقيقة مستمرة.'
),
(
  'e1000000-0000-0000-0000-000000000005',
  '3rd_sec',
  'ar_to_en',
  'mcq',
  'exam_past',
  'لا شك أن الذكاء الاصطناعي سيغير شكل الوظائف المستقبلية، لذا يجب على الشباب اكتساب المهارات الرقمية.',
  'There is no doubt that artificial intelligence will transform future jobs, so youth must acquire digital skills.',
  '[]'::jsonb,
  '[
    {"term": "there is no doubt that", "synonyms": ["undoubtedly", "it is certain that"], "meaning_ar": "لا شك أن", "weight": 2},
    {"term": "artificial intelligence", "synonyms": ["ai"], "meaning_ar": "الذكاء الاصطناعي", "weight": 3},
    {"term": "acquire digital skills", "synonyms": ["gain digital skills", "obtain digital skills"], "meaning_ar": "اكتساب المهارات الرقمية", "weight": 3}
  ]'::jsonb,
  '{
    "options": [
      "There is no doubt that artificial intelligence will transform future jobs, so youth must acquire digital skills.",
      "There is no doubt that artificial intelligence transformed future jobs, so youth should lose digital skills.",
      "It is doubtful that artificial intelligence will cancel all jobs, so youth must ignore digital skills.",
      "There is a doubt that artificial intelligence will transform future jobs, so youth must inquire digital skills."
    ],
    "correct_index": 0,
    "trap_explanations": {
      "0": "الترجمة السليمة تماماً بدون أخطاء في القواعد أو المصطلحات.",
      "1": "فخ الأزمنة والأضداد: استخدام transformed في الماضي لوظائف مستقبلية، وكلمة lose (يفقد) بدلاً من acquire (يكتسب).",
      "2": "فخ المعنى المقلوب: doubtful تعني مشكوك فيه، و ignore تعني يتجاهل.",
      "3": "فخ الكلمات المتشابهة (False Friends): استخدام inquire (يستفسر) بدلاً من acquire (يكتسب)."
    }
  }'::jsonb,
  'تعبير (لا شك أن) يقابله There is no doubt that. وفرّق بين acquire (يكتسب مهارة أو معرفة) وبين inquire (يستفسر).'
),
(
  'e1000000-0000-0000-0000-000000000006',
  '3rd_sec',
  'ar_to_en',
  'written',
  'advanced',
  'تولي الدولة اهتماماً بالغاً بصحة المواطنين، فالوقاية خير من العلاج وبناء الإنسان يبدأ بصحته.',
  'The state pays great attention to citizens'' health, as prevention is better than cure and human development begins with health.',
  '["The government pays great attention to citizens'' health, because prevention is better than cure and human building starts with good health.", "The state attaches great importance to the health of citizens, since prevention is better than treatment."]'::jsonb,
  '[
    {"term": "the state", "synonyms": ["the government"], "meaning_ar": "الدولة / الحكومة", "weight": 2},
    {"term": "pays great attention", "synonyms": ["attaches great importance", "gives high priority"], "meaning_ar": "تولي اهتماماً بالغاً", "weight": 3},
    {"term": "citizens'' health", "synonyms": ["health of citizens", "public health"], "meaning_ar": "صحة المواطنين", "weight": 2},
    {"term": "prevention is better than cure", "synonyms": ["prevention is better than treatment"], "meaning_ar": "الوقاية خير من العلاج", "weight": 3},
    {"term": "human development", "synonyms": ["human building", "building the individual"], "meaning_ar": "بناء الإنسان", "weight": 2}
  ]'::jsonb,
  NULL,
  'المثل الشهير (الوقاية خير من العلاج) يترجم دائماً Prevention is better than cure. وتعبير (تولي اهتماماً) يترجم pays attention to أو attaches importance to.'
)
ON CONFLICT (id) DO NOTHING;
