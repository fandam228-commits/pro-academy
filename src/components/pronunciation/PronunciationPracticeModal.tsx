"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  X,
  AlertCircle,
  Headphones,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { pronunciationManager, PronunciationAccent } from "@/lib/pronunciation-assistant";
import { WordDetail } from "@/lib/dictionary-service";

interface PronunciationPracticeModalProps {
  wordDetail: WordDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PronunciationPracticeModal: React.FC<PronunciationPracticeModalProps> = ({
  wordDetail,
  isOpen,
  onClose,
}) => {
  const { lang } = useApp();

  const [accent, setAccent] = useState<PronunciationAccent>("uk");
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [mediaRecorderSupported, setMediaRecorderSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = !!(navigator.mediaDevices && window.MediaRecorder);
      setMediaRecorderSupported(supported);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanupResources();
    }
  }, [isOpen]);

  const cleanupResources = () => {
    // Stop recording timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    // Stop audio stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Stop student playback
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }

    pronunciationManager.stop();
    setIsRecording(false);
    setIsPlayingRecording(false);
    setIsTeacherSpeaking(false);
    setRecordDuration(0);
    setMicError(null);
  };

  const handleClose = () => {
    cleanupResources();
    onClose();
  };

  if (!isOpen || !wordDetail) return null;

  // 1. Listen to Native Teacher Pronunciation
  const handleListenNative = (targetAccent: PronunciationAccent) => {
    setAccent(targetAccent);
    setIsTeacherSpeaking(true);
    pronunciationManager.speak(wordDetail.word, {
      accent: targetAccent,
      speed: "normal",
      onStart: () => setIsTeacherSpeaking(true),
      onEnd: () => setIsTeacherSpeaking(false),
      onError: () => setIsTeacherSpeaking(false),
    });
  };

  // 2. Start Recording
  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError(
        lang === "ar"
          ? "متصفحك لا يدعم تسجيل الصوت المباشر (MediaDevices API غير مدعوم)."
          : "MediaDevices recording is not supported in this browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Turn off stream tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 20) {
            // Maximum recording window per word: 20 seconds
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicError(
          lang === "ar"
            ? "تم رفض إذن الوصول إلى الميكروفون. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح وإعادة المحاولة."
            : "Microphone permission was denied. Please grant microphone access in browser settings."
        );
      } else {
        setMicError(
          lang === "ar"
            ? "تعذر الاتصال بالميكروفون. تأكد من توصيل الميكروفون بشكل صحيح."
            : "Could not access microphone hardware."
        );
      }
    }
  };

  // 3. Stop Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  // 4. Play Student's Recording
  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(recordedAudioUrl);
    audioPlayerRef.current = audio;

    audio.onplay = () => setIsPlayingRecording(true);
    audio.onended = () => setIsPlayingRecording(false);
    audio.onerror = () => setIsPlayingRecording(false);

    audio.play();
  };

  // 5. Retry
  const handleRetry = () => {
    cleanupResources();
    setRecordedAudioUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-modal-title"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          aria-label={lang === "ar" ? "إغلاق النافذة" : "Close practice dialog"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
            {lang === "ar" ? "استوديو التدريب على النطق 🎙️" : "Pronunciation Practice Studio"}
          </span>
          <h3
            id="practice-modal-title"
            className="text-2xl font-black text-slate-950 dark:text-white mt-2"
          >
            {wordDetail.word}
          </h3>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {wordDetail.arabicMeaning}
          </p>
        </div>

        {/* STEP 1: LISTEN TO NATIVE PRONUNCIATION */}
        <div className="bg-slate-50 dark:bg-[#1a233b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300">
            <Headphones className="w-4 h-4 text-purple-600 dark:text-sky-400" />
            <span>{lang === "ar" ? "1. استمع للنطق الصحيح أولاً:" : "1. Listen to Native Pronunciation First:"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleListenNative("uk")}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accent === "uk" && isTeacherSpeaking
                  ? "bg-purple-600 text-white shadow-lg animate-pulse"
                  : "bg-white dark:bg-[#0f172a] hover:bg-purple-50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>🇬🇧 British (UK)</span>
            </button>

            <button
              onClick={() => handleListenNative("us")}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accent === "us" && isTeacherSpeaking
                  ? "bg-sky-600 text-white shadow-lg animate-pulse"
                  : "bg-white dark:bg-[#0f172a] hover:bg-sky-50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Volume2 className="w-4 h-4 text-sky-500" />
              <span>🇺🇸 American (US)</span>
            </button>
          </div>
        </div>

        {/* STEP 2: RECORD YOUR OWN PRONUNCIATION */}
        <div className="bg-slate-50 dark:bg-[#1a233b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300">
            <Mic className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "2. سجل نطقك بصوتك:" : "2. Record Your Voice:"}</span>
          </div>

          {!mediaRecorderSupported ? (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold">
              {lang === "ar"
                ? "خاصية التسجيل غير مدعومة في متصفحك الحالي."
                : "Audio recording is not supported in this browser."}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              {/* RECORD BUTTON */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white flex items-center justify-center shadow-xl shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                  aria-label={lang === "ar" ? "بدء التسجيل الصوتي" : "Start recording"}
                >
                  <Mic className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/50 animate-pulse cursor-pointer"
                  aria-label={lang === "ar" ? "إيقاف التسجيل الصوتي" : "Stop recording"}
                >
                  <Square className="w-7 h-7 fill-current" />
                </button>
              )}

              {/* RECORDING STATUS & TIMER */}
              {isRecording ? (
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span>
                    {lang === "ar" ? "جاري التسجيل الآن..." : "Recording..."} (00:
                    {recordDuration.toString().padStart(2, "0")})
                  </span>
                </div>
              ) : recordedAudioUrl ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "ar" ? "تم تسجيل صوتك بنجاح!" : "Voice recorded successfully!"}</span>
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500">
                  {lang === "ar" ? "اضغط على زر الميكروفون لبدء التسجيل" : "Click mic to start speaking"}
                </span>
              )}
            </div>
          )}

          {/* MIC ERROR NOTICE */}
          {micError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-2 text-right rtl:text-right">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* STEP 3: PLAYBACK & COMPARE */}
        {recordedAudioUrl && (
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>{lang === "ar" ? "3. استمع لتسجيلك وقارنه:" : "3. Playback Your Recording:"}</span>
              </span>
              <button
                onClick={handleRetry}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "إعادة التسجيل" : "Retry"}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={playRecordedAudio}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPlayingRecording
                    ? "bg-emerald-600 text-white shadow-lg animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isPlayingRecording
                    ? lang === "ar"
                      ? "جاري تشغيل تسجيلك..."
                      : "Playing..."
                    : lang === "ar"
                    ? "تشغيل تسجيل صوتي 🎧"
                    : "Play My Recording"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* PRIVACY & PEDAGOGICAL POLICY NOTICE */}
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-[11px] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-slate-400" />
          <span>
            {lang === "ar"
              ? "ملاحظة أمان: التسجيل محلي داخل متصفحك للمقارنة الذاتية فقط، ولا يتم إرسال صوتك لأي خادم أو طرف خارجي."
              : "Privacy: Your audio stays local on your device for self-comparison. No recordings are uploaded."}
          </span>
        </div>
      </div>
    </div>
  );
};
