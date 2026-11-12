"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
  Bookmark,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Filter,
  BarChart2,
  AlertTriangle,
  Play,
  Flag,
  Check,
  Search,
  CheckCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
  Flame,
  ArrowRight,
  Layers,
  Edit3,
  Eye,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface OptionItem {
  label: string;
  text: string;
}

interface TrainingQuestion {
  id: string;
  questionNumber?: string;
  originalOrder?: number;
  sourceDocument?: string;
  sourcePage?: number;
  questionText: string;
  options: OptionItem[];
  optionsCount?: number;
  correctAnswer?: string;
  explanation?: string;
  category?: string;
  topic?: string;
  difficulty?: string;
  validationStatus?: string;
  isPublished?: boolean;
  notes?: string;
  isBookmarked?: boolean;
}

interface ExamSessionData {
  sessionId: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: TrainingQuestion[];
}

interface ExamResultReport {
  sessionId: string;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  detailedResults: Array<{
    questionId: string;
    questionNumber?: string;
    questionText: string;
    options: OptionItem[];
    studentAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    topic: string;
    difficulty: string;
  }>;
}

export const TrainingCenterWorkspace: React.FC<{ initialTopic?: string }> = ({ initialTopic }) => {
  const { lang, user } = useApp();
  const isArabic = lang === "ar";
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";

  // Navigation tab inside Training Center
  const [activeTab, setActiveTab] = useState<
    "practice" | "exams" | "topics" | "revision" | "progress" | "admin_queue"
  >("practice");

  // Filter state for Practice
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || "all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Interactive Practice State
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null);
  const [loadingPractice, setLoadingPractice] = useState<boolean>(false);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  const [practiceTimeStart, setPracticeTimeStart] = useState<number>(Date.now());
  const [practiceStreak, setPracticeStreak] = useState<number>(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);

  // Online Exam State
  const [examState, setExamState] = useState<"setup" | "running" | "result">("setup");
  const [examConfig, setExamConfig] = useState({
    title: isArabic ? "امتحان شامل في قواعد اللغة الإنجليزية" : "Comprehensive English Grammar Exam",
    topic: "all",
    difficulty: "all",
    questionCount: 20,
    durationMinutes: 20,
  });
  const [currentExam, setCurrentExam] = useState<ExamSessionData | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [currentExamQIndex, setCurrentExamQIndex] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1200);
  const [examResult, setExamResult] = useState<ExamResultReport | null>(null);
  const [isSubmittingExam, setIsSubmittingExam] = useState<boolean>(false);

  // Topics & Progress State
  const [progressStats, setProgressStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Revision State
  const [revisionType, setRevisionType] = useState<"mistakes" | "bookmarks">("mistakes");
  const [revisionItems, setRevisionItems] = useState<any[]>([]);
  const [loadingRevision, setLoadingRevision] = useState<boolean>(false);

  // Admin Review Queue State
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("all");
  const [adminTopicFilter, setAdminTopicFilter] = useState<string>("all");
  const [adminSearch, setAdminSearch] = useState<string>("");
  const [adminQuestions, setAdminQuestions] = useState<TrainingQuestion[]>([]);
  const [adminAudit, setAdminAudit] = useState<any>(null);
  const [loadingAdmin, setLoadingAdmin] = useState<boolean>(false);
  const [adminEditingQ, setAdminEditingQ] = useState<TrainingQuestion | null>(null);

  // Grammar topics list
  const TOPICS = [
    { id: "all", en: "All Grammar Topics", ar: "جميع موضوعات القواعد" },
    { id: "Past Tenses", en: "Past Tenses & Narrative", ar: "أزمنة الماضي والسرد" },
    { id: "Present Perfect", en: "Present Perfect & Experience", ar: "المضارع التام وتجارب الحياة" },
    { id: "Present Simple & Continuous", en: "Present Simple & Continuous", ar: "المضارع البسيط والمستمر" },
    { id: "Future Forms", en: "Future Forms & Intentions", ar: "صيغ المستقبل والنوايا" },
    { id: "Conditionals & Wishes", en: "Conditionals & If Clauses", ar: "الحالات الشرطية وقواعد If" },
    { id: "Modals & Auxiliaries", en: "Modal Verbs & Auxiliaries", ar: "الأفعال الناقصة والمساعدة" },
    { id: "Passive Voice", en: "Passive Voice & Structures", ar: "المبني للمجهول وتطبيقاته" },
    { id: "Relative Clauses & Pronouns", en: "Relative Clauses & Pronouns", ar: "ضمائر وأشباه جمل الوصل" },
    { id: "Prepositions & Phrasal Verbs", en: "Prepositions & Phrasal Verbs", ar: "حروف الجر والأفعال الاصطلاحية" },
    { id: "Comparatives & Superlatives", en: "Comparatives & Superlatives", ar: "المقارنة والتفضيل" },
    { id: "Question Tags", en: "Question Tags & Responses", ar: "الأسئلة المذيلة والردود" },
  ];

  // ---------------------------------------------------------------------
  // 1. PRACTICE HANDLERS
  // ---------------------------------------------------------------------
  const fetchNextPracticeQuestion = useCallback(async (exclude: string[] = answeredIds) => {
    setLoadingPractice(true);
    setPracticeAnswer(null);
    setPracticeFeedback(null);
    try {
      const params = new URLSearchParams();
      if (selectedTopic !== "all") params.append("topic", selectedTopic);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
      if (exclude.length > 0) params.append("excludeIds", exclude.slice(-30).join(","));
      if (user?.id) params.append("studentId", user.id);

      const res = await fetch(`/api/training-center/practice?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.question) {
        setCurrentQuestion(data.question);
        setPracticeTimeStart(Date.now());
      } else {
        // Reset exclude if ran out
        if (exclude.length > 0) {
          fetchNextPracticeQuestion([]);
        } else {
          setCurrentQuestion(null);
        }
      }
    } catch (err) {
      console.error("Practice fetch error:", err);
    } finally {
      setLoadingPractice(false);
    }
  }, [selectedTopic, selectedDifficulty, answeredIds, user?.id]);

  useEffect(() => {
    if (activeTab === "practice") {
      fetchNextPracticeQuestion();
    }
  }, [activeTab, selectedTopic, selectedDifficulty]);

  const submitPracticeAnswer = async (optionLabel: string) => {
    if (practiceAnswer || !currentQuestion) return;
    setPracticeAnswer(optionLabel);

    const timeSpent = Math.round((Date.now() - practiceTimeStart) / 1000);

    try {
      const res = await fetch("/api/training-center/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id,
          questionId: currentQuestion.id,
          selectedAnswer: optionLabel,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPracticeFeedback({
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
        });

        if (data.isCorrect) {
          setPracticeStreak((s) => s + 1);
        } else {
          setPracticeStreak(0);
        }

        setAnsweredIds((prev) => [...prev, currentQuestion.id]);
      }
    } catch (err) {
      console.error("Submit practice error:", err);
    }
  };

  const toggleBookmark = async (qId: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/training-center/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_bookmark",
          studentId: user.id,
          questionId: qId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (currentQuestion && currentQuestion.id === qId) {
          setCurrentQuestion({ ...currentQuestion, isBookmarked: data.isBookmarked });
        }
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  // ---------------------------------------------------------------------
  // 2. ONLINE EXAM HANDLERS
  // ---------------------------------------------------------------------
  const startExam = async () => {
    setIsSubmittingExam(true);
    try {
      const res = await fetch("/api/training-center/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          studentId: user?.id || "usr_guest",
          title: examConfig.title,
          topic: examConfig.topic,
          difficulty: examConfig.difficulty,
          questionCount: examConfig.questionCount,
          durationMinutes: examConfig.durationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentExam(data);
        setExamAnswers({});
        setFlaggedQuestions({});
        setCurrentExamQIndex(0);
        setTimeRemainingSeconds(data.durationMinutes * 60);
        setExamState("running");
      } else {
        alert(data.error || "Failed to start exam");
      }
    } catch (err) {
      console.error("Start exam error:", err);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // Countdown timer for running exam
  useEffect(() => {
    if (examState !== "running") return;
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examState, examAnswers]);

  const submitExam = async () => {
    if (!currentExam || isSubmittingExam) return;
    setIsSubmittingExam(true);
    try {
      const res = await fetch("/api/training-center/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          sessionId: currentExam.sessionId,
          studentAnswers: examAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setExamResult(data);
        setExamState("result");
      } else {
        alert(data.error || "Failed to submit exam");
      }
    } catch (err) {
      console.error("Submit exam error:", err);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // ---------------------------------------------------------------------
  // 3. PROGRESS & TOPICS HANDLERS
  // ---------------------------------------------------------------------
  const fetchProgress = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/training-center/progress?studentId=${user?.id || ""}`);
      const data = await res.json();
      if (data.success) {
        setProgressStats(data.stats);
      }
    } catch (err) {
      console.error("Progress fetch error:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "progress" || activeTab === "topics") {
      fetchProgress();
    }
  }, [activeTab]);

  // ---------------------------------------------------------------------
  // 4. REVISION HANDLERS
  // ---------------------------------------------------------------------
  const fetchRevision = async () => {
    setLoadingRevision(true);
    try {
      const res = await fetch(
        `/api/training-center/revision?studentId=${user?.id || ""}&type=${revisionType}`
      );
      const data = await res.json();
      if (data.success) {
        setRevisionItems(data.items);
      }
    } catch (err) {
      console.error("Revision fetch error:", err);
    } finally {
      setLoadingRevision(false);
    }
  };

  useEffect(() => {
    if (activeTab === "revision") {
      fetchRevision();
    }
  }, [activeTab, revisionType]);

  const resolveMistake = async (qId: string) => {
    try {
      await fetch("/api/training-center/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_mistake",
          studentId: user?.id,
          questionId: qId,
        }),
      });
      setRevisionItems((prev) => prev.filter((item) => item.question?.id !== qId));
    } catch (err) {
      console.error("Resolve mistake error:", err);
    }
  };

  // ---------------------------------------------------------------------
  // 5. ADMIN AUDIT & REVIEW QUEUE HANDLERS
  // ---------------------------------------------------------------------
  const fetchAdminData = async () => {
    setLoadingAdmin(true);
    try {
      const [auditRes, qRes] = await Promise.all([
        fetch("/api/training-center/audit"),
        fetch(
          `/api/training-center/questions?status=${adminStatusFilter}&topic=${adminTopicFilter}&search=${encodeURIComponent(
            adminSearch
          )}&limit=100&includeAnswers=true`
        ),
      ]);
      const auditJson = await auditRes.json();
      const qJson = await qRes.json();
      if (auditJson.success) setAdminAudit(auditJson.audit);
      if (qJson.success) setAdminQuestions(qJson.questions);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin_queue" && isAdminOrTeacher) {
      fetchAdminData();
    }
  }, [activeTab, adminStatusFilter, adminTopicFilter]);

  const approveQuestion = async (qId: string, answer: string, explanation: string) => {
    try {
      const res = await fetch("/api/training-center/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          questionId: qId,
          correctAnswer: answer,
          explanation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminQuestions((prev) =>
          prev.map((q) =>
            q.id === qId
              ? { ...q, validationStatus: "ready_for_publication", isPublished: true }
              : q
          )
        );
        setAdminEditingQ(null);
      }
    } catch (err) {
      console.error("Approve question error:", err);
    }
  };

  // Format seconds MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070314] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 shadow-2xl border border-purple-800/40">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-1.5 text-xs font-black text-purple-300 border border-purple-400/30 mb-3">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>{isArabic ? "مركز التدريب والامتحانات الاحترافية" : "Professional Training Center"}</span>
                <span className="text-amber-400 font-extrabold">• Mr. Habib El Rahman</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {isArabic
                  ? "تدريب تفاعلي، امتحانات ذكية، ومراجعة تشخيصية"
                  : "Interactive Practice, Smart Exams & Diagnostic Revision"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-purple-200/80 max-w-2xl leading-relaxed">
                {isArabic
                  ? "منظومة تدريبية متكاملة مستخرجة من أحدث بنوك الأسئلة المنهجية (894 سؤالاً معتمداً) تغطي جميع قواعد اللغة الإنجليزية، مع تصحيح لحظي وتحليل لنقاط القوة والضعف."
                  : "Integrated examination and practice system extracted from comprehensive curriculum question banks with instant feedback and weak topic tracking."}
              </p>
            </div>

            {/* Streak & Points Pill */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-amber-400 animate-bounce" />
                <div>
                  <div className="text-xs text-purple-200">{isArabic ? "سلسلة الإجابات" : "Practice Streak"}</div>
                  <div className="text-lg font-black text-white">{practiceStreak} {isArabic ? "صحيحة" : "streak"}</div>
                </div>
              </div>
              <div className="h-8 w-px bg-purple-500/30" />
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="text-xs text-purple-200">{isArabic ? "نقاطك" : "Points"}</div>
                  <div className="text-lg font-black text-white">{progressStats?.points || 150}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY WORKSPACE TABS */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-slate-200 dark:border-purple-950/60 pb-3">
          <button
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
              activeTab === "practice"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white dark:bg-[#120a24] text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <Play className="h-4 w-4 text-amber-300" />
            <span>{isArabic ? "التدريب التفاعلي" : "Interactive Practice"}</span>
          </button>

          <button
            onClick={() => setActiveTab("exams")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
              activeTab === "exams"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white dark:bg-[#120a24] text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <Clock className="h-4 w-4 text-sky-400" />
            <span>{isArabic ? "الامتحانات الإلكترونية" : "Online Examinations"}</span>
          </button>

          <button
            onClick={() => setActiveTab("topics")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
              activeTab === "topics"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white dark:bg-[#120a24] text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <Layers className="h-4 w-4 text-emerald-400" />
            <span>{isArabic ? "التدريب حسب الموضوع" : "Practice by Topic"}</span>
          </button>

          <button
            onClick={() => setActiveTab("revision")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
              activeTab === "revision"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white dark:bg-[#120a24] text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <RotateCcw className="h-4 w-4 text-rose-400" />
            <span>{isArabic ? "المراجعة الذكية والأخطاء" : "Smart Revision"}</span>
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
              activeTab === "progress"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "bg-white dark:bg-[#120a24] text-slate-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span>{isArabic ? "إنجازاتي ونقاط القوة" : "My Progress"}</span>
          </button>

          {isAdminOrTeacher && (
            <button
              onClick={() => setActiveTab("admin_queue")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all mr-auto ${
                activeTab === "admin_queue"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>{isArabic ? "إدارة وتدقيق بنك الأسئلة" : "Admin Review Queue"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* VIEW 1: INTERACTIVE PRACTICE */}
      {/* ================================================================= */}
      {activeTab === "practice" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Practice Controls Bar */}
          <div className="bg-white dark:bg-[#120a24] rounded-3xl p-5 border border-slate-200 dark:border-purple-950/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-purple-300">{isArabic ? "الموضوع:" : "Topic:"}</span>
              </div>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isArabic ? t.ar : t.en}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{isArabic ? "جميع المستويات" : "All Difficulties"}</option>
                <option value="Easy">{isArabic ? "سهل (Easy)" : "Easy"}</option>
                <option value="Medium">{isArabic ? "متوسط (Medium)" : "Medium"}</option>
                <option value="Hard">{isArabic ? "صعب (Hard)" : "Hard"}</option>
              </select>
            </div>

            <button
              onClick={() => fetchNextPracticeQuestion()}
              className="flex items-center gap-2 text-xs font-black text-purple-600 dark:text-purple-300 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/50 px-4 py-2 rounded-xl transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isArabic ? "سؤال آخر" : "Skip / Next"}</span>
            </button>
          </div>

          {/* Practice Question Card */}
          {loadingPractice ? (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-16 border border-slate-200 dark:border-purple-950/60 shadow-xl flex flex-col items-center justify-center text-center">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-500 dark:text-purple-300">
                {isArabic ? "جاري تحميل السؤال التالي..." : "Loading question..."}
              </p>
            </div>
          ) : currentQuestion ? (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-purple-950/60 shadow-xl">
              {/* Question Meta Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-950/40 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {currentQuestion.topic || "Grammar"}
                  </span>
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                      currentQuestion.difficulty === "Easy"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : currentQuestion.difficulty === "Hard"
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(currentQuestion.id)}
                    className={`p-2.5 rounded-xl border transition ${
                      currentQuestion.isBookmarked
                        ? "bg-amber-500/20 border-amber-400 text-amber-400"
                        : "border-slate-200 dark:border-purple-900/40 text-slate-400 hover:text-amber-400"
                    }`}
                    title={isArabic ? "حفظ في الأسئلة المميزة" : "Bookmark question"}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-400">
                    #{currentQuestion.questionNumber || currentQuestion.originalOrder}
                  </span>
                </div>
              </div>

              {/* Question Stem */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed font-sans text-left dir-ltr">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Options List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((opt) => {
                    const isSelected = practiceAnswer === opt.label;
                    const isCorrect = practiceFeedback && practiceFeedback.correctAnswer?.toLowerCase() === opt.label.toLowerCase();
                    const isWrong = practiceFeedback && isSelected && !practiceFeedback.isCorrect;

                    let btnStyles = "border-slate-200 dark:border-purple-900/40 bg-slate-50 dark:bg-[#1a0f35] text-slate-800 dark:text-slate-100 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/50";

                    if (practiceFeedback) {
                      if (isCorrect) {
                        btnStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-extrabold ring-2 ring-emerald-500";
                      } else if (isWrong) {
                        btnStyles = "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-extrabold ring-2 ring-rose-500";
                      } else {
                        btnStyles = "opacity-50 border-slate-200 dark:border-purple-950/40";
                      }
                    }

                    return (
                      <button
                        key={opt.label}
                        disabled={practiceAnswer !== null}
                        onClick={() => submitPracticeAnswer(opt.label)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border text-left dir-ltr transition-all ${btnStyles}`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-200/60 dark:bg-purple-950/80 text-xs font-black text-purple-800 dark:text-purple-300 uppercase">
                          {opt.label}
                        </span>
                        <span className="text-base font-semibold text-slate-900 dark:text-white flex-1">
                          {opt.text}
                        </span>
                        {practiceFeedback && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                        {practiceFeedback && isWrong && (
                          <XCircle className="h-5 w-5 text-rose-500" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 col-span-2">
                    {isArabic ? "خيارات هذا السؤال قيد التدقيق والمراجعة." : "Options under review."}
                  </p>
                )}
              </div>

              {/* Feedback and Explanation */}
              {practiceFeedback && (
                <div
                  className={`mt-6 p-5 rounded-2xl border transition-all ${
                    practiceFeedback.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-3 font-black text-base mb-2">
                    {practiceFeedback.isCorrect ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <span>{isArabic ? "إجابة صحيحة وممتازة! (+5 نقاط)" : "Excellent! Correct Answer (+5 pts)"}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-rose-500" />
                        <span>
                          {isArabic
                            ? `إجابة غير دقيقة. الإجابة الصحيحة هي: (${practiceFeedback.correctAnswer.toUpperCase()})`
                            : `Incorrect. The correct answer is: (${practiceFeedback.correctAnswer.toUpperCase()})`}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    <span className="font-bold text-purple-600 dark:text-purple-300">{isArabic ? "التفسير التعليمي والقاعدة: " : "Grammar Explanation: "}</span>
                    {practiceFeedback.explanation}
                  </p>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => fetchNextPracticeQuestion()}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition"
                    >
                      <span>{isArabic ? "السؤال التالي" : "Next Question"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-12 text-center border border-slate-200 dark:border-purple-950/60">
              <Award className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {isArabic ? "أحسنت! لقد أكملت جميع الأسئلة المتاحة لهذا الفلتر" : "Great job! All questions completed for this filter"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-purple-300 mb-6">
                {isArabic ? "يمكنك اختيار موضوع آخر أو إعادة التدريب لاختبار مهاراتك." : "Choose another topic or restart practice."}
              </p>
              <button
                onClick={() => {
                  setAnsweredIds([]);
                  fetchNextPracticeQuestion([]);
                }}
                className="bg-purple-600 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-lg hover:bg-purple-700 transition"
              >
                {isArabic ? "إعادة بدء التدريب" : "Restart Practice"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 2: ONLINE EXAMINATIONS */}
      {/* ================================================================= */}
      {activeTab === "exams" && (
        <div className="max-w-4xl mx-auto">
          {examState === "setup" && (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-8 border border-slate-200 dark:border-purple-950/60 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  {isArabic ? "بدء امتحان إلكتروني محدد بوقت" : "Start Timed Online Examination"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-purple-300">
                  {isArabic
                    ? "اختر عدد الأسئلة والمدة والموضوع، وسيقوم النظام بتوليد امتحان تفاعلي وتصحيحه تلقائياً بعد التسليم."
                    : "Configure duration, question count, and topic to generate a timed exam with server-side grading."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-purple-300 mb-2">
                    {isArabic ? "موضوع الامتحان:" : "Exam Topic:"}
                  </label>
                  <select
                    value={examConfig.topic}
                    onChange={(e) => setExamConfig({ ...examConfig, topic: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {isArabic ? t.ar : t.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-purple-300 mb-2">
                    {isArabic ? "مستوى الصعوبة:" : "Difficulty Level:"}
                  </label>
                  <select
                    value={examConfig.difficulty}
                    onChange={(e) => setExamConfig({ ...examConfig, difficulty: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">{isArabic ? "متنوع (جميع المستويات)" : "Mixed (All Levels)"}</option>
                    <option value="Easy">{isArabic ? "سهل (Easy)" : "Easy"}</option>
                    <option value="Medium">{isArabic ? "متوسط (Medium)" : "Medium"}</option>
                    <option value="Hard">{isArabic ? "صعب وتحدي (Hard)" : "Hard"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-purple-300 mb-2">
                    {isArabic ? "عدد الأسئلة:" : "Number of Questions:"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 30, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setExamConfig({ ...examConfig, questionCount: num, durationMinutes: num })}
                        className={`py-3 rounded-2xl text-sm font-black transition ${
                          examConfig.questionCount === num
                            ? "bg-purple-600 text-white shadow-lg"
                            : "bg-slate-100 dark:bg-[#1a0f35] text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-purple-300 mb-2">
                    {isArabic ? "مدة الامتحان (بالدقائق):" : "Exam Duration (minutes):"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 20, 30, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setExamConfig({ ...examConfig, durationMinutes: mins })}
                        className={`py-3 rounded-2xl text-sm font-black transition ${
                          examConfig.durationMinutes === mins
                            ? "bg-purple-600 text-white shadow-lg"
                            : "bg-slate-100 dark:bg-[#1a0f35] text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                        }`}
                      >
                        {mins} د
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-purple-950/40 flex justify-end">
                <button
                  disabled={isSubmittingExam}
                  onClick={startExam}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105"
                >
                  {isSubmittingExam ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5 text-amber-300" />
                  )}
                  <span>{isArabic ? "ابدأ الامتحان الآن" : "Start Exam Now"}</span>
                </button>
              </div>
            </div>
          )}

          {examState === "running" && currentExam && (
            <div className="space-y-6">
              {/* Exam Running Header */}
              <div className="bg-white dark:bg-[#120a24] rounded-3xl p-5 border border-slate-200 dark:border-purple-950/60 shadow-lg flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{currentExam.title}</h3>
                  <div className="text-xs text-slate-500 dark:text-purple-300">
                    {isArabic
                      ? `سؤال ${currentExamQIndex + 1} من ${currentExam.totalQuestions}`
                      : `Question ${currentExamQIndex + 1} of ${currentExam.totalQuestions}`}
                  </div>
                </div>

                {/* Countdown Timer */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-base font-black ${
                    timeRemainingSeconds < 180
                      ? "bg-rose-500/20 text-rose-500 animate-pulse border border-rose-500/40"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>

                <button
                  disabled={isSubmittingExam}
                  onClick={submitExam}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition"
                >
                  {isSubmittingExam ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{isArabic ? "تسليم الامتحان" : "Submit Exam"}</span>
                  )}
                </button>
              </div>

              {/* Question Navigation Grid */}
              <div className="bg-white dark:bg-[#120a24] rounded-3xl p-4 border border-slate-200 dark:border-purple-950/60 shadow-md flex flex-wrap gap-2 justify-center">
                {currentExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentExamQIndex;
                  const isAnswered = Boolean(examAnswers[q.id]);
                  const isFlagged = Boolean(flaggedQuestions[q.id]);

                  let btnColor = "bg-slate-100 dark:bg-[#1a0f35] text-slate-700 dark:text-purple-300";
                  if (isAnswered) btnColor = "bg-purple-600 text-white";
                  if (isCurrent) btnColor = "ring-2 ring-amber-400 font-black " + btnColor;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentExamQIndex(idx)}
                      className={`relative h-9 w-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${btnColor}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#120a24]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Exam Question */}
              {currentExam.questions[currentExamQIndex] && (
                <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-purple-950/60 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-950/40 pb-4">
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {currentExam.questions[currentExamQIndex].topic || "Grammar"}
                    </span>

                    <button
                      onClick={() => {
                        const qId = currentExam.questions[currentExamQIndex].id;
                        setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
                      }}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        flaggedQuestions[currentExam.questions[currentExamQIndex].id]
                          ? "bg-amber-500/20 border-amber-400 text-amber-500"
                          : "border-slate-200 dark:border-purple-900/40 text-slate-400 hover:text-amber-400"
                      }`}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      <span>{isArabic ? "تعليم للمراجعة" : "Flag for Review"}</span>
                    </button>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed text-left dir-ltr">
                    {currentExam.questions[currentExamQIndex].questionText}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentExam.questions[currentExamQIndex].options.map((opt) => {
                      const qId = currentExam.questions[currentExamQIndex].id;
                      const isSelected = examAnswers[qId] === opt.label;

                      return (
                        <button
                          key={opt.label}
                          onClick={() => setExamAnswers({ ...examAnswers, [qId]: opt.label })}
                          className={`flex items-center gap-4 p-4 rounded-2xl border text-left dir-ltr transition-all ${
                            isSelected
                              ? "border-purple-600 bg-purple-600/10 text-purple-900 dark:text-purple-200 font-extrabold ring-2 ring-purple-600"
                              : "border-slate-200 dark:border-purple-900/40 bg-slate-50 dark:bg-[#1a0f35] text-slate-800 dark:text-slate-100 hover:border-purple-500"
                          }`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-200/60 dark:bg-purple-950/80 text-xs font-black text-purple-800 dark:text-purple-300 uppercase">
                            {opt.label}
                          </span>
                          <span className="text-base font-semibold text-slate-900 dark:text-white flex-1">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-purple-950/40">
                    <button
                      disabled={currentExamQIndex === 0}
                      onClick={() => setCurrentExamQIndex((i) => Math.max(0, i - 1))}
                      className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-purple-300 disabled:opacity-30 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-purple-900/40"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span>{isArabic ? "السابق" : "Previous"}</span>
                    </button>

                    <button
                      disabled={currentExamQIndex === currentExam.questions.length - 1}
                      onClick={() =>
                        setCurrentExamQIndex((i) => Math.min(currentExam.questions.length - 1, i + 1))
                      }
                      className="flex items-center gap-2 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-30 px-5 py-2.5 rounded-xl shadow-md"
                    >
                      <span>{isArabic ? "التالي" : "Next"}</span>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {examState === "result" && examResult && (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-8 border border-slate-200 dark:border-purple-950/60 shadow-xl space-y-8">
              {/* Result Header Banner */}
              <div
                className={`p-8 rounded-3xl text-center border ${
                  examResult.passed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                }`}
              >
                <Award
                  className={`h-16 w-16 mx-auto mb-3 ${
                    examResult.passed ? "text-emerald-500 animate-bounce" : "text-rose-500"
                  }`}
                />
                <h2 className="text-3xl font-black mb-2">
                  {examResult.passed
                    ? isArabic
                      ? "تهانينا! لقد اجتزت الامتحان بنجاح"
                      : "Congratulations! Exam Passed"
                    : isArabic
                    ? "لم توفق هذه المرة، تدرب مجدداً"
                    : "Exam Needs Revision"}
                </h2>
                <div className="text-4xl font-black mt-4">
                  {examResult.score} / {examResult.totalScore} ({examResult.percentage}%)
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-purple-200">
                  {isArabic
                    ? `تم تسجيل النتيجة وحفظ النقاط (+${examResult.score * 10} نقطة) وإضافة الأسئلة الخاطئة للمراجعة الذكية.`
                    : `Score recorded, points awarded, and mistakes queued for smart revision.`}
                </p>

                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setExamState("setup");
                      setExamResult(null);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition"
                  >
                    {isArabic ? "امتحان جديد" : "Take Another Exam"}
                  </button>
                </div>
              </div>

              {/* Question Breakdown List */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isArabic ? "مراجعة تفصيلية لجميع إجاباتك:" : "Detailed Question Breakdown:"}
                </h3>

                {examResult.detailedResults.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`p-5 rounded-2xl border text-left dir-ltr ${
                      item.isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-rose-500/30 bg-rose-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                        Q{idx + 1}. {item.topic}
                      </span>
                      {item.isCorrect ? (
                        <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Correct (+10 pts)
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-rose-500 flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    <p className="text-base font-bold text-slate-900 dark:text-white mb-3">
                      {item.questionText}
                    </p>

                    <div className="text-xs space-y-1 font-semibold">
                      <div className="text-slate-600 dark:text-slate-300">
                        Your Answer:{" "}
                        <span className={item.isCorrect ? "text-emerald-500 font-black" : "text-rose-500 font-black"}>
                          {item.studentAnswer?.toUpperCase() || "Unanswered"}
                        </span>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Correct Answer: {item.correctAnswer?.toUpperCase()}
                      </div>
                      <div className="text-slate-500 dark:text-purple-300 pt-2 border-t border-slate-200 dark:border-purple-950/40">
                        Rule: {item.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 3: PRACTICE BY TOPIC */}
      {/* ================================================================= */}
      {activeTab === "topics" && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {isArabic ? "خارطة القواعد والتدريب الموجه" : "Grammar Topics Mastery"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-purple-300">
              {isArabic
                ? "اختر موضوعاً محدداً للتركيز عليه وإتقان قواعده قبل الانتقال للموضوع التالي."
                : "Select a topic to focus on and master its grammatical rules."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOPICS.filter((t) => t.id !== "all").map((topic) => {
              const stats = progressStats?.topicStats?.find((s: any) => s.topic === topic.id);
              const accuracy = stats?.accuracy || 0;
              const totalDone = stats?.total || 0;

              return (
                <div
                  key={topic.id}
                  className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg hover:border-purple-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          accuracy >= 80
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300"
                            : accuracy >= 50
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-purple-950/60 text-slate-600 dark:text-purple-300"
                        }`}
                      >
                        {totalDone > 0 ? `${accuracy}% دقة` : isArabic ? "جديد" : "New"}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                      {isArabic ? topic.ar : topic.en}
                    </h3>
                    <p className="text-xs text-purple-600 dark:text-purple-300 font-mono mb-4">{topic.en}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-purple-950/40 rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalDone / 20) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTopic(topic.id);
                      setActiveTab("practice");
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 font-extrabold text-xs py-3 rounded-2xl transition"
                  >
                    <span>{isArabic ? "تدريب على هذا الموضوع" : "Practice This Topic"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 4: SMART REVISION */}
      {/* ================================================================= */}
      {activeTab === "revision" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                {isArabic ? "المراجعة الذكية للأسئلة" : "Smart Revision Center"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-purple-300">
                {isArabic
                  ? "إعادة حل الأخطاء السابقة وتثبيت القواعد الصعبة والأسئلة المحفوظة."
                  : "Re-practice questions you got wrong and review bookmarked items."}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-[#120a24] p-1.5 rounded-2xl border border-slate-200 dark:border-purple-950/60 shadow">
              <button
                onClick={() => setRevisionType("mistakes")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  revisionType === "mistakes"
                    ? "bg-purple-600 text-white"
                    : "text-slate-600 dark:text-purple-300"
                }`}
              >
                {isArabic ? "أخطائي السابقة" : "My Mistakes"}
              </button>
              <button
                onClick={() => setRevisionType("bookmarks")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  revisionType === "bookmarks"
                    ? "bg-purple-600 text-white"
                    : "text-slate-600 dark:text-purple-300"
                }`}
              >
                {isArabic ? "الأسئلة المحفوظة" : "Bookmarked Questions"}
              </button>
            </div>
          </div>

          {loadingRevision ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto" />
            </div>
          ) : revisionItems.length > 0 ? (
            <div className="space-y-4">
              {revisionItems.map((item) => (
                <div
                  key={item.mistakeId || item.bookmarkId}
                  className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-950/40 pb-3">
                    <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                      {item.question?.topic || "Grammar"}
                    </span>
                    {revisionType === "mistakes" && (
                      <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">
                        {isArabic ? `تكرر الخطأ: ${item.mistakeCount} مرات` : `Mistakes: ${item.mistakeCount}`}
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-bold text-slate-900 dark:text-white text-left dir-ltr">
                    {item.question?.questionText}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-left dir-ltr">
                    {item.question?.options?.map((opt: any) => (
                      <div
                        key={opt.label}
                        className={`p-2.5 rounded-xl border ${
                          opt.label === item.question?.correctAnswer
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-bold"
                            : "border-slate-200 dark:border-purple-950/40 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <span className="font-bold mr-2 uppercase">{opt.label})</span>
                        {opt.text}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-purple-950/40 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-purple-300 font-medium">
                      القاعدة: {item.question?.explanation || item.question?.topic}
                    </div>

                    {revisionType === "mistakes" && (
                      <button
                        onClick={() => resolveMistake(item.question.id)}
                        className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl transition"
                      >
                        <Check className="h-4 w-4" />
                        <span>{isArabic ? "تم فهم القاعدة وتجاوز الخطأ" : "Mark as Mastered"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-12 text-center border border-slate-200 dark:border-purple-950/60">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {revisionType === "mistakes"
                  ? isArabic
                    ? "رائع! قائمة أخطائك فارغة حالياً"
                    : "Great! No active mistakes in queue"
                  : isArabic
                  ? "لا توجد أسئلة محفوظة بعد"
                  : "No bookmarked questions yet"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-purple-300">
                {isArabic
                  ? "عند ارتكاب أي خطأ أثناء التدريب سيتم حفظه هنا تلقائياً لمساعدتك على مراجعته."
                  : "Questions you get wrong or bookmark during practice will appear here."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 5: MY PROGRESS */}
      {/* ================================================================= */}
      {activeTab === "progress" && (
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {isArabic ? "لوحة تقدمي وإنجازاتي" : "My Progress & Diagnostic Report"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-purple-300">
              {isArabic
                ? "تقرير رقمي دقيق يوضح معدل دقة إجاباتك ومستواك في كل موضوع من موضوعات القواعد."
                : "Quantitative diagnostic breakdown of your performance across all grammar topics."}
            </p>
          </div>

          {/* Stats 4-Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg">
              <div className="text-xs font-bold text-slate-500 dark:text-purple-300 mb-1">
                {isArabic ? "الأسئلة المحلولة" : "Questions Solved"}
              </div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {progressStats?.totalPracticed || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg">
              <div className="text-xs font-bold text-slate-500 dark:text-purple-300 mb-1">
                {isArabic ? "دقة الإجابات" : "Accuracy Rate"}
              </div>
              <div className="text-3xl font-black text-emerald-500">
                {progressStats?.overallAccuracy || 0}%
              </div>
            </div>

            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg">
              <div className="text-xs font-bold text-slate-500 dark:text-purple-300 mb-1">
                {isArabic ? "الامتحانات المكتملة" : "Exams Taken"}
              </div>
              <div className="text-3xl font-black text-sky-500">
                {progressStats?.totalExams || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg">
              <div className="text-xs font-bold text-slate-500 dark:text-purple-300 mb-1">
                {isArabic ? "أخطاء قيد المراجعة" : "Pending Mistakes"}
              </div>
              <div className="text-3xl font-black text-rose-500">
                {progressStats?.unresolvedMistakes || 0}
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg">
              <h3 className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <span>{isArabic ? "نقاط القوة والإتقان (≥ 80%)" : "Strong Topics"}</span>
              </h3>
              {progressStats?.strongTopics?.length > 0 ? (
                <ul className="space-y-2">
                  {progressStats.strongTopics.map((tp: string) => (
                    <li key={tp} className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {tp}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-purple-300">
                  {isArabic ? "قم بحل 3 أسئلة على الأقل في أي موضوع لإظهار نقاط قوتك." : "Complete at least 3 questions in a topic to reveal mastery."}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-[#120a24] rounded-3xl p-6 border border-slate-200 dark:border-purple-950/60 shadow-lg">
              <h3 className="text-base font-black text-rose-500 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5" />
                <span>{isArabic ? "موضوعات تحتاج لتركيز إضافي (< 60%)" : "Weak Topics for Improvement"}</span>
              </h3>
              {progressStats?.weakTopics?.length > 0 ? (
                <ul className="space-y-2">
                  {progressStats.weakTopics.map((tp: string) => (
                    <li key={tp} className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        {tp}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTopic(tp);
                          setActiveTab("practice");
                        }}
                        className="text-xs font-bold text-purple-600 hover:underline"
                      >
                        {isArabic ? "تدريب الآن" : "Practice"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-purple-300">
                  {isArabic ? "ممتاز! لا توجد موضوعات ضعيفة مسجلة حتى الآن." : "Excellent! No weak topics identified."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 6: ADMIN REVIEW & AUDIT QUEUE */}
      {/* ================================================================= */}
      {activeTab === "admin_queue" && isAdminOrTeacher && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Extraction Audit Banner */}
          {adminAudit && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 border border-purple-800/40 text-white shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-purple-300 font-bold">
                    المصدر: {adminAudit.sourceDocument} (108 صفحات مفحوصة)
                  </div>
                  <h3 className="text-xl font-black mt-1">
                    تقرير استخراج وتدقيق بنك الأسئلة المركزي: {adminAudit.totalQuestions} سؤالاً
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                    المنشور للطلاب: {adminAudit.publishedCount} ({adminAudit.publishedPercentage}%)
                  </span>
                </div>
              </div>

              {/* Status Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4 border-t border-purple-800/40 text-center">
                {Object.entries(adminAudit.statusBreakdown || {}).map(([st, cnt]: any) => (
                  <div
                    key={st}
                    onClick={() => setAdminStatusFilter(st)}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      adminStatusFilter === st
                        ? "bg-purple-600 border-white font-black"
                        : "bg-white/5 border-purple-500/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-lg font-black">{cnt}</div>
                    <div className="text-[10px] font-bold text-purple-200 uppercase truncate">{st}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Filters */}
          <div className="bg-white dark:bg-[#120a24] rounded-3xl p-5 border border-slate-200 dark:border-purple-950/60 shadow flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
                className="bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="all">جميع الحالات (All Statuses)</option>
                <option value="complete_verified">complete_verified (جاهز ومعتمد)</option>
                <option value="missing_options">missing_options (خيارات ناقصة بحاجة لمراجعة)</option>
                <option value="missing_text">missing_text (نص مقطوع بحاجة لفحص)</option>
                <option value="unverified_answer">unverified_answer (إجابة غير مؤكدة)</option>
                <option value="ready_for_publication">ready_for_publication (معتمد للنشر)</option>
              </select>

              <select
                value={adminTopicFilter}
                onChange={(e) => setAdminTopicFilter(e.target.value)}
                className="bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3 py-2 text-xs font-bold"
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isArabic ? t.ar : t.en}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في السؤال..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchAdminData()}
                  className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#1a0f35] border border-slate-200 dark:border-purple-800/40 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <button
              onClick={fetchAdminData}
              className="flex items-center gap-2 bg-purple-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>تحديث القائمة</span>
            </button>
          </div>

          {/* Admin Questions Table */}
          {loadingAdmin ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#120a24] rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-[#1a0f35] text-slate-700 dark:text-purple-300 uppercase font-black border-b border-slate-200 dark:border-purple-900/40">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">نص السؤال</th>
                      <th className="p-4">الموضوع</th>
                      <th className="p-4">الخيارات</th>
                      <th className="p-4">الإجابة</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-950/40">
                    {adminQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/20 transition">
                        <td className="p-4 font-mono font-bold">{q.questionNumber || q.originalOrder}</td>
                        <td className="p-4 max-w-xs truncate font-sans text-left dir-ltr font-bold text-slate-900 dark:text-white">
                          {q.questionText}
                        </td>
                        <td className="p-4 text-purple-600 dark:text-purple-300 font-bold">{q.topic}</td>
                        <td className="p-4">
                          <span className="font-mono">{q.options?.length || 0} خيارات</span>
                        </td>
                        <td className="p-4 font-black uppercase text-emerald-500">
                          {q.correctAnswer || "غير محدد"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              q.validationStatus === "complete_verified" || q.validationStatus === "ready_for_publication"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                                : q.validationStatus === "missing_options"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-600"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-500"
                            }`}
                          >
                            {q.validationStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setAdminEditingQ(q)}
                            className="text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline px-3 py-1 bg-purple-50 dark:bg-purple-950/40 rounded-lg"
                          >
                            مراجعة واعتماد
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Edit Modal */}
          {adminEditingQ && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#120a24] rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-purple-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    مراجعة واعتماد السؤال #{adminEditingQ.questionNumber || adminEditingQ.originalOrder}
                  </h3>
                  <button onClick={() => setAdminEditingQ(null)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نص السؤال:</label>
                  <textarea
                    rows={3}
                    value={adminEditingQ.questionText}
                    onChange={(e) => setAdminEditingQ({ ...adminEditingQ, questionText: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-[#1a0f35] border rounded-2xl text-sm font-bold text-left dir-ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الإجابة الصحيحة:</label>
                    <input
                      type="text"
                      value={adminEditingQ.correctAnswer || ""}
                      onChange={(e) => setAdminEditingQ({ ...adminEditingQ, correctAnswer: e.target.value })}
                      placeholder="e.g. a, b, c, d"
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1a0f35] border rounded-xl text-sm font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الموضوع:</label>
                    <input
                      type="text"
                      value={adminEditingQ.topic || ""}
                      onChange={(e) => setAdminEditingQ({ ...adminEditingQ, topic: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#1a0f35] border rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">التفسير التعليمي والقاعدة:</label>
                  <input
                    type="text"
                    value={adminEditingQ.explanation || ""}
                    onChange={(e) => setAdminEditingQ({ ...adminEditingQ, explanation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#1a0f35] border rounded-xl text-sm font-bold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    onClick={() => setAdminEditingQ(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() =>
                      approveQuestion(
                        adminEditingQ.id,
                        adminEditingQ.correctAnswer || "a",
                        adminEditingQ.explanation || `Grammar rule: ${adminEditingQ.topic}`
                      )
                    }
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                  >
                    اعتماد ونشر للطلاب
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
