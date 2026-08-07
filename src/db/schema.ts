import { pgTable, text, timestamp, integer, boolean, decimal, jsonb, index } from "drizzle-orm/pg-core";

// USERS TABLE
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // 'admin', 'teacher', 'student', 'parent'
  avatar: text("avatar"),
  phone: text("phone"),
  parentPhone: text("parent_phone"),
  stage: text("stage"), // 'Preparatory', 'Secondary', 'General'
  grade: text("grade"), // 'First Prep', 'Second Prep', 'Third Prep', 'First Secondary', 'Second Secondary', 'Third Secondary (Baccalaureate)'
  streak: integer("streak").default(1),
  points: integer("points").default(150),
  level: text("level").default("Intermediate"), // Placement test outcome
  preferredLang: text("preferred_lang").default("ar"), // 'ar' or 'en'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// COURSES TABLE
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stage: text("stage").notNull(), // 'Preparatory', 'Secondary'
  grade: text("grade").notNull(), // 'First Prep', 'Second Prep', 'Third Prep', 'First Secondary', 'Second Secondary', 'Third Secondary (Baccalaureate)'
  teacherId: text("teacher_id").notNull(),
  teacherName: text("teacher_name").notNull().default("Mr. Habib El Rahman"),
  thumbnail: text("thumbnail").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("250.00"),
  isPublished: boolean("is_published").default(true).notNull(),
  category: text("category").default("Grammar & Vocabulary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// UNITS TABLE
export const units = pgTable("units", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(1),
});

// LESSONS TABLE
export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  unitId: text("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").default("25 mins"),
  pdfUrl: text("pdf_url"),
  orderIndex: integer("order_index").notNull().default(1),
  isFree: boolean("is_free").default(false),
});

// QUIZZES & EXAMS TABLE
export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  courseId: text("course_id"),
  unitId: text("unit_id"),
  lessonId: text("lesson_id"),
  title: text("title").notNull(),
  stage: text("stage").default("Secondary"),
  type: text("type").notNull().default("quiz"), // 'placement', 'quiz', 'exam', 'homework'
  durationMinutes: integer("duration_minutes").default(30),
  passPercentage: integer("pass_percentage").default(60),
  totalPoints: integer("total_points").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// QUESTIONS TABLE
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'mcq', 'true_false', 'matching', 'fill_blanks', 'correction', 'writing', 'listening'
  questionText: text("question_text").notNull(),
  audioUrl: text("audio_url"),
  options: jsonb("options"), // Array of strings or object for matching
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(10),
});

// INTELLIGENT QUESTION BANK TABLE (Scalable for 100,000+ Questions)
export const questionBank = pgTable(
  "question_bank",
  {
    id: text("id").primaryKey(),
    domainCategory: text("domain_category").notNull(), // 'Vocabulary', 'Grammar', 'Reading', 'Writing', 'Listening'
    questionText: text("question_text").notNull(),
    questionType: text("question_type").notNull(), // 'mcq', 'fill_blank', 'correction', 'rewrite', 'matching', 'ordering', 'comprehension', 'listening'
    stage: text("stage").notNull(), // 'Preparatory', 'Secondary'
    grade: text("grade").notNull(), // 'First Prep', 'Second Prep', 'Third Prep', 'First Secondary', 'Second Secondary', 'Third Secondary (Baccalaureate)'
    unit: text("unit").default("Unit 1"),
    lesson: text("lesson").default("Lesson 1"),
    difficulty: text("difficulty").notNull().default("Medium"), // 'Easy', 'Medium', 'Hard'
    skill: text("skill").default("Grammar & Context"), // 'Reading', 'Writing', 'Listening', 'Vocabulary', 'Grammar'
    wordType: text("word_type"), // 'Noun', 'Verb', 'Adjective', 'Adverb', 'Idiom', 'Phrasal Verb'
    topic: text("topic").notNull(), // e.g., 'Past Tenses', 'Newspaper Piracy', 'Conditionals'
    bloomLevel: text("bloom_level").default("Understand"), // 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'
    grammarTopic: text("grammar_topic"), // 'Tense', 'Modal Verbs', 'Passive Voice', 'Reported Speech', 'Relative Clauses', 'Conditionals', 'Articles', 'Prepositions', 'Conjunctions', 'Pronouns', 'Phrasal Verbs', 'Word Formation', 'Subject-Verb Agreement'
    passageText: text("passage_text"), // For comprehension questions
    audioUrl: text("audio_url"), // For listening questions
    options: jsonb("options"), // Array of strings
    correctAnswer: text("correct_answer").notNull(),
    explanation: text("explanation"),
    points: integer("points").default(10),
    
    // Performance Statistics & Usage Tracking
    timesUsed: integer("times_used").default(0).notNull(),
    correctCount: integer("correct_count").default(0).notNull(),
    totalAttempts: integer("total_attempts").default(0).notNull(),
    difficultyIndex: decimal("difficulty_index", { precision: 5, scale: 2 }).default("0.50"), // Ratio correct / attempts
    discriminationIndex: decimal("discrimination_index", { precision: 5, scale: 2 }).default("0.65"),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_qb_domain").on(table.domainCategory),
    index("idx_qb_grade").on(table.grade),
    index("idx_qb_difficulty").on(table.difficulty),
    index("idx_qb_topic").on(table.topic),
    index("idx_qb_grammar").on(table.grammarTopic),
  ]
);

