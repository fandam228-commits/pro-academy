"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { buildWhatsAppLink } from "@/config/platform";
import { authHeaders } from "@/lib/client-auth";
import { Users, CheckCircle, BarChart3, Clock, MessageSquare, Phone, ShieldCheck, Award, FileBarChart } from "lucide-react";

export const ParentDashboard: React.FC<{ onOpenReport?: () => void }> = ({ onOpenReport }) => {
  const { lang, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [attendance, setAttendance] = useState<{ rate: number; total: number; records: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parent?parentId=${user?.id || "usr_parent_1"}`);
      const json = await res.json();
      setData(json);
      // Fetch REAL attendance for the linked student
      const attRes = await fetch(`/api/attendance?studentId=${json?.student?.id || ""}`, { headers: { ...authHeaders() } });
      if (attRes.ok) {
        const attJson = await attRes.json();
        if (attJson.rate !== undefined) setAttendance({ rate: attJson.rate, total: attJson.total, records: attJson.records || [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">{lang === "ar" ? "جاري تحميل بيانات الطالب والنتائج..." : "Loading student metrics..."}</div>;
  }

  const { student, submissions, averageScore, attendanceRate } = data || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER CARD */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/25">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {lang === "ar" ? "لوحة متابعة ولي الأمر" : "Parent Monitoring Hub"}
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {lang === "ar" ? `متابعة الطالب: ${student?.name}` : `Student: ${student?.name}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {student?.grade} • {student?.phone}
            </p>
          </div>
        </div>

        {/* DIRECT WHATSAPP ACTION */}
        <a
          href={buildWhatsAppLink(
            `Hello Mr. Habib El Rahman, I am the parent of ${student?.name || "Omar"}. I would like to follow up on their academic progress.`
          )}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>{lang === "ar" ? "تواصل مباشر مع مستر حبيب (واتساب)" : "Direct WhatsApp to Instructor"}</span>
        </a>

        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === "ar" ? "التقرير الأسبوعي الشامل" : "Full Weekly Report"}</span>
          </button>
        )}
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">{lang === "ar" ? "متوسط درجات الامتحانات" : "Average Exam Score"}</span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{averageScore}%</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Grade: Excellent</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">{lang === "ar" ? "نسبة الحضور والانضباط الحقيقية" : "Real Attendance Rate"}</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {attendance ? `${attendance.rate}%` : attendanceRate}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {attendance
              ? lang === "ar"
                ? `${attendance.total} حصة مسجلة — بيانات مباشرة من رصد المعلم`
                : `${attendance.total} sessions logged — live from teacher marks`
              : "Live & Recorded Lectures"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">{lang === "ar" ? "التتابع والمواظبة" : "Study Streak"}</span>
          <div className="text-3xl font-black text-amber-500">{student?.streak || 12} Days</div>
          <p className="text-[10px] text-amber-600 font-bold mt-1">Active Daily Learner</p>
        </div>
      </div>

      {/* REAL ATTENDANCE RECENT RECORDS */}
      {attendance && attendance.records && attendance.records.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            {lang === "ar" ? "سجل حضور الحصص الأخير (مباشر من المعلم)" : "Recent Session Attendance (live from teacher)"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {attendance.records.slice(0, 8).map((r: any) => (
              <span
                key={r.id}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${
                  r.status === "present"
                    ? "bg-emerald-100 text-emerald-700"
                    : r.status === "late"
                    ? "bg-amber-100 text-amber-700"
                    : r.status === "excused"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-red-100 text-red-700"
                }`}
                title={r.sessionTitle}
              >
                {r.sessionDate} — {r.status === "present" ? (lang === "ar" ? "حاضر" : "Present") : r.status === "late" ? (lang === "ar" ? "متأخر" : "Late") : r.status === "excused" ? (lang === "ar" ? "معذور" : "Excused") : (lang === "ar" ? "غائب" : "Absent")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RECENT SUBMISSIONS HISTORY */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
          {lang === "ar" ? "سجل نتائج امتحانات وواجبات الطالب الأخيرة" : "Recent Test & Quiz Submissions"}
        </h3>

        <div className="space-y-3">
          {submissions?.map((s: any) => (
            <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">Unit 1 Mastery Test</span>
                <span className="text-slate-400 text-[10px]">Submitted: {new Date(s.submittedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full font-bold font-mono ${s.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {s.percentage}% ({s.score} pts)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
