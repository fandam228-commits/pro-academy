"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { awardXP } from "@/lib/gamification-service";
import { recordMistake } from "@/lib/mistakes-service";
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Users,
  Quote,
  HelpCircle,
  CheckCircle2,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lightbulb,
  ExternalLink,
  Languages,
  Clock,
  Compass,
} from "lucide-react";

export interface NovelCharacter {
  name: string;
  role_ar: string;
  traits: string[];
  motivation_ar: string;
}

export interface NovelQuotation {
  quote: string;
  speaker: string;
  addressed_to: string;
  comment_ar: string;
}

export interface CriticalThinkingQuestion {
  id: string;
  question_en: string;
  model_answer_en: string;
  explanation_ar: string;
  key_points: string[];
}

export interface NovelChapterData {
  id: string;
  grade_level: string;
  grade_title_ar?: string;
  novel_title: string;
  author: string;
  chapter_number: number;
  chapter_title: string;
  summary_en: string;
  summary_ar: string;
  audio_url?: string;
  key_vocabulary: {
    word: string;
    meaning_ar: string;
    context_sentence: string;
  }[];
  characters: NovelCharacter[];
  key_quotations: NovelQuotation[];
  critical_thinking_qs: CriticalThinkingQuestion[];
}

export interface InteractiveLiteratureWorkspaceProps {
  initialGradeLevel?: string;
  onNavigateHome?: () => void;
}

