"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  PlayCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Copy,
  Info,
  ShieldCheck,
  Award,
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

export const LiveClassroomManager: React.FC = () => {
  const { lang } = useApp();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSessionRoster, setSelectedSessionRoster] = useState<LiveSession | null>(null);
  const [rosterData, setRosterData] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New class form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("Third Secondary (Baccalaureate)");
  const [stage, setStage] = useState("Secondary");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [customMeetUrl, setCustomMeetUrl] = useState("");
  const [useGoogleCalendar, setUseGoogleCalendar] = useState(true);

  // Recording link modal state
  const [editingRecordingSession, setEditingRecordingSession] = useState<LiveSession | null>(null);
  const [recordingUrlInput, setRecordingUrlInput] = useState("");
  const [recordingNotesInput, setRecordingNotesInput] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/live-sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setIsGoogleConnected(Boolean(data.isGoogleConnected));
      }
    } catch (err) {
      console.error("Failed to fetch live sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime) {
      alert(lang === "ar" ? "يرجى كتابة عنوان الحصة ووقت البدء" : "Title and start time are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          stage,
          grade,
          startTime,
          durationMinutes: Number(duration),
          customMeetUrl: customMeetUrl || undefined,
          useGoogleCalendar,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        setStartTime("");
        setCustomMeetUrl("");
        await fetchSessions();
        alert(lang === "ar" ? "تم إنشاء الحصة ورابط Google Meet بنجاح!" : "Class & Meet URL created successfully!");
      } else {
        alert(data.error || "فشل إنشاء الحصة.");
      }
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الحصة.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/live-sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchSessions();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleSaveRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecordingSession) return;

    try {
      const res = await fetch(`/api/live-sessions/${editingRecordingSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingUrl: recordingUrlInput.trim(),
          recordingNotes: recordingNotesInput.trim(),
          status: "completed",
        }),
      });
      if (res.ok) {
        setEditingRecordingSession(null);
        await fetchSessions();
      }
    } catch (err) {
      alert("فشل حفظ رابط التسجيل");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذه الحصة؟" : "Delete this live session?")) return;
    try {
      const res = await fetch(`/api/live-sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSessions();
      }
    } catch (err) {
      alert("فشل الحذف");
    }
  };

  const handleOpenRoster = async (session: LiveSession) => {
    setSelectedSessionRoster(session);
    setLoadingRoster(true);
    try {
      const dateStr = new Date(session.startTime).toISOString().split("T")[0];
      const res = await fetch(`/api/attendance?date=${dateStr}&sessionTitle=${encodeURIComponent(session.title)}`);
      if (res.ok) {
        const json = await res.json();
        setRosterData(json.records || []);
      }
    } catch (err) {
      console.error("Error loading roster:", err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch("/api/google/oauth");
      const json = await res.json();
      if (json.authUrl) {
        window.location.href = json.authUrl;
      } else {
        alert(json.error || "يرجى تهيئة Google Client ID في Vercel Dashboard أولاً.");
      }
    } catch {
      alert("تعذر الاتصال بخدمة Google OAuth.");
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER & ACCOUNT CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GOOGLE INTEGRATION STATUS CARD */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-gradient-to-br from-[#1b1035] to-[#120826] border border-purple-500/30 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Video className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Google Meet & Google Calendar Integration</h3>
                  <p className="text-[11px] text-purple-300 font-mono">fandam228@gmail.com</p>
                </div>
              </div>

              {isGoogleConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "مربوط ونشط ✓" : "Connected ✓"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "جاهز للربط (Free Gmail)" : "Ready to link (Free Gmail)"}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-purple-200/80 leading-relaxed mb-4">
              {lang === "ar"
                ? "يتم إنشاء روابط الحصص المباشرة ومزامنتها تلقائياً على Google Calendar باستخدام حساب Gmail الشخصي المجاني (100 طالب / 60 دقيقة لكل حصة بدون أي اشتراكات أو تكلفة)."
                : "Live classes and Google Meet video links sync directly to Google Calendar using your free personal Gmail."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-purple-800/40">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "ar" ? "إنشاء حصة تفاعلية جديدة" : "New Live Class"}</span>
            </button>

            {!isGoogleConnected && (
              <button
                onClick={handleConnectGoogle}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-purple-400/30 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "ar" ? "ربط الحساب عبر Google OAuth" : "Authorize Google Account"}</span>
              </button>
            )}

            <button
              onClick={fetchSessions}
              className="p-2.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 text-purple-300 hover:text-white transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* COMPARISON QUICK GUIDE */}
        <div className="p-5 rounded-3xl bg-[#140b2a] border border-purple-800/40 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-amber-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{lang === "ar" ? "مميزات حساب Gmail الشخصي الحالية:" : "Free Account Features:"}</span>
            </h4>
            <ul className="text-[11px] space-y-1.5 text-purple-200">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>حتى 100 طالب في الحصة الواحدة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>مدة الحصة 60 دقيقة مجاناً</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>تسجيل حضور الطلاب التلقائي بالمنصة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>إتاحة رفع التسجيلات وإعادتها للطلاب</span>
              </li>
            </ul>
          </div>

          <div className="mt-3 p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-[10px] text-purple-300/80">
            💡 {lang === "ar" ? "لا تحتاج لشراء دومين أو الاشتراك في Workspace حالياً." : "No Workspace purchase required."}
          </div>
        </div>
      </div>

      {/* SESSIONS TABLE */}
      <div className="bg-[#120826] border border-purple-800/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            <h3 className="font-black text-sm text-white">
              {lang === "ar" ? "جدول الحصص المباشرة المسجلة" : "Live Classes Schedule"}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 text-xs font-mono">
              {sessions.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-purple-300">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Video className="w-10 h-10 text-purple-500/40 mx-auto" />
            <p className="text-xs text-purple-300 font-bold">
              {lang === "ar" ? "لا توجد حصص مجدولة حالياً" : "No live classes created yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-purple-950/40 text-purple-300 text-[11px] font-bold">
                <tr>
                  <th className="p-3.5">عنوان الحصة والصف</th>
                  <th className="p-3.5">الموعد والمدة</th>
                  <th className="p-3.5">رابط Google Meet</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">التسجيل والحضور</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-100">
                {sessions.map((session) => {
                  const dateStr = new Date(session.startTime).toLocaleDateString(
                    lang === "ar" ? "ar-EG" : "en-US",
                    { weekday: "short", month: "short", day: "numeric" }
                  );
                  const timeStr = new Date(session.startTime).toLocaleTimeString(
                    lang === "ar" ? "ar-EG" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  );

                  return (
                    <tr key={session.id} className="hover:bg-purple-900/20 transition-all">
                      <td className="p-3.5">
                        <div className="font-extrabold text-white">{session.title}</div>
                        <div className="text-[10px] text-purple-300">{session.grade}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-sky-300 font-medium">{dateStr}</div>
                        <div className="text-[10px] text-amber-300 font-bold">{timeStr} ({session.durationMinutes} دقيقة)</div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <a
                            href={session.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                          >
                            <span>{session.meetUrl.replace("https://", "")}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(session.meetUrl, session.id)}
                            className="p-1 rounded bg-purple-900/50 hover:bg-purple-800 text-purple-300"
                            title="نسخ الرابط"
                          >
                            {copiedId === session.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {session.status === "live" ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[10px] animate-pulse">
                            🔴 مباشر الآن
                          </span>
                        ) : session.status === "completed" ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            منتهية ✓
                          </span>
                        ) : session.status === "cancelled" ? (
                          <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-bold">
                            ملغية
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            مجدولة
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1">
                        <button
                          onClick={() => handleOpenRoster(session)}
                          className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-[10px] font-bold text-purple-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3 h-3 text-sky-400" />
                          <span>كشف الحضور</span>
                        </button>

                        {session.recordingUrl ? (
                          <a
                            href={session.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[10px] text-emerald-300 hover:underline"
                          >
                            ▶️ مشاهدة التسجيل
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingRecordingSession(session);
                              setRecordingUrlInput(session.recordingUrl || "");
                              setRecordingNotesInput(session.recordingNotes || "");
                            }}
                            className="block text-[10px] text-amber-400 hover:underline cursor-pointer"
                          >
                            + إضافة تسجيل الحصة
                          </button>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {session.status !== "live" && session.status !== "completed" && (
                            <button
                              onClick={() => handleUpdateStatus(session.id, "live")}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-black cursor-pointer shadow"
                              title="بدء البث المباشر الآن"
                            >
                              بدء الآن
                            </button>
                          )}
                          {session.status === "live" && (
                            <button
                              onClick={() => handleUpdateStatus(session.id, "completed")}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"
                              title="إنهاء الحصة"
                            >
                              إنهاء
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-red-900/60 text-purple-400 hover:text-red-300 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE LIVE CLASS */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#170c32] border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-sm">
                  {lang === "ar" ? "جدولة حصة تفاعلية جديدة (Google Meet)" : "Schedule Live Class"}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-purple-300 mb-1">
                  عنوان الحصة *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مراجعة شاملة للترجمة وحل البوكليت 2026/2027"
                  className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-300 mb-1">
                  وصف مختصر أو محاور الحصة
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مناقشة القواعد والحل التفاعلي مع الطلاب..."
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-1">
                    المرحلة الدراسية
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white"
                  >
                    <option value="Secondary">ثانوي (Secondary)</option>
                    <option value="Preparatory">إعدادي (Preparatory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white"
                  >
                    <option value="Third Secondary (Baccalaureate)">الثالث الثانوي (شهادة عامة)</option>
                    <option value="Second Secondary">الثاني الثانوي</option>
                    <option value="First Secondary">الأول الثانوي</option>
                    <option value="Third Prep">الثالث الإعدادي</option>
                    <option value="Second Prep">الثاني الإعدادي</option>
                    <option value="First Prep">الأول الإعدادي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-1">
                    موعد وتاريخ البدء *
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-1">
                    مدة الحصة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={15}
                    max={60}
                    className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white"
                  />
                  <span className="text-[10px] text-amber-400">حتى 60 دقيقة في باقة Gmail المجانية</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-300 mb-1">
                  رابط Google Meet مخصص (اختياري)
                </label>
                <input
                  type="url"
                  value={customMeetUrl}
                  onChange={(e) => setCustomMeetUrl(e.target.value)}
                  placeholder="اتركه فارغاً لإنشاء وتوليد رابط جديد تلقائياً"
                  className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-purple-800/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-900/40 hover:bg-purple-900 text-purple-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-black flex items-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الإنشاء وتوليد الرابط...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>إنشاء الحصة ورابط Google Meet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD RECORDING URL */}
      {editingRecordingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#170c32] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
              <h3 className="font-black text-sm">إضافة رابط تسجيل الحصة</h3>
              <button
                onClick={() => setEditingRecordingSession(null)}
                className="text-purple-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecording} className="space-y-3 text-xs">
              <div>
                <p className="text-xs text-purple-200 font-bold mb-2">
                  {editingRecordingSession.title}
                </p>
                <label className="block text-[11px] font-bold text-purple-300 mb-1">
                  رابط التسجيل (YouTube Unlisted / Google Drive / MP4) *
                </label>
                <input
                  type="url"
                  value={recordingUrlInput}
                  onChange={(e) => setRecordingUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... أو رابط Google Drive"
                  className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-300 mb-1">
                  ملاحظات للطلاب حول التسجيل
                </label>
                <textarea
                  value={recordingNotesInput}
                  onChange={(e) => setRecordingNotesInput(e.target.value)}
                  placeholder="تسجيل كامل ومرفق ملف PDF للشرح في المكتبة..."
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-white"
                />
              </div>

              <div className="pt-3 border-t border-purple-800/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecordingSession(null)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-900/40 text-purple-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black"
                >
                  حفظ ونشر التسجيل للطلاب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ATTENDANCE ROSTER */}
      {selectedSessionRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#170c32] border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
              <div>
                <h3 className="font-black text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>كشف الحضور التلقائي — {selectedSessionRoster.title}</span>
                </h3>
                <p className="text-[10px] text-purple-300">
                  تم تسجيل الحضور تلقائياً فور ضغط الطالب على زر JOIN LIVE CLASS
                </p>
              </div>
              <button
                onClick={() => setSelectedSessionRoster(null)}
                className="text-purple-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loadingRoster ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-purple-300">جاري تحميل سجل الحضور...</p>
              </div>
            ) : rosterData.length === 0 ? (
              <div className="p-8 text-center text-purple-300 text-xs">
                لم يسجل أي طالب الحضور في هذه الحصة حتى الآن.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2">
                <table className="w-full text-right text-xs">
                  <thead className="bg-purple-950/60 text-purple-300 text-[11px]">
                    <tr>
                      <th className="p-2.5">اسم الطالب</th>
                      <th className="p-2.5">الصف</th>
                      <th className="p-2.5">الحالة</th>
                      <th className="p-2.5">طريقة التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/40">
                    {rosterData.map((rec: any) => (
                      <tr key={rec.id} className="hover:bg-purple-900/20">
                        <td className="p-2.5 font-bold">{rec.studentName}</td>
                        <td className="p-2.5 text-purple-300">{rec.grade || "-"}</td>
                        <td className="p-2.5">
                          {rec.status === "present" ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              حاضر في الموعد ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              متأخر ⏰
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-400 font-mono text-[10px]">
                          {rec.markedBy || "google_meet_join"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-purple-800/40 text-right">
              <button
                onClick={() => setSelectedSessionRoster(null)}
                className="px-5 py-2 rounded-2xl bg-purple-900/50 hover:bg-purple-900 text-purple-200 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
