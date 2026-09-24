"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCheck,
  Loader2,
  Megaphone,
  Send,
  Smartphone,
  Sparkles,
  GraduationCap,
  CreditCard,
  NotebookPen,
  Info,
} from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export const NotificationCenter: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "teacher" || user?.role === "admin";

  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [vapidKey, setVapidKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Broadcast composer (staff)
  const [bTitle, setBTitle] = useState("");
  const [bMessage, setBMessage] = useState("");
  const [bGrade, setBGrade] = useState("All");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      setItems(json.notifications || []);
      setUnread(json.unreadCount || 0);
      setPushEnabled(!!json.pushEnabled);
      setVapidKey(json.vapidPublicKey || "");
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const enablePush = async () => {
    setWorking(true);
    setMsg(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setMsg({ type: "error", text: lang === "ar" ? "متصفحك لا يدعم الإشعارات — جرّب Chrome على الموبايل" : "Your browser doesn't support push notifications" });
        setWorking(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMsg({ type: "error", text: lang === "ar" ? "لم تسمح بالإشعارات. فعّلها من إعدادات المتصفح." : "Permission denied. Enable it from browser settings." });
        setWorking(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "subscribe", subscription: sub.toJSON() }),
      });
      const json = await res.json();
      if (json.success) {
        setPushEnabled(true);
        setMsg({ type: "success", text: lang === "ar" ? "تم تفعيل الإشعارات على هذا الجهاز ✓ (وصلك إشعار ترحيبي)" : "Push enabled on this device ✓" });
        load();
      }
    } catch (e) {
      setMsg({ type: "error", text: lang === "ar" ? "تعذّر التفعيل — تأكد أن الموقع يعمل عبر HTTPS" : "Failed — HTTPS is required for push" });
    }
    setWorking(false);
  };

  const disablePush = async () => {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ action: "unsubscribe", endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setPushEnabled(false);
      setMsg({ type: "success", text: lang === "ar" ? "تم إيقاف الإشعارات على هذا الجهاز" : "Push disabled on this device" });
    } catch {}
    setWorking(false);
  };

  const testPush = async () => {
    setWorking(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "test_push" }),
      });
      const json = await res.json();
      setMsg({
        type: json.sent > 0 ? "success" : "error",
        text: json.sent > 0
          ? lang === "ar" ? `تم إرسال إشعار تجريبي إلى ${json.sent} جهاز 📲` : `Test push sent to ${json.sent} device(s) 📲`
          : lang === "ar" ? "لا توجد أجهزة مفعّلة — فعّل الإشعارات أولاً" : "No devices registered yet",
      });
    } catch {}
    setWorking(false);
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    load();
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ action: "mark_read", notificationId: id }),
    });
    load();
  };

  const broadcast = async () => {
    if (!bTitle || !bMessage) {
      setMsg({ type: "error", text: lang === "ar" ? "أدخل عنوان ونص الإشعار" : "Title and message required" });
      return;
    }
    setWorking(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "broadcast", title: bTitle, message: bMessage, targetGrade: bGrade }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: "success", text: lang === "ar" ? `تم إرسال الإشعار إلى ${json.recipients} طالب 📣` : `Sent to ${json.recipients} students 📣` });
        setBTitle("");
        setBMessage("");
        load();
      }
    } catch {}
    setWorking(false);
  };

  const typeIcon = (t: string) => {
    if (t === "announcement") return { Icon: Megaphone, cls: "bg-purple-100 text-purple-600 dark:bg-purple-950" };
    if (t === "quiz") return { Icon: NotebookPen, cls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" };
    if (t === "payment") return { Icon: CreditCard, cls: "bg-amber-100 text-amber-600 dark:bg-amber-950" };
    if (t === "course") return { Icon: GraduationCap, cls: "bg-blue-100 text-blue-600 dark:bg-blue-950" };
    return { Icon: Info, cls: "bg-slate-100 text-slate-500 dark:bg-slate-800" };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-800 to-fuchsia-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <BellRing className="w-8 h-8" />
            {lang === "ar" ? "مركز الإشعارات" : "Notification Center"}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-2">
            {lang === "ar"
              ? "تنبيهات الحصص المباشرة، الواجبات، النتائج، والإعلانات — تصلك على جهازك حتى والتطبيق مقفول."
              : "Live class, homework, results & announcement alerts — delivered even when the app is closed."}
          </p>
        </div>
        {unread > 0 && (
          <span className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 font-black text-sm">
            {unread} {lang === "ar" ? "غير مقروء" : "unread"}
          </span>
        )}
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold border ${msg.type === "success" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300" : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300"}`}>
          {msg.text}
        </div>
      )}

      {/* PUSH CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${pushEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white">
              {lang === "ar" ? "إشعارات الجهاز (Push)" : "Device Push Notifications"}
            </p>
            <p className="text-[11px] text-slate-500">
              {pushEnabled
                ? lang === "ar" ? "مفعّلة على هذا الجهاز ✓" : "Enabled on this device ✓"
                : lang === "ar" ? "غير مفعّلة — فعّلها لتصلك التنبيهات فوراً" : "Not enabled — turn on for instant alerts"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pushEnabled ? (
            <>
              <button onClick={testPush} disabled={working} className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow flex items-center gap-2 disabled:opacity-60">
                {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {lang === "ar" ? "إشعار تجريبي" : "Test Push"}
              </button>
              <button onClick={disablePush} disabled={working} className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <BellOff className="w-4 h-4" />
                {lang === "ar" ? "إيقاف" : "Disable"}
              </button>
            </>
          ) : (
            <button onClick={enablePush} disabled={working || !vapidKey} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-60">
              {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
              {lang === "ar" ? "تفعيل الإشعارات الآن" : "Enable Notifications"}
            </button>
          )}
        </div>
      </div>

      {/* STAFF BROADCAST COMPOSER */}
      {isStaff && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-600" />
            {lang === "ar" ? "إرسال إشعار جماعي للطلاب" : "Broadcast to Students"}
          </h3>
          <input value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder={lang === "ar" ? "عنوان الإشعار (مثال: حصة مراجعة الليلة 8م)" : "Notification title..."} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white" />
          <textarea rows={3} value={bMessage} onChange={(e) => setBMessage(e.target.value)} placeholder={lang === "ar" ? "نص الرسالة..." : "Message body..."} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white" />
          <div className="flex flex-wrap gap-2">
            <select value={bGrade} onChange={(e) => setBGrade(e.target.value)} className="flex-1 min-w-[180px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
              <option value="All">{lang === "ar" ? "كل الطلاب" : "All students"}</option>
              <option value="Third Secondary (Baccalaureate)">Third Secondary</option>
              <option value="Second Secondary">Second Secondary</option>
              <option value="First Secondary">First Secondary</option>
              <option value="Third Prep">Third Prep</option>
            </select>
            <button onClick={broadcast} disabled={working} className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 disabled:opacity-60">
              <Send className="w-4 h-4" />
              {lang === "ar" ? "إرسال (تطبيق + جهاز)" : "Send (in-app + push)"}
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-600" />
            {lang === "ar" ? "كل الإشعارات" : "All Notifications"}
          </h3>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-[11px] font-extrabold text-blue-600 hover:underline flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              {lang === "ar" ? "تعليم الكل كمقروء" : "Mark all read"}
            </button>
          )}
        </div>

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-violet-600 mx-auto my-8" />
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">{lang === "ar" ? "لا إشعارات حتى الآن" : "No notifications yet"}</p>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const { Icon, cls } = typeIcon(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    n.isRead
                      ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-white dark:bg-slate-800/80 border-violet-300 dark:border-violet-800 shadow-md"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white">{n.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">
                      {new Date(n.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                    </p>
                  </div>
                  {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
