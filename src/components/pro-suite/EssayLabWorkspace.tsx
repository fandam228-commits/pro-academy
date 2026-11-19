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
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Check,
  TrendingUp,
  GraduationCap,
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
  const [audioFeedbackLang, setAudioFeedbackLang] = useState<"ar" | "en">("ar");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioKey, setCurrentAudioKey] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setEssayContent((prev) => (prev ? `${prev.trim()} ${finalTranscript}` : finalTranscript));
          }
        };

        recog.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

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

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isListening]);

  const currentTopic = topics[selectedTopicIndex] || null;

  // Word count
  const words = essayContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const targetWords = currentTopic?.minWords || 180;
  const progressPercent = Math.min(Math.round((wordCount / targetWords) * 100), 100);

  // Audio Pronunciation Engine
  const playSpeech = (text: string, lang = "en-US", key = "generic") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio && currentAudioKey === key) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentAudioKey(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = lang.startsWith("ar") ? 0.95 : 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setCurrentAudioKey(key);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentAudioKey(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentAudioKey(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAllAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentAudioKey(null);
    }
  };

  // Toggle Voice Dictation
  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        stopAllAudio();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

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

  // Apply Sentence Level-Up Rewrite
  const applySentenceUpgrade = (original: string, upgraded: string) => {
    setEssayContent((prev) => {
      if (prev.includes(original)) {
        return prev.replace(original, upgraded);
      }
      return `${prev}\n\n${upgraded}`;
    });
  };

  // Apply Single Mistake Fix
  const applyMistakeFix = (mistake: string, correction: string) => {
    setEssayContent((prev) => {
      const regex = new RegExp(`\\b${mistake}\\b`, "i");
      return prev.replace(regex, correction);
    });
  };

  // Run Smart Analysis
  const handleAnalyze = async () => {
    if (!essayContent.trim()) return;
    try {
      stopAllAudio();
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
              <span>معمل تصحيح المقال والفقرة بالذكاء الاصطناعي • دفعة 2026/2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>ESSAY & WRITING LAB</span>
              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                AI SMART EVALUATOR & AUDIO COACH
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تدرب على كتابة مقال الثانوية العامة مع الفحص الفوري لنموذج درجات الوزارة الأربعة، وكاشف الأخطاء النحوية والإملائية، والتوجيه الصوتي لمستر حبيب الرحمن.
            </p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/10 shrink-0 self-start md:self-auto cursor-pointer"
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
                  stopAllAudio();
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

                    {/* HELPER VOCAB WITH INSTANT PRONUNCIATION */}
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-500 text-[11px] flex items-center gap-1.5">
                        <span>مفردات أكاديمية تعزز درجتك (انقر للإدراج، أو 🔊 للاستماع للنطق):</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentTopic.helperVocab?.map((v: any, i: number) => (
                          <div
                            key={i}
                            className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] overflow-hidden"
                          >
                            <span
                              onClick={() => insertTransition(v.word)}
                              className="px-2.5 py-1 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer transition flex items-center gap-1"
                              title="انقر لإدراج الكلمة في المقال"
                            >
                              <span className="font-mono text-blue-600 dark:text-blue-400" dir="ltr">{v.word}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500">{v.meaningAr}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => playSpeech(v.word, "en-US", `vocab_${v.word}`)}
                              className="p-1 px-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                              title="استمع للنطق الإنجليزي السليم"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TRANSITION WORDS CLICKABLE PILLS WITH PRONUNCIATION */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>أدوات الربط الأكاديمية (انقر للإدراج، أو 🔊 للنطق):</span>
                </span>
                <span className="text-[10px] text-slate-400">ضرورية لمعيار الترابط والتناسق</span>
              </p>
              <div className="flex flex-wrap gap-1.5" dir="ltr">
                {TRANSITION_PILLS.map((pill, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold shadow-xs overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => insertTransition(pill)}
                      className="px-2.5 py-1 hover:bg-blue-600 hover:text-white transition cursor-pointer active:scale-95"
                      title="انقر للإدراج في مكان المؤشر"
                    >
                      + {pill}
                    </button>
                    <button
                      type="button"
                      onClick={() => playSpeech(pill.replace(",", ""), "en-US", `pill_${pill}`)}
                      className="p-1 px-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="استمع لنطق الكلمة"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ESSAY WRITING TEXTAREA WITH VOICE DICTATION */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">محرر المقال الإنجليزي:</span>
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceDictation}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        isListening
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                      title="التحدث بالإنجليزية والكتابة الصوتية التلقائية"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>جارٍ الاستماع... (انقر للإيقاف)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-blue-600" />
                          <span>تحدث واكتب بالصوت 🎙️</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

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
                    stopAllAudio();
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
                      <span>حلل مقالي الآن وتوقع الدرجة الوزارية ⚡</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SMART ANALYZER, 4-PILLAR RUBRICS & AUDIO COACH */}
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
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-[#0E1E38] dark:bg-blue-600 text-white text-[11px] font-black shadow-xs flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>الثانوية: {analysisResult.thanawyaAmmaMarks} / 6</span>
                    </span>
                  </div>
                )}
              </div>

              {!analysisResult ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <PenTool className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs font-bold">اكتب مقالك واضغط "حلل مقالي الآن" لبدء الفحص</p>
                  <p className="text-[11px]">سيتم تطبيق نموذج درجات الوزارة الأربعة، وكشف الأخطاء الإملائية والنحوية وتوليد التوجيه الصوتي فورياً.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* AUDIO COACH PLAYER (الموجه الصوتي الذكي) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border border-blue-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-amber-500" />
                        <span>التوجيه والتقييم الصوتي لمستر حبيب الرحمن 🎧</span>
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setAudioFeedbackLang("ar")}
                          className={`px-2 py-0.5 rounded-md transition ${
                            audioFeedbackLang === "ar" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
                          }`}
                        >
                          عربي
                        </button>
                        <button
                          type="button"
                          onClick={() => setAudioFeedbackLang("en")}
                          className={`px-2 py-0.5 rounded-md transition ${
                            audioFeedbackLang === "en" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
                          }`}
                        >
                          EN
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const script =
                            audioFeedbackLang === "ar"
                              ? analysisResult.audioScriptAr
                              : analysisResult.audioScriptEn;
                          playSpeech(script, audioFeedbackLang === "ar" ? "ar-EG" : "en-US", "coach_review");
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isPlayingAudio && currentAudioKey === "coach_review"
                            ? "bg-rose-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {isPlayingAudio && currentAudioKey === "coach_review" ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            <span>إيقاف التوجيه الصوتي</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>استمع للتقييم والتوجيه الصوتي الآن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OFFICIAL 4-PILLAR RUBRIC CARDS */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-500 text-[11px] flex items-center justify-between">
                      <span>نموذج درجات الوزارة الرسمي (4 معايير):</span>
                      <span className="font-mono font-bold text-blue-600">{analysisResult.qualityScore} / 100</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. Content & Ideas */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-slate-400">1. الأفكار والمضمون:</span>
                          <span className="font-mono font-black text-blue-600">{analysisResult.rubric?.contentAndIdeas || 20}/25</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${((analysisResult.rubric?.contentAndIdeas || 20) / 25) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* 2. Grammar & Structure */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-slate-400">2. القواعد وتركيب الجمل:</span>
                          <span className="font-mono font-black text-indigo-600">{analysisResult.rubric?.grammarAndStructure || 20}/25</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${((analysisResult.rubric?.grammarAndStructure || 20) / 25) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* 3. Vocabulary Variety */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-slate-400">3. تنوع المفردات:</span>
                          <span className="font-mono font-black text-amber-600">{analysisResult.rubric?.vocabularyVariety || 18}/25</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${((analysisResult.rubric?.vocabularyVariety || 18) / 25) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* 4. Mechanics & Punctuation */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-slate-400">4. الترقيم والتنسيق:</span>
                          <span className="font-mono font-black text-emerald-600">{analysisResult.rubric?.mechanicsAndPunctuation || 22}/25</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${((analysisResult.rubric?.mechanicsAndPunctuation || 22) / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FEEDBACK COMMENT */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold leading-relaxed">
                    {analysisResult.feedbackAr}
                  </div>

                  {/* DETECTED GRAMMAR & SPELLING ISSUES (WITH 1-CLICK FIX) */}
                  {analysisResult.detectedIssues?.length > 0 && (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                      <p className="font-black text-rose-800 dark:text-rose-300 text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>أخطاء نحوية وإملائية تم رصدها ({analysisResult.detectedIssues.length}):</span>
                        </span>
                        <span className="text-[10px] text-rose-600">انقر للتصحيح التلقائي</span>
                      </p>
                      <div className="space-y-2">
                        {analysisResult.detectedIssues.map((issue: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{issue.noteAr}</span>
                              <button
                                type="button"
                                onClick={() => applyMistakeFix(issue.mistake, issue.correction)}
                                className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-200 transition cursor-pointer text-[10px]"
                              >
                                تطبيق التصحيح ✓
                              </button>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[11px]" dir="ltr">
                              <span className="line-through text-rose-500">{issue.mistake}</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-emerald-600 font-bold">{issue.correction}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SENTENCE LEVEL-UP TRANSFORMATIONS (ارتقِ بأسلوبك) */}
                  {analysisResult.sentenceUpgrades?.length > 0 && (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
                      <p className="font-black text-indigo-900 dark:text-indigo-300 text-[11px] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        <span>ارتقِ بأسلوبك (Level-Up Your Sentences):</span>
                      </p>
                      <div className="space-y-2">
                        {analysisResult.sentenceUpgrades.map((upg: any, uIdx: number) => (
                          <div key={uIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-1.5">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">{upg.reasonAr}</p>
                            <div className="space-y-1 font-mono text-[11px]" dir="ltr">
                              <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-950 text-slate-500 border border-slate-100 dark:border-slate-800">
                                ❌ {upg.original}
                              </div>
                              <div className="p-1.5 rounded bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                ✨ {upg.upgraded}
                              </div>
                            </div>
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => applySentenceUpgrade(upg.original, upg.upgraded)}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>استبدل الجملة في مقالي</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                                  className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-blue-600 font-mono text-[10px] cursor-pointer hover:bg-blue-600 hover:text-white transition border border-slate-200 dark:border-slate-700"
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

                  {/* TOGGLE MODEL ESSAY WITH AUDIO PLAYER */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowModelEssay(!showModelEssay)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>المقال الاسترشادي لمستر حبيب الرحمن (Model Essay)</span>
                      </span>
                      {showModelEssay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showModelEssay && analysisResult.modelEssay && (
                      <div className="mt-3 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3 text-xs leading-relaxed animate-fadeIn" dir="ltr">
                        <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900/60 pb-2">
                          <p className="font-black text-blue-900 dark:text-blue-200 text-xs text-right" dir="rtl">
                            نموذج إجابة مستر حبيب الرحمن للثانوية العامة:
                          </p>
                          <button
                            type="button"
                            onClick={() => playSpeech(analysisResult.modelEssay, "en-US", "model_essay")}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition flex items-center gap-1 cursor-pointer"
                          >
                            {isPlayingAudio && currentAudioKey === "model_essay" ? (
                              <>
                                <VolumeX className="w-3 h-3" />
                                <span>إيقاف القراءة</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>استمع للمقال بالكامل 📢</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-sans leading-relaxed">{analysisResult.modelEssay}</p>
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
