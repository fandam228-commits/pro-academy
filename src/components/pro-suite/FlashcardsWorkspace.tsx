"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  ChevronRight,
  ChevronLeft,
  Flame,
  HelpCircle,
  BookOpen,
  Filter,
  Zap,
  Target,
  ArrowRight,
  Check,
} from "lucide-react";

interface FlashcardsProps {
  onNavigateHome?: () => void;
}

export const FlashcardsWorkspace: React.FC<FlashcardsProps> = ({ onNavigateHome }) => {
  const { user, lang } = useApp();
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all_cards" | "due_only">("all_cards");

  // Notifications & Stats
  const [xpNotice, setXpNotice] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [totalInDeck, setTotalInDeck] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  const gradeTabs = [
    { id: "all", label: "جميع الصفوف (الكل)" },
    { id: "sec_1", label: "الأول الثانوي" },
    { id: "sec_2", label: "الثاني الثانوي" },
    { id: "sec_3", label: "الثالث الثانوي (ثانوية عامة)" },
  ];

  const categoryTabs = [
    { id: "all", label: "كل المحتوى" },
    { id: "core", label: "المفردات الأساسية" },
    { id: "synonyms", label: "المترادفات والمتضادات" },
    { id: "prepositions", label: "حروف الجر والتعبيرات" },
  ];

  // Fetch Deck
  const fetchDeck = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        grade_level: selectedGrade,
        category: selectedCategory,
        filter_mode: filterMode,
        user_id: user?.id || "",
      });

      const res = await fetch(`/api/flashcards/deck?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        setCards(data.cards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setDueCount(data.dueCount || 0);
        setTotalInDeck(data.totalInDeck || 0);
        setMasteredCount(data.masteredCount || 0);
      }
    } catch (e) {
      console.error("Fetch flashcards error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, selectedCategory, filterMode, user?.id]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const currentCard = cards[currentIndex] || null;

  // Audio Speech Synthesis
  const speakWord = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Handle Review action (SM-2 rating: 1=again, 3=hard, 4=good, 5=mastered)
  const handleReviewRating = async (quality: 1 | 3 | 4 | 5) => {
    if (!currentCard || reviewing) return;
    try {
      setReviewing(true);
      const res = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          quality,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.xpAwarded > 0) {
          setXpNotice(data.xpAwarded);
          setTimeout(() => setXpNotice(null), 3000);
        }
        if (data.message) {
          setFeedbackMessage(data.message);
          setTimeout(() => setFeedbackMessage(null), 3500);
        }

        setSessionReviewedCount((prev) => prev + 1);

        // Advance to next card
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        } else {
          // Finished deck
          setCurrentIndex(cards.length);
        }
      }
    } catch (err) {
      console.error("Review rating error:", err);
    } finally {
      setReviewing(false);
    }
  };

  // Keyboard Shortcuts (Space=Flip, 1=Again, 2=Hard, 3=Good, 4=Easy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || !currentCard || reviewing) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1") handleReviewRating(1);
        else if (e.key === "2") handleReviewRating(3);
        else if (e.key === "3") handleReviewRating(4);
        else if (e.key === "4") handleReviewRating(5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, currentCard, isFlipped, reviewing]);

  const isDeckFinished = !loading && cards.length > 0 && currentIndex >= cards.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#102042] to-blue-950 p-6 sm:p-8 rounded-3xl text-white border border-blue-500/20 shadow-2xl relative overflow-hidden text-center sm:text-right">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
              <Layers className="w-3.5 h-3.5" />
              <span>خوارزمية التكرار المتباعد الذكي (SuperMemo SM-2)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>كروت الاستذكار وتثبيت المفردات الوزارية</span>
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              تثبيت كلمات ومصطلحات ومشتقات المنهج في الذاكرة طويلة المدى، مع النطق الصوتي الدقيق والجمل السياقية والترتيب العلمي لمواعيد المراجعة.
            </p>
          </div>

          {/* QUICK STATS PILL */}
          <div className="flex flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-right min-w-[170px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">إجمالي الكروت:</span>
              <span className="font-black text-amber-300">{totalInDeck}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">المستحق اليوم:</span>
              <span className="font-black text-emerald-400">{dueCount} كارت</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">الكلمات المتقنة:</span>
              <span className="font-black text-cyan-300">{masteredCount} 🌟</span>
            </div>
          </div>
        </div>

        {/* GRADE & CATEGORY FILTERS */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 space-y-3">
          {/* Grade Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-300 ml-2">الصف الدراسي:</span>
            {gradeTabs.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGrade === g.id
                    ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Category Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-300 ml-2">نوع المحتوى:</span>
            {categoryTabs.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/30"
                    : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
                }`}
              >
                {c.label}
              </button>
            ))}

            <div className="mr-auto flex items-center gap-2">
              <button
                onClick={() => setFilterMode((prev) => (prev === "all_cards" ? "due_only" : "all_cards"))}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filterMode === "due_only"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {filterMode === "due_only" ? "المستحق اليوم فقط ⚡" : "عرض كل البطاقات 📚"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FLOATING XP NOTICE & MOTIVATIONAL MESSAGE */}
      {xpNotice && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-6 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 fill-current" />
          <span>+{xpNotice} XP مكافأة إتقان الكلمة! أحسنت!</span>
        </div>
      )}

      {feedbackMessage && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs font-bold text-blue-700 dark:text-blue-300 text-center animate-in fade-in duration-200">
          {feedbackMessage}
        </div>
      )}

      {/* 3. MAIN FLASHCARD INTERACTION CANVAS */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">جاري تحميل حزمة البطاقات الذكية...</p>
        </div>
      ) : isDeckFinished ? (
        /* FINISHED DECK SCREEN */
        <div className="bg-white dark:bg-[#101b33] p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto text-4xl shadow-inner">
            🎉
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              أحسنت صنعاً يا بطل! أنهيت جلسة الاستذكار
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              راجعت بنجاح <span className="font-black text-amber-500">{sessionReviewedCount}</span> بطاقة في هذه الجلسة. خوارزمية SM-2 قامت بجدولة مواعيد المراجعة القادمة تلقائياً.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                fetchDeck();
              }}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>مراجعة الحزمة مرة أخرى</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                العودة للرئيسية
              </button>
            )}
          </div>
        </div>
      ) : currentCard ? (
        /* ACTIVE CARD DISPLAY */
        <div className="space-y-6">
          {/* Progress Bar & Indicators */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-300">
                البطاقة <span className="text-amber-500 font-black">{currentIndex + 1}</span> من {cards.length}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-500">{currentCard.gradeLabelAr}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">مستوى الإتقان:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                currentCard.masteryLevel >= 3
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                  : currentCard.masteryLevel === 2
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {currentCard.masteryLevel >= 3 ? "متقن 🌟" : currentCard.masteryLevel === 2 ? "مألوف" : "قيد الحفظ"}
              </span>
            </div>
          </div>

          {/* 3D FLIPPABLE CARD CONTAINER */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="w-full min-h-[340px] sm:min-h-[380px] bg-white dark:bg-[#101C33] rounded-3xl p-6 sm:p-10 border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative cursor-pointer select-none transition-all hover:border-amber-400/50 flex flex-col justify-between"
          >
            {/* Top Card Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
                {currentCard.unitName}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentCard.word);
                }}
                className="w-10 h-10 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-500 flex items-center justify-center transition-all shadow-sm"
                title="استمع للنطق الصوتي الأمريكي"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* CARD CENTER CONTENT */}
            {!isFlipped ? (
              /* FRONT OF CARD */
              <div className="text-center py-8 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black">
                  {currentCard.partOfSpeech}
                </span>

                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-wide font-sans">
                  {currentCard.word}
                </h3>

                <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-4">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>انقر على البطاقة (أو اضغط Space) لعرض المعنى والمشتقات</span>
                </p>
              </div>
            ) : (
              /* BACK OF CARD (MEANING, DEFINITION, SYNONYMS & CONTEXT) */
              <div className="text-right py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Meaning */}
                <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-center sm:text-right">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black block mb-0.5">
                    المعنى العربي الدقيق:
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-300">
                    {currentCard.meaningAr}
                  </h4>
                </div>

                {/* English Definition */}
                {currentCard.definitionEn && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-400 block mb-0.5">English Definition:</span>
                    <p className="italic font-serif">{currentCard.definitionEn}</p>
                  </div>
                )}

                {/* Example Sentence */}
                {currentCard.exampleEn && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">
                      جملة سياقية من المنهج الوزاري:
                    </span>
                    <p className="font-serif text-slate-800 dark:text-slate-200 leading-relaxed" dir="ltr">
                      &quot;{currentCard.exampleEn}&quot;
                    </p>
                  </div>
                )}

                {/* Synonyms & Antonyms */}
                {Array.isArray(currentCard.synonyms) && currentCard.synonyms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold ml-1">المرادفات:</span>
                    {currentCard.synonyms.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[11px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>نظام التكرار المتباعد SM-2</span>
              </span>
              <span>{isFlipped ? "اختر مستوى إجابتك بالأسفل 👇" : "اقلب البطاقة للتقييم"}</span>
            </div>
          </div>

          {/* 4. SM-2 INTERACTIVE 4-BUTTON RESPONSE BAR */}
          {isFlipped && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. AGAIN (🔴 10m) */}
                <button
                  onClick={() => handleReviewRating(1)}
                  disabled={reviewing}
                  className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all cursor-pointer text-center group"
                >
                  <div className="text-rose-500 font-black text-sm mb-0.5">إعادة 🔄</div>
                  <div className="text-[11px] opacity-80">&lt; 10 دقائق (مفتاح 1)</div>
                </button>

                {/* 2. HARD (🟡 1d) */}
                <button
                  onClick={() => handleReviewRating(3)}
                  disabled={reviewing}
                  className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs transition-all cursor-pointer text-center group"
                >
                  <div className="text-amber-500 font-black text-sm mb-0.5">صعب ⏳</div>
                  <div className="text-[11px] opacity-80">مراجعة غداً (مفتاح 2)</div>
                </button>

                {/* 3. GOOD (🟢 4d) */}
                <button
                  onClick={() => handleReviewRating(4)}
                  disabled={reviewing}
                  className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all cursor-pointer text-center group"
                >
                  <div className="text-emerald-500 font-black text-sm mb-0.5">جيد 👍</div>
                  <div className="text-[11px] opacity-80">بعد 4 أيام (مفتاح 3)</div>
                </button>

                {/* 4. EASY / MASTERED (🔵 7d +5 XP) */}
                <button
                  onClick={() => handleReviewRating(5)}
                  disabled={reviewing}
                  className="p-3.5 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border-2 border-blue-500/40 text-blue-700 dark:text-blue-300 font-bold text-xs transition-all cursor-pointer text-center group"
                >
                  <div className="text-blue-500 font-black text-sm mb-0.5 flex items-center justify-center gap-1">
                    <span>متقن 🌟</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black">+5 XP</span>
                  </div>
                  <div className="text-[11px] opacity-80">بعد أسبوع (مفتاح 4)</div>
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                اختصارات لوحة المفاتيح: المسافة (Space) لقلب البطاقة • الأرقام 1, 2, 3, 4 للتقييم السريع
              </p>
            </div>
          )}
        </div>
      ) : (
        /* NO CARDS MATCH */
        <div className="bg-white dark:bg-[#101b33] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-sm font-bold text-slate-400">لا توجد بطاقات مطابقة لخيارات التصفية المحددة.</p>
          <button
            onClick={() => {
              setSelectedGrade("all");
              setSelectedCategory("all");
              setFilterMode("all_cards");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            عرض جميع البطاقات
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardsWorkspace;
