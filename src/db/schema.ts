import { pgTable, text, timestamp, integer, boolean, decimal, jsonb, index } from "drizzle-orm/pg-core";

// USERS TABLE
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
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
    curriculum: text("curriculum").default("Ministry"),
    term: text("term").default("First"),
    source: text("source"),
    tags: jsonb("tags").default([]),
    unit: text("unit").default("Unit 1"),
    lesson: text("lesson").default("Lesson 1"),
    section: text("section"),
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
    index("idx_qb_curriculum").on(table.curriculum),
    index("idx_qb_term").on(table.term),
    index("idx_qb_difficulty").on(table.difficulty),
    index("idx_qb_topic").on(table.topic),
    index("idx_qb_scope").on(table.stage, table.grade, table.curriculum, table.term, table.unit),
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

// CENTER GROUPS TABLE
export const centerGroups = pgTable(
  "center_groups",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    stage: text("stage").notNull().default("Secondary"),
    grade: text("grade").notNull().default("Third Secondary (Baccalaureate)"),
    teacherId: text("teacher_id"),
    teacherName: text("teacher_name"),
    schedule: text("schedule"),
    room: text("room"),
    monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_center_groups_grade").on(table.grade), index("idx_center_groups_active").on(table.isActive)]
);

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
    storagePath: text("storage_path"), // legacy local disk path (not used on Vercel)
    fileData: text("file_data"), // base64 PDF content (works on serverless)
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

// =========================================================================
// PARENT CONNECT SYSTEM TABLES (Meta WhatsApp Cloud API & Telegram Bot)
// =========================================================================

// 1. PARENT PROFILES
export const parentProfiles = pgTable(
  "parent_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"), // Optional link to users table if parent has a web account
    fullName: text("full_name").notNull(),
    primaryPhone: text("primary_phone").notNull(), // E.164 formatted (+201012345678)
    secondaryPhone: text("secondary_phone"),
    email: text("email"),
    preferredChannel: text("preferred_channel").notNull().default("whatsapp"), // 'whatsapp' | 'telegram' | 'both' | 'none'
    isPhoneVerified: boolean("is_phone_verified").default(false),
    verificationCode: text("verification_code"),
    consentGiven: boolean("consent_given").default(true),
    consentGivenAt: timestamp("consent_given_at").defaultNow(),
    optedOut: boolean("opted_out").default(false),
    optedOutAt: timestamp("opted_out_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_prt_phone").on(table.primaryPhone),
    index("idx_prt_user").on(table.userId),
  ]
);

// 2. PARENT-STUDENT N:M LINKS
export const parentStudentLinks = pgTable(
  "parent_student_links",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id").notNull(),
    studentId: text("student_id").notNull(),
    relationship: text("relationship").notNull().default("Father"), // 'Father' | 'Mother' | 'Guardian' | 'Other'
    isPrimaryContact: boolean("is_primary_contact").default(true),
    canReceiveAttendance: boolean("can_receive_attendance").default(true),
    canReceiveGrades: boolean("can_receive_grades").default(true),
    canReceiveReports: boolean("can_receive_reports").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_psl_parent").on(table.parentId),
    index("idx_psl_student").on(table.studentId),
  ]
);

// 3. TELEGRAM BOT ACCOUNTS & SECURE PAIRING
export const telegramAccounts = pgTable(
  "telegram_accounts",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id").notNull(),
    chatId: text("chat_id"), // Telegram numeric chat id
    telegramUsername: text("telegram_username"),
    telegramFirstName: text("telegram_first_name"),
    pairingCode: text("pairing_code"), // Temporary unique pairing code (e.g. LINK-9X2KQ8)
    pairingExpiresAt: timestamp("pairing_expires_at"),
    isVerified: boolean("is_verified").default(false),
    notificationsMuted: boolean("notifications_muted").default(false),
    linkedAt: timestamp("linked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tg_parent").on(table.parentId),
    index("idx_tg_chat").on(table.chatId),
    index("idx_tg_pair_code").on(table.pairingCode),
  ]
);

