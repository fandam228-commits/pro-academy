import { assertDatabaseConfigured, db } from "./index";
import { sql, eq } from "drizzle-orm";
import {
  users,
  curriculumGrades,
  curriculumUnits,
  curriculumSections,
  storyChapters,
  ministryAssessments,
  translationModules,
  translationLessons,
  translationQuestions,
  translationStudentProgress,
  translationSubmissions,
  translationExams,
  translationExamAttempts,
  liveSessions,
  googleIntegrations,
  trainingQuestions,
  trainingStudentAttempts,
  trainingBookmarks,
  trainingExamSessions,
  trainingRevisionQueue,
  storyScenes,
  storyCharacterChatSessions,
  storyStudentProgress,
  storyStudentBadges,
  dialogues,
  dialogueSubmissions,
  dialogueStudentProgress,
} from "./schema";
import { ALL_DIALOGUES } from "@/data/dialogue-center";
import { ALL_CURRICULUM_STORIES } from "@/data/story-world";
import { SMART_CURRICULUM_SEEDS } from "@/data/smart-curriculum-seed";
import { TRANSLATION_MODULES_SEED, SAMPLE_TRANSLATION_EXAMS } from "@/data/translation-academy-seed";
import EXTRACTED_TRAINING_QUESTIONS from "@/data/training-center-extracted-questions.json";
import { hashPassword } from "@/lib/security";

let setupPromise: Promise<void> | null = null;

export async function ensureDbSetup() {
  if (!process.env.DATABASE_URL) {
    return;
  }
  assertDatabaseConfigured();
  if (!setupPromise) {
    setupPromise = initializeSchema().catch((error: unknown) => {
      setupPromise = null;
      throw error;
    });
  }
  await setupPromise;
}

