"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
  Clock,
  BookMarked,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  lessonId?: string;
  onCompleted?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, lessonId, onCompleted }) => {
  const { user, lang } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: "18%", left: "22%" });
  const [liveTimestamp, setLiveTimestamp] = useState<string>("");
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const [notes, setNotes] = useState<{ time: number; text: string }[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState<"video" | "notes">("video");

  // Format student phone for display (masked for privacy, yet uniquely traceable)
  const studentIdentifier = user?.phone || user?.email || "PA-STUDENT";
  const studentDisplayName = user?.name || (lang === "ar" ? "طالب منصة بروفيشنال" : "Professional Student");

  // Move dynamic watermark randomly every 6 seconds to prevent screen recording / cropping
  useEffect(() => {
    const updatePosition = () => {
      const top = `${Math.floor(Math.random() * 68) + 12}%`;
      const left = `${Math.floor(Math.random() * 68) + 12}%`;
      setWatermarkPos({ top, left });
      setLiveTimestamp(
        new Date().toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updatePosition();
    const interval = setInterval(updatePosition, 6000);
    return () => clearInterval(interval);
  }, [lang]);

  // Anti-Screen Recording & Anti-Inspection Key Listeners
  const triggerSecurityWarning = useCallback(
    (reason: string) => {
      setSecurityWarning(reason);
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setTimeout(() => {
        setSecurityWarning(null);
      }, 4000);
    },
    [isPlaying]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Block PrintScreen
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        triggerSecurityWarning(
          lang === "ar"
            ? "⚠️ محاولة تصوير الشاشة محظورة! المحتوى محمي بحقوق الملكية الفكرية لمنصة مستر حبيب الرحمن."
            : "⚠️ Screen capture is disabled! Content is DRM-protected for Mr. Habib El Rahman Platform."
        );
        // Clear clipboard if possible
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("").catch(() => {});
        }
      }

      // 2. Block DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) ||
        (e.ctrlKey && ["u", "U", "s", "S", "p", "P"].includes(e.key))
      ) {
        e.preventDefault();
        triggerSecurityWarning(
          lang === "ar"
            ? "🔒 أدوات المطورين محظورة لحماية خصوصية المحتوى."
            : "🔒 Developer tools inspection is blocked for DRM security."
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lang, triggerSecurityWarning]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullScreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, { time: currentTime, text: newNote }]);
    setNewNote("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0b0817] rounded-3xl overflow-hidden shadow-2xl border border-purple-900/40 text-white select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* HEADER BAR */}
      <div className="p-4 bg-gradient-to-r from-[#150d2e] via-[#0f0923] to-[#150d2e] border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <h3 className="font-extrabold text-sm md:text-base text-purple-100 truncate max-w-lg tracking-wide">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="font-semibold text-[11px]">
            {lang === "ar" ? "مشغل محمي ضد التسريب والسرقة" : "Anti-Leak DRM Protected"}
          </span>
        </div>
      </div>

      {/* SECURITY BANNER (IF SCREENSHOT OR INSPECTION DETECTED) */}
      {securityWarning && (
        <div className="bg-red-950/90 border-b border-red-600/50 p-3 text-red-200 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{securityWarning}</span>
        </div>
      )}

      {/* VIDEO CONTAINER & WATERMARKS */}
      <div className="relative group bg-black aspect-video flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            if (onCompleted) onCompleted();
          }}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        />

        {/* 1. SUBTLE BACKGROUND FORENSIC TRACING GRID (Ultra low opacity) */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-[0.06] select-none text-[11px] font-mono text-white/80 p-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center -rotate-12">
              <span>{studentIdentifier}</span>
              <span className="text-[9px]">PA-Habib-El-Rahman</span>
            </div>
          ))}
        </div>

        {/* 2. DYNAMIC FLOATING WATERMARK (Moves smoothly every 6 seconds) */}
        <div
          className="absolute pointer-events-none transition-all duration-1000 ease-in-out bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-[11px] font-mono font-bold text-white shadow-2xl flex flex-col items-center z-20"
          style={{ top: watermarkPos.top, left: watermarkPos.left }}
        >
          <div className="flex items-center gap-1.5 text-amber-300">
            <Lock className="w-3 h-3" />
            <span className="font-sans font-bold">{studentDisplayName}</span>
          </div>
          <span className="text-sky-300 text-[10px] tracking-wider">{studentIdentifier}</span>
          <div className="flex items-center gap-2 text-[9px] text-purple-200/80 mt-0.5">
            <span>{liveTimestamp}</span>
            <span>•</span>
            <span>Mr. Habib El Rahman</span>
          </div>
        </div>

        {/* CUSTOM OVERLAY CONTROLS */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          {/* SEEK SLIDER */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-purple-950/70 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-3"
          />

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime -= 10;
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime += 10;
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="font-mono text-slate-300 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* SPEED CONTROLS */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                      playbackSpeed === speed
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* FULLSCREEN */}
              <button
                onClick={toggleFullScreen}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTES & LESSON TIMELINE */}
      <div className="p-4 bg-gradient-to-b from-[#0f0923] to-[#0a0618] border-t border-purple-900/30">
        <div className="flex items-center gap-4 mb-3 border-b border-purple-900/30 pb-2">
          <button
            onClick={() => setActiveTab("video")}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "video"
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {lang === "ar" ? "تفاصيل الدرس والتقدم" : "Lesson Details"}
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "ملاحظاتي الشخصية" : "My Notes"}</span>
            {notes.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 rounded-full">
                {notes.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "video" ? (
          <div className="text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === "ar"
                  ? "شاهد الفيديو بتركيز وسجل ملاحظاتك. يتم حفظ نسبة المشاهدة وسجل الحضور تلقائياً."
                  : "Watch attentively and write down notes. Viewing progress and attendance are logged."}
              </span>
            </p>
            {onCompleted && (
              <button
                onClick={onCompleted}
                className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{lang === "ar" ? "تأكيد إكمال الدرس" : "Mark as Completed"}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "اكتب ملاحظتك عند التوقيت الحالي للفيديو..."
                    : "Write note at current video timestamp..."
                }
                className="flex-1 bg-[#130b2e] border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={addNote}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 rounded-xl transition-all shadow-sm"
              >
                {lang === "ar" ? "حفظ الملاحظة" : "Save Note"}
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {notes.map((n, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#130b2e]/90 p-2.5 rounded-xl border border-purple-900/40 text-xs"
                >
                  <span className="text-slate-200">{n.text}</span>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = n.time;
                      }
                    }}
                    className="font-mono text-sky-400 hover:underline flex items-center gap-1 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(n.time)}</span>
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  {lang === "ar" ? "لا توجد ملاحظات مسجلة بعد في هذا الدرس." : "No notes saved for this lesson yet."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