// 4. PARENT NOTIFICATION PREFERENCES
export const parentNotificationPreferences = pgTable(
  "parent_notification_preferences",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id").notNull(),
    notifyOnAbsent: boolean("notify_on_absent").default(true),
    notifyOnPresent: boolean("notify_on_present").default(true),
    notifyOnLate: boolean("notify_on_late").default(true),
    notifyOnDeparture: boolean("notify_on_departure").default(false),
    notifyOnExamResult: boolean("notify_on_exam_result").default(true),
    notifyOnHomework: boolean("notify_on_homework").default(true),
    notifyOnLowGradeWarning: boolean("notify_on_low_grade_warning").default(true),
    notifyWeeklyReport: boolean("notify_weekly_report").default(true),
    notifyMonthlyReport: boolean("notify_monthly_report").default(true),
    quietHoursStart: text("quiet_hours_start").default("22:00"),
    quietHoursEnd: text("quiet_hours_end").default("08:00"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_pnp_parent").on(table.parentId)]
);

// 5. NOTIFICATION TEMPLATES
export const notificationTemplates = pgTable(
  "notification_templates",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(), // 'att_absent', 'att_present', 'att_late', 'exam_result', 'weekly_report', etc.
    name: text("name").notNull(),
    channel: text("channel").notNull().default("all"), // 'whatsapp' | 'telegram' | 'all'
    metaTemplateName: text("meta_template_name"), // Meta Cloud API template identifier
    metaTemplateLang: text("meta_template_lang").default("ar"),
    bodyTextAr: text("body_text_ar").notNull(),
    bodyTextEn: text("body_text_en"),
    variables: jsonb("variables").default([]),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_nt_code").on(table.code)]
);

// 6. NOTIFICATION QUEUE (Reliable Background Dispatching with Retry & Idempotency)
export const notificationQueue = pgTable(
  "notification_queue",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id").notNull(),
    studentId: text("student_id"),
    channel: text("channel").notNull(), // 'whatsapp' | 'telegram'
    templateCode: text("template_code"),
    recipient: text("recipient").notNull(), // Phone (+20...) or Telegram Chat ID
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled'
    attempts: integer("attempts").default(0),
    maxAttempts: integer("max_attempts").default(3),
    lastError: text("last_error"),
    idempotencyKey: text("idempotency_key"), // Guarantees zero duplicate sends
    scheduledFor: timestamp("scheduled_for").defaultNow(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_nq_status").on(table.status),
    index("idx_nq_idempotency").on(table.idempotencyKey),
    index("idx_nq_parent").on(table.parentId),
  ]
);

// 7. NOTIFICATION LOGS & AUDIT TRAIL
export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: text("id").primaryKey(),
    queueId: text("queue_id"),
    parentId: text("parent_id"),
    studentId: text("student_id"),
    channel: text("channel").notNull(), // 'whatsapp' | 'telegram'
    recipient: text("recipient").notNull(),
    messageType: text("message_type").notNull(), // 'attendance_absent', 'exam_result', etc.
    contentSummary: text("content_summary").notNull(),
    status: text("status").notNull().default("sent"), // 'sent' | 'delivered' | 'read' | 'failed'
    externalMessageId: text("external_message_id"), // Meta wamid or Telegram message_id
    rawResponse: jsonb("raw_response"),
    errorMessage: text("error_message"),
    sentByUserId: text("sent_by_user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_nl_parent").on(table.parentId),
    index("idx_nl_student").on(table.studentId),
    index("idx_nl_channel").on(table.channel),
    index("idx_nl_status").on(table.status),
    index("idx_nl_date").on(table.createdAt),
  ]
);

