"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Volume2, StopCircle, RotateCcw } from "lucide-react";
import {
  pronunciationManager,
  PronunciationAccent,
  PronunciationSpeed,
} from "@/lib/pronunciation-assistant";

interface SentencePronouncerProps {
  sentence: string;
  defaultAccent?: PronunciationAccent;
}

export const SentencePronouncer: React.FC<SentencePronouncerProps> = ({
  sentence,
  defaultAccent = "uk",
}) => {
  const { lang } = useApp();

  const [accent, setAccent] = useState<PronunciationAccent>(defaultAccent);
  const [speed, setSpeed] = useState<PronunciationSpeed>("normal");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlay = (targetSpeed: PronunciationSpeed = speed) => {
    setIsPlaying(true);
    pronunciationManager.speak(sentence, {
      accent,
      speed: targetSpeed,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleStop = () => {
    pronunciationManager.stop();
    setIsPlaying(false);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-purple-900/40 space-y-2 text-xs">
      {/* SENTENCE TEXT (PRESERVES PUNCTUATION & TEXT SELECTION) */}
      <p className="font-medium text-slate-800 dark:text-slate-100 leading-relaxed select-text">
        "{sentence}"
      </p>

      {/* CONTROLS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <button
              onClick={handleStop}
              className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              aria-label={lang === "ar" ? "إيقاف الصوت" : "Stop sentence audio"}
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "إيقاف" : "Stop"}</span>
            </button>
          ) : (
            <button
              onClick={() => handlePlay()}
              className="py-1 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              aria-label={lang === "ar" ? "استمع للجملة كاملة" : "Listen to sentence"}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "استمع للجملة" : "Listen"}</span>
            </button>
          )}

          <button
            onClick={() => handlePlay()}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title={lang === "ar" ? "إعادة التشغيل" : "Repeat"}
            aria-label="Repeat sentence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ACCENT & SPEED TOGGLES */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const next = accent === "uk" ? "us" : "uk";
              setAccent(next);
            }}
            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
          >
            {accent === "uk" ? "🇬🇧 UK" : "🇺🇸 US"}
          </button>

          <button
            onClick={() => {
              const next = speed === "normal" ? "slow" : "normal";
              setSpeed(next);
              if (isPlaying) handlePlay(next);
            }}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
              speed === "slow"
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {speed === "slow" ? "0.7x (Slow 🐢)" : "1.0x (Normal)"}
          </button>
        </div>
      </div>
    </div>
  );
};
