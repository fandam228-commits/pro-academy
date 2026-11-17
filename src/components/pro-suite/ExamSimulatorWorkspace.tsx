"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Share2,
  FileText,
  Bookmark,
  Send,
  Eye,
  Check,
} from "lucide-react";

interface ExamSimulatorProps {
  onNavigateHome?: () => void;
}

export const ExamSimulatorWorkspace: React.FC<ExamSimulatorProps> = ({ onNavigateHome }) => {
  const { user } = useApp();
  const [exam, setExam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Active section: 'mcq' | 'passage' | 'translation' | 'novel' | 'essay'
  const [activeSection, setActiveSection] = useState<"mcq" | "passage" | "translation" | "novel" | "essay">("mcq");

  // Answers & flags
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Timer State (default 180 minutes = 10800 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(10800);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Submission & Diagnostic Report
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<any | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // 1. Fetch Exam
  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        const res = await fetch("/api/exam-simulator/exams?grade_level=3rd_sec");
        const data = await res.json();
        if (data.success && Array.isArray(data.exams) && data.exams.length > 0) {
          const loadedExam = data.exams[0];
          setExam(loadedExam);
          setSecondsRemaining((loadedExam.durationMinutes || 180) * 60);

          // Restore from localStorage if exists
          try {
            const saved = localStorage.getItem(`pro_exam_${loadedExam.id}`);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.answers) setAnswers(parsed.answers);
              if (parsed.flags) setFlaggedQuestions(parsed.flags);
              if (parsed.remaining) setSecondsRemaining(parsed.remaining);
            }
          } catch {}

          setIsTimerRunning(true);
        }
      } catch (err) {
        console.error("Load mock exam error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, []);

  // 2. Timer Countdown Effect
  useEffect(() => {
    if (!isTimerRunning || !exam || diagnosticReport) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, exam, diagnosticReport]);

  // 3. Auto-save every 15s
  useEffect(() => {
    if (!exam || diagnosticReport) return;
    const interval = setInterval(() => {
      try {
        localStorage.setItem(
          `pro_exam_${exam.id}`,
          JSON.stringify({
            answers,
            flags: flaggedQuestions,
            remaining: secondsRemaining,
            updatedAt: Date.now(),
          })
        );
      } catch {}
    }, 15000);

    return () => clearInterval(interval);
  }, [exam, answers, flaggedQuestions, secondsRemaining, diagnosticReport]);

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSelectAnswer = (qId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  // Submit Exam
  const handleSubmitExam = async () => {
    if (!exam) return;
    try {
      setIsSubmitting(true);
      setShowConfirmSubmit(false);
      const totalExamSeconds = (exam.durationMinutes || 180) * 60;
      const timeSpent = Math.max(totalExamSeconds - secondsRemaining, 60);

      const res = await fetch("/api/exam-simulator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          timeSpentSeconds: timeSpent,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDiagnosticReport(data);
        setIsTimerRunning(false);
        try {
          localStorage.removeItem(`pro_exam_${exam.id}`);
        } catch {}
      }
    } catch (err) {
      console.error("Submit exam error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Timer formatting
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isTimeCritical = secondsRemaining <= 600; // Under 10 mins

  // Flatten all questions for Question Palette Grid
  const allQuestionsList: Array<{ id: string; num: number; section: "mcq" | "passage" | "translation" | "novel" | "essay" }> = [];
  if (exam?.sections) {
    exam.sections.mcq?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "mcq" })
    );
    exam.sections.passage?.questions?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "passage" })
    );
    exam.sections.translation?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "translation" })
    );
    exam.sections.novel?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "novel" })
    );
    if (exam.sections.essay) {
      allQuestionsList.push({ id: "essay_answer", num: 10, section: "essay" });
    }
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim().length > 0).length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. STICKY TOP TIMER & CONTROLS HEADER */}
      <div className="sticky top-2 z-30 bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl border border-blue-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1">
              {exam?.title || "محاكي امتحان الثانوية العامة الشامل"}
            </h2>
            <p className="text-[11px] text-slate-400">
              تم الإجابة عن {answeredCount} من {allQuestionsList.length} سؤالاً
            </p>
          </div>
        </div>

        {/* TIMER DISPLAY */}
        {!diagnosticReport && (
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-mono text-base sm:text-lg font-black transition-all ${
                isTimeCritical
                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse"
                  : "bg-slate-800 border border-slate-700 text-amber-300"
              }`}
              dir="ltr"
            >
              <Clock className="w-4 h-4" />
              <span>{timerStr}</span>
            </div>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إنهاء وتسليم الامتحان</span>
            </button>
          </div>
        )}

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <span>خروج</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. POST-EXAM DIAGNOSTIC REPORT */}
      {diagnosticReport ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              تقرير النتيجة والتشخيص الأكاديمي
            </h3>
            <p className="text-xs text-slate-500">
              تم تصحيح جميع الأقسام ومطابقتها مع معايير تصحيح الثانوية العامة 2026/2027.
            </p>
          </div>

          {/* TOTAL SCORE BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-center">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">الدرجة الإجمالية</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {diagnosticReport.totalScore} / {diagnosticReport.maxScore}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-center">
              <p className="text-xs font-bold text-emerald-600">النسبة المئوية</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{diagnosticReport.percentage}%</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-center">
              <p className="text-xs font-bold text-amber-600">النقاط المكتسبة</p>
              <p className="text-3xl font-black text-amber-500 mt-1">+{diagnosticReport.xpAwarded} XP</p>
            </div>
          </div>

          {/* AUTO-LOGGED MISTAKES NOTICE */}
          {diagnosticReport.mistakesLoggedCount > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>
                  تم رصد وتوجيه <strong>{diagnosticReport.mistakesLoggedCount} أسئلة غير صحيحة</strong> تلقائياً إلى بنك أخطائك الذكي لتدريبك عليها حتى إتقانها تماماً.
                </span>
              </div>
            </div>
          )}

          {/* SECTION BREAKDOWN */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">تفاصيل درجات الأقسام:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">الاختياري (MCQ)</p>
                <p className="font-black text-sm text-slate-900 dark:text-white mt-1">
                  {diagnosticReport.sectionBreakdown?.mcq?.score} / {diagnosticReport.sectionBreakdown?.mcq?.max}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">قطعة الفهم</p>
                <p className="font-black text-sm text-slate-900 dark:text-white mt-1">
                  {diagnosticReport.sectionBreakdown?.passage?.score} / {diagnosticReport.sectionBreakdown?.passage?.max}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">الترجمة</p>
                <p className="font-black text-sm text-slate-900 dark:text-white mt-1">
                  {diagnosticReport.sectionBreakdown?.translation?.score} / {diagnosticReport.sectionBreakdown?.translation?.max}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">القصة الأدبية</p>
                <p className="font-black text-sm text-slate-900 dark:text-white mt-1">
                  {diagnosticReport.sectionBreakdown?.novel?.score} / {diagnosticReport.sectionBreakdown?.novel?.max}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">المقال التحريري</p>
                <p className="font-black text-sm text-slate-900 dark:text-white mt-1">
                  {diagnosticReport.sectionBreakdown?.essay?.score} / {diagnosticReport.sectionBreakdown?.essay?.max}
                </p>
              </div>
            </div>
          </div>

          {/* SHARE ON WHATSAPP BUTTON FOR PARENTS */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(diagnosticReport.parentShareText || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة النتيجة مع ولي الأمر عبر واتساب 📲</span>
            </a>

            <button
              onClick={() => {
                setDiagnosticReport(null);
                setAnswers({});
                setFlaggedQuestions({});
                setSecondsRemaining((exam?.durationMinutes || 180) * 60);
                setIsTimerRunning(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              إعادة خوض الامتحان التجريبي
            </button>
          </div>
        </div>
      ) : (
        /* 3. ACTIVE EXAM RUNNER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 9 COLS: SECTION TABS & QUESTIONS */}
          <div className="lg:col-span-9 space-y-4">
            {/* SECTION SWITCHER TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
              <button
                onClick={() => setActiveSection("mcq")}
                className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "mcq"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>الاختياري (MCQ)</span>
              </button>

              <button
                onClick={() => setActiveSection("passage")}
                className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "passage"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>قطعة الفهم (Reading)</span>
              </button>

              <button
                onClick={() => setActiveSection("translation")}
                className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "translation"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>الترجمة (Translation)</span>
              </button>

              <button
                onClick={() => setActiveSection("novel")}
                className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "novel"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>القصة (Great Expectations)</span>
              </button>

              <button
                onClick={() => setActiveSection("essay")}
                className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "essay"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>المقال (Writing)</span>
              </button>
            </div>

            {/* SECTION 1: MCQ QUESTIONS */}
            {activeSection === "mcq" && (
              <div className="space-y-4">
                {exam?.sections?.mcq?.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600 dark:text-blue-400">سؤال {q.number} ({q.points || 1} درجة)</span>
                      <button
                        type="button"
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition cursor-pointer ${
                          flaggedQuestions[q.id]
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black border border-amber-300"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{flaggedQuestions[q.id] ? "تم التمييز للمراجعة 🚩" : "مراجعة لاحقاً"}</span>
                      </button>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white" dir="ltr">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" dir="ltr">
                      {q.options?.map((opt: string, i: number) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-3.5 rounded-2xl text-left text-xs font-medium transition flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span>
                              <strong className="mr-2">{String.fromCharCode(65 + i)}.</strong>
                              {opt}
                            </span>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 2: PASSAGE */}
            {activeSection === "passage" && exam?.sections?.passage && (
              <div className="space-y-4">
                {/* PASSAGE TEXT BOX */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 leading-relaxed text-sm font-sans" dir="ltr">
                  <h4 className="font-black text-slate-900 dark:text-white text-base">
                    {exam.sections.passage.title}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300">{exam.sections.passage.text}</p>
                </div>

                {/* PASSAGE QUESTIONS */}
                {exam.sections.passage.questions?.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600 dark:text-blue-400">سؤال القطعة {q.number} ({q.points || 2} درجة)</span>
                      <button
                        type="button"
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition cursor-pointer ${
                          flaggedQuestions[q.id]
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black border border-amber-300"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{flaggedQuestions[q.id] ? "تم التمييز للمراجعة 🚩" : "مراجعة لاحقاً"}</span>
                      </button>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
                      {q.question}
                    </p>

                    <div className="space-y-2" dir="ltr">
                      {q.options?.map((opt: string, i: number) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full p-3.5 rounded-2xl text-left text-xs font-medium transition flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span>
                              <strong className="mr-2">{String.fromCharCode(65 + i)}.</strong>
                              {opt}
                            </span>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 3: TRANSLATION */}
            {activeSection === "translation" && (
              <div className="space-y-4">
                {exam?.sections?.translation?.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600 dark:text-blue-400">
                        سؤال الترجمة {q.number} ({q.direction === "en_to_ar" ? "English ➔ Arabic" : "Arabic ➔ English"})
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition cursor-pointer ${
                          flaggedQuestions[q.id]
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black border border-amber-300"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{flaggedQuestions[q.id] ? "تم التمييز للمراجعة 🚩" : "مراجعة لاحقاً"}</span>
                      </button>
                    </div>

                    <div
                      className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 font-bold text-sm text-slate-900 dark:text-white"
                      dir={q.direction === "en_to_ar" ? "ltr" : "rtl"}
                    >
                      {q.sourceText}
                    </div>

                    <div className="space-y-2">
                      {q.options?.map((opt: string, i: number) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full p-3.5 rounded-2xl text-right text-xs font-medium transition flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                            dir={q.direction === "en_to_ar" ? "rtl" : "ltr"}
                          >
                            <span>
                              <strong className="ml-2 font-mono">{String.fromCharCode(65 + i)})</strong>
                              {opt}
                            </span>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 4: NOVEL */}
            {activeSection === "novel" && (
              <div className="space-y-4">
                {exam?.sections?.novel?.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600 dark:text-blue-400">سؤال القصة {q.number} (Critical Thinking)</span>
                      <button
                        type="button"
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition cursor-pointer ${
                          flaggedQuestions[q.id]
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black border border-amber-300"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{flaggedQuestions[q.id] ? "تم التمييز للمراجعة 🚩" : "مراجعة لاحقاً"}</span>
                      </button>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
                      {q.questionEn}
                    </p>

                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                      placeholder="Write your critical thinking answer in English..."
                      rows={4}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-sans focus:outline-none focus:ring-2 focus:ring-blue-600"
                      dir="ltr"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 5: ESSAY */}
            {activeSection === "essay" && exam?.sections?.essay && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-600 dark:text-blue-400">قسم المقال (4 درجات)</span>
                  <span className="text-slate-400">{exam.sections.essay.minWords} كلمة على الأقل</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
                    {exam.sections.essay.promptEn}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">{exam.sections.essay.promptAr}</p>
                </div>

                <textarea
                  value={answers["essay_answer"] || ""}
                  onChange={(e) => handleSelectAnswer("essay_answer", e.target.value)}
                  placeholder="Type your essay draft here..."
                  rows={10}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-sans focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {/* RIGHT 3 COLS: QUESTION PALETTE GRID */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white">لوحة التنقل والأسئلة (Question Palette)</h3>

              {/* PALETTE LEGEND */}
              <div className="space-y-1.5 text-[11px] font-bold text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                  <span>مُجاب عنه ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-amber-400" />
                  <span>مميز للمراجعة 🚩 ({Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <span>غير مُجاب ({allQuestionsList.length - answeredCount})</span>
                </div>
              </div>

              {/* PALETTE BUTTONS GRID */}
              <div className="grid grid-cols-4 gap-2">
                {allQuestionsList.map((q) => {
                  const isAnswered = answers[q.id] && answers[q.id].trim().length > 0;
                  const isFlagged = flaggedQuestions[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveSection(q.section);
                        const el = document.getElementById(`q_${q.id}`);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`h-9 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center relative ${
                        isFlagged
                          ? "bg-amber-400 text-slate-950 font-black shadow-sm ring-2 ring-amber-400"
                          : isAnswered
                          ? "bg-emerald-500 text-white font-black"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      <span>{q.num}</span>
                      {isFlagged && <span className="absolute -top-1 -right-1 text-[10px]">🚩</span>}
                    </button>
                  );
                })}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full mt-4 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسليم الامتحان الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SUBMIT MODAL */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              هل أنت متأكد من تسليم الامتحان؟
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              أجبت عن <strong>{answeredCount} من {allQuestionsList.length} سؤالاً</strong>.
              {allQuestionsList.length - answeredCount > 0 && (
                <span className="text-rose-500 block mt-1">
                  لديك {allQuestionsList.length - answeredCount} أسئلة لم تقم بالإجابة عنها بعد!
                </span>
              )}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                {isSubmitting ? "جاري التصحيح..." : "نعم، سلّم الامتحان"}
              </button>
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                متابعة الحل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