// 8. ATTENDANCE NOTIFICATION EVENTS (Anti-Duplication Guard)
export const attendanceNotificationEvents = pgTable(
  "attendance_notification_events",
  {
    id: text("id").primaryKey(),
    attendanceRecordId: text("attendance_record_id").notNull(),
    studentId: text("student_id").notNull(),
    parentId: text("parent_id").notNull(),
    sessionDate: text("session_date").notNull(), // YYYY-MM-DD
    statusMarked: text("status_marked").notNull(), // 'present' | 'absent' | 'late' | 'departure'
    notificationId: text("notification_id"),
    dispatchedAt: timestamp("dispatched_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_ane_record").on(table.attendanceRecordId),
    index("idx_ane_student").on(table.studentId),
  ]
);

// ==========================================
// SMART CURRICULUM ORGANIZATION SYSTEM TABLES
// ==========================================

// 9. CURRICULUM GRADES (First Prep -> Third Secondary + dynamic tracks)
export const curriculumGrades = pgTable(
  "curriculum_grades",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(), // 'prep_1', 'prep_2', 'prep_3', 'sec_1', 'sec_2', 'sec_3'
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    stage: text("stage").notNull(), // 'Preparatory', 'Secondary', 'General'
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    storyTitleAr: text("story_title_ar"),
    storyTitleEn: text("story_title_en"),
    storyAuthor: text("story_author"),
    storyDescriptionAr: text("story_description_ar"),
    storyDescriptionEn: text("story_description_en"),
    storyCover: text("story_cover"),
    courseId: text("course_id"),
    orderIndex: integer("order_index").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_cg_code").on(table.code),
    index("idx_cg_stage").on(table.stage),
    index("idx_cg_active").on(table.isActive),
  ]
);

// 10. CURRICULUM UNITS & REVIEWS (6 Units + Review 1 & Review 2)
export const curriculumUnits = pgTable(
  "curriculum_units",
  {
    id: text("id").primaryKey(),
    gradeId: text("grade_id").notNull().references(() => curriculumGrades.id, { onDelete: "cascade" }),
    unitNumber: integer("unit_number").notNull(), // 1..6 or 0 for reviews
    type: text("type").notNull().default("unit"), // 'unit' | 'review'
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    reviewScope: text("review_scope"), // 'Units 1–3' or 'Units 4–6'
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    orderIndex: integer("order_index").notNull().default(1),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_cu_grade").on(table.gradeId),
    index("idx_cu_type").on(table.type),
    index("idx_cu_order").on(table.orderIndex),
  ]
);

// 11. CURRICULUM SECTIONS (Vocabulary, Grammar, Writing Skills, Reviews)
export const curriculumSections = pgTable(
  "curriculum_sections",
  {
    id: text("id").primaryKey(),
    unitId: text("unit_id").notNull().references(() => curriculumUnits.id, { onDelete: "cascade" }),
    gradeId: text("grade_id").notNull(),
    sectionType: text("section_type").notNull(), // 'vocabulary' | 'grammar' | 'writing' | 'mixed_exercises' | 'comprehensive_test'
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    videoUrl: text("video_url"),
    videoDuration: text("video_duration").default("25 mins"),
    pdfUrl: text("pdf_url"),
    pdfTitle: text("pdf_title"),
    contentData: jsonb("content_data"), // Vocab lists, grammar rules, writing templates, exercises
    quizId: text("quiz_id"), // Linked test from quizzes or question bank
    orderIndex: integer("order_index").notNull().default(1),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_cs_unit").on(table.unitId),
    index("idx_cs_grade").on(table.gradeId),
    index("idx_cs_type").on(table.sectionType),
  ]
);

