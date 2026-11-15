"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bookmark,
  Search,
  Volume2,
  Trash2,
  X,
  Mic,
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import { pronunciationManager, PronunciationAccent } from "@/lib/pronunciation-assistant";
import { lookupDictionaryWord, WordDetail } from "@/lib/dictionary-service";

interface MyVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPractice?: (word: WordDetail) => void;
}

export const MyVocabularyModal: React.FC<MyVocabularyModalProps> = ({
  isOpen,
  onClose,
  onOpenPractice,
}) => {
  const { lang, user } = useApp();

  const [savedWords, setSavedWords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [accent, setAccent] = useState<PronunciationAccent>("uk");

  const fetchSavedWords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const url = new URL("/api/student/vocabulary", window.location.origin);
      if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());
      if (selectedUnit !== "all") url.searchParams.set("unitId", selectedUnit);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setSavedWords(data.savedWords || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSavedWords();
    } else {
      pronunciationManager.stop();
    }
  }, [isOpen, searchQuery, selectedUnit]);

  const handleDelete = async (id: string, word: string) => {
    if (
      !confirm(
        lang === "ar"
          ? `هل أنت متأكد من حذف كلمة "${word}" من قائمة مفرداتك؟`
          : `Remove "${word}" from your vocabulary?`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/student/vocabulary?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSavedWords((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSpeak = (word: string) => {
    pronunciationManager.speak(word, {
      accent,
      speed: "normal",
    });
  };

  // Derive unique unit IDs from saved words for filtering
  const availableUnits = Array.from(
    new Set(savedWords.map((w) => w.unitId).filter(Boolean))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-vocab-title"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            pronunciationManager.stop();
            onClose();
          }}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          aria-label={lang === "ar" ? "إغلاق" : "Close"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Personalized Student Lexicon
            </span>
          </div>
          <h3
            id="my-vocab-title"
            className="text-2xl font-black text-slate-950 dark:text-white mt-1"
          >
            {lang === "ar" ? "قائمة مفرداتي الخاصة (My Vocabulary)" : "My Vocabulary Notebook"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "ar"
              ? "مفرداتك المحفوظة من الوحدات التعليمية مع النطق والمعاني وأمثلة الاستخدام."
              : "Review, pronounce, and manage your saved curriculum vocabulary."}
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 pt-1">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ar" ? "بحث داخل مفرداتي..." : "Search saved words..."}
              className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#1a233b] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* UNIT FILTER */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#1a233b] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">{lang === "ar" ? "كل الوحدات" : "All Units"}</option>
            {availableUnits.map((u, i) => (
              <option key={i} value={u}>
                {u.replace("unit_", "Unit ").toUpperCase()}
              </option>
            ))}
          </select>

          {/* ACCENT TOGGLE */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setAccent("uk")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                accent === "uk"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              🇬🇧 UK
            </button>
            <button
              onClick={() => setAccent("us")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                accent === "us"
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              🇺🇸 US
            </button>
          </div>
        </div>

        {/* WORDS LIST */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 rtl:pr-0 rtl:pl-1">
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              {lang === "ar" ? "جاري تحميل مفرداتك..." : "Loading saved vocabulary..."}
            </div>
          ) : savedWords.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {lang === "ar" ? "لا توجد كلمات محفوظة بعد" : "No saved words found"}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === "ar"
                  ? "يمكنك حفظ الكلمات الجديدة أثناء قراءة قسم Vocabulary بالضغط على علامة الحفظ."
                  : "Save target words while studying the Vocabulary section to review them anytime."}
              </p>
            </div>
          ) : (
            savedWords.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-[#121c33] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {item.word}
                    </h4>
                    {item.partOfSpeech && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {item.partOfSpeech}
                      </span>
                    )}
                    {accent === "uk" && item.ipaUk && (
                      <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
                        {item.ipaUk}
                      </span>
                    )}
                    {accent === "us" && item.ipaUs && (
                      <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-bold">
                        {item.ipaUs}
                      </span>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeak(item.word)}
                      className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors cursor-pointer"
                      title={lang === "ar" ? "استماع للنطق" : "Listen pronunciation"}
                      aria-label={`Listen ${item.word}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {onOpenPractice && (
                      <button
                        onClick={() => {
                          const details = lookupDictionaryWord(item.word, {
                            arabicMeaning: item.arabicMeaning,
                            partOfSpeech: item.partOfSpeech,
                            exampleSentences: item.exampleSentence ? [item.exampleSentence] : [],
                          });
                          onOpenPractice(details);
                        }}
                        className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
                        title={lang === "ar" ? "تدريب على النطق" : "Practice pronunciation"}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item.id, item.word)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      title={lang === "ar" ? "حذف من قائمتي" : "Delete from list"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {item.arabicMeaning && (
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {item.arabicMeaning}
                  </p>
                )}

                {item.exampleSentence && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    &ldquo;{item.exampleSentence}&rdquo;
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
