"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { awardXP } from "@/lib/gamification-service";
import { recordMistake } from "@/lib/mistakes-service";
import {
  PenTool,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lightbulb,
  Copy,
  Check,
  Volume2,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";

export interface KeyVocabItem {
  term: string;
  synonyms: string[];
  meaning_ar: string;
  weight: number;
}

export interface InteractiveExercise {
  id: string;
  gradeLevel: string;
  direction: "en_to_ar" | "ar_to_en";
  exerciseType: "written" | "mcq";
  difficulty: "standard" | "advanced" | "exam_past";
  sourceText: string;
  modelAnswer: string;
  alternativeAnswers: string[];
  keyVocabulary: KeyVocabItem[];
  mcqOptions?: {
    options: string[];
    correct_index: number;
    trap_explanations: Record<string, string>;
  };
  grammarTip?: string;
}

export const InteractiveTranslationWorkspace: React.FC = () => {
  const { user } = useApp();

  // Mode and filters
  const [activeMode, setActiveMode] = useState<"written" | "mcq">("written");
  const [directionFilter, setDirectionFilter] = useState<"all" | "en_to_ar" | "ar_to_en">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "standard" | "advanced" | "exam_past">("all");

  // Exercises data
  const [exercises, setExercises] = useState<InteractiveExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Written Mode State
  const [studentInput, setStudentInput] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [writtenResult, setWrittenResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showGrammarTip, setShowGrammarTip] = useState(false);

  // MCQ Mode State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqResult, setMcqResult] = useState<any | null>(null);
  const [mcqSubmitting, setMcqSubmitting] = useState(false);

  // XP & Feedback Alerts
  const [xpEarnedNotice, setXpEarnedNotice] = useState<number | null>(null);
  const [mistakeRecordedNotice, setMistakeRecordedNotice] = useState<boolean>(false);

  // Fetch exercises
  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("grade_level", "3rd_sec");
      if (directionFilter !== "all") params.set("direction", directionFilter);
      if (activeMode) params.set("exercise_type", activeMode);
      if (difficultyFilter !== "all") params.set("difficulty", difficultyFilter);

      const res = await fetch(`/api/translation/interactive?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.exercises)) {
        setExercises(data.exercises);
        setCurrentIndex(0);
        resetCurrentState();
      }
    } catch (e) {
      console.error("Failed to fetch interactive translation exercises:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, directionFilter, difficultyFilter]);

  const resetCurrentState = () => {
    setStudentInput("");
    setWrittenResult(null);
    setSelectedOption(null);
    setMcqSubmitted(false);
    setMcqResult(null);
    setXpEarnedNotice(null);
    setMistakeRecordedNotice(false);
    setShowGrammarTip(false);
  };

  const currentExercise = exercises[currentIndex] || null;

  // Handle Speech
  const handleSpeak = (text: string, lang = "en-US") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy Source Text
  const handleCopySource = () => {
    if (!currentExercise) return;
    navigator.clipboard.writeText(currentExercise.sourceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Evaluate Written Translation
  const handleEvaluateWritten = async () => {
    if (!currentExercise || !studentInput.trim()) return;
    setEvaluating(true);
    setWrittenResult(null);
    setXpEarnedNotice(null);
    setMistakeRecordedNotice(false);

    try {
      const res = await fetch("/api/translation/interactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_written",
          exerciseId: currentExercise.id,
          studentInput: studentInput.trim(),
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setWrittenResult(data.evaluation);

        // Check XP Eligibility
        if (data.evaluation.isEligibleForXP) {
          const xpRes = await awardXP({
            actionType: "translation_exercise",
            referenceId: currentExercise.id,
            customXp: 25,
            userId: user?.id,
          });
          if (xpRes?.success && !xpRes.duplicate) {
            setXpEarnedNotice(25);
          }
        } else {
          // Record to Mistakes Bank if score < 60%
          await recordMistake(
            {
              id: currentExercise.id,
              questionText: currentExercise.sourceText,
              options: [currentExercise.modelAnswer, ...(currentExercise.alternativeAnswers || [])],
              correctAnswer: currentExercise.modelAnswer,
              explanation: currentExercise.grammarTip || data.evaluation.feedback,
              domainCategory: "Translation",
              grade: "Third Secondary",
              difficulty: currentExercise.difficulty,
            },
            studentInput.trim(),
            user?.id
          );
          setMistakeRecordedNotice(true);
        }
      }
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  // Handle MCQ Selection and Submission
  const handleSelectMCQ = async (index: number) => {
    if (mcqSubmitted || !currentExercise || mcqSubmitting) return;
    setSelectedOption(index);
    setMcqSubmitting(true);
    setXpEarnedNotice(null);
    setMistakeRecordedNotice(false);

    try {
      const res = await fetch("/api/translation/interactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_mcq",
          exerciseId: currentExercise.id,
          selectedOptionIndex: index,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMcqSubmitted(true);
        setMcqResult(data);

        if (data.isCorrect) {
          const xpRes = await awardXP({
            actionType: "translation_exercise",
            referenceId: currentExercise.id,
            customXp: 25,
            userId: user?.id,
          });
          if (xpRes?.success && !xpRes.duplicate) {
            setXpEarnedNotice(25);
          }
        } else {
          const wrongOptionText = currentExercise.mcqOptions?.options?.[index] || "";
          await recordMistake(
            {
              id: currentExercise.id,
              questionText: currentExercise.sourceText,
              options: currentExercise.mcqOptions?.options || [],
              correctAnswer: currentExercise.modelAnswer,
              explanation: data.trapExplanation || currentExercise.grammarTip || "",
              domainCategory: "Translation MCQ",
              grade: "Third Secondary",
              difficulty: currentExercise.difficulty,
            },
            wrongOptionText,
            user?.id
          );
          setMistakeRecordedNotice(true);
        }
      }
    } catch (e) {
      console.error("MCQ submission error:", e);
    } finally {
      setMcqSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetCurrentState();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetCurrentState();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. TOP HEADER & DUAL MODE SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101b38] to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-blue-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مختبر الترجمة التفاعلي الذكي • دفعة 2026/2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>أكاديمية الترجمة الذكية</span>
              <span className="text-sm font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                PRO
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              تدريب مكثف على صياغات امتحانات الثانوية العامة مع تقييم ذكي فوري للمفردات المفتاحية والتراكيب، وتفكيك الفخاخ اللغوية بدقة.
            </p>
          </div>

          {/* DUAL MODE TABS */}
          <div className="flex items-center p-1.5 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 shadow-inner">
            <button
              onClick={() => {
                setActiveMode("written");
                resetCurrentState();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeMode === "written"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-102"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>ترجمة تحريرية ذكية</span>
            </button>

            <button
              onClick={() => {
                setActiveMode("mcq");
                resetCurrentState();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeMode === "mcq"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-102 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>ترجمة الاختيار من متعدد (MCQ)</span>
            </button>
          </div>
        </div>

        {/* 2. FILTER BAR */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> الاتجاه:
            </span>
            <button
              onClick={() => setDirectionFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                directionFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setDirectionFilter("en_to_ar")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                directionFilter === "en_to_ar"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              إنجليزي ⬅️ عربي
            </button>
            <button
              onClick={() => setDirectionFilter("ar_to_en")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                directionFilter === "ar_to_en"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              عربي ⬅️ إنجليزي
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">الصعوبة:</span>
            <button
              onClick={() => setDifficultyFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                difficultyFilter === "all"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setDifficultyFilter("exam_past")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                difficultyFilter === "exam_past"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              امتحانات ثانوية عامة
            </button>
            <button
              onClick={() => setDifficultyFilter("advanced")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                difficultyFilter === "advanced"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              متقدم
            </button>
            <button
              onClick={() => setDifficultyFilter("standard")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                difficultyFilter === "standard"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              قياسي
            </button>
          </div>
        </div>
      </div>

      {/* GAMIFICATION & MISTAKES ALERTS */}
      {xpEarnedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm">أحسنت صنعاً! أداء متميز يستحق التقدير 🎉</p>
              <p className="text-xs opacity-90">
                تمت إضافة <span className="font-black text-emerald-600 dark:text-emerald-200">+{xpEarnedNotice} نقطة XP</span> إلى رصيدك الأسبوعي في لوحة الشرف!
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white">
            +{xpEarnedNotice} XP
          </span>
        </div>
      )}

      {mistakeRecordedNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-3 animate-fadeIn shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-sm">تم حفظ التمرين تلقائياً في &ldquo;بنك أخطائي الذكي&rdquo; 💡</p>
            <p className="text-xs opacity-90">
              لا تقلق، الهدف هو التعلم من التحديات. يمكنك إعادة التدرب عليه لاحقاً من تبويب بنك الأخطاء حتى تتقنه تماماً!
            </p>
          </div>
        </div>
      )}

      {/* MAIN EXERCISE CONTAINER */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-slate-600 dark:text-slate-400">جاري تحميل تدريبات الترجمة التفاعلية...</p>
        </div>
      ) : !currentExercise ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-black text-lg">لا توجد تمارين تطابق خيارات التصفية الحالية</h3>
          <p className="text-sm text-slate-500">جرب اختيار &ldquo;الكل&rdquo; لعرض كافة التمارين المتاحة.</p>
          <button
            onClick={() => {
              setDirectionFilter("all");
              setDifficultyFilter("all");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer"
          >
            إعادة تعيين التصفية
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* EXERCISE NAVIGATION & META BAR */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                تمرين {currentIndex + 1} من {exercises.length}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {currentExercise.direction === "en_to_ar" ? "ترجمة إلى العربية" : "Translate into English"}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {currentExercise.difficulty === "exam_past"
                  ? "امتحان ثانوية عامة"
                  : currentExercise.difficulty === "advanced"
                  ? "مستوى متقدم"
                  : "قياسي"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="التمرين السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === exercises.length - 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="التمرين التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SOURCE SENTENCE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black">
                <BookOpen className="w-4 h-4" /> النص المطلوب ترجمته:
              </span>
              <div className="flex items-center gap-2">
                {currentExercise.direction === "en_to_ar" && (
                  <button
                    onClick={() => handleSpeak(currentExercise.sourceText, "en-US")}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                    title="استمع للنطق الإنجليزي"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleCopySource}
                  className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  title="نسخ النص"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "تم النسخ" : "نسخ"}</span>
                </button>
              </div>
            </div>

            <p
              className={`text-xl sm:text-2xl font-bold leading-relaxed text-slate-900 dark:text-white ${
                currentExercise.direction === "en_to_ar" ? "text-left font-sans" : "text-right font-serif"
              }`}
              dir={currentExercise.direction === "en_to_ar" ? "ltr" : "rtl"}
            >
              &ldquo;{currentExercise.sourceText}&rdquo;
            </p>

            {/* GRAMMAR TIP TOGGLE */}
            {currentExercise.grammarTip && (
              <div className="pt-2">
                <button
                  onClick={() => setShowGrammarTip(!showGrammarTip)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showGrammarTip ? "إخفاء إرشادات المستر النحوية" : "عرض إرشادات المستر النحوية لهذا السؤال"}</span>
                </button>

                {showGrammarTip && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed animate-fadeIn">
                    <span className="font-black block mb-1">💡 نصيحة مستر حبيب الرحمن:</span>
                    {currentExercise.grammarTip}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MODE A: WRITTEN TRANSLATION */}
          {activeMode === "written" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <label htmlFor="written-input" className="text-slate-700 dark:text-slate-300 font-black">
                    اكتب صياغتك المتقنة هنا:
                  </label>
                  <span>
                    {studentInput.trim() ? studentInput.trim().split(/\s+/).length : 0} كلمة • {studentInput.length} حرف
                  </span>
                </div>

                <textarea
                  id="written-input"
                  rows={4}
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  placeholder={
                    currentExercise.direction === "en_to_ar"
                      ? "اكتب ترجمتك باللغة العربية الفصحى بكل ثقة..."
                      : "Type your English translation here with proper grammar and capitalization..."
                  }
                  dir={currentExercise.direction === "en_to_ar" ? "rtl" : "ltr"}
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed transition-all resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setStudentInput("")}
                    disabled={!studentInput || evaluating}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    مسح النص
                  </button>

                  <button
                    onClick={handleEvaluateWritten}
                    disabled={!studentInput.trim() || evaluating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري التقييم الذكي...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>تقييم الترجمة الآن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* EVALUATION RESULTS CARD */}
              {writtenResult && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                  {/* SCORE HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/60 dark:to-blue-950/30 border border-blue-200/50 dark:border-blue-900/50">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-lg ${
                          writtenResult.accuracyScore >= 85
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                            : writtenResult.accuracyScore >= 60
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30"
                            : "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30"
                        }`}
                      >
                        <span className="text-xl leading-none">{writtenResult.accuracyScore}%</span>
                        <span className="text-[10px] opacity-80 mt-1">الدقة</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 block">التقدير الأكاديمي</span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {writtenResult.tierTitleAr}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right sm:text-left">
                        <span className="text-[10px] text-slate-500 block">مفردات محورية (70%)</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                          {writtenResult.keywordScore} / 70
                        </span>
                      </div>
                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-700" />
                      <div className="text-right sm:text-left">
                        <span className="text-[10px] text-slate-500 block">تراكيب وقواعد (30%)</span>
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                          {writtenResult.structureScore} / 30
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FEEDBACK PARAGRAPH */}
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                    <span className="font-black block text-blue-600 dark:text-blue-400 mb-1">
                      📝 تقرير التقييم الفوري:
                    </span>
                    {writtenResult.feedback}
                  </div>

                  {/* KEYWORD BREAKDOWN PILLS */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      تحليل المفردات والتعبيرات الاصطلاحية:
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* MATCHED KEYWORDS */}
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>مصطلحات صائبة تم استخدامها ({writtenResult.matchedKeywords.length})</span>
                        </div>
                        {writtenResult.matchedKeywords.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">لم يتم رصد أي من المفردات المحورية المحددة.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {writtenResult.matchedKeywords.map((kw: any, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
                              >
                                <span>{kw.term}</span>
                                <span className="opacity-70 text-[10px]">({kw.meaning_ar})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* MISSED KEYWORDS */}
                      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 dark:text-rose-300">
                          <XCircle className="w-4 h-4" />
                          <span>مفردات محورية مفقودة ({writtenResult.missedKeywords.length})</span>
                        </div>
                        {writtenResult.missedKeywords.length === 0 ? (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            رائع! قمت بتغطية كافة المفردات الأساسية بدقة.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {writtenResult.missedKeywords.map((kw: any, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-800 dark:text-rose-200 border border-rose-500/30"
                              >
                                <span>{kw.term}</span>
                                <span className="opacity-70 text-[10px]">({kw.meaning_ar})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE MODEL COMPARISON */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      مقارنة جنباً إلى جنب مع النموذج المعتمد:
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="text-xs font-black text-slate-500 block">ترجمتك المكتوبة:</span>
                        <p
                          className="text-sm font-medium leading-relaxed text-slate-900 dark:text-white"
                          dir={currentExercise.direction === "en_to_ar" ? "rtl" : "ltr"}
                        >
                          {studentInput}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1.5">
                        <span className="text-xs font-black text-blue-700 dark:text-blue-300 block flex items-center justify-between">
                          <span>النموذج الرسمي المعتمد:</span>
                          <span className="text-[10px] font-normal opacity-80">معايير التصحيح الوزاري</span>
                        </span>
                        <p
                          className="text-sm font-bold leading-relaxed text-blue-950 dark:text-blue-100"
                          dir={currentExercise.direction === "en_to_ar" ? "rtl" : "ltr"}
                        >
                          {writtenResult.modelAnswer}
                        </p>
                      </div>
                    </div>

                    {/* ACCEPTED ALTERNATIVES IF ANY */}
                    {writtenResult.alternativeAnswers && writtenResult.alternativeAnswers.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <span className="font-black text-slate-700 dark:text-slate-200 block">
                          بدائل وصيغ أخرى مقبولة تحسب صحيحة 100%:
                        </span>
                        <ul className="list-disc list-inside space-y-1 pr-1">
                          {writtenResult.alternativeAnswers.map((alt: string, i: number) => (
                            <li key={i}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setWrittenResult(null);
                        setXpEarnedNotice(null);
                        setMistakeRecordedNotice(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة المحاولة بصياغة أخرى</span>
                    </button>

                    {currentIndex < exercises.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                      >
                        <span>التمرين التالي</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE B: MCQ TRANSLATION (THANAWEYA AMMA STYLE) */}
          {activeMode === "mcq" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>اختر الترجمة الصحيحة المعتمدة من بين الخيارات التالية:</span>
                </h4>
                <span className="text-xs text-slate-400 font-bold">4 خيارات بنظام البوكليت</span>
              </div>

              {/* OPTIONS LIST */}
              <div className="space-y-3">
                {currentExercise.mcqOptions?.options?.map((optionText, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = mcqResult && idx === mcqResult.correctIndex;
                  const isWrongSelected = mcqResult && isSelected && !mcqResult.isCorrect;

                  let borderClass = "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600";
                  let bgClass = "bg-slate-50/60 dark:bg-slate-800/40";
                  let badgeText = String.fromCharCode(65 + idx); // A, B, C, D
                  let badgeBg = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";

                  if (mcqSubmitted) {
                    if (isCorrect) {
                      borderClass = "border-emerald-500 ring-2 ring-emerald-500/30";
                      bgClass = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-bold";
                      badgeBg = "bg-emerald-500 text-white";
                    } else if (isWrongSelected) {
                      borderClass = "border-rose-500 ring-2 ring-rose-500/30";
                      bgClass = "bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100";
                      badgeBg = "bg-rose-500 text-white";
                    } else {
                      bgClass = "opacity-50 bg-slate-100 dark:bg-slate-800/20";
                    }
                  } else if (isSelected) {
                    borderClass = "border-blue-500 ring-2 ring-blue-500/30";
                    bgClass = "bg-blue-50 dark:bg-blue-950/30";
                    badgeBg = "bg-blue-600 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectMCQ(idx)}
                      disabled={mcqSubmitted || mcqSubmitting}
                      className={`w-full p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${borderClass} ${bgClass}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${badgeBg}`}>
                        {badgeText}
                      </div>

                      <div className="flex-1 space-y-1">
                        <p
                          className="text-sm sm:text-base leading-relaxed"
                          dir={currentExercise.direction === "en_to_ar" ? "rtl" : "ltr"}
                        >
                          {optionText}
                        </p>
                      </div>

                      {mcqSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {mcqSubmitted && isWrongSelected && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TRAP EXPLANATION CARD (KASHF AL-FAKHAKH) */}
              {mcqSubmitted && mcqResult && (
                <div
                  className={`p-5 rounded-2xl border animate-fadeIn space-y-3 ${
                    mcqResult.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <h5 className="font-black text-sm">
                      {mcqResult.isCorrect
                        ? "تحليل الخيار المختار: إجابة نموذجية دقيقة 🎯"
                        : "كشف الفخ الامتحاني في الخيار المختار ⚠️"}
                    </h5>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed font-medium">
                    {mcqResult.trapExplanation}
                  </p>

                  {/* ALL TRAPS EXPANDER */}
                  <details className="mt-3 pt-3 border-t border-current/10 text-xs">
                    <summary className="font-bold cursor-pointer hover:underline">
                      عرض تحليل فخاخ جميع الخيارات الأربعة (مفتاح حل الثانوية العامة):
                    </summary>
                    <div className="mt-2 space-y-1.5 pr-2">
                      {currentExercise.mcqOptions?.options?.map((_, optIdx) => {
                        const explanation =
                          currentExercise.mcqOptions?.trap_explanations?.[String(optIdx)] || "";
                        const isThisCorrect = optIdx === currentExercise.mcqOptions?.correct_index;
                        return (
                          <div key={optIdx} className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                            <span className="font-black ml-1">
                              خيار ({String.fromCharCode(65 + optIdx)}) {isThisCorrect ? "✅ [الصحيح]:" : "❌ [فخ]:"}
                            </span>
                            <span>{explanation}</span>
                          </div>
                        );
                      })}
                    </div>
                  </details>

                  {/* NEXT EXERCISE CTA */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        resetCurrentState();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-current/20 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      إعادة المحاولة
                    </button>

                    {currentIndex < exercises.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md"
                      >
                        التمرين التالي
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