export const InteractiveLiteratureWorkspace: React.FC<InteractiveLiteratureWorkspaceProps> = ({
  initialGradeLevel = "3rd_sec",
  onNavigateHome,
}) => {
  const { user } = useApp();

  // Selected grade and chapter
  const [selectedGrade, setSelectedGrade] = useState(initialGradeLevel);
  const [chapters, setChapters] = useState<NovelChapterData[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active Tab View: 'bilingual_plot' | 'characters' | 'quotations' | 'critical_thinking'
  const [activeTab, setActiveTab] = useState<"bilingual_plot" | "characters" | "quotations" | "critical_thinking">("bilingual_plot");

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Critical Thinking State
  const [ctAnswers, setCtAnswers] = useState<Record<string, string>>({});
  const [ctResults, setCtResults] = useState<Record<string, any>>({});
  const [submittingCtId, setSubmittingCtId] = useState<string | null>(null);

  // Gamification Alerts
  const [xpNotice, setXpNotice] = useState<number | null>(null);

  // Fetch Chapters
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/literature/chapters?grade_level=${selectedGrade}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.chapters)) {
        setChapters(data.chapters);
        setCurrentChapterIndex(0);
        resetAudio();
        setCtAnswers({});
        setCtResults({});
      }
    } catch (e) {
      console.error("Failed to fetch literature chapters:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  const currentChapter = chapters[currentChapterIndex] || null;

  // Reset Audio
  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setAudioProgress(0);
  };

  // Toggle Audio Narration
  const togglePlayAudio = () => {
    if (!currentChapter) return;

    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      // Play
      if (currentChapter.audio_url && audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().catch(() => {
          // Fallback to speech synthesis
          speakSummaryFallback();
        });
        setIsPlaying(true);
      } else {
        speakSummaryFallback();
      }
    }
  };

  const speakSummaryFallback = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentChapter.summary_en);
      utterance.lang = "en-US";
      utterance.rate = playbackRate;
      utterance.onend = () => {
        setIsPlaying(false);
        setAudioProgress(100);
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Speak Single Word
  const handlePronounceWord = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  // Submit Critical Thinking Answer
  const handleSubmitCriticalThinking = async (qId: string) => {
    if (!currentChapter) return;
    const answer = ctAnswers[qId] || "";
    if (!answer.trim()) return;

    setSubmittingCtId(qId);
    setXpNotice(null);

    try {
      const res = await fetch("/api/literature/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_critical_thinking",
          chapterId: currentChapter.id,
          questionId: qId,
          studentAnswer: answer.trim(),
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCtResults((prev) => ({ ...prev, [qId]: data }));

        if (data.isApproved) {
          const xpRes = await awardXP({
            actionType: "story_lesson",
            referenceId: `${currentChapter.id}_${qId}`,
            customXp: 20,
            userId: user?.id,
          });
          if (xpRes?.success && !xpRes.duplicate) {
            setXpNotice(20);
          }
        }
      }
    } catch (e) {
      console.error("Critical thinking submission error:", e);
    } finally {
      setSubmittingCtId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-[#1e1306] to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>عالم القصص والروايات الأدبية • دفعة 2026/2027</span>
              </div>
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/10"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>العودة للمنصة</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>LITERATURE & NOVEL WORLD</span>
              <span className="text-sm font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                PRO
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              عش أحداث الروايات المقررة رسميًا بنطق صوتي متقن، وتعرف على دوافع الشخصيات، وحلل أهم الاقتباسات وأسئلة التفكير النقدي المتوقعة في الامتحانات.
            </p>
          </div>

          {/* GRADE SELECTOR */}
          <div className="bg-slate-900/80 backdrop-blur p-3 rounded-2xl border border-amber-500/30 text-xs">
            <label className="block text-[11px] font-bold text-amber-300 mb-1.5">
              اختر المرحلة والرواية المقررة:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-800 text-white font-bold border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="3rd_sec">الثالث الثانوي — Great Expectations (آمال عظيمة)</option>
              <option value="2nd_sec">الثاني الثانوي — King Lear (الملك لير)</option>
              <option value="1st_sec">الأول الثانوي — Treasure Island (جزيرة الكنز)</option>
              <option value="3rd_prep">الثالث الإعدادي — Black Beauty (الجمال الأسود)</option>
              <option value="2nd_prep">الثاني الإعدادي — Around the World in 80 Days</option>
              <option value="1st_prep">الأول الإعدادي — The Secret Garden (الحديقة السرية)</option>
            </select>
          </div>
        </div>

        {/* CHAPTER PILLS ROW */}
        {chapters.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-slate-400 whitespace-nowrap ml-2">الفصول المقررة:</span>
            {chapters.map((ch, idx) => (
              <button
                key={ch.id || idx}
                onClick={() => {
                  setCurrentChapterIndex(idx);
                  resetAudio();
                }}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  currentChapterIndex === idx
                    ? "bg-amber-400 text-slate-950 font-black shadow-md scale-102"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                الفصل {ch.chapter_number}: {ch.chapter_title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GAMIFICATION XP ALERT */}
      {xpNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm">إتقان أدبي متميز! تفكير نقدي رفيع المستوى 🎉</p>
              <p className="text-xs opacity-90">
                تمت إضافة <span className="font-black">+{xpNotice} نقطة XP</span> إلى رصيدك الدراسي في لوحة الشرف!
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
            +{xpNotice} XP
          </span>
        </div>
      )}

      {/* 2. STICKY AUDIO PLAYER BAR */}
      {currentChapter && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayAudio}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 shadow-amber-500/30 text-slate-950"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30"
              }`}
              title={isPlaying ? "إيقاف مؤقت" : "استمع لنطق أحداث الفصل"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                القارئ الصوتي الذكي (Audio Narration)
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {currentChapter.novel_title} — Chapter {currentChapter.chapter_number}
              </h4>
            </div>
          </div>

          {/* AUDIO CONTROLS (SPEED & RESET) */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-400">سرعة القراءة:</span>
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  playbackRate === spd
                    ? "bg-blue-600 text-white font-black"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              onClick={resetAudio}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2 cursor-pointer"
              title="إعادة من البداية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden audio element if URL exists */}
          {currentChapter.audio_url && (
            <audio
              ref={audioRef}
              src={currentChapter.audio_url}
              onEnded={() => {
                setIsPlaying(false);
                setAudioProgress(100);
              }}
            />
          )}
        </div>
      )}

      {/* 3. WORKSPACE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-black">
        <button
          onClick={() => setActiveTab("bilingual_plot")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === "bilingual_plot"
              ? "bg-amber-500 text-slate-950 shadow-md font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ملخص الأحداث وترجمة المستر التوضيحية</span>
        </button>

        <button
          onClick={() => setActiveTab("characters")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === "characters"
              ? "bg-amber-500 text-slate-950 shadow-md font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>خريطة الشخصيات ودوافعها ({currentChapter?.characters?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("quotations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === "quotations"
              ? "bg-amber-500 text-slate-950 shadow-md font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Quote className="w-4 h-4" />
          <span>أهم الاقتباسات الامتحانية ({currentChapter?.key_quotations?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("critical_thinking")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === "critical_thinking"
              ? "bg-amber-500 text-slate-950 shadow-md font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>أسئلة التفكير النقدي ({currentChapter?.critical_thinking_qs?.length || 0})</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white font-black">
            امتحانات
          </span>
        </button>
      </div>

      {/* 4. MAIN MODULE CONTENT CONTAINER */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-slate-500">جاري تحميل أحداث وتحليلات الرواية...</p>
        </div>
      ) : !currentChapter ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-black text-slate-700 dark:text-slate-300">لا توجد فصول متاحة لهذه المرحلة حالياً</h4>
        </div>
      ) : (
        <div className="space-y-6">
          {/* VIEW A: BILINGUAL SYNCHRONIZED PLOT READER */}
          {activeTab === "bilingual_plot" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ENGLISH NARRATIVE */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> English Narrative Summary
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {currentChapter.novel_title}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-serif leading-relaxed text-slate-800 dark:text-slate-200 text-left" dir="ltr">
                    {currentChapter.summary_en}
                  </p>
                </div>

                {/* ARABIC BREAKDOWN BY MR. HABIB */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> تحليل وشرح المستر حبيب الرحمن
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      العام الدراسي 2026/2027
                    </span>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                    {currentChapter.summary_ar}
                  </p>
                </div>
              </div>

              {/* KEY VOCABULARY PILLS */}
              {currentChapter.key_vocabulary?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Languages className="w-4 h-4 text-purple-600" />
                    <span>أهم مفردات وتعبيرات الفصل مع النطق الصوتي (اضغط على الكلمة للاستماع):</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {currentChapter.key_vocabulary.map((vocab, vIdx) => (
                      <div
                        key={vIdx}
                        onClick={() => handlePronounceWord(vocab.word)}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-400 cursor-pointer transition space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-blue-700 dark:text-blue-300 font-mono group-hover:text-amber-500" dir="ltr">
                            {vocab.word}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                          {vocab.meaning_ar}
                        </span>
                        <p className="text-[10px] text-slate-400 italic line-clamp-1" dir="ltr">
                          &ldquo;{vocab.context_sentence}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: CHARACTER CARDS & MOTIVATIONS */}
          {activeTab === "characters" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentChapter.characters?.map((char, cIdx) => (
                <div
                  key={cIdx}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {char.name}
                      </h4>
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                        {char.role_ar}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>

                  {/* TRAITS TAGS */}
                  <div className="flex flex-wrap gap-1.5">
                    {char.traits?.map((trait, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        • {trait}
                      </span>
                    ))}
                  </div>

                  {/* MOTIVATION & CONFLICT */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed">
                    <span className="font-black text-slate-900 dark:text-white block mb-1">
                      🎯 الدافع والصراع في هذا الفصل:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{char.motivation_ar}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW C: KEY QUOTATIONS */}
          {activeTab === "quotations" && (
            <div className="space-y-4">
              {currentChapter.key_quotations?.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-amber-200/80 dark:border-amber-900/40 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="text-amber-600 dark:text-amber-400 font-black flex items-center gap-1.5">
                      <Quote className="w-4 h-4" /> اقتباس امتحاني هام #{qIdx + 1}
                    </span>
                    <span>
                      القائل: <strong className="text-slate-900 dark:text-white">{q.speaker}</strong> ⬅️ إلى:{" "}
                      <strong className="text-slate-900 dark:text-white">{q.addressed_to}</strong>
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white text-left leading-relaxed" dir="ltr">
                    &ldquo;{q.quote}&rdquo;
                  </p>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                    <span className="font-black block text-amber-800 dark:text-amber-300 mb-1">
                      💡 التحليل والتعليق الامتحاني لمستر حبيب الرحمن:
                    </span>
                    {q.comment_ar}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW D: CRITICAL THINKING EXAM DRILLS */}
          {activeTab === "critical_thinking" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                <span className="font-black block mb-1">🎯 مواصفات أسئلة التفكير النقدي بالثانوية العامة:</span>
                تعتمد هذه الأسئلة على إبداء الرأي والتحليل الأخلاقي لمواقف الشخصيات باللغة الإنجليزية. اكتب إجابتك بحرية لتحصل على <strong>+20 نقطة XP</strong> ونموذج الإجابة الاسترشادي الفوري.
              </div>

              {currentChapter.critical_thinking_qs?.map((ct, idx) => {
                const answer = ctAnswers[ct.id] || "";
                const result = ctResults[ct.id] || null;
                const isSubmitting = submittingCtId === ct.id;

                return (
                  <div
                    key={ct.id || idx}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white" dir="ltr">
                          {ct.question_en}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
                        سؤال مقالي امتحاني
                      </span>
                    </div>

                    {/* STUDENT TEXTAREA */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500">
                        اكتب تحليلك وإجابتك بالإنجليزية (In your own words):
                      </label>
                      <textarea
                        rows={3}
                        value={answer}
                        onChange={(e) =>
                          setCtAnswers((prev) => ({ ...prev, [ct.id]: e.target.value }))
                        }
                        placeholder="In my opinion, I think that..."
                        dir="ltr"
                        className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        {answer.trim() ? answer.trim().split(/\s+/).length : 0} كلمة
                      </span>

                      <button
                        onClick={() => handleSubmitCriticalThinking(ct.id)}
                        disabled={!answer.trim() || isSubmitting}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-40 cursor-pointer transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>جاري التقييم...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>تقييم الإجابة وعرض النموذج الاسترشادي</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* EVALUATION FEEDBACK & MODEL ANSWER */}
                    {result && (
                      <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> {result.feedback}
                          </span>
                          {result.xpAwarded > 0 && (
                            <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                              +{result.xpAwarded} XP مكتسبة
                            </span>
                          )}
                        </div>

                        {/* MODEL ANSWER */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-1">
                          <span className="font-black text-blue-600 dark:text-blue-400 block" dir="ltr">
                            Suggested Model Answer (نموذج الإجابة الرسمي):
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed" dir="ltr">
                            {result.modelAnswerEn}
                          </p>
                        </div>

                        {/* ARABIC EXPLANATION */}
                        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-950 dark:text-amber-200">
                          <span className="font-bold block mb-0.5">📌 التفسير والهدف التربوي:</span>
                          {result.explanationAr}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
