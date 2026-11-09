"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  X,
  Mic,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  StopCircle,
} from "lucide-react";
import {
  pronunciationManager,
  PronunciationAccent,
  PronunciationSpeed,
  VoiceStatus,
} from "@/lib/pronunciation-assistant";
import { WordDetail } from "@/lib/dictionary-service";

interface SmartDictionaryModalProps {
  wordDetail: WordDetail | null;
  unitId?: string;
  gradeId?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenPractice?: (word: WordDetail) => void;
  onWordSavedChange?: () => void;
}

export const SmartDictionaryModal: React.FC<SmartDictionaryModalProps> = ({
  wordDetail,
  unitId,
  gradeId,
  isOpen,
  onClose,
  onOpenPractice,
  onWordSavedChange,
}) => {
  const { lang, user } = useApp();

  const [accent, setAccent] = useState<PronunciationAccent>("uk");
  const [speed, setSpeed] = useState<PronunciationSpeed>("normal");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);

  useEffect(() => {
    if (isOpen && wordDetail) {
      setVoiceStatus(pronunciationManager.getVoiceStatus(accent));
      checkIfWordSaved(wordDetail.word);
    } else {
      pronunciationManager.stop();
      setIsSpeaking(false);
      setSavedNotice(null);
    }
  }, [isOpen, wordDetail, accent]);

  const checkIfWordSaved = async (word: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/student/vocabulary?search=${encodeURIComponent(word)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.savedWords)) {
        const found = data.savedWords.some(
          (w: any) => w.word.toLowerCase() === word.toLowerCase()
        );
        setIsSaved(found);
      }
    } catch {}
  };

  if (!isOpen || !wordDetail) return null;

  const handleSpeak = (targetAccent: PronunciationAccent, targetSpeed: PronunciationSpeed = speed) => {
    setAccent(targetAccent);
    const status = pronunciationManager.getVoiceStatus(targetAccent);
    setVoiceStatus(status);

    setIsSpeaking(true);
    pronunciationManager.speak(wordDetail.word, {
      accent: targetAccent,
      speed: targetSpeed,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSpeakSentence = (sentence: string) => {
    setIsSpeaking(true);
    pronunciationManager.speak(sentence, {
      accent,
      speed,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleToggleSave = async () => {
    if (!user) {
      setSavedNotice(lang === "ar" ? "يرجى تسجيل الدخول لحفظ الكلمات في قائمتك." : "Please log in to save words.");
      return;
    }

    setSavedLoading(true);
    setSavedNotice(null);

    try {
      if (isSaved) {
        // Find ID to delete
        const fetchRes = await fetch(`/api/student/vocabulary?search=${encodeURIComponent(wordDetail.word)}`);
        const fetchData = await fetchRes.json();
        const existing = fetchData.savedWords?.find(
          (w: any) => w.word.toLowerCase() === wordDetail.word.toLowerCase()
        );
        if (existing) {
          await fetch(`/api/student/vocabulary?id=${existing.id}`, { method: "DELETE" });
          setIsSaved(false);
          setSavedNotice(lang === "ar" ? "تمت إزالة الكلمة من قائمتك." : "Word removed from My Vocabulary.");
          onWordSavedChange?.();
        }
      } else {
        const res = await fetch("/api/student/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: wordDetail.word,
            arabicMeaning: wordDetail.arabicMeaning,
            partOfSpeech: wordDetail.partOfSpeech,
            ipaUk: wordDetail.ipaUk,
            ipaUs: wordDetail.ipaUs,
            exampleSentence: wordDetail.exampleSentence,
            unitId: unitId || "unit_general",
            gradeId: gradeId || "grade_general",
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setIsSaved(true);
          setSavedNotice(lang === "ar" ? "تم حفظ الكلمة في قائمة مفرداتي بنجاح!" : "Word saved to My Vocabulary!");
          onWordSavedChange?.();
        } else if (res.status === 409) {
          setIsSaved(true);
          setSavedNotice(data.error || (lang === "ar" ? "الكلمة محفوظة مسبقاً." : "Already in your list."));
        } else {
          setSavedNotice(data.error || "Failed to save word.");
        }
      }
    } catch {
      setSavedNotice(lang === "ar" ? "حدث خطأ أثناء حفظ الكلمة." : "Network error.");
    } finally {
      setSavedLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dict-word-title"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            pronunciationManager.stop();
            onClose();
          }}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          aria-label={lang === "ar" ? "إغلاق النافذة" : "Close dialog"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER: WORD & PART OF SPEECH */}
        <div className="pr-12 rtl:pr-0 rtl:pl-12">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              {wordDetail.partOfSpeech}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {lang === "ar" ? "القاموس الذكي المعتمد" : "Smart Dictionary"}
            </span>
          </div>

          <h3
            id="dict-word-title"
            className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white mt-1"
          >
            {wordDetail.word}
          </h3>

          <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
            {wordDetail.arabicMeaning}
          </p>
        </div>

        {/* NOTICE ALERT IF FALLBACK VOICE */}
        {voiceStatus?.isFallback && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{voiceStatus.fallbackNotice}</span>
          </div>
        )}

        {/* PRONUNCIATION CONTROLS (UK vs US & IPA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-[#1a233b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* BRITISH ACCENT CARD */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>🇬🇧</span>
                <span>British (UK)</span>
              </span>
              <span className="font-mono text-xs text-purple-600 dark:text-purple-300 font-bold">
                {wordDetail.ipaUk || "غير متاح"}
              </span>
            </div>
            <button
              onClick={() => handleSpeak("uk")}
              className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accent === "uk" && isSpeaking
                  ? "bg-purple-600 text-white shadow-md animate-pulse"
                  : "bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300"
              }`}
              aria-label="Listen British pronunciation"
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === "ar" ? "نطق بريطاني" : "Listen UK"}</span>
            </button>
          </div>

          {/* AMERICAN ACCENT CARD */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>🇺🇸</span>
                <span>American (US)</span>
              </span>
              <span className="font-mono text-xs text-sky-600 dark:text-sky-300 font-bold">
                {wordDetail.ipaUs || "غير متاح"}
              </span>
            </div>
            <button
              onClick={() => handleSpeak("us")}
              className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accent === "us" && isSpeaking
                  ? "bg-sky-600 text-white shadow-md animate-pulse"
                  : "bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300"
              }`}
              aria-label="Listen American pronunciation"
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === "ar" ? "نطق أمريكي" : "Listen US"}</span>
            </button>
          </div>
        </div>

        {/* SPEED SELECTOR & STOP CONTROL */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>{lang === "ar" ? "السرعة:" : "Speed:"}</span>
            <button
              onClick={() => {
                setSpeed("normal");
                handleSpeak(accent, "normal");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                speed === "normal"
                  ? "bg-purple-600 text-white font-black"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              }`}
            >
              1.0x (Normal)
            </button>
            <button
              onClick={() => {
                setSpeed("slow");
                handleSpeak(accent, "slow");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                speed === "slow"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              }`}
            >
              0.7x (Slow 🐢)
            </button>
          </div>

          {isSpeaking && (
            <button
              onClick={() => {
                pronunciationManager.stop();
                setIsSpeaking(false);
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <StopCircle className="w-4 h-4" />
              <span>{lang === "ar" ? "إيقاف الصوت" : "Stop"}</span>
            </button>
          )}
        </div>

        {/* DEFINITION */}
        {wordDetail.definitionEn && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "ar" ? "التعريف بالإنجليزية" : "English Definition"}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#1a233b]/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed italic">
              "{wordDetail.definitionEn}"
            </p>
          </div>
        )}

        {/* EXAMPLE SENTENCE WITH PRONUNCIATION */}
        {wordDetail.exampleSentence && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === "ar" ? "جملة المثال والربط اللغوي" : "Example Sentence"}
              </span>
              <button
                onClick={() => handleSpeakSentence(wordDetail.exampleSentence)}
                className="text-xs font-bold text-purple-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "استمع للجملة" : "Listen sentence"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-100 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-900/40 leading-relaxed">
              {wordDetail.exampleSentence}
            </p>
          </div>
        )}

        {/* SAVED NOTIFICATION MESSAGE */}
        {savedNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* ACTION BUTTONS (SAVE TO MY VOCABULARY & PRACTICE) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleToggleSave}
            disabled={savedLoading}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? "bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-200 hover:text-rose-600 border border-slate-300 dark:border-slate-700"
                : "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
            <span>
              {savedLoading
                ? lang === "ar"
                  ? "جاري المعالجة..."
                  : "Processing..."
                : isSaved
                ? lang === "ar"
                  ? "محفوظ في مفرداتي (اضغط للحذف)"
                  : "Saved in My Vocabulary"
                : lang === "ar"
                ? "حفظ في مفرداتي (My Vocabulary)"
                : "Save to My Vocabulary"}
            </span>
          </button>

          {onOpenPractice && (
            <button
              onClick={() => {
                pronunciationManager.stop();
                onOpenPractice(wordDetail);
              }}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{lang === "ar" ? "تدريب على النطق 🎙️" : "Practice Pronunciation"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
