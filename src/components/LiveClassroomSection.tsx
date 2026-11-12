"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  stage: string;
  grade: string;
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  meetUrl: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  recordingUrl: string | null;
  recordingNotes: string | null;
  maxAttendees: number;
}

export const LiveClassroomSection: React.FC = () => {
  const { user, lang } = useApp();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<{ id: string; text: string; points: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "recordings">("live");

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/live-sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching live sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleJoinClass = async (session: LiveSession) => {
    setJoiningId(session.id);
    setJoinMessage(null);
    try {
      const res = await fetch(`/api/live-sessions/${session.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id,
          studentName: user?.name,
          grade: user?.grade,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setJoinMessage({
          id: session.id,
          text: data.message || "تم تسجيل حضورك بنجاح!",
          points: data.pointsAwarded || 0,
        });

        // Open Google Meet in new window/tab
        setTimeout(() => {
          if (data.meetUrl) {
            window.open(data.meetUrl, "_blank", "noopener,noreferrer");
          }
        }, 1200);
      } else {
        alert(data.error || "تعذر الانضمام للحصة المباشرة.");
      }
    } catch (error) {
      alert("حدث خطأ أثناء الاتصال بالسيرفر.");
    } finally {
      setTimeout(() => setJoiningId(null), 1500);
    }
  };

  const now = new Date();
  const liveOrUpcoming = sessions.filter((s) => s.status === "live" || s.status === "scheduled");
  const recordedSessions = sessions.filter((s) => s.status === "completed" && s.recordingUrl);

  const formatSessionTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatSessionDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const isSessionNow = (session: LiveSession) => {
    if (session.status === "live") return true;
    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    const current = now.getTime();
    return current >= start - 15 * 60 * 1000 && current <= end;
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0c071a] via-[#150a2e] to-[#0c071a] border-t border-b border-purple-500/20 text-white overflow-hidden">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{lang === "ar" ? "الفصول التفاعلية المباشرة" : "Live Interactive Classroom"}</span>
              <span className="text-[10px] bg-red-900/60 px-1.5 py-0.5 rounded text-white font-mono">Google Meet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              {lang === "ar" ? "قاعة البث المباشر — مستر حبيب الرحمن" : "Live Classroom — Mr. Habib El Rahman"}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
              {lang === "ar"
                ? "تفاعل صوت وصورة مباشرة مع المستر، اسأل وتدرب على الامتحانات، وسجل حضورك التلقائي."
                : "Join live video classes, ask questions, practice exam models, and log attendance automatically."}
            </p>
          </div>

          {/* TOGGLE TABS */}
          <div className="flex p-1 bg-purple-950/60 rounded-2xl border border-purple-800/40 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("live")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "live"
                  ? "bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-red-600/30"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "الحصص المباشرة القادمة" : "Live & Upcoming"}</span>
              {liveOrUpcoming.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                  {liveOrUpcoming.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("recordings")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "recordings"
                  ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "تسجيلات الحصص السابقة" : "Replays & Recordings"}</span>
              {recordedSessions.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                  {recordedSessions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-xs text-purple-300 font-bold">
              {lang === "ar" ? "جاري تحميل جدول الحصص المباشرة..." : "Loading live classroom schedule..."}
            </p>
          </div>
        )}

        {/* TAB 1: LIVE & UPCOMING SESSIONS */}
        {!loading && activeTab === "live" && (
          <div className="space-y-4">
            {liveOrUpcoming.length === 0 ? (
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-3xl p-8 text-center space-y-3">
                <Video className="w-12 h-12 text-purple-400/50 mx-auto" />
                <h3 className="font-bold text-sm text-purple-200">
                  {lang === "ar" ? "لا توجد حصص مباشرة مجدولة الآن" : "No live classes scheduled right now"}
                </h3>
                <p className="text-xs text-purple-400 max-w-md mx-auto">
                  {lang === "ar"
                    ? "يقوم مستر حبيب بجدولة الحصص أسبوعياً. يمكنك تصفح تسجيلات الحصص السابقة أو الاشتراك في التنبيهات."
                    : "Classes are scheduled weekly by Mr. Habib. Check out replays or stay tuned."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {liveOrUpcoming.map((session) => {
                  const isLive = isSessionNow(session);
                  const isJoining = joiningId === session.id;
                  const message = joinMessage?.id === session.id ? joinMessage : null;

                  return (
                    <div
                      key={session.id}
                      className={`relative flex flex-col justify-between p-5 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
                        isLive
                          ? "bg-gradient-to-b from-purple-900/60 to-[#120826] border-red-500/60 shadow-xl shadow-red-900/20 ring-1 ring-red-500/40"
                          : "bg-purple-950/40 hover:bg-purple-950/70 border-purple-700/40 hover:border-purple-500/60 shadow-lg shadow-purple-950/30"
                      }`}
                    >
                      {/* TOP BADGES */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-purple-900/80 text-purple-200 border border-purple-700/50">
                          {session.grade}
                        </span>

                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-600 text-white text-[11px] font-black shadow-lg shadow-red-600/40 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span>{lang === "ar" ? "🔴 مباشر الآن" : "🔴 LIVE NOW"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-600/40">
                            <Clock className="w-3 h-3" />
                            <span>{session.durationMinutes} دقيقة</span>
                          </span>
                        )}
                      </div>

                      {/* TITLE & DESCRIPTION */}
                      <div className="space-y-2 mb-4">
                        <h3 className="font-black text-sm text-white leading-snug">
                          {session.title}
                        </h3>
                        {session.description && (
                          <p className="text-xs text-purple-200/70 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>

                      {/* TEACHER & TIME INFO */}
                      <div className="pt-3 border-t border-purple-800/40 space-y-2 mb-4 text-xs text-purple-200/90 font-medium">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                            <span>{session.teacherName}</span>
                          </span>
                          <span className="text-[10px] text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded">
                            {session.subject}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-sky-300">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatSessionDate(session.startTime)}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatSessionTime(session.startTime)}</span>
                          </span>
                        </div>
                      </div>

                      {/* ATTENDANCE FEEDBACK BANNER */}
                      {message && (
                        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <div className="text-[11px]">
                            <span>{message.text}</span>
                            {message.points > 0 && (
                              <span className="block text-[10px] text-amber-300">
                                +{message.points} نقطة تفاعل في رصيدك!
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ACTION BUTTON */}
                      <button
                        onClick={() => handleJoinClass(session)}
                        disabled={isJoining}
                        className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                          isLive
                            ? "bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-red-600/30 ring-2 ring-red-400/50"
                            : "bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white shadow-purple-600/30"
                        } disabled:opacity-60`}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{lang === "ar" ? "جاري تسجيل الحضور والدخول..." : "Joining & Logging..."}</span>
                          </>
                        ) : isLive ? (
                          <>
                            <Video className="w-4 h-4 animate-bounce" />
                            <span>{lang === "ar" ? "انضم للحصة المباشرة الآن (Google Meet)" : "JOIN LIVE CLASS NOW"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            <span>{lang === "ar" ? "دخول قاعة الحصة (Google Meet)" : "ENTER CLASSROOM"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-purple-300/60 text-center mt-2 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{lang === "ar" ? "يتم تسجيل حضورك التلقائي فور الضغط على الزر" : "Attendance automatically recorded upon entry"}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECORDED REPLAYS */}
        {!loading && activeTab === "recordings" && (
          <div className="space-y-4">
            {recordedSessions.length === 0 ? (
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-3xl p-8 text-center space-y-3">
                <PlayCircle className="w-12 h-12 text-purple-400/50 mx-auto" />
                <h3 className="font-bold text-sm text-purple-200">
                  {lang === "ar" ? "لا توجد تسجيلات منشورة حتى الآن" : "No recordings published yet"}
                </h3>
                <p className="text-xs text-purple-400 max-w-md mx-auto">
                  {lang === "ar"
                    ? "يقوم المستر برفع تسجيلات الحصص بعد انتهائها لتتمكن من مراجعتها في أي وقت."
                    : "Recorded classes will appear here after sessions conclude."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recordedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col justify-between p-5 rounded-3xl bg-purple-950/40 border border-purple-700/40 hover:border-purple-500/60 shadow-lg space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-purple-900/80 text-purple-200">
                          {session.grade}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                          {lang === "ar" ? "تسجيل متاح ✓" : "Replay Ready ✓"}
                        </span>
                      </div>

                      <h3 className="font-black text-sm text-white mb-2 leading-snug">
                        {session.title}
                      </h3>
                      {session.recordingNotes && (
                        <p className="text-xs text-purple-200/70 mb-3">
                          {session.recordingNotes}
                        </p>
                      )}
                      <p className="text-[11px] text-purple-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>{formatSessionDate(session.startTime)}</span>
                      </p>
                    </div>

                    <a
                      href={session.recordingUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{lang === "ar" ? "مشاهدة تسجيل الحصة" : "Watch Full Replay"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