// GENERATED EXAMS TABLE
export const generatedExams = pgTable("generated_exams", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  title: text("title").notNull(),
  stage: text("stage").notNull(),
  grade: text("grade").notNull(),
  config: jsonb("config").notNull(), // Difficulty mix, topics selected, question counts
  questionIds: jsonb("question_ids").notNull(), // Array of question IDs in exam order
  questionsData: jsonb("questions_data").notNull(), // Embedded frozen snapshot of questions and choices
  totalPoints: integer("total_points").notNull().default(100),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// EXAM ATTEMPTS / SUBMISSIONS
export const examAttempts = pgTable("exam_attempts", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => generatedExams.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  passed: boolean("passed").notNull(),
  userAnswers: jsonb("user_answers").notNull(),
  detailedFeedback: jsonb("detailed_feedback").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// QUIZ SUBMISSIONS
export const quizSubmissions = pgTable("quiz_submissions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").notNull(),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// ENROLLMENTS TABLE
export const enrollments = pgTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  status: text("status").default("active"), // 'active', 'completed'
  progress: integer("progress").default(0),
  completedLessonIds: jsonb("completed_lesson_ids").default([]),
  paymentMethod: text("payment_method").default("activation_code"),
  activatedAt: timestamp("activated_at").defaultNow().notNull(),
});

// CERTIFICATES TABLE
export const certificates = pgTable("certificates", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  courseId: text("course_id").notNull(),
  courseTitle: text("course_title").notNull(),
  grade: text("grade").notNull(),
  certificateCode: text("certificate_code").notNull().unique(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  qrCodeData: text("qr_code_data").notNull(),
});

