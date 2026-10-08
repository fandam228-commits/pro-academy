"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import { Clock, CheckCircle2, XCircle, Volume2, HelpCircle, ArrowRight, ArrowLeft, Send, Sparkles, Award, Printer } from "lucide-react";

interface Question {
  id: string;
  type: string; // 'mcq', 'true_false', 'fill_blanks', 'correction', 'writing', 'listening'
  questionText: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
  domainCategory?: string;
}

interface QuizPlayerProps {
  quizId: string;
  title: string;
  durationMinutes?: number;
  questions: Question[];
  onComplete?: (submission: any) => void;
  submissionTarget?: "quiz" | "smart_exam";
  onExit?: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizId,
  title,
  durationMinutes = 30,
  questions,
  onComplete,
  submissionTarget = "quiz",
  onExit,
}) => {
  const { user, lang } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Timer Countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isSubmitted]);

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (ans: string) => {
    if (currentQ.type === "multi_select") {
      let selected: string[] = [];
      try {
        selected = JSON.parse(userAnswers[currentQ.id] || "[]");
        if (!Array.isArray(selected)) selected = [];
      } catch {
        selected = [];
      }
      const next = selected.includes(ans)
        ? selected.filter((x) => x !== ans)
        : [...selected, ans];
      setUserAnswers({ ...userAnswers, [currentQ.id]: JSON.stringify(next) });
      return;
    }
    setUserAnswers({ ...userAnswers, [currentQ.id]: ans });
  };

  const handleSubmit = async () => {
    if (isSubmitted || loading) return;
    setLoading(true);

    try {
      let data: any;

      if (submissionTarget === "smart_exam") {
        const res = await fetch("/api/question-bank", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            action: "submit_exam",
            examId: quizId,
            studentId: user?.id || "usr_student_1",
            userAnswers,
          }),
        });
        const json = await res.json();
        if (json.success) {
          const passed = json.passed;
          data = {
            success: true,
            score: json.score,
            percentage: json.percentage,
            passed,
            details: json.feedback,
            summaryText: passed
              ? lang === "ar"
                ? `أداء رائع! حصلت على ${json.percentage}% في الامتحان الذكي. استمر على هذا المستوى!`
                : `Great performance! You scored ${json.percentage}% on the smart exam. Keep it up!`
              : lang === "ar"
              ? `حصلت على ${json.percentage}%. راجع الشروحات بالأسفل وركز على نقاط الضعف قبل إعادة المحاولة.`
              : `You scored ${json.percentage}%. Review explanations below and focus on weak points.`,
          };
        }
      } else {
        const res = await fetch("/api/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            action: "submit",
            submissionData: {
              quizId,
              studentId: user?.id || "usr_student_1",
              userAnswers,
            },
          }),
        });
        data = await res.json();
      }

      if (data?.success) {
        setResult(data);
        setIsSubmitted(true);
        if (onComplete) onComplete(data);
      }
    } catch (e) {
      console.error("Quiz submission error:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatAnswer = (value: string, type?: string) => {
    if (type === "multi_select") {
      try {
        const parsed = JSON.parse(value || "[]");
        if (Array.isArray(parsed)) return parsed.join(" + ");
      } catch {}
    }
    return value;
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        {lang === "ar" ? "لا توجد أسئلة متاحة في هذا الاختبار حالياً." : "No questions available in this test right now."}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
      {/* HEADER & TIMER */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {lang === "ar" ? "اختبار التقييم التفاعلي" : "Interactive Quiz Module"}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{title}</h2>
        </div>

        <div className="flex items-center gap-2 no-print">
          {/* PRINT EXAM AS PAPER */}
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
            title={lang === "ar" ? "طباعة الامتحان كورقة" : "Print exam as paper"}
          >
            <Printer className="w-4 h-4" />
          </button>

          {!isSubmitted && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-2xl border border-red-200 dark:border-red-800/40 font-mono font-bold text-sm animate-pulse">
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {!isSubmitted ? (
        <div>
          {/* QUESTION NAVIGATION BADGES */}
          <div className="flex flex-wrap gap-2 mb-6">
            {questions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                      : isAnswered
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* AUDIO PLAYER FOR LISTENING QUESTIONS */}
          {currentQ.type === "listening" && currentQ.audioUrl && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-xl">
                <Volume2 className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                  {lang === "ar" ? "استمع للمقطع الصوتي ثم أجب:" : "Listen to audio clip then answer:"}
                </p>
                <audio controls src={currentQ.audioUrl} className="w-full h-8" />
              </div>
            </div>
          )}

          {/* QUESTION TEXT */}
          <div className="mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mb-2 inline-block">
              {lang === "ar" ? `السؤال ${currentIndex + 1} من ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`} ({currentQ.type.toUpperCase()})
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed mt-1">
              {currentQ.questionText}
            </p>
          </div>

          {/* ANSWER INPUTS BASED ON QUESTION TYPE */}
          <div className="space-y-3 mb-8">
            {/* MCQ / TRUE-FALSE / LISTENING / MULTI-SELECT */}
            {(currentQ.type === "mcq" || currentQ.type === "true_false" || currentQ.type === "listening" || currentQ.type === "multi_select") && currentQ.options && (
              <>
                {currentQ.type === "multi_select" && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                    {lang === "ar" ? "اختر إجابتين صحيحتين" : "Choose TWO correct answers"}
                  </p>
                )}
                {currentQ.options.map((opt, i) => {
                  let isSelected = false;
                  if (currentQ.type === "multi_select") {
                    try {
                      const selected = JSON.parse(userAnswers[currentQ.id] || "[]");
                      isSelected = Array.isArray(selected) && selected.includes(opt);
                    } catch {}
                  } else {
                    isSelected = userAnswers[currentQ.id] === opt;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-start p-4 rounded-2xl font-medium text-sm border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-4 h-4 ${currentQ.type === "multi_select" ? "rounded-md" : "rounded-full"} border ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-400"}`} />
                    </button>
                  );
                })}
              </>
            )}

            {/* FILL BLANKS / CORRECTION / WRITING */}
            {(currentQ.type === "fill_blanks" || currentQ.type === "correction" || currentQ.type === "writing") && (
              <div>
                <textarea
                  rows={currentQ.type === "writing" ? 4 : 2}
                  value={userAnswers[currentQ.id] || ""}
                  onChange={(e) => handleOptionSelect(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Type your answer here..."}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{lang === "ar" ? "السابق" : "Previous"}</span>
            </button>

            {currentIndex + 1 < questions.length ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25"
              >
                <span>{lang === "ar" ? "التالي" : "Next"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? (lang === "ar" ? "جاري التصحيح..." : "Grading...") : (lang === "ar" ? "تسليم الاختبار" : "Submit Quiz")}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* EXAM REVIEW RESULTS */
        <div>
          <div className="text-center py-6 border-b border-slate-100 dark:border-slate-800 mb-8">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl mb-4 ${
                result?.passed ? "bg-emerald-500 shadow-emerald-500/30" : "bg-amber-500 shadow-amber-500/30"
              }`}
            >
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {result?.passed
                ? (lang === "ar" ? "تهانينا! لقد اجتزت الاختبار بنجاح 🎉" : "Congratulations! You Passed 🎉")
                : (lang === "ar" ? "حاول مرة أخرى لتحسين درجتك" : "Keep Trying! Review Explanations")}
            </h3>

            <div className="mt-4 inline-flex items-center gap-6 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs text-slate-400 block">{lang === "ar" ? "النتيجة" : "Score"}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{result?.score} pts</span>
              </div>
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-700" />
              <div>
                <span className="text-xs text-slate-400 block">{lang === "ar" ? "النسبة" : "Percentage"}</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{result?.percentage}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 max-w-2xl mx-auto">
              {(() => {
                const details = result?.details || {};
                const total = questions.length || 1;
                const correct = questions.filter((q) => details[q.id]?.isCorrect).length;
                const answered = questions.filter((q) => String(details[q.id]?.studentAnswer || "").trim()).length;
                const wrong = Math.max(0, answered - correct);
                return (
                  <>
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-3"><div className="text-lg font-black text-emerald-600">{correct}</div><div className="text-[9px] font-bold text-slate-500">{lang === "ar" ? "صحيح" : "Correct"}</div></div>
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 p-3"><div className="text-lg font-black text-red-600">{wrong}</div><div className="text-[9px] font-bold text-slate-500">{lang === "ar" ? "خطأ" : "Wrong"}</div></div>
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3"><div className="text-lg font-black text-amber-600">{total - answered}</div><div className="text-[9px] font-bold text-slate-500">{lang === "ar" ? "بدون إجابة" : "Unanswered"}</div></div>
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-3"><div className="text-lg font-black text-blue-600">{total}</div><div className="text-[9px] font-bold text-slate-500">{lang === "ar" ? "إجمالي" : "Total"}</div></div>
                  </>
                );
              })()}
            </div>

            {(() => {
              const details = result?.details || {};
              const groups = ["Vocabulary", "Grammar", "Translation", "Reading", "Writing"];
              const stats = groups.map((group) => {
                const groupQs = questions.filter((q) => q.domainCategory === group);
                const correct = groupQs.filter((q) => details[q.id]?.isCorrect).length;
                return { group, total: groupQs.length, correct, percent: groupQs.length ? Math.round((correct / groupQs.length) * 100) : 0 };
              }).filter((x) => x.total > 0);
              if (!stats.length) return null;
              return (
                <div className="mt-5 max-w-2xl mx-auto text-start">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3">{lang === "ar" ? "تحليل مستواك 📊" : "Performance Analysis 📊"}</h4>
                  <div className="space-y-2">
                    {stats.map((stat) => (
                      <div key={stat.group} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between text-[10px] font-black"><span>{stat.group}</span><span className="text-blue-600">{stat.percent}% ({stat.correct}/{stat.total})</span></div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{width: stat.percent + "%"}} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {onExit && (
              <button onClick={onExit} className="mt-5 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black">
                {lang === "ar" ? "العودة للوحة الطالب" : "Back to Student Dashboard"}
              </button>
            )}

            <p className="mt-4 text-xs font-medium text-slate-600 dark:text-slate-300 max-w-xl mx-auto bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              {result?.summaryText}
            </p>
          </div>

          {/* DETAILED EXPLANATION FOR EACH QUESTION */}
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
            {lang === "ar" ? "مراجعة جميع الأسئلة والشروحات:" : "Question Breakdown & Explanations:"}
          </h4>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {questions.map((q, idx) => {
              const detail = result?.details?.[q.id];
              const isCorrect = detail?.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border ${
                    isCorrect
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                      : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {idx + 1}. {q.questionText}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 mt-2 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>{lang === "ar" ? "إجابتك:" : "Your Answer:"}</strong>{" "}
                      <span className={isCorrect ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                        {formatAnswer(detail?.studentAnswer || "", q.type) || "(No answer)"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p>
                        <strong>{lang === "ar" ? "الإجابة الصحيحة:" : "Correct Answer:"}</strong>{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatAnswer(q.correctAnswer, q.type)}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        💡 <strong>{lang === "ar" ? "الشرح والتوضيح:" : "Explanation:"}</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ PRINT-ONLY EXAM PAPER LAYOUT ============ */}
      <div className="print-only print-page">
        <div style={{ textAlign: "center", borderBottom: "3px double #000", paddingBottom: 10, marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900 }}>Professional Academy — Mr. Habib El Rahman</h1>
          <p style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{title}</p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 10, fontWeight: 600 }}>
            <span>Name: ____________________________</span>
            <span>Class: ______________</span>
            <span>Date: ____ / ____ / ______</span>
            <span>Time: {durationMinutes} min</span>
          </div>
        </div>

        <div style={{ fontSize: 12, lineHeight: 1.9 }}>
          {questions.map((q, i) => (
            <div key={q.id} className="print-question" style={{ marginBottom: 14 }}>
              <p style={{ fontWeight: 700 }}>
                ({i + 1}) {q.questionText}
              </p>
              {Array.isArray(q.options) && q.options.length > 0 && (
                <div style={{ paddingInlineStart: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  {q.options.map((opt, oi) => (
                    <span key={oi} style={{ fontSize: 11 }}>
                      ☐ {String.fromCharCode(65 + oi)}) {opt}
                    </span>
                  ))}
                </div>
              )}
              {(!q.options || (q.options as string[]).length === 0) && (
                <p style={{ paddingInlineStart: 18, fontSize: 11 }}>
                  ☐ True &nbsp;&nbsp; ☐ False &nbsp;&nbsp; — or write your answer:
                  <br />__________________________________________________________________
                  <br />__________________________________________________________________
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ANSWER KEY — teacher copy */}
        <div style={{ marginTop: 30, borderTop: "2px solid #000", paddingTop: 10, pageBreakBefore: "always" }}>
          <h2 style={{ fontSize: 14, fontWeight: 900 }}>Answer Key (For Mr. Habib Reviewing Only)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, fontSize: 10, marginTop: 8 }}>
            {questions.map((q, i) => (
              <span key={q.id}>
                <strong>{i + 1}:</strong> {q.correctAnswer}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
