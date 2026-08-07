"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  BarChart3,
  ClipboardCheck,
  NotebookPen,
  Award,
  Flame,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Printer,
  Loader2,
  CalendarDays,
  BookOpen,
  Star,
  AlertTriangle,
  CheckCircle2,
  Target,
} from "lucide-react";

export const WeeklyReport: React.FC = () => {
  const { user, lang } = useApp();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/reports?studentId=${user?.id || ""}`, { headers: { ...authHeaders() } });
        const json = await res.json();
        if (json.report) setReport(json.report);
      } catch {}
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <p className="font-medium text-sm">{lang === "ar" ? "جاري إعداد التقرير الأسبوعي..." : "Generating weekly report..."}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center text-slate-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-500" />
        <p className="font-medium text-sm">{lang === "ar" ? "لا توجد بيانات كافية لإنشاء التقرير بعد." : "Not enough data to generate a report yet."}</p>
      </div>
    );
  }

  const { student, period, attendance, homework, quizzes, courses, analysis } = report;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-800 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-7 h-7" />
            <h1 className="text-xl sm:text-2xl font-black">
              {lang === "ar" ? "التقرير الأسبوعي للطالب" : "Weekly Student Report"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-100">
            {student.name} — {student.grade} — {period.label}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print px-5 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 text-white font-extrabold text-xs flex items-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          {lang === "ar" ? "طباعة التقرير" : "Print Report"}
        </button>
      </div>

      {/* STUDENT IDENTITY CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-xs text-slate-500">{student.grade} • {lang === "ar" ? "مستوى:" : "Level:"} {student.level}</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-4 py-2.5 rounded-2xl">
            <Flame className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
            <p className="text-lg font-black text-amber-600">{student.streak}</p>
            <p className="text-[9px] font-bold text-slate-400">{lang === "ar" ? "يوم تتابع" : "Day Streak"}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-4 py-2.5 rounded-2xl">
            <Star className="w-4 h-4 text-emerald-500 mx-auto mb-0.5" />
            <p className="text-lg font-black text-emerald-600">{student.points}</p>
            <p className="text-[9px] font-bold text-slate-400">{lang === "ar" ? "نقطة" : "Points"}</p>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ATTENDANCE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 text-center">
          <ClipboardCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">{lang === "ar" ? "الحضور الكلي" : "Overall Attendance"}</p>
          <p className={`text-3xl font-black ${attendance.overallRate >= 90 ? "text-emerald-500" : attendance.overallRate >= 75 ? "text-amber-500" : "text-red-500"}`}>
            {attendance.overallRate}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {lang === "ar" ? `${attendance.weekPresent}H / ${attendance.weekLate}L / ${attendance.weekAbsent}A هذا الأسبوع` : `This week: ${attendance.weekPresent}P / ${attendance.weekLate}L / ${attendance.weekAbsent}A`}
          </p>
        </div>

        {/* HOMEWORK */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 text-center">
          <NotebookPen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">{lang === "ar" ? "الواجبات هذا الأسبوع" : "Homework This Week"}</p>
          <p className="text-3xl font-black text-blue-600">{homework.weekSubmissions}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {homework.avgScore !== null
              ? `${lang === "ar" ? "متوسط الدرجة:" : "Avg score:"} ${homework.avgScore}`
              : lang === "ar" ? "لا تصحيحات بعد" : "No grading yet"}
          </p>
        </div>

        {/* QUIZZES */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 text-center">
          <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">{lang === "ar" ? "الامتحانات والاختبارات" : "Quizzes & Exams"}</p>
          <p className="text-3xl font-black text-amber-600">{quizzes.weekAttempts}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {quizzes.avgPercentage !== null
              ? `${lang === "ar" ? "المتوسط:" : "Avg:"} ${quizzes.avgPercentage}%`
              : lang === "ar" ? "لا محاولات بعد" : "No attempts yet"}
          </p>
        </div>

        {/* COURSES */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 text-center">
          <BookOpen className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">{lang === "ar" ? "الكورسات المشترك بها" : "Enrolled Courses"}</p>
          <p className="text-3xl font-black text-purple-600">{courses.enrolledCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 truncate" title={courses.courseNames?.join(", ")}>
            {courses.courseNames?.[0] || (lang === "ar" ? "لا اشتراكات" : "None")}
          </p>
        </div>
      </div>

      {/* STRENGTHS & WEAKNESSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 shadow-lg p-6">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            {lang === "ar" ? "نقاط القوة والتميز" : "Strengths & Highlights"}
          </h3>
          <ul className="space-y-2.5">
            {analysis.strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-lg p-6">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-500" />
            {lang === "ar" ? "نقاط تحتاج متابعة ودعم" : "Areas Needing Attention"}
          </h3>
          <ul className="space-y-2.5">
            {analysis.weaknesses.map((w: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ADVISOR NOTE */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 rounded-3xl border border-blue-200 dark:border-slate-700 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            {lang === "ar" ? "توصية مستر حبيب الرحمن للأسبوع القادم:" : "Mr. Habib's Recommendation:"}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {attendance.overallRate >= 90 && homework.weekSubmissions > 0
              ? lang === "ar"
                ? "أداء ممتاز! استمر في الالتزام بالحضور وتسليم الواجبات. ركز الأسبوع القادم على حل المزيد من نماذج الامتحانات من بنك الأسئلة الذكي لتعزيز الجاهزية."
                : "Excellent performance! Keep up the attendance and homework commitment. Focus next week on practicing more smart exam models to boost readiness."
              : lang === "ar"
              ? "يحتاج التلميذ لمزيد من الانتظام في الحضور وتسليم الواجبات في وقتها. ننصح بتخصيص 30 دقيقة يومية لحل أسئلة بنك الأسئلة واستخدام مؤقت التركيز (Pomodoro)."
              : "The student needs more consistent attendance and timely homework submission. We recommend 30 minutes daily of question bank practice using the Pomodoro timer."}
          </p>
        </div>
      </div>

      {/* PRINT FOOTER */}
      <div className="print-only text-center pt-6 border-t border-slate-300 text-[10px] text-slate-500">
        <p>Professional Academy — Mr. Habib El Rahman — Weekly Student Report</p>
        <p>Generated: {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
    </div>
  );
};
