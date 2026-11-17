-- ==============================================================================
-- Migration: Create Literature & Novel World System
-- Platform: Professional Academy — Mr. Habib El Rahman
-- Academic Year: 2026 / 2027
-- ==============================================================================

-- 1. Create novel_chapters table
CREATE TABLE IF NOT EXISTS novel_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT '3rd_sec', -- '1st_prep', '2nd_prep', '3rd_prep', '1st_sec', '2nd_sec', '3rd_sec'
  novel_title TEXT NOT NULL, -- e.g. 'Great Expectations', 'Treasure Island', 'King Lear'
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

-- 2. Create student_literature_progress table
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

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_nc_grade_novel ON novel_chapters(grade_level, novel_title, chapter_number);
CREATE INDEX IF NOT EXISTS idx_slp_user ON student_literature_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_slp_chapter ON student_literature_progress(chapter_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE novel_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_literature_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view novel chapters" ON novel_chapters;
CREATE POLICY "Public can view novel chapters"
  ON novel_chapters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Students can view their own literature progress" ON student_literature_progress;
CREATE POLICY "Students can view their own literature progress"
  ON student_literature_progress FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

DROP POLICY IF EXISTS "Students can insert/update their literature progress" ON student_literature_progress;
CREATE POLICY "Students can insert/update their literature progress"
  ON student_literature_progress FOR ALL
  USING (
    auth.uid()::text = user_id 
    OR current_setting('request.jwt.claim.sub', true) = user_id
    OR user_id = current_user
  );

-- 5. Seed 3rd Secondary (Great Expectations — Chapter 1)
INSERT INTO novel_chapters (
  id, grade_level, novel_title, chapter_number, chapter_title, summary_en, summary_ar, audio_url, key_vocabulary, characters, key_quotations, critical_thinking_qs
) VALUES (
  'c3000000-0000-0000-0000-000000000001',
  '3rd_sec',
  'Great Expectations',
  1,
  'A Terrifying Encounter in the Marshes',
  'The story begins on a cold Christmas Eve in the desolate marsh country of Kent. Pip, a young orphan raised by hand by his harsh sister Mrs. Joe Gargery and her kind blacksmith husband Joe, visits the graves of his parents and deceased siblings in a lonely churchyard. Suddenly, a terrifying, shivering convict in leg irons and ragged clothes leaps from behind the gravestones. The desperate fugitive threatens to cut Pip''s throat unless the boy brings him a blacksmith''s file and food. He terrifies Pip by inventing a monstrous young companion who will tear out Pip''s heart if he disobeys. Terrified, Pip swears to help him and runs home in fear, setting the life-changing events of his life into motion.',
  'تبدأ أحداث الرواية في عشية عيد الميلاد الباردة في منطقة المستنقعات الكئيبة بكنت. يزور الطفل اليتيم بيب قبور والديه وإخوته الراحلين في مقبرة الكنيسة المنعزلة. فجأة، يقفز من بين شواهد القبور سجين هارب مرعب مقيد بالسلاسل وثيابه ممزقة ويرتعد من البرد. يهدد السجين بيب بذبحه إذا لم يحضر له مبرداً لفك قيوده وطعاماً، ويخيفه بشاب شرير خيالي سيقتله إذا أخلف وعده. يرتعد بيب ويعده بالمساعدة ويهرب للمنزل في رعب، لتبدأ نقطة التحول الكبرى في مصيره.',
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3',
  '[
    {"word": "marsh", "meaning_ar": "مستنقع / أرض طينية رطبة", "context_sentence": "The churchyard was situated in the bleak marsh country."},
    {"word": "convict", "meaning_ar": "سجين محكوم عليه / مجرم هارب", "context_sentence": "A fearful man in grey clothes with a great iron on his leg."},
    {"word": "leg irons", "meaning_ar": "أصفاد وأغلال حديدية في القدمين", "context_sentence": "The convict limped heavily because of the heavy leg irons."},
    {"word": "blacksmith", "meaning_ar": "حداد", "context_sentence": "Joe Gargery was the kind village blacksmith."},
    {"word": "churchyard", "meaning_ar": "مقبرة الكنيسة", "context_sentence": "Pip was weeping beside his parents'' graves in the churchyard."},
    {"word": "file", "meaning_ar": "مبرد حديد لقطع الأغلال", "context_sentence": "The convict demanded that Pip steal a file from Joe''s forge."},
    {"word": "wittles", "meaning_ar": "طعام ومؤن (لهجة قديمة)", "context_sentence": "Bring me that file and them wittles, or your heart shall be torn out."},
    {"word": "shudder", "meaning_ar": "يرتعد من الخوف أو البرد", "context_sentence": "The convict shuddered and his teeth chattered violently."}
  ]'::jsonb,
  '[
    {
      "name": "Pip (بيب)",
      "role_ar": "البطل والراوي الصغير",
      "traits": ["بريء", "حساس", "يتيم", "خائف"],
      "motivation_ar": "البقاء على قيد الحياة وزيارة قبر والديه، وصراعه الأخلاقي بين مساعدة السجين أو سرقة جو."
    },
    {
      "name": "The Convict / Magwitch (السجين الهارب - ماجويتش)",
      "role_ar": "السجين الهارب الغامض",
      "traits": ["يائس", "جائع", "مرعب", "مكبل بالأغلال"],
      "motivation_ar": "فك قيوده والحصول على الطعام للنجاة من مطاردة جنود الحراسة في المستنقعات."
    },
    {
      "name": "Joe Gargery (جو جارجري)",
      "role_ar": "زوج الأخت والحداد الطيب",
      "traits": ["حنون", "صادق", "مخلص", "مسالم"],
      "motivation_ar": "حماية بيب ومحبته وتوفير حياة هادئة له رغم قسوة زوجته."
    },
    {
      "name": "Mrs. Joe Gargery (السيدة جو جارجري)",
      "role_ar": "أخت بيب الكبرى القاسية",
      "traits": ["حادة الطباع", "سريعة الغضب", "متسلطة"],
      "motivation_ar": "التفاخر بتربية بيب بـ (يدها) وتفريغ غضبها المستمر في المنزل."
    }
  ]'::jsonb,
  '[
    {
      "quote": "Hold your noise! Keep still, you little devil, or I''ll cut your throat!",
      "speaker": "The Convict (Magwitch)",
      "addressed_to": "Pip",
      "comment_ar": "الافتتاحية الصادمة التي تبدأ بها الرواية؛ تظهر مدى بؤس ويأس السجين وخوف بيب الشديد، وهو سؤال ثانوية عامة متكرر حول انطباع بيب الأول."
    },
    {
      "quote": "You bring me, to-morrow morning early, that file and them wittles... and you shall be let to live.",
      "speaker": "The Convict",
      "addressed_to": "Pip",
      "comment_ar": "الطلب المحوري الذي يضع الطفل بيب في صراع أخلاقي قاسٍ بين خوفه من الموت وبين السرقة وخيانة ثقة جو."
    },
    {
      "quote": "I was always treated as if I had insisted on being born in defiance of the dictates of reason.",
      "speaker": "Pip (Narrator)",
      "addressed_to": "Readers / Audience",
      "comment_ar": "يعكس قسوة معاملة السيدة جو لبيب وشعوره الدائم بالذنب والاضطهاد كونه طفلاً يتيماً."
    }
  ]'::jsonb,
  '[
    {
      "id": "ct_1",
      "question_en": "In your opinion, why did the convict invent the story about the ''monstrous young man'' to threaten Pip?",
      "model_answer_en": "The convict wanted to ensure that young Pip would not dare to betray him or tell the police or his family. By creating an imaginary, merciless partner who could find Pip anywhere, the convict exploited the child''s vivid imagination and intense fear to guarantee his survival and secure the food and file.",
      "explanation_ar": "اخترع السجين قصة الشاب المتوحش ليزيد من رعب الطفل الصغير ويضمن عدم إفشائه للسر أو إبلاغ الشرطة وسرعة إحضار المؤن.",
      "key_points": ["guarantee silence", "exploit child fear", "ensure survival", "prevent informing police", "secure food and file"]
    },
    {
      "id": "ct_2",
      "question_en": "Pip felt a deep inner conflict after promising to help the convict. How did this conflict affect his moral conscience?",
      "model_answer_en": "Pip was torn between fear for his life and guilt about stealing from Joe, the only person who showed him genuine kindness. Although he was forced to commit a theft, his conscience tortured him because he hated deceiving Joe and breaking the moral values of the household.",
      "explanation_ar": "عاش بيب صراعاً مؤلماً بين خوفه على حياته من السجين وبين شعوره بالذنب لسرقة جو الذي يحبه ويحسن معاملته.",
      "key_points": ["torn between fear and guilt", "stealing from Joe", "moral conscience", "deceiving Joe", "inner conflict"]
    },
    {
      "id": "ct_3",
      "question_en": "How does the opening setting of the desolate marshes reflect Pip''s internal emotional state at the beginning of the novel?",
      "model_answer_en": "The bleak, foggy, and lonely churchyard surrounded by dark marshes mirrors Pip''s profound loneliness, grief over his dead family, and his uncertain, vulnerable future. The gloomy environment sets a somber, gothic tone for the entire story.",
      "explanation_ar": "تعكس البيئة الكئيبة والضبابية في المستنقعات حزن بيب العميق ويتمه وشعوره بالوحدة والضياع في بداية الرواية.",
      "key_points": ["bleak setting", "foggy marshes", "mirrors loneliness", "grief for family", "gothic tone", "vulnerability"]
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