// 12. STORY CHAPTERS (Dynamic Chapters per Grade with Vocab, Characters, Events, Quotes, Q&A, Tests)
export const storyChapters = pgTable(
  "story_chapters",
  {
    id: text("id").primaryKey(),
    gradeId: text("grade_id").notNull().references(() => curriculumGrades.id, { onDelete: "cascade" }),
    chapterNumber: integer("chapter_number").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    explanation: text("explanation"), // Detailed summary & analysis
    videoUrl: text("video_url"),
    pdfUrl: text("pdf_url"),
    vocabulary: jsonb("vocabulary").default([]), // [{ word, meaningAr, definitionEn, example }]
    characters: jsonb("characters").default([]), // [{ name, role, descriptionAr, significance }]
    events: jsonb("events").default([]), // [{ order, titleAr, titleEn, description }]
    importantQuotes: jsonb("important_quotes").default([]), // [{ quote, speaker, listener, situation, significance }]
    questionsAndAnswers: jsonb("questions_and_answers").default([]), // [{ question, answer, type }]
    mcqQuestions: jsonb("mcq_questions").default([]), // [{ question, options, correctAnswer, explanation }]
    chapterTestQuizId: text("chapter_test_quiz_id"),
    orderIndex: integer("order_index").notNull().default(1),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_sc_grade").on(table.gradeId),
    index("idx_sc_chapter").on(table.chapterNumber),
    index("idx_sc_order").on(table.orderIndex),
  ]
);

// 13. STUDENT CURRICULUM PROGRESS (Per-section & per-unit completion tracking)
export const studentCurriculumProgress = pgTable(
  "student_curriculum_progress",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    gradeId: text("grade_id").notNull(),
    unitId: text("unit_id"),
    sectionId: text("section_id"),
    chapterId: text("chapter_id"),
    itemType: text("item_type").notNull(), // 'section' | 'chapter' | 'review' | 'quiz'
    isCompleted: boolean("is_completed").notNull().default(false),
    score: integer("score"),
    maxScore: integer("max_score"),
    percentage: integer("percentage"),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_scp_student").on(table.studentId),
    index("idx_scp_grade").on(table.gradeId),
    index("idx_scp_unit").on(table.unitId),
    index("idx_scp_section").on(table.sectionId),
    index("idx_scp_chapter").on(table.chapterId),
  ]
);

// 14. STUDENT SAVED VOCABULARY (My Vocabulary personalized word lists)
export const studentSavedVocabulary = pgTable(
  "student_saved_vocabulary",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    word: text("word").notNull(),
    arabicMeaning: text("arabic_meaning"),
    partOfSpeech: text("part_of_speech"),
    ipaUk: text("ipa_uk"),
    ipaUs: text("ipa_us"),
    exampleSentence: text("example_sentence"),
    unitId: text("unit_id"),
    gradeId: text("grade_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_ssv_student").on(table.studentId),
    index("idx_ssv_word").on(table.word),
    index("idx_ssv_unit").on(table.unitId),
  ]
);

// 15. STUDENT PRONUNCIATION SETTINGS
export const studentPronunciationSettings = pgTable(
  "student_pronunciation_settings",
  {
    id: text("id").primaryKey(), // studentId
    studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    enabled: boolean("enabled").default(true).notNull(),
    accent: text("accent").default("uk").notNull(), // 'uk' | 'us'
    speed: text("speed").default("normal").notNull(), // 'normal' | 'slow'
    hoverEnabled: boolean("hover_enabled").default(true).notNull(),
    touchEnabled: boolean("touch_enabled").default(true).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_sps_student").on(table.studentId),
  ]
);

// 16. OFFICIAL MINISTRY ASSESSMENTS (2026/2027 Egyptian MOE Assessments Library)
export const ministryAssessments = pgTable(
  "ministry_assessments",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    titleEn: text("title_en"),
    stage: text("stage").notNull(), // 'Preparatory' | 'Secondary'
    grade: text("grade").notNull(), // 'First Prep', 'Second Prep', 'Third Prep', 'First Secondary', 'Second Secondary', 'Third Secondary'
    gradeCode: text("grade_code").notNull(), // 'prep_1', 'prep_2', 'prep_3', 'sec_1', 'sec_2', 'sec_3'
    term: text("term").notNull().default("First"), // 'First' | 'Second'
    subject: text("subject").notNull().default("English"),
    assessmentType: text("assessment_type").notNull(), // 'weekly' | 'classroom_performance' | 'homework_performance' | 'monthly' | 'other'
    weekNumber: integer("week_number").notNull().default(1),
    fileUrl: text("file_url"), // direct PDF path or link
    fileSize: text("file_size").default("1.8 MB"),
    officialSourceUrl: text("official_source_url").notNull().default("https://studentbooks.moe.gov.eg/Performance_Assessments/"),
    alternativeSourceUrl: text("alternative_source_url").default("https://moe.gov.eg/elearningenterypage/e-learning/"),
    verifiedDate: timestamp("verified_date").defaultNow().notNull(),
    isPublished: boolean("is_published").notNull().default(true),
    downloadCount: integer("download_count").notNull().default(0),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_ma_grade_code").on(table.gradeCode),
    index("idx_ma_stage").on(table.stage),
    index("idx_ma_type").on(table.assessmentType),
    index("idx_ma_term").on(table.term),
    index("idx_ma_week").on(table.weekNumber),
    index("idx_ma_published").on(table.isPublished),
  ]
);

