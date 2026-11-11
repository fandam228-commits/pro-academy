"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  Volume2,
  Send,
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  UserCheck,
} from "lucide-react";

export interface TranslationQuestionPlayerProps {
  question: any;
  mode?: "practice" | "exam";
  onAnswerSubmitted?: (result: any) => void;
  onNext?: () => void;
  isLast?: boolean;
}

export const TranslationQuestionPlayer: React.FC<TranslationQuestionPlayerProps> = ({
  question,
  mode = "practice",
  onAnswerSubmitted,
  onNext,
  isLast = false,
}) => {
  const { lang, user } = useApp();

  // Answer states
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>({});
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);

  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Initialize question state
  useEffect(() => {
    setTextAnswer("");
    setSelectedOption(null);
    setEvaluation(null);
    setShowHint(false);
    setSelectedMatchLeft(null);
    setMatchingPairs({});

    if (question.questionType === "sentence_ordering" && Array.isArray(question.options)) {
      // Shuffle options for ordering
      const shuffled = [...question.options].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setOrderedWords([]);
    }
  }, [question.id]);

  // Audio playback for listening questions
  const playAudio = () => {
    if (!question.audioUrl && typeof window !== "undefined") {
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(question.questionText);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      return;
    }

    if (question.audioUrl) {
      const audio = new Audio(question.audioUrl);
      setIsPlayingAudio(true);
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  // Submit Answer
  const handleSubmit = async () => {
    let payloadAnswer: any = "";

    switch (question.questionType) {
      case "mcq":
      case "word_selection":
        payloadAnswer = selectedOption || "";
        break;
      case "sentence_ordering":
        payloadAnswer = orderedWords.join(" ");
        break;
      case "word_matching":
        payloadAnswer = Object.entries(matchingPairs)
          .map(([k, v]) => `${k}:${v}`)
          .join("|");
        break;
      default:
        payloadAnswer = textAnswer;
        break;
    }

    if (!payloadAnswer && payloadAnswer !== 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/translation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          lessonId: question.lessonId,
          moduleId: question.moduleId,
          studentAnswer: payloadAnswer,
          mode,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        onAnswerSubmitted?.({
          questionId: question.id,
          answer: payloadAnswer,
          evaluation: data.evaluation,
        });
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setEvaluation(null);
    setTextAnswer("");
    setSelectedOption(null);
    if (question.questionType === "sentence_ordering" && Array.isArray(question.options)) {
      setAvailableWords([...question.options].sort(() => Math.random() - 0.5));
      setOrderedWords([]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* CARD HEADER */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-sky-900/10 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300/40">
            {question.difficulty === "Easy" ? "🟢 سهل" : question.difficulty === "Hard" ? "🔴 متقدم" : "🟡 متوسط"}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {question.topic || "ترجمة تطبيقية"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400">
            ⭐ {question.marks} {lang === "ar" ? "درجات" : "Marks"}
          </span>
          {question.source && (
            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {question.source}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* INSTRUCTIONS */}
        <div className="flex items-start gap-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800/40">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{question.instructions}</span>
        </div>

        {/* QUESTION PROMPT / SOURCE TEXT */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === "ar" ? "النص الأصلي المطلوب ترجمته:" : "Source Text to Translate:"}
            </span>
            {(question.questionType === "listening_translation" || question.audioUrl) && (
              <button
                onClick={playAudio}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? "جاري الاستماع..." : "استمع الآن"}</span>
              </button>
            )}
          </div>

          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
            {question.questionText}
          </p>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE INPUTS BY QUESTION TYPE (14 TYPES) */}
        {/* ============================================================== */}

        {/* 1. MCQ & Word Selection */}
        {(question.questionType === "mcq" || question.questionType === "word_selection") && (
          <div className="space-y-3">
            {Array.isArray(question.options) &&
              question.options.map((opt: string, idx: number) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={evaluation !== null}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-4 rounded-2xl border text-right rtl:text-right transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-950 dark:text-purple-100 shadow-md"
                        : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-purple-300 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-black flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-semibold leading-relaxed">{opt}</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* 2. Sentence Ordering */}
        {question.questionType === "sentence_ordering" && (
          <div className="space-y-4">
            {/* Ordered Area */}
            <div className="min-h-[64px] p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-dashed border-purple-300 dark:border-purple-800 flex flex-wrap gap-2 items-center">
              {orderedWords.length === 0 ? (
                <span className="text-xs text-slate-400 font-medium">
                  {lang === "ar" ? "اضغط على الكلمات بالترتيب الصحيح لتكوين الجملة..." : "Click words in order to build the sentence..."}
                </span>
              ) : (
                orderedWords.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    disabled={evaluation !== null}
                    onClick={() => {
                      if (evaluation !== null) return;
                      setOrderedWords(orderedWords.filter((_, i) => i !== wIdx));
                      setAvailableWords([...availableWords, word]);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm flex items-center gap-1 hover:bg-purple-700 cursor-pointer"
                  >
                    <span>{word}</span>
                    <span className="text-[10px] text-purple-200">×</span>
                  </button>
                ))
              )}
            </div>

            {/* Word Pool */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {availableWords.map((word, wIdx) => (
                <button
                  key={wIdx}
                  disabled={evaluation !== null}
                  onClick={() => {
                    if (evaluation !== null) return;
                    setOrderedWords([...orderedWords, word]);
                    setAvailableWords(availableWords.filter((_, i) => i !== wIdx));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-purple-400 transition-all cursor-pointer"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Word Matching */}
        {question.questionType === "word_matching" && Array.isArray(question.options) && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400">
              {lang === "ar" ? "اضغط على الكلمة في العمود الأول ثم ما يقابلها في العمود الثاني:" : "Select a term on the left, then its match on the right:"}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {question.options.map((pair: any, idx: number) => {
                  const en = pair.en || pair.left || `Item ${idx}`;
                  const isMatched = matchingPairs[en] !== undefined;
                  const isSelected = selectedMatchLeft === en;
                  return (
                    <button
                      key={idx}
                      disabled={evaluation !== null || isMatched}
                      onClick={() => setSelectedMatchLeft(en)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        isMatched
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-200"
                          : isSelected
                          ? "bg-purple-100 dark:bg-purple-900 border-purple-500 text-purple-900 dark:text-white"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                      }`}
                    >
                      {en}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {question.options.map((pair: any, idx: number) => {
                  const ar = pair.ar || pair.right || `Match ${idx}`;
                  const matchedKey = Object.keys(matchingPairs).find((k) => matchingPairs[k] === ar);
                  return (
                    <button
                      key={idx}
                      disabled={evaluation !== null || matchedKey !== undefined}
                      onClick={() => {
                        if (selectedMatchLeft) {
                          setMatchingPairs({ ...matchingPairs, [selectedMatchLeft]: ar });
                          setSelectedMatchLeft(null);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-right transition-all ${
                        matchedKey
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-200"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-400 cursor-pointer"
                      }`}
                    >
                      {ar}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. Text Input Types (ar_to_en, en_to_ar, fill_blanks, paragraph, etc.) */}
        {question.questionType !== "mcq" &&
          question.questionType !== "word_selection" &&
          question.questionType !== "sentence_ordering" &&
          question.questionType !== "word_matching" && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 block">
                {lang === "ar" ? "اكتب ترجمتك هنا بكل دقة:" : "Type your translation here:"}
              </label>
              <textarea
                value={textAnswer}
                disabled={evaluation !== null}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder={
                  question.questionType === "en_to_ar_text"
                    ? "اكتب الترجمة العربية الفصيحة..."
                    : "Write your English translation here..."
                }
                dir={question.questionType === "en_to_ar_text" ? "rtl" : "ltr"}
                rows={question.questionType === "paragraph_translation" ? 4 : 2}
                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          )}

        {/* HINT BUTTON IN PRACTICE MODE */}
        {mode === "practice" && !evaluation && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? "إخفاء التلميح" : "هل تحتاج تلميحاً؟"}</span>
            </button>
            {showHint && (
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                💡 ركز على ترتيب الفاعل والصفات قبل الأسماء وتوافق الأزمنة.
              </span>
            )}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        {!evaluation && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>جاري التقييم الذكي للترجمة...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{lang === "ar" ? "تسليم وتقييم الإجابة" : "Submit & Evaluate"}</span>
              </>
            )}
          </button>
        )}

        {/* ============================================================== */}
        {/* SMART TRANSLATION EVALUATION RESULT & 5-PART RUBRIC BREAKDOWN */}
        {/* ============================================================== */}
        {evaluation && (
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn">
            {/* STATUS BANNER */}
            {evaluation.status === "needs_review" ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 space-y-1">
                <div className="flex items-center gap-2 font-black text-sm text-amber-400">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <span>محاولة واعدة! تم تحويل الإجابة للمراجعة الأكاديمية بواسطة المستر</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {evaluation.feedback}
                </p>
              </div>
            ) : evaluation.isCorrect ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-emerald-400">ترجمة ممتازة ومطابقة للمعايير!</h4>
                  <p className="text-xs text-emerald-200/90">{evaluation.feedback}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-red-400">بحاجة إلى تدقيق ومراجعة القواعد</h4>
                  <p className="text-xs text-red-200/90">{evaluation.feedback}</p>
                </div>
              </div>
            )}

            {/* SCORE & RUBRIC BREAKDOWN (5 CATEGORIES) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                  📊 تقرير التقييم التفصيلي (Rubric Breakdown):
                </h5>
                <span className="font-black text-sm text-purple-600 dark:text-purple-400">
                  {evaluation.percentage}% ({evaluation.score} / {evaluation.maxMarks} درجات)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">دقة المعنى (40%)</span>
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {evaluation.rubric.meaning} / 40
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">القواعد (20%)</span>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                    {evaluation.rubric.grammar} / 20
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">المفردات (20%)</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {evaluation.rubric.vocab} / 20
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block">بنية الجملة (10%)</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {evaluation.rubric.structure} / 10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 block">الترقيم (10%)</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {evaluation.rubric.mechanics} / 10
                  </span>
                </div>
              </div>
            </div>

            {/* MODEL ANSWER & SUGGESTED CORRECTION */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-purple-900/20 border border-purple-500/30">
                <span className="text-[11px] font-bold text-purple-300 block mb-1">
                  ⭐ النموذج الإرشادي المعتمد (Model Answer):
                </span>
                <p className="text-sm font-bold text-white leading-relaxed">
                  {evaluation.modelAnswerUsed || question.correctAnswer}
                </p>
              </div>

              {/* EDUCATIONAL EXPLANATION */}
              <div className="p-3.5 rounded-2xl bg-sky-900/20 border border-sky-500/30">
                <span className="text-[11px] font-bold text-sky-300 block mb-1">
                  💡 الشرح والتوجيه التعليمي من مستر حبيب الرحمن:
                </span>
                <p className="text-xs text-sky-100 font-medium leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS (RETRY OR NEXT) */}
            <div className="flex items-center gap-3 pt-2">
              {mode === "practice" && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              )}

              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <span>{isLast ? "إنهاء التدريب واستعراض النتائج" : "السؤال التالي"}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
