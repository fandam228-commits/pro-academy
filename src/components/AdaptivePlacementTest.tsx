"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Trophy, ShieldCheck, HelpCircle } from "lucide-react";

interface Question {
  id: string;
  level: "Beginner" | "Elementary" | "Pre-Intermediate" | "Intermediate" | "Upper Intermediate" | "Advanced";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const adaptiveQuestionsBank: Question[] = [
  {
    id: "q1",
    level: "Beginner",
    question: "She ______ to school every morning at 7:30 AM.",
    options: ["goes", "go", "going", "gone"],
    correct: 0,
    explanation: "Present simple singular subject (She) takes 'goes'.",
  },
  {
    id: "q2",
    level: "Elementary",
    question: "We ______ watching a movie when the power went off.",
    options: ["were", "was", "are", "have been"],
    correct: 0,
    explanation: "Past continuous plural subject (We) requires 'were'.",
  },
  {
    id: "q3",
    level: "Pre-Intermediate",
    question: "If you ______ harder, you will pass the English examination.",
    options: ["study", "studied", "will study", "had studied"],
    correct: 0,
    explanation: "First conditional rule: If + Present Simple, Will + Infinitive.",
  },
  {
    id: "q4",
    level: "Intermediate",
    question: "He asked me where ______ my summer vacation last year.",
    options: ["I had spent", "had I spent", "did I spend", "I spend"],
    correct: 0,
    explanation: "Reported questions use statement word order (Subject + Verb) and backshifted tense.",
  },
  {
    id: "q5",
    level: "Upper Intermediate",
    question: "No sooner ______ the house than it started pouring with rain.",
    options: ["had he left", "he had left", "did he leave", "has he left"],
    correct: 0,
    explanation: "'No sooner' at the start of a clause requires inverted auxiliary + subject structure.",
  },
  {
    id: "q6",
    level: "Advanced",
    question: "Had I known about the changes in the curriculum, I ______ differently.",
    options: ["would have prepared", "will prepare", "prepared", "would prepare"],
    correct: 0,
    explanation: "Inverted 3rd conditional (Had + S + V3) requires 'would have + V3' in main clause.",
  },
];

export const AdaptivePlacementTest: React.FC<{ onComplete?: (level: string) => void }> = ({ onComplete }) => {
  const { lang, user } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scores, setScores] = useState<boolean[]>([]);
  const [isFinished, setIsPlayingFinished] = useState(false);
  const [finalLevel, setFinalLevel] = useState<string>("Intermediate");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const currentQ = adaptiveQuestionsBank[currentIndex];

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQ.correct;
    const newScores = [...scores, isCorrect];
    setScores(newScores);

    if (currentIndex + 1 < adaptiveQuestionsBank.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      // Calculate final adaptive level
      const correctCount = newScores.filter(Boolean).length;
      let level = "Beginner";
      let recs: string[] = [];

      if (correctCount >= 5) {
        level = "Advanced";
        recs = [
          "Third Secondary Master Class 2025/2026 (Thanawya Amma)",
          "Advanced Translation & Composition Mastery",
        ];
      } else if (correctCount >= 4) {
        level = "Upper Intermediate";
        recs = [
          "Third Secondary Prep Class",
          "Second Secondary Intensive English Program",
        ];
      } else if (correctCount >= 3) {
        level = "Intermediate";
        recs = [
          "First Secondary Foundation & Grammar Mastery",
          "Third Prep High Score Booster",
        ];
      } else if (correctCount >= 2) {
        level = "Pre-Intermediate";
        recs = [
          "Second Prep English Skills & Practice",
          "First Secondary Grammar Launchpad",
        ];
      } else {
        level = "Beginner / Elementary";
        recs = [
          "First Prep English Beginners Launchpad",
          "Essential English Grammar & Vocab Fundamentals",
        ];
      }

      setFinalLevel(level);
      setRecommendations(recs);
      setIsPlayingFinished(true);
      if (onComplete) onComplete(level);
    }
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScores([]);
    setIsPlayingFinished(false);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
      {!isFinished ? (
        <div>
          {/* TOP HEADER */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {lang === "ar" ? "اختبار تحديد المستوى التكيفي" : "Adaptive Placement Test"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === "ar"
                    ? `السؤال ${currentIndex + 1} من ${adaptiveQuestionsBank.length} • مستوى الصعوبة: ${currentQ.level}`
                    : `Question ${currentIndex + 1} of ${adaptiveQuestionsBank.length} • Difficulty: ${currentQ.level}`}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {currentQ.level}
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / adaptiveQuestionsBank.length) * 100}%` }}
            />
          </div>

          {/* QUESTION TEXT */}
          <div className="mb-8">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* OPTIONS GRID */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-start p-4 rounded-2xl font-medium text-sm transition-all border flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-bold shadow-md"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-400"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* FOOTER BUTTON */}
          <div className="flex justify-end">
            <button
              disabled={selectedOption === null}
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>{currentIndex + 1 === adaptiveQuestionsBank.length ? (lang === "ar" ? "إنهاء الاختبار" : "Finish Test") : (lang === "ar" ? "السؤال التالي" : "Next Question")}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      ) : (
        /* RESULT CARD */
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-orange-500 to-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mb-6 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            {lang === "ar" ? "تم تحديد مستواك بنجاح!" : "Placement Assessment Complete!"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {lang === "ar"
              ? "بناءً على إجاباتك ودقة حل القواعد والترجمة، إليك التقييم الرسمي والتوصيات الدراسية."
              : "Based on your structural and grammar responses, here is your official assessment and study plan."}
          </p>

          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 p-6 rounded-3xl border border-blue-200 dark:border-slate-700 max-w-md mx-auto mb-8">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {lang === "ar" ? "المستوى المحدد" : "Determined Level"}
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 text-blue-600 dark:text-blue-400">
              {finalLevel}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Score: {scores.filter(Boolean).length} / {adaptiveQuestionsBank.length} Correct
            </p>
          </div>

          {/* COURSE RECOMMENDATIONS */}
          <div className="text-start max-w-md mx-auto mb-8 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{lang === "ar" ? "الكورسات الموصى بها لك:" : "Recommended Courses:"}</span>
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetTest}
              className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === "ar" ? "إعادة الاختبار" : "Retake Test"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