// 17. STUDENT ASSESSMENT DOWNLOADS (History tracking)
export const studentAssessmentDownloads = pgTable(
  "student_assessment_downloads",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id").notNull().references(() => ministryAssessments.id, { onDelete: "cascade" }),
    downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_sad_student").on(table.studentId),
    index("idx_sad_assessment").on(table.assessmentId),
  ]
);

// 18. AI FULL CURRICULUM ANALYZER JOBS
export const curriculumAnalysisJobs = pgTable(
  "curriculum_analysis_jobs",
  {
    id: text("id").primaryKey(),
    teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(), // 'pdf' | 'docx' | 'txt' | 'text'
    fileSize: integer("file_size").default(0),
    gradeCode: text("grade_code").notNull().default("sec_3"),
    stage: text("stage").notNull().default("Secondary"),
    term: text("term").notNull().default("First"),
    status: text("status").notNull().default("pending"), // 'pending' | 'extracting_text' | 'discovering_structure' | 'extracting_original_questions' | 'generating_ai_questions' | 'assembling_quizzes' | 'completed' | 'failed' | 'paused'
    currentStep: text("current_step").notNull().default("Initialized"),
    progressPercent: integer("progress_percent").notNull().default(0),
    checkpointData: jsonb("checkpoint_data").default({}),
    summaryReport: jsonb("summary_report").default({}),
    questionsPerLesson: integer("questions_per_lesson").notNull().default(20),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_caj_teacher").on(table.teacherId),
    index("idx_caj_status").on(table.status),
    index("idx_caj_grade").on(table.gradeCode),
  ]
);

