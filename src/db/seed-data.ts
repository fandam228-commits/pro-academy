import { db } from "./index";
import crypto from "crypto";
import {
  users,
  courses,
  units,
  lessons,
  quizzes,
  questions,
  questionBank,
  enrollments,
  certificates,
  payments,
  activationCodes,
  notifications,
  parentLinks,
  blogs,
  liveChat,
  studyPlanner,
  affiliates,
  pdfDocuments,
} from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/security";

export async function seedDatabase() {
  try {
    if (process.env.NODE_ENV === "production") {
      const existingAdmins = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
      if (existingAdmins.length > 0) {
        console.info("Production administrator exists; skipping legacy demo seed data.");
        return;
      }

      const initialAdminName = process.env.INITIAL_ADMIN_NAME?.trim();
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
      if (!initialAdminName || !initialAdminEmail || !initialAdminPassword) {
        console.warn("No production administrator exists. Configure INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD to bootstrap one; legacy demo seed data is disabled.");
        return;
      }
      if (initialAdminPassword.length < 16) {
        console.error("INITIAL_ADMIN_PASSWORD must be at least 16 characters; production seed data was skipped.");
        return;
      }

      const existingAccount = await db.select().from(users).where(eq(users.email, initialAdminEmail)).limit(1);
      if (existingAccount.length > 0) {
        console.warn("The configured initial administrator email already belongs to an account; it was not promoted.");
        return;
      }

      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: initialAdminName,
        email: initialAdminEmail,
        password: hashPassword(initialAdminPassword),
        role: "admin",
        preferredLang: "ar",
      });
      console.info("Created the initial production administrator; legacy demo seed data was skipped.");
      return;
    }

    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded!");
      return;
    }

    console.log("Seeding Professional Academy database...");

    // 1. SEED USERS
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
      {
        id: "usr_student_2",
        name: "Nour Hassan Fawzy",
        email: "nour.student@gmail.com",
        password: hashPassword("student123password"),
        role: "student",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        phone: "+20 122 333 4444",
        parentPhone: "+20 122 333 8888",
        stage: "Preparatory",
        grade: "Third Prep",
        streak: 7,
        points: 420,
        level: "Intermediate",
        preferredLang: "ar",
      },
      {
        id: "usr_parent_1",
        name: "Mahmoud Al-Sayed (Omar's Father)",
        email: "mahmoud.parent@gmail.com",
        password: hashPassword("parent123password"),
        role: "parent",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        phone: "+20 111 222 9999",
        parentPhone: "",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        streak: 0,
        points: 0,
        level: "Intermediate",
        preferredLang: "ar",
      },
    ]);

    // PARENT LINK
    await db.insert(parentLinks).values([
      {
        id: "pl_1",
        parentId: "usr_parent_1",
        studentId: "usr_student_1",
        relationship: "Father",
      },
    ]);

    // 2. SEED COURSES
    await db.insert(courses).values([
      {
        id: "crs_sec_3",
        title: "Third Secondary Master Class 2025/2026 (Thanawya Amma)",
        description: "Comprehensive English Mastery for Baccalaureate Students. Covers Grammar, Advanced Vocabulary, Novel Analysis, Comprehension Skills, Translation, and Exam Techniques with Mr. Habib El Rahman.",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        teacherId: "usr_admin_1",
        teacherName: "Mr. Habib El Rahman",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        price: "350.00",
        isPublished: true,
        category: "Thanawya Amma Curriculum",
      },
      {
        id: "crs_sec_2",
        title: "Second Secondary Intensive English Program",
        description: "Master direct/indirect speech, conditionals, passive voice, and academic writing tailored for the latest Ministry of Education curriculum.",
        stage: "Secondary",
        grade: "Second Secondary",
        teacherId: "usr_teacher_1",
        teacherName: "Ms. Sarah Ahmed",
        thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
        price: "280.00",
        isPublished: true,
        category: "Grammar & Vocabulary",
      },
      {
        id: "crs_sec_1",
        title: "First Secondary Foundation & Grammar Mastery",
        description: "Transition smoothly from preparatory to secondary stage. Tenses, relative clauses, formal writing, and vocabulary builder.",
        stage: "Secondary",
        grade: "First Secondary",
        teacherId: "usr_admin_1",
        teacherName: "Mr. Habib El Rahman",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
        price: "250.00",
        isPublished: true,
        category: "Secondary Core",
      },
      {
        id: "crs_prep_3",
        title: "Third Prep High Score Booster ( الشهادة الإعدادية )",
        description: "Complete preparation for Third Prep final exams. Detailed breakdown of dialogue completion, reading comprehension, and top grammar rules.",
        stage: "Preparatory",
        grade: "Third Prep",
        teacherId: "usr_admin_1",
        teacherName: "Mr. Habib El Rahman",
        thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
        price: "200.00",
        isPublished: true,
        category: "Preparatory Excellence",
      },
    ]);

    // 3. SEED QUESTION BANK (GRAMMAR & VOCABULARY CATEGORIZED & INDEXED)
    const initialQuestionBank = [
      // VOCABULARY QUESTIONS
      {
        id: "qb_v1",
        domainCategory: "Vocabulary",
        questionText: "Online book ______ costs the publishing industry millions of dollars in lost revenue every year.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 1",
        lesson: "Lesson 1",
        difficulty: "Medium",
        skill: "Vocabulary & Context",
        wordType: "Noun",
        topic: "Publishing & Media",
        bloomLevel: "Understand",
        options: ["piracy", "privacy", "policy", "purity"],
        correctAnswer: "piracy",
        explanation: "'Piracy' refers to illegal copying and distributing of copyrighted material.",
        points: 10,
        timesUsed: 14,
        correctCount: 10,
        totalAttempts: 14,
      },
      {
        id: "qb_v2",
        domainCategory: "Vocabulary",
        questionText: "The investigative journalist claimed that the accident resulted in heavy ______ among civilian commuters.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 1",
        lesson: "Lesson 2",
        difficulty: "Hard",
        skill: "Vocabulary & Context",
        wordType: "Noun",
        topic: "News Articles",
        bloomLevel: "Analyze",
        options: ["casualties", "capacities", "capabilities", "celebrations"],
        correctAnswer: "casualties",
        explanation: "'Casualties' means people killed or injured in a war or accident.",
        points: 10,
        timesUsed: 22,
        correctCount: 15,
        totalAttempts: 22,
      },
      {
        id: "qb_v3",
        domainCategory: "Vocabulary",
        questionText: "Scientists are trying to ______ the long-term impact of artificial intelligence on employment.",
        questionType: "fill_blank",
        stage: "Secondary",
        grade: "Second Secondary",
        unit: "Unit 2",
        lesson: "Lesson 1",
        difficulty: "Easy",
        skill: "Vocabulary",
        wordType: "Verb",
        topic: "Modern Technology",
        bloomLevel: "Understand",
        options: ["evaluate", "evaporate", "elevate", "excavate"],
        correctAnswer: "evaluate",
        explanation: "'Evaluate' means to assess or appraise value or impact.",
        points: 10,
        timesUsed: 8,
        correctCount: 7,
        totalAttempts: 8,
      },
      {
        id: "qb_v4",
        domainCategory: "Vocabulary",
        questionText: "Her ______ contribution to medical research earned her an international science award.",
        questionType: "mcq",
        stage: "Preparatory",
        grade: "Third Prep",
        unit: "Unit 1",
        lesson: "Lesson 3",
        difficulty: "Medium",
        skill: "Vocabulary",
        wordType: "Adjective",
        topic: "Inspirational Figures",
        bloomLevel: "Understand",
        options: ["significant", "insignificant", "suspicious", "superficial"],
        correctAnswer: "significant",
        explanation: "'Significant' means sufficiently great or important to be worthy of attention.",
        points: 10,
        timesUsed: 19,
        correctCount: 16,
        totalAttempts: 19,
      },
      {
        id: "qb_v5",
        domainCategory: "Vocabulary",
        questionText: "To ______ a obstacle means to successfully overcome a difficult barrier.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 3",
        lesson: "Lesson 2",
        difficulty: "Hard",
        skill: "Vocabulary",
        wordType: "Verb",
        topic: "Problem Solving",
        bloomLevel: "Apply",
        options: ["surmount", "surrender", "surround", "suppress"],
        correctAnswer: "surmount",
        explanation: "'Surmount' means to overcome a difficulty or obstacle.",
        points: 10,
        timesUsed: 5,
        correctCount: 3,
        totalAttempts: 5,
      },

      // GRAMMAR QUESTIONS
      {
        id: "qb_g1",
        domainCategory: "Grammar",
        questionText: "Hardly ______ the experiment when the power supply suddenly failed.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 1",
        lesson: "Lesson 1",
        difficulty: "Hard",
        skill: "Grammar & Structure",
        topic: "Inversion Structures",
        grammarTopic: "Tense",
        bloomLevel: "Apply",
        options: ["had the chemist started", "the chemist had started", "did the chemist start", "has the chemist started"],
        correctAnswer: "had the chemist started",
        explanation: "'Hardly' at sentence start requires past perfect inversion: 'Hardly + had + subject + V3 + when'.",
        points: 10,
        timesUsed: 30,
        correctCount: 18,
        totalAttempts: 30,
      },
      {
        id: "qb_g2",
        domainCategory: "Grammar",
        questionText: "By the time the ambulance arrived at the scene, the doctor ______ first aid to the patient.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "First Secondary",
        unit: "Unit 1",
        lesson: "Lesson 2",
        difficulty: "Medium",
        skill: "Grammar",
        topic: "Past Perfect vs Past Simple",
        grammarTopic: "Tense",
        bloomLevel: "Understand",
        options: ["had already given", "has already given", "was giving", "gives"],
        correctAnswer: "had already given",
        explanation: "'By the time + Past Simple' takes Past Perfect in the main clause for the earlier action.",
        points: 10,
        timesUsed: 42,
        correctCount: 35,
        totalAttempts: 42,
      },
      {
        id: "qb_g3",
        domainCategory: "Grammar",
        questionText: "If he ______ the required qualifications, he would have been selected for the manager position.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "Second Secondary",
        unit: "Unit 3",
        lesson: "Lesson 1",
        difficulty: "Hard",
        skill: "Grammar",
        topic: "Third Conditional",
        grammarTopic: "Conditionals",
        bloomLevel: "Apply",
        options: ["had possessed", "has possessed", "possesses", "possessed"],
        correctAnswer: "had possessed",
        explanation: "Third Conditional: If + Past Perfect (had + V3), Would have + V3.",
        points: 10,
        timesUsed: 25,
        correctCount: 17,
        totalAttempts: 25,
      },
      {
        id: "qb_g4",
        domainCategory: "Grammar",
        questionText: "The new highway ______ by the engineering company before next December.",
        questionType: "mcq",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 4",
        lesson: "Lesson 2",
        difficulty: "Medium",
        skill: "Grammar",
        topic: "Future Perfect Passive",
        grammarTopic: "Passive Voice",
        bloomLevel: "Apply",
        options: ["will have been completed", "will complete", "is completing", "was completed"],
        correctAnswer: "will have been completed",
        explanation: "'Before + Future Time' requires Future Perfect Passive: 'will have been + V3'.",
        points: 10,
        timesUsed: 16,
        correctCount: 12,
        totalAttempts: 16,
      },
      {
        id: "qb_g5",
        domainCategory: "Grammar",
        questionText: "He suggested ______ to the library to study in quiet environment.",
        questionType: "mcq",
        stage: "Preparatory",
        grade: "Third Prep",
        unit: "Unit 2",
        lesson: "Lesson 1",
        difficulty: "Easy",
        skill: "Grammar",
        topic: "Gerunds and Infinitives",
        grammarTopic: "Subject-Verb Agreement",
        bloomLevel: "Remember",
        options: ["going", "to go", "go", "went"],
        correctAnswer: "going",
        explanation: "The verb 'suggest' when followed directly by a verb takes the gerund (-ing form).",
        points: 10,
        timesUsed: 50,
        correctCount: 44,
        totalAttempts: 50,
      },
      {
        id: "qb_g6",
        domainCategory: "Grammar",
        questionText: "Rewrite the sentence in reported speech: 'Why did you arrive late?' the teacher asked Ahmed.",
        questionType: "rewrite",
        stage: "Secondary",
        grade: "Second Secondary",
        unit: "Unit 2",
        lesson: "Lesson 3",
        difficulty: "Hard",
        skill: "Grammar",
        topic: "Reported Questions",
        grammarTopic: "Reported Speech",
        bloomLevel: "Analyze",
        options: [],
        correctAnswer: "The teacher asked Ahmed why he had arrived late.",
        explanation: "Reported WH questions use question word + Subject + Past Perfect (backshifted tense).",
        points: 15,
        timesUsed: 11,
        correctCount: 7,
        totalAttempts: 11,
      },
    ];

    for (const q of initialQuestionBank) {
      await db.insert(questionBank).values(q);
    }

    // 4. SEED ENROLLMENTS, PAYMENTS, NOTIFICATIONS
    await db.insert(enrollments).values([
      {
        id: "enr_1",
        studentId: "usr_student_1",
        courseId: "crs_sec_3",
        status: "active",
        progress: 50,
        completedLessonIds: ["lsn_1_1", "lsn_1_2"],
        paymentMethod: "vodafone_cash",
      },
    ]);

    await db.insert(certificates).values([
      {
        id: "cert_1",
        studentId: "usr_student_1",
        studentName: "Omar Mahmoud Al-Sayed",
        courseId: "crs_sec_3",
        courseTitle: "Third Secondary Master Class 2025/2026 (Thanawya Amma)",
        grade: "Third Secondary",
        certificateCode: "PRO-HABIB-2025-88219",
        qrCodeData: "https://proacademy.habibelrahman.com/verify/PRO-HABIB-2025-88219",
      },
    ]);

    await db.insert(notifications).values([
      {
        id: "notif_1",
        userId: undefined,
        title: "📢 Intelligent Question Bank Launch",
        message: "Over 2,000+ targeted grammar and vocabulary questions are now active in the Smart Exam Generator!",
        type: "announcement",
        isRead: false,
      },
    ]);

    await db.insert(blogs).values([
      {
        id: "blog_1",
        title: "Top 10 Grammar Pitfalls in Thanawya Amma Exams and How to Avoid Them",
        slug: "top-10-grammar-pitfalls-thanawya-amma",
        author: "Mr. Habib El Rahman",
        content: `Every year thousands of Third Secondary students lose points on subtle grammar exceptions...`,
        excerpt: "Learn the secrets to securing full marks in Thanawya Amma English grammar sections.",
        coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
        tags: ["Thanawya Amma", "Grammar Tips", "Exam Advice"],
      },
    ]);

    await db.insert(liveChat).values([
      {
        id: "chat_1",
        senderId: "usr_admin_1",
        senderName: "Mr. Habib El Rahman",
        senderRole: "admin",
        message: "Welcome to Professional Academy! Try our new Smart Exam Generator to generate custom practice tests.",
        channel: "general",
      },
    ]);

    await db.insert(studyPlanner).values([
      {
        id: "sp_1",
        studentId: "usr_student_1",
        task: "Generate 20-question custom quiz on Inversion & Conditionals",
        dueDate: "2025-03-25",
        priority: "High",
        isCompleted: false,
      },
    ]);

    // SEED PDF LIBRARY DOCUMENTS (Demo entries with external viewer URL)
    await db.insert(pdfDocuments).values([
      {
        id: "pdf_demo_1",
        title: "Unit 1 Grammar Notes – Past Tenses & Inversion Rules",
        description: "Comprehensive PDF sheet covering Past Simple, Past Continuous, Past Perfect, and negative adverb inversion (No sooner / Hardly / Scarcely) with Mr. Habib El Rahman's golden exam notes.",
        uploaderId: "usr_admin_1",
        uploaderName: "Mr. Habib El Rahman",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 1",
        topic: "Grammar Notes",
        courseId: "crs_sec_3",
        fileName: "unit1-grammar-notes.pdf",
        externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        pageCount: 12,
        views: 1240,
        downloads: 302,
        isProtected: true,
        watermarkEnabled: true,
        allowDownload: false,
      },
      {
        id: "pdf_demo_2",
        title: "Thanawya Amma High-Yield Vocabulary Sheet – Unit 1 & 2",
        description: "Curated vocabulary list with synonyms, antonyms, collocations, and Arabic meanings tailored for Baccalaureate exam passages.",
        uploaderId: "usr_teacher_1",
        uploaderName: "Ms. Sarah Ahmed",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unit: "Unit 2",
        topic: "Vocabulary Sheets",
        courseId: "crs_sec_3",
        fileName: "thanawya-vocabulary-sheet.pdf",
        externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        pageCount: 8,
        views: 890,
        downloads: 210,
        isProtected: true,
        watermarkEnabled: true,
        allowDownload: false,
      },
      {
        id: "pdf_demo_3",
        title: "Third Prep Dialogue Completion Practice Booklet",
        description: "Practice dialogues completion drills with answer keys and common trap patterns for provincial preparatory exams.",
        uploaderId: "usr_admin_1",
        uploaderName: "Mr. Habib El Rahman",
        stage: "Preparatory",
        grade: "Third Prep",
        unit: "Unit 1",
        topic: "Dialogue Practice",
        courseId: "crs_prep_3",
        fileName: "prep3-dialogue-booklet.pdf",
        externalUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        pageCount: 15,
        views: 655,
        downloads: 140,
        isProtected: true,
        watermarkEnabled: true,
        allowDownload: true,
      },
    ]);

    console.log("Database seeded with Intelligent Question Bank!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
