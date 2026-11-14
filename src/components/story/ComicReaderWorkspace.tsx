"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Film,
  Headphones,
  MessageSquare,
  Trophy,
  Award,
  CheckCircle2,
  Volume2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Bookmark,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Calendar,
  FileText,
  Lightbulb,
  Check,
  ArrowRight,
  Filter,
  Star,
  Compass,
  Languages,
} from "lucide-react";
import {
  ChapterItem,
  ComicScene,
  ComicBubble,
  CharacterVisualReference,
  VocabularyWord,
  MCQQuestion,
} from "@/data/story-world";

interface ComicReaderWorkspaceProps {
  chapter: ChapterItem;
  storyTitleEn: string;
  storyTitleAr: string;
  storyCoverImage?: string;
  onOpenCharacterChat?: (characterName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function ComicReaderWorkspace({
  chapter,
  storyTitleEn,
  storyTitleAr,
  storyCoverImage,
  onOpenCharacterChat,
  onNavigateTab,
}: ComicReaderWorkspaceProps) {
  // Active Stage inside the Chapter (1 to 6)
  const [currentStage, setCurrentStage] = useState<
    "comic" | "listen" | "vocab" | "characters" | "summary" | "challenge"
  >("comic");

  // Comic Scene navigation
  const scenes = chapter.comicScenes || [];
  const charRefs = chapter.characterReferences || [];
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);

  // Reader Settings
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [langMode, setLangMode] = useState<"bilingual" | "en" | "ar">("bilingual");
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  // Resume Reading
  const [savedSceneIdx, setSavedSceneIdx] = useState<number | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(false);

  // Vocabulary Flashcards State
  const [activeVocabCardIdx, setActiveVocabCardIdx] = useState<number>(0);
  const [isVocabCardFlipped, setIsVocabCardFlipped] = useState<boolean>(false);

  // Chapter Challenge State
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, number>>({});
  const [challengeSubmitted, setChallengeSubmitted] = useState<boolean>(false);
  const [revealedQuizExplanations, setRevealedQuizExplanations] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved progress on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = `pro_comic_progress_${chapter.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed < scenes.length) {
          setSavedSceneIdx(parsed);
          setShowResumeBanner(true);
        }
      }
    }
  }, [chapter.id, scenes.length]);

  // Save progress when scene changes
  const handleSceneChange = (newIdx: number) => {
    setActiveSceneIdx(newIdx);
    if (typeof window !== "undefined") {
      localStorage.setItem(`pro_comic_progress_${chapter.id}`, newIdx.toString());
    }
  };

  // Web Speech API
  const speakText = (text: string, id?: string, rate: number = 0.95) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (activeSpeakingId === id) {
        setActiveSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      if (id) setActiveSpeakingId(id);
      utterance.onend = () => setActiveSpeakingId(null);
      utterance.onerror = () => setActiveSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStage !== "comic") return;
      if (e.key === "ArrowLeft") {
        if (activeSceneIdx < scenes.length - 1) handleSceneChange(activeSceneIdx + 1);
      } else if (e.key === "ArrowRight") {
        if (activeSceneIdx > 0) handleSceneChange(activeSceneIdx - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStage, activeSceneIdx, scenes.length]);

  // Auto-play slideshow timer
  useEffect(() => {
    if (!autoPlay || currentStage !== "comic" || scenes.length === 0) return;
    const timer = setInterval(() => {
      setActiveSceneIdx((prev) => {
        if (prev >= scenes.length - 1) {
          setAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [autoPlay, currentStage, scenes.length]);

  const currentScene = scenes[activeSceneIdx];

  // Calculate Quiz Score
  const mcqs = chapter.mcqQuestions || [];
  const correctCount = mcqs.reduce((acc, q, idx) => {
    return challengeAnswers[q.id || `q_${idx}`] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const quizScore = mcqs.length > 0 ? Math.round((correctCount / mcqs.length) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className={`space-y-6 transition-all duration-300 ${
        isFullscreen ? "p-4 md:p-8 bg-slate-950 text-white min-h-screen overflow-y-auto" : ""
      }`}
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & THE 6 LEARNING STAGES PROGRESSION BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#E8F3FF] text-[#2563EB]">
                  Graphic Novel • القصة المصورة
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  الفصل {chapter.chapterNumber}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#1E293B] mt-1">
                {chapter.titleAr}
              </h2>
              <p className="text-xs text-[#64748B] font-serif" dir="ltr">
                {chapter.titleEn} — {storyTitleEn}
              </p>
            </div>
          </div>

          {/* Quick Reader Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Lang Mode Toggle */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
              <button
                onClick={() => setLangMode("bilingual")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  langMode === "bilingual"
                    ? "bg-white text-[#2563EB] shadow-sm font-extrabold"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
                title="عرض النصين الإنجليزي والعربي معاً"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>ثنائي اللغة</span>
              </button>
              <button
                onClick={() => setLangMode("en")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  langMode === "en"
                    ? "bg-white text-[#2563EB] shadow-sm font-extrabold"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
                title="عرض النص الإنجليزي فقط للتركيز"
              >
                EN
              </button>
              <button
                onClick={() => setLangMode("ar")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  langMode === "ar"
                    ? "bg-white text-[#2563EB] shadow-sm font-extrabold"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
                title="عرض الترجمة العربية فقط"
              >
                عربي
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
              <button
                onClick={() => setZoomLevel((z) => Math.max(85, z - 10))}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-white transition"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-bold text-[#475569]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-white transition"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-white hover:text-[#2563EB] text-[#64748B] transition shadow-sm"
              title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 6 Learning Stages Navigator */}
        <div className="border-t border-[#F1F5F9] pt-4">
          <div className="text-xs font-black text-[#94A3B8] mb-2 flex items-center justify-between">
            <span>مراحل التعلم الستة للفصل الدراسي:</span>
            <span className="text-[#2563EB]">
              المرحلة{" "}
              {currentStage === "comic"
                ? "1"
                : currentStage === "listen"
                ? "2"
                : currentStage === "vocab"
                ? "3"
                : currentStage === "characters"
                ? "4"
                : currentStage === "summary"
                ? "5"
                : "6"}{" "}
              من 6
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: "comic", labelAr: "1. القصة المصورة", labelEn: "Comic Reading", icon: "🎨" },
              { id: "listen", labelAr: "2. استمع واقرأ", labelEn: "Listen & Read", icon: "🎧" },
              { id: "vocab", labelAr: "3. بنك المفردات", labelEn: "Vocabulary", icon: "📚" },
              { id: "characters", labelAr: "4. الشخصيات والحوار", labelEn: "Characters", icon: "👤" },
              { id: "summary", labelAr: "5. فهم الأحداث", labelEn: "Summary & Points", icon: "📖" },
              { id: "challenge", labelAr: "6. تحدي الفصل", labelEn: "Challenge Quiz", icon: "🏆" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setCurrentStage(st.id as any)}
                className={`p-2.5 rounded-2xl border text-right transition flex items-center gap-2.5 ${
                  currentStage === st.id
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white hover:border-[#CBD5E1]"
                }`}
              >
                <span className="text-lg">{st.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs font-black truncate">{st.labelAr}</div>
                  <div
                    className={`text-[10px] truncate ${
                      currentStage === st.id ? "text-blue-100" : "text-[#94A3B8]"
                    }`}
                  >
                    {st.labelEn}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Reading Alert Banner */}
      {showResumeBanner && savedSceneIdx !== null && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
            <Bookmark className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              لقد توقفت سابقاً عند <strong>المشهد {savedSceneIdx + 1}</strong> من أحداث القصة المصورة.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSceneIdx(savedSceneIdx);
                setShowResumeBanner(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition"
            >
              متابعة القراءة الآن
            </button>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="px-2 py-1 text-xs text-[#92400E] hover:underline"
            >
              تخطي
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 1: COMIC GRAPHIC NOVEL READER */}
      {/* ========================================================================= */}
      {currentStage === "comic" && (
        <div className="space-y-4">
          {scenes.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center space-y-3">
              <Film className="w-12 h-12 mx-auto text-[#94A3B8]" />
              <h3 className="text-base font-bold text-[#334155]">
                جاري إعداد المشاهد المصورة لهذا الفصل
              </h3>
              <p className="text-xs text-[#64748B]">
                يمكنك الآن الانتقال إلى مرحلة "استمع واقرأ" أو "بنك المفردات" للاطلاع على نصوص الفصل.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scene Navigation Bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSceneChange(Math.max(0, activeSceneIdx - 1))}
                  disabled={activeSceneIdx <= 0}
                  className="px-3 md:px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-white text-xs font-bold text-[#334155] disabled:opacity-40 transition flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="hidden sm:inline">المشهد السابق</span>
                </button>

                {/* Scene step indicator pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {scenes.map((sc, idx) => (
                    <button
                      key={sc.id || idx}
                      onClick={() => handleSceneChange(idx)}
                      className={`h-8 px-3 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                        activeSceneIdx === idx
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      }`}
                    >
                      <span>مشهد {idx + 1}</span>
                      {activeSceneIdx === idx && <Sparkles className="w-3 h-3 text-amber-300" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      autoPlay
                        ? "bg-[#10B981] text-white shadow-sm"
                        : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:bg-white"
                    }`}
                    title={autoPlay ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي للمشاهد"}
                  >
                    {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="hidden md:inline">{autoPlay ? "إيقاف" : "تشغيل تلقائي"}</span>
                  </button>

                  <button
                    onClick={() => handleSceneChange(Math.min(scenes.length - 1, activeSceneIdx + 1))}
                    disabled={activeSceneIdx >= scenes.length - 1}
                    className="px-3 md:px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 text-xs font-bold disabled:opacity-40 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="hidden sm:inline">المشهد التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The Master Graphic Novel Panel Canvas */}
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                className="transition-transform duration-200"
              >
                <div
                  className={`relative rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-gradient-to-br ${
                    currentScene?.bgGradient || "from-slate-900 via-blue-950 to-indigo-950"
                  } min-h-[520px] md:min-h-[580px] p-4 md:p-8 flex flex-col justify-between text-white`}
                >
                  {/* Scene Header Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                        مشهد {activeSceneIdx + 1} / {scenes.length}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-slate-200">
                        📍 {currentScene?.settingAr}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-slate-200">
                        ⏰ {currentScene?.timeOfDayAr}
                      </span>
                    </div>

                    {/* Listen to Narration Button */}
                    {currentScene?.narrationEn && (
                      <button
                        onClick={() =>
                          speakText(currentScene.narrationEn || "", `scene_narration_${currentScene.id}`)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition flex items-center gap-1.5 ${
                          activeSpeakingId === `scene_narration_${currentScene.id}`
                            ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg animate-pulse"
                            : "bg-white/15 border-white/30 text-white hover:bg-white/25"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>استمع لسرد المشهد</span>
                      </button>
                    )}
                  </div>

                  {/* Scene Title Banner */}
                  <div className="my-3 text-center z-10 space-y-1">
                    <h3 className="text-xl md:text-3xl font-black tracking-wide text-white drop-shadow-md">
                      {currentScene?.titleAr}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-300 font-serif italic" dir="ltr">
                      {currentScene?.titleEn}
                    </p>
                  </div>

                  {/* Programmatic Floating Dialogue Bubbles Canvas */}
                  <div className="relative my-4 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center z-10">
                    {currentScene?.bubbles.map((bubble, bIdx) => {
                      const isThought = bubble.type === "thought";
                      const isNarration = bubble.type === "narration";
                      const isSpeaking = activeSpeakingId === bubble.id;

                      return (
                        <div
                          key={bubble.id || bIdx}
                          className={`relative p-4 rounded-3xl transition-all duration-300 shadow-xl ${
                            isThought
                              ? "bg-slate-900/90 border-2 border-dashed border-amber-400 text-amber-100 backdrop-blur-md"
                              : isNarration
                              ? "bg-slate-950/85 border border-slate-700 text-slate-200 md:col-span-2 backdrop-blur-md"
                              : "bg-white/95 text-slate-900 border-2 border-slate-200 backdrop-blur-md"
                          } ${isSpeaking ? "ring-4 ring-blue-500 scale-[1.02]" : "hover:scale-[1.01]"}`}
                        >
                          {/* Speaker Badge */}
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/10">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm ${
                                  isThought ? "bg-amber-500" : isNarration ? "bg-purple-600" : "bg-[#2563EB]"
                                }`}
                              >
                                {isThought ? "💭" : isNarration ? "📜" : "👤"}
                              </div>
                              <div>
                                <span className="text-xs font-black tracking-wide block">
                                  {bubble.speakerAr}
                                </span>
                                <span className="text-[10px] text-slate-500 font-serif block" dir="ltr">
                                  {bubble.speakerEn}
                                </span>
                              </div>
                            </div>

                            {/* Listen Button for Bubble */}
                            <button
                              onClick={() => speakText(bubble.textEn, bubble.id)}
                              className={`p-1.5 rounded-xl border transition ${
                                isSpeaking
                                  ? "bg-[#2563EB] text-white border-blue-600 animate-pulse"
                                  : "bg-slate-100 hover:bg-[#E8F3FF] text-slate-700 hover:text-[#2563EB] border-slate-200"
                              }`}
                              title="استمع للنطق الإنجليزي"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Dialogue Text Content */}
                          <div className="space-y-1.5">
                            {(langMode === "bilingual" || langMode === "en") && (
                              <p
                                className="text-sm md:text-base font-serif font-bold text-slate-900 leading-relaxed"
                                dir="ltr"
                              >
                                {bubble.textEn}
                              </p>
                            )}

                            {(langMode === "bilingual" || langMode === "ar") && (
                              <p
                                className={`text-xs md:text-sm font-medium ${
                                  isThought ? "text-amber-200" : "text-[#2563EB]"
                                } leading-relaxed`}
                              >
                                {bubble.textAr}
                              </p>
                            )}
                          </div>

                          {/* Characters present quick button */}
                          {onOpenCharacterChat && bubble.speakerEn && !isNarration && (
                            <div className="mt-2.5 pt-2 border-t border-black/5 flex justify-end">
                              <button
                                onClick={() => onOpenCharacterChat(bubble.speakerEn)}
                                className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>حاور {bubble.speakerAr} بالذكاء الاصطناعي</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scene Visual Narration Banner at Bottom */}
                  {currentScene?.narrationEn && (
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4 text-xs md:text-sm text-slate-200 space-y-1 z-10">
                      {(langMode === "bilingual" || langMode === "en") && (
                        <p className="font-serif leading-relaxed text-slate-200" dir="ltr">
                          📖 {currentScene.narrationEn}
                        </p>
                      )}
                      {(langMode === "bilingual" || langMode === "ar") && (
                        <p className="text-amber-200 font-medium leading-relaxed">
                          {currentScene.narrationAr}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Visual Background Lighting & Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                </div>
              </div>

              {/* Visual Prompt & Character References Drawer */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs md:text-sm font-black text-[#1E293B]">
                      محددات المشهد والشخصيات المشاركة في هذه اللقطة
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#64748B]">
                    {currentScene?.charactersPresent.join(" • ")}
                  </span>
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">
                  {currentScene?.visualDescriptionAr}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: LISTEN & READ (KARAOKE AUDIO & TEXT) */}
      {/* ========================================================================= */}
      {currentStage === "listen" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1E293B]">
                المرحلة 2: الاستماع ومتابعة النص الأصلي
              </h3>
              <p className="text-xs text-[#64748B]">
                استمع لنطق الفقرات الأصلية بالإنجليزية وتتبع الترجمة المعتمدة كلمة بكلمة
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {chapter.theText.map((para) => (
              <div
                key={para.order}
                className="p-4 md:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm md:text-base font-serif leading-relaxed text-[#1E293B]" dir="ltr">
                    {para.paragraphEn}
                  </p>
                  <button
                    onClick={() => speakText(para.paragraphEn, `para_${para.order}`)}
                    className={`p-2 rounded-xl border transition shrink-0 ${
                      activeSpeakingId === `para_${para.order}`
                        ? "bg-[#2563EB] text-white border-blue-600 animate-pulse"
                        : "bg-white border-[#E2E8F0] hover:bg-[#E8F3FF] text-[#64748B] hover:text-[#2563EB]"
                    }`}
                    title="استمع للفقرة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs md:text-sm text-[#2563EB] font-medium leading-relaxed">
                  {para.paragraphAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: VOCABULARY FLASHCARDS */}
      {/* ========================================================================= */}
      {currentStage === "vocab" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1E293B]">
                  المرحلة 3: بنك المفردات والبطاقات التعليمية
                </h3>
                <p className="text-xs text-[#64748B]">
                  احفظ كلمات الفصل الأساسية وتعرف على معانيها وأمثلتها السياقية
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#64748B]">
              {activeVocabCardIdx + 1} / {chapter.vocabulary.length}
            </span>
          </div>

          {chapter.vocabulary.length > 0 ? (
            <div className="space-y-6 max-w-xl mx-auto">
              {/* Interactive Flashcard */}
              <div
                onClick={() => setIsVocabCardFlipped(!isVocabCardFlipped)}
                className="cursor-pointer min-h-[220px] rounded-3xl border-2 border-dashed border-[#CBD5E1] bg-gradient-to-tr from-[#F8FAFC] to-[#EFF6FF] p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition transform hover:scale-[1.01]"
              >
                {!isVocabCardFlipped ? (
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-100 text-[#2563EB]">
                      انقر للكشف عن المعنى والمثال
                    </span>
                    <h4 className="text-3xl font-black text-[#1E293B] font-serif" dir="ltr">
                      {chapter.vocabulary[activeVocabCardIdx]?.word}
                    </h4>
                    {chapter.vocabulary[activeVocabCardIdx]?.phonetic && (
                      <p className="text-xs text-[#64748B] font-mono">
                        {chapter.vocabulary[activeVocabCardIdx]?.phonetic}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700">
                      المعنى السياقي
                    </span>
                    <h4 className="text-2xl font-black text-emerald-800">
                      {chapter.vocabulary[activeVocabCardIdx]?.meaningAr}
                    </h4>
                    {chapter.vocabulary[activeVocabCardIdx]?.example && (
                      <p className="text-xs text-[#475569] font-serif italic max-w-md" dir="ltr">
                        "{chapter.vocabulary[activeVocabCardIdx]?.example}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Flashcard Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setIsVocabCardFlipped(false);
                    setActiveVocabCardIdx((idx) => Math.max(0, idx - 1));
                  }}
                  disabled={activeVocabCardIdx <= 0}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold disabled:opacity-40"
                >
                  الكلمة السابقة
                </button>

                <button
                  onClick={() =>
                    speakText(
                      chapter.vocabulary[activeVocabCardIdx]?.word || "",
                      `vocab_${activeVocabCardIdx}`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>استمع للكلمة</span>
                </button>

                <button
                  onClick={() => {
                    setIsVocabCardFlipped(false);
                    setActiveVocabCardIdx((idx) =>
                      Math.min(chapter.vocabulary.length - 1, idx + 1)
                    );
                  }}
                  disabled={activeVocabCardIdx >= chapter.vocabulary.length - 1}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold disabled:opacity-40"
                >
                  الكلمة التالية
                </button>
              </div>

              {/* Complete Word Grid */}
              <div className="pt-4 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {chapter.vocabulary.map((vocab, vIdx) => (
                  <div
                    key={vIdx}
                    onClick={() => {
                      setActiveVocabCardIdx(vIdx);
                      setIsVocabCardFlipped(false);
                    }}
                    className={`p-2.5 rounded-xl border text-right cursor-pointer transition ${
                      activeVocabCardIdx === vIdx
                        ? "bg-blue-50 border-[#2563EB]"
                        : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white"
                    }`}
                  >
                    <div className="font-bold text-xs text-[#1E293B]" dir="ltr">
                      {vocab.word}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">{vocab.meaningAr}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-[#64748B]">لا توجد كلمات مسجلة لهذا الفصل</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: CHARACTER EXPLORER & AI CHAT */}
      {/* ========================================================================= */}
      {currentStage === "characters" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1E293B]">
                المرحلة 4: مستكشف الشخصيات والتفاعل الذكي
              </h3>
              <p className="text-xs text-[#64748B]">
                تعرف على مظهر الشخصيات، ملابسها، دوافعها في هذا الفصل، وتحدث معها مباشرة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(charRefs.length > 0 ? charRefs : (chapter.importantCharacters || []).map(c => ({
              nameEn: c.nameEn,
              nameAr: c.nameAr,
              role: c.roleAr,
              age: "غير محدد",
              appearanceEn: c.roleEn,
              appearanceAr: c.roleAr,
              clothingEn: "Historical attire",
              clothingAr: "زي تاريخي متوافق مع العصر",
              promptKey: c.nameEn,
              avatarColor: "#2563EB"
            }))).map((char, cIdx) => (
              <div
                key={cIdx}
                className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: char.avatarColor || "#2563EB" }}
                      className="w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-base shadow-sm"
                    >
                      {char.nameEn.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1E293B]">{char.nameAr}</h4>
                      <p className="text-xs text-[#64748B] font-serif" dir="ltr">
                        {char.nameEn} • {char.age}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#475569]">
                    <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="font-bold text-[#1E293B] block">الدور والموقع:</span>
                      <span>{char.role}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="font-bold text-[#1E293B] block">المظهر والملامح:</span>
                      <span>{char.appearanceAr}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="font-bold text-[#1E293B] block">الملابس والزي التاريخي:</span>
                      <span>{char.clothingAr}</span>
                    </div>
                  </div>
                </div>

                {onOpenCharacterChat && (
                  <button
                    onClick={() => onOpenCharacterChat(char.nameEn)}
                    className="w-full py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>تحدث مع {char.nameAr} الآن</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 5: STORY UNDERSTANDING & BILINGUAL SUMMARY */}
      {/* ========================================================================= */}
      {currentStage === "summary" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1E293B]">
                المرحلة 5: فهم أحداث الفصل والملخص المعتمد
              </h3>
              <p className="text-xs text-[#64748B]">
                ملخص متكامل ثنائي اللغة، وأهم نقاط وأحداث الفصل، والاقتباسات والدروس المستفادة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <h4 className="text-sm font-black text-[#1E293B] flex items-center gap-2">
                <span>📖 الملخص العربي المعتمد</span>
              </h4>
              <p className="text-xs md:text-sm text-[#334155] leading-relaxed">
                {chapter.summaryAr}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <h4 className="text-sm font-black text-[#1E293B] flex items-center gap-2">
                <span>🇬🇧 English Summary</span>
              </h4>
              <p className="text-xs md:text-sm text-[#334155] font-serif leading-relaxed" dir="ltr">
                {chapter.summaryEn}
              </p>
            </div>
          </div>

          {/* Chapter in Points */}
          {chapter.chapterInPoints && chapter.chapterInPoints.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#1E293B]">أهم أحداث الفصل في نقاط مرتبة:</h4>
              <div className="space-y-2">
                {chapter.chapterInPoints.map((pt, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#E8F3FF] text-[#2563EB] font-black text-xs flex items-center justify-center shrink-0">
                      {pIdx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#1E293B]">{pt.ar}</p>
                      <p className="text-xs text-[#64748B] font-serif" dir="ltr">
                        {pt.en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 6: CHAPTER CHALLENGE (MCQ QUIZ) */}
      {/* ========================================================================= */}
      {currentStage === "challenge" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1E293B]">
                  المرحلة 6: التحدي الختامي للفصل
                </h3>
                <p className="text-xs text-[#64748B]">
                  اختبر استيعابك لأحداث وتفاصيل الفصل المصور واحصل على شارتك التقديرية
                </p>
              </div>
            </div>

            {challengeSubmitted && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#64748B]">النتيجة:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    quizScore >= 70
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {quizScore}% ({correctCount} من {mcqs.length})
                </span>
              </div>
            )}
          </div>

          {mcqs.length > 0 ? (
            <div className="space-y-6">
              {mcqs.map((q, idx) => {
                const qId = q.id || `q_${idx}`;
                const selectedOpt = challengeAnswers[qId];
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div
                    key={qId}
                    className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-black text-[#1E293B] font-serif leading-relaxed" dir="ltr">
                        {idx + 1}. {q.question}
                      </h4>
                      {challengeSubmitted && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 ${
                            isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isCorrect ? "إجابة صحيحة ✓" : "إجابة خاطئة ✗"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isRightAnswer = challengeSubmitted && optIdx === q.correctIndex;
                        const isWrongChoice = challengeSubmitted && isChosen && !isRightAnswer;

                        return (
                          <button
                            key={optIdx}
                            disabled={challengeSubmitted}
                            onClick={() =>
                              setChallengeAnswers((prev) => ({ ...prev, [qId]: optIdx }))
                            }
                            className={`p-3 rounded-xl border text-right transition flex items-center justify-between text-xs font-serif ${
                              isRightAnswer
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                                : isWrongChoice
                                ? "bg-red-50 border-red-500 text-red-900"
                                : isChosen
                                ? "bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold"
                                : "bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]"
                            }`}
                            dir="ltr"
                          >
                            <span>{opt}</span>
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-sans">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {challengeSubmitted && q.explanationAr && (
                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#2563EB]">
                        💡 <strong>التوضيح:</strong> {q.explanationAr}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
                {!challengeSubmitted ? (
                  <button
                    onClick={() => setChallengeSubmitted(true)}
                    disabled={Object.keys(challengeAnswers).length === 0}
                    className="px-6 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow-md shadow-blue-500/20"
                  >
                    تصحيح إجاباتي الآن
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setChallengeAnswers({});
                      setChallengeSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#475569] hover:bg-white transition"
                  >
                    إعادة المحاولة
                  </button>
                )}

                {challengeSubmitted && quizScore >= 70 && (
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-black">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>مبارك! لقد أتممت قراءة واختبار هذا الفصل بنجاح!</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-[#64748B]">
              لا توجد أسئلة اختيار من متعدد مسجلة لهذا الفصل
            </p>
          )}
        </div>
      )}
    </div>
  );
}