// 19. ANALYZED & GENERATED CURRICULUM QUESTIONS (Teacher staging area)
export const analyzedCurriculumQuestions = pgTable(
  "analyzed_curriculum_questions",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull().references(() => curriculumAnalysisJobs.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull().default("ai_generated"), // 'original_extracted' | 'ai_generated'
    pageNumber: integer("page_number").default(1),
    unitNumber: integer("unit_number").default(1),
    unitTitle: text("unit_title").notNull().default("Unit 1"),
    lessonTitle: text("lesson_title").notNull().default("Lesson 1"),
    sectionType: text("section_type").notNull().default("Vocabulary"), // 'Vocabulary' | 'Grammar' | 'Reading' | 'Writing' | 'Practice'
    questionText: text("question_text").notNull(),
    questionType: text("question_type").notNull().default("mcq"),
    options: jsonb("options").notNull(), // string[]
    correctAnswer: text("correct_answer").notNull(),
    explanation: text("explanation"),
    difficulty: text("difficulty").notNull().default("Medium"), // 'Easy' | 'Medium' | 'Hard'
    sourceReference: text("source_reference"),
    approvalStatus: text("approval_status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'modified'
    isPublished: boolean("is_published").notNull().default(false),
    publishedQuestionId: text("published_question_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_acq_job").on(table.jobId),
    index("idx_acq_source_type").on(table.sourceType),
    index("idx_acq_approval").on(table.approvalStatus),
    index("idx_acq_difficulty").on(table.difficulty),
    index("idx_acq_published").on(table.isPublished),
  ]
);

// 20. ANALYZED & GENERATED CURRICULUM QUIZZES (Automated lesson, unit & review exams)
export const analyzedCurriculumQuizzes = pgTable(
  "analyzed_curriculum_quizzes",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull().references(() => curriculumAnalysisJobs.id, { onDelete: "cascade" }),
    quizType: text("quiz_type").notNull(), // 'lesson_quiz' | 'unit_exam' | 'tri_unit_review' | 'final_exam'
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    unitNumber: integer("unit_number"),
    unitsCovered: jsonb("units_covered").default([]),
    lessonTitle: text("lesson_title"),
    questionIds: jsonb("question_ids").notNull().default([]),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    passPercentage: integer("pass_percentage").notNull().default(60),
    totalPoints: integer("total_points").notNull().default(100),
    approvalStatus: text("approval_status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    isPublished: boolean("is_published").notNull().default(false),
    publishedQuizId: text("published_quiz_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_acz_job").on(table.jobId),
    index("idx_acz_type").on(table.quizType),
    index("idx_acz_approval").on(table.approvalStatus),
    index("idx_acz_published").on(table.isPublished),
  ]
);

// =========================================================================
// 21. TRANSLATION ACADEMY MODULES & EDUCATIONAL STRUCTURE
// Professional Academy — Mr. Habib El Rahman
// "Think in English. Translate with Confidence."
// =========================================================================

export const translationModules = pgTable(
  "translation_modules",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(), // e.g. 'mod_basics', 'mod_vocab_context', etc.
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionAr: text("description_ar").notNull(),
    descriptionEn: text("description_en").notNull(),
    grade: text("grade").notNull().default("First Secondary"),
    term: text("term").notNull().default("First Term"),
    orderIndex: integer("order_index").notNull().default(1),
    icon: text("icon").notNull().default("Languages"),
    totalLessons: integer("total_lessons").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tm_grade_term").on(table.grade, table.term),
    index("idx_tm_order").on(table.orderIndex),
    index("idx_tm_published").on(table.isPublished),
  ]
);

export const translationLessons = pgTable(
  "translation_lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => translationModules.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(1),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    summaryAr: text("summary_ar").notNull(),
    summaryEn: text("summary_en").notNull(),
    videoUrl: text("video_url"),
    videoDuration: text("video_duration").default("15 mins"),
    pdfUrl: text("pdf_url"),
    rules: jsonb("rules").notNull().default([]), // [{ id, titleAr, titleEn, ruleAr, ruleEn, examples: [{ ar, en, note }] }]
    vocabulary: jsonb("vocabulary").notNull().default([]), // [{ id, en, ar, ipa, pos, exampleEn, exampleAr }]
    solvedExamples: jsonb("solved_examples").notNull().default([]), // [{ id, sourceAr, targetEn, steps: [string], notesAr, notesEn }]
    commonMistakes: jsonb("common_mistakes").notNull().default([]), // [{ id, wrongSentence, correctSentence, explanationAr, explanationEn }]
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tl_module").on(table.moduleId),
    index("idx_tl_order").on(table.orderIndex),
    index("idx_tl_published").on(table.isPublished),
  ]
);

export const translationQuestions = pgTable(
  "translation_questions",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => translationLessons.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => translationModules.id, { onDelete: "cascade" }),
    questionType: text("question_type").notNull(), // 14 types: mcq, ar_to_en_text, en_to_ar_text, sentence_ordering, fill_blanks, complete_translation, word_matching, word_selection, error_correction, context_translation, sentence_transformation, paragraph_translation, translation_given_words, listening_translation
    questionText: text("question_text").notNull(),
    instructions: text("instructions").notNull(),
    options: jsonb("options").default([]), // Options for MCQ, matching pairs, scrambled words, or word bank
    correctAnswer: text("correct_answer").notNull(), // Primary model answer
    alternativeAnswers: jsonb("alternative_answers").default([]), // Array of valid alternative translations
    explanation: text("explanation").notNull(), // Pedagogical explanation in Arabic & English
    marks: integer("marks").notNull().default(1),
    difficulty: text("difficulty").notNull().default("Medium"), // Easy | Medium | Hard
    topic: text("topic"),
    source: text("source"),
    audioUrl: text("audio_url"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tq_lesson").on(table.lessonId),
    index("idx_tq_module").on(table.moduleId),
    index("idx_tq_type").on(table.questionType),
    index("idx_tq_difficulty").on(table.difficulty),
    index("idx_tq_published").on(table.isPublished),
  ]
);

