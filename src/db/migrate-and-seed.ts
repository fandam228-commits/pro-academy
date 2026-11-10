import { assertDatabaseConfigured, db } from "./index";
import { sql, eq } from "drizzle-orm";
import {
  curriculumGrades,
  curriculumUnits,
  curriculumSections,
  storyChapters,
  ministryAssessments,
} from "./schema";
import { SMART_CURRICULUM_SEEDS } from "@/data/smart-curriculum-seed";

let setupPromise: Promise<void> | null = null;

export async function ensureDbSetup() {
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
    `);

  // Seed and sync curriculum grades and units to official 2026/2027 Egyptian syllabus
  await syncCurriculum2026();
  await seedMinistryAssessmentsIfEmpty();
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
