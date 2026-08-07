"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Megaphone,
  CreditCard,
  NotebookPen,
  Award,
  BookOpen,
  Info,
  X,
  Loader2,
  Send,
  Plus,
} from "lucide-react";

const typeConfig: Record<string, { icon: any; bg: string; accent: string }> = {
  announcement: { icon: Megaphone, bg: "bg-blue-50 dark:bg-blue-950/40", accent: "text-blue-600" },
  payment: { icon: CreditCard, bg: "bg-emerald-50 dark:bg-emerald-950/40", accent: "text-emerald-600" },
  quiz: { icon: Award, bg: "bg-amber-50 dark:bg-amber-950/40", accent: "text-amber-600" },
  course: { icon: BookOpen, bg: "bg-purple-50 dark:bg-purple-950/40", accent: "text-purple-600" },
  info: { icon: Info, bg: "bg-slate-50 dark:bg-slate-800/40", accent: "text-slate-600" },
};

export const NotificationCenter: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "admin" || user?.role === "teacher";
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [compTitle, setCompTitle] = useState("");
  const [compMsg, setCompMsg] = useState("");
  const [compSending, setCompSending] = useState(false);
  const [compSent, setCompSent] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { headers: { ...authHeaders() } });
      if (!res.ok) return;
      const json = await res.json();
      setNotifs(json.notifications || []);
      setUnreadCount(json.unreadCount || 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ action: "mark_read", notificationId: id }),
    });
    fetchNotifs();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    fetchNotifs();
  };

  const deleteNotif = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ action: "delete", notificationId: id }),
    });
    fetchNotifs();
  };

  const sendBroadcast = async () => {
    if (!compTitle || !compMsg) return;
    setCompSending(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "send_broadcast", title: compTitle, message: compMsg, type: "announcement" }),
      });
      setCompSent(true);
      setCompTitle("");
      setCompMsg("");
      fetchNotifs();
      setTimeout(() => { setCompSent(false); setShowCompose(false); }, 1500);
    } catch {}
    setCompSending(false);
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === "ar" ? "الآن" : "Just now";
    if (mins < 60) return `${mins}${lang === "ar" ? "د" : "m"}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${lang === "ar" ? "س" : "h"}`;
    return `${Math.floor(hrs / 24)}${lang === "ar" ? "ي" : "d"}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
            {unreadCount > 0 ? <BellRing className="w-6 h-6 animate-bounce" /> : <Bell className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {lang === "ar" ? "مركز الإشعارات" : "Notification Center"}
            </h1>
            <p className="text-xs text-slate-500">
              {unreadCount > 0
                ? lang === "ar" ? `${unreadCount} إشعار جديد غير مقروء` : `${unreadCount} unread notifications`
                : lang === "ar" ? "كل الإشعارات مقروءة ✓" : "All caught up ✓"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow flex items-center gap-1.5 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              {lang === "ar" ? "قراءة الكل" : "Read All"}
            </button>
          )}
          {isStaff && (
            <button
              onClick={() => setShowCompose(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              {lang === "ar" ? "بث إشعار" : "Broadcast"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-14 text-center text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-600" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            {lang === "ar" ? "لا توجد إشعارات حالياً" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => {
            const tc = typeConfig[n.type] || typeConfig.info;
            const Icon = tc.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  n.isRead
                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    : `${tc.bg} border-blue-200 dark:border-blue-800/50 shadow-lg`
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${n.isRead ? "bg-slate-100 dark:bg-slate-800" : `bg-white dark:bg-slate-900 shadow ${tc.accent}`}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-extrabold text-sm truncate ${n.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                        {n.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400">{timeAgo(n.createdAt)}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${n.isRead ? "text-slate-400" : "text-slate-600 dark:text-slate-300"}`}>
                      {n.message}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotif(n.id);
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-red-50 dark:bg-red-950 text-red-500 hover:bg-red-100 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPOSE BROADCAST MODAL */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                {lang === "ar" ? "بث إشعار لكل الطلاب" : "Broadcast to All Students"}
              </h3>
              <button onClick={() => setShowCompose(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              value={compTitle}
              onChange={(e) => setCompTitle(e.target.value)}
              placeholder={lang === "ar" ? "عنوان الإشعار..." : "Notification title..."}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
            <textarea
              rows={4}
              value={compMsg}
              onChange={(e) => setCompMsg(e.target.value)}
              placeholder={lang === "ar" ? "محتوى الرسالة..." : "Message body..."}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />
            {compSent && (
              <p className="text-xs font-bold text-emerald-600 text-center">✅ {lang === "ar" ? "تم البث بنجاح!" : "Broadcast sent!"}</p>
            )}
            <button
              onClick={sendBroadcast}
              disabled={compSending}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {compSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {lang === "ar" ? "بث الإشعار الآن" : "Send Broadcast"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