export const translationStudentProgress = pgTable(
  "translation_student_progress",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => translationLessons.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => translationModules.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    practiceScore: integer("practice_score").notNull().default(0),
    examScore: integer("exam_score").notNull().default(0),
    totalQuestionsAnswered: integer("total_questions_answered").notNull().default(0),
    lastPracticedAt: timestamp("last_practiced_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tsp_student").on(table.studentId),
    index("idx_tsp_lesson").on(table.lessonId),
    index("idx_tsp_module").on(table.moduleId),
  ]
);

export const translationSubmissions = pgTable(
  "translation_submissions",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => translationQuestions.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => translationLessons.id, { onDelete: "cascade" }),
    mode: text("mode").notNull().default("practice"), // 'practice' | 'exam'
    studentAnswer: text("student_answer").notNull(),
    score: integer("score").notNull().default(0),
    maxMarks: integer("max_marks").notNull().default(1),
    rubricBreakdown: jsonb("rubric_breakdown").default({}), // { meaning: 40, grammar: 20, vocab: 20, structure: 10, mechanics: 10, totalPercentage: 100 }
    evaluationFeedback: text("evaluation_feedback"),
    suggestedCorrection: text("suggested_correction"),
    modelAnswerUsed: text("model_answer_used"),
    status: text("status").notNull().default("graded"), // 'graded' | 'needs_review' | 'teacher_reviewed'
    teacherComment: text("teacher_comment"),
    reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tsub_student").on(table.studentId),
    index("idx_tsub_question").on(table.questionId),
    index("idx_tsub_lesson").on(table.lessonId),
    index("idx_tsub_status").on(table.status),
    index("idx_tsub_mode").on(table.mode),
  ]
);

export const translationExams = pgTable(
  "translation_exams",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => translationModules.id, { onDelete: "cascade" }),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    grade: text("grade").notNull().default("First Secondary"),
    term: text("term").notNull().default("First Term"),
    timeLimitMinutes: integer("time_limit_minutes").notNull().default(30),
    passingScore: integer("passing_score").notNull().default(60),
    questionIds: jsonb("question_ids").notNull().default([]),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_te_module").on(table.moduleId),
    index("idx_te_published").on(table.isPublished),
  ]
);

