"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  Volume2,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  pronunciationManager,
  splitIntoSentences,
  PronunciationAccent,
  PronunciationSpeed,
} from "@/lib/pronunciation-assistant";

interface ParagraphPronouncerProps {
  title?: string;
  paragraphText: string;
  defaultAccent?: PronunciationAccent;
}

export const ParagraphPronouncer: React.FC<ParagraphPronouncerProps> = ({
  title,
  paragraphText,
  defaultAccent = "uk",
}) => {
  const { lang } = useApp();

  const [accent, setAccent] = useState<PronunciationAccent>(defaultAccent);
  const [speed, setSpeed] = useState<PronunciationSpeed>("normal");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  const sentences = splitIntoSentences(paragraphText);

  useEffect(() => {
    return () => {
      pronunciationManager.stop();
    };
  }, []);

  const handlePlayFull = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setActiveSentenceIndex(0);

    pronunciationManager.speakParagraph(paragraphText, {
      accent,
      speed,
      sentences,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onSentenceIndexChange: (idx) => {
        setActiveSentenceIndex(idx);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSentenceIndex(null);
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSentenceIndex(null);
      },
    });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      pronunciationManager.resume();
      setIsPaused(false);
    } else {
      pronunciationManager.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    pronunciationManager.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentenceIndex(null);
  };

  const handleRepeat = () => {
    handleStop();
    setTimeout(() => {
      handlePlayFull();
    }, 150);
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-sky-950/20 p-5 rounded-3xl border border-purple-500/30 shadow-lg space-y-4">
      {/* HEADER WITH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {title || (lang === "ar" ? "قراءة سياقية للمفردات المقررة" : "Contextual Reading Passage")}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === "ar"
                ? "مشغل نطق الفقرة مع تظليل تفاعلي للجملة المقروءة."
                : "Continuous paragraph player with dynamic sentence tracking."}
            </p>
          </div>
        </div>

        {/* ACCENT & SPEED SWITCHERS */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => {
              const next = accent === "uk" ? "us" : "uk";
              setAccent(next);
              if (isPlaying) {
                handleStop();
              }
            }}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1a233b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-black cursor-pointer"
          >
            {accent === "uk" ? "🇬🇧 British (UK)" : "🇺🇸 American (US)"}
          </button>

          <button
            onClick={() => {
              const next = speed === "normal" ? "slow" : "normal";
              setSpeed(next);
              if (isPlaying) {
                handleStop();
              }
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              speed === "slow"
                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                : "bg-white dark:bg-[#1a233b] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            }`}
          >
            {speed === "slow" ? "0.7x Slow 🐢" : "1.0x Normal"}
          </button>
        </div>
      </div>

      {/* HIGHLIGHTED PARAGRAPH TEXT */}
      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white/50 dark:bg-[#0c1222]/60 p-4 rounded-2xl border border-slate-200/60 dark:border-purple-900/30 select-text space-x-1 rtl:space-x-reverse">
        {sentences.map((sent, idx) => {
          const isCurrent = isPlaying && activeSentenceIndex === idx;
          return (
            <span
              key={idx}
              className={`transition-colors duration-200 rounded px-1 py-0.5 ${
                isCurrent
                  ? "bg-amber-300 dark:bg-amber-400/30 text-slate-950 dark:text-amber-200 font-extrabold shadow-sm ring-2 ring-amber-400/50"
                  : ""
              }`}
            >
              {sent}{" "}
            </span>
          );
        })}
      </div>

      {/* ACTION CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handlePlayFull}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black flex items-center gap-2 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{lang === "ar" ? "تشغيل الفقرة كاملة" : "Play Full Paragraph"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                <span>
                  {isPaused
                    ? lang === "ar"
                      ? "استئناف"
                      : "Resume"
                    : lang === "ar"
                    ? "إيقاف مؤقت"
                    : "Pause"}
                </span>
              </button>

              <button
                onClick={handleStop}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <StopCircle className="w-4 h-4" />
                <span>{lang === "ar" ? "إنهاء الصوت" : "Stop"}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleRepeat}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            title={lang === "ar" ? "إعادة الفقرة من البداية" : "Repeat from beginning"}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {isPlaying && (
          <span className="text-[11px] font-bold text-amber-500 animate-pulse flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === "ar"
                ? `جاري قراءة الجملة ${(activeSentenceIndex || 0) + 1} من ${sentences.length}`
                : `Reading sentence ${(activeSentenceIndex || 0) + 1} of ${sentences.length}`}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
