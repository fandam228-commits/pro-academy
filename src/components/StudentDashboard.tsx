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
  Languages,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Compass,
  MessageCircle,
  Share2,
} from "lucide-react";
import { CompactLeaderboardWidget } from "@/components/gamification/CompactLeaderboardWidget";

export interface StudentDashboardProps {
  onSelectCourse?: (courseId: string) => void;
  onOpenReport?: () => void;
  onStartExam?: (exam: any) => void;
  onOpenCurriculum?: (gradeCode?: string) => void;
  onOpenMinistryAssessments?: () => void;
  onOpenTranslation?: () => void;
  onOpenMistakesBank?: () => void;
  onOpenLeaderboard?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectCourse,
  onOpenReport,
  onStartExam,
  onOpenCurriculum,
  onOpenMinistryAssessments,
  onOpenTranslation,
  onOpenMistakesBank,
  onOpenLeaderboard,
}) => {
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
  const [unresolvedMistakes, setUnresolvedMistakes] = useState<number>(0);

  // Fetch mistakes count
  useEffect(() => {
    let isMounted = true;
    async function fetchMistakes() {
      try {
        const res = await fetch("/api/mistakes?limit=1");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.stats?.totalUnresolved !== undefined) {
            setUnresolvedMistakes(data.stats.totalUnresolved);
          }
        }
      } catch {}
    }
    fetchMistakes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch performance
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

  // Fetch grammar mastery
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
  }, [isPomoRunning, pomoMinutes, pomoSeconds, lang]);

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
    <div className="space-y-6 sm:space-y-8">
      
      {/* =========================================================================
          1. HEADER & WELCOME STRIP (CLEAN & RESTFUL)
          Greeting • Grade Pill • Daily Streak • Points • Level
      ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0E1E38] via-[#162744] to-[#1E3A8A] rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-blue-950/20 border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#EABF58] text-[#0E1E38] px-2.5 py-0.5 rounded-full shadow-xs">
              {user?.grade || "Third Secondary (Baccalaureate)"}
            </span>
            <span className="text-xs text-blue-200 font-semibold">
              {lang === "ar" ? "منصة مستر حبيب الرحمن" : "Professional Academy"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === "ar" ? `مرحباً بك يا ${user?.name || "عمر"}!` : `Welcome back, ${user?.name || "Omar"}!`}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            {lang === "ar"
              ? "تابع دروسك اليومية، وحافظ على تتابع المذاكرة واكسب نقاط التميز في امتحانات البنك الذكي."
              : "Continue your daily lectures, maintain your study streak, and climb the weekly leaderboard."}
          </p>
        </div>

        {/* STATS CHIPS */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/15 shrink-0">
          <div className="text-center px-2.5">
            <Flame className="w-5 h-5 text-[#EABF58] mx-auto mb-0.5 fill-[#EABF58]" />
            <span className="text-base font-black text-white">{user?.streak || 12}d</span>
            <span className="text-[10px] block text-blue-200">{lang === "ar" ? "تتابع" : "Streak"}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2.5">
            <Award className="w-5 h-5 text-amber-300 mx-auto mb-0.5" />
            <span className="text-base font-black text-white">{user?.points || 680}</span>
            <span className="text-[10px] block text-blue-200">{lang === "ar" ? "نقاط" : "Points"}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2.5">
            <Trophy className="w-5 h-5 text-[#EABF58] mx-auto mb-0.5" />
            <span className="text-base font-black text-white">{user?.level || "Upper Int."}</span>
            <span className="text-[10px] block text-blue-200">{lang === "ar" ? "المستوى" : "Level"}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SMART WHATSAPP PARENT REPORT BANNER
          1-Click certified weekly parent report dispatch
      ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/80 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
            <MessageCircle className="w-6 h-6 fill-current" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <span>{lang === "ar" ? "تقرير المتابعة الأسبوعي المعتمد" : "Certified Parent Progress Report"}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {lang === "ar"
                ? "شارك تفوقك والتزامك الدراسي مع ولي أمرك على واتساب"
                : "Share your study progress & quiz mastery with your parents"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "ar"
                ? "تقرير رقمي معتمد يتضمن درجاتك، نسبة حضورك، الأسئلة المعالجة ببنك الأخطاء، مع توجيهات مستر حبيب التربوية."
                : "A certified summary with attendance, quiz averages, mistakes bank stats, and teacher feedback."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              {lang === "ar" ? "معاينة التقرير الكامل" : "View Full Report"}
            </button>
          )}
          <button
            onClick={() => onOpenReport?.()}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{lang === "ar" ? "إرسال لواتساب 📲" : "Send WhatsApp 📲"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. PRIORITY 1: CONTINUE LEARNING (متابعة التعلم)
          Direct access to current enrolled course, unit, and resume button
      ========================================================================= */}
      <section aria-label="متابعة التعلم">
        <div className="bg-white dark:bg-[#0D1829] rounded-3xl p-6 border border-blue-100 dark:border-slate-800 shadow-md shadow-blue-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0E1E38] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
              <span>{lang === "ar" ? "1. متابعة التعلم — المحاضرة الحالية" : "1. Continue Learning"}</span>
            </h2>
            {onOpenCurriculum && (
              <button
                onClick={() => onOpenCurriculum()}
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === "ar" ? "وحدات المنهج وركن القصة" : "Curriculum & Novel"}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-[#2563EB] bg-[#E8F3FF] dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full inline-block">
                Active Enrolled Course
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-[#0E1E38] dark:text-white truncate">
                {user?.grade ? `كورس ${user.grade} 2026/2027` : "Third Secondary Master Class 2026/2027 (Thanawya Amma)"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Unit 1: Inside the World of Care • Present Perfect & Past Simple Mastery
              </p>

              {/* Progress Bar */}
              <div className="pt-1 flex items-center gap-3">
                <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2563EB] to-sky-400 h-full rounded-full w-1/2" />
                </div>
                <span className="text-xs font-mono font-black text-[#2563EB] dark:text-sky-400">50% مكتمل</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => onSelectCourse && onSelectCourse("crs_sec_3")}
                className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === "ar" ? "متابعة المحاضرة الآن" : "Resume Lecture"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. PRIORITY 3 & 4: EXAMS & MISTAKES BANK (التدريب وبنك الأخطاء)
          Grid layout with 2 focused columns
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN 1: SMART EXAM GENERATOR (اختبر نفسك الآن) */}
        <section className="bg-white dark:bg-[#0D1829] rounded-3xl p-6 border border-blue-100 dark:border-slate-800 shadow-md shadow-blue-900/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#0E1E38] dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#EABF58]" />
                <span>{lang === "ar" ? "2. التدريب والامتحانات السريعة" : "2. Practice & Quick Exams"}</span>
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E8F3FF] text-[#2563EB]">
                Smart Shuffle
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "ar"
                ? "اختر الوحدة وعدد الأسئلة لتوليد امتحان فوري مخصص من بنك الأسئلة مع تصحيح ذكي وشرح فوري."
                : "Select unit and question count for instant customized practice with explanations."}
            </p>

            {/* Quick exam selectors */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {lang === "ar" ? "الوحدة المستهدفة:" : "Target Unit:"}
                </label>
                <select
                  value={quickReviewUnit}
                  onChange={(e) => setQuickReviewUnit(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0E1E38] dark:text-white"
                >
                  <option value="Units 1 + 2">Units 1 + 2 (شامل)</option>
                  <option value="Unit 1">Unit 1: Inside the World of Care</option>
                  <option value="Unit 2">Unit 2: Past Events & Narratives</option>
                  <option value="Unit 3">Unit 3: Science & Innovation</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  {lang === "ar" ? "عدد الأسئلة:" : "Question Count:"}
                </label>
                <div className="flex items-center gap-1.5">
                  {[10, 20, 30].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuickReviewCount(cnt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        quickReviewCount === cnt
                          ? "bg-[#2563EB] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {quickReviewError && (
              <p className="text-xs text-red-500 font-bold">{quickReviewError}</p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => startQuickReview()}
              disabled={quickReviewLoading}
              className="w-full sm:flex-1 py-3 rounded-2xl bg-[#0E1E38] hover:bg-[#162744] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#EABF58]/40"
            >
              <Target className="w-4 h-4 text-[#EABF58]" />
              <span>{quickReviewLoading ? "جاري تجهيز الامتحان..." : (lang === "ar" ? "توليد وبدء الامتحان الآن ←" : "Start Exam Now →")}</span>
            </button>

            {onOpenMinistryAssessments && (
              <button
                onClick={() => onOpenMinistryAssessments()}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#0E1E38] border border-amber-300 font-bold text-xs transition cursor-pointer"
                title="تقييمات الوزارة"
              >
                {lang === "ar" ? "تقييمات الوزارة" : "Ministry Sheets"}
              </button>
            )}
          </div>
        </section>

        {/* COLUMN 2: SMART MISTAKES BANK (بنك أخطائي الذكي) */}
        <section className="bg-white dark:bg-[#0D1829] rounded-3xl p-6 border border-amber-200/80 dark:border-amber-500/30 shadow-md shadow-amber-900/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#0E1E38] dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>{lang === "ar" ? "3. بنك أخطائي الذكي والمراجعة" : "3. Mistakes Bank & Revision"}</span>
              </h2>
              {unresolvedMistakes > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 text-[10px] font-black animate-pulse">
                  {unresolvedMistakes} أخطاء غير معالجة
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                  مكتمل 100%
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "ar"
                ? "يتم تجميع كل سؤال تجيب عليه بشكل غير دقيق في الكويزات هنا فوراً. تدرب عليه مجدداً حتى تتقنه ويتم حذفه تلقائياً."
                : "Every wrong answer from quizzes is logged here. Review and master them to clear your bank!"}
            </p>

            {/* Quick summary box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black text-lg">
                  {unresolvedMistakes}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0E1E38] dark:text-white block">
                    {lang === "ar" ? "الأسئلة بانتظار الإتقان" : "Questions to Master"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {unresolvedMistakes > 0
                      ? (lang === "ar" ? "نقاط XP إضافية عند تصفير البنك" : "Bonus XP on bank clearance")
                      : (lang === "ar" ? "رائع! بنك أخطائك نظيف تماماً 🎉" : "Great job! Zero mistakes pending")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenMistakesBank ? onOpenMistakesBank() : undefined}
              className="w-full py-3 rounded-2xl bg-[#EABF58] hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-950" />
              <span>{lang === "ar" ? "فتح بنك أخطائي ومراجعة الأسئلة الآن ←" : "Open Mistakes Bank & Review Now →"}</span>
            </button>
          </div>
        </section>

      </div>

      {/* =========================================================================
          4. PRIORITY 5: LEARNING PROGRESS, FOCUS & LEADERBOARD
          Tasks Planner • Pomodoro Focus • Top-5 Leaderboard
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TASKS PLANNER (خطة المذاكرة) */}
        <div className="bg-white dark:bg-[#0D1829] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <span>{lang === "ar" ? "خطة المذاكرة اليومية" : "Study Planner"}</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{plannerTasks.length} مهام</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder={lang === "ar" ? "أضف مهمة... (مثال: مراجعة كلمات Unit 2)" : "Add task..."}
              className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0E1E38] dark:text-white"
            />
            <button
              onClick={handleAddTask}
              className="p-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition cursor-pointer"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
            {plannerTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {lang === "ar" ? "لا توجد مهام اليوم. خطط ليومك الآن!" : "No tasks scheduled for today."}
              </p>
            ) : (
              plannerTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id, t.isCompleted)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    t.isCompleted
                      ? "bg-slate-50 dark:bg-slate-800/40 text-slate-400 line-through border-slate-100 dark:border-slate-800"
                      : "bg-white dark:bg-slate-800 text-[#0E1E38] dark:text-white border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="truncate">{t.task}</span>
                  <CheckCircle className={`w-4 h-4 shrink-0 ${t.isCompleted ? "text-emerald-500" : "text-slate-300"}`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* POMODORO FOCUS TIMER (مؤقت التركيز 25 دقيقة) */}
        <div className="bg-white dark:bg-[#0D1829] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>{lang === "ar" ? "مؤقت التركيز (Pomodoro)" : "Focus Timer"}</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">25 دقيقة مذاكرة</span>
          </div>

          <div className="text-center py-2">
            <div className="font-mono font-black text-3xl sm:text-4xl text-[#0E1E38] dark:text-white tracking-widest">
              {String(pomoMinutes).padStart(2, "0")}:{String(pomoSeconds).padStart(2, "0")}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isPomoRunning
                ? (lang === "ar" ? "جلسة التركيز جارية... ركز في المذاكرة" : "Focus session running...")
                : (lang === "ar" ? "جاهز للبدء؟ خذ جلسة تركيز خالية من التشتيت" : "Ready to focus?")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPomoRunning(!isPomoRunning)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                isPomoRunning
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
              }`}
            >
              {isPomoRunning ? (lang === "ar" ? "إيقاف مؤقت" : "Pause") : (lang === "ar" ? "ابدأ التركيز (25د)" : "Start")}
            </button>
            <button
              onClick={() => {
                setIsPomoRunning(false);
                setPomoMinutes(25);
                setPomoSeconds(0);
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              {lang === "ar" ? "إعادة ضبط" : "Reset"}
            </button>
          </div>
        </div>

        {/* TOP-5 WEEKLY LEADERBOARD WIDGET */}
        <div className="bg-white dark:bg-[#0D1829] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#EABF58]" />
              <span>{lang === "ar" ? "أوائل الأسبوع (XP)" : "Weekly Top 5"}</span>
            </h3>
            {onOpenLeaderboard && (
              <button
                onClick={() => onOpenLeaderboard()}
                className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                {lang === "ar" ? "الكل ←" : "All →"}
              </button>
            )}
          </div>

          <CompactLeaderboardWidget onOpenLeaderboard={() => onOpenLeaderboard?.()} />
        </div>

      </div>

    </div>
  );
};
