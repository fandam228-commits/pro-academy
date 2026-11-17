"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Share2,
  Clock,
  User,
  ShieldCheck,
  Smartphone,
  Lock,
  Unlock,
  Search,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export const AdminCenterAttendanceModule: React.FC = () => {
  const [studentCodeInput, setStudentCodeInput] = useState("");
  const [sessionTitle, setSessionTitle] = useState("حصة المراجعة الشاملة — سنتر كفر الزيات");
  const [homeworkCompleted, setHomeworkCompleted] = useState(true);
  const [parentPhoneOverride, setParentPhoneOverride] = useState("");
  const [logging, setLogging] = useState(false);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [lastCheckInResult, setLastCheckInResult] = useState<any | null>(null);
  const [homeworkGateEnabled, setHomeworkGateEnabled] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/center/attendance");
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setRecentRecords(data.records);
      }
    } catch (e) {
      console.error("Fetch attendance error:", e);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCodeInput.trim()) return;

    try {
      setLogging(true);
      const res = await fetch("/api/center/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: studentCodeInput.trim().toUpperCase(),
          sessionTitle,
          homeworkCompleted,
          parentPhone: parentPhoneOverride.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.record) {
        setLastCheckInResult(data.record);
        setRecentRecords((prev) => [data.record, ...prev]);
        setStudentCodeInput("");
        setParentPhoneOverride("");
      }
    } catch (err) {
      console.error("Check-in error:", err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <span>تسجيل حضور السنتر ومزامنة الواجب المدرسي (Center Attendance & Homework Gate)</span>
          </h2>
          <p className="text-xs text-slate-500">
            مسح سريع لباركود الطالب وتوثيق تسليم الواجب وإشعار ولي الأمر الفوري عبر واتساب.
          </p>
        </div>

        {/* HOMEWORK GATE TOGGLE */}
        <button
          onClick={() => setHomeworkGateEnabled(!homeworkGateEnabled)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            homeworkGateEnabled
              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-black"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
          }`}
        >
          {homeworkGateEnabled ? (
            <>
              <Lock className="w-4 h-4 text-amber-600" />
              <span>شرط الواجب نشط (غلق الدرس التالي حتى تسليم الواجب)</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 text-slate-400" />
              <span>شرط الواجب معطّل (السماح بفتح الدروس مباشرة)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 5 COLS: FAST CHECK-IN FORM & WHATSAPP DISPATCH */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCheckIn}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>تسجيل دخول طالب فوري (Scanner Input)</span>
            </h3>

            {/* SCANNER INPUT */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                امسح الرمز أو أدخل كود الطالب (STD-XXXX):
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="STD-1042"
                  value={studentCodeInput}
                  onChange={(e) => setStudentCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center text-lg font-mono font-black tracking-widest uppercase p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                  dir="ltr"
                />
                <QrCode className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* SESSION TITLE */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">عنوان الحصة / المجموعة:</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
              />
            </div>

            {/* HOMEWORK COMPLETED TOGGLE */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">حالة تسليم الواجب</p>
                <p className="text-[10px] text-slate-400">هل سلّم الطالب كشكول الواجب وتم تصحيحه؟</p>
              </div>
              <button
                type="button"
                onClick={() => setHomeworkCompleted(!homeworkCompleted)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  homeworkCompleted
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-rose-500 text-white shadow-sm"
                }`}
              >
                {homeworkCompleted ? "تم التسليم ✓" : "لم يسلّم ✕"}
              </button>
            </div>

            <button
              type="submit"
              disabled={logging || !studentCodeInput.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {logging ? "جاري التسجيل..." : "تسجيل الحضور في ثانية واحدة ⚡"}
            </button>
          </form>

          {/* LAST CHECK-IN CONFIRMATION & WHATSAPP DISPATCH */}
          {lastCheckInResult && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-5 rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم تسجيل الحضور بنجاح للطالب: {lastCheckInResult.studentName}</span>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <p>كود الطالب: <strong className="font-mono">{lastCheckInResult.studentCode}</strong></p>
                <p>حالة الواجب: <strong>{lastCheckInResult.homeworkCompleted ? "تم التسليم بنجاح ✅" : "لم يسلم الواجب ⚠️"}</strong></p>
              </div>

              {lastCheckInResult.whatsappUrl && (
                <a
                  href={lastCheckInResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>إرسال إشعار فوري لولي الأمر عبر واتساب 📲</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* RIGHT 7 COLS: RECENT CHECK-INS TABLE */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">سجل حضور الحصة الحالي</h3>
            <button
              onClick={fetchRecords}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">كود الطالب</th>
                  <th className="py-2.5 px-3">اسم الطالب</th>
                  <th className="py-2.5 px-3">الوقت</th>
                  <th className="py-2.5 px-3">الواجب</th>
                  <th className="py-2.5 px-3">إشعار ولي الأمر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {recentRecords.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-black text-blue-600 dark:text-blue-400" dir="ltr">
                      {r.studentCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{r.studentName || "طالب"}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(r.attendedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.homeworkCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200">
                          تم التسليم ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-600 border border-rose-200">
                          لم يسلّم ✕
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.parentPhone ? (
                        <a
                          href={`https://wa.me/${r.parentPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `ولي أمر الطالب المحترم، نحيطكم علماً بحضور الطالب لحصة اليوم في Professional Academy وحالة الواجب: ${
                              r.homeworkCompleted ? "تم التسليم بنجاح ✅" : "لم يتم التسليم ⚠️"
                            }`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
