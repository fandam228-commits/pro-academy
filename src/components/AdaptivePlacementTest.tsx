"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  RefreshCw,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

type PlacementSkill = "language" | "functional" | "reading";
type PlacementStage = "intro" | "questions" | "review" | "result";

interface PlacementQuestion {
  id: string;
  skill: PlacementSkill;
  prompt: string;
  options: string[];
  passage?: string;
}

interface PlacementQuestionSet {
  version: string;
  estimatedMinutes: number;
  questionCount: number;
  questions: PlacementQuestion[];
}

interface PlacementResult {
  level: string;
  score: number;
  total: number;
  bandResults: Array<{ level: string; correct: number; total: number; percent: number }>;
  skillResults: Array<{ skill: PlacementSkill; correct: number; total: number; percent: number }>;
  descriptor: { title: string; ar: string; en: string };
  interpretation: "approximate" | "clearer-pattern";
  foundationSupport: boolean;
  missedQuestions: Array<{
    id: string;
    level: string;
    skill: PlacementSkill;
    prompt: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
}

async function requestQuestionSet(): Promise<PlacementQuestionSet> {
  const response = await fetch("/api/placement-test", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load the placement test.");
  return data;
}

const skillLabels: Record<PlacementSkill, { ar: string; en: string }> = {
  language: { ar: "القواعد والمفردات", en: "Grammar & vocabulary" },
  functional: { ar: "الاستخدام الوظيفي", en: "Functional English" },
  reading: { ar: "فهم المقروء", en: "Reading comprehension" },
};

export const AdaptivePlacementTest: React.FC<{ onComplete?: (level: string) => void }> = ({ onComplete }) => {
  const { lang, user } = useApp();
  const ar = lang === "ar";
  const [questionSet, setQuestionSet] = useState<PlacementQuestionSet | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<PlacementStage>("intro");
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "student") return;
    let active = true;
    requestQuestionSet()
      .then((data) => {
        if (active) setQuestionSet(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the placement test.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user?.id, user?.role]);

  const questions = questionSet?.questions || [];
  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const missingCount = Math.max(0, questions.length - answeredCount);

  const handleSubmit = async () => {
    if (!questionSet || submitting) return;
    if (missingCount > 0) {
      const firstMissing = questions.findIndex((question) => answers[question.id] === undefined);
      setError(ar ? `لسه فيه ${missingCount} سؤال من غير إجابة. هتنتقل لأول سؤال ناقص.` : `${missingCount} questions are unanswered. Moving to the first one.`);
      setCurrentIndex(Math.max(0, firstMissing));
      setStage("questions");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/placement-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not score your assessment.");
      setResult(data.result as PlacementResult);
      setStage("result");
      onComplete?.(data.result.level);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save your result.");
    } finally {
      setSubmitting(false);
    }
  };

  const retake = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await requestQuestionSet();
      setQuestionSet(data);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setStage("intro");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not restart the test.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "student") {
    return <div className="mx-auto my-8 max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-bold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">{ar ? "اختبار تحديد المستوى متاح لحسابات الطلاب." : "The placement test is available to student accounts."}</div>;
  }

  if (loading) {
    return <div className="mx-auto my-8 max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-xl dark:border-slate-800 dark:bg-slate-900">{ar ? "بنجهز اختبار تحديد المستوى..." : "Preparing your placement test..."}</div>;
  }

  if (!questionSet) {
    return <div className="mx-auto my-8 max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">{error || (ar ? "تعذر تحميل الاختبار." : "The test could not be loaded.")}</div>;
  }

  return (
    <main className="mx-auto my-8 max-w-4xl space-y-5 px-4" dir={ar ? "rtl" : "ltr"}>
      {stage === "intro" && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-7 text-white sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold text-blue-100">
              <Sparkles className="h-4 w-4 text-amber-300" />CEFR · A1–C2
            </div>
            <h1 className="mt-5 text-2xl font-black sm:text-3xl">{ar ? "اختبار تحديد مستوى شامل" : "Comprehensive English Placement Test"}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              {ar ? "48 سؤالًا متدرجًا في القواعد والمفردات وفهم المقروء والاستخدام الوظيفي. النتيجة تحدد مستوى تقديريًا من A1 إلى C2 وتحفظه في ملفك." : "48 progressive questions in grammar, vocabulary, reading and functional English. Your estimated A1–C2 result is saved to your student profile."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2"><BookOpenCheck className="h-3.5 w-3.5" />{ar ? "6 مستويات · 8 أسئلة لكل مستوى" : "6 levels · 8 questions per level"}</span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2"><Clock3 className="h-3.5 w-3.5" />{ar ? `حوالي ${questionSet.estimatedMinutes} دقيقة` : `About ${questionSet.estimatedMinutes} minutes`}</span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2"><GraduationCap className="h-3.5 w-3.5" />{ar ? "النتيجة تتحفظ في حسابك" : "Result saved to your account"}</span>
            </div>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">{ar ? "قبل ما تبدأ" : "Before you begin"}</h2>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                <li>• {ar ? "اختار أفضل إجابة، وتقدر ترجع للأسئلة وتغيّر إجاباتك قبل التسليم." : "Choose the best answer. You can revisit questions and change answers before submitting."}</li>
                <li>• {ar ? "مفيش تصحيح أثناء الاختبار؛ هتشوف نتيجتك والشرح بعد التسليم." : "There is no feedback during the test; your score and explanations appear after submission."}</li>
                <li>• {ar ? "النتيجة تقديرية وليست شهادة رسمية؛ الاختبار لا يقيس التحدث أو الكتابة." : "This is an in-platform estimate, not an official certificate; speaking and writing are not assessed."}</li>
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wide text-blue-700 dark:text-blue-300">{ar ? "المستويات" : "CEFR bands"}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <span key={level} className="rounded-lg bg-white px-2 py-1 text-xs font-black text-blue-800 shadow-sm dark:bg-slate-900 dark:text-blue-200">{level}</span>)}
                </div>
                <p className="mt-3 text-[10px] leading-5 text-slate-500 dark:text-slate-400">{ar ? "التصنيف مبني على إجاباتك في كل مستوى، وليس على عدد الإجابات الصحيحة فقط." : "The placement uses your performance across each band, not only your total correct answers."}</p>
              </div>
              <button type="button" onClick={() => { setError(""); setStage("questions"); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110">
                {ar ? "ابدأ الاختبار" : "Start assessment"}<ChevronRight className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </section>
      )}

      {stage === "questions" && current && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="text-xs font-black text-blue-700 dark:text-blue-300">{ar ? `السؤال ${currentIndex + 1} من ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`}</div>
              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{ar ? `${answeredCount} تمت الإجابة · ${missingCount} متبقي` : `${answeredCount} answered · ${missingCount} remaining`}</div>
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-extrabold text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">{ar ? skillLabels[current.skill].ar : skillLabels[current.skill].en}</span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={ar ? "تقدم الاختبار" : "Test progress"} aria-valuenow={currentIndex + 1} aria-valuemin={0} aria-valuemax={questions.length}>
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-[width]" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          {current.passage && <div className="mt-6 whitespace-pre-line rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-7 text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/25 dark:text-slate-200" dir="ltr">{current.passage}</div>}
          <h2 className="mt-6 text-lg font-extrabold leading-8 text-slate-900 dark:text-white" dir="ltr">{current.prompt}</h2>

          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label={ar ? "اختيارات الإجابة" : "Answer choices"}>
            {current.options.map((option, optionIndex) => {
              const selected = answers[current.id] === optionIndex;
              return (
                <button
                  key={`${current.id}-${optionIndex}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => { setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: optionIndex })); setError(""); }}
                  className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border p-4 text-start text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${selected ? "border-blue-600 bg-blue-50 font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
                  dir="ltr"
                >
                  <span>{option}</span><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-400 text-transparent"}`}>{selected && <CheckCircle2 className="h-4 w-4" />}</span>
                </button>
              );
            })}
          </div>

          {error && <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button type="button" disabled={currentIndex === 0} onClick={() => { setCurrentIndex((index) => Math.max(0, index - 1)); setError(""); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"><ArrowLeft className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} />{ar ? "السابق" : "Previous"}</button>
            {currentIndex < questions.length - 1 ? (
              <button type="button" onClick={() => { setCurrentIndex((index) => Math.min(questions.length - 1, index + 1)); setError(""); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-blue-500">{ar ? "التالي" : "Next"}<ArrowRight className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} /></button>
            ) : (
              <button type="button" onClick={() => { setError(""); setStage("review"); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-indigo-500">{ar ? "مراجعة الإجابات" : "Review answers"}<ChevronRight className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} /></button>
            )}
          </div>
        </section>
      )}

      {stage === "review" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"><BookOpenCheck className="h-5 w-5" /></div>
            <div><h2 className="text-lg font-black text-slate-900 dark:text-white">{ar ? "راجع إجاباتك" : "Review your answers"}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ar ? `${answeredCount} من ${questions.length} سؤال تمت الإجابة عنه` : `${answeredCount} of ${questions.length} questions answered`}</p></div>
          </div>
          <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
            {questions.map((question, index) => {
              const answered = answers[question.id] !== undefined;
              return <button key={question.id} type="button" onClick={() => { setCurrentIndex(index); setStage("questions"); }} aria-label={`${ar ? "السؤال" : "Question"} ${index + 1}${answered ? "" : ar ? " - بدون إجابة" : " - unanswered"}`} className={`aspect-square rounded-xl border text-xs font-black transition ${answered ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"}`}>{index + 1}</button>;
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span>● {ar ? "تمت الإجابة" : "Answered"}</span><span className="text-amber-700 dark:text-amber-300">● {ar ? "ناقص" : "Unanswered"}</span></div>
          {error && <div role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error}</div>}
          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button type="button" onClick={() => { setStage("questions"); setCurrentIndex(questions.length - 1); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"><ArrowLeft className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} />{ar ? "العودة للأسئلة" : "Back to test"}</button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/15 disabled:cursor-wait disabled:opacity-60">{submitting ? (ar ? "بنحسب النتيجة..." : "Scoring your test...") : (ar ? "سلّم الاختبار" : "Submit assessment")}<Send className="h-4 w-4" /></button>
          </div>
        </section>
      )}

      {stage === "result" && result && (
        <section className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-2xl dark:border-blue-900/50 dark:bg-slate-900">
            <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-7 text-white sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/15 shadow-lg"><Trophy className="h-8 w-8 text-amber-300" /></div>
              <h1 className="mt-4 text-center text-2xl font-black">{ar ? "نتيجة تحديد مستواك" : "Your placement result"}</h1>
              <div className="mt-6 text-center">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider">CEFR {result.level} · {result.descriptor.title}</span>
                <div className="mt-4 text-5xl font-black tracking-tight">{result.level}</div>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-blue-100">{ar ? result.descriptor.ar : result.descriptor.en}</p>
                <p className="mt-3 text-xs font-bold text-white/90">{result.score} / {result.total} {ar ? "إجابة صحيحة" : "correct answers"}</p>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">{ar ? "ملف مهاراتك" : "Your skill profile"}</h2>
                <div className="mt-4 space-y-4">
                  {result.skillResults.map((skill) => (
                    <div key={skill.skill}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-bold text-slate-700 dark:text-slate-200">{ar ? skillLabels[skill.skill].ar : skillLabels[skill.skill].en}</span><span className="font-black text-blue-700 dark:text-blue-300">{skill.percent}% <span className="text-[10px] font-medium text-slate-400">({skill.correct}/{skill.total})</span></span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={skill.percent} aria-valuemin={0} aria-valuemax={100}>
                        <div className={`h-full rounded-full ${skill.percent >= 70 ? "bg-emerald-500" : skill.percent >= 45 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${skill.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <h2 className="mt-7 text-sm font-black text-slate-900 dark:text-white">{ar ? "أداؤك عبر المستويات" : "Performance by CEFR band"}</h2>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {result.bandResults.map((band) => <div key={band.level} className="rounded-xl border border-slate-200 p-2 text-center dark:border-slate-700"><div className="text-xs font-black text-slate-800 dark:text-white">{band.level}</div><div className="mt-1 text-[10px] font-bold text-slate-500">{band.correct}/{band.total}</div><div className="mt-1 text-[10px] font-black text-blue-700 dark:text-blue-300">{band.percent}%</div></div>)}
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-2xl border p-4 ${result.interpretation === "approximate" ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30" : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"}`}>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{ar ? "تفسير النتيجة" : "How to read this result"}</div>
                  <p className="mt-2 text-[11px] leading-6 text-slate-700 dark:text-slate-300">{result.interpretation === "approximate" ? (ar ? "نتيجتك قريبة من حدّ فاصل بين مستويين؛ اعتبر المستوى تقديريًا وراجع نتائج المهارات قبل اختيار خطة الدراسة." : "Your score is close to a band boundary. Treat the placement as approximate and review the skill profile before choosing a study plan.") : (ar ? "إجاباتك أظهرت نمطًا أوضح عبر المستويات. استخدم النتيجة كنقطة بداية لخطة الدراسة." : "Your answers showed a clearer pattern across bands. Use this result as a starting point for your study plan.")}</p>
                  {result.foundationSupport && <p className="mt-2 text-[11px] font-bold leading-6 text-amber-800 dark:text-amber-200">{ar ? "ابدأ بمراجعة أساسيات ما قبل A1 وA1؛ نتيجتك ما زالت ضمن A1 لكن الأسئلة الأساسية تحتاج تدريبًا إضافيًا." : "Start with pre-A1 and A1 foundations; your result is in A1, with some basic skills needing more practice."}</p>}
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="text-xs font-black text-blue-900 dark:text-blue-100">{ar ? "الخطوة التالية" : "Next step"}</div>
                  <p className="mt-2 text-[11px] leading-6 text-slate-700 dark:text-slate-300">{ar ? result.level === "A1" || result.level === "A2" ? "ابدأ بتثبيت الجمل الأساسية والكلمات الشائعة، ثم أعد الاختبار بعد المراجعة." : result.level === "B1" || result.level === "B2" ? "ركّز على فهم النصوص والتراكيب المتوسطة والمتقدمة، ثم تدرب على التحدث والكتابة مع معلم لتكملة الصورة." : "تدرب على النصوص الأكاديمية والفروق الدقيقة في المعنى، وأكمل تقييم التحدث والكتابة مع معلم." : result.level === "A1" || result.level === "A2" ? "Build confidence with core sentence patterns and high-frequency vocabulary, then retake the test after review." : result.level === "B1" || result.level === "B2" ? "Focus on reading and more complex structures, then assess speaking and writing with a teacher." : "Practise academic texts and subtle meaning, and complete a teacher-led speaking and writing assessment."}</p>
                </div>
              </div>
            </div>
          </div>

          {result.missedQuestions.length > 0 && (
            <details className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer list-none text-sm font-black text-slate-900 marker:hidden dark:text-white">{ar ? `راجع الأسئلة التي تحتاج تدريبًا (${result.missedQuestions.length})` : `Review questions to practise (${result.missedQuestions.length})`}</summary>
              <div className="mt-4 space-y-3">
                {result.missedQuestions.map((question) => (
                  <article key={question.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{question.level}</span><span className="text-[9px] font-bold text-slate-500">{ar ? skillLabels[question.skill].ar : skillLabels[question.skill].en}</span></div>
                    <p className="text-sm font-bold leading-6 text-slate-900 dark:text-white" dir="ltr">{question.prompt}</p>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400" dir="ltr">{ar ? "إجابتك:" : "Your answer:"} {question.selectedAnswer}</p>
                    <p className="mt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300" dir="ltr">{ar ? "الإجابة الصحيحة:" : "Correct answer:"} {question.correctAnswer}</p>
                    <p className="mt-2 text-[10px] leading-5 text-slate-600 dark:text-slate-300" dir="ltr">{question.explanation}</p>
                  </article>
                ))}
              </div>
            </details>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={retake} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw className="h-4 w-4" />{ar ? "أعد الاختبار بنموذج مختلف" : "Retake with a new question order"}</button>
          </div>
        </section>
      )}
    </main>
  );
};
