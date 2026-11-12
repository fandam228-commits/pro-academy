"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Search,
  Star,
  Bookmark,
  Layers,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  RefreshCw,
  Mic,
  MicOff,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  HelpCircle,
  Clock,
  Play,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import completeDictionaryData from "@/data/translation-dictionary-complete.json";

export interface DictionaryEntry {
  id: string;
  word: string;
  meaningAr: string;
  pos: string;
  category: string;
  ipa?: string;
  exampleEn?: string;
  exampleAr?: string;
  synonyms?: string;
  antonyms?: string;
  related?: string;
  sourcePdf?: string;
  sourcePage?: number;
  lessonId?: string;
  audioStatus?: string;
}

const CATEGORIES = [
  "All",
  "Medicine",
  "Economics",
  "Politics",
  "Education",
  "Environment",
  "Technology",
  "Sciences",
  "Society",
  "Arts",
  "General",
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const SpeakingDictionaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [accent, setAccent] = useState<"US" | "UK">("US");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<"browse" | "flashcards" | "quiz">("browse");

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);

  // Pronunciation Practice state
  const [isListening, setIsListening] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{ wordId: string; transcript: string; score: number } | null>(null);

  // Load favorites and known words from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("pro_academy_dict_favs");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedKnown = localStorage.getItem("pro_academy_dict_known");
      if (savedKnown) setKnownWords(JSON.parse(savedKnown));
    } catch (e) {
      console.warn("Could not load stored dictionary state", e);
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("pro_academy_dict_favs", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const markKnown = (id: string, known: boolean) => {
    setKnownWords((prev) => {
      const updated = known ? [...new Set([...prev, id])] : prev.filter((item) => item !== id);
      try {
        localStorage.setItem("pro_academy_dict_known", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Text-To-Speech Pronunciation engine
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("خاصية النطق غير مدعومة في متصفحك الحالي.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent === "US" ? "en-US" : "en-GB";
    utterance.rate = playbackSpeed;
    window.speechSynthesis.speak(utterance);
  };

  // Pronunciation Test via Web Speech Recognition
  const startPronunciationTest = (targetWord: string, wordId: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("التعرف على الصوت يتطلب متصفحاً حديثاً مثل Google Chrome أو Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = accent === "US" ? "en-US" : "en-GB";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setPracticeResult(null);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        const targetClean = targetWord.trim().toLowerCase();

        // Calculate score
        let score = 0;
        if (transcript === targetClean) {
          score = 100;
        } else if (transcript.includes(targetClean) || targetClean.includes(transcript)) {
          score = 80;
        } else {
          score = 40;
        }

        setPracticeResult({ wordId, transcript, score });
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return (completeDictionaryData as DictionaryEntry[]).filter((entry) => {
      // Category filter
      if (selectedCategory !== "All" && entry.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Letter filter
      if (selectedLetter && !entry.word.toUpperCase().startsWith(selectedLetter)) {
        return false;
      }

      // Favorites filter
      if (favoritesOnly && !favorites.includes(entry.id)) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const matchesWord = entry.word.toLowerCase().includes(query);
        const matchesAr = entry.meaningAr.toLowerCase().includes(query);
        const matchesCategory = entry.category.toLowerCase().includes(query);
        const matchesExample = entry.exampleEn?.toLowerCase().includes(query) || false;
        if (!matchesWord && !matchesAr && !matchesCategory && !matchesExample) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, selectedCategory, selectedLetter, favoritesOnly, favorites]);

  // Flashcards navigation
  const currentCard = filteredEntries[flashcardIndex] || filteredEntries[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setPracticeResult(null);
    setFlashcardIndex((prev) => (prev + 1) % Math.max(1, filteredEntries.length));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setPracticeResult(null);
    setFlashcardIndex((prev) => (prev - 1 + filteredEntries.length) % Math.max(1, filteredEntries.length));
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-500/20 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>القاموس الناطق والمصطلحات التخصصية المعتمدة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Professional Speaking Dictionary
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              قاموس ترجمة متكامل مستخرج من المذكرات الأصلية لمستر حبيب الرحمن، مدعوم بالنطق الصوتي الأمريكي والبريطاني، النسخ الصوتي الدقيق IPA، وأمثلة الجمل السياقية، وبطاقات التكرار المتباعد.
            </p>
          </div>

          {/* VIEW SWITCHER TABS */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-purple-500/30 self-start md:self-center">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "browse"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>تصفح القاموس ({filteredEntries.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("flashcards");
                setFlashcardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "flashcards"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>بطاقات الاستذكار (Flashcards)</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUDIO SETTINGS BAR */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">إعدادات النطق الصوتي:</span>
          
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setAccent("US")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                accent === "US" ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🇺🇸 أمريكي (US)
            </button>
            <button
              onClick={() => setAccent("UK")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                accent === "UK" ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🇬🇧 بريطاني (UK)
            </button>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setPlaybackSpeed(1.0)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                playbackSpeed === 1.0 ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              1.0x عادي
            </button>
            <button
              onClick={() => setPlaybackSpeed(0.75)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                playbackSpeed === 0.75 ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              0.75x بطيء للتعلم
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              favoritesOnly
                ? "bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>المفضلة فقط ({favorites.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "browse" ? (
        <>
          {/* SEARCH & FILTERS */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالإنجليزية أو العربية (مثل: democracy, استصلاح, surgery, رخاء)..."
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 rtl:left-3.5 rtl:right-auto top-3 text-xs text-slate-400 hover:text-slate-200"
                >
                  مسح
                </button>
              )}
            </div>

            {/* CATEGORY CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat === "All" ? "الكل" : cat}
                </button>
              ))}
            </div>

            {/* ALPHABETICAL INDEX SCRUBBER */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[11px] font-mono">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-2 py-1 rounded-lg border font-bold transition-all ${
                  selectedLetter === null
                    ? "bg-slate-800 text-white border-purple-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                All
              </button>
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold border transition-all ${
                    selectedLetter === letter
                      ? "bg-purple-600 text-white border-purple-500"
                      : "text-slate-500 border-transparent hover:text-purple-400 hover:bg-purple-500/10"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* VOCABULARY CARDS GRID */}
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">لا توجد كلمات مطابقة لبحثك</h3>
              <p className="text-xs text-slate-500">جرب تعديل مصطلح البحث أو إزالة تصنيف التصفية.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map((entry) => {
                const isFav = favorites.includes(entry.id);
                const isWordPracticing = isListening && practiceResult?.wordId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="group rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-purple-900/30 hover:border-purple-500/50 p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-xl hover:shadow-purple-500/5"
                  >
                    <div className="space-y-3">
                      {/* TOP BADGES */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                            {entry.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            {entry.pos}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(entry.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                            title="إضافة للمفضلة"
                          >
                            <Star className={`w-4 h-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* MAIN WORD & IPA */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            {entry.word}
                          </h3>
                          <button
                            onClick={() => speakText(entry.word)}
                            className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white transition-all shadow-sm cursor-pointer"
                            title="استمع للنطق"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        {entry.ipa && (
                          <p className="text-xs font-mono text-purple-600 dark:text-purple-300 font-bold mt-0.5">
                            {entry.ipa}
                          </p>
                        )}
                      </div>

                      {/* ARABIC MEANING */}
                      <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-800">
                        <p className="text-sm font-black text-slate-800 dark:text-amber-300 text-right">
                          {entry.meaningAr}
                        </p>
                      </div>

                      {/* EXAMPLE SENTENCE */}
                      {entry.exampleEn && (
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                              &ldquo;{entry.exampleEn}&rdquo;
                            </p>
                            <button
                              onClick={() => speakText(entry.exampleEn!)}
                              className="text-slate-400 hover:text-purple-400 p-1 shrink-0"
                              title="استمع للمثال كاملاً"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          </div>
                          {entry.exampleAr && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                              {entry.exampleAr}
                            </p>
                          )}
                        </div>
                      )}

                      {/* SYNONYMS / ANTONYMS */}
                      {(entry.synonyms || entry.antonyms) && (
                        <div className="text-[10px] space-y-1 text-slate-500 pt-1">
                          {entry.synonyms && (
                            <div>
                              <span className="font-bold text-slate-400">مرادفات: </span>
                              <span className="text-slate-600 dark:text-slate-300">{entry.synonyms}</span>
                            </div>
                          )}
                          {entry.antonyms && (
                            <div>
                              <span className="font-bold text-slate-400">تضاد: </span>
                              <span className="text-red-400">{entry.antonyms}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* FOOTER: SOURCE & PRACTICE */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-purple-600/80 dark:text-purple-300/80 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/40">
                        {entry.sourcePdf} • ص {entry.sourcePage}
                      </span>

                      <button
                        onClick={() => startPronunciationTest(entry.word, entry.id)}
                        disabled={isListening}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <Mic className="w-3 h-3" />
                        <span>اختبر نطقك</span>
                      </button>
                    </div>

                    {/* LIVE PRONUNCIATION TEST FEEDBACK */}
                    {practiceResult?.wordId === entry.id && (
                      <div className="mt-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">نطقت: &ldquo;{practiceResult.transcript}&rdquo;</span>
                          <span
                            className={`font-black ${
                              practiceResult.score >= 80 ? "text-emerald-500" : "text-amber-400"
                            }`}
                          >
                            {practiceResult.score}% دقة النطق
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* FLASHCARDS INTERACTIVE MODE */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>
              البطاقة {flashcardIndex + 1} من {filteredEntries.length}
            </span>
            <span className="text-purple-400 font-mono">
              المتقنة: {knownWords.length} / {completeDictionaryData.length}
            </span>
          </div>

          {currentCard && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[320px] rounded-3xl p-8 bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 border-2 border-purple-500/30 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-purple-500 transition-all select-none group"
            >
              {/* TOP FLIP BADGE */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  {currentCard.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-purple-400">
                  <RotateCw className="w-3 h-3" />
                  <span>انقر للقلب</span>
                </span>
              </div>

              {/* CENTER CARD CONTENT */}
              {!isFlipped ? (
                <div className="text-center space-y-3 py-6">
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentCard.word}
                  </p>
                  {currentCard.ipa && (
                    <p className="text-sm font-mono text-purple-600 dark:text-purple-300 font-bold">
                      {currentCard.ipa}
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentCard.word);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700 transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>استمع للنطق</span>
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
                  <p className="text-2xl font-black text-amber-500 dark:text-amber-300">
                    {currentCard.meaningAr}
                  </p>
                  {currentCard.exampleEn && (
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right space-y-1">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 italic">
                        &ldquo;{currentCard.exampleEn}&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {currentCard.exampleAr}
                      </p>
                    </div>
                  )}
                  {currentCard.synonyms && (
                    <p className="text-xs text-slate-400">
                      <span className="font-bold">مرادفات:</span> {currentCard.synonyms}
                    </p>
                  )}
                </div>
              )}

              {/* CARD FOOTER */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                <span>{currentCard.sourcePdf} • ص {currentCard.sourcePage}</span>
                <span>{isFlipped ? "المعنى والسياق" : "الكلمة بالإنجليزية"}</span>
              </div>
            </div>
          )}

          {/* FLASHCARD ACTION CONTROLS */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevCard}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentCard) markKnown(currentCard.id, false);
                  handleNextCard();
                }}
                className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
              >
                تحتاج مراجعة 🔁
              </button>
              <button
                onClick={() => {
                  if (currentCard) markKnown(currentCard.id, true);
                  handleNextCard();
                }}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>أتقنتها!</span>
              </button>
            </div>

            <button
              onClick={handleNextCard}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