async function initializeSchema(): Promise<void> {
  await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        avatar TEXT,
        phone TEXT,
        parent_phone TEXT,
        stage TEXT,
        grade TEXT,
        streak INTEGER DEFAULT 1,
        points INTEGER DEFAULT 150,
        level TEXT DEFAULT 'Intermediate',
        preferred_lang TEXT DEFAULT 'ar',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        stage TEXT NOT NULL,
        grade TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        teacher_name TEXT NOT NULL DEFAULT 'Mr. Habib El Rahman',
        thumbnail TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
        is_published BOOLEAN DEFAULT true NOT NULL,
        category TEXT DEFAULT 'Grammar & Vocabulary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS units (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        duration TEXT DEFAULT '25 mins',
        pdf_url TEXT,
        order_index INTEGER NOT NULL DEFAULT 1,
        is_free BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        course_id TEXT,
        unit_id TEXT,
        lesson_id TEXT,
        title TEXT NOT NULL,
        stage TEXT DEFAULT 'Secondary',
        type TEXT NOT NULL DEFAULT 'quiz',
        duration_minutes INTEGER DEFAULT 30,
        pass_percentage INTEGER DEFAULT 60,
        total_points INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        audio_url TEXT,
        options JSONB,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 10
      );

      CREATE TABLE IF NOT EXISTS question_bank (
        id TEXT PRIMARY KEY,
        domain_category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        stage TEXT NOT NULL,
        grade TEXT NOT NULL,
        curriculum TEXT DEFAULT 'Ministry',
        term TEXT DEFAULT 'First',
        source TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        unit TEXT DEFAULT 'Unit 1',
        lesson TEXT DEFAULT 'Lesson 1',
        section TEXT,
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        skill TEXT DEFAULT 'Grammar & Context',
        word_type TEXT,
        topic TEXT NOT NULL,
        bloom_level TEXT DEFAULT 'Understand',
        grammar_topic TEXT,
        passage_text TEXT,
        audio_url TEXT,
        options JSONB,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 10,
        times_used INTEGER DEFAULT 0 NOT NULL,
        correct_count INTEGER DEFAULT 0 NOT NULL,
        total_attempts INTEGER DEFAULT 0 NOT NULL,
        difficulty_index NUMERIC(5, 2) DEFAULT 0.50,
        discrimination_index NUMERIC(5, 2) DEFAULT 0.65,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_qb_domain ON question_bank(domain_category);
      ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS curriculum TEXT DEFAULT 'Ministry';
      ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS term TEXT DEFAULT 'First';
      ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS source TEXT;
      ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS section TEXT;

      CREATE INDEX IF NOT EXISTS idx_qb_grade ON question_bank(grade);
      CREATE INDEX IF NOT EXISTS idx_qb_curriculum ON question_bank(curriculum);
      CREATE INDEX IF NOT EXISTS idx_qb_term ON question_bank(term);
      CREATE INDEX IF NOT EXISTS idx_qb_difficulty ON question_bank(difficulty);
      CREATE INDEX IF NOT EXISTS idx_qb_topic ON question_bank(topic);
      CREATE INDEX IF NOT EXISTS idx_qb_grammar ON question_bank(grammar_topic);
      CREATE INDEX IF NOT EXISTS idx_qb_scope ON question_bank(stage, grade, curriculum, term, unit);

      CREATE TABLE IF NOT EXISTS generated_exams (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        stage TEXT NOT NULL,
        grade TEXT NOT NULL,
        config JSONB NOT NULL,
        question_ids JSONB NOT NULL,
        questions_data JSONB NOT NULL,
        total_points INTEGER DEFAULT 100 NOT NULL,
        duration_minutes INTEGER DEFAULT 45 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exam_attempts (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL REFERENCES generated_exams(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        user_answers JSONB NOT NULL,
        detailed_feedback JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quiz_submissions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        answers JSONB NOT NULL,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        completed_lesson_ids JSONB DEFAULT '[]'::jsonb,
        payment_method TEXT DEFAULT 'activation_code',
        activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        grade TEXT NOT NULL,
        certificate_code TEXT NOT NULL UNIQUE,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        qr_code_data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        course_id TEXT,
        amount NUMERIC(10, 2) NOT NULL,
        method TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        proof_url TEXT,
        sender_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activation_codes (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        course_id TEXT NOT NULL,
        is_used BOOLEAN DEFAULT false,
        used_by_student_id TEXT,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS parent_links (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        relationship TEXT DEFAULT 'Guardian'
      );

      CREATE TABLE IF NOT EXISTS center_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        stage TEXT NOT NULL DEFAULT 'Secondary',
        grade TEXT NOT NULL DEFAULT 'Third Secondary (Baccalaureate)',
        teacher_id TEXT,
        teacher_name TEXT,
        schedule TEXT,
        room TEXT,
        monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_center_groups_grade ON center_groups(grade);
      CREATE INDEX IF NOT EXISTS idx_center_groups_active ON center_groups(is_active);

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        status TEXT DEFAULT 'present',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        author TEXT DEFAULT 'Mr. Habib El Rahman',
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        cover_image TEXT NOT NULL,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        tags JSONB DEFAULT '["Thanawya Amma", "English Tips", "Grammar"]'::jsonb
      );

      CREATE TABLE IF NOT EXISTS live_chat (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        message TEXT NOT NULL,
        channel TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_planner (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        task TEXT NOT NULL,
        due_date TEXT NOT NULL,
        priority TEXT DEFAULT 'Medium',
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS affiliates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        total_referrals INTEGER DEFAULT 0,
        earnings NUMERIC(10, 2) DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS pdf_documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        uploader_id TEXT NOT NULL,
        uploader_name TEXT NOT NULL DEFAULT 'Mr. Habib El Rahman',
        stage TEXT DEFAULT 'Secondary',
        grade TEXT DEFAULT 'Third Secondary (Baccalaureate)',
        unit TEXT DEFAULT 'Unit 1',
        topic TEXT DEFAULT 'Grammar Notes',
        course_id TEXT,
        file_name TEXT NOT NULL,
        storage_path TEXT,
        file_data TEXT,
        external_url TEXT,
        file_size_kb INTEGER DEFAULT 0,
        page_count INTEGER DEFAULT 1,
        views INTEGER DEFAULT 0 NOT NULL,
        downloads INTEGER DEFAULT 0 NOT NULL,
        is_protected BOOLEAN DEFAULT true,
        watermark_enabled BOOLEAN DEFAULT true,
        allow_download BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      -- Add column for existing deployments that already created the table
      ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS file_data TEXT;

      CREATE INDEX IF NOT EXISTS idx_pdf_grade ON pdf_documents(grade);
      CREATE INDEX IF NOT EXISTS idx_pdf_stage ON pdf_documents(stage);
      CREATE INDEX IF NOT EXISTS idx_pdf_course ON pdf_documents(course_id);

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

      CREATE TABLE IF NOT EXISTS homework (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        teacher_id TEXT NOT NULL,
        teacher_name TEXT NOT NULL DEFAULT 'Mr. Habib El Rahman',
        stage TEXT DEFAULT 'Secondary',
        grade TEXT DEFAULT 'Third Secondary (Baccalaureate)',
        course_id TEXT,
        unit TEXT DEFAULT 'Unit 1',
        due_date TEXT NOT NULL,
        total_points INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_hw_grade ON homework(grade);
      CREATE INDEX IF NOT EXISTS idx_hw_course ON homework(course_id);

      CREATE TABLE IF NOT EXISTS homework_submissions (
        id TEXT PRIMARY KEY,
        homework_id TEXT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        answer_text TEXT,
        file_name TEXT,
        storage_path TEXT,
        status TEXT DEFAULT 'submitted',
        score INTEGER,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        graded_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_hws_hw ON homework_submissions(homework_id);
      CREATE INDEX IF NOT EXISTS idx_hws_student ON homework_submissions(student_id);

      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        session_title TEXT NOT NULL,
        session_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'present',
        grade TEXT,
        marked_by TEXT NOT NULL DEFAULT 'teacher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_att_student ON attendance_records(student_id);
      CREATE INDEX IF NOT EXISTS idx_att_date ON attendance_records(session_date);

      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

      -- ==========================================
      -- PARENT CONNECT SYSTEM TABLES
      -- ==========================================

      CREATE TABLE IF NOT EXISTS parent_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        full_name TEXT NOT NULL,
        primary_phone TEXT NOT NULL,
        secondary_phone TEXT,
        email TEXT,
        preferred_channel TEXT NOT NULL DEFAULT 'whatsapp',
        is_phone_verified BOOLEAN DEFAULT false,
        verification_code TEXT,
        consent_given BOOLEAN DEFAULT true,
        consent_given_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        opted_out BOOLEAN DEFAULT false,
        opted_out_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_prt_phone ON parent_profiles(primary_phone);
      CREATE INDEX IF NOT EXISTS idx_prt_user ON parent_profiles(user_id);

      CREATE TABLE IF NOT EXISTS parent_student_links (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        relationship TEXT NOT NULL DEFAULT 'Father',
        is_primary_contact BOOLEAN DEFAULT true,
        can_receive_attendance BOOLEAN DEFAULT true,
        can_receive_grades BOOLEAN DEFAULT true,
        can_receive_reports BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_psl_parent ON parent_student_links(parent_id);
      CREATE INDEX IF NOT EXISTS idx_psl_student ON parent_student_links(student_id);

      CREATE TABLE IF NOT EXISTS telegram_accounts (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        chat_id TEXT,
        telegram_username TEXT,
        telegram_first_name TEXT,
        pairing_code TEXT,
        pairing_expires_at TIMESTAMP,
        is_verified BOOLEAN DEFAULT false,
        notifications_muted BOOLEAN DEFAULT false,
        linked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tg_parent ON telegram_accounts(parent_id);
      CREATE INDEX IF NOT EXISTS idx_tg_chat ON telegram_accounts(chat_id);
      CREATE INDEX IF NOT EXISTS idx_tg_pair_code ON telegram_accounts(pairing_code);

      CREATE TABLE IF NOT EXISTS parent_notification_preferences (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        notify_on_absent BOOLEAN DEFAULT true,
        notify_on_present BOOLEAN DEFAULT true,
        notify_on_late BOOLEAN DEFAULT true,
        notify_on_departure BOOLEAN DEFAULT false,
        notify_on_exam_result BOOLEAN DEFAULT true,
        notify_on_homework BOOLEAN DEFAULT true,
        notify_on_low_grade_warning BOOLEAN DEFAULT true,
        notify_weekly_report BOOLEAN DEFAULT true,
        notify_monthly_report BOOLEAN DEFAULT true,
        quiet_hours_start TEXT DEFAULT '22:00',
        quiet_hours_end TEXT DEFAULT '08:00',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pnp_parent ON parent_notification_preferences(parent_id);

      CREATE TABLE IF NOT EXISTS notification_templates (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        channel TEXT NOT NULL DEFAULT 'all',
        meta_template_name TEXT,
        meta_template_lang TEXT DEFAULT 'ar',
        body_text_ar TEXT NOT NULL,
        body_text_en TEXT,
        variables JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_nt_code ON notification_templates(code);

      CREATE TABLE IF NOT EXISTS notification_queue (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        student_id TEXT,
        channel TEXT NOT NULL,
        template_code TEXT,
        recipient TEXT NOT NULL,
        payload JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        last_error TEXT,
        idempotency_key TEXT,
        scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_nq_status ON notification_queue(status);
      CREATE INDEX IF NOT EXISTS idx_nq_idempotency ON notification_queue(idempotency_key);
      CREATE INDEX IF NOT EXISTS idx_nq_parent ON notification_queue(parent_id);

      CREATE TABLE IF NOT EXISTS notification_logs (
        id TEXT PRIMARY KEY,
        queue_id TEXT,
        parent_id TEXT,
        student_id TEXT,
        channel TEXT NOT NULL,
        recipient TEXT NOT NULL,
        message_type TEXT NOT NULL,
        content_summary TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        external_message_id TEXT,
        raw_response JSONB,
        error_message TEXT,
        sent_by_user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_nl_parent ON notification_logs(parent_id);
      CREATE INDEX IF NOT EXISTS idx_nl_student ON notification_logs(student_id);
      CREATE INDEX IF NOT EXISTS idx_nl_channel ON notification_logs(channel);
      CREATE INDEX IF NOT EXISTS idx_nl_status ON notification_logs(status);
      CREATE INDEX IF NOT EXISTS idx_nl_date ON notification_logs(created_at);

      CREATE TABLE IF NOT EXISTS attendance_notification_events (
        id TEXT PRIMARY KEY,
        attendance_record_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        parent_id TEXT NOT NULL,
        session_date TEXT NOT NULL,
        status_marked TEXT NOT NULL,
        notification_id TEXT,
        dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ane_record ON attendance_notification_events(attendance_record_id);
      CREATE INDEX IF NOT EXISTS idx_ane_student ON attendance_notification_events(student_id);

      -- Default Notification Templates
      INSERT INTO notification_templates (id, code, name, channel, meta_template_name, meta_template_lang, body_text_ar, body_text_en, is_active)
      VALUES
        ('tmpl_att_absent', 'att_absent', 'إشعار غياب الحصة', 'all', 'pa_attendance_absent_v1', 'ar',
         '🔔 منصة مستر حبيب الرحمن\n\nنحيط سيادتكم علماً بأن الطالب/ة {{student_name}} تغيب عن حضور حصة ({{session_title}}) المقررة بتاريخ {{date}}.\n\nيرجى التواصل مع إدارة الأكاديمية للاطمئنان والتنسيق لتعويض الحصة.',
         'Notification: {{student_name}} was absent from session ({{session_title}}) on {{date}}.', true),
        ('tmpl_att_present', 'att_present', 'إشعار تسجيل الحضور', 'all', 'pa_attendance_present_v1', 'ar',
         '✅ منصة مستر حبيب الرحمن\n\nتم بحمد الله تسجيل حضور الطالب/ة {{student_name}} في حصة ({{session_title}}) اليوم {{date}} في تمام الساعة {{time}}.\n\nنتمنى له دوام التفوق والنجاح.',
         'Attendance confirmed for {{student_name}} in session ({{session_title}}) on {{date}}.', true),
        ('tmpl_att_late', 'att_late', 'إشعار تأخير عن الحصة', 'all', 'pa_attendance_late_v1', 'ar',
         '⏰ منصة مستر حبيب الرحمن\n\nنلفت عناية سيادتكم إلى أن الطالب/ة {{student_name}} وصل متأخراً عن موعد بدء حصة ({{session_title}}) اليوم {{date}} بمقدار {{minutes}} دقيقة.\n\nيرجى حثه على الالتزام بالمواعيد للاستفادة الكاملة من الشرح.',
         'Late alert: {{student_name}} arrived {{minutes}} minutes late for session ({{session_title}}) on {{date}}.', true),
        ('tmpl_exam_result', 'exam_result', 'إشعار نتيجة الامتحان', 'all', 'pa_exam_result_v1', 'ar',
         '🏆 منصة مستر حبيب الرحمن — نتيجة الاختبار\n\nعزيزي ولي أمر الطالب/ة {{student_name}}،\nتم رصد نتيجة اختبار: {{exam_title}}\n\nالدرجة: {{score}} من {{total}} ({{percentage}}%)\nالتقدير: {{grade_label}}\n\nملاحظة الأستاذ: {{feedback}}',
         'Exam Result for {{student_name}}: {{score}}/{{total}} ({{percentage}}%) in {{exam_title}}.', true),
        ('tmpl_weekly_report', 'weekly_report', 'التقرير الأسبوعي الذكي', 'all', 'pa_weekly_report_v1', 'ar',
         '📊 منصة مستر حبيب الرحمن — التقرير الأسبوعي\n\nنرسل لسيادتكم التقرير الأسبوعي لأداء الطالب/ة {{student_name}}:\n- نسبة الحضور: {{attendance_rate}}%\n- الواجبات المسلمة: {{homework_count}}\n- متوسط درجات الاختبارات: {{avg_score}}%\n\nللاطلاع على تفاصيل التقرير والرسوم البيانية عبر الرابط الآمن:\n{{report_url}}',
         'Weekly performance report for {{student_name}}: Attendance {{attendance_rate}}%, Score {{avg_score}}%. View report: {{report_url}}', true),
        ('tmpl_monthly_report', 'monthly_report', 'التقرير الشهري الشامل', 'all', 'pa_monthly_report_v1', 'ar',
         '🌟 منصة مستر حبيب الرحمن — التقرير الشهري الشامل\n\nتقرير متابعة شهر {{month}} للطالب/ة {{student_name}}:\n- نسبة الالتزام بالحضور: {{attendance_rate}}%\n- عدد الامتحانات المنجزة: {{exams_taken}}\n- التطور العام: {{progress_status}}\n\nرابط كشف التقرير المعتمد (PDF):\n{{report_url}}',
         'Monthly report for {{student_name}} - Month: {{month}}. View report: {{report_url}}', true),
        ('tmpl_teacher_note', 'custom_teacher_note', 'رسالة خاصة من مستر حبيب الرحمن', 'all', 'pa_teacher_note_v1', 'ar',
         '💬 رسالة خاصة من مستر حبيب الرحمن إلى ولي أمر الطالب/ة {{student_name}}:\n\n{{note_content}}\n\nدمتم في رعاية الله وتوفيقه.',
         'Special note from Mr. Habib El Rahman regarding {{student_name}}: {{note_content}}', true)
      ON CONFLICT (code) DO NOTHING;

      -- Auto-seed sample parent profile if table is empty
      INSERT INTO parent_profiles (id, user_id, full_name, primary_phone, email, preferred_channel, is_phone_verified, consent_given)
      SELECT 'prt_default_mahmoud', 'usr_parent_1', 'أ/ محمود السيد (ولي أمر عمر)', '+201012345678', 'mahmoud.parent@gmail.com', 'both', true, true
      WHERE NOT EXISTS (SELECT 1 FROM parent_profiles WHERE id = 'prt_default_mahmoud');

      INSERT INTO parent_student_links (id, parent_id, student_id, relationship, is_primary_contact)
      SELECT 'psl_default_1', 'prt_default_mahmoud', 'usr_student_1', 'Father', true
      WHERE NOT EXISTS (SELECT 1 FROM parent_student_links WHERE id = 'psl_default_1');

      INSERT INTO parent_notification_preferences (id, parent_id)
      SELECT 'pnp_default_1', 'prt_default_mahmoud'
      WHERE NOT EXISTS (SELECT 1 FROM parent_notification_preferences WHERE id = 'pnp_default_1');

      -- ==========================================
      -- SMART CURRICULUM ORGANIZATION SYSTEM TABLES
      -- ==========================================

      CREATE TABLE IF NOT EXISTS curriculum_grades (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        stage TEXT NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        story_title_ar TEXT,
        story_title_en TEXT,
        story_author TEXT,
        story_description_ar TEXT,
        story_description_en TEXT,
        story_cover TEXT,
        course_id TEXT,
        order_index INTEGER NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cg_code ON curriculum_grades(code);
      CREATE INDEX IF NOT EXISTS idx_cg_stage ON curriculum_grades(stage);
      CREATE INDEX IF NOT EXISTS idx_cg_active ON curriculum_grades(is_active);

      CREATE TABLE IF NOT EXISTS curriculum_units (
        id TEXT PRIMARY KEY,
        grade_id TEXT NOT NULL REFERENCES curriculum_grades(id) ON DELETE CASCADE,
        unit_number INTEGER NOT NULL,
        type TEXT NOT NULL DEFAULT 'unit',
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        review_scope TEXT,
        description_ar TEXT,
        description_en TEXT,
        order_index INTEGER NOT NULL DEFAULT 1,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cu_grade ON curriculum_units(grade_id);
      CREATE INDEX IF NOT EXISTS idx_cu_type ON curriculum_units(type);
      CREATE INDEX IF NOT EXISTS idx_cu_order ON curriculum_units(order_index);

      CREATE TABLE IF NOT EXISTS curriculum_sections (
        id TEXT PRIMARY KEY,
        unit_id TEXT NOT NULL REFERENCES curriculum_units(id) ON DELETE CASCADE,
        grade_id TEXT NOT NULL,
        section_type TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        video_url TEXT,
        video_duration TEXT DEFAULT '25 mins',
        pdf_url TEXT,
        pdf_title TEXT,
        content_data JSONB,
        quiz_id TEXT,
        order_index INTEGER NOT NULL DEFAULT 1,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cs_unit ON curriculum_sections(unit_id);
      CREATE INDEX IF NOT EXISTS idx_cs_grade ON curriculum_sections(grade_id);
      CREATE INDEX IF NOT EXISTS idx_cs_type ON curriculum_sections(section_type);

      CREATE TABLE IF NOT EXISTS story_chapters (
        id TEXT PRIMARY KEY,
        grade_id TEXT NOT NULL REFERENCES curriculum_grades(id) ON DELETE CASCADE,
        chapter_number INTEGER NOT NULL,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        explanation TEXT,
        video_url TEXT,
        pdf_url TEXT,
        vocabulary JSONB DEFAULT '[]'::jsonb,
        characters JSONB DEFAULT '[]'::jsonb,
        events JSONB DEFAULT '[]'::jsonb,
        important_quotes JSONB DEFAULT '[]'::jsonb,
        questions_and_answers JSONB DEFAULT '[]'::jsonb,
        mcq_questions JSONB DEFAULT '[]'::jsonb,
        chapter_test_quiz_id TEXT,
        order_index INTEGER NOT NULL DEFAULT 1,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sc_grade ON story_chapters(grade_id);
      CREATE INDEX IF NOT EXISTS idx_sc_chapter ON story_chapters(chapter_number);
      CREATE INDEX IF NOT EXISTS idx_sc_order ON story_chapters(order_index);

      CREATE TABLE IF NOT EXISTS student_curriculum_progress (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        grade_id TEXT NOT NULL,
        unit_id TEXT,
        section_id TEXT,
        chapter_id TEXT,
        item_type TEXT NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        score INTEGER,
        max_score INTEGER,
        percentage INTEGER,
        completed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_scp_student ON student_curriculum_progress(student_id);
      CREATE INDEX IF NOT EXISTS idx_scp_grade ON student_curriculum_progress(grade_id);
      CREATE INDEX IF NOT EXISTS idx_scp_unit ON student_curriculum_progress(unit_id);
      CREATE INDEX IF NOT EXISTS idx_scp_section ON student_curriculum_progress(section_id);
      CREATE INDEX IF NOT EXISTS idx_scp_chapter ON student_curriculum_progress(chapter_id);

      CREATE TABLE IF NOT EXISTS student_saved_vocabulary (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        word TEXT NOT NULL,
        arabic_meaning TEXT,
        part_of_speech TEXT,
        ipa_uk TEXT,
        ipa_us TEXT,
        example_sentence TEXT,
        unit_id TEXT,
        grade_id TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ssv_student ON student_saved_vocabulary(student_id);
      CREATE INDEX IF NOT EXISTS idx_ssv_word ON student_saved_vocabulary(word);
      CREATE INDEX IF NOT EXISTS idx_ssv_unit ON student_saved_vocabulary(unit_id);

      CREATE TABLE IF NOT EXISTS student_pronunciation_settings (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        enabled BOOLEAN NOT NULL DEFAULT true,
        accent TEXT NOT NULL DEFAULT 'uk',
        speed TEXT NOT NULL DEFAULT 'normal',
        hover_enabled BOOLEAN NOT NULL DEFAULT true,
        touch_enabled BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sps_student ON student_pronunciation_settings(student_id);

      CREATE TABLE IF NOT EXISTS ministry_assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_en TEXT,
        stage TEXT NOT NULL,
        grade TEXT NOT NULL,
        grade_code TEXT NOT NULL,
        term TEXT NOT NULL DEFAULT 'First',
        subject TEXT NOT NULL DEFAULT 'English',
        assessment_type TEXT NOT NULL,
        week_number INTEGER NOT NULL DEFAULT 1,
        file_url TEXT,
        file_size TEXT DEFAULT '1.8 MB',
        official_source_url TEXT NOT NULL DEFAULT 'https://studentbooks.moe.gov.eg/Performance_Assessments/',
        alternative_source_url TEXT DEFAULT 'https://moe.gov.eg/elearningenterypage/e-learning/',
        verified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT true,
        download_count INTEGER NOT NULL DEFAULT 0,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ma_grade_code ON ministry_assessments(grade_code);
      CREATE INDEX IF NOT EXISTS idx_ma_stage ON ministry_assessments(stage);
      CREATE INDEX IF NOT EXISTS idx_ma_type ON ministry_assessments(assessment_type);
      CREATE INDEX IF NOT EXISTS idx_ma_term ON ministry_assessments(term);
      CREATE INDEX IF NOT EXISTS idx_ma_week ON ministry_assessments(week_number);
      CREATE INDEX IF NOT EXISTS idx_ma_published ON ministry_assessments(is_published);

      CREATE TABLE IF NOT EXISTS student_assessment_downloads (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assessment_id TEXT NOT NULL REFERENCES ministry_assessments(id) ON DELETE CASCADE,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sad_student ON student_assessment_downloads(student_id);
      CREATE INDEX IF NOT EXISTS idx_sad_assessment ON student_assessment_downloads(assessment_id);

      CREATE TABLE IF NOT EXISTS curriculum_analysis_jobs (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        grade_code TEXT NOT NULL DEFAULT 'sec_3',
        stage TEXT NOT NULL DEFAULT 'Secondary',
        term TEXT NOT NULL DEFAULT 'First',
        status TEXT NOT NULL DEFAULT 'pending',
        current_step TEXT NOT NULL DEFAULT 'Initialized',
        progress_percent INTEGER NOT NULL DEFAULT 0,
        checkpoint_data JSONB DEFAULT '{}',
        summary_report JSONB DEFAULT '{}',
        questions_per_lesson INTEGER NOT NULL DEFAULT 20,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_caj_teacher ON curriculum_analysis_jobs(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_caj_status ON curriculum_analysis_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_caj_grade ON curriculum_analysis_jobs(grade_code);

      CREATE TABLE IF NOT EXISTS analyzed_curriculum_questions (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL REFERENCES curriculum_analysis_jobs(id) ON DELETE CASCADE,
        source_type TEXT NOT NULL DEFAULT 'ai_generated',
        page_number INTEGER DEFAULT 1,
        unit_number INTEGER DEFAULT 1,
        unit_title TEXT NOT NULL DEFAULT 'Unit 1',
        lesson_title TEXT NOT NULL DEFAULT 'Lesson 1',
        section_type TEXT NOT NULL DEFAULT 'Vocabulary',
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL DEFAULT 'mcq',
        options JSONB NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        source_reference TEXT,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        is_published BOOLEAN NOT NULL DEFAULT false,
        published_question_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_acq_job ON analyzed_curriculum_questions(job_id);
      CREATE INDEX IF NOT EXISTS idx_acq_source_type ON analyzed_curriculum_questions(source_type);
      CREATE INDEX IF NOT EXISTS idx_acq_approval ON analyzed_curriculum_questions(approval_status);
      CREATE INDEX IF NOT EXISTS idx_acq_difficulty ON analyzed_curriculum_questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_acq_published ON analyzed_curriculum_questions(is_published);

      CREATE TABLE IF NOT EXISTS analyzed_curriculum_quizzes (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL REFERENCES curriculum_analysis_jobs(id) ON DELETE CASCADE,
        quiz_type TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        unit_number INTEGER,
        units_covered JSONB DEFAULT '[]',
        lesson_title TEXT,
        question_ids JSONB NOT NULL DEFAULT '[]',
        duration_minutes INTEGER NOT NULL DEFAULT 30,
        pass_percentage INTEGER NOT NULL DEFAULT 60,
        total_points INTEGER NOT NULL DEFAULT 100,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        is_published BOOLEAN NOT NULL DEFAULT false,
        published_quiz_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_acz_job ON analyzed_curriculum_quizzes(job_id);
      CREATE INDEX IF NOT EXISTS idx_acz_type ON analyzed_curriculum_quizzes(quiz_type);
      CREATE INDEX IF NOT EXISTS idx_acz_approval ON analyzed_curriculum_quizzes(approval_status);
      CREATE INDEX IF NOT EXISTS idx_acz_published ON analyzed_curriculum_quizzes(is_published);

      -- 21. TRANSLATION ACADEMY MODULES & LESSONS
      CREATE TABLE IF NOT EXISTS translation_modules (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        description_en TEXT NOT NULL,
        grade TEXT NOT NULL DEFAULT 'First Secondary',
        term TEXT NOT NULL DEFAULT 'First Term',
        order_index INTEGER NOT NULL DEFAULT 1,
        icon TEXT NOT NULL DEFAULT 'Languages',
        total_lessons INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tm_grade_term ON translation_modules(grade, term);
      CREATE INDEX IF NOT EXISTS idx_tm_order ON translation_modules(order_index);
      CREATE INDEX IF NOT EXISTS idx_tm_published ON translation_modules(is_published);

      CREATE TABLE IF NOT EXISTS translation_lessons (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL REFERENCES translation_modules(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL DEFAULT 1,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        summary_ar TEXT NOT NULL,
        summary_en TEXT NOT NULL,
        video_url TEXT,
        video_duration TEXT DEFAULT '15 mins',
        pdf_url TEXT,
        rules JSONB NOT NULL DEFAULT '[]',
        vocabulary JSONB NOT NULL DEFAULT '[]',
        solved_examples JSONB NOT NULL DEFAULT '[]',
        common_mistakes JSONB NOT NULL DEFAULT '[]',
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tl_module ON translation_lessons(module_id);
      CREATE INDEX IF NOT EXISTS idx_tl_order ON translation_lessons(order_index);
      CREATE INDEX IF NOT EXISTS idx_tl_published ON translation_lessons(is_published);

      CREATE TABLE IF NOT EXISTS translation_questions (
        id TEXT PRIMARY KEY,
        lesson_id TEXT NOT NULL REFERENCES translation_lessons(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL REFERENCES translation_modules(id) ON DELETE CASCADE,
        question_type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        instructions TEXT NOT NULL,
        options JSONB DEFAULT '[]',
        correct_answer TEXT NOT NULL,
        alternative_answers JSONB DEFAULT '[]',
        explanation TEXT NOT NULL,
        marks INTEGER NOT NULL DEFAULT 1,
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        topic TEXT,
        source TEXT,
        audio_url TEXT,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tq_lesson ON translation_questions(lesson_id);
      CREATE INDEX IF NOT EXISTS idx_tq_module ON translation_questions(module_id);
      CREATE INDEX IF NOT EXISTS idx_tq_type ON translation_questions(question_type);
      CREATE INDEX IF NOT EXISTS idx_tq_difficulty ON translation_questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_tq_published ON translation_questions(is_published);

      CREATE TABLE IF NOT EXISTS translation_student_progress (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL REFERENCES translation_lessons(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL REFERENCES translation_modules(id) ON DELETE CASCADE,
        completed BOOLEAN NOT NULL DEFAULT false,
        practice_score INTEGER NOT NULL DEFAULT 0,
        exam_score INTEGER NOT NULL DEFAULT 0,
        total_questions_answered INTEGER NOT NULL DEFAULT 0,
        last_practiced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tsp_student ON translation_student_progress(student_id);
      CREATE INDEX IF NOT EXISTS idx_tsp_lesson ON translation_student_progress(lesson_id);
      CREATE INDEX IF NOT EXISTS idx_tsp_module ON translation_student_progress(module_id);

      CREATE TABLE IF NOT EXISTS translation_submissions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL REFERENCES translation_questions(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL REFERENCES translation_lessons(id) ON DELETE CASCADE,
        mode TEXT NOT NULL DEFAULT 'practice',
        student_answer TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        max_marks INTEGER NOT NULL DEFAULT 1,
        rubric_breakdown JSONB DEFAULT '{}',
        evaluation_feedback TEXT,
        suggested_correction TEXT,
        model_answer_used TEXT,
        status TEXT NOT NULL DEFAULT 'graded',
        teacher_comment TEXT,
        reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tsub_student ON translation_submissions(student_id);
      CREATE INDEX IF NOT EXISTS idx_tsub_question ON translation_submissions(question_id);
      CREATE INDEX IF NOT EXISTS idx_tsub_lesson ON translation_submissions(lesson_id);
      CREATE INDEX IF NOT EXISTS idx_tsub_status ON translation_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_tsub_mode ON translation_submissions(mode);

      CREATE TABLE IF NOT EXISTS translation_exams (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL REFERENCES translation_modules(id) ON DELETE CASCADE,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        grade TEXT NOT NULL DEFAULT 'First Secondary',
        term TEXT NOT NULL DEFAULT 'First Term',
        time_limit_minutes INTEGER NOT NULL DEFAULT 30,
        passing_score INTEGER NOT NULL DEFAULT 60,
        question_ids JSONB NOT NULL DEFAULT '[]',
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_te_module ON translation_exams(module_id);
      CREATE INDEX IF NOT EXISTS idx_te_published ON translation_exams(is_published);

      CREATE TABLE IF NOT EXISTS translation_exam_attempts (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL REFERENCES translation_exams(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL DEFAULT 0,
        max_score INTEGER NOT NULL DEFAULT 100,
        percentage INTEGER NOT NULL DEFAULT 0,
        passed BOOLEAN NOT NULL DEFAULT false,
        answers JSONB NOT NULL DEFAULT '[]',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tea_exam ON translation_exam_attempts(exam_id);
      CREATE INDEX IF NOT EXISTS idx_tea_student ON translation_exam_attempts(student_id);

      CREATE TABLE IF NOT EXISTS live_sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        stage TEXT NOT NULL DEFAULT 'Secondary',
        grade TEXT NOT NULL DEFAULT 'Third Secondary (Baccalaureate)',
        subject TEXT NOT NULL DEFAULT 'English',
        teacher_id TEXT NOT NULL DEFAULT 'usr_admin_1',
        teacher_name TEXT NOT NULL DEFAULT 'Mr. Habib El Rahman',
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        meet_url TEXT NOT NULL,
        google_event_id TEXT,
        calendar_html_link TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled',
        recording_url TEXT,
        recording_notes TEXT,
        max_attendees INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ls_start ON live_sessions(start_time);
      CREATE INDEX IF NOT EXISTS idx_ls_grade ON live_sessions(grade);
      CREATE INDEX IF NOT EXISTS idx_ls_status ON live_sessions(status);

      CREATE TABLE IF NOT EXISTS google_integrations (
        id TEXT PRIMARY KEY,
        account_email TEXT NOT NULL UNIQUE,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        scope TEXT,
        is_connected BOOLEAN DEFAULT false,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS training_questions (
        id TEXT PRIMARY KEY,
        question_number TEXT,
        original_order INTEGER NOT NULL,
        source_document TEXT NOT NULL DEFAULT 'Professional_Question_Bank_20261108_233552.docx',
        source_page INTEGER DEFAULT 1,
        question_text TEXT NOT NULL,
        raw_text TEXT,
        options JSONB NOT NULL DEFAULT '[]'::jsonb,
        options_count INTEGER NOT NULL DEFAULT 0,
        correct_answer TEXT,
        explanation TEXT,
        category TEXT NOT NULL DEFAULT 'Grammar & Vocabulary',
        topic TEXT NOT NULL DEFAULT 'Grammar & Vocabulary',
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        validation_status TEXT NOT NULL DEFAULT 'unverified_answer',
        is_published BOOLEAN NOT NULL DEFAULT false,
        verified_by TEXT,
        verified_at TIMESTAMP,
        notes TEXT,
        times_practiced INTEGER NOT NULL DEFAULT 0,
        times_correct INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tq_status ON training_questions(validation_status);
      CREATE INDEX IF NOT EXISTS idx_tq_published ON training_questions(is_published);
      CREATE INDEX IF NOT EXISTS idx_tq_topic ON training_questions(topic);
      CREATE INDEX IF NOT EXISTS idx_tq_difficulty ON training_questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_tq_order ON training_questions(original_order);

      CREATE TABLE IF NOT EXISTS training_student_attempts (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        selected_answer TEXT,
        is_correct BOOLEAN NOT NULL,
        attempt_type TEXT NOT NULL DEFAULT 'practice',
        time_spent_seconds INTEGER DEFAULT 0,
        exam_session_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tsa_student ON training_student_attempts(student_id);
      CREATE INDEX IF NOT EXISTS idx_tsa_question ON training_student_attempts(question_id);
      CREATE INDEX IF NOT EXISTS idx_tsa_created ON training_student_attempts(created_at);

      CREATE TABLE IF NOT EXISTS training_bookmarks (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tb_student ON training_bookmarks(student_id);
      CREATE INDEX IF NOT EXISTS idx_tb_question ON training_bookmarks(question_id);

      CREATE TABLE IF NOT EXISTS training_exam_sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        question_count INTEGER NOT NULL,
        duration_minutes INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        percentage DECIMAL(5, 2) DEFAULT 0.00,
        passed BOOLEAN DEFAULT false,
        status TEXT NOT NULL DEFAULT 'in_progress',
        question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        student_answers JSONB DEFAULT '{}'::jsonb,
        detailed_results JSONB DEFAULT '[]'::jsonb,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        submitted_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_tes_student ON training_exam_sessions(student_id);
      CREATE INDEX IF NOT EXISTS idx_tes_status ON training_exam_sessions(status);

      CREATE TABLE IF NOT EXISTS training_revision_queue (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        mistake_count INTEGER NOT NULL DEFAULT 1,
        last_mistake_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        resolved BOOLEAN NOT NULL DEFAULT false,
        resolved_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_trq_student ON training_revision_queue(student_id);
      CREATE INDEX IF NOT EXISTS idx_trq_resolved ON training_revision_queue(resolved);

      CREATE TABLE IF NOT EXISTS story_scenes (
        id TEXT PRIMARY KEY,
        chapter_id TEXT NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
        scene_number INTEGER NOT NULL,
        title_ar TEXT,
        title_en TEXT,
        narration_en TEXT NOT NULL,
        narration_ar TEXT NOT NULL,
        audio_url TEXT,
        character_name TEXT,
        character_avatar TEXT,
        backdrop_image TEXT,
        karaoke_tokens JSONB DEFAULT '[]'::jsonb,
        order_index INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ss_chapter ON story_scenes(chapter_id);

      CREATE TABLE IF NOT EXISTS story_character_chat_sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        grade_id TEXT NOT NULL,
        character_name TEXT NOT NULL,
        messages JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sccs_student ON story_character_chat_sessions(student_id);
      CREATE INDEX IF NOT EXISTS idx_sccs_char ON story_character_chat_sessions(character_name);

      CREATE TABLE IF NOT EXISTS story_student_progress (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        grade_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        last_page INTEGER NOT NULL DEFAULT 1,
        reading_progress INTEGER NOT NULL DEFAULT 0,
        listening_progress INTEGER NOT NULL DEFAULT 0,
        learned_vocab JSONB DEFAULT '[]'::jsonb,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ssp_student ON story_student_progress(student_id);
      CREATE INDEX IF NOT EXISTS idx_ssp_chapter ON story_student_progress(chapter_id);

      CREATE TABLE IF NOT EXISTS story_student_badges (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        badge_code TEXT NOT NULL,
        badge_name_ar TEXT NOT NULL,
        badge_name_en TEXT NOT NULL,
        badge_icon TEXT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ssb_student ON story_student_badges(student_id);
      CREATE INDEX IF NOT EXISTS idx_ssb_badge ON story_student_badges(badge_code);

      CREATE TABLE IF NOT EXISTS dialogues (
        id TEXT PRIMARY KEY,
        grade TEXT NOT NULL,
        grade_label_ar TEXT NOT NULL,
        grade_label_en TEXT NOT NULL,
        dialogue_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        governorate TEXT,
        governorate_ar TEXT,
        year INTEGER,
        speakers JSONB DEFAULT '[]'::jsonb,
        lines JSONB DEFAULT '[]'::jsonb,
        approved_answers JSONB DEFAULT '{}'::jsonb,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_dlg_grade ON dialogues(grade);
      CREATE INDEX IF NOT EXISTS idx_dlg_number ON dialogues(dialogue_number);
      CREATE INDEX IF NOT EXISTS idx_dlg_published ON dialogues(is_published);

      CREATE TABLE IF NOT EXISTS dialogue_submissions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        dialogue_id TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'practice',
        student_answers JSONB DEFAULT '{}'::jsonb,
        evaluation_results JSONB DEFAULT '{}'::jsonb,
        score INTEGER NOT NULL DEFAULT 0,
        max_score INTEGER NOT NULL DEFAULT 5,
        percentage INTEGER NOT NULL DEFAULT 0,
        time_taken_seconds INTEGER DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_dsub_student ON dialogue_submissions(student_id);
      CREATE INDEX IF NOT EXISTS idx_dsub_dialogue ON dialogue_submissions(dialogue_id);
      CREATE INDEX IF NOT EXISTS idx_dsub_mode ON dialogue_submissions(mode);

      CREATE TABLE IF NOT EXISTS dialogue_student_progress (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        grade TEXT NOT NULL,
        completed_dialogue_ids JSONB DEFAULT '[]'::jsonb,
        total_practice_count INTEGER NOT NULL DEFAULT 0,
        perfect_score_count INTEGER NOT NULL DEFAULT 0,
        total_points_earned INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0,
        last_practiced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_dsp_student ON dialogue_student_progress(student_id);
      CREATE INDEX IF NOT EXISTS idx_dsp_grade ON dialogue_student_progress(grade);
    `);

  // Seed and sync curriculum grades and units to official 2026/2027 Egyptian syllabus
  await syncCurriculum2026();
  await seedMinistryAssessmentsIfEmpty();
  await seedCoreUsersIfEmpty();
  await seedTranslationAcademyIfEmpty();
  await seedLiveSessionsIfEmpty();
  await seedTrainingCenterQuestionsIfEmpty();
  await seedDialogueCenterIfEmpty();
}

export async function syncCurriculum2026(): Promise<{
  updatedGrades: number;
  insertedGrades: number;
  updatedUnits: number;
  insertedUnits: number;
  updatedStories: number;
}> {
  let updatedGrades = 0;
  let insertedGrades = 0;
  let updatedUnits = 0;
  let insertedUnits = 0;
  let updatedStories = 0;

  try {
    for (let gIdx = 0; gIdx < SMART_CURRICULUM_SEEDS.length; gIdx++) {
      const seed = SMART_CURRICULUM_SEEDS[gIdx];
      const existingGrade = await db
        .select()
        .from(curriculumGrades)
        .where(eq(curriculumGrades.id, seed.id));

      if (existingGrade.length === 0) {
        await db.insert(curriculumGrades).values({
          id: seed.id,
          code: seed.code,
          titleAr: seed.titleAr,
          titleEn: seed.titleEn,
          stage: seed.stage,
          descriptionAr: seed.descriptionAr,
          descriptionEn: seed.descriptionEn,
          storyTitleAr: seed.story.titleAr,
          storyTitleEn: seed.story.titleEn,
          storyAuthor: seed.story.author,
          storyDescriptionAr: seed.story.descriptionAr,
          storyDescriptionEn: seed.story.descriptionEn,
          storyCover: seed.story.coverImage,
          courseId: seed.courseId,
          orderIndex: gIdx + 1,
          isActive: true,
        });
        insertedGrades++;
      } else {
        await db
          .update(curriculumGrades)
          .set({
            titleAr: seed.titleAr,
            titleEn: seed.titleEn,
            stage: seed.stage,
            descriptionAr: seed.descriptionAr,
            descriptionEn: seed.descriptionEn,
            storyTitleAr: seed.story.titleAr,
            storyTitleEn: seed.story.titleEn,
            storyAuthor: seed.story.author,
            storyDescriptionAr: seed.story.descriptionAr,
            storyDescriptionEn: seed.story.descriptionEn,
            storyCover: seed.story.coverImage,
          })
          .where(eq(curriculumGrades.id, seed.id));
        updatedGrades++;
      }

      // Sync Story Chapters
      for (const ch of seed.story.chapters) {
        const chapterId = `sc_${seed.code}_ch_${ch.chapterNumber}`;
        const existingCh = await db
          .select()
          .from(storyChapters)
          .where(eq(storyChapters.id, chapterId));

        if (existingCh.length === 0) {
          await db.insert(storyChapters).values({
            id: chapterId,
            gradeId: seed.id,
            chapterNumber: ch.chapterNumber,
            titleAr: ch.titleAr,
            titleEn: ch.titleEn,
            explanation: ch.explanation,
            videoUrl: ch.videoUrl || null,
            pdfUrl: ch.pdfUrl || null,
            vocabulary: ch.vocabulary || [],
            characters: ch.characters || [],
            events: ch.events || [],
            importantQuotes: ch.importantQuotes || [],
            questionsAndAnswers: ch.questionsAndAnswers || [],
            mcqQuestions: ch.mcqQuestions || [],
            orderIndex: ch.chapterNumber,
            isPublished: true,
          });
          updatedStories++;
        } else {
          // Update details, keep existing video/pdf if custom set
          await db
            .update(storyChapters)
            .set({
              titleAr: ch.titleAr,
              titleEn: ch.titleEn,
              explanation: ch.explanation,
              videoUrl: existingCh[0].videoUrl || ch.videoUrl || null,
              pdfUrl: existingCh[0].pdfUrl || ch.pdfUrl || null,
              vocabulary: ch.vocabulary || [],
              characters: ch.characters || [],
              events: ch.events || [],
              importantQuotes: ch.importantQuotes || [],
              questionsAndAnswers: ch.questionsAndAnswers || [],
              mcqQuestions: ch.mcqQuestions || [],
            })
            .where(eq(storyChapters.id, chapterId));
          updatedStories++;
        }
      }

      // Sync Units & Reviews
      for (const u of seed.units) {
        const unitId = `unit_${seed.code}_${u.type === "review" ? `rev_${u.orderIndex}` : `u${u.unitNumber}`}`;
        const existingUnit = await db
          .select()
          .from(curriculumUnits)
          .where(eq(curriculumUnits.id, unitId));

        if (existingUnit.length === 0) {
          await db.insert(curriculumUnits).values({
            id: unitId,
            gradeId: seed.id,
            unitNumber: u.unitNumber,
            type: u.type,
            titleAr: u.titleAr,
            titleEn: u.titleEn,
            reviewScope: u.reviewScope || null,
            descriptionAr: u.descriptionAr,
            descriptionEn: u.descriptionEn,
            orderIndex: u.orderIndex,
            isPublished: true,
          });
          insertedUnits++;

          // Insert default sections for new unit
          for (let sIdx = 0; sIdx < u.sections.length; sIdx++) {
            const s = u.sections[sIdx];
            await db.insert(curriculumSections).values({
              id: `sec_${unitId}_${s.sectionType}_${sIdx + 1}`,
              unitId: unitId,
              gradeId: seed.id,
              sectionType: s.sectionType,
              titleAr: s.titleAr,
              titleEn: s.titleEn,
              videoUrl: s.videoUrl || null,
              pdfUrl: s.pdfUrl || null,
              contentData: s.contentData || {},
              quizId: s.quizId || null,
              orderIndex: sIdx + 1,
              isPublished: true,
            });
          }
        } else {
          // Update unit titles, review scope, descriptions
          await db
            .update(curriculumUnits)
            .set({
              unitNumber: u.unitNumber,
              type: u.type,
              titleAr: u.titleAr,
              titleEn: u.titleEn,
              reviewScope: u.reviewScope || null,
              descriptionAr: u.descriptionAr,
              descriptionEn: u.descriptionEn,
              orderIndex: u.orderIndex,
            })
            .where(eq(curriculumUnits.id, unitId));
          updatedUnits++;

          // Check and insert any missing sections for existing units
          for (let sIdx = 0; sIdx < u.sections.length; sIdx++) {
            const s = u.sections[sIdx];
            const sectionId = `sec_${unitId}_${s.sectionType}_${sIdx + 1}`;
            const existingSec = await db.select().from(curriculumSections).where(eq(curriculumSections.id, sectionId));
            if (existingSec.length === 0) {
              await db.insert(curriculumSections).values({
                id: sectionId,
                unitId: unitId,
                gradeId: seed.id,
                sectionType: s.sectionType,
                titleAr: s.titleAr,
                titleEn: s.titleEn,
                videoUrl: s.videoUrl || null,
                pdfUrl: s.pdfUrl || null,
                contentData: s.contentData || {},
                quizId: s.quizId || null,
                orderIndex: sIdx + 1,
                isPublished: true,
              });
            }
          }
        }
      }
    }

    // Sync All Authentic Curriculum Stories from Professional Story World Booklets
    for (const st of ALL_CURRICULUM_STORIES) {
      for (const ch of st.chapters) {
        const chapterId = ch.id;
        const gradeId = `grade_${st.gradeCode}`;
        const existingCh = await db
          .select()
          .from(storyChapters)
          .where(eq(storyChapters.id, chapterId));

        if (existingCh.length === 0) {
          await db.insert(storyChapters).values({
            id: chapterId,
            gradeId: gradeId,
            chapterNumber: ch.chapterNumber,
            titleAr: ch.titleAr,
            titleEn: ch.titleEn,
            explanation: ch.summaryEn || ch.summaryAr,
            videoUrl: null,
            pdfUrl: null,
            vocabulary: ch.vocabulary || [],
            characters: st.characters || [],
            events: ch.chapterInPoints || [],
            importantQuotes: ch.importantQuestions || [],
            questionsAndAnswers: ch.questionsAndAnswers || [],
            mcqQuestions: ch.mcqQuestions || [],
            orderIndex: ch.chapterNumber,
            isPublished: true,
          });
          updatedStories++;
        }
      }
    }
  } catch (error) {
    console.error("syncCurriculum2026 Error:", error);
  }

  return { updatedGrades, insertedGrades, updatedUnits, insertedUnits, updatedStories };
}

async function seedMinistryAssessmentsIfEmpty(): Promise<void> {
  try {
    const existing = await db
      .select({ id: ministryAssessments.id })
      .from(ministryAssessments)
      .limit(1);

    if (existing.length > 0) return;

    const MOE_PORTAL_MAIN = "https://studentbooks.moe.gov.eg/Performance_Assessments/";
    const MOE_PORTAL_ALT = "https://moe.gov.eg/elearningenterypage/e-learning/";

    const initialAssessments = [
      // 1. First Prep
      {
        id: "ma_prep_1_w1_weekly",
        title: "التقييم الأسبوعي - الأسبوع الأول (Life in a Digital World)",
        titleEn: "Week 1 Weekly Assessment - Unit 1",
        stage: "Preparatory",
        grade: "First Prep",
        gradeCode: "prep_1",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.4 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_1_w1_class",
        title: "الأداء الصفي - الأسبوع الأول (Life in a Digital World)",
        titleEn: "Week 1 Classroom Performance - Unit 1",
        stage: "Preparatory",
        grade: "First Prep",
        gradeCode: "prep_1",
        term: "First",
        subject: "English",
        assessmentType: "classroom_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.1 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_1_w1_hw",
        title: "الواجب المنزلي - الأسبوع الأول (Life in a Digital World)",
        titleEn: "Week 1 Homework Performance - Unit 1",
        stage: "Preparatory",
        grade: "First Prep",
        gradeCode: "prep_1",
        term: "First",
        subject: "English",
        assessmentType: "homework_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.2 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_1_m1",
        title: "تقييم شهر أكتوبر الرسمي - الصف الأول الإعدادي",
        titleEn: "October Monthly Assessment - First Prep",
        stage: "Preparatory",
        grade: "First Prep",
        gradeCode: "prep_1",
        term: "First",
        subject: "English",
        assessmentType: "monthly",
        weekNumber: 4,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "2.1 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },

      // 2. Second Prep
      {
        id: "ma_prep_2_w1_weekly",
        title: "التقييم الأسبوعي - الأسبوع الأول (Gen Alpha)",
        titleEn: "Week 1 Weekly Assessment - Gen Alpha",
        stage: "Preparatory",
        grade: "Second Prep",
        gradeCode: "prep_2",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.3 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_2_w1_class",
        title: "الأداء الصفي - الأسبوع الأول (Gen Alpha)",
        titleEn: "Week 1 Classroom Performance - Gen Alpha",
        stage: "Preparatory",
        grade: "Second Prep",
        gradeCode: "prep_2",
        term: "First",
        subject: "English",
        assessmentType: "classroom_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.1 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_2_w1_hw",
        title: "الواجب المنزلي - الأسبوع الأول (Gen Alpha)",
        titleEn: "Week 1 Homework Performance - Gen Alpha",
        stage: "Preparatory",
        grade: "Second Prep",
        gradeCode: "prep_2",
        term: "First",
        subject: "English",
        assessmentType: "homework_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.2 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },

      // 3. Third Prep
      {
        id: "ma_prep_3_w1_weekly",
        title: "التقييم الأسبوعي - الأسبوع الأول (Personal Identity)",
        titleEn: "Week 1 Weekly Assessment - Personal Identity",
        stage: "Preparatory",
        grade: "Third Prep",
        gradeCode: "prep_3",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.5 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_3_w1_class",
        title: "الأداء الصفي - الأسبوع الأول (Personal Identity)",
        titleEn: "Week 1 Classroom Performance - Personal Identity",
        stage: "Preparatory",
        grade: "Third Prep",
        gradeCode: "prep_3",
        term: "First",
        subject: "English",
        assessmentType: "classroom_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.2 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_prep_3_w1_hw",
        title: "الواجب المنزلي - الأسبوع الأول (Personal Identity)",
        titleEn: "Week 1 Homework Performance - Personal Identity",
        stage: "Preparatory",
        grade: "Third Prep",
        gradeCode: "prep_3",
        term: "First",
        subject: "English",
        assessmentType: "homework_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.3 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },

      // 4. First Secondary
      {
        id: "ma_sec_1_w1_weekly",
        title: "التقييم الأسبوعي - الأسبوع الأول (Egypt's Heritage)",
        titleEn: "Week 1 Weekly Assessment - Egypt's Heritage",
        stage: "Secondary",
        grade: "First Secondary",
        gradeCode: "sec_1",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.6 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_1_w1_class",
        title: "الأداء الصفي - الأسبوع الأول (Egypt's Heritage)",
        titleEn: "Week 1 Classroom Performance - Egypt's Heritage",
        stage: "Secondary",
        grade: "First Secondary",
        gradeCode: "sec_1",
        term: "First",
        subject: "English",
        assessmentType: "classroom_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.2 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_1_w1_hw",
        title: "الواجب المنزلي - الأسبوع الأول (Egypt's Heritage)",
        titleEn: "Week 1 Homework Performance - Egypt's Heritage",
        stage: "Secondary",
        grade: "First Secondary",
        gradeCode: "sec_1",
        term: "First",
        subject: "English",
        assessmentType: "homework_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.3 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },

      // 5. Second Secondary
      {
        id: "ma_sec_2_w1_weekly",
        title: "التقييم الأسبوعي - الأسبوع الأول (Egypt-Africa Cooperation)",
        titleEn: "Week 1 Weekly Assessment - Egypt-Africa Cooperation",
        stage: "Secondary",
        grade: "Second Secondary",
        gradeCode: "sec_2",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.5 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_2_w1_class",
        title: "الأداء الصفي - الأسبوع الأول (Egypt-Africa Cooperation)",
        titleEn: "Week 1 Classroom Performance - Egypt-Africa Cooperation",
        stage: "Secondary",
        grade: "Second Secondary",
        gradeCode: "sec_2",
        term: "First",
        subject: "English",
        assessmentType: "classroom_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.1 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_2_w1_hw",
        title: "الواجب المنزلي - الأسبوع الأول (Egypt-Africa Cooperation)",
        titleEn: "Week 1 Homework Performance - Egypt-Africa Cooperation",
        stage: "Secondary",
        grade: "Second Secondary",
        gradeCode: "sec_2",
        term: "First",
        subject: "English",
        assessmentType: "homework_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.2 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },

      // 6. Third Secondary
      {
        id: "ma_sec_3_w1_weekly",
        title: "التقييم الأسبوعي - الأسبوع الأول (Inside the World of Care)",
        titleEn: "Week 1 Weekly Assessment - Inside the World of Care",
        stage: "Secondary",
        grade: "Third Secondary",
        gradeCode: "sec_3",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.8 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_3_w1_class",
        title: "الأداء الصفي - الأسبوع الأول (Inside the World of Care)",
        titleEn: "Week 1 Classroom Performance - Inside the World of Care",
        stage: "Secondary",
        grade: "Third Secondary",
        gradeCode: "sec_3",
        term: "First",
        subject: "English",
        assessmentType: "classroom_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.3 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_3_w1_hw",
        title: "الواجب المنزلي - الأسبوع الأول (Inside the World of Care)",
        titleEn: "Week 1 Homework Performance - Inside the World of Care",
        stage: "Secondary",
        grade: "Third Secondary",
        gradeCode: "sec_3",
        term: "First",
        subject: "English",
        assessmentType: "homework_performance",
        weekNumber: 1,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.4 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_3_w2_weekly",
        title: "التقييم الأسبوعي - الأسبوع الثاني (The Power of Machines)",
        titleEn: "Week 2 Weekly Assessment - The Power of Machines",
        stage: "Secondary",
        grade: "Third Secondary",
        gradeCode: "sec_3",
        term: "First",
        subject: "English",
        assessmentType: "weekly",
        weekNumber: 2,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "1.7 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
      {
        id: "ma_sec_3_m1",
        title: "تقييم شهر أكتوبر الرسمي - الصف الثالث الثانوي (ثانوية عامة)",
        titleEn: "October Monthly Assessment - Third Secondary",
        stage: "Secondary",
        grade: "Third Secondary",
        gradeCode: "sec_3",
        term: "First",
        subject: "English",
        assessmentType: "monthly",
        weekNumber: 4,
        fileUrl: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        fileSize: "2.4 MB",
        officialSourceUrl: MOE_PORTAL_MAIN,
        alternativeSourceUrl: MOE_PORTAL_ALT,
        verifiedDate: new Date(),
        isPublished: true,
      },
    ];

    await db.insert(ministryAssessments).values(initialAssessments);
  } catch (error) {
    console.error("Seed Ministry Assessments Error:", error);
  }
}

export async function seedCoreUsersIfEmpty(): Promise<void> {
  try {
    const existing = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .limit(10);

    if (existing.length === 0) {
      await db.insert(users).values([
        {
          id: "usr_admin_1",
          name: "Mr. Habib El Rahman",
          email: "habib.admin@proacademy.com",
          username: "habibadmin",
          password: hashPassword("admin123password"),
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          phone: "+20 100 646 8384",
          parentPhone: "",
          stage: "Secondary",
          grade: "Third Secondary (Baccalaureate)",
          streak: 42,
          points: 2450,
          level: "Advanced",
          preferredLang: "ar",
        },
        {
          id: "usr_teacher_1",
          name: "Ms. Sarah Ahmed (Grammar Specialist)",
          email: "sarah.teacher@proacademy.com",
          username: "sarah.teacher",
          password: hashPassword("teacher123password"),
          role: "teacher",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          phone: "+20 101 987 6543",
          parentPhone: "",
          stage: "Secondary",
          grade: "Second Secondary",
          streak: 15,
          points: 1200,
          level: "Advanced",
          preferredLang: "ar",
        },
        {
          id: "usr_student_1",
          name: "Omar Mahmoud Al-Sayed",
          email: "omar.student@gmail.com",
          username: "omar.student",
          password: hashPassword("student123password"),
          role: "student",
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
          phone: "+20 111 222 3333",
          parentPhone: "+20 111 222 9999",
          stage: "Secondary",
          grade: "Third Secondary (Baccalaureate)",
          streak: 12,
          points: 680,
          level: "Upper Intermediate",
          preferredLang: "ar",
        },
      ]);
    } else {
      // Ensure admin has username 'habibadmin' set for fast lookups
      const adminUser = existing.find(
        (u) => u.email === "habib.admin@proacademy.com" || u.id === "usr_admin_1"
      );
      if (adminUser && !adminUser.username) {
        await db
          .update(users)
          .set({ username: "habibadmin" })
          .where(eq(users.id, adminUser.id));
      }
    }
  } catch (error) {
    console.error("Seed Core Users Error:", error);
  }
}

export async function seedTranslationAcademyIfEmpty(): Promise<void> {
  try {
    const existing = await db
      .select({ id: translationModules.id })
      .from(translationModules)
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    console.log("Seeding Translation Academy modules, lessons, and questions...");

    for (const mod of TRANSLATION_MODULES_SEED) {
      await db.insert(translationModules).values({
        id: mod.id,
        code: mod.code,
        titleAr: mod.titleAr,
        titleEn: mod.titleEn,
        descriptionAr: mod.descriptionAr,
        descriptionEn: mod.descriptionEn,
        grade: mod.grade,
        term: mod.term,
        orderIndex: mod.orderIndex,
        icon: mod.icon,
        totalLessons: mod.lessons.length,
        isPublished: true,
      });

      for (const lesson of mod.lessons) {
        await db.insert(translationLessons).values({
          id: lesson.id,
          moduleId: mod.id,
          orderIndex: lesson.orderIndex,
          titleAr: lesson.titleAr,
          titleEn: lesson.titleEn,
          summaryAr: lesson.summaryAr,
          summaryEn: lesson.summaryEn,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.videoDuration,
          pdfUrl: lesson.pdfUrl,
          rules: lesson.rules as any,
          vocabulary: lesson.vocabulary as any,
          solvedExamples: lesson.solvedExamples as any,
          commonMistakes: lesson.commonMistakes as any,
          isPublished: true,
        });

        for (const q of lesson.questions) {
          await db.insert(translationQuestions).values({
            id: q.id,
            lessonId: lesson.id,
            moduleId: mod.id,
            questionType: q.questionType,
            questionText: q.questionText,
            instructions: q.instructions,
            options: q.options as any,
            correctAnswer: q.correctAnswer,
            alternativeAnswers: q.alternativeAnswers as any,
            explanation: q.explanation,
            marks: q.marks,
            difficulty: q.difficulty,
            topic: q.topic,
            source: q.source,
            audioUrl: q.audioUrl,
            isPublished: true,
          });
        }
      }
    }

    for (const exam of SAMPLE_TRANSLATION_EXAMS) {
      await db.insert(translationExams).values({
        id: exam.id,
        moduleId: exam.moduleId,
        titleAr: exam.titleAr,
        titleEn: exam.titleEn,
        grade: exam.grade,
        term: exam.term,
        timeLimitMinutes: exam.timeLimitMinutes,
        passingScore: exam.passingScore,
        questionIds: exam.questionIds as any,
        isPublished: true,
      });
    }

    console.log("Translation Academy seeded successfully!");
  } catch (error) {
    console.error("Seed Translation Academy Error:", error);
  }
}

async function seedLiveSessionsIfEmpty(): Promise<void> {
  try {
    const existing = await db.select({ id: liveSessions.id }).from(liveSessions).limit(1);
    if (existing.length > 0) return;

    const now = new Date();
    const upcomingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours ahead
    const upcomingEndTime = new Date(upcomingTime.getTime() + 60 * 60 * 1000);

    const nextDayTime = new Date(now.getTime() + 26 * 60 * 60 * 1000); // tomorrow
    const nextDayEndTime = new Date(nextDayTime.getTime() + 60 * 60 * 1000);

    const pastTime = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 2 days ago
    const pastEndTime = new Date(pastTime.getTime() + 60 * 60 * 1000);

    await db.insert(liveSessions).values([
      {
        id: "ls_demo_1",
        title: "حصة مراجعة تفاعلية مباشرة: أسرار وحيل الترجمة للثانوية العامة 2026/2027",
        description: "مناقشة تفاعلية وحل تدريبات مباشرة على قواعد وأساليب الترجمة مع مستر حبيب الرحمن عبر Google Meet.",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        subject: "English",
        teacherId: "usr_admin_1",
        teacherName: "Mr. Habib El Rahman",
        startTime: upcomingTime,
        endTime: upcomingEndTime,
        durationMinutes: 60,
        meetUrl: "https://meet.google.com/qpa-yomc-nzo",
        googleEventId: "evt_meet_demo_1",
        calendarHtmlLink: "https://calendar.google.com",
        status: "scheduled",
        recordingUrl: null,
        recordingNotes: null,
        maxAttendees: 100,
      },
      {
        id: "ls_demo_2",
        title: "ورشة عمل نطق ومحادثة تفاعلية: Speaking & Vocabulary in Action",
        description: "تدريب عملي ومباشر على نطق الكلمات الصعبة وتطبيق مهارات القاموس الناطق.",
        stage: "Secondary",
        grade: "First Secondary",
        subject: "English",
        teacherId: "usr_admin_1",
        teacherName: "Mr. Habib El Rahman",
        startTime: nextDayTime,
        endTime: nextDayEndTime,
        durationMinutes: 60,
        meetUrl: "https://meet.google.com/wkh-tzbj-rsm",
        googleEventId: "evt_meet_demo_2",
        calendarHtmlLink: "https://calendar.google.com",
        status: "scheduled",
        recordingUrl: null,
        recordingNotes: null,
        maxAttendees: 100,
      },
      {
        id: "ls_demo_3",
        title: "تسجيل حصة: التأسيس الشامل لقواعد الأزمنة الماضية (Past Tenses Mastery)",
        description: "تسجيل كامل للحصة التفاعلية السابقة متضمناً شرح الاستخدامات الخاصة وحل أسئلة البوكليت وإجابات الطلاب.",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        subject: "English",
        teacherId: "usr_admin_1",
        teacherName: "Mr. Habib El Rahman",
        startTime: pastTime,
        endTime: pastEndTime,
        durationMinutes: 60,
        meetUrl: "https://meet.google.com/qpa-yomc-nzo",
        googleEventId: "evt_meet_demo_3",
        calendarHtmlLink: "https://calendar.google.com",
        status: "completed",
        recordingUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        recordingNotes: "تسجيل عالي الجودة متاح للمشاهدة والإعادة لجميع طلاب المنصة.",
        maxAttendees: 100,
      },
    ]);

    // Ensure google_integrations entry exists for fandam228@gmail.com
    const existingGoogle = await db
      .select({ id: googleIntegrations.id })
      .from(googleIntegrations)
      .where(eq(googleIntegrations.accountEmail, "fandam228@gmail.com"))
      .limit(1);

    if (existingGoogle.length === 0) {
      await db.insert(googleIntegrations).values({
        id: "g_int_fandam",
        accountEmail: "fandam228@gmail.com",
        scope: "https://www.googleapis.com/auth/calendar.events",
        isConnected: false,
      });
    }

    console.log("Live sessions and Google integration initialized successfully!");
  } catch (error) {
    console.error("Seed Live Sessions Error:", error);
  }
}

export async function seedTrainingCenterQuestionsIfEmpty(): Promise<void> {
  try {
    const existing = await db
      .select({ id: trainingQuestions.id })
      .from(trainingQuestions)
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    console.log(`Seeding ${EXTRACTED_TRAINING_QUESTIONS.length} extracted training questions...`);
    const BATCH_SIZE = 50;
    for (let i = 0; i < EXTRACTED_TRAINING_QUESTIONS.length; i += BATCH_SIZE) {
      const chunk = EXTRACTED_TRAINING_QUESTIONS.slice(i, i + BATCH_SIZE).map((q: any) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        originalOrder: q.originalOrder,
        sourceDocument: q.sourceDocument || "Professional_Question_Bank_20261108_233552.docx",
        sourcePage: q.sourcePage || 1,
        questionText: q.questionText,
        rawText: q.rawText,
        options: q.options || [],
        optionsCount: q.optionsCount || (q.options?.length ?? 0),
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation || null,
        category: q.category || "Grammar & Vocabulary",
        topic: q.topic || "Grammar & Vocabulary",
        difficulty: q.difficulty || "Medium",
        validationStatus: q.validationStatus || "unverified_answer",
        isPublished: Boolean(q.isPublished),
        verifiedBy: q.verifiedBy || null,
        verifiedAt: q.verifiedAt ? new Date(q.verifiedAt) : null,
        notes: q.notes || null,
        timesPracticed: 0,
        timesCorrect: 0,
      }));

      await db.insert(trainingQuestions).values(chunk);
    }
    console.log("Training center questions seeded successfully!");
  } catch (error) {
    console.error("Seed Training Questions Error:", error);
  }
}

export async function seedDialogueCenterIfEmpty(): Promise<void> {
  try {
    const existing = await db
      .select({ id: dialogues.id })
      .from(dialogues)
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    console.log(`Seeding ${ALL_DIALOGUES.length} authentic preparatory dialogues...`);
    const BATCH_SIZE = 25;
    for (let i = 0; i < ALL_DIALOGUES.length; i += BATCH_SIZE) {
      const chunk = ALL_DIALOGUES.slice(i, i + BATCH_SIZE).map((d) => ({
        id: d.id,
        grade: d.grade,
        gradeLabelAr: d.gradeLabelAr,
        gradeLabelEn: d.gradeLabelEn,
        dialogueNumber: d.dialogueNumber,
        title: d.title,
        governorate: d.governorate || null,
        governorateAr: d.governorateAr || null,
        year: d.year || null,
        speakers: d.speakers,
        lines: d.lines,
        approvedAnswers: d.approvedAnswers,
        isPublished: true,
      }));

      await db.insert(dialogues).values(chunk);
    }
    console.log("Professional Dialogue Center seeded successfully!");
  } catch (error) {
    console.error("Seed Dialogue Center Error:", error);
  }
}