// PAYMENTS TABLE
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  courseId: text("course_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // 'vodafone_cash', 'instapay', 'fawry', 'stripe', 'activation_code'
  transactionId: text("transaction_id").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  proofUrl: text("proof_url"),
  senderNumber: text("sender_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ACTIVATION CODES TABLE
export const activationCodes = pgTable("activation_codes", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  courseId: text("course_id").notNull(),
  isUsed: boolean("is_used").default(false),
  usedByStudentId: text("used_by_student_id"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NOTIFICATIONS TABLE
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // null means broadcast to all
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"), // 'info', 'announcement', 'payment', 'quiz', 'course'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PARENT LINKS TABLE
export const parentLinks = pgTable("parent_links", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").notNull(),
  studentId: text("student_id").notNull(),
  relationship: text("relationship").default("Guardian"),
});

// ATTENDANCE TABLE
export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  status: text("status").default("present"), // 'present', 'absent', 'late'
  date: timestamp("date").defaultNow().notNull(),
});

// AI SESSIONS
export const aiSessions = pgTable("ai_sessions", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  type: text("type").notNull(), // 'grammar', 'homework', 'essay', 'vocab', 'general'
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BLOG POSTS TABLE
export const blogs = pgTable("blogs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  author: text("author").default("Mr. Habib El Rahman"),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  tags: jsonb("tags").default(["Thanawya Amma", "English Tips", "Grammar"]),
});

// LIVE CHAT & COMMUNITY MESSAGES
export const liveChat = pgTable("live_chat", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  message: text("message").notNull(),
  channel: text("channel").default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// STUDY PLANNER TABLE
export const studyPlanner = pgTable("study_planner", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  task: text("task").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").default("Medium"), // 'High', 'Medium', 'Low'
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AFFILIATES / REFERRALS
export const affiliates = pgTable("affiliates", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: text("code").notNull().unique(),
  totalReferrals: integer("total_referrals").default(0),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0.00"),
});

// PDF DOCUMENTS LIBRARY (Upload & Display on Platform)
export const pdfDocuments = pgTable(
  "pdf_documents",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    uploaderId: text("uploader_id").notNull(),
    uploaderName: text("uploader_name").notNull().default("Mr. Habib El Rahman"),
    stage: text("stage").default("Secondary"),
    grade: text("grade").default("Third Secondary (Baccalaureate)"),
    unit: text("unit").default("Unit 1"),
    topic: text("topic").default("Grammar Notes"),
    courseId: text("course_id"),
    fileName: text("file_name").notNull(),
    storagePath: text("storage_path"), // local disk path for uploaded files
    externalUrl: text("external_url"), // fallback demo / linked URL
    fileSizeKb: integer("file_size_kb").default(0),
    pageCount: integer("page_count").default(1),
    views: integer("views").default(0).notNull(),
    downloads: integer("downloads").default(0).notNull(),
    isProtected: boolean("is_protected").default(true),
    watermarkEnabled: boolean("watermark_enabled").default(true),
    allowDownload: boolean("allow_download").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_pdf_grade").on(table.grade),
    index("idx_pdf_stage").on(table.stage),
    index("idx_pdf_course").on(table.courseId),
  ]
);

// AUTH SESSIONS TABLE (Real login sessions with expiry)
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id").notNull(),
    role: text("role").notNull(),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_sessions_token").on(table.token), index("idx_sessions_user").on(table.userId)]
);

// HOMEWORK ASSIGNMENTS TABLE
export const homework = pgTable(
  "homework",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    teacherId: text("teacher_id").notNull(),
    teacherName: text("teacher_name").notNull().default("Mr. Habib El Rahman"),
    stage: text("stage").default("Secondary"),
    grade: text("grade").default("Third Secondary (Baccalaureate)"),
    courseId: text("course_id"),
    unit: text("unit").default("Unit 1"),
    dueDate: text("due_date").notNull(),
    totalPoints: integer("total_points").default(50),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_hw_grade").on(table.grade), index("idx_hw_course").on(table.courseId)]
);

// HOMEWORK STUDENT SUBMISSIONS TABLE
export const homeworkSubmissions = pgTable(
  "homework_submissions",
  {
    id: text("id").primaryKey(),
    homeworkId: text("homework_id")
      .notNull()
      .references(() => homework.id, { onDelete: "cascade" }),
    studentId: text("student_id").notNull(),
    studentName: text("student_name").notNull(),
    answerText: text("answer_text"),
    fileName: text("file_name"),
    storagePath: text("storage_path"),
    status: text("status").default("submitted"), // 'submitted' | 'graded'
    score: integer("score"),
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    gradedAt: timestamp("graded_at"),
  },
  (table) => [index("idx_hws_hw").on(table.homeworkId), index("idx_hws_student").on(table.studentId)]
);

// ATTENDANCE RECORDS TABLE (per-session roster marks)
export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    studentName: text("student_name").notNull(),
    sessionTitle: text("session_title").notNull(),
    sessionDate: text("session_date").notNull(), // YYYY-MM-DD
    status: text("status").notNull().default("present"), // 'present' | 'late' | 'absent' | 'excused'
    grade: text("grade"),
    markedBy: text("marked_by").notNull().default("teacher"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_att_student").on(table.studentId),
    index("idx_att_date").on(table.sessionDate),
  ]
);

// WEB PUSH SUBSCRIPTIONS TABLE
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_push_user").on(table.userId)]
);
