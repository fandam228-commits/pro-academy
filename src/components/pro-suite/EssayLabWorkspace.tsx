"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  PenTool,
  Sparkles,
  Lightbulb,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

const TRANSITION_PILLS = [
  "Furthermore,",
  "Moreover,",
  "In addition,",
  "On the other hand,",
  "Consequently,",
  "Therefore,",
  "First and foremost,",
  "In conclusion,",
  "However,",
  "For instance,",
];

interface EssayLabProps {
  onNavigateHome?: () => void;
}

export const EssayLabWorkspace: React.FC<EssayLabProps> = ({ onNavigateHome }) => {
  const { user } = useApp();
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [essayContent, setEssayContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [showIdeaBank, setShowIdeaBank] = useState(true);
  const [showModelEssay, setShowModelEssay] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch Topics
  useEffect(() => {
    async function loadTopics() {
      try {
        setLoading(true);
        const res = await fetch("/api/essays/topics?grade_level=3rd_sec");
        const data = await res.json();
        if (data.success && Array.isArray(data.topics) && data.topics.length > 0) {
          setTopics(data.topics);
          setSelectedTopicIndex(0);
        }
      } catch (err) {
        console.error("Fetch essay topics error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  const currentTopic = topics[selectedTopicIndex] || null;

  // Word count
  const words = essayContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const targetWords = currentTopic?.minWords || 180;
  const progressPercent = Math.min(Math.round((wordCount / targetWords) * 100), 100);

  // Insert transition word at cursor position
  const insertTransition = (word: string) => {
    if (!textareaRef.current) {
      setEssayContent((prev) => (prev ? `${prev} ${word} ` : `${word} `));
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const newVal =
      currentVal.substring(0, start) +
      (start > 0 && currentVal[start - 1] !== " " ? " " : "") +
      word +
      " " +
      currentVal.substring(end);
    setEssayContent(newVal);
    setTimeout(() => {
      textarea.focus();
      const nextPos = start + word.length + (start > 0 ? 2 : 1);
      textarea.setSelectionRange(nextPos, nextPos);
    }, 50);
  };

  // Run Smart Analysis
  const handleAnalyze = async () => {
    if (!essayContent.trim()) return;
    try {
      setAnalyzing(true);
      const res = await fetch("/api/essays/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: currentTopic?.id,
          content: essayContent,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error("Analyze essay error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HERO BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white border border-blue-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
              <PenTool className="w-3.5 h-3.5" />
              <span>مختبر المقال والفقرة الأكاديمية • دفعة 2026/2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>ESSAY & WRITING LAB</span>
              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                AI SMART EVALUATOR
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تدرب على كتابة مقال الثانوية العامة (180 كلمة) مع كاشف تكرار الكلمات، وأدوات الربط الأكاديمية، والتحليل الفوري لمعايير التصحيح الوزارية.
            </p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/10 shrink-0 self-start md:self-auto"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0" />
              <span>العودة للرئيسية</span>
            </button>
          )}
        </div>

        {/* TOPIC SELECTOR TABS */}
        {topics.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-slate-400 whitespace-nowrap ml-2">مواضيع المقال المقررة:</span>
            {topics.map((t, idx) => (
              <button
                key={t.id || idx}
                onClick={() => {
                  setSelectedTopicIndex(idx);
                  setAnalysisResult(null);
                  setShowModelEssay(false);
                }}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedTopicIndex === idx
                    ? "bg-amber-400 text-slate-950 font-black shadow-md scale-102"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                موضوع {idx + 1}: {t.titleAr.substring(0, 32)}...
              </button>
            ))}
          </div>
        )}
      </div>

      {currentTopic && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: ESSAY PROMPT, TRANSITIONS, TEXTAREA */}
          <div className="lg:col-span-7 space-y-4">
            {/* PROMPT CARD */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">
                  Topic Prompt & Guidelines
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  مطلوب: {targetWords} كلمة على الأقل
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white" dir="ltr">
                  {currentTopic.titleEn}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{currentTopic.titleAr}</p>
              </div>

              {/* COLLAPSIBLE IDEA BANK & HELPER VOCAB */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowIdeaBank(!showIdeaBank)}
                  className="flex items-center justify-between w-full text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>بنك الأفكار والمفردات المساعدة لمستر حبيب الرحمن 💡</span>
                  </span>
                  {showIdeaBank ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showIdeaBank && (
                  <div className="mt-3 space-y-3 pt-2 text-xs">
                    {/* IDEAS */}
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-500 text-[11px]">أفكار مقترحة لتنظيم الفقرات:</p>
                      <ul className="space-y-1 pr-4 list-disc text-slate-700 dark:text-slate-300">
                        {currentTopic.ideaBankAr?.map((idea: string, i: number) => (
                          <li key={i}>{idea}</li>
                        ))}
                      </ul>
                    </div>

                    {/* HELPER VOCAB */}
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-500 text-[11px]">مفردات أكاديمية تعزز درجتك:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTopic.helperVocab?.map((v: any, i: number) => (
                          <span
                            key={i}
                            onClick={() => insertTransition(v.word)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 text-slate-700 dark:text-slate-300 font-bold cursor-pointer transition text-[11px] border border-slate-200 dark:border-slate-700"
                            title="انقر لإدراج الكلمة في المقال"
                          >
                            <span className="font-mono text-blue-600 dark:text-blue-400" dir="ltr">{v.word}</span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-[10px] text-slate-500">{v.meaningAr}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TRANSITION WORDS CLICKABLE PILLS */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>أدوات الربط الأكاديمية (انقر لإدراجها في مكان المؤشر مباشرة):</span>
              </p>
              <div className="flex flex-wrap gap-1.5" dir="ltr">
                {TRANSITION_PILLS.map((pill, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertTransition(pill)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* ESSAY WRITING TEXTAREA */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">محرر المقال الإنجليزي:</span>
                {/* LIVE WORD COUNTER WITH PROGRESS BAR */}
                <div className="flex items-center gap-2">
                  <div className="w-24 sm:w-36 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        wordCount >= targetWords
                          ? "bg-emerald-500"
                          : wordCount >= targetWords * 0.6
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span
                    className={`font-mono font-black text-xs ${
                      wordCount >= targetWords ? "text-emerald-600 font-black" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {wordCount} / {targetWords} كلمة
                  </span>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder="Start writing your essay here in English... (Ensure introductory hook, two body paragraphs with transitions, and a solid conclusion)."
                rows={13}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed resize-y font-medium"
                dir="ltr"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEssayContent("");
                    setAnalysisResult(null);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إفراغ المحرر</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || wordCount < 20}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>حلل مقالي الآن وتوقع الدرجة ⚡</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SMART ANALYZER & MODEL ESSAY */}
          <div className="lg:col-span-5 space-y-4">
            {/* GAMIFICATION XP CELEBRATION */}
            {analysisResult?.xpAwarded > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between animate-fadeIn shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm">مقال متميز مطابق للمواصفات! 🎉</p>
                    <p className="text-xs opacity-90">حصلت على +30 XP ونقاط الالتزام الأسبوعي</p>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE SMART ANALYSIS PANEL */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>نتائج الفحص والتحليل الذكي</span>
                </h3>
                {analysisResult && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      analysisResult.qualityScore >= 80
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : analysisResult.qualityScore >= 60
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-rose-50 text-rose-600 border border-rose-200"
                    }`}
                  >
                    الدرجة التقديرية: {analysisResult.qualityScore} / 100
                  </span>
                )}
              </div>

              {!analysisResult ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <PenTool className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs font-bold">اكتب مقالك واضغط "حلل مقالي الآن" لبدء الفحص</p>
                  <p className="text-[11px]">سيتم فحص عدد الكلمات، الروابط، وتكرار الكلمات الضعيفة تلقائياً.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* FEEDBACK COMMENT */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold leading-relaxed">
                    {analysisResult.feedbackAr}
                  </div>

                  {/* CHECKLIST */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-500 text-[11px]">معايير الجودة والتركيب:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">الحد الأدنى للكلمات:</span>
                        {analysisResult.wordCountMet ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">بدء الجمل بحرف كبير:</span>
                        <span className="font-mono font-bold">{analysisResult.capitalizationRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* TRANSITIONS DETECTED */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-500 text-[11px]">أدوات الربط المستخدمة في مقالك:</p>
                    {analysisResult.usedTransitions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5" dir="ltr">
                        {analysisResult.usedTransitions.map((conn: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-200 dark:border-emerald-800"
                          >
                            ✓ {conn}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 font-bold">
                        لم يتم رصد أدوات ربط كافية، استخدم القائمة المقترحة أعلاه.
                      </p>
                    )}
                  </div>

                  {/* OVERUSED BASIC WORDS & SUGGESTIONS */}
                  {analysisResult.overusedBasicWords?.length > 0 && (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                      <p className="font-black text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>كلمات بسيطة مكررة يُنصح باستبدالها:</span>
                      </p>
                      <div className="space-y-1.5">
                        {analysisResult.overusedBasicWords.map((item: any, i: number) => (
                          <div key={i} className="text-[11px]">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              كلمة "<span className="font-mono text-rose-600" dir="ltr">{item.word}</span>" (تكررت {item.count} مرات)
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1" dir="ltr">
                              <span className="text-[10px] text-slate-400">بدائل أقوى:</span>
                              {item.suggestions.map((sug: string, si: number) => (
                                <span
                                  key={si}
                                  onClick={() => insertTransition(sug)}
                                  className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-blue-600 font-mono text-[10px] cursor-pointer hover:bg-blue-600 hover:text-white transition border border-slate-200 dark:border-slate-700"
                                >
                                  {sug}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOGGLE MODEL ESSAY */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowModelEssay(!showModelEssay)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>معاينة المقال الاسترشادي لمستر حبيب الرحمن (Model Essay)</span>
                      </span>
                      {showModelEssay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showModelEssay && analysisResult.modelEssay && (
                      <div className="mt-3 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs leading-relaxed animate-fadeIn" dir="ltr">
                        <p className="font-black text-blue-900 dark:text-blue-200 text-xs text-right" dir="rtl">
                          نموذج إجابة مستر حبيب الرحمن للثانوية العامة:
                        </p>
                        <p className="text-slate-800 dark:text-slate-200 font-sans">{analysisResult.modelEssay}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
