import { db, pool } from "./index";
import { sql } from "drizzle-orm";
import { seedDatabase } from "./seed-data";
import { seedFirstSecondaryUnits12Review } from "./seed-unit12-review";
import { seedBaccalaureateModelA2027 } from "./seed-baccalaureate-model-a-2027";

export async function ensureDbSetup() {
  try {
    // Execute DDL SQL statements to create required tables if they don't exist
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
        relationship TEXT DEFAULT 'Guardian',
        verified_at TIMESTAMP,
        verified_by TEXT
      );
      ALTER TABLE parent_links ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
      ALTER TABLE parent_links ADD COLUMN IF NOT EXISTS verified_by TEXT;

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
    `);

    // Seed new question-bank datasets independently of the legacy user seed guard.
    await seedFirstSecondaryUnits12Review();
    await seedBaccalaureateModelA2027();

    // Run legacy seed data
    await seedDatabase();
  } catch (error) {
    console.error("Migration / Seed error:", error);
  }
}
