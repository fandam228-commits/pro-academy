"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { TranslationLessonView } from "./TranslationLessonView";
import { TranslationQuestionPlayer } from "./TranslationQuestionPlayer";
import {
  Languages,
  BookOpen,
  Award,
  BarChart3,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Plus,
  UploadCloud,
  FileSpreadsheet,
  ChevronRight,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Send,
  Eye,
  GraduationCap,
  MessageSquare,
} from "lucide-react";

export const TranslationAcademyWorkspace: React.FC = () => {
  const { lang, user } = useApp();

  // Navigation states
  const [activeMainTab, setActiveMainTab] = useState<"modules" | "practice" | "exam" | "analytics" | "admin">("modules");
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  // Data states
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [reviewSubmissions, setReviewSubmissions] = useState<any[]>([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  // Practice & Exam Session states
  const [activeSessionQuestions, setActiveSessionQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(1800); // 30 mins
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Admin states
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importReport, setImportReport] = useState<any>(null);
  const [selectedTargetModuleId, setSelectedTargetModuleId] = useState("");
  const [selectedTargetLessonId, setSelectedTargetLessonId] = useState("");
  const [teacherReviewNote, setTeacherReviewNote] = useState<Record<string, string>>({});
  const [teacherReviewScore, setTeacherReviewScore] = useState<Record<string, number>>({});

  // 1. Fetch Modules & Lessons
  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/translation/modules?grade=First+Secondary&term=First+Term");
      const data = await res.json();
      if (data.success && Array.isArray(data.modules)) {
        setModules(data.modules);
        if (data.modules.length > 0 && !selectedTargetModuleId) {
          setSelectedTargetModuleId(data.modules[0].id);
          if (data.modules[0].lessons?.length > 0) {
            setSelectedTargetLessonId(data.modules[0].lessons[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch modules:", e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/translation/analytics");
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    }
  };

  // 3. Fetch Review Submissions (Teacher/Admin)
  const fetchReviewSubmissions = async () => {
    if (user?.role !== "admin" && user?.role !== "teacher") return;
    try {
      const res = await fetch("/api/translation/submissions?status=needs_review");
      const data = await res.json();
      if (data.success) {
        setReviewSubmissions(data.submissions || []);
        setPendingReviewCount(data.pendingReviewCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch review submissions:", e);
    }
  };

  useEffect(() => {
    fetchModules();
    fetchAnalytics();
    if (user?.role === "admin" || user?.role === "teacher") {
      fetchReviewSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Exam Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (activeMainTab === "exam" && !isExamCompleted && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExamCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeMainTab, isExamCompleted, examTimeLeft]);

  // Start Practice with Specific Lesson Questions
  const startLessonPractice = (lesson: any, mod: any) => {
    setSelectedLesson(lesson);
    setSelectedModule(mod);
    const questions = lesson.questions || [];
    setActiveSessionQuestions(questions);
    setCurrentQuestionIndex(0);
    setSessionResults([]);
    setIsExamCompleted(false);
    setActiveMainTab("practice");
  };

  // Start Exam
  const startLessonExam = (lesson: any, mod: any) => {
    setSelectedLesson(lesson);
    setSelectedModule(mod);
    const questions = lesson.questions || [];
    setActiveSessionQuestions(questions);
    setCurrentQuestionIndex(0);
    setSessionResults([]);
    setIsExamCompleted(false);
    setExamTimeLeft(1800); // 30 minutes
    setActiveMainTab("exam");
  };

  // Handle Question Submission in Practice/Exam
  const handleAnswerRecorded = (result: any) => {
    setSessionResults((prev) => [...prev, result]);
  };

  // Handle Teacher Grade Approval
  const handleApproveTeacherReview = async (submissionId: string) => {
    try {
      const newScore = teacherReviewScore[submissionId];
      const comment = teacherReviewNote[submissionId] || "تمت المراجعة والاعتماد الأكاديمي بواسطة المستر حبيب الرحمن.";

      const res = await fetch("/api/translation/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          newScore,
          teacherComment: comment,
          status: "teacher_reviewed",
        }),
      });

      if (res.ok) {
        setReviewSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
        setPendingReviewCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error("Approve review error:", e);
    }
  };

  // Handle Bulk Import
  const handleBulkImport = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    setImportReport(null);

    try {
      // Parse tab-separated or pipe-separated lines
      const lines = importText.split("\n").filter((l) => l.trim().length > 0);
      const parsedRows: any[] = [];

      for (const line of lines) {
        // Format: Question | Options (comma-sep) | CorrectAnswer | Alternatives (semicolon-sep) | Marks | Difficulty | Topic
        const parts = line.includes("\t") ? line.split("\t") : line.split("|");
        if (parts.length >= 2) {
          parsedRows.push({
            questionText: parts[0]?.trim(),
            options: parts[1]?.trim() || "",
            correctAnswer: parts[2]?.trim() || parts[1]?.trim() || "",
            alternativeAnswers: parts[3]?.trim() || "",
            marks: parts[4]?.trim() || 2,
            difficulty: parts[5]?.trim() || "Medium",
            topic: parts[6]?.trim() || "Bulk Import",
            lessonId: selectedTargetLessonId,
            moduleId: selectedTargetModuleId,
          });
        }
      }

      const res = await fetch("/api/translation/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: parsedRows,
          defaultLessonId: selectedTargetLessonId,
          defaultModuleId: selectedTargetModuleId,
        }),
      });

      const json = await res.json();
      setImportReport(json);
      if (json.success) {
        setImportText("");
        fetchModules();
      }
    } catch (e) {
      console.error("Bulk import failed:", e);
    } finally {
      setImportLoading(false);
    }
  };

  // Format Seconds to MM:SS
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* BRANDING HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950 via-[#180a33] to-[#0c071a] p-8 sm:p-10 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                ⭐ أكاديمية مستر حبيب الرحمن
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 backdrop-blur border border-white/20 text-purple-200">
                الصف الأول الثانوي — الترم الأول
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              TRANSLATION ACADEMY
              <span className="block text-xl sm:text-2xl text-purple-300 font-bold mt-1">
                أكاديمية الترجمة الاحترافية
              </span>
            </h1>

            <p className="text-sm sm:text-base font-medium text-purple-100/90 leading-relaxed">
              &ldquo;Think in English. Translate with Confidence.&rdquo; — فكر بالإنجليزية.. وترجم بثقة.
              نظام تعليمي متكامل يعلمك أسرار وفنون وصياغات الترجمة بامتحانات الوزارة والبوكليت مع تقييم ذكي فوري.
            </p>
          </div>

          {/* QUICK STATS CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center">
              <span className="text-[10px] text-purple-200 font-bold block">المسارات المعتمدة</span>
              <span className="text-xl font-black text-amber-300">8 مسارات</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center">
              <span className="text-[10px] text-purple-200 font-bold block">أنماط الأسئلة</span>
              <span className="text-xl font-black text-sky-300">14 نمط</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-purple-200 font-bold block">معايير التقييم</span>
              <span className="text-xl font-black text-emerald-300">5 محاور</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => {
            setActiveMainTab("modules");
            setSelectedLesson(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === "modules"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>المناهج والمسارات (8 Tracks)</span>
        </button>

        <button
          onClick={() => {
            if (!activeSessionQuestions.length && modules[0]?.lessons[0]?.questions) {
              setActiveSessionQuestions(modules[0].lessons[0].questions);
            }
            setActiveMainTab("practice");
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === "practice"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>وضع التدريب الفوري (Practice)</span>
        </button>

        <button
          onClick={() => {
            if (!activeSessionQuestions.length && modules[0]?.lessons[0]?.questions) {
              setActiveSessionQuestions(modules[0].lessons[0].questions);
            }
            setActiveMainTab("exam");
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === "exam"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-300" />
          <span>وضع الامتحان (Exam Simulation)</span>
        </button>

        <button
          onClick={() => {
            setActiveMainTab("analytics");
            fetchAnalytics();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === "analytics"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>لوحة التحليلات والتقارير</span>
        </button>

        {(user?.role === "admin" || user?.role === "teacher") && (
          <button
            onClick={() => {
              setActiveMainTab("admin");
              fetchReviewSubmissions();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === "admin"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>لوحة المعلم والمراجعة</span>
            {pendingReviewCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {pendingReviewCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: MODULES & LESSONS BROWSER */}
      {/* ============================================================== */}
      {activeMainTab === "modules" && (
        <>
          {selectedLesson ? (
            /* LESSON VIEW WITH VIDEO/PDF/RULES */
            <TranslationLessonView
              lesson={selectedLesson}
              module={selectedModule}
              onStartPractice={() => startLessonPractice(selectedLesson, selectedModule)}
              onStartExam={() => startLessonExam(selectedLesson, selectedModule)}
              onBack={() => setSelectedLesson(null)}
            />
          ) : (
            /* 8 MODULES GRID */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    مسارات أكاديمية الترجمة (Curriculum Modules)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    منهج متسلسل من الأساسيات حتى احتراف ترجمة أسئلة امتحانات الثانوية العامة والبوكليت
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {modules.map((mod: any, idx: number) => {
                    const completedLessons = (mod.lessons || []).filter((l: any) => l.progress?.completed).length;
                    const totalL = mod.lessons?.length || 1;
                    const progressPct = Math.round((completedLessons / totalL) * 100);

                    return (
                      <div
                        key={mod.id}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm border border-purple-300/30">
                              0{idx + 1}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                              {mod.totalLessons || mod.lessons?.length || 0} دروس
                            </span>
                          </div>

                          <div>
                            <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {mod.titleAr}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {mod.titleEn}
                            </p>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {mod.descriptionAr}
                          </p>

                          {/* PROGRESS BAR */}
                          <div className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span>نسبة الإنجاز</span>
                              <span className="text-purple-600 dark:text-purple-400 font-mono">{progressPct}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-600 to-sky-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* LESSONS DRAWER / EXPANDER */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-4">
                          {mod.lessons?.map((l: any) => (
                            <button
                              key={l.id}
                              onClick={() => {
                                setSelectedModule(mod);
                                setSelectedLesson(l);
                              }}
                              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 text-left rtl:text-right flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:border-purple-300 transition-all cursor-pointer"
                            >
                              <span className="truncate max-w-[180px]">{l.titleAr}</span>
                              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400 group-hover:text-purple-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: PRACTICE MODE (INSTANT EVALUATION & 14 QUESTION TYPES) */}
      {/* ============================================================== */}
      {activeMainTab === "practice" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-black text-sm text-purple-900 dark:text-purple-200">
                  وضع التدريب التفاعلي الفوري (Practice Mode)
                </h4>
                <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
                  تصحيح ذكي فوري بالروبوت التعليمي + تقرير تحليلي بالمحاور الخمسة + تلميحات تعليمية
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-purple-700 dark:text-purple-300 font-mono">
              سؤال {currentQuestionIndex + 1} من {activeSessionQuestions.length || 1}
            </span>
          </div>

          {activeSessionQuestions.length > 0 ? (
            <TranslationQuestionPlayer
              question={activeSessionQuestions[currentQuestionIndex]}
              mode="practice"
              onAnswerSubmitted={handleAnswerRecorded}
              isLast={currentQuestionIndex === activeSessionQuestions.length - 1}
              onNext={() => {
                if (currentQuestionIndex < activeSessionQuestions.length - 1) {
                  setCurrentQuestionIndex((prev) => prev + 1);
                } else {
                  setActiveMainTab("modules");
                }
              }}
            />
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                اختر درساً من قائمة المسارات لبدء التدريب على أسئلته.
              </p>
              <button
                onClick={() => setActiveMainTab("modules")}
                className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs shadow-lg cursor-pointer"
              >
                تصفح الدروس الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: EXAM MODE (TIMED SIMULATION, MARKS, CONFIRMATION MODAL) */}
      {/* ============================================================== */}
      {activeMainTab === "exam" && (
        <div className="space-y-6">
          {/* EXAM STATUS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="font-black text-base">
                  امتحان محاكاة الترجمة الرسمي — مستر حبيب الرحمن
                </h4>
                <p className="text-xs text-slate-400">
                  {selectedLesson ? selectedLesson.titleAr : "امتحان شامل على مهارات الترجمة"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* TIMER */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 font-mono font-black text-sm text-amber-300">
                <Clock className="w-4 h-4" />
                <span>{formatTime(examTimeLeft)}</span>
              </div>

              {!isExamCompleted && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white shadow-md cursor-pointer"
                >
                  تسليم الامتحان النهائي
                </button>
              )}
            </div>
          </div>

          {/* EXAM QUESTION VIEW */}
          {!isExamCompleted && activeSessionQuestions.length > 0 ? (
            <TranslationQuestionPlayer
              question={activeSessionQuestions[currentQuestionIndex]}
              mode="exam"
              onAnswerSubmitted={handleAnswerRecorded}
              isLast={currentQuestionIndex === activeSessionQuestions.length - 1}
              onNext={() => {
                if (currentQuestionIndex < activeSessionQuestions.length - 1) {
                  setCurrentQuestionIndex((prev) => prev + 1);
                } else {
                  setShowConfirmModal(true);
                }
              }}
            />
          ) : isExamCompleted ? (
            /* EXAM RESULTS REPORT */
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  تم تسليم وتصحيح امتحان الترجمة بنجاح!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تم تقييم إجاباتك وفق معايير الترجمة المعتمدة الخمسة (المعنى، القواعد، المفردات، البنية، والترقيم).
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setIsExamCompleted(false);
                    setCurrentQuestionIndex(0);
                    setSessionResults([]);
                    setExamTimeLeft(1800);
                  }}
                  className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة الامتحان</span>
                </button>
                <button
                  onClick={() => setActiveMainTab("modules")}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  العودة للمسارات
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                اختر امتحاناً من المسارات لخوض تجربة الاختبار الموقوت.
              </p>
              <button
                onClick={() => setActiveMainTab("modules")}
                className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs shadow-lg cursor-pointer"
              >
                تصفح المسارات والامتحانات
              </button>
            </div>
          )}

          {/* CONFIRMATION MODAL */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/30 space-y-5 shadow-2xl">
                <div className="flex items-center gap-3 text-amber-500">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    تأكيد تسليم امتحان الترجمة
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  هل أنت متأكد من رغبتك في إنهاء وتسليم الامتحان الآن؟ سيتم حساب النتيجة النهائية واستخراج تقرير التقييم الذكي.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    متابعة الحل
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setIsExamCompleted(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer"
                  >
                    تأكيد التسليم الآن
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 4: PERFORMANCE ANALYTICS & WEAKNESS REPORT */}
      {/* ============================================================== */}
      {activeMainTab === "analytics" && (
        <div className="space-y-8 animate-fadeIn">
          {analyticsData ? (
            <>
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">متوسط دقة الترجمة</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {analyticsData.summary?.averageAccuracy || 0}%
                  </span>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">إجمالي الإجابات المقدمة</span>
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                    {analyticsData.summary?.studentSubmissionsCount || 0}
                  </span>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">الدروس المنجزة</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {analyticsData.summary?.completedLessonsCount || 0} من {analyticsData.summary?.totalLessons || 0}
                  </span>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">بنك الأسئلة المتاح</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {analyticsData.summary?.totalQuestionsInBank || 0} سؤال
                  </span>
                </div>
              </div>

              {/* 5-PART RUBRIC WEAKNESS RADAR */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    📊 تحليل محاور التقييم الخمسة (Rubric Weaknesses Analysis)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    كشف نقاط القوة والضعف في جوانب الترجمة المختلفة وتحديد مجالات التطوير
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-center space-y-2">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block">دقة المعنى (40%)</span>
                    <span className="text-2xl font-black text-purple-900 dark:text-white">
                      {analyticsData.rubricAnalysis?.meaningScorePct || 100}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-center space-y-2">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-300 block">القواعد والأزمنة (20%)</span>
                    <span className="text-2xl font-black text-sky-900 dark:text-white">
                      {analyticsData.rubricAnalysis?.grammarScorePct || 100}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">المفردات والمتلازمات (20%)</span>
                    <span className="text-2xl font-black text-emerald-900 dark:text-white">
                      {analyticsData.rubricAnalysis?.vocabScorePct || 100}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center space-y-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">بنية الجملة (10%)</span>
                    <span className="text-2xl font-black text-amber-900 dark:text-white">
                      {analyticsData.rubricAnalysis?.structureScorePct || 100}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-center space-y-2">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">الترقيم والإملاء (10%)</span>
                    <span className="text-2xl font-black text-indigo-900 dark:text-white">
                      {analyticsData.rubricAnalysis?.mechanicsScorePct || 100}%
                    </span>
                  </div>
                </div>

                {/* IDENTIFIED WEAKNESSES CHIPS */}
                {Array.isArray(analyticsData.identifiedWeaknesses) && analyticsData.identifiedWeaknesses.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <span className="text-xs font-black text-rose-700 dark:text-rose-400 block">
                      ⚠️ مجالات موصى بالتركيز عليها في جلسات المراجعة القادمة:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.identifiedWeaknesses.map((w: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* COMMON TRANSLATION MISTAKES INSIGHTS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  💡 إرشادات مستر حبيب الرحمن لتفادي أشهر أفخاخ الترجمة:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analyticsData.commonMistakesInsights?.map((pit: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-purple-700 dark:text-purple-300">
                          {pit.rule}
                        </span>
                        <span className="text-[10px] text-slate-400">{pit.frequency}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {pit.adviceAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-bold text-slate-500">جاري تحميل بيانات وتقارير الترجمة...</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 5: ADMIN & TEACHER REVIEW MANAGEMENT */}
      {/* ============================================================== */}
      {activeMainTab === "admin" && (user?.role === "admin" || user?.role === "teacher") && (
        <div className="space-y-8 animate-fadeIn">
          {/* TEACHER REVIEW QUEUE FOR UNCERTAIN / WRITTEN ANSWERS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-amber-500" />
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    قائمة مراجعة إجابات الطلاب (Teacher Review Queue)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  الإجابات التي احتاجت تدقيقاً بشرياً من المستر لضمان حصول الطالب على أعلى تقييم مستحق
                </p>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                {reviewSubmissions.length} إجابات بانتظار الاعتماد
              </span>
            </div>

            {reviewSubmissions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-400">
                ✅ لا توجد إجابات معلقة حالياً. جميع إجابات الطلاب تم تدقيقها وتصحيحها.
              </div>
            ) : (
              <div className="space-y-4">
                {reviewSubmissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          🎓 الطالب: {sub.studentName || sub.studentEmail || "طالب الأكاديمية"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          الدرس: {sub.lessonTitleAr || "درس الترجمة"}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                        التقييم الآلي المبدئي: {sub.score} / {sub.maxMarks}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">النص الأصلي:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{sub.questionText}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">إجابة الطالب:</span>
                        <p className="font-bold text-purple-700 dark:text-purple-300 font-mono">
                          {sub.studentAnswer}
                        </p>
                      </div>
                    </div>

                    {/* TEACHER CONTROLS */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400">الدرجة المعتمدة:</label>
                        <input
                          type="number"
                          defaultValue={sub.score}
                          onChange={(e) =>
                            setTeacherReviewScore({
                              ...teacherReviewScore,
                              [sub.id]: Number(e.target.value),
                            })
                          }
                          className="w-16 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-black text-center"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="أضف تعليقاً تشجيعياً أو توجيهاً لغوياً للطالب..."
                        onChange={(e) =>
                          setTeacherReviewNote({
                            ...teacherReviewNote,
                            [sub.id]: e.target.value,
                          })
                        }
                        className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                      />

                      <button
                        onClick={() => handleApproveTeacherReview(sub.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اعتماد التقييم</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BULK EXCEL / CSV QUESTION IMPORTER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  استيراد الأسئلة الجماعي عبر Excel / CSV (Bulk Importer)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  إدخال سريع لأسئلة الترجمة مع كشف التكرار والتحقق التلقائي من البدائل المقبولة
                </p>
              </div>
            </div>

            {/* TARGET SELECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">اختر المسار المستهدف:</label>
                <select
                  value={selectedTargetModuleId}
                  onChange={(e) => {
                    setSelectedTargetModuleId(e.target.value);
                    const mod = modules.find((m) => m.id === e.target.value);
                    if (mod?.lessons?.length > 0) {
                      setSelectedTargetLessonId(mod.lessons[0].id);
                    }
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">اختر الدرس المستهدف:</label>
                <select
                  value={selectedTargetLessonId}
                  onChange={(e) => setSelectedTargetLessonId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  {modules
                    .find((m) => m.id === selectedTargetModuleId)
                    ?.lessons?.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.titleAr}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* TEXTAREA FOR SPREADSHEET PASTE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 block">
                  الصق أسطر إكسل أو ملف CSV بصيغة الأعمدة:
                </label>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                  السؤال | الخيارات (اختياري) | الإجابة النموذجية | البدائل المقبولة (مفصولة بـ ;) | الدرجة | الصعوبة
                </span>
              </div>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`مثال لصق سطر:\nيجب أن نعتمد على أنفسنا لتحقيق النجاح. | | We must rely on ourselves to achieve success. | We should depend on ourselves to achieve success. | 2 | Medium`}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleBulkImport}
              disabled={importLoading || !importText.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {importLoading ? (
                <span>جاري استيراد الأسئلة والتحقق...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>معالجة واستيراد الأسئلة لبنك الترجمة</span>
                </>
              )}
            </button>

            {/* IMPORT REPORT */}
            {importReport && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم استيراد {importReport.importedCount} أسئلة جديدة بنجاح!</span>
                </div>
                {importReport.duplicateCount > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ تم تخطي {importReport.duplicateCount} أسئلة مكررة لمنع الازدواجية.
                  </div>
                )}
                {importReport.errorCount > 0 && (
                  <div className="text-xs text-rose-600 dark:text-rose-400">
                    ❌ وجد {importReport.errorCount} أخطاء في تنسيق بعض الأسطر.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
