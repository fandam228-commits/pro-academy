"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  ClipboardCheck,
  UserCheck,
  UserX,
  Clock,
  FileBadge,
  Save,
  Loader2,
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const SESSION_PRESETS = [
  "حصة مراجعة القواعد — أونلاين مباشر",
  "حصة مفردات وقراءة",
  "حصة حل نماذج بوكليت",
  "الحصة الأسبوعية مع مستر حبيب",
  "المتابعة الشهرية مع أولياء الأمور",
];

const STATUS_OPTIONS = [
  { id: "present", labelAr: "حاضر", labelEn: "Present", icon: UserCheck, cls: "bg-emerald-600 text-white" },
  { id: "late", labelAr: "متأخر", labelEn: "Late", icon: Clock, cls: "bg-amber-500 text-slate-950" },
  { id: "absent", labelAr: "غائب", labelEn: "Absent", icon: UserX, cls: "bg-red-500 text-white" },
  { id: "excused", labelAr: "معذور", labelEn: "Excused", icon: FileBadge, cls: "bg-sky-600 text-white" },
];

export const AttendanceWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "teacher" || user?.role === "admin";
  const [loading, setLoading] = useState(true);

  // Teacher state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTitle, setSessionTitle] = useState(SESSION_PRESETS[0]);
  const [roster, setRoster] = useState<any[]>([]);
  const [recentDates, setRecentDates] = useState<string[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Student state
  const [studentData, setStudentData] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = isStaff ? `/api/attendance?date=${date}` : "/api/attendance";
      const res = await fetch(url, { headers: { ...authHeaders() } });
      const json = await res.json();
      if (isStaff) {
        setRoster(json.roster || []);
        setRecentDates(json.recentDates || []);
        const initial: Record<string, string> = {};
        for (const r of json.roster || []) {
          initial[r.studentId] = r.statusOnDate || "present";
        }
        setMarks(initial);
      } else {
        setStudentData(json);
      }
    } catch {}
    setLoading(false);
  };

  const handleBulkSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        action: "bulk_mark",
        sessionTitle,
        sessionDate: date,
        marks: roster.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          grade: r.grade,
          status: marks[r.studentId] || "present",
        })),
      };
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMsg(lang === "ar" ? `تم حفظ حضور ${json.saved} طالب ✓` : `Saved attendance for ${json.saved} students ✓`);
        fetchData();
      }
    } catch {}
    setSaving(false);
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "check_in", sessionTitle: "الحصة المباشرة اليومية مع مستر حبيب" }),
      });
      setCheckedIn(true);
      fetchData();
    } catch {}
    setCheckingIn(false);
  };

  const markAllAs = (status: string) => {
    const next: Record<string, string> = {};
    for (const r of roster) next[r.studentId] = status;
    setMarks(next);
  };

  // Calendar data for student (last 30 days)
  const calendarDays = () => {
    const days: any[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const rec = studentData?.records?.find((r: any) => r.sessionDate === key);
      days.push({ key, day: d.getDate(), rec });
    }
    return days;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8" />
          {lang === "ar" ? "لوحة الحضور والغياب" : "Attendance Board"}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 mt-2">
          {isStaff
            ? lang === "ar"
              ? "رصد حضور الطلاب لكل حصة — حاضر / متأخر / غائب / معذور — مع نسب مواظبة فورية."
              : "Mark session rosters — present / late / absent / excused — with instant compliance rates."
            : lang === "ar"
            ? "نسبة انضباطك، تقويم المواظبة، وتسجيل حضور حصة اليوم بنقرة واحدة."
            : "Your compliance rate, attendance calendar, and one-tap check-in for today's class."}
        </p>
      </div>

      {loading ? (
        <div className="py-14 text-center text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
        </div>
      ) : isStaff ? (
        /* ================= TEACHER / ADMIN VIEW ================= */
        <div className="space-y-5">
          {/* SESSION CONTROLS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-xs">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "تاريخ الحصة" : "Session Date"}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white" />
            </div>
            <div className="text-xs">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "عنوان الحصة" : "Session Title"}</label>
              <select value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                {SESSION_PRESETS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="text-xs flex flex-col justify-end">
              <div className="flex gap-2">
                <button onClick={() => markAllAs("present")} className="flex-1 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-[11px] border border-emerald-300">
                  {lang === "ar" ? "الكل حاضر" : "All Present"}
                </button>
                <button onClick={() => markAllAs("absent")} className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-600 font-extrabold text-[11px] border border-red-300">
                  {lang === "ar" ? "الكل غائب" : "All Absent"}
                </button>
              </div>
            </div>
          </div>

          {/* ROSTER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {lang === "ar" ? `قائمة الطلاب (${roster.length})` : `Student Roster (${roster.length})`}
              </h3>
              <button onClick={handleBulkSave} disabled={saving} className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {lang === "ar" ? "حفظ رصد الحصة" : "Save Roster"}
              </button>
            </div>
            {saveMsg && <p className="text-xs font-bold text-emerald-600">{saveMsg}</p>}

            <div className="space-y-2.5">
              {roster.map((st) => (
                <div key={st.studentId} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-[180px]">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{st.studentName}</p>
                    <p className="text-[10px] text-slate-500">
                      {st.grade} — {lang === "ar" ? "نسبة المواظبة:" : "Rate:"} <span className="font-black text-blue-600">{st.rate}%</span> ({st.presentCount}H/{st.lateCount}L/{st.absentCount}A)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = marks[st.studentId] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setMarks({ ...marks, [st.studentId]: opt.id })}
                          className={`px-2.5 py-2 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border transition-all ${
                            active
                              ? opt.cls + " shadow-lg scale-105"
                              : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {lang === "ar" ? opt.labelAr : opt.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= STUDENT VIEW ================= */
        studentData && (
          <div className="space-y-6">
            {/* RATE + CHECK-IN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">{lang === "ar" ? "نسبة الانضباط" : "Attendance Rate"}</p>
                <p className={`text-4xl font-black mt-2 ${studentData.rate >= 90 ? "text-emerald-500" : studentData.rate >= 75 ? "text-amber-500" : "text-red-500"}`}>
                  {studentData.rate}%
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {studentData.presentCount} {lang === "ar" ? "حضور" : "Present"} • {studentData.lateCount} {lang === "ar" ? "تأخر" : "Late"} • {studentData.absentCount} {lang === "ar" ? "غياب" : "Absent"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-xl p-6 text-white md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    {lang === "ar" ? "حضرة حصة اليوم؟" : "Attending today's class?"}
                  </h3>
                  <p className="text-[11px] text-emerald-100 mt-1">
                    {lang === "ar" ? "اضغط تسجيل الحضور أثناء الحصة المباشرة ليتم احتساب مواظبتك فوراً." : "Tap check-in during the live class to log your attendance instantly."}
                  </p>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn || checkedIn}
                  className={`mt-3 px-6 py-3 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
                    checkedIn ? "bg-white/20 text-emerald-100 cursor-default" : "bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {checkedIn ? <CheckCircle2 className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  {checkedIn
                    ? lang === "ar" ? "تم رصد حضورك اليوم ✓" : "Checked-in Today ✓"
                    : checkingIn
                    ? lang === "ar" ? "جاري التسجيل..." : "Checking in..."
                    : lang === "ar" ? "تسجيل حضوري الآن" : "Check In Now"}
                </button>
              </div>
            </div>

            {/* 30-DAY CALENDAR */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                {lang === "ar" ? "تقويم المواظبة — آخر 30 يوم" : "Compliance Calendar — Last 30 Days"}
              </h3>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                {calendarDays().map((d) => {
                  const status = d.rec?.status;
                  const cls =
                    status === "present"
                      ? "bg-emerald-500 text-white"
                      : status === "late"
                      ? "bg-amber-400 text-slate-950"
                      : status === "absent"
                      ? "bg-red-500 text-white"
                      : status === "excused"
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400";
                  return (
                    <div key={d.key} className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-extrabold ${cls}`} title={status || d.key}>
                      {d.day}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> {lang === "ar" ? "حاضر" : "Present"}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> {lang === "ar" ? "متأخر" : "Late"}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> {lang === "ar" ? "غائب" : "Absent"}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500" /> {lang === "ar" ? "معذور" : "Excused"}</span>
              </div>
            </div>

            {/* HISTORY */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">
                {lang === "ar" ? "سجل الحصص الأخير" : "Recent Sessions"}
              </h3>
              <div className="space-y-2">
                {(studentData.records || []).slice(0, 10).map((r: any) => {
                  const opt = STATUS_OPTIONS.find((o) => o.id === r.status);
                  return (
                    <div key={r.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">{r.sessionTitle}</p>
                        <p className="text-[10px] text-slate-500">{r.sessionDate}{r.markedBy === "self" ? (lang === "ar" ? " — تسجيل ذاتي" : " — self check-in") : ""}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${opt?.cls || "bg-slate-300"}`}>
                        {lang === "ar" ? opt?.labelAr : opt?.labelEn}
                      </span>
                    </div>
                  );
                })}
                {(studentData.records || []).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">{lang === "ar" ? "لا سجلات حضور بعد — باشر تسجيل حصة اليوم!" : "No attendance records yet — check in to today's class!"}</p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
