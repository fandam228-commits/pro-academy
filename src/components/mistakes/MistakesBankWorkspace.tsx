"use client";

import React, { useState } from "react";
import { useMistakesBank } from "@/hooks/useMistakesBank";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  HelpCircle,
  Flame,
  Check,
  X,
  RefreshCw,
  Trophy,
} from "lucide-react";

export const MistakesBankWorkspace: React.FC = () => {
  const { lang } = useApp();
  const {
    unresolvedMistakes,
    masteredMistakes,
    stats,
    loading,
    selectedCategory,
    setSelectedCategory,
    reloadMistakes,
    resolveQuestion,
    recordWrong,
  } = useMistakesBank();

  // Mode: "browse" or "practice"
  const [mode, setMode] = useState<"browse" | "practice">("browse");

  // Practice Quiz Runner State
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredState, setAnsweredState] = useState<{
    answered: boolean;
    isCorrect: boolean;
    explanation?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });

  // Expandable cards state in Browse mode
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  const [activeTabFilter, setActiveTabFilter] = useState<"unresolved" | "mastered">("unresolved");

  const categories = ["الكل", "Grammar", "Vocabulary", "Translation", "Story"];

  const toggleCardExpand = (id: string) => {
    setExpandedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showCelebrationToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const startPracticeMode = () => {
    if (unresolvedMistakes.length === 0) return;
    setMode("practice");
    setPracticeIndex(0);
    setSelectedAnswer(null);
    setAnsweredState(null);
    setPracticeScore({ correct: 0, total: 0 });
  };

  const exitPracticeMode = () => {
    setMode("browse");
    setSelectedAnswer(null);
    setAnsweredState(null);
    reloadMistakes();
  };

  // Practice Runner: Handle Answer Selection
  const handleSelectOptionInPractice = async (option: string) => {
    if (answeredState?.answered) return;

    const currentMistake = unresolvedMistakes[practiceIndex];
    if (!currentMistake) return;

    const snapshot = currentMistake.questionSnapshot;
    const correct = snapshot.correctAnswer || "";
    const isCorrect = option.trim().toLowerCase() === correct.trim().toLowerCase();

    setSelectedAnswer(option);
    setAnsweredState({
      answered: true,
      isCorrect,
      explanation: snapshot.explanation || "تأكد من مراجعة القاعدة والكلمات المفتاحية في الجملة.",
    });

    if (isCorrect) {
      setPracticeScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      showCelebrationToast("🎉 أحسنت! تم إتقان هذا السؤال وحذفه من بنك أخطائك ✓");
      await resolveQuestion(currentMistake.questionId);
    } else {
      setPracticeScore((prev) => ({ ...prev, total: prev.total + 1 }));
      await recordWrong(snapshot, option);
    }
  };

  const nextPracticeQuestion = () => {
    setSelectedAnswer(null);
    setAnsweredState(null);
    if (practiceIndex + 1 < unresolvedMistakes.length) {
      setPracticeIndex((prev) => prev + 1);
    } else {
      // Completed all questions in the queue
      showCelebrationToast("🏆 اكتملت جلسة المراجعة! عمل ممتاز.");
      setMode("browse");
    }
  };

  const currentPracticeItem = unresolvedMistakes[practiceIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* CELEBRATION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1D38] via-[#12284D] to-[#0A162B] border border-amber-500/20 p-6 md:p-8 mb-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black mb-3">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>بنك الأخطاء التلقائي الذكي • العام الدراسي 2026/2027</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>بنك أخطائي الذكي (Smart Mistakes Bank)</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              كل سؤال تخطئ فيه في أي كويز أو امتحان يتم تسجيله هنا تلقائيًا. تدرّب عليه مرة أخرى، وبمجرد إجابته بالشكل الصحيح سيتم احتسابه كـ &quot;مُتقن&quot; وحذفه من بنك أخطائك فورًا!
            </p>
          </div>

          {/* QUICK STATS CARDS */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center min-w-[110px]">
              <span className="text-[11px] text-slate-300 font-bold">قيد المراجعة</span>
              <span className={`text-2xl font-black ${stats.totalUnresolved > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {stats.totalUnresolved}
              </span>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center min-w-[110px]">
              <span className="text-[11px] text-slate-300 font-bold">تم إتقانها</span>
              <span className="text-2xl font-black text-emerald-400">
                {stats.totalMastered}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA & FILTER ROW */}
        {mode === "browse" && (
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300 ml-2">التصنيف:</span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 font-black"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Launch Practice Button */}
            <button
              onClick={startPracticeMode}
              disabled={unresolvedMistakes.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl ${
                unresolvedMistakes.length > 0
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 hover:scale-[1.02] cursor-pointer"
                  : "bg-slate-700/50 text-slate-400 cursor-not-allowed border border-white/5"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ابدأ اختبار مراجعة أخطائي الآن ({unresolvedMistakes.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* PRACTICE MODE (INTERACTIVE QUIZ RUNNER) */}
      {mode === "practice" && currentPracticeItem && (
        <div className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 mb-8 transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black">
                السؤال {practiceIndex + 1} من {unresolvedMistakes.length}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                {currentPracticeItem.questionSnapshot.domainCategory || "عام"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                النتيجة: <span className="text-emerald-500 font-black">{practiceScore.correct}</span> / {practiceScore.total}
              </div>
              <button
                onClick={exitPracticeMode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                <span>خروج للمراجعة</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <div className="text-xs font-bold text-amber-500 dark:text-amber-400 mb-2">
              السؤال المطلوب إعادة حله:
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentPracticeItem.questionSnapshot.questionText}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {(currentPracticeItem.questionSnapshot.options || []).map((opt: string, idx: number) => {
              const isSelected = selectedAnswer === opt;
              const isAnswered = answeredState?.answered;
              const correctAns = currentPracticeItem.questionSnapshot.correctAnswer || "";
              const isRealCorrect = opt.trim().toLowerCase() === correctAns.trim().toLowerCase();

              let btnStyle = "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/60";

              if (isAnswered) {
                if (isRealCorrect) {
                  btnStyle = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-500 dark:border-emerald-500/80 font-black ring-2 ring-emerald-500/30";
                } else if (isSelected && !answeredState.isCorrect) {
                  btnStyle = "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-500 dark:border-rose-500/80 line-through opacity-80";
                } else {
                  btnStyle = "opacity-50 border-slate-200 dark:border-slate-800 bg-transparent";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOptionInPractice(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-right font-medium text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span className="leading-relaxed">{opt}</span>
                  {isAnswered && isRealCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !answeredState.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {answeredState?.answered && (
            <div className={`p-5 rounded-2xl border mb-6 animate-fadeIn ${
              answeredState.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100"
            }`}>
              <div className="flex items-center gap-2 font-black text-sm mb-2">
                {answeredState.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>إجابة صحيحة! تم حذف السؤال من بنك أخطائك تلقائيًا.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <span>إجابة غير دقيقة! ما زال السؤال محفوظاً لديك للمراجعة.</span>
                  </>
                )}
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-bold text-amber-500 dark:text-amber-400">الشرح والتوضيح: </span>
                {answeredState.explanation}
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          {answeredState?.answered && (
            <div className="flex justify-end">
              <button
                onClick={nextPracticeQuestion}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-black text-sm shadow-xl transition-all"
              >
                <span>{practiceIndex + 1 < unresolvedMistakes.length ? "السؤال التالي" : "إنهاء الاختبار"}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* BROWSE MODE: REVIEW LIST & TABS */}
      {mode === "browse" && (
        <div>
          {/* Subtabs: Unresolved vs Mastered */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTabFilter("unresolved")}
                className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 relative ${
                  activeTabFilter === "unresolved"
                    ? "text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>الأسئلة قيد المراجعة</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">
                  {stats.totalUnresolved}
                </span>
              </button>

              <button
                onClick={() => setActiveTabFilter("mastered")}
                className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 relative ${
                  activeTabFilter === "mastered"
                    ? "text-emerald-500 dark:text-emerald-400 border-b-2 border-emerald-500 font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>أخطاء تم إتقانها</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black">
                  {stats.totalMastered}
                </span>
              </button>
            </div>

            <button
              onClick={reloadMistakes}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </button>
          </div>

          {/* ACTIVE TAB: UNRESOLVED MISTAKES LIST */}
          {activeTabFilter === "unresolved" && (
            <div>
              {unresolvedMistakes.length === 0 ? (
                <div className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xl">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                    رائع جداً! لا توجد أسئلة قيد المراجعة حالياً 🎉
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    بنك أخطائك نظيف تماماً. استمر في حل الكويزات وتدريبات بنك الأسئلة، وسيقوم النظام تلقائياً برصد أي سؤال يحتاج منك تركيزاً إضافياً.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unresolvedMistakes.map((item) => {
                    const isExpanded = expandedCardIds[item.id];
                    const snapshot = item.questionSnapshot;
                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-6 shadow-md hover:border-amber-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black">
                                {snapshot.domainCategory || "عام"}
                              </span>
                              {snapshot.unit && (
                                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                                  {snapshot.unit}
                                </span>
                              )}
                              {item.mistakeCount > 1 && (
                                <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-rose-500" />
                                  <span>تكرر الخطأ {item.mistakeCount} مرات</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                              {snapshot.questionText}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCardExpand(item.id)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title={isExpanded ? "طي التفاصيل" : "عرض التفاصيل"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Card Details */}
                        {isExpanded && (
                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-fadeIn space-y-4">
                            {/* Options review */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(snapshot.options || []).map((opt: string, optIdx: number) => {
                                const isCorrect = opt.trim().toLowerCase() === String(snapshot.correctAnswer || "").trim().toLowerCase();
                                const isUserWrong = opt.trim().toLowerCase() === String(item.wrongAnswer || "").trim().toLowerCase();

                                let optBg = "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50";
                                if (isCorrect) {
                                  optBg = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-bold";
                                } else if (isUserWrong) {
                                  optBg = "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-500 line-through opacity-80 font-bold";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optBg}`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black">
                                        الإجابة الصحيحة
                                      </span>
                                    )}
                                    {isUserWrong && !isCorrect && (
                                      <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black">
                                        إجابتك السابقة
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation Notes */}
                            {snapshot.explanation && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                <span className="font-bold text-amber-600 dark:text-amber-400">ملاحظة المعلم والشرح: </span>
                                {snapshot.explanation}
                              </div>
                            )}

                            {/* Manual Master Button */}
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={async () => {
                                  await resolveQuestion(item.questionId);
                                  showCelebrationToast("تم نقل السؤال إلى قائمة المتقن ✓");
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>أتقنت هذا السؤال بالفعل</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TAB: MASTERED MISTAKES LIST */}
          {activeTabFilter === "mastered" && (
            <div>
              {masteredMistakes.length === 0 ? (
                <div className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xl">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    لم يتم إتقان أي أسئلة بعد
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ابدأ جلسة مراجعة أخطائك الآن وأجب عن الأسئلة لتراها تضاف هنا تلقائيًا!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {masteredMistakes.map((item) => {
                    const snapshot = item.questionSnapshot;
                    return (
                      <div
                        key={item.id}
                        className="bg-white/60 dark:bg-[#101C33]/60 rounded-3xl border border-emerald-500/20 p-5 md:p-6 shadow-sm flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              تم إتقانه بنجاح
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
                              {snapshot.questionText}
                            </h4>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-400">
                          {snapshot.domainCategory || "عام"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MistakesBankWorkspace;
