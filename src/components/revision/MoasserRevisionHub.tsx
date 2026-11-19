"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  MOASSER_SECTIONS,
  MOASSER_INTERACTIVE_EXAMS,
  MoasserSection,
  MoasserGrade,
  MoasserExam,
  MoasserExamQuestion,
} from "@/data/moasser-revision-index";
import {
  BookOpen,
  Sparkles,
  Download,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Search,
  BookMarked,
  Layers,
  GraduationCap,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

export const MoasserRevisionHub: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { lang, user } = useApp();
  const [selectedSectionId, setSelectedSectionId] = useState<"general" | "languages" | "azhar">("general");
  const [selectedStageId, setSelectedStageId] = useState<"all" | "secondary" | "prep" | "primary">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Interactive Exam Modal State
  const [activeExam, setActiveExam] = useState<MoasserExam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [savingMistakes, setSavingMistakes] = useState(false);

  // Active section data
  const currentSection = MOASSER_SECTIONS.find((s) => s.id === selectedSectionId) || MOASSER_SECTIONS[0];

  // Filtered grades list
  const filteredGrades = currentSection.stages
    .filter((st) => selectedStageId === "all" || st.id === selectedStageId)
    .flatMap((st) => st.grades)
    .filter((g) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return g.name.toLowerCase().includes(q) || g.en.toLowerCase().includes(q) || g.curriculum.toLowerCase().includes(q);
    });

  // Timer countdown
  useEffect(() => {
    if (!activeExam || examSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExam, examSubmitted, timeLeft]);

  const handleStartExam = (examId: string) => {
    const exam = MOASSER_INTERACTIVE_EXAMS[examId];
    if (!exam) return;
    setActiveExam(exam);
    setUserAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
    setCurrentQuestionIndex(0);
    setTimeLeft(exam.durationMinutes * 60);
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    let score = 0;
    const mistakes: any[] = [];

    activeExam.questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === q.correctAnswer) {
        score += 1;
      } else {
        mistakes.push({
          questionId: q.id,
          questionSnapshot: {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanationAr,
            category: q.category,
            grade: activeExam.grade,
          },
          wrongAnswer: ans || "لم تتم الإجابة",
        });
      }
    });

    const total = activeExam.questions.length;
    const percentage = Math.round((score / total) * 100);
    setExamScore({ score, total, percentage });
    setExamSubmitted(true);

    // Save failed questions to Smart Mistakes Bank if user is logged in
    if (mistakes.length > 0 && user) {
      setSavingMistakes(true);
      try {
        await Promise.all(
          mistakes.map((m) =>
            fetch("/api/mistakes", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeaders() },
              body: JSON.stringify({
                questionId: m.questionId,
                questionSnapshot: m.questionSnapshot,
                wrongAnswer: m.wrongAnswer,
              }),
            })
          )
        );
      } catch {}
      setSavingMistakes(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#112240] to-[#0D3B66] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-sky-900/40 relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>المراجعات النهائية الرسمية 2026/2027 • El Moasser & GPS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === "ar"
              ? "مراجعات ونماذج المعاصر التفاعلية للغة الإنجليزية"
              : "El-Moasser Official Revision & Interactive Exams"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === "ar"
              ? "حصر كامل لجميع مذكرات المراجعة النهائية ونماذج الامتحانات المعدلة لكتاب المعاصر، مع إمكانية الحل التفاعلي والتصحيح الفوري وتنزيل ملفات الـ PDF الأصلية."
              : "Complete access to official El-Moasser revision booklets, interactive model exams with instant grading, and direct PDF downloads."}
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-6 rtl:left-auto rtl:right-auto rtl:left-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        )}
      </div>

      {/* 2. TRACK SELECTOR TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#101b33] border border-slate-200 dark:border-slate-800 shadow-sm">
        {MOASSER_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setSelectedSectionId(sec.id);
              setSelectedStageId("all");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              selectedSectionId === sec.id
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-black"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* 3. STAGE FILTERS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setSelectedStageId("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStageId === "all" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs" : "text-slate-500"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setSelectedStageId("secondary")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStageId === "secondary" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs" : "text-slate-500"
            }`}
          >
            المرحلة الثانوية
          </button>
          <button
            onClick={() => setSelectedStageId("prep")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStageId === "prep" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs" : "text-slate-500"
            }`}
          >
            المرحلة الإعدادية
          </button>
          <button
            onClick={() => setSelectedStageId("primary")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStageId === "primary" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs" : "text-slate-500"
            }`}
          >
            المرحلة الابتدائية
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن صف دراسي..."
            className="w-full px-4 py-2 pl-9 rtl:pl-4 rtl:pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 4. GRADES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGrades.map((grade) => (
          <div
            key={grade.id}
            className="bg-white dark:bg-[#101b33] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  {grade.curriculum}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{grade.term}</span>
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">{grade.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{grade.en}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {/* Interactive Exam Button (If available) */}
              {grade.hasInteractiveExam && grade.examId && (
                <button
                  onClick={() => handleStartExam(grade.examId!)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>حل النموذج التفاعلي إلكترونياً ({grade.totalQuestions} سؤال) ⚡</span>
                </button>
              )}

              {/* Official Booklet PDF Links */}
              <div className="flex items-center gap-2">
                {grade.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. INTERACTIVE EXAM MODAL PLAYER */}
      {activeExam && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1529] border border-blue-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#121f3d] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase block">{activeExam.grade}</span>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">{activeExam.title}</h3>
              </div>

              {/* Countdown Timer */}
              {!examSubmitted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-mono font-black text-xs shrink-0">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setActiveExam(null)}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
              {/* RESULT SUMMARY BANNER (Shown upon submission) */}
              {examSubmitted && examScore && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-slate-900 border border-blue-500/40 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg text-white">
                    درجتك في الامتحان: {examScore.score} من {examScore.total} ({examScore.percentage}%)
                  </h4>
                  <p className="text-xs text-slate-300">
                    {examScore.score >= activeExam.passingMarks
                      ? "ممتاز! أداء رائع ومستوى متقدم في مراجعة ليلة الامتحان 🌟"
                      : "تحتاج إلى مراجعة القواعد والكلمات جيداً قبل الامتحان ⚠️"}
                  </p>
                  {savingMistakes && (
                    <span className="text-[11px] text-amber-400 font-bold block">
                      جاري حفظ وتثبيت الأسئلة الخاطئة في «بنك أخطائي الذكي»...
                    </span>
                  )}
                </div>
              )}

              {/* QUESTION CARD */}
              {activeExam.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    examSubmitted
                      ? userAnswers[q.id] === q.correctAnswer
                        ? "bg-emerald-500/5 border-emerald-500/40"
                        : "bg-red-500/5 border-red-500/40"
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>
                      السؤال {idx + 1} من {activeExam.questions.length} • {q.category}
                    </span>
                    {q.ruleReference && <span className="text-[10px] text-blue-500">{q.ruleReference}</span>}
                  </div>

                  {/* Passage if reading question */}
                  {q.passage && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 italic border-l-4 border-blue-500">
                      {q.passage}
                    </div>
                  )}

                  <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white whitespace-pre-line">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[q.id] === opt;
                      const isCorrect = opt === q.correctAnswer;
                      let optionStyle = "border-slate-200 dark:border-slate-800 hover:border-blue-400";

                      if (examSubmitted) {
                        if (isCorrect) optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                        else if (isSelected && !isCorrect)
                          optionStyle = "bg-red-500/20 border-red-500 text-red-400 line-through";
                      } else if (isSelected) {
                        optionStyle = "bg-blue-600 text-white font-bold border-blue-600";
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={examSubmitted}
                          onClick={() => handleSelectAnswer(q.id, opt)}
                          className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-right rtl:text-right flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {examSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {examSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (Shown upon submission) */}
                  {examSubmitted && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-amber-500">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>توضيح مستر حبيب التربوي:</span>
                      </div>
                      <p>{q.explanationAr}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-[#121f3d] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                تمت الإجابة عن {Object.keys(userAnswers).length} من {activeExam.questions.length} سؤال
              </span>

              {!examSubmitted ? (
                <button
                  onClick={handleSubmitExam}
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  تسليم الامتحان وإظهار النتيجة 🚀
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setExamSubmitted(false);
                    setExamScore(null);
                    setTimeLeft(activeExam.durationMinutes * 60);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة حل النموذج</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
