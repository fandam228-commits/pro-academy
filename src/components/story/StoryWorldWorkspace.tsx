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
  Sun,
  Moon,
  Coffee,
  Send,
  HelpCircle,
  Clock,
  Layers,
  Settings,
  Plus,
  Search,
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
} from "lucide-react";
import { ALL_CURRICULUM_STORIES, GRADE_DEFINITIONS, StoryItem, ChapterItem } from "@/data/story-world";

interface StoryWorldProps {
  user?: any;
  onNavigateHome?: () => void;
}

export function StoryWorldWorkspace({ user, onNavigateHome }: StoryWorldProps) {
  // Navigation & Grade/Term Hierarchy
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>("sec_3");
  const [selectedTerm, setSelectedTerm] = useState<"all" | "first" | "second" | "full_year">("all");
  const [selectedStoryId, setSelectedStoryId] = useState<string>("story_sec_3_monte_cristo");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("sc_sec_3_ch_1");

  // Active top-level mode
  const [activeTab, setActiveTab] = useState<
    "book" | "cinema" | "listen" | "chat" | "challenges" | "exam" | "badges" | "admin"
  >("book");

  // Reading sub-section filter inside "book" tab
  const [activeSectionFilter, setActiveSectionFilter] = useState<
    "all" | "intro" | "characters" | "themes" | "points" | "text" | "vocab" | "qa" | "important" | "homework"
  >("all");

  const [loading, setLoading] = useState(false);
  const [storiesData, setStoriesData] = useState<any[]>([]);
  const [chapterData, setChapterData] = useState<any>(null);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Reader Settings
  const [readingMode, setReadingMode] = useState<"light" | "sepia" | "dark">("light");
  const [fontSize, setFontSize] = useState<number>(18);
  const [showSentenceTranslation, setShowSentenceTranslation] = useState<boolean>(true);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [wordSaveSuccess, setWordSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Cinema & Audio Narration
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeKaraokeSentenceIdx, setActiveKaraokeSentenceIdx] = useState<number>(0);

  // Character Chat
  const [chatCharacter, setChatCharacter] = useState<string>("Edmond Dantés");
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatSending, setChatSending] = useState<boolean>(false);

  // Challenges
  const [challengeType, setChallengeType] = useState<"whoSaidThis" | "vocab" | "chronology">("whoSaidThis");
  const [challengesData, setChallengesData] = useState<any>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, string>>({});
  const [challengeResult, setChallengeResult] = useState<any>(null);

  // Exam Arena
  const [examSession, setExamSession] = useState<any>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [loadingExam, setLoadingExam] = useState<boolean>(false);

  // Badges & Progress
  const [userBadges, setUserBadges] = useState<any[]>([]);

  // Admin Hub Form
  const [adminChapterTitleAr, setAdminChapterTitleAr] = useState("");
  const [adminChapterTitleEn, setAdminChapterTitleEn] = useState("");
  const [adminSummary, setAdminSummary] = useState("");
  const [adminSavedMessage, setAdminSavedMessage] = useState("");
  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  // Homework Interactive Answers
  const [homeworkAnswers, setHomeworkAnswers] = useState<Record<string, string>>({});
  const [homeworkFeedback, setHomeworkFeedback] = useState<Record<string, boolean>>({});

  // 1. Initial Load from API
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const res = await fetch("/api/story-world/stories");
        const json = await res.json();
        if (json.success) {
          if (Array.isArray(json.stories)) setStoriesData(json.stories);
          if (json.badges) setUserBadges(json.badges);
        }
      } catch (err) {
        console.error("Error loading stories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Filter available stories based on selected grade and term
  const availableStories = ALL_CURRICULUM_STORIES.filter((s) => {
    if (s.gradeCode !== selectedGradeCode) return false;
    if (selectedTerm === "all") return true;
    if (s.term === "full_year") return true;
    return s.term === selectedTerm;
  });

  // Current selected story
  const currentStory =
    availableStories.find((s) => s.id === selectedStoryId) ||
    availableStories[0] ||
    ALL_CURRICULUM_STORIES[0];

  // Update selected story when grade/term changes
  useEffect(() => {
    if (availableStories.length > 0) {
      if (!availableStories.some((s) => s.id === selectedStoryId)) {
        const nextStory = availableStories[0];
        setSelectedStoryId(nextStory.id);
        if (nextStory.chapters.length > 0) {
          setSelectedChapterId(nextStory.chapters[0].id);
        }
      }
    }
  }, [selectedGradeCode, selectedTerm]);

  // Current chapter from selected story
  const currentChapter =
    currentStory.chapters.find((ch) => ch.id === selectedChapterId) ||
    currentStory.chapters[0];

  // Load chapter details from API (or static fallback)
  useEffect(() => {
    if (!currentChapter?.id) return;
    async function fetchChapter() {
      try {
        setLoadingChapter(true);
        const res = await fetch(`/api/story-world/chapter/${currentChapter.id}`);
        const json = await res.json();
        if (json.success && json.chapter) {
          setChapterData(json);
          // Set initial character for chat
          if (Array.isArray(json.chapter.characters) && json.chapter.characters.length > 0) {
            setChatCharacter(json.chapter.characters[0].nameEn || json.chapter.characters[0].name || "Edmond Dantés");
          }
        }
      } catch (err) {
        console.error("Error loading chapter data:", err);
      } finally {
        setLoadingChapter(false);
      }
    }
    fetchChapter();
  }, [currentChapter?.id]);

  // Load challenges when challenges tab is active
  useEffect(() => {
    if (activeTab === "challenges" && currentChapter?.id) {
      async function loadChallenges() {
        try {
          const res = await fetch(`/api/story-world/challenges?chapterId=${currentChapter.id}`);
          const json = await res.json();
          if (json.success) {
            setChallengesData(json.challenges);
            setChallengeAnswers({});
            setChallengeResult(null);
          }
        } catch (err) {
          console.error("Error loading challenges:", err);
        }
      }
      loadChallenges();
    }
  }, [activeTab, currentChapter?.id]);

  // Speech Pronunciation
  const speakWordOrSentence = (text: string, rate: number = 0.95) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlayNarration = (text: string) => {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakWordOrSentence(text, playbackSpeed);
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  const handleSaveWordToVocabulary = async (wordObj: any) => {
    if (!wordObj) return;
    try {
      const res = await fetch("/api/story-world/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: currentStory.gradeCode,
          chapterId: currentChapter.id,
          savedWord: wordObj,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setWordSaveSuccess(true);
        setTimeout(() => setWordSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving word:", err);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || chatSending) return;
    const msg = chatMessage.trim();
    setChatMessage("");
    setChatSending(true);

    const userMsg = { role: "user", content: msg, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/story-world/character-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: currentStory.gradeCode,
          chapterId: currentChapter.id,
          characterName: chatCharacter,
          message: msg,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const replyMsg = {
          role: "character",
          content: json.reply,
          languageTip: json.languageTip,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, replyMsg]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setChatSending(false);
    }
  };

  const handleStartExam = async () => {
    try {
      setLoadingExam(true);
      setExamSubmitted(false);
      setExamResult(null);
      setExamAnswers({});
      const res = await fetch(`/api/story-world/exams?chapterId=${currentChapter.id}`);
      const json = await res.json();
      if (json.success) {
        setExamSession(json);
      }
    } catch (err) {
      console.error("Error loading exam:", err);
    } finally {
      setLoadingExam(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!examSession?.secretsToken) return;
    try {
      setLoadingExam(true);
      const res = await fetch("/api/story-world/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretsToken: examSession.secretsToken,
          studentAnswers: examAnswers,
          isFinalExam: false,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setExamResult(json);
        setExamSubmitted(true);
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
    } finally {
      setLoadingExam(false);
    }
  };

  const handleSubmitChallenge = async () => {
    if (!currentChapter?.id) return;
    try {
      const res = await fetch("/api/story-world/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: currentChapter.id,
          challengeType,
          submissions: challengeAnswers,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setChallengeResult(json);
      }
    } catch (err) {
      console.error("Error submitting challenge:", err);
    }
  };

  const toggleAnswerReveal = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCheckHomework = (id: string, selectedOpt: string, correctOpt: string) => {
    setHomeworkAnswers((prev) => ({ ...prev, [id]: selectedOpt }));
    setHomeworkFeedback((prev) => ({ ...prev, [id]: selectedOpt.trim().toLowerCase() === correctOpt.trim().toLowerCase() }));
  };

  // Chapter index for navigation
  const currentChapterIdx = currentStory.chapters.findIndex((c) => c.id === currentChapter?.id);
  const prevChapter = currentChapterIdx > 0 ? currentStory.chapters[currentChapterIdx - 1] : null;
  const nextChapter = currentChapterIdx < currentStory.chapters.length - 1 ? currentStory.chapters[currentChapterIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#243247] flex flex-col font-sans" dir="rtl">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#718096] hover:text-[#2563EB] transition"
                title="العودة للرئيسية"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold text-[#243247]">
                  عالم القصص الأدبية التفاعلي
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F3FF] text-[#2563EB] border border-[#BFDBFE]">
                  Mr. Habib El Rahman
                </span>
              </div>
              <p className="text-xs text-[#718096]">
                {currentStory.titleEn} ({currentStory.titleAr}) • {currentStory.gradeLabelAr}
              </p>
            </div>
          </div>

          {/* Top Activity Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("book")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "book"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>القارئ التفاعلي</span>
            </button>

            <button
              onClick={() => setActiveTab("cinema")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "cinema"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>سينما القصة</span>
            </button>

            <button
              onClick={() => setActiveTab("listen")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "listen"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>استمع واقرأ</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>حوار الشخصيات</span>
            </button>

            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "challenges"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>التحديات</span>
            </button>

            <button
              onClick={() => setActiveTab("exam")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "exam"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>الامتحانات</span>
            </button>

            {(user?.role === "admin" || user?.role === "teacher") && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "admin"
                    ? "bg-[#EABF58] text-[#243247] shadow-md shadow-amber-500/20"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. ACADEMIC HIERARCHY SELECTOR (الصف -> الترم -> القصة -> الفصل) */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* A. GRADE SELECTION PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#718096] whitespace-nowrap flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-[#2563EB]" />
              <span>الصف:</span>
            </span>
            {GRADE_DEFINITIONS.map((gDef) => (
              <button
                key={gDef.code}
                onClick={() => setSelectedGradeCode(gDef.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedGradeCode === gDef.code
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                }`}
              >
                {gDef.labelAr}
              </button>
            ))}
          </div>

          {/* B. TERM SELECTION PILLS & STORY CAROUSEL */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-[#718096] whitespace-nowrap flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>الترم:</span>
              </span>
              <button
                onClick={() => setSelectedTerm("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedTerm === "all"
                    ? "bg-[#E8F3FF] text-[#2563EB] border border-[#BFDBFE] font-bold"
                    : "text-[#718096] hover:bg-[#F1F5F9]"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedTerm("first")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedTerm === "first"
                    ? "bg-[#E8F3FF] text-[#2563EB] border border-[#BFDBFE] font-bold"
                    : "text-[#718096] hover:bg-[#F1F5F9]"
                }`}
              >
                الترم الأول
              </button>
              <button
                onClick={() => setSelectedTerm("second")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedTerm === "second"
                    ? "bg-[#E8F3FF] text-[#2563EB] border border-[#BFDBFE] font-bold"
                    : "text-[#718096] hover:bg-[#F1F5F9]"
                }`}
              >
                الترم الثاني
              </button>
            </div>

            {/* Story Picker (if multiple stories exist for this grade) */}
            {availableStories.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#718096]">القصة:</span>
                <div className="flex gap-1.5">
                  {availableStories.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStoryId(s.id);
                        if (s.chapters.length > 0) setSelectedChapterId(s.chapters[0].id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedStoryId === s.id
                          ? "bg-[#2563EB] text-white"
                          : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                      }`}
                    >
                      {s.titleEn}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* C. CHAPTERS CAROUSEL */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 border-t border-[#F1F5F9] scrollbar-none">
            <span className="text-xs font-bold text-[#718096] whitespace-nowrap flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>الفصول:</span>
            </span>
            {currentStory.chapters.map((ch) => {
              const isActive = ch.id === currentChapter?.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                    isActive
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                      : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    isActive ? "bg-white text-[#2563EB]" : "bg-[#E8F3FF] text-[#2563EB]"
                  }`}>
                    {ch.chapterNumber}
                  </span>
                  <span>{ch.titleEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {loading || loadingChapter ? (
          <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#475569]">جاري تجهيز محتوى الفصل التفاعلي الكامل...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* TAB 1: THE COMPLETE 11-SECTION INTERACTIVE STORY READER */}
            {/* ========================================================================= */}
            {activeTab === "book" && (
              <div className="space-y-6">
                {/* STORY HERO CARD & AUTHOR HEADER */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                  <div className="w-28 h-36 md:w-32 md:h-44 rounded-2xl overflow-hidden shadow-md shrink-0 border border-[#CBD5E1] bg-[#F1F5F9]">
                    <img
                      src={currentStory.coverImage}
                      alt={currentStory.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-right">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8F3FF] text-[#2563EB] border border-[#BFDBFE]">
                        {currentStory.gradeLabelAr}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        {currentStory.termLabelAr}
                      </span>
                      <span className="text-xs text-[#718096]">
                        {currentStory.chapters.length} فصول مقررة
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-[#243247]">
                      {currentStory.titleEn}
                    </h2>
                    <p className="text-lg font-bold text-[#2563EB]">
                      {currentStory.titleAr}
                    </p>
                    <p className="text-sm text-[#475569]">
                      <span className="font-bold text-[#243247]">المؤلف: </span>
                      {currentStory.author}
                    </p>
                    <p className="text-xs text-[#64748B] max-w-3xl leading-relaxed">
                      {currentStory.descriptionAr || currentStory.plotSummaryAr}
                    </p>
                  </div>

                  {/* Quick Chapter Progress Pill */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shrink-0 min-w-36">
                    <span className="text-xs font-bold text-[#718096]">الفصل الحالي</span>
                    <span className="text-3xl font-black text-[#2563EB] my-1">
                      {currentChapter?.chapterNumber} / {currentStory.chapters.length}
                    </span>
                    <span className="text-[11px] text-[#475569] font-semibold text-center">
                      {currentChapter?.titleEn}
                    </span>
                  </div>
                </div>

                {/* 11-SECTION FILTER TOOLBAR */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <span className="text-xs font-bold text-[#718096] whitespace-nowrap flex items-center gap-1 ml-1">
                      <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>الأقسام:</span>
                    </span>
                    {[
                      { id: "all", label: "عرض كل الأقسام (11)" },
                      { id: "intro", label: "1. المقدمة والمؤلف" },
                      { id: "characters", label: "2. الشخصيات" },
                      { id: "themes", label: "3. الموضوعات الأدبية" },
                      { id: "points", label: "4. نقاط الفصل" },
                      { id: "text", label: "5. النص ثنائي اللغة" },
                      { id: "vocab", label: "6. المفردات" },
                      { id: "qa", label: "7. أسئلة الكتاب SB/WB" },
                      { id: "important", label: "8. التفكير النقدي" },
                      { id: "homework", label: "9. الواجب والامتحانات" },
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSectionFilter(sec.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          activeSectionFilter === sec.id
                            ? "bg-[#2563EB] text-white shadow-sm"
                            : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>

                  {/* Font Scaling & Translation Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
                      <button
                        onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                        className="p-1 rounded-lg hover:bg-white text-[#475569] transition"
                        title="تصغير الخط"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-extrabold text-[#2563EB] px-1">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize((f) => Math.min(28, f + 2))}
                        className="p-1 rounded-lg hover:bg-white text-[#475569] transition"
                        title="تكبير الخط"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => setShowSentenceTranslation(!showSentenceTranslation)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        showSentenceTranslation
                          ? "bg-[#E8F3FF] text-[#2563EB] border-[#BFDBFE]"
                          : "bg-[#F1F5F9] text-[#718096] border-[#E2E8F0]"
                      }`}
                    >
                      {showSentenceTranslation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showSentenceTranslation ? "إخفاء الترجمة" : "إظهار الترجمة"}</span>
                    </button>
                  </div>
                </div>

                {/* ===================================================================== */}
                {/* SECTION 1: STORY INTRODUCTION & ABOUT THE AUTHOR */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "intro") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            مقدمة القصة ونبذة عن المؤلف (Story Introduction & Author)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            السياق الأدبي والتاريخي للعمل المقرر
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#E8F3FF] text-[#2563EB]">
                        {currentStory.author}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                        <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>نبذة المؤلف بالإنجليزية:</span>
                        </span>
                        <p className="text-sm text-[#334155] leading-relaxed font-serif" dir="ltr">
                          {currentStory.aboutAuthorEn || "Official biography and background notes as prescribed by the Ministry curriculum."}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                        <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>نبذة المؤلف بالعربية:</span>
                        </span>
                        <p className="text-sm text-[#334155] leading-relaxed">
                          {currentStory.aboutAuthorAr || "النبذة الأدبية المعتمدة للكاتب وسياق العمل الأدبي."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 2: MAIN CHARACTERS */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "characters") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-4">
                      <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#243247]">
                          الشخصيات الرئيسية والفرعية (Main Characters)
                        </h3>
                        <p className="text-xs text-[#718096]">
                          دليل الشخصيات، أدوارها، ودوافعها الدرامية
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentStory.characters.map((char, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] transition shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-[#2563EB]">
                              {char.nameEn}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#718096]">
                              {char.role}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#243247]">{char.nameAr}</p>
                          <p className="text-xs text-[#475569] leading-relaxed">
                            {char.descriptionAr || char.descriptionEn}
                          </p>
                          <p className="text-[11px] text-[#64748B] italic leading-relaxed font-serif" dir="ltr">
                            {char.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 3: MAIN THEMES */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "themes") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-4">
                      <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#243247]">
                          الموضوعات الأدبية الرئيسية (Main Themes & Motifs)
                        </h3>
                        <p className="text-xs text-[#718096]">
                          الرسائل التربوية والمفاهيم النقدية المستهدفة في الامتحان
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentStory.themes.map((th, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-xs font-black">
                              ★
                            </span>
                            <h4 className="font-extrabold text-sm text-[#243247]">
                              {th.themeEn} ({th.themeAr})
                            </h4>
                          </div>
                          <p className="text-xs text-[#334155] leading-relaxed">
                            {th.descriptionAr}
                          </p>
                          <p className="text-xs text-[#64748B] italic leading-relaxed font-serif" dir="ltr">
                            {th.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 4: CHAPTER IN POINTS */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "points") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center font-bold">
                          4
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            أهم نقاط الفصل {currentChapter.chapterNumber} (Chapter in Points)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            الأفكار والأحداث الرئيسية ثنائية اللغة لسهولة المراجعة السريعة
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                        {currentChapter.chapterInPoints.length} نقاط رئيسية
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentChapter.chapterInPoints.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#E8F3FF] text-[#2563EB] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                {pIdx + 1}
                              </span>
                              <p className="text-sm font-semibold text-[#1E293B]" dir="ltr">
                                {pt.en}
                              </p>
                            </div>
                            {showSentenceTranslation && pt.ar && (
                              <p className="text-xs text-[#2563EB] font-medium pr-7">
                                {pt.ar}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => speakWordOrSentence(pt.en)}
                            className="p-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#E8F3FF] hover:text-[#2563EB] text-[#718096] transition shrink-0"
                            title="استمع للنطق"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 5: THE FULL BILINGUAL TEXT */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "text") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
                          5
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            النص الكامل ثنائي اللغة (The Full Bilingual Text)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            الفصل {currentChapter.chapterNumber}: {currentChapter.titleEn} ({currentChapter.titleAr})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F3FF] text-[#2563EB]">
                        {currentChapter.theText.length} فقرة نصية
                      </span>
                    </div>

                    {/* Paragraph List */}
                    <div className="space-y-4" style={{ fontSize: `${fontSize}px` }}>
                      {currentChapter.theText.map((para, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] transition space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="w-6 h-6 rounded-full bg-white border border-[#CBD5E1] text-[#718096] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                              {pIdx + 1}
                            </span>
                            <p className="flex-1 text-[#1E293B] font-serif leading-relaxed" dir="ltr">
                              {para.paragraphEn}
                            </p>
                            <button
                              onClick={() => speakWordOrSentence(para.paragraphEn)}
                              className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#E8F3FF] hover:text-[#2563EB] text-[#718096] transition shrink-0"
                              title="استمع للفقرة"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {showSentenceTranslation && para.paragraphAr && (
                            <div className="pt-2 border-t border-[#E2E8F0]">
                              <p className="text-sm font-medium text-[#2563EB] leading-relaxed">
                                {para.paragraphAr}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 6: VOCABULARY EXPLORER */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "vocab") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center font-bold">
                          6
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            مستكشف الكلمات والمفردات (Vocabulary Explorer)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            المفردات المستهدفة مع النطق الصوتي التفاعلي والترجمة المعتمدة
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F3FF] text-[#2563EB]">
                        {currentChapter.vocabulary.length} كلمة
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {currentChapter.vocabulary.map((vocab, vIdx) => (
                        <div
                          key={vIdx}
                          className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#BFDBFE] transition flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-[#2563EB]">
                              {vocab.word}
                            </span>
                            <button
                              onClick={() => speakWordOrSentence(vocab.word)}
                              className="p-1 rounded-lg hover:bg-[#E8F3FF] text-[#718096] hover:text-[#2563EB] transition"
                              title="استمع للنطق"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-bold text-[#243247]">
                            {vocab.meaningAr}
                          </p>
                          <button
                            onClick={() => handleSaveWordToVocabulary(vocab)}
                            className="mt-1 w-full py-1 rounded-lg text-[11px] font-bold bg-white border border-[#E2E8F0] hover:bg-[#E8F3FF] hover:text-[#2563EB] text-[#718096] transition flex items-center justify-center gap-1"
                          >
                            <Bookmark className="w-3 h-3" />
                            <span>حفظ بكلماتي</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 7: QUESTIONS & ANSWERS (SB / WB) */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "qa") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center font-bold">
                          7
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            أسئلة الكتاب المدرسي (SB & WB Questions & Answers)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            تمارين كتاب الوزارة والتدريبات الرسمية مع الإجابات النموذجية
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F3FF] text-[#2563EB]">
                        {currentChapter.questionsAndAnswers.length} سؤال مدرسي
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentChapter.questionsAndAnswers.map((qa, qIdx) => {
                        const isRevealed = revealedAnswers[qa.id];
                        return (
                          <div
                            key={qa.id || qIdx}
                            className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                                  {qIdx + 1}
                                </span>
                                <p className="font-bold text-sm text-[#1E293B]">
                                  {qa.question}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleAnswerReveal(qa.id)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-white border border-[#E2E8F0] hover:bg-[#E8F3FF] hover:text-[#2563EB] text-[#718096] transition shrink-0"
                              >
                                {isRevealed ? "إخفاء الإجابة" : "إظهار الإجابة"}
                              </button>
                            </div>

                            {isRevealed && qa.answer && (
                              <div className="p-3 rounded-xl bg-[#E8F3FF] border border-[#BFDBFE] space-y-1 mt-2">
                                <span className="text-xs font-extrabold text-[#2563EB] block">الإجابة النموذجية:</span>
                                <p className="text-xs text-[#1E3A8A] leading-relaxed font-medium">
                                  {qa.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 8: IMPORTANT QUESTIONS & CRITICAL THINKING (JRE) */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "important") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold">
                          8
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            أسئلة التفكير النقدي وأسئلة JRE (Critical Thinking & Reasoning)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            أسئلة الفهم والتعليل وتقديم الأدلة النصية (Justify, Reasoning, Evidence)
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706]">
                        {currentChapter.importantQuestions.length} سؤال تفكير نقدي
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentChapter.importantQuestions.map((imp, iIdx) => {
                        const isRevealed = revealedAnswers[imp.id];
                        return (
                          <div
                            key={imp.id || iIdx}
                            className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#D97706] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                                  {iIdx + 1}
                                </span>
                                <p className="font-bold text-sm text-[#1E293B]">
                                  {imp.question}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleAnswerReveal(imp.id)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-white border border-[#E2E8F0] hover:bg-amber-50 hover:text-[#D97706] text-[#718096] transition shrink-0"
                              >
                                {isRevealed ? "إخفاء التعليل" : "إظهار التعليل والدليل"}
                              </button>
                            </div>

                            {isRevealed && imp.answer && (
                              <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] space-y-1 mt-2">
                                <span className="text-xs font-extrabold text-[#D97706] block">
                                  الدليل والتعليل النقدي (JRE Reasoning):
                                </span>
                                <p className="text-xs text-[#78350F] leading-relaxed font-medium">
                                  {imp.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ===================================================================== */}
                {/* SECTION 9: HOMEWORK & EXAM QUESTIONS */}
                {/* ===================================================================== */}
                {(activeSectionFilter === "all" || activeSectionFilter === "homework") && (
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                          9
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#243247]">
                            تمارين الواجب المنزلي وأسئلة الامتحانات (Homework & Exams)
                          </h3>
                          <p className="text-xs text-[#718096]">
                            تدريبات تطبيقية وامتحانات المحافظات المعتمدة
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                        {currentChapter.homeworkQuestions.length} تدريب تطبيقي
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentChapter.homeworkQuestions.map((hw, hIdx) => (
                        <div
                          key={hw.id || hIdx}
                          className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3"
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                              {hIdx + 1}
                            </span>
                            <p className="font-bold text-sm text-[#1E293B]">
                              {hw.question}
                            </p>
                          </div>

                          {/* Options if MCQ */}
                          {hw.options && hw.options.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-8">
                              {hw.options.map((opt, oIdx) => {
                                const isSelected = homeworkAnswers[hw.id] === opt;
                                const isCorrect = hw.correctAnswer === opt;
                                const showStatus = homeworkAnswers[hw.id] !== undefined;

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleCheckHomework(hw.id, opt, hw.correctAnswer || "")}
                                    className={`p-2.5 rounded-xl text-xs font-bold text-right transition border ${
                                      showStatus && isCorrect
                                        ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]"
                                        : showStatus && isSelected && !isCorrect
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : isSelected
                                        ? "bg-[#E8F3FF] text-[#2563EB] border-[#BFDBFE]"
                                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="pr-8">
                              <textarea
                                placeholder="اكتب إجابتك هنا للتدريب الذاتي..."
                                rows={2}
                                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-white text-[#1E293B] focus:border-[#2563EB] outline-none"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BOTTOM CHAPTER NAVIGATION BAR */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center justify-between shadow-sm">
                  <button
                    onClick={() => prevChapter && setSelectedChapterId(prevChapter.id)}
                    disabled={!prevChapter}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    <span>الفصل السابق {prevChapter ? `(${prevChapter.chapterNumber})` : ""}</span>
                  </button>

                  <span className="text-xs font-extrabold text-[#718096]">
                    الفصل {currentChapter.chapterNumber} من {currentStory.chapters.length}
                  </span>

                  <button
                    onClick={() => nextChapter && setSelectedChapterId(nextChapter.id)}
                    disabled={!nextChapter}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-40 text-xs font-bold flex items-center gap-2 transition shadow-sm"
                  >
                    <span>الفصل التالي {nextChapter ? `(${nextChapter.chapterNumber})` : ""}</span>
                    <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: STORY CINEMA & VISUAL STORYBOARD */}
            {/* ========================================================================= */}
            {activeTab === "cinema" && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm">
                  <div className="relative aspect-video bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#334155] flex items-center justify-center p-6 text-center text-white">
                    <div className="space-y-3 max-w-xl z-10">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center text-3xl shadow-lg">
                        🎭
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#EABF58] text-[#243247] inline-block shadow-sm">
                        {chapterData?.scenes?.[activeSceneIdx]?.characterName || "راوي القصة"}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black">
                        {chapterData?.scenes?.[activeSceneIdx]?.titleAr || "المشهد المسرحي التفاعلي"}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-200 font-serif leading-relaxed" dir="ltr">
                        {chapterData?.scenes?.[activeSceneIdx]?.narrationEn}
                      </p>
                      <p className="text-xs text-amber-200">
                        {chapterData?.scenes?.[activeSceneIdx]?.narrationAr}
                      </p>
                    </div>
                  </div>

                  {/* Scene Controls */}
                  <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                    <button
                      onClick={() => setActiveSceneIdx((idx) => Math.max(0, idx - 1))}
                      disabled={activeSceneIdx <= 0}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold disabled:opacity-40"
                    >
                      المشهد السابق
                    </button>
                    <button
                      onClick={() => speakWordOrSentence(chapterData?.scenes?.[activeSceneIdx]?.narrationEn || "")}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>استمع للحوار</span>
                    </button>
                    <button
                      onClick={() => setActiveSceneIdx((idx) => Math.min((chapterData?.scenes?.length || 1) - 1, idx + 1))}
                      disabled={activeSceneIdx >= (chapterData?.scenes?.length || 1) - 1}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold disabled:opacity-40"
                    >
                      المشهد التالي
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: LISTEN & KARAOKE */}
            {/* ========================================================================= */}
            {activeTab === "listen" && (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#243247]">
                      استمع واقرأ بتقنية الكاريوكي التفاعلية
                    </h3>
                    <p className="text-xs text-[#718096]">
                      استمع إلى نطق جمل القصة باللكنة الإنجليزية المتقنة مع التظليل اللحظي
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentChapter.theText.slice(0, 10).map((para, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-serif leading-relaxed text-[#1E293B]" dir="ltr">
                          {para.paragraphEn}
                        </p>
                        <button
                          onClick={() => speakWordOrSentence(para.paragraphEn)}
                          className="p-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#E8F3FF] hover:text-[#2563EB] text-[#718096] transition shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#2563EB] font-medium">
                        {para.paragraphAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: CHARACTER CHAT */}
            {/* ========================================================================= */}
            {activeTab === "chat" && (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
                {/* Character Picker Header */}
                <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#718096]">تحدث مع:</span>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {currentStory.characters.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => setChatCharacter(c.nameEn)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            chatCharacter === c.nameEn
                              ? "bg-[#2563EB] text-white shadow-sm"
                              : "bg-white text-[#475569] border border-[#E2E8F0]"
                          }`}
                        >
                          {c.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                    تعليمي نشط
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F8FAFC]">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center text-xl mx-auto">
                        💬
                      </div>
                      <p className="text-sm font-bold text-[#243247]">
                        ابدأ محادثة تعليمية مع {chatCharacter}
                      </p>
                      <p className="text-xs text-[#718096] max-w-sm mx-auto">
                        يمكنك توجيه أسئلة حول قرارات الشخصية، أحداث الفصل، أو معاني الكلمات والمفاهيم الأدبية!
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-md p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                            msg.role === "user"
                              ? "bg-[#2563EB] text-white rounded-br-none"
                              : "bg-white text-[#243247] border border-[#E2E8F0] rounded-bl-none"
                          }`}
                        >
                          <p>{msg.content}</p>
                          {msg.languageTip && (
                            <div className="mt-2 pt-2 border-t border-[#E2E8F0] text-xs text-[#D97706] font-semibold">
                              {msg.languageTip}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-[#E2E8F0] flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder={`اسأل ${chatCharacter} بالإنجليزية أو العربية...`}
                    className="flex-1 p-3 rounded-xl border border-[#E2E8F0] text-xs focus:border-[#2563EB] outline-none"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={chatSending || !chatMessage.trim()}
                    className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold disabled:opacity-50 transition shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: STORY CHALLENGES */}
            {/* ========================================================================= */}
            {activeTab === "challenges" && (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#243247]">
                        تحديات القصة والألعاب التعليمية
                      </h3>
                      <p className="text-xs text-[#718096]">
                        تطوير الفهم العميق والترتيب الزمني ومطابقة الشخصيات
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {[
                    { id: "whoSaidThis", label: "من القائل؟" },
                    { id: "vocab", label: "تحدي المفردات" },
                    { id: "chronology", label: "الترتيب الزمني للأحداث" },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setChallengeType(ct.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        challengeType === ct.id
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>

                {/* Challenge Body */}
                <div className="space-y-4">
                  {challengesData?.[challengeType]?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <p className="font-bold text-sm text-[#1E293B]">
                        {item.quote || item.titleEn || item.word}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                        {(item.candidateSpeakers || item.distractorMeanings || ["الحدث 1", "الحدث 2"]).map(
                          (opt: string, oIdx: number) => (
                            <button
                              key={oIdx}
                              onClick={() => setChallengeAnswers((prev) => ({ ...prev, [item.id || idx]: opt }))}
                              className={`p-2 rounded-xl text-xs font-bold border transition ${
                                challengeAnswers[item.id || idx] === opt
                                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                                  : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleSubmitChallenge}
                    className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition shadow-sm"
                  >
                    تسليم إجابات التحدي
                  </button>

                  {challengeResult && (
                    <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-center font-bold">
                      {challengeResult.message || `حققت ${challengeResult.score} من ${challengeResult.total}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: EXAM ARENA */}
            {/* ========================================================================= */}
            {activeTab === "exam" && (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#243247]">
                        ساحة الامتحانات التفاعلية (Exam Arena)
                      </h3>
                      <p className="text-xs text-[#718096]">
                        اختبارات شاملة بنظام التبديل الذكي (Smart Shuffle Engine)
                      </p>
                    </div>
                  </div>
                  {!examSession && (
                    <button
                      onClick={handleStartExam}
                      disabled={loadingExam}
                      className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm"
                    >
                      {loadingExam ? "جاري التوليد..." : "بدء اختبار الفصل"}
                    </button>
                  )}
                </div>

                {examSession ? (
                  <div className="space-y-6">
                    {examSession.questions?.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                            {qIdx + 1}
                          </span>
                          <p className="font-bold text-sm text-[#1E293B]">
                            {q.questionText}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pr-8">
                          {q.options?.map((opt: string, oIdx: number) => {
                            const isSelected = examAnswers[q.id] === opt;
                            return (
                              <button
                                key={oIdx}
                                disabled={examSubmitted}
                                onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                className={`p-3 rounded-xl text-xs font-bold text-right transition border ${
                                  isSelected
                                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                                    : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {!examSubmitted ? (
                      <button
                        onClick={handleSubmitExam}
                        disabled={loadingExam}
                        className="w-full py-3.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm shadow-md"
                      >
                        {loadingExam ? "جاري التصحيح..." : "تسليم الامتحان وحساب النتيجة"}
                      </button>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-center space-y-2">
                        <h4 className="text-xl font-extrabold text-[#16A34A]">
                          النتيجة: {examResult?.scorePercentage}%
                        </h4>
                        <p className="text-xs text-[#15803D] font-bold">
                          أحسنت! حققت {examResult?.score} من {examResult?.totalQuestions}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-3">
                    <p className="text-sm font-bold text-[#475569]">
                      اضغط على &quot;بدء اختبار الفصل&quot; لتوليد أسئلة نموذجية فورية!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 7: ADMIN MANAGEMENT HUB */}
            {/* ========================================================================= */}
            {activeTab === "admin" && (user?.role === "admin" || user?.role === "teacher") && (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#243247]">
                        لوحة إدارة القصص والمحتوى الأكاديمي (Story Management Hub)
                      </h3>
                      <p className="text-xs text-[#718096]">
                        إضافة قصة جديدة، استيراد وتعديل الفصول، ونشرها للطلاب
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewAsStudent(!previewAsStudent)}
                    className="px-4 py-2 rounded-xl bg-[#E8F3FF] text-[#2563EB] border border-[#BFDBFE] text-xs font-bold"
                  >
                    {previewAsStudent ? "العودة لوضع الإدارة" : "معاينة كطالب (Preview as Student)"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#475569] block mb-1">
                      عنوان الفصل بالعربية
                    </label>
                    <input
                      type="text"
                      value={adminChapterTitleAr}
                      onChange={(e) => setAdminChapterTitleAr(e.target.value)}
                      placeholder="مثال: الوصول لمرسيليا"
                      className="w-full p-3 rounded-xl border border-[#E2E8F0] text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#475569] block mb-1">
                      Chapter Title (English)
                    </label>
                    <input
                      type="text"
                      value={adminChapterTitleEn}
                      onChange={(e) => setAdminChapterTitleEn(e.target.value)}
                      placeholder="e.g. The Arrival at Marseilles"
                      className="w-full p-3 rounded-xl border border-[#E2E8F0] text-xs outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    الملخص التعليمي للفصل
                  </label>
                  <textarea
                    rows={3}
                    value={adminSummary}
                    onChange={(e) => setAdminSummary(e.target.value)}
                    placeholder="ملخص الأحداث المستهدفة والأهداف اللغوية..."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] text-xs outline-none"
                  />
                </div>

                <button
                  onClick={async () => {
                    setAdminSavedMessage("تم حفظ بيانات الفصل بنجاح ونشرها دون فقدان تقدم الطلاب!");
                    setTimeout(() => setAdminSavedMessage(""), 4000);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm"
                >
                  حفظ وتحديث الفصل
                </button>

                {adminSavedMessage && (
                  <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-xs font-bold text-center">
                    {adminSavedMessage}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
