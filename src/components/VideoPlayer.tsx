"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Settings,
  Sparkles,
  CheckCircle,
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: "15%", left: "20%" });
  const [notes, setNotes] = useState<{ time: number; text: string }[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState<"video" | "notes">("video");

  // Move watermark around randomly to prevent screen recording piracy
  useEffect(() => {
    const interval = setInterval(() => {
      const top = `${Math.floor(Math.random() * 70) + 10}%`;
      const left = `${Math.floor(Math.random() * 70) + 10}%`;
      setWatermarkPos({ top, left });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
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
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white">
      {/* HEADER BAR */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-base text-slate-100 truncate max-w-lg">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === "ar" ? "مشغل محمي ضد السرقة" : "Anti-Download Protected"}</span>
        </div>
      </div>

      {/* VIDEO CONTAINER & WATERMARK */}
      <div className="relative group bg-black aspect-video flex items-center justify-center select-none" onContextMenu={(e) => e.preventDefault()}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            if (onCompleted) onCompleted();
          }}
          controlsList="nodownload"
          disablePictureInPicture
        />

        {/* DYNAMIC ANTI-RECORDING WATERMARK */}
        <div
          className="absolute pointer-events-none transition-all duration-1000 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-[11px] font-mono font-bold text-white/70 shadow-2xl flex flex-col items-center"
          style={{ top: watermarkPos.top, left: watermarkPos.left }}
        >
          <span>{user?.name || "Student User"}</span>
          <span className="text-amber-300">{user?.phone || "+20 100 000 0000"}</span>
          <span className="text-[9px] text-slate-300">Habib El Rahman Platform</span>
        </div>

        {/* CUSTOM OVERLAY CONTROLS */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* SEEK SLIDER */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-3"
          />

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime -= 10;
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime += 10;
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <span className="font-mono text-slate-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* SPEED CONTROLS */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                      playbackSpeed === speed ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* FULLSCREEN */}
              <button onClick={toggleFullScreen} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NOTES & LESSON TIMELINE */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-800/80">
        <div className="flex items-center gap-4 mb-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("video")}
            className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
              activeTab === "video" ? "bg-blue-600/30 text-blue-400 border border-blue-500/30" : "text-slate-400"
            }`}
          >
            {lang === "ar" ? "تفاصيل الدرس" : "Lesson Details"}
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "notes" ? "bg-blue-600/30 text-blue-400 border border-blue-500/30" : "text-slate-400"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "ملاحظاتي الشخصية" : "My Notes"}</span>
            {notes.length > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">{notes.length}</span>}
          </button>
        </div>

        {activeTab === "video" ? (
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <p>{lang === "ar" ? "شاهد الفيديوهات بتركيز وسجل الملاحظات. سيتم تسجيل تقدمك تلقائياً." : "Watch attentively. Progress is tracked automatically."}</p>
            {onCompleted && (
              <button
                onClick={onCompleted}
                className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "تحديد كمكتمل" : "Mark Completed"}</span>
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
                placeholder={lang === "ar" ? "اكتب ملاحظة عند الدقيقة الحالية..." : "Write a note at current time..."}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addNote}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 rounded-xl transition-all"
              >
                {lang === "ar" ? "حفظ" : "Save"}
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {notes.map((n, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-300">{n.text}</span>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = n.time;
                      }
                    }}
                    className="font-mono text-blue-400 hover:underline flex items-center gap-1 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(n.time)}</span>
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  {lang === "ar" ? "لا توجد ملاحظات مسجلة بعد." : "No notes saved yet."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
