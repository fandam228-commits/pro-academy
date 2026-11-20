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
  Layers,
  HeartHandshake,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { MASTER_MOCK_EXAMS_REGISTRY } from "@/data/exam-simulator-catalog.ts";

interface ExamSimulatorProps {
  onNavigateHome?: () => void;
  onOpenMistakesBank?: () => void;
}

export const ExamSimulatorWorkspace: React.FC<ExamSimulatorProps> = ({
  onNavigateHome,
  onOpenMistakesBank,
}) => {
  const { user } = useApp();
  const [examsList, setExamsList] = useState<any[]>(MASTER_MOCK_EXAMS_REGISTRY);
  const [selectedExamId, setSelectedExamId] = useState<string>("mock_sec3_national_1");
  const [exam, setExam] = useState<any | null>(MASTER_MOCK_EXAMS_REGISTRY[0]);
  const [loading, setLoading] = useState(false);

  // Active section: 'mcq' | 'passage' | 'translation' | 'novel' | 'essay'
  const [activeSection, setActiveSection] = useState<"mcq" | "passage" | "translation" | "novel" | "essay">("mcq");

  // Answers & flags
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Digital Bubble Sheet Toggle
  const [showBubbleSheet, setShowBubbleSheet] = useState(false);

  // Timer State (default 180 minutes = 10800 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(10800);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Submission & Diagnostic Report
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<any | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // 1. Fetch Exams List
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch("/api/exam-simulator/exams?grade_level=all");
        const data = await res.json();
        if (data.success && Array.isArray(data.exams) && data.exams.length > 0) {
          setExamsList(data.exams);
        }
      } catch (err) {
        console.warn("Using fallback mock exams registry:", err);
      }
    }
    loadExams();
  }, []);

  // 2. Select Exam & Restore Progress
  const handleSelectExam = (examId: string) => {
    const found = examsList.find((e) => e.id === examId) || examsList[0];
    setSelectedExamId(examId);
    setExam(found);
    setAnswers({});
    setFlaggedQuestions({});
    setDiagnosticReport(null);
    setSecondsRemaining((found.durationMinutes || 180) * 60);
    setIsTimerRunning(true);
    setActiveSection("mcq");

    // Check localStorage
    try {
      const saved = localStorage.getItem(`pro_exam_${found.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.flags) setFlaggedQuestions(parsed.flags);
        if (parsed.remaining) setSecondsRemaining(parsed.remaining);
      }
    } catch {}
  };

  // 3. Timer Countdown Effect
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

  // 4. Auto-save every 15s
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
        setShowBubbleSheet(false);
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

  // Flatten all questions for Question Palette Grid and Bubble Sheet
  const allQuestionsList: Array<{
    id: string;
    num: number;
    section: "mcq" | "passage" | "translation" | "novel" | "essay";
    options?: string[];
  }> = [];

  if (exam?.sections) {
    exam.sections.mcq?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "mcq", options: q.options })
    );
    exam.sections.passage?.questions?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "passage", options: q.options })
    );
    exam.sections.translation?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "translation", options: q.options })
    );
    exam.sections.novel?.forEach((q: any) =>
      allQuestionsList.push({ id: q.id, num: q.number, section: "novel" })
    );
    if (exam.sections.essay) {
      allQuestionsList.push({ id: "essay_answer", num: allQuestionsList.length + 1, section: "essay" });
    }
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim().length > 0).length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. STICKY TOP TIMER & CONTROLS HEADER */}
      <div className="sticky top-2 z-30 bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl border border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                {exam?.gradeLabelAr || "محاكاة الوزارة الرسمية 2026/2027"}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1 mt-0.5">
              {exam?.title || "محاكي امتحان الثانوية العامة الشامل"}
            </h2>
            <p className="text-[11px] text-slate-400">
              تم الإجابة عن {answeredCount} من {allQuestionsList.length} سؤالاً
            </p>
          </div>
        </div>

        {/* TIMER & CONTROLS */}
        {!diagnosticReport && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Bubble Sheet Toggle Button */}
            <button
              onClick={() => setShowBubbleSheet((prev) => !prev)}
              className={`px-3.5 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 border ${
                showBubbleSheet
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20"
                  : "bg-white/10 hover:bg-white/15 text-white border-white/10"
              }`}
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{showBubbleSheet ? "إخفاء البابل شيت 📝" : "ورقة البابل شيت 📝"}</span>
            </button>

            {/* Countdown Timer */}
            <div
              className={`px-3.5 py-2 rounded-2xl flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black transition-all ${
                isTimeCritical
                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse"
                  : "bg-slate-800 border border-slate-700 text-amber-300"
              }`}
              dir="ltr"
            >
              <Clock className="w-4 h-4" />
              <span>{timerStr}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إنهاء وتسليم</span>
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

      {/* 1B. EXAM SELECTION PILLS (When not submitted) */}
      {!diagnosticReport && (
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x whitespace-nowrap max-w-full select-none"
          style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
        >
          <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">اختر الامتحان:</span>
          {examsList.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExam(ex.id)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                exam?.id === ex.id
                  ? "bg-blue-600 text-white border-blue-500 shadow-md font-black"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <span>{ex.title}</span>
              <span className="text-[10px] opacity-75 mr-1.5">({ex.durationMinutes} دقيقة)</span>
            </button>
          ))}
        </div>
      )}

      {/* 2. PEDAGOGICAL REASSURANCE & EXAM ANXIETY REDUCER */}
      {!diagnosticReport && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 text-white flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 text-xl shadow">
            ✨
          </div>
          <div className="text-xs space-y-0.5">
            <span className="font-black text-amber-300 block">
              همسة طمأنة وتوجيه بيداغوجي من مستر حبيب الرحمن:
            </span>
            <p className="text-slate-200 leading-relaxed">
              توكل على الله واقرأ رأس كل سؤال بتركيز وهدوء. هذا الامتحان مصمم بدقة ليحاكي ورقة الامتحان الوزاري الرسمية لكسر رهبة ليلة الامتحان وتعزيز ثقتك بنفسك. كل فكرة هنا دربناك عليها سابقاً في المنصة!
            </p>
          </div>
        </div>
      )}

      {/* 2B. DIGITAL BUBBLE SHEET INTERACTIVE PANEL */}
      {showBubbleSheet && !diagnosticReport && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-400/50 shadow-2xl space-y-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                ورقة الإجابة الرقمية (Digital Bubble Sheet) — تظليل الدوائر الإلكتروني
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              انقر على الدائرة (A, B, C, D) للتظليل الفوري
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {allQuestionsList
              .filter((q) => Array.isArray(q.options) && q.options.length > 0)
              .map((q) => {
                const selectedVal = answers[q.id];
                const letters = ["A", "B", "C", "D"];

                return (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-black text-xs text-slate-700 dark:text-slate-300 w-7">
                      Q{q.num}
                    </span>

                    <div className="flex items-center gap-1.5" dir="ltr">
                      {q.options!.map((opt, optIdx) => {
                        const isSelected = selectedVal === opt;
                        const letter = letters[optIdx] || String(optIdx + 1);

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-7 h-7 rounded-full text-[11px] font-black transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-105"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-blue-400"
                            }`}
                            title={opt}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. POST-EXAM DIAGNOSTIC REPORT */}
      {diagnosticReport ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              تقرير النتيجة والتشخيص الأكاديمي الشامل
            </h3>
            <p className="text-xs text-slate-500">
              تم تصحيح جميع الأقسام ومطابقتها مع معايير تصحيح الامتحانات الرسمية 2026/2027.
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

          {/* AUTO-LOGGED MISTAKES NOTICE & CTA */}
          {diagnosticReport.mistakesLoggedCount > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  تم رصد وتوجيه <strong>{diagnosticReport.mistakesLoggedCount} أسئلة غير صحيحة</strong> تلقائياً إلى بنك أخطائك الذكي لتدريبك عليها حتى إتقانها تماماً.
                </span>
              </div>

              {onOpenMistakesBank && (
                <button
                  onClick={onOpenMistakesBank}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-500 transition cursor-pointer shrink-0"
                >
                  فتح بنك أخطائي 🎯
                </button>
              )}
            </div>
          )}

          {/* SECTION BREAKDOWN */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              تفصيل الدرجات حسب مهارات المنهج:
            </h4>

            <div className="space-y-2 text-xs">
              {diagnosticReport.sectionBreakdown &&
                Object.entries(diagnosticReport.sectionBreakdown).map(([secKey, val]: [string, any]) => {
                  const labelMap: Record<string, string> = {
                    mcq: "أسئلة الاختيار من متعدد (قواعد ومفردات ومهارات)",
                    passage: "قطعة الفهم والقراءة التحررية (Reading)",
                    translation: "الترجمة المقالية والموضوعية (Translation)",
                    novel: "أسئلة القصة الأدبية والتفكير النقدي (Novel)",
                    essay: "كتابة المقال والموضوع الإنشائي (Essay)",
                  };
                  const pct = Math.round((val.score / (val.max || 1)) * 100);

                  return (
                    <div
                      key={secKey}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white">{labelMap[secKey] || secKey}</span>
                        <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {val.score} / {val.max} ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* POST-EXAM ACTIONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(diagnosticReport.parentShareText || "نتيجة الامتحان التجريبي")}`}
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
        /* 4. ACTIVE EXAM RUNNER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 9 COLS: SECTION TABS & QUESTIONS */}
          <div className="lg:col-span-9 space-y-4">
            {/* SECTION SWITCHER TABS */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none touch-pan-x whitespace-nowrap max-w-full select-none"
              style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
            >
              <button
                onClick={() => setActiveSection("mcq")}
                className={`shrink-0 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "mcq"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>الاختياري (MCQ)</span>
              </button>

              <button
                onClick={() => setActiveSection("passage")}
                className={`shrink-0 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "passage"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>قطعة الفهم (Reading)</span>
              </button>

              <button
                onClick={() => setActiveSection("translation")}
                className={`shrink-0 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "translation"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>الترجمة (Translation)</span>
              </button>

              {exam?.sections?.novel && exam.sections.novel.length > 0 && (
                <button
                  onClick={() => setActiveSection("novel")}
                  className={`shrink-0 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "novel"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span>القصة (Novel)</span>
                </button>
              )}

              {exam?.sections?.essay && (
                <button
                  onClick={() => setActiveSection("essay")}
                  className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "essay"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span>المقال (Essay)</span>
                </button>
              )}
            </div>

            {/* SECTION 1: MCQ */}
            {activeSection === "mcq" && (
              <div className="space-y-4">
                {exam?.sections?.mcq?.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600 dark:text-blue-400">سؤال {q.number}</span>
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

                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed" dir="ltr">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2" dir="ltr">
                      {q.options?.map((opt: string, idx: number) => {
                        const isSelected = answers[q.id] === opt;
                        const letter = String.fromCharCode(65 + idx);

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                isSelected ? "bg-white text-blue-600" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt}</span>
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
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-500">
                    <BookOpen className="w-4 h-4" />
                    <span>{exam.sections.passage.title}</span>
                  </div>
                  <div
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 font-serif"
                    dir="ltr"
                  >
                    {(exam.sections.passage.content || exam.sections.passage.text || "").split("\n\n").map((para: string, idx: number) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>

                {exam.sections.passage.questions?.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600 dark:text-blue-400">سؤال القطعة {q.number}</span>
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
                        <span>{flaggedQuestions[q.id] ? "تم التمييز 🚩" : "مراجعة لاحقاً"}</span>
                      </button>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white" dir="ltr">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2" dir="ltr">
                      {q.options?.map((opt: string, idx: number) => {
                        const isSelected = answers[q.id] === opt;
                        const letter = String.fromCharCode(65 + idx);

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                isSelected ? "bg-white text-blue-600" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt}</span>
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
                        سؤال الترجمة {q.number} ({q.direction === "en_to_ar" ? "English to Arabic" : "Arabic to English"})
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
                        <span>{flaggedQuestions[q.id] ? "تم التمييز 🚩" : "مراجعة لاحقاً"}</span>
                      </button>
                    </div>

                    <div
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                      dir={q.direction === "en_to_ar" ? "ltr" : "rtl"}
                    >
                      {q.sourceText}
                    </div>

                    <div className="space-y-2 pt-2" dir={q.direction === "en_to_ar" ? "rtl" : "ltr"}>
                      {q.options?.map((opt: string, idx: number) => {
                        const isSelected = answers[q.id] === opt;
                        const letter = String.fromCharCode(65 + idx);

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full p-3.5 rounded-2xl border text-right text-xs font-bold transition cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                isSelected ? "bg-white text-blue-600" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 4: NOVEL */}
            {activeSection === "novel" && exam?.sections?.novel && (
              <div className="space-y-4">
                {exam.sections.novel.map((q: any) => (
                  <div
                    key={q.id}
                    id={`q_${q.id}`}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
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
              <h3 className="text-xs font-black text-slate-900 dark:text-white">لوحة الأسئلة (Question Palette)</h3>

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

export default ExamSimulatorWorkspace;
