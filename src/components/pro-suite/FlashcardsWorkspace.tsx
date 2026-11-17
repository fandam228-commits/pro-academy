"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface FlashcardsProps {
  onNavigateHome?: () => void;
}

export const FlashcardsWorkspace: React.FC<FlashcardsProps> = ({ onNavigateHome }) => {
  const { user } = useApp();
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [xpNotice, setXpNotice] = useState<number | null>(null);

  // Fetch Deck
  const fetchDeck = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/flashcards/deck?grade_level=3rd_sec&unit_name=${selectedUnit}&user_id=${user?.id || ""}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        setCards(data.cards);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (e) {
      console.error("Fetch flashcards error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
  }, [selectedUnit]);

  const currentCard = cards[currentIndex] || null;

  // Speak pronunciation
  const speakWord = (word: string) => {
    if (!word || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Handle Review action ('hard' | 'good' | 'mastered')
  const handleReviewAction = async (action: "hard" | "good" | "mastered") => {
    if (!currentCard || reviewing) return;
    try {
      setReviewing(true);
      const res = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          action,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.xpAwarded > 0) {
        setXpNotice(data.xpAwarded);
        setTimeout(() => setXpNotice(null), 3000);
      }

      // Advance to next card
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        // Deck finished, reload
        fetchDeck();
      }
    } catch (err) {
      console.error("Review action error:", err);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131e3a] to-blue-950 p-6 sm:p-8 rounded-3xl text-white border border-blue-500/20 shadow-xl relative overflow-hidden text-center sm:text-right">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              <span>نظام التكرار المتباعد الذكي (Spaced Repetition)</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>فلاش كاردز المفردات التفاعلية</span>
              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                PRO FLASHCARDS
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              ثبّت كلمات منهج الثانوية العامة في ذاكرتك طويلة المدى بنطق صوتي أمريكي دقيق وتوقيت مراجعة ذكي.
            </p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/10 shrink-0"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0" />
              <span>الرئيسية</span>
            </button>
          )}
        </div>

        {/* UNIT SELECTOR */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setSelectedUnit("all")}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedUnit === "all" ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-800 text-slate-300"
            }`}
          >
            جميع الوحدات
          </button>
          <button
            onClick={() => setSelectedUnit("Unit 1: Read all about it")}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedUnit === "Unit 1: Read all about it"
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            الوحدة الأولى (Unit 1)
          </button>
          <button
            onClick={() => setSelectedUnit("Unit 2: Her story")}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedUnit === "Unit 2: Her story"
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            الوحدة الثانية (Unit 2)
          </button>
        </div>
      </div>

      {/* GAMIFICATION XP ALERT */}
      {xpNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm">إتقان ممتاز للمفردات! ربحت +{xpNotice} XP 🎉</p>
              <p className="text-xs opacity-90">تم نقل الكلمة إلى قائمة الكلمات المتقنة بنجاح.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLASHCARD DECK RUNNER */}
      {loading ? (
        <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">جاري تجهيز بطاقات الذاكرة...</p>
        </div>
      ) : currentCard ? (
        <div className="space-y-4">
          {/* PROGRESS BAR & COUNTER */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>البطاقة {currentIndex + 1} من {cards.length}</span>
            <span className="text-blue-600 dark:text-blue-400">{currentCard.unitName}</span>
          </div>

          {/* 3D FLIP CARD CONTAINER */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 sm:h-96 rounded-3xl cursor-pointer perspective-1000 select-none transition-all hover:scale-101"
          >
            <div
              className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* FRONT SIDE (English Word + Audio) */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentCard.partOfSpeech}
                  </span>
                  <span className="text-[11px] text-amber-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>انقر لقلب البطاقة</span>
                  </span>
                </div>

                {/* WORD DISPLAY */}
                <div className="space-y-3 my-auto" dir="ltr">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentCard.word}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentCard.word);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition font-bold text-xs cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>استمع للنطق (Pronounce)</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">انقر في أي مكان لمعاينة المعنى العربي والأمثلة والمترادفات ↻</p>
              </div>

              {/* BACK SIDE (Arabic Meaning + Synonyms + Example) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-blue-500/40 shadow-xl flex flex-col justify-between text-center sm:text-right">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold border-b border-white/10 pb-2">
                  <span>المعنى والتوظيف الأكاديمي</span>
                  <span className="font-mono text-xs text-white" dir="ltr">{currentCard.word}</span>
                </div>

                <div className="space-y-4 my-auto">
                  {/* ARABIC MEANING */}
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold">المعنى باللغة العربية:</p>
                    <h4 className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                      {currentCard.meaningAr}
                    </h4>
                  </div>

                  {/* EXAMPLE */}
                  {currentCard.exampleEn && (
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 text-left font-sans leading-relaxed" dir="ltr">
                      <p className="text-[10px] text-amber-300 font-bold mb-1 text-right" dir="rtl">مثال توضيحي سياقي:</p>
                      "{currentCard.exampleEn}"
                    </div>
                  )}

                  {/* SYNONYMS */}
                  {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold mb-1.5">مترادفات هامة (Synonyms):</p>
                      <div className="flex flex-wrap gap-1.5" dir="ltr">
                        {currentCard.synonyms.map((syn: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono text-[10px] font-bold"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 text-center">انقر للعودة إلى الوجه الأول ↺</p>
              </div>
            </div>
          </div>

          {/* 3. THREE ACTION BUTTONS */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={() => handleReviewAction("hard")}
              disabled={reviewing}
              className="py-3 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-black text-xs hover:bg-rose-100 transition cursor-pointer flex flex-col items-center gap-0.5"
            >
              <span>صعبة ❌</span>
              <span className="text-[9px] opacity-75 font-normal">كررها بعد 10 دقائق</span>
            </button>

            <button
              onClick={() => handleReviewAction("good")}
              disabled={reviewing}
              className="py-3 px-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 font-black text-xs hover:bg-blue-100 transition cursor-pointer flex flex-col items-center gap-0.5"
            >
              <span>جيدة 👍</span>
              <span className="text-[9px] opacity-75 font-normal">راجعها بعد يومين</span>
            </button>

            <button
              onClick={() => handleReviewAction("mastered")}
              disabled={reviewing}
              className="py-3 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 transition cursor-pointer flex flex-col items-center gap-0.5"
            >
              <span>أتقنتها تماماً ✓</span>
              <span className="text-[9px] font-bold">+5 XP وتثبيت أسبوعي</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            رائع! أنهيت جميع البطاقات المجدولة للمراجعة اليوم 🌟
          </h3>
          <p className="text-xs text-slate-500">
            تم تحديث مواعيد المراجعة القادمة وفق خوارزمية التكرار المتباعد.
          </p>
          <button
            onClick={fetchDeck}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            مراجعة البطاقات مرة أخرى
          </button>
        </div>
      )}
    </div>
  );
};