export const translationExamAttempts = pgTable(
  "translation_exam_attempts",
  {
    id: text("id").primaryKey(),
    examId: text("exam_id")
      .notNull()
      .references(() => translationExams.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    maxScore: integer("max_score").notNull().default(100),
    percentage: integer("percentage").notNull().default(0),
    passed: boolean("passed").notNull().default(false),
    answers: jsonb("answers").notNull().default([]), // [{ questionId, studentAnswer, score, status, rubric }]
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tea_exam").on(table.examId),
    index("idx_tea_student").on(table.studentId),
  ]
);

// GOOGLE MEET & LIVE SESSIONS
export const liveSessions = pgTable(
  "live_sessions",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    stage: text("stage").notNull().default("Secondary"),
    grade: text("grade").notNull().default("Third Secondary (Baccalaureate)"),
    subject: text("subject").notNull().default("English"),
    teacherId: text("teacher_id").notNull().default("usr_admin_1"),
    teacherName: text("teacher_name").notNull().default("Mr. Habib El Rahman"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    durationMinutes: integer("duration_minutes").default(60),
    meetUrl: text("meet_url").notNull(),
    googleEventId: text("google_event_id"),
    calendarHtmlLink: text("calendar_html_link"),
    status: text("status").notNull().default("scheduled"), // 'scheduled' | 'live' | 'completed' | 'cancelled'
    recordingUrl: text("recording_url"),
    recordingNotes: text("recording_notes"),
    maxAttendees: integer("max_attendees").default(100),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_ls_start").on(table.startTime),
    index("idx_ls_grade").on(table.grade),
    index("idx_ls_status").on(table.status),
  ]
);

// GOOGLE OAUTH & CALENDAR INTEGRATIONS
export const googleIntegrations = pgTable(
  "google_integrations",
  {
    id: text("id").primaryKey(),
    accountEmail: text("account_email").notNull().unique(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiry: timestamp("token_expiry"),
    scope: text("scope"),
    isConnected: boolean("is_connected").default(false),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

// ==========================================
// PROFESSIONAL TRAINING CENTER & QUESTION BANK
// ==========================================

export const trainingQuestions = pgTable(
  "training_questions",
  {
    id: text("id").primaryKey(),
    questionNumber: text("question_number"),
    originalOrder: integer("original_order").notNull(),
    sourceDocument: text("source_document").notNull().default("Professional_Question_Bank_20261108_233552.docx"),
    sourcePage: integer("source_page").default(1),
    questionText: text("question_text").notNull(),
    rawText: text("raw_text"),
    options: jsonb("options").notNull().default([]),
    optionsCount: integer("options_count").notNull().default(0),
    correctAnswer: text("correct_answer"),
    explanation: text("explanation"),
    category: text("category").notNull().default("Grammar & Vocabulary"),
    topic: text("topic").notNull().default("Grammar & Vocabulary"),
    difficulty: text("difficulty").notNull().default("Medium"),
    validationStatus: text("validation_status").notNull().default("unverified_answer"),
    isPublished: boolean("is_published").notNull().default(false),
    verifiedBy: text("verified_by"),
    verifiedAt: timestamp("verified_at"),
    notes: text("notes"),
    timesPracticed: integer("times_practiced").notNull().default(0),
    timesCorrect: integer("times_correct").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tq_status").on(table.validationStatus),
    index("idx_tq_published").on(table.isPublished),
    index("idx_tq_topic").on(table.topic),
    index("idx_tq_difficulty").on(table.difficulty),
    index("idx_tq_order").on(table.originalOrder),
  ]
);

export const trainingStudentAttempts = pgTable(
  "training_student_attempts",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    questionId: text("question_id").notNull(),
    selectedAnswer: text("selected_answer"),
    isCorrect: boolean("is_correct").notNull(),
    attemptType: text("attempt_type").notNull().default("practice"),
    timeSpentSeconds: integer("time_spent_seconds").default(0),
    examSessionId: text("exam_session_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tsa_student").on(table.studentId),
    index("idx_tsa_question").on(table.questionId),
    index("idx_tsa_created").on(table.createdAt),
  ]
);

export const trainingBookmarks = pgTable(
  "training_bookmarks",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    questionId: text("question_id").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tb_student").on(table.studentId),
    index("idx_tb_question").on(table.questionId),
  ]
);

export const trainingExamSessions = pgTable(
  "training_exam_sessions",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    title: text("title").notNull(),
    questionCount: integer("question_count").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    score: integer("score").default(0),
    totalScore: integer("total_score").default(0),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0.00"),
    passed: boolean("passed").default(false),
    status: text("status").notNull().default("in_progress"),
    questionIds: jsonb("question_ids").notNull().default([]),
    studentAnswers: jsonb("student_answers").default({}),
    detailedResults: jsonb("detailed_results").default([]),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
  },
  (table) => [
    index("idx_tes_student").on(table.studentId),
    index("idx_tes_status").on(table.status),
  ]
);

export const trainingRevisionQueue = pgTable(
  "training_revision_queue",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    questionId: text("question_id").notNull(),
    mistakeCount: integer("mistake_count").notNull().default(1),
    lastMistakeAt: timestamp("last_mistake_at").defaultNow().notNull(),
    resolved: boolean("resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("idx_trq_student").on(table.studentId),
    index("idx_trq_resolved").on(table.resolved),
  ]
);


