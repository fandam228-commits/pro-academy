"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  Award,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Plus,
  Sparkles,
  Trophy,
  BrainCircuit,
  ShieldCheck,
  Calendar,
  BarChart2,
  Target,
  AlertCircle,
  TrendingDown,
  History,
  RotateCcw,
  FileCheck,
  FileText,
} from "lucide-react";
import { getCurriculumUnits } from "@/config/curriculum-2026";

export const StudentDashboard: React.FC<{
  onSelectCourse?: (courseId: string) => void;
  onOpenReport?: () => void;
  onStartExam?: (exam: any) => void;
  onOpenCurriculum?: (gradeCode?: string) => void;
  onOpenMinistryAssessments?: () => void;
}> = ({ onSelectCourse, onOpenReport, onStartExam, onOpenCurriculum, onOpenMinistryAssessments }) => {
  const { user, lang } = useApp();
  const [plannerTasks, setPlannerTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [mastery, setMastery] = useState<any[]>([]);
  const [masteryLoading, setMasteryLoading] = useState(true);
  const [quickReviewUnit, setQuickReviewUnit] = useState("Units 1 + 2");
  const [quickReviewCount, setQuickReviewCount] = useState(20);
  const [quickReviewLoading, setQuickReviewLoading] = useState(false);
  const [quickReviewError, setQuickReviewError] = useState("");
  const [performance, setPerformance] = useState<any>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const res = await fetch(`/api/student-performance?studentId=${encodeURIComponent(user?.id || "")}`);
        const json = await res.json();
        if (json.success) setPerformance(json);
      } catch {
        setPerformance(null);
      } finally {
        setPerformanceLoading(false);
      }
    };
    if (user?.role === "student") loadPerformance();
  }, [user?.id, user?.role]);

  useEffect(() => {
    const loadMastery = async () => {
      try {
        const res = await fetch("/api/grammar/mastery");
        const json = await res.json();
        setMastery(json.mastery || []);
      } catch {
        setMastery([]);
      } finally {
        setMasteryLoading(false);
      }
    };
    if (user?.role === "student") loadMastery();
  }, [user?.role]);

  const weakestRules = mastery.slice().sort((a, b) => Number(a.masteryPercent) - Number(b.masteryPercent)).slice(0, 4);
  const recommendedRule = weakestRules[0];

  const startQuickReview = async (targetTopic?: string) => {
    setQuickReviewLoading(true);
    setQuickReviewError("");
    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_smart_exam",
          studentId: user?.id,
          stage: "Secondary",
          grade: "First Secondary",
          curriculum: "Ministry",
          term: "First",
          unit: quickReviewUnit === "Units 1 + 2" ? "Unit 1,Unit 2" : quickReviewUnit,
          questionCount: quickReviewCount,
          easyPercent: 30,
          mediumPercent: 50,
          hardPercent: 20,
          grammarRatio: 50,
          topic: targetTopic,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.exam) {
        setQuickReviewError(json.error || (lang === "ar" ? "لم نتمكن من تجهيز المراجعة الآن." : "Could not prepare the review right now."));
        return;
      }
      onStartExam?.(json.exam);
    } catch {
      setQuickReviewError(lang === "ar" ? "حدث خطأ في الاتصال. حاول مرة أخرى." : "Connection error. Please try again.");
    } finally {
      setQuickReviewLoading(false);
    }
  };

  // Fetch Planner Tasks
  const fetchPlanner = async () => {
    try {
      const res = await fetch(`/api/planner?studentId=${user?.id || "usr_student_1"}`);
      const json = await res.json();
      setPlannerTasks(json.tasks || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  // Pomodoro Countdown Effect
  useEffect(() => {
    if (!isPomoRunning) return;
    const interval = setInterval(() => {
      if (pomoSeconds === 0) {
        if (pomoMinutes === 0) {
          setIsPomoRunning(false);
          alert(lang === "ar" ? "انتهت جلسة التركيز المحددة 25 دقيقة! خذ استراحة 5 دقائق ☕" : "Focus session finished! Take a 5 min break ☕");
        } else {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        }
      } else {
        setPomoSeconds(pomoSeconds - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMinutes, pomoSeconds]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          studentId: user?.id || "usr_student_1",
          task: newTask,
        }),
      });
      setNewTask("");
      fetchPlanner();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", taskId, isCompleted: !isCompleted }),
      });
      fetchPlanner();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/40 border border-purple-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider bg-purple-500/30 border border-purple-300/30 px-3 py-1 rounded-full text-sky-200">
            {user?.grade || "Third Secondary (Baccalaureate)"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-3">
            {lang === "ar" ? `أهلاً بك يا ${user?.name || "عمر"}!` : `Welcome back, ${user?.name || "Omar"}!`}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
            {lang === "ar"
              ? "استمر في مشاهدة محاضرات مستر حبيب الرحمن وحل التدريبات اليومية للحفاظ على التتابع والمكافآت."
              : "Keep up your study streak by completing Unit 1 lectures and practicing with Habib AI Tutor."}
          </p>
        </div>

        {/* STATS BADGES */}
        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-purple-400/20">
          <div className="text-center px-3">
            <Flame className="w-6 h-6 text-amber-400 mx-auto mb-1 fill-amber-400" />
            <span className="text-lg font-black text-amber-300">{user?.streak || 12}d</span>
            <span className="text-[10px] block opacity-80">{lang === "ar" ? "تتابع يومي" : "Streak"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <Award className="w-6 h-6 text-sky-300 mx-auto mb-1" />
            <span className="text-lg font-black text-sky-200">{user?.points || 680}</span>
            <span className="text-[10px] block opacity-80">{lang === "ar" ? "نقاط تفوق" : "Points"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <Trophy className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
            <span className="text-lg font-black text-yellow-200">{user?.level || "Upper Int."}</span>
            <span className="text-[10px] block opacity-80">{lang === "ar" ? "المستوى" : "Level"}</span>
          </div>
        </div>
      </div>

      {/* QUICK SMART CURRICULUM ACCESS BANNER */}
      {onOpenCurriculum && (
        <div className="bg-gradient-to-r from-[#12082b] via-[#1f0e47] to-[#0c1326] p-6 rounded-3xl border border-purple-500/30 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {lang === "ar" ? "الهيكل الذكي الجديد" : "Smart Curriculum"}
                </span>
                <span className="text-xs text-purple-200/80 font-bold">6 {lang === "ar" ? "وحدات + مراجعتين + القصة" : "Units & Story"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-1">
                {lang === "ar" ? "متابعة المنهج الدراسي وركن القصة المقررة" : "Resume Curriculum Units & Story Corner"}
              </h3>
              <p className="text-xs text-purple-200/70">
                {lang === "ar"
                  ? "كلمات، قواعد، مهارات كتابة، وفصول الرواية المقررة مع حساب نسبة إنجازك تلقائياً."
                  : "Vocabulary, grammar rules, writing templates, and story chapters with progress tracking."}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenCurriculum()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer shrink-0"
          >
            {lang === "ar" ? "فتح وحدات المنهج الآن ←" : "Open Curriculum Now →"}
          </button>
        </div>
      )}

      {/* OFFICIAL MINISTRY ASSESSMENTS DEDICATED CARD */}
      {onOpenMinistryAssessments && (
        <div className="bg-gradient-to-r from-[#0c1427] via-[#101e38] to-[#0a182e] p-6 rounded-3xl border border-amber-400/30 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm">
                  {lang === "ar" ? "بوابة التقييمات الرسمية 2026/2027" : "Official MOE Assessments 2026/2027"}
                </span>
                <span className="text-xs text-amber-200/90 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === "ar" ? "وزارة التربية والتعليم" : "Ministry of Education"}</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-1 text-white">
                {lang === "ar" ? "تقييمات الوزارة الرسمية (PDF والأداءات الصفية والمنزلية)" : "Official Ministry Performance & Weekly Assessments"}
              </h3>
              <p className="text-xs text-amber-100/75">
                {lang === "ar"
                  ? "تحميل مباشر لتقييمات الأسابيع، الأداءات الصفية والمنزلية، والتقييمات الشهرية المعتمدة لجميع المراحل الإعدادية والثانوية."
                  : "Direct access to official weekly assessments, classroom & homework sheets, and monthly exams."}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenMinistryAssessments()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>{lang === "ar" ? "تصفح وتحميل التقييمات ←" : "Browse Assessments →"}</span>
          </button>
        </div>
      )}

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ENROLLED COURSES & CONTINUE LEARNING */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>{lang === "ar" ? "متابعة التعلم - كورساتي" : "Continue Learning"}</span>
              </h2>
            </div>

            {/* ACTIVE ENROLLED COURSE CARD */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full">
                  Active Enrolled Course
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">
                  Third Secondary Master Class 2026/2027 (Thanawya Amma)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unit 1: Inside the World of Care • Present Perfect Mastery
                </p>

                {/* PROGRESS BAR */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden w-48">
                    <div className="bg-gradient-to-r from-purple-600 to-sky-400 h-full rounded-full w-1/2" />
                  </div>
                  <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">50%</span>
                </div>
              </div>

              <button
                onClick={() => onSelectCourse && onSelectCourse("crs_sec_3")}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 shrink-0 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === "ar" ? "متابعة المحاضرة" : "Resume Lecture"}</span>
              </button>
            </div>
          </div>

          {/* SMART QUICK REVIEW */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-sky-900 rounded-3xl p-6 text-white shadow-2xl border border-purple-500/20">
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/15 border border-white/15 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {lang === "ar" ? "مراجعة ذكية" : "Smart Review"}
                  </span>
                  <h2 className="text-xl font-black mt-3">{lang === "ar" ? "اختبر نفسك الآن 🎯" : "Test Yourself Now 🎯"}</h2>
                  <p className="text-[11px] text-sky-200 mt-1 leading-5">
                    {lang === "ar" ? "امتحان تفاعلي من بنك الأسئلة، والنتيجة والتحليل يظهروا فورًا بعد التسليم." : "An interactive bank exam with instant scoring and feedback."}
                  </p>
                </div>
                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/15 items-center justify-center border border-white/15">
                  <BrainCircuit className="w-6 h-6 text-amber-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mt-5">
                <select
                  value={quickReviewUnit}
                  onChange={(e) => setQuickReviewUnit(e.target.value)}
                  className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                >
                  <option value="Units 1 + 2" className="text-slate-900">{lang === "ar" ? "الوحدتان 1 + 2" : "Units 1 + 2"}</option>
                  {getCurriculumUnits(user?.grade || "Third Secondary").map((u, i) => (
                    <option key={i} value={u.type === "review" ? `Review ${u.orderIndex === 4 ? 1 : 2}` : `Unit ${u.unitNumber}`} className="text-slate-900">
                      {u.type === "review" ? (lang === "ar" ? u.titleAr : u.titleEn) : `Unit ${u.unitNumber}: ${u.titleEn.replace(/^Unit \d+:\s*/, "")}`}
                    </option>
                  ))}
                  <option value="Review 1" className="text-slate-900">{lang === "ar" ? "المراجعة الشاملة الأولى (Units 1–3)" : "Review 1 (Units 1–3)"}</option>
                  <option value="Review 2" className="text-slate-900">{lang === "ar" ? "المراجعة الشاملة الثانية (Units 4–6)" : "Review 2 (Units 4–6)"}</option>
                </select>
                <select
                  value={quickReviewCount}
                  onChange={(e) => setQuickReviewCount(Number(e.target.value))}
                  className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                >
                  <option value={10} className="text-slate-900">10 {lang === "ar" ? "سؤال" : "questions"}</option>
                  <option value={20} className="text-slate-900">20 {lang === "ar" ? "سؤال" : "questions"}</option>
                  <option value={30} className="text-slate-900">30 {lang === "ar" ? "سؤال" : "questions"}</option>
                </select>
                <button
                  onClick={() => startQuickReview()}
                  disabled={quickReviewLoading}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:bg-amber-300 font-black text-xs shadow-lg disabled:opacity-60 transition-all"
                >
                  {quickReviewLoading ? (lang === "ar" ? "جاري التجهيز..." : "Preparing...") : (lang === "ar" ? "ابدأ الآن ▶" : "Start Now ▶")}
                </button>
              </div>

              {quickReviewError && (
                <div className="mt-3 rounded-xl bg-red-500/20 border border-red-200/20 px-3 py-2 text-[10px] font-bold text-red-100">
                  {quickReviewError}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-[9px] font-bold text-sky-200/80">
                <span>✓ {lang === "ar" ? "تصحيح تلقائي" : "Auto grading"}</span>
                <span>✓ {lang === "ar" ? "تحليل الأخطاء" : "Error analysis"}</span>
                <span>✓ {lang === "ar" ? "حفظ النتيجة" : "Result saved"}</span>
              </div>
            </div>
          </div>

          {/* PERFORMANCE HISTORY */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  {lang === "ar" ? "سجل الاختبارات والنتائج" : "Test History & Results"}
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">{lang === "ar" ? "المنصة بتحلل نتائجك وتحدد لك إيه اللي محتاج مراجعة." : "Your results are analyzed to recommend what to review next."}</p>
              </div>
              {performance?.totalExams > 0 && (
                <div className="text-center rounded-xl bg-blue-50 dark:bg-blue-950/30 px-3 py-2">
                  <div className="text-lg font-black text-blue-600">{performance.average}%</div>
                  <div className="text-[9px] font-bold text-slate-500">{lang === "ar" ? "متوسطك" : "Average"}</div>
                </div>
              )}
            </div>

            {performanceLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">جاري تحميل نتائجك...</div>
            ) : !performance?.history?.length ? (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center text-xs font-bold text-slate-500">
                لسه مفيش اختبارات مسجلة. ابدأ المراجعة الذكية فوق 🎯
              </div>
            ) : (
              <div className="space-y-2">
                {performance.history.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">{item.title}</div>
                      <div className="text-[9px] text-slate-400 mt-1">{item.grade} • {new Date(item.submittedAt).toLocaleDateString("ar-EG")}</div>
                    </div>
                    <div className="text-end shrink-0">
                      <div className={`text-base font-black ${item.percentage >= 90 ? "text-emerald-600" : item.percentage >= 60 ? "text-blue-600" : "text-red-600"}`}>{item.percentage}%</div>
                      <div className="text-[9px] font-bold text-slate-400">{item.score} pts • {item.passed ? "ناجح" : "يحتاج مراجعة"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {performance?.weakPoints?.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-amber-800 dark:text-amber-200">
                  <TrendingDown className="w-4 h-4" />
                  {lang === "ar" ? "نقاط محتاجة مراجعة" : "Weak Points"}
                </div>
                <div className="mt-3 space-y-2">
                  {performance.weakPoints.slice(0, 4).map((item: any) => (
                    <div key={item.topic} className="flex items-center justify-between gap-3 text-[10px] font-bold">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{item.topic}</span>
                      <span className={`shrink-0 ${item.percentage < 60 ? "text-red-600" : "text-amber-700"}`}>{item.percentage}%</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => startQuickReview(performance.weakPoints[0]?.topic)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  ابدأ مراجعة جديدة
                </button>
              </div>
            )}
          </div>

          {/* STUDY PLANNER TODO LIST */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>{lang === "ar" ? "مخطط المذاكرة والمهام اليومية" : "Study Planner & Tasks"}</span>
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={lang === "ar" ? "إضافة مهمة مذاكرة جديدة..." : "Add new study task..."}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
              <button
                onClick={handleAddTask}
                className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {plannerTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id, t.isCompleted)}
                  className={`p-3 rounded-2xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                    t.isCompleted
                      ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <span>{t.task}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      t.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-400"
                    }`}
                  >
                    {t.isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POMODORO TIMER & LEADERBOARD BADGES */}
        <div className="space-y-6">
          
          {/* WEEKLY REPORT BUTTON */}
          {onOpenReport && (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl">
              <h2 className="text-sm font-extrabold mb-2 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-300" />
                {lang === "ar" ? "تقريرك الأسبوعي" : "Your Weekly Report"}
              </h2>
              <p className="text-[11px] text-blue-100 mb-3">
                {lang === "ar" ? "ملخص أدائك: حضور، واجبات، درجات، ونصائح المستر." : "Performance summary: attendance, homework, grades & tips."}
              </p>
              <button
                onClick={onOpenReport}
                className="w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 font-extrabold text-xs border border-white/30 transition-all"
              >
                {lang === "ar" ? "عرض التقرير" : "View Report"}
              </button>
            </div>
          )}


          {/* GRAMMAR MASTERY */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              {lang === "ar" ? "إتقان القواعد" : "Grammar Mastery"}
            </h2>
            <p className="text-[10px] text-slate-500 mb-4">{lang === "ar" ? "أضعف القواعد تظهر أولًا عشان تعرف تراجع إيه." : "Your weakest rules appear first."}</p>
            {masteryLoading ? <div className="text-xs text-slate-500 py-4">جاري تحميل مستوى الإتقان...</div> : weakestRules.length === 0 ? (
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 text-xs font-bold text-blue-800 dark:text-blue-200">ابدأ تدريب القواعد، وهنا هنظهر مستوى إتقانك تلقائيًا.</div>
            ) : <div className="space-y-3">{weakestRules.map((r) => <div key={r.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
              <div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="text-xs font-black text-slate-900 dark:text-white truncate">{r.grammarTopic}</div><div className="text-[9px] text-slate-400">{r.grade} • {r.unit}</div></div><div className="text-xs font-black text-blue-600">{r.masteryPercent}%</div></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{width: `${Math.min(100, Math.max(0, Number(r.masteryPercent)))}%`}} /></div>
              <div className="mt-2 flex items-center justify-between gap-2"><div className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><AlertCircle className="w-3 h-3" />{r.status}</div><a href={`/?tab=grammar&grade=${encodeURIComponent(r.grade)}&curriculum=${encodeURIComponent(r.curriculum)}&term=${encodeURIComponent(r.term)}&unit=${encodeURIComponent(r.unit)}&grammarTopic=${encodeURIComponent(r.grammarTopic)}`} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[9px] font-black text-white">راجع القاعدة</a></div>
            </div>)}</div>}
          </div>
          {recommendedRule && Number(recommendedRule.masteryPercent) < 90 && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-sm font-black"><BrainCircuit className="w-4 h-4" />مراجعة مقترحة الآن</div>
              <div className="mt-3 text-base font-black">{recommendedRule.grammarTopic}</div>
              <div className="mt-1 text-[10px] text-amber-50">{recommendedRule.grade} • {recommendedRule.unit} • إتقان {recommendedRule.masteryPercent}%</div>
              <p className="mt-3 text-[10px] leading-5 text-amber-50">ابدأ بفيديو الشرح، وبعده حل 5 أسئلة من نفس القاعدة. المنصة هتسجل النتيجة تلقائيًا.</p>
              <a href={`/?tab=grammar&grade=${encodeURIComponent(recommendedRule.grade)}&curriculum=${encodeURIComponent(recommendedRule.curriculum)}&term=${encodeURIComponent(recommendedRule.term)}&unit=${encodeURIComponent(recommendedRule.unit)}&grammarTopic=${encodeURIComponent(recommendedRule.grammarTopic)}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-black text-orange-700">ابدأ المراجعة →</a>
            </div>
          )}

          {/* POMODORO FOCUS TIMER */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "مؤقت التركيز (Pomodoro Timer)" : "Pomodoro Focus Timer"}</span>
            </h2>

            <div className="text-4xl font-mono font-black text-slate-900 dark:text-white my-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {pomoMinutes < 10 ? `0${pomoMinutes}` : pomoMinutes}:{pomoSeconds < 10 ? `0${pomoSeconds}` : pomoSeconds}
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                  isPomoRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPomoRunning ? (lang === "ar" ? "إيقاف مؤقت" : "Pause") : (lang === "ar" ? "ابدأ المذاكرة" : "Start Focus")}
              </button>

              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoMinutes(25);
                  setPomoSeconds(0);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                {lang === "ar" ? "إعادة ضبط" : "Reset"}
              </button>
            </div>
          </div>

          {/* GAMIFICATION BADGES */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "شارات وإنجازات التفوق" : "My Badges & Achievements"}</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                  🔥
                </div>
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">10-Day Streak</span>
                <span className="text-[9px] text-amber-600 block">Unlocked!</span>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                  🎯
                </div>
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">Quiz Master</span>
                <span className="text-[9px] text-emerald-600 block">90%+ Score</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
