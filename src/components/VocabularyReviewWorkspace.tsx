"use client";

import React, { useEffect, useState } from "react";
import { BookOpenCheck, ChevronRight, Eye, RotateCcw, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

type ReviewCard = {
  id: string;
  questionText: string;
  questionType: string;
  options: unknown;
  topic: string;
  unit: string | null;
  lesson: string | null;
  difficulty: string;
  isDue: boolean;
};

type RevealedAnswer = { answer: string; explanation: string };

async function requestReviewCards() {
  const response = await fetch("/api/vocabulary-review", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not load review cards");
  return result;
}

export const VocabularyReviewWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const isArabic = lang === "ar";
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [answer, setAnswer] = useState<RevealedAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [requiresProfile, setRequiresProfile] = useState(false);

  useEffect(() => {
    if (user?.role !== "student") return;
    let active = true;
    requestReviewCards()
      .then((result) => {
        if (!active) return;
        setCards(Array.isArray(result.cards) ? result.cards : []);
        setTotalDue(Number(result.totalDue) || 0);
        setRequiresProfile(Boolean(result.requiresProfile));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load review cards");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user?.id, user?.role]);

  const loadCards = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await requestReviewCards();
      setCards(Array.isArray(result.cards) ? result.cards : []);
      setTotalDue(Number(result.totalDue) || 0);
      setRequiresProfile(Boolean(result.requiresProfile));
      setAnswer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load review cards");
    } finally {
      setLoading(false);
    }
  };

  const current = cards[0];
  const choices = Array.isArray(current?.options)
    ? current.options.map((option) => String(option)).filter(Boolean)
    : [];

  const revealAnswer = async () => {
    if (!current || revealing) return;
    setRevealing(true);
    setError("");
    try {
      const response = await fetch("/api/vocabulary-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reveal", questionId: current.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not reveal this answer");
      setAnswer({ answer: String(result.answer || ""), explanation: String(result.explanation || "") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reveal this answer");
    } finally {
      setRevealing(false);
    }
  };

  const rateCard = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!current || !answer || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/vocabulary-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rate", questionId: current.id, rating }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your review");
      if (current.isDue) setTotalDue((count) => Math.max(0, count - 1));
      setCards((remaining) => remaining.slice(1));
      setAnswer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-xl dark:border-violet-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
      <div className="flex items-center justify-between gap-3 border-b border-violet-100 px-5 py-4 dark:border-violet-900/40">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-slate-900 dark:text-white">
              {isArabic ? "مراجعة كلماتك" : "Vocabulary review"}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              {isArabic ? "استرجع الكلمة قبل كشف الإجابة" : "Try to recall it before revealing the answer"}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
          {totalDue} {isArabic ? "مستحقة" : "due"}
        </span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="py-8 text-center text-xs font-bold text-slate-500">{isArabic ? "بنجهز مراجعتك..." : "Preparing your review..."}</div>
        ) : requiresProfile ? (
          <div className="rounded-2xl bg-white/80 p-4 text-center text-xs font-bold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
            {isArabic ? "أكمل الصف الدراسي في ملفك عشان نختار كلمات منهجك." : "Add your grade to your profile so we can choose vocabulary from your curriculum."}
          </div>
        ) : current ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-500" />{current.topic}</span>
              <span>{current.unit}{current.lesson ? ` · ${current.lesson}` : ""} · {cards.length} {isArabic ? "متبقية" : "left"}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-sm font-extrabold leading-7 text-slate-900 dark:text-white" dir="auto">{current.questionText}</p>
              {choices.length > 0 && !answer && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {choices.map((choice, index) => (
                    <div key={`${current.id}-${index}`} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300" dir="auto">
                      {choice}
                    </div>
                  ))}
                </div>
              )}
              {answer && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">{isArabic ? "الإجابة" : "Answer"}</div>
                  <div className="mt-1 text-sm font-black text-slate-900 dark:text-white" dir="auto">{answer.answer}</div>
                  {answer.explanation && <p className="mt-2 text-[11px] leading-5 text-slate-600 dark:text-slate-300" dir="auto">{answer.explanation}</p>}
                </div>
              )}
            </div>

            {!answer ? (
              <button
                type="button"
                onClick={revealAnswer}
                disabled={revealing}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-black text-white transition hover:bg-violet-500 disabled:opacity-60"
              >
                <Eye className="h-4 w-4" />
                {revealing ? (isArabic ? "لحظة..." : "One moment...") : (isArabic ? "اكشف الإجابة" : "Reveal answer")}
              </button>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([
                  ["again", isArabic ? "نسيتها" : "Again", "bg-rose-600 hover:bg-rose-500"],
                  ["hard", isArabic ? "صعبة" : "Hard", "bg-amber-600 hover:bg-amber-500"],
                  ["good", isArabic ? "تذكرتها" : "Good", "bg-emerald-600 hover:bg-emerald-500"],
                  ["easy", isArabic ? "سهلة" : "Easy", "bg-blue-600 hover:bg-blue-500"],
                ] as const).map(([rating, label, color]) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => rateCard(rating)}
                    disabled={saving}
                    className={`rounded-xl px-3 py-2.5 text-xs font-black text-white transition disabled:opacity-60 ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white/80 p-5 text-center dark:bg-slate-800/70">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">{isArabic ? "خلصت مراجعة النهارده 👏" : "Today's review is complete 👏"}</h3>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{isArabic ? "ارجع بعد شوية أو بكرة للكلمات المستحقة." : "Come back later or tomorrow for the next due words."}</p>
            <button type="button" onClick={loadCards} className="mt-3 inline-flex items-center gap-1 rounded-xl bg-violet-100 px-3 py-2 text-[10px] font-black text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
              <RotateCcw className="h-3.5 w-3.5" />{isArabic ? "حدّث المراجعة" : "Refresh review"}<ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
        {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      </div>
    </section>
  );
};
