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
} from "lucide-react";

interface StoryWorldProps {
  user?: any;
  onNavigateHome?: () => void;
}

export function StoryWorldWorkspace({ user, onNavigateHome }: StoryWorldProps) {
  const [stories, setStories] = useState<any[]>([]);
  const [selectedGradeIdx, setSelectedGradeIdx] = useState(3); // default to 1st Sec
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "book" | "cinema" | "listen" | "chat" | "challenges" | "exam" | "badges" | "admin"
  >("book");

  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<any>(null);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Reader Settings
  const [readingMode, setReadingMode] = useState<"light" | "sepia" | "dark">("light");
  const [fontSize, setFontSize] = useState<number>(18);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showSentenceTranslation, setShowSentenceTranslation] = useState<boolean>(true);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [wordSaveSuccess, setWordSaveSuccess] = useState(false);

  // Cinema & Audio Narration
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeKaraokeSentenceIdx, setActiveKaraokeSentenceIdx] = useState<number>(0);

  // Character Chat
  const [chatCharacter, setChatCharacter] = useState<string>("Santiago");
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
  const [newBadgeAlert, setNewBadgeAlert] = useState<any>(null);

  // Admin Hub Form
  const [adminChapterTitleAr, setAdminChapterTitleAr] = useState("");
  const [adminChapterTitleEn, setAdminChapterTitleEn] = useState("");
  const [adminSummary, setAdminSummary] = useState("");
  const [adminSavedMessage, setAdminSavedMessage] = useState("");

  // Load Stories & User Progress
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const res = await fetch("/api/story-world/stories");
        const json = await res.json();
        if (json.success && Array.isArray(json.stories)) {
          setStories(json.stories);
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

  const currentGradeEntry = stories[selectedGradeIdx] || null;
  const currentGrade = currentGradeEntry?.grade || null;
  const currentChapters = currentGradeEntry?.chapters || [];
  const activeChapterHeader = currentChapters[selectedChapterIdx] || null;

  // Load specific chapter details
  useEffect(() => {
    if (!activeChapterHeader?.id) return;
    async function fetchChapter() {
      try {
        setLoadingChapter(true);
        const res = await fetch(`/api/story-world/chapter/${activeChapterHeader.id}`);
        const json = await res.json();
        if (json.success) {
          setChapterData(json);
          setCurrentPage(json.studentProgress?.lastPage || 1);
          // Set initial character for chat
          if (Array.isArray(json.chapter?.characters) && json.chapter.characters.length > 0) {
            setChatCharacter(json.chapter.characters[0].name);
          }
        }
      } catch (err) {
        console.error("Error loading chapter data:", err);
      } finally {
        setLoadingChapter(false);
      }
    }
    fetchChapter();
  }, [activeChapterHeader?.id]);

  // Load challenges when challenges tab is active
  useEffect(() => {
    if (activeTab === "challenges" && activeChapterHeader?.id) {
      async function loadChallenges() {
        try {
          const res = await fetch(`/api/story-world/challenges?chapterId=${activeChapterHeader.id}`);
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
  }, [activeTab, activeChapterHeader?.id]);

  // Handle Speech Pronunciation
  const speakWordOrSentence = (text: string, rate: number = 1.0) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play narration audio / speech
  const togglePlayNarration = () => {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      const activeScene = chapterData?.scenes?.[activeSceneIdx];
      const textToSpeak = activeScene?.narrationEn || activeChapterHeader?.explanation || "Educational narrative reading.";
      speakWordOrSentence(textToSpeak, playbackSpeed);
      setIsPlayingAudio(true);

      // Track Listening Progress
      if (user && activeChapterHeader?.id) {
        fetch("/api/story-world/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gradeId: currentGrade?.id,
            chapterId: activeChapterHeader.id,
            listeningProgress: 100,
          }),
        }).then(async (res) => {
          const json = await res.json();
          if (json.newBadges?.length > 0) {
            setNewBadgeAlert(json.newBadges[0]);
            setUserBadges((prev) => [...prev, ...json.newBadges]);
          }
        });
      }
    }
  };

  // Save Word to Vocabulary Notebook
  const handleSaveWordToVocabulary = async (wordObj: any) => {
    if (!wordObj) return;
    try {
      const res = await fetch("/api/story-world/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: currentGrade?.id,
          chapterId: activeChapterHeader?.id,
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

  // Handle Character Chat
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || chatSending) return;
    const msg = chatMessage.trim();
    setChatMessage("");
    setChatSending(true);

    // Optimistic user bubble
    const userMsg = { role: "user", content: msg, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/story-world/character-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: currentGrade?.id,
          chapterId: activeChapterHeader?.id,
          characterName: chatCharacter,
          message: msg,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const charMsg = {
          role: "character",
          content: json.reply,
          languageTip: json.languageTip,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, charMsg]);
        if (json.badgeEarned) {
          setNewBadgeAlert({
            badgeNameAr: "خبير الشخصيات الأدبية",
            badgeIcon: "🎭",
            badgeCode: "character_expert",
          });
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "character",
            content: json.error || "Unable to reply at the moment.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setChatSending(false);
    }
  };

  // Start Exam Arena
  const handleStartExam = async () => {
    try {
      setLoadingExam(true);
      setExamSubmitted(false);
      setExamResult(null);
      setExamAnswers({});
      const res = await fetch(`/api/story-world/exams?chapterId=${activeChapterHeader?.id}`);
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

  // Submit Exam Arena
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
        if (json.badgeEarned) {
          setNewBadgeAlert({
            badgeNameAr: "بطل القصة الاستثنائي",
            badgeIcon: "👑",
            badgeCode: "story_champion",
          });
        }
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
    } finally {
      setLoadingExam(false);
    }
  };

  // Submit Challenges
  const handleSubmitChallenge = async () => {
    if (!activeChapterHeader?.id) return;
    try {
      const res = await fetch("/api/story-world/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: activeChapterHeader.id,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition flex items-center gap-1.5"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            <span>الرئيسية</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                عالم القصص الاحترافي | Professional Story World
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              روايات ومناهج اللغة الإنجليزية المعتمدة – مستر حبيب الرحمن 2026/2027
            </p>
          </div>
        </div>

        {/* Badges Quick Counter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("badges")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{userBadges.length} أوسمة مكتسبة</span>
          </button>
        </div>
      </header>

      {/* New Badge Unlock Toast Alert */}
      {newBadgeAlert && (
        <div className="bg-gradient-to-r from-amber-600 to-indigo-600 text-white px-4 py-2.5 flex items-center justify-between text-sm shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{newBadgeAlert.badgeIcon}</span>
            <div>
              <span className="font-bold">تهانينا! لقد حصلت على وسام جديد: </span>
              <span className="underline font-semibold">{newBadgeAlert.badgeNameAr}</span>
            </div>
          </div>
          <button
            onClick={() => setNewBadgeAlert(null)}
            className="text-xs bg-black/30 hover:bg-black/50 px-2 py-1 rounded"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Grade Selector Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {stories.map((s, idx) => (
            <button
              key={s.grade.id}
              onClick={() => {
                setSelectedGradeIdx(idx);
                setSelectedChapterIdx(0);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedGradeIdx === idx
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{s.grade.titleAr}</span>
              <span className="text-[10px] opacity-75">({s.completedCount}/{s.totalChapters})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Story Banner */}
      {currentGrade && (
        <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/40 to-slate-950 border-b border-slate-800/80 px-4 py-4 md:py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentGrade.titleAr}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  المؤلف: {currentGrade.storyAuthor || "الأدب العالمي"}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {currentGrade.storyTitleAr} ({currentGrade.storyTitleEn})
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-2">
                {currentGrade.storyDescriptionAr || currentGrade.descriptionAr}
              </p>
            </div>

            {/* Chapters Navigation Pills */}
            <div className="w-full md:w-auto">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">فصول الرواية المقررة:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentChapters.map((ch: any, idx: number) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapterIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedChapterIdx === idx
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span>فصل {ch.chapterNumber}</span>
                    {ch.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Tabs Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 sticky top-[57px] z-30 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 min-w-max">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("book")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "book" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>القارئ التفاعلي</span>
            </button>

            <button
              onClick={() => setActiveTab("cinema")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "cinema" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>سينما القصة</span>
            </button>

            <button
              onClick={() => setActiveTab("listen")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "listen" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>استمع واقرأ (الكاريوكي)</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>تحدث مع الشخصيات</span>
            </button>

            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "challenges" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>تحديات القصة (5)</span>
            </button>

            <button
              onClick={() => setActiveTab("exam")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "exam" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>ساحة الامتحانات</span>
            </button>

            <button
              onClick={() => setActiveTab("badges")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "badges" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>الأوسمة والإنجازات</span>
            </button>

            {(user?.role === "admin" || user?.role === "teacher") && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "admin" ? "bg-amber-600 text-white" : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>إدارة القصص</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {loading || loadingChapter ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">جاري تجهيز محتوى القصة التفاعلي...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: INTERACTIVE STORY BOOK */}
            {activeTab === "book" && (
              <div className="space-y-4">
                {/* Book Controls Toolbar */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">نمط القراءة:</span>
                    <button
                      onClick={() => setReadingMode("light")}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                        readingMode === "light"
                          ? "bg-slate-100 text-slate-900 border-slate-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>فاتح</span>
                    </button>
                    <button
                      onClick={() => setReadingMode("sepia")}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                        readingMode === "sepia"
                          ? "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>دافئ</span>
                    </button>
                    <button
                      onClick={() => setReadingMode("dark")}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                        readingMode === "dark"
                          ? "bg-slate-950 text-slate-100 border-indigo-500 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>ليلي</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">حجم الخط:</span>
                    <button
                      onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="تصغير الخط"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-indigo-400 min-w-6 text-center">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize((f) => Math.min(28, f + 2))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="تكبير الخط"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSentenceTranslation(!showSentenceTranslation)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        showSentenceTranslation
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {showSentenceTranslation ? "إخفاء الترجمة الفورية" : "إظهار الترجمة الفورية"}
                    </button>
                  </div>
                </div>

                {/* Reader Paper Sheet */}
                <div
                  className={`rounded-2xl border p-6 md:p-10 transition-colors shadow-2xl relative ${
                    readingMode === "light"
                      ? "bg-white text-slate-900 border-slate-200"
                      : readingMode === "sepia"
                      ? "bg-[#FAF0E6] text-[#2C221E] border-[#E8D8C8]"
                      : "bg-slate-900 text-slate-100 border-slate-800"
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="border-b pb-4 mb-6 flex items-center justify-between opacity-75 text-xs">
                    <span>
                      {currentGrade?.storyTitleEn} – الفصل {activeChapterHeader?.chapterNumber}: {activeChapterHeader?.titleEn}
                    </span>
                    <span>صفحة {currentPage}</span>
                  </div>

                  {/* Chapter Content & Guided Paragraphs */}
                  <div className="space-y-6 leading-relaxed">
                    <h3 className="text-xl md:text-2xl font-bold font-serif mb-4">
                      {activeChapterHeader?.titleEn} ({activeChapterHeader?.titleAr})
                    </h3>

                    {/* Educational Narrative Paragraph */}
                    <div className="p-4 rounded-xl border border-dashed border-slate-500/30 space-y-2">
                      <p className="font-serif">
                        {activeChapterHeader?.explanation ||
                          "In this opening chapter, students explore the fundamental moral decisions and linguistic structures set forth in the curriculum."}
                      </p>
                      {showSentenceTranslation && (
                        <p className="text-sm opacity-80 pt-2 border-t border-slate-500/20 text-indigo-700 dark:text-indigo-300">
                          {activeChapterHeader?.explanation
                            ? "ملخص الفصل الدراسي والأهداف التربوية واللغوية المقررة."
                            : "يستعرض هذا الفصل أهم الأحداث والمفردات المستهدفة في منهج اللغة الإنجليزية."}
                        </p>
                      )}
                    </div>

                    {/* Interactive Vocabulary Pills in Context */}
                    {Array.isArray(chapterData?.chapter?.vocabulary) && (
                      <div className="mt-6 pt-6 border-t border-slate-500/20">
                        <h4 className="text-sm font-bold opacity-80 mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>المفردات المستهدفة في الفصل (اضغط على أي كلمة للاستماع والترجمة):</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {chapterData.chapter.vocabulary.map((vocab: any, vIdx: number) => (
                            <button
                              key={vIdx}
                              onClick={() => {
                                setSelectedWord(vocab);
                                speakWordOrSentence(vocab.word);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 transition flex items-center gap-1.5"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{vocab.word}</span>
                              <span className="opacity-70 text-[10px]">({vocab.meaningAr})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Word Popover */}
                  {selectedWord && (
                    <div className="mt-6 p-4 rounded-xl bg-slate-950 text-white border border-indigo-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-amber-400">{selectedWord.word}</span>
                          <span className="text-xs text-slate-400">[{selectedWord.ipa || "IPA"}]</span>
                          <button
                            onClick={() => speakWordOrSentence(selectedWord.word)}
                            className="p-1 rounded bg-indigo-600 hover:bg-indigo-500"
                            title="استمع للنطق"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium">المعنى: {selectedWord.meaningAr}</p>
                        {selectedWord.definitionEn && (
                          <p className="text-xs text-slate-300">Definition: {selectedWord.definitionEn}</p>
                        )}
                        {selectedWord.example && (
                          <p className="text-xs text-slate-400 italic">Example: "{selectedWord.example}"</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleSaveWordToVocabulary(selectedWord)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          wordSaveSuccess ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{wordSaveSuccess ? "تم الحفظ بمفرداتي!" : "حفظ في قاموسي"}</span>
                      </button>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-500/20 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                      <span>الصفحة السابقة</span>
                    </button>

                    <span className="text-xs font-semibold opacity-75">الصفحة {currentPage}</span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>الصفحة التالية</span>
                      <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STORY CINEMA & VISUAL STORYBOARD */}
            {activeTab === "cinema" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Visual Scene Canvas */}
                  <div className="relative aspect-video bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-center">
                    <div className="space-y-3 max-w-xl z-10">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-400 mx-auto flex items-center justify-center text-3xl shadow-lg">
                        🎭
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                        {chapterData?.scenes?.[activeSceneIdx]?.characterName || "راوي القصة"}
                      </span>
                      <h3 className="text-lg md:text-2xl font-bold text-white">
                        {chapterData?.scenes?.[activeSceneIdx]?.titleAr || "المشهد المسرحي التفاعلي"}
                      </h3>
                      <p className="text-sm md:text-base text-slate-200 font-serif leading-relaxed">
                        "{chapterData?.scenes?.[activeSceneIdx]?.narrationEn}"
                      </p>
                      <p className="text-xs md:text-sm text-indigo-300">
                        {chapterData?.scenes?.[activeSceneIdx]?.narrationAr}
                      </p>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 bg-black/60 backdrop-blur px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlayNarration}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5"
                        >
                          {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlayingAudio ? "إيقاف مؤقت" : "تشغيل الراوي الصوتي"}</span>
                        </button>
                        <button
                          onClick={() => {
                            const speeds = [0.75, 1.0, 1.25, 1.5];
                            const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                            setPlaybackSpeed(next);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-semibold"
                        >
                          {playbackSpeed}x
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>
                          المشهد {activeSceneIdx + 1} من {chapterData?.scenes?.length || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scene Thumbnails Bar */}
                  <div className="p-4 bg-slate-950 flex items-center gap-3 overflow-x-auto">
                    {chapterData?.scenes?.map((sc: any, idx: number) => (
                      <button
                        key={sc.id || idx}
                        onClick={() => {
                          setActiveSceneIdx(idx);
                          setIsPlayingAudio(false);
                          if (typeof window !== "undefined" && "speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition text-right min-w-[200px] border ${
                          activeSceneIdx === idx
                            ? "bg-indigo-600/20 text-indigo-200 border-indigo-500"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        <div className="text-[10px] text-amber-400">مشهد {idx + 1}</div>
                        <div className="font-semibold truncate">{sc.titleAr || `مشهد ${idx + 1}`}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LISTEN & READ (KARAOKE) */}
            {activeTab === "listen" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Headphones className="w-5 h-5 text-indigo-400" />
                        <span>الاستماع والقراءة المتزامنة (Synchronized Karaoke)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        استمع إلى النطق البريطاني والأمريكي المعياري مع تظليل متزامن لكل جملة
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayNarration}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlayingAudio ? "إيقاف الاستماع" : "بدء الاستماع المتزامن"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Karaoke Sentences Stream */}
                  <div className="space-y-4">
                    {chapterData?.scenes?.[activeSceneIdx]?.karaokeTokens?.map((tok: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        onClick={() => {
                          setActiveKaraokeSentenceIdx(sIdx);
                          speakWordOrSentence(tok.text, playbackSpeed);
                        }}
                        className={`p-4 rounded-xl cursor-pointer transition border ${
                          activeKaraokeSentenceIdx === sIdx
                            ? "bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base font-serif font-medium">{tok.text}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWordOrSentence(tok.text, 0.8);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300"
                            title="تكرار الجملة ببطء"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )) || (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        الجمل الصوتية جاهزة للاستماع من المشهد الحالي.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TALK TO CHARACTERS */}
            {activeTab === "chat" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
                {/* Character Picker Header */}
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-xl">
                      🎭
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{chatCharacter}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          شخصية الرواية الرسمية
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        حوار بالإنجليزية الفصحى وفق أحداث الرواية + إرشادات مستر حبيب اللغوية
                      </p>
                    </div>
                  </div>

                  {/* Character Selector Dropdown */}
                  {Array.isArray(chapterData?.chapter?.characters) && (
                    <select
                      value={chatCharacter}
                      onChange={(e) => {
                        setChatCharacter(e.target.value);
                        setChatHistory([]);
                      }}
                      className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      {chapterData.chapter.characters.map((c: any, idx: number) => (
                        <option key={idx} value={c.name}>
                          {c.name} ({c.role || "شخصية"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center text-2xl">
                        💬
                      </div>
                      <h4 className="text-sm font-bold text-slate-300">
                        ابدأ محادثتك باللغة الإنجليزية مع {chatCharacter}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        اسأل عن دوافع الشخصية، قراراتها في الفصل، أو ناقش معها الدروس المستفادة.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        <button
                          onClick={() => setChatMessage("Why did you decide to continue your journey despite all perils?")}
                          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        >
                          "Why did you decide to continue your journey?"
                        </button>
                        <button
                          onClick={() => setChatMessage("What is the most important lesson you learned from the sea?")}
                          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        >
                          "What is the most important lesson you learned?"
                        </button>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700"
                          }`}
                        >
                          <p>{msg.content}</p>

                          {/* Mr Habib's Language Tip */}
                          {msg.languageTip && (
                            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-xs text-amber-300 font-medium">
                              {msg.languageTip}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder={`اكتب رسالتك بالإنجليزية إلى ${chatCharacter}...`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={!chatMessage.trim() || chatSending}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <span>إرسال</span>
                    <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: STORY CHALLENGES */}
            {activeTab === "challenges" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                  {/* Challenge Mode Selector */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
                    <button
                      onClick={() => setChallengeType("whoSaidThis")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        challengeType === "whoSaidThis"
                          ? "bg-amber-500 text-slate-950 font-extrabold"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      من القائل؟ (Who Said This?)
                    </button>
                    <button
                      onClick={() => setChallengeType("vocab")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        challengeType === "vocab"
                          ? "bg-amber-500 text-slate-950 font-extrabold"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      تحدي المفردات بالسياق (Vocab Challenge)
                    </button>
                    <button
                      onClick={() => setChallengeType("chronology")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        challengeType === "chronology"
                          ? "bg-amber-500 text-slate-950 font-extrabold"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ترتيب الأحداث زمنياً (Chronology)
                    </button>
                  </div>

                  {/* WHO SAID THIS CHALLENGE */}
                  {challengeType === "whoSaidThis" && (
                    <div className="space-y-6">
                      {challengesData?.whoSaidThis?.map((qc: any, qIdx: number) => (
                        <div key={qc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                            <span>اقتباس #{qIdx + 1}</span>
                            {qc.situation && <span className="text-slate-400 font-normal">({qc.situation})</span>}
                          </div>
                          <p className="text-sm font-serif italic text-white">"{qc.quote}"</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                            {qc.candidateSpeakers?.map((speaker: string, sIdx: number) => (
                              <button
                                key={sIdx}
                                onClick={() =>
                                  setChallengeAnswers((prev) => ({ ...prev, [qc.id]: speaker }))
                                }
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                                  challengeAnswers[qc.id] === speaker
                                    ? "bg-indigo-600 text-white border-indigo-500"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                {speaker}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VOCAB CHALLENGE */}
                  {challengeType === "vocab" && (
                    <div className="space-y-6">
                      {challengesData?.vocab?.map((vc: any, vIdx: number) => (
                        <div key={vc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-indigo-400">{vc.word}</span>
                            <span className="text-xs text-slate-400">سؤال #{vIdx + 1}</span>
                          </div>
                          {vc.example && <p className="text-xs text-slate-300 italic">"{vc.example}"</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {vc.distractorMeanings?.map((meaning: string, mIdx: number) => (
                              <button
                                key={mIdx}
                                onClick={() =>
                                  setChallengeAnswers((prev) => ({ ...prev, [vc.id]: meaning }))
                                }
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition text-right ${
                                  challengeAnswers[vc.id] === meaning
                                    ? "bg-indigo-600 text-white border-indigo-500"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                {meaning}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CHRONOLOGY CHALLENGE */}
                  {challengeType === "chronology" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">الأحداث التالية غير مرتبة. رتب تسلسل الأحداث منطقياً:</p>
                      {challengesData?.chronology?.map((ev: any, eIdx: number) => (
                        <div key={ev.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <span className="font-bold text-amber-400">الحدث: {ev.titleAr}</span>
                          <p className="text-slate-300">{ev.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Challenge Result Card */}
                  {challengeResult && (
                    <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-center space-y-2">
                      <div className="text-2xl">🎉</div>
                      <h4 className="font-bold">أحسنت! نتيجتك في التحدي: {challengeResult.percentage}%</h4>
                      <p className="text-xs">حصلت على +{challengeResult.pointsEarned} نقطة مكافأة تمت إضافتها لرصيدك!</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleSubmitChallenge}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                    >
                      تقييم الإجابات ورصد النقاط
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: STORY EXAM ARENA */}
            {activeTab === "exam" && (
              <div className="space-y-6">
                {!examSession ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center text-3xl">
                      📝
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      امتحان الفهم القرائي والتحليل الأدبي – الفصل {activeChapterHeader?.chapterNumber}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      امتحان إلكتروني معياري بـ 4 اختيارات ونظام التبديل الذكي (Smart Shuffle Engine). لا توجد أسئلة مسربة أو نماذج إجابة مكشوفة.
                    </p>
                    <button
                      onClick={handleStartExam}
                      disabled={loadingExam}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
                    >
                      {loadingExam ? "جاري التجهيز..." : "بدء الامتحان الآن"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          امتحان {activeChapterHeader?.titleEn} (عدد الأسئلة: {examSession.totalQuestions})
                        </h4>
                        <span className="text-xs text-emerald-400">حماية التبديل الذكي مفعلة</span>
                      </div>
                      {!examSubmitted && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                          <Clock className="w-4 h-4" />
                          <span>امتحان محدد بزمن</span>
                        </div>
                      )}
                    </div>

                    {/* Questions Stream */}
                    <div className="space-y-6">
                      {examSession.questions?.map((q: any, idx: number) => {
                        const gradedInfo = examResult?.detailedResults?.find(
                          (r: any) => r.questionId === q.id
                        );

                        return (
                          <div
                            key={q.id}
                            className={`p-5 rounded-xl border space-y-3 ${
                              examSubmitted
                                ? gradedInfo?.isCorrect
                                  ? "bg-emerald-950/20 border-emerald-500/40"
                                  : "bg-rose-950/20 border-rose-500/40"
                                : "bg-slate-950 border-slate-800"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-indigo-400">السؤال #{idx + 1}</span>
                              {examSubmitted && (
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    gradedInfo?.isCorrect
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-rose-500/20 text-rose-400"
                                  }`}
                                >
                                  {gradedInfo?.isCorrect ? "إجابة صحيحة ✓" : "إجابة خاطئة ✗"}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-semibold text-slate-100">{q.questionText}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {q.options?.map((opt: any) => (
                                <button
                                  key={opt.label}
                                  disabled={examSubmitted}
                                  onClick={() =>
                                    setExamAnswers((prev) => ({ ...prev, [q.id]: opt.label }))
                                  }
                                  className={`p-3 rounded-xl text-xs font-medium border text-right transition flex items-center gap-2 ${
                                    examAnswers[q.id] === opt.label
                                      ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                                    {opt.label}
                                  </span>
                                  <span>{opt.text}</span>
                                </button>
                              ))}
                            </div>

                            {examSubmitted && gradedInfo?.explanation && (
                              <div className="mt-3 p-3 rounded-lg bg-slate-900 text-xs text-slate-300 border border-slate-800">
                                <span className="font-bold text-indigo-400">التفسير التربوي: </span>
                                {gradedInfo.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Result Banner */}
                    {examResult && (
                      <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/40 text-center space-y-2">
                        <div className="text-3xl">{examResult.passed ? "🏆" : "💪"}</div>
                        <h4 className="text-lg font-bold text-white">
                          النتيجة النهائية: {examResult.score} من {examResult.totalScore} ({examResult.percentage}%)
                        </h4>
                        <p className={`text-xs font-semibold ${examResult.passed ? "text-emerald-400" : "text-amber-400"}`}>
                          {examResult.passed ? "ناجح – أحسنت التحضير الأدبي واللغوي!" : "تحتاج لمراجعة الفصل مرة أخرى لتحقيق نسبة 60%"}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                      {!examSubmitted ? (
                        <button
                          onClick={handleSubmitExam}
                          disabled={loadingExam}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
                        >
                          {loadingExam ? "جاري التصحيح..." : "تسليم الإجابات والتصحيح الفوري"}
                        </button>
                      ) : (
                        <button
                          onClick={handleStartExam}
                          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                        >
                          إعادة الاختبار بنموذج مبدل جديد
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: MY STORY PROGRESS & BADGES */}
            {activeTab === "badges" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>أوسمة وإنجازات عالم القصص</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      احصل على الأوسمة الخمسة بإتمام القراءة والاستماع والمحادثة واجتياز الامتحانات
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { code: "story_explorer", nameAr: "مستكشف القصص", desc: "قراءة واستكشاف أول فصل بالرواية", icon: "🗺️" },
                      { code: "master_reader", nameAr: "القارئ المتميز", desc: "إتمام قراءة 5 فصول دراسية كاملة", icon: "📚" },
                      { code: "listening_hero", nameAr: "بطل الاستماع الأدبي", desc: "إتمام الاستماع الصوتي للفصل كاملاً", icon: "🎧" },
                      { code: "character_expert", nameAr: "خبير الشخصيات", desc: "التحدث مع 3 شخصيات أدبية مختلفة", icon: "🎭" },
                      { code: "story_champion", nameAr: "بطل القصة الاستثنائي", desc: "الحصول على 85%+ في الامتحان النهائي", icon: "👑" },
                    ].map((badge) => {
                      const isEarned = userBadges.some((b) => b.badgeCode === badge.code);

                      return (
                        <div
                          key={badge.code}
                          className={`p-5 rounded-2xl border transition relative flex items-start gap-4 ${
                            isEarned
                              ? "bg-indigo-950/40 border-amber-500/50 text-white shadow-lg shadow-amber-500/10"
                              : "bg-slate-950 border-slate-800/80 text-slate-400 opacity-60"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                            {badge.icon}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-white">{badge.nameAr}</h4>
                              {isEarned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <p className="text-xs text-slate-400">{badge.desc}</p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                isEarned
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {isEarned ? "وسام مكتسب ✓" : "مغلق حالياً"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: ADMIN STORY HUB */}
            {activeTab === "admin" && (user?.role === "admin" || user?.role === "teacher") && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-400" />
                      <span>لوحة المعلم والمسؤول: إدارة فصول ومشاهد القصة</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      إضافة وتعديل محتوى الفصول والمشاهد السينمائية والأسئلة لـ {currentGrade?.storyTitleAr}
                    </p>
                  </div>

                  {adminSavedMessage && (
                    <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-bold">
                      {adminSavedMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        عنوان الفصل بالعربية:
                      </label>
                      <input
                        type="text"
                        value={adminChapterTitleAr}
                        onChange={(e) => setAdminChapterTitleAr(e.target.value)}
                        placeholder="مثال: الفصل الأول - الاستعداد للرحلة"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        عنوان الفصل بالإنجليزية:
                      </label>
                      <input
                        type="text"
                        value={adminChapterTitleEn}
                        onChange={(e) => setAdminChapterTitleEn(e.target.value)}
                        placeholder="e.g. Chapter 1: The Departure"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        الملخص والشرح التعليمي:
                      </label>
                      <textarea
                        rows={4}
                        value={adminSummary}
                        onChange={(e) => setAdminSummary(e.target.value)}
                        placeholder="اكتب الملخص والتحليل الأدبي للفصل..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/story-world/admin", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "save_chapter",
                              gradeId: currentGrade?.id,
                              chapterNumber: (currentChapters.length || 0) + 1,
                              titleAr: adminChapterTitleAr || "فصل جديد",
                              titleEn: adminChapterTitleEn || "New Chapter",
                              explanation: adminSummary || "ملخص تعليمي.",
                            }),
                          });
                          const json = await res.json();
                          if (json.success) {
                            setAdminSavedMessage("تم حفظ الفصل بنجاح!");
                            setTimeout(() => setAdminSavedMessage(""), 4000);
                          }
                        } catch (err) {
                          console.error("Admin save error:", err);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      حفظ وتحديث محتوى الفصل
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
