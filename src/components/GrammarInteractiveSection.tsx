"use client";

import React, { useState, useMemo } from "react";
import {
  getGrammarPackage,
  type GrammarInteractiveQuestion,
} from "@/data/grammar-summaries-and-questions";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  Lightbulb,
  Check,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface Props {
  videoId: string;
  videoTitleAr: string;
  videoTitleEn: string;
}

export const GrammarInteractiveSection: React.FC<Props> = ({
  videoId,
  videoTitleAr,
  videoTitleEn,
}) => {
  const pkg = useMemo(() => getGrammarPackage(videoId), [videoId]);

  // View tabs
  const [activeTab, setActiveTab] = useState<"summary" | "practice">("summary");

  // Practice state
  const questions = pkg?.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "wrong" | "unanswered">("all");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Computed statistics
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = useMemo(() => {
    return questions.filter((q) => userAnswers[q.id] === q.correctAnswer).length;
  }, [questions, userAnswers]);
  const wrongCount = answeredCount - correctCount;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const answered = userAnswers[q.id] !== undefined;
      const isCorrect = userAnswers[q.id] === q.correctAnswer;
      if (filterMode === "correct") return answered && isCorrect;
      if (filterMode === "wrong") return answered && !isCorrect;
      if (filterMode === "unanswered") return !answered;
      return true;
    });
  }, [questions, userAnswers, filterMode]);

  const currentQ: GrammarInteractiveQuestion | undefined = questions[currentIdx];

  // Audio Pronunciation
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const clean = text.replace(/______/g, "blank");
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "en-GB";
    utt.rate = 0.9;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const selectAnswer = (questionId: string, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const resetAll = () => {
    if (window.confirm("هل ترغب في إعادة ضبط الإجابات وبدء التدريب من جديد؟")) {
      setUserAnswers({});
      setCurrentIdx(0);
    }
  };

  if (!pkg) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-purple-400/30 bg-purple-950/20 p-8 text-center text-purple-200">
        <p className="font-bold text-sm">جاري تحديث حزمة الشرح والأسئلة لهذا الفيديو...</p>
      </div>
    );
  }

  const { summary } = pkg;

  return (
    <div className="mt-8 rounded-[2.5rem] border border-purple-400/25 bg-gradient-to-b from-[#130b2c] via-[#0d071e] to-[#080414] p-5 sm:p-8 text-slate-100 shadow-2xl">
      {/* SECTION HEADER WITH TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ملحقات فيديو الشرح • مستر حبيب الرحمن</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            {videoTitleAr}
          </h2>
          <p className="text-xs text-purple-300/80 font-bold mt-0.5">
            {videoTitleEn} • ملخص الشرح وبنك الأسئلة التفاعلي (50 سؤالاً)
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex items-center gap-2 rounded-2xl bg-[#1c103e] p-1.5 border border-purple-400/20 shadow-inner">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "summary"
                ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-md"
                : "text-purple-200 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ملخص الشرح</span>
          </button>

          <button
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "practice"
                ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-md"
                : "text-purple-200 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>بنك الأسئلة (50 سؤال)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
              {answeredCount}/50
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
         TAB 1: COMPREHENSIVE EXPLANATION SUMMARY
         ========================================================================= */}
      {activeTab === "summary" && (
        <div className="mt-6 space-y-6">
          {/* Concept Banner */}
          <div className="rounded-3xl border border-purple-400/30 bg-purple-950/30 p-5 sm:p-6 backdrop-blur">
            <h3 className="text-sm font-black text-sky-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>مفهوم القاعدة وفكرتها العامة:</span>
            </h3>
            <p className="mt-2 text-sm sm:text-base font-bold text-white leading-relaxed">
              {summary.concept}
            </p>
          </div>

          {/* Formulas Card */}
          <div className="rounded-3xl border border-sky-400/25 bg-[#160c33] p-5 sm:p-6">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>الصياغة والتكوين (Grammar Formulas):</span>
            </h3>
            <div className="space-y-2.5">
              {summary.formula.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-purple-500/20 bg-[#0e0720] p-3.5 font-mono text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-3 text-left"
                  dir="ltr"
                >
                  <span className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs shrink-0">
                    {i + 1}
                  </span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Rules with Examples */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>أهم القواعد التفصيلية والأمثلة العملية:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.keyRules.map((kr, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-purple-400/20 bg-[#150c30]/80 p-5 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-black text-sky-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>{kr.title}</span>
                    </h4>
                    <p className="mt-2 text-xs font-bold text-purple-200/90 leading-relaxed">
                      {kr.explanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-500/20 space-y-1.5" dir="ltr">
                    {kr.examples.map((ex, exIdx) => (
                      <p
                        key={exIdx}
                        className="text-xs font-semibold text-emerald-300 bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/20"
                      >
                        {ex}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Exam Secrets by Habib El Rahman */}
          <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-[#180e33] to-purple-900/20 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-amber-300">
                تكات وخبايا مستر حبيب الرحمن للامتحانات:
              </h3>
            </div>

            <ul className="space-y-2.5">
              {summary.examSecrets.map((secret, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-white/95 leading-relaxed bg-[#0f0824]/60 p-3 rounded-2xl border border-amber-400/20"
                >
                  <span className="text-amber-400 font-black shrink-0">✦</span>
                  <span>{secret}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes & Corrections */}
          <div className="rounded-3xl border border-purple-400/20 bg-[#140b2c] p-5 sm:p-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>أشهر الأخطاء الشائعة في الامتحانات وكيفية تجنبها:</span>
            </h3>

            <div className="space-y-3">
              {summary.commonMistakes.map((cm, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-4 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-2 text-xs font-bold" dir="ltr">
                    <span className="text-rose-400 flex items-center gap-1.5 line-through">
                      <X className="w-3.5 h-3.5 text-rose-500" />
                      <span>{cm.mistake}</span>
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1.5 font-black">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cm.correction}</span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-purple-200/80 pt-1 border-t border-purple-500/20 text-right">
                    💡 <span className="font-bold text-amber-300">السبب:</span> {cm.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA TO GO TO 50 QUESTIONS */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab("practice")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white font-black text-sm shadow-xl shadow-purple-950/60 hover:brightness-110 transition-all"
            >
              <Layers className="w-5 h-5 text-amber-300" />
              <span>ابدأ الآن حل 50 سؤالاً تفاعلياً على هذه القاعدة</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 2: 50 INTERACTIVE QUESTIONS SUITE
         ========================================================================= */}
      {activeTab === "practice" && (
        <div className="mt-6 space-y-6">
          {/* STATS & CONTROL BAR */}
          <div className="rounded-3xl border border-purple-400/25 bg-[#160c35] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-purple-300">
                  بنك الأسئلة التفاعلي المخصص
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  50 سؤال اختيار من متعدد • {videoTitleAr}
                </h3>
              </div>

              {/* Progress Summary Chips */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs font-black">
                  <Check className="w-3.5 h-3.5" />
                  <span>{correctCount} صحيحة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300 text-xs font-black">
                  <X className="w-3.5 h-3.5" />
                  <span>{wrongCount} خاطئة</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-300 text-xs font-black">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{answeredCount} / 50</span>
                </div>
                <button
                  onClick={resetAll}
                  className="p-2 rounded-xl border border-purple-400/20 bg-purple-950/40 text-purple-300 hover:text-white transition-colors"
                  title="إعادة ضبط التدريب"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-black text-purple-300/80 mb-1.5">
                <span>نسبة إنجاز بنك الأسئلة</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#0a0518] h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-400/20">
                <div
                  className="bg-gradient-to-r from-purple-600 via-sky-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-sky-500/50"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 50 QUESTION NAVIGATOR GRID */}
          <div className="rounded-3xl border border-purple-400/20 bg-[#120a2a] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-black text-purple-200">
                خريطة الأسئلة الـ 50 (اضغط للانتقال لأي سؤال مباشرة):
              </span>

              {/* Filters */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterMode === "all" ? "bg-purple-600 text-white" : "text-purple-300 hover:bg-purple-900/40"
                  }`}
                >
                  الكل (50)
                </button>
                <button
                  onClick={() => setFilterMode("correct")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterMode === "correct" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:bg-emerald-950/40"
                  }`}
                >
                  الصحيحة ({correctCount})
                </button>
                <button
                  onClick={() => setFilterMode("wrong")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterMode === "wrong" ? "bg-rose-600 text-white" : "text-rose-400 hover:bg-rose-950/40"
                  }`}
                >
                  الخاطئة ({wrongCount})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-25 gap-1.5">
              {questions.map((q, idx) => {
                const isSelected = currentIdx === idx;
                const ans = userAnswers[q.id];
                const isAnswered = ans !== undefined;
                const isCorrect = ans === q.correctAnswer;

                let stateColor = "border-purple-400/20 bg-[#1a0f38] text-purple-300";
                if (isAnswered) {
                  stateColor = isCorrect
                    ? "border-emerald-500 bg-emerald-600 text-white font-black"
                    : "border-rose-500 bg-rose-600 text-white font-black";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-7 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${stateColor} ${
                      isSelected ? "ring-2 ring-sky-400 scale-110 z-10 shadow-lg" : "hover:brightness-125"
                    }`}
                    title={`السؤال رقم ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CURRENT QUESTION CARD */}
          {currentQ && (
            <div className="rounded-3xl border border-purple-400/30 bg-gradient-to-b from-[#180e38] to-[#110826] p-6 sm:p-8 shadow-2xl">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-purple-600/30 border border-purple-400/30 text-purple-200 text-xs font-black">
                    سؤال {currentIdx + 1} من 50
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                      currentQ.difficulty === "Easy"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : currentQ.difficulty === "Medium"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    {currentQ.difficulty === "Easy" ? "تأسيسي مباشر" : currentQ.difficulty === "Medium" ? "فهم وسياق" : "ثانوية عامة متميز"}
                  </span>
                </div>

                <button
                  onClick={() => speakText(currentQ.questionText)}
                  className={`p-2 rounded-xl border transition-all ${
                    isSpeaking
                      ? "bg-purple-600 text-white border-purple-400 animate-pulse"
                      : "bg-[#1f1244] border-purple-400/30 text-purple-300 hover:text-white"
                  }`}
                  title="استمع للنطق الإنجليزي السليم"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question Text */}
              <div className="my-6 p-4 sm:p-5 rounded-2xl border border-purple-400/20 bg-[#0f0722]">
                <p className="text-base sm:text-lg font-black text-white leading-relaxed text-left" dir="ltr">
                  {currentQ.questionText}
                </p>
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-3" dir="ltr">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isSelected = userAnswers[currentQ.id] === opt;
                  const isAnswered = userAnswers[currentQ.id] !== undefined;
                  const isOptionCorrect = opt === currentQ.correctAnswer;

                  let optStyles =
                    "border-purple-400/20 bg-[#160c33] text-purple-100 hover:border-purple-400/50 hover:bg-purple-900/20";

                  if (isAnswered && instantFeedback) {
                    if (isOptionCorrect) {
                      optStyles = "border-emerald-500 bg-emerald-950/40 text-emerald-200 font-black shadow-lg shadow-emerald-950/50";
                    } else if (isSelected && !isOptionCorrect) {
                      optStyles = "border-rose-500 bg-rose-950/40 text-rose-200 line-through opacity-80";
                    }
                  } else if (isSelected) {
                    optStyles = "border-sky-400 bg-sky-950/40 text-white font-bold";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectAnswer(currentQ.id, opt)}
                      className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all flex items-center justify-between group ${optStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-[#25154d] text-purple-300 group-hover:text-white"
                          }`}
                        >
                          {letter}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && instantFeedback && (
                        <div>
                          {isOptionCorrect && <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />}
                          {isSelected && !isOptionCorrect && <X className="w-5 h-5 text-rose-400 stroke-[3]" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Grammatical Explanation Box */}
              {userAnswers[currentQ.id] !== undefined && instantFeedback && (
                <div
                  className={`mt-6 p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-semibold leading-relaxed ${
                    userAnswers[currentQ.id] === currentQ.correctAnswer
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                      : "border-amber-400/30 bg-amber-950/20 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm mb-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>التفسير الأكاديمي لمستر حبيب الرحمن:</span>
                  </div>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              {/* Navigation Arrows */}
              <div className="mt-8 flex items-center justify-between pt-4 border-t border-purple-500/20">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-400/20 bg-[#160c33] text-purple-200 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <span className="text-xs font-black text-purple-300">
                  {currentIdx + 1} / 50
                </span>

                <button
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-sky-600 text-white text-xs font-black disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
