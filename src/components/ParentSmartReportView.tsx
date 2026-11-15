"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  GraduationCap,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
  Printer,
  Share2,
  Phone,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  FileText,
} from "lucide-react";

interface ParentSmartReportViewProps {
  token?: string;
  studentId?: string;
  period?: "weekly" | "monthly";
  onBack?: () => void;
}

export const ParentSmartReportView: React.FC<ParentSmartReportViewProps> = ({
  token,
  studentId,
  period: initialPeriod = "weekly",
  onBack,
}) => {
  const { lang } = useApp();
  const [period, setPeriod] = useState<"weekly" | "monthly">(initialPeriod);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, token, studentId]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "";
      if (token) {
        url = `/api/parent-connect/reports?token=${encodeURIComponent(token)}`;
      } else if (studentId) {
        url = `/api/parent-connect/reports?studentId=${encodeURIComponent(studentId)}&period=${period}&generate_token=true`;
      } else {
        setError(lang === "ar" ? "معرّف الطالب أو رمز التقرير مطلوب" : "Student ID or token required");
        setLoading(false);
        return;
      }

      const res = await fetch(url, { headers: { ...authHeaders() } });
      const data = await res.json();
      if (res.ok && data.report) {
        setReport(data.report);
        if (data.shareableUrl) setShareableUrl(data.shareableUrl);
      } else {
        setError(data.error || (lang === "ar" ? "فشل في تحميل التقرير" : "Failed to load report"));
      }
    } catch {
      setError(lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 animate-spin flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <p className="font-extrabold text-sm text-slate-700 dark:text-purple-200">
          {lang === "ar" ? "جارِ تحليل درجات وسجل حضور الطالب وتجهيز التقرير الذكي..." : "Compiling intelligent student performance report..."}
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-black text-base text-red-900 dark:text-red-200">
          {lang === "ar" ? "تعذر فتح التقرير" : "Unable to Open Report"}
        </h3>
        <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
          >
            {lang === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </button>
        )}
      </div>
    );
  }

  const { student, parent, attendance, academic, homework, pedagogicalInsights } = report;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* 1. TOP ACTION TOOLBAR (Hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#12082b] p-4 rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-purple-950/60 hover:bg-slate-200 text-slate-700 dark:text-purple-300 text-xs font-bold transition-all"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}
          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
            {lang === "ar" ? "التقرير الذكي لولي الأمر" : "Smart Parent Report"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector (Only if not fixed by token) */}
          {!token && (
            <div className="bg-slate-100 dark:bg-purple-950/60 p-1 rounded-2xl flex items-center text-xs font-bold border border-slate-200 dark:border-purple-800/40">
              <button
                onClick={() => setPeriod("weekly")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  period === "weekly"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {lang === "ar" ? "تقرير أسبوعي" : "Weekly"}
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  period === "monthly"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {lang === "ar" ? "تقرير شهري" : "Monthly"}
              </button>
            </div>
          )}

          {/* Copy Link button */}
          {shareableUrl && (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-purple-900/40 text-slate-800 dark:text-purple-200 text-xs font-bold transition-all cursor-pointer border border-slate-300 dark:border-purple-700/50"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-500" />
              <span>{copied ? (lang === "ar" ? "تم نسخ الرابط!" : "Copied!") : (lang === "ar" ? "مشاركة الرابط" : "Share Link")}</span>
            </button>
          )}

          {/* Print / Save PDF button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === "ar" ? "طباعة / حفظ PDF" : "Print / PDF"}</span>
          </button>
        </div>
      </div>

      {/* 2. PRINTABLE REPORT SHEET CONTAINER */}
      <div className="bg-white dark:bg-[#0f0826] border border-slate-200 dark:border-purple-900/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0 print:text-black print:bg-white">
        {/* HEADER BAR: Official Academy Branding */}
        <div className="border-b-2 border-amber-400/60 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left rtl:sm:text-right">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-800 text-amber-300 flex items-center justify-center font-black text-2xl shadow-lg border border-amber-400/40 shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Professional Academy</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white print:text-black">
                {lang === "ar" ? "منصة مستر حبيب الرحمن للغة الإنجليزية" : "Mr. Habib El Rahman English Academy"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-purple-300 print:text-slate-600">
                {lang === "ar"
                  ? `كشف المتابعة والتقرير ${period === "weekly" ? "الأسبوعي" : "الشهري"} الشامل لأولياء الأمور`
                  : `Comprehensive ${period === "weekly" ? "Weekly" : "Monthly"} Parent Progress Report`}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-purple-300 print:text-slate-700 sm:text-right rtl:sm:text-left">
            <p className="font-bold">{report.generatedDate}</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 font-bold">
              ID: {student.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* STUDENT & PARENT INFO CARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-slate-50 dark:bg-[#160d38] p-4 rounded-2xl border border-slate-200 dark:border-purple-800/40 print:bg-slate-50 print:border-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {lang === "ar" ? "اسم الطالب:" : "Student Name:"}
            </span>
            <p className="font-black text-sm text-slate-900 dark:text-white print:text-black mt-0.5">
              {student.name}
            </p>
            <span className="text-[11px] text-purple-600 dark:text-purple-300 font-bold block mt-0.5">
              {student.grade} • {student.stage}
            </span>
          </div>

          {parent && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {lang === "ar" ? "ولي الأمر المسجل:" : "Registered Guardian:"}
              </span>
              <p className="font-black text-sm text-slate-900 dark:text-white print:text-black mt-0.5">
                {parent.name} ({parent.relationship})
              </p>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 block mt-0.5">
                {parent.phone}
              </span>
            </div>
          )}

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {lang === "ar" ? "التقييم العام للمستوى:" : "Overall Assessment:"}
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs mt-1">
              <Award className="w-3.5 h-3.5" />
              <span>{academic.progressStatusAr}</span>
            </div>
          </div>
        </div>

        {/* 3. KEY METRICS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Attendance Rate */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 text-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
              {lang === "ar" ? "نسبة الالتزام بالحضور" : "Attendance Rate"}
            </span>
            <p className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {attendance.attendanceRate}%
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {attendance.present} {lang === "ar" ? "حضور" : "present"} / {attendance.absent} {lang === "ar" ? "غياب" : "absent"}
            </span>
          </div>

          {/* Quiz Average */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 text-center">
            <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400 block mb-1">
              {lang === "ar" ? "متوسط درجات الاختبارات" : "Quiz Average"}
            </span>
            <p className="text-2xl md:text-3xl font-black text-purple-600 dark:text-purple-400">
              {academic.averagePercentage}%
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {academic.totalQuizzes} {lang === "ar" ? "امتحان تم إنجازه" : "quizzes taken"}
            </span>
          </div>

          {/* Homework Completion */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-sky-500/5 border border-sky-500/30 text-center">
            <span className="text-[10px] font-extrabold uppercase text-sky-600 dark:text-sky-400 block mb-1">
              {lang === "ar" ? "تسليم الواجبات" : "Homework Delivery"}
            </span>
            <p className="text-2xl md:text-3xl font-black text-sky-600 dark:text-sky-400">
              {homework.completionRate}%
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {homework.submitted} {lang === "ar" ? "تم تسليمه" : "submitted"}
            </span>
          </div>

          {/* Streak & Engagement */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 text-center">
            <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 block mb-1">
              {lang === "ar" ? "النقاط والاستمرارية" : "Streak & Points"}
            </span>
            <p className="text-2xl md:text-3xl font-black text-amber-500">
              {student.streak} 🔥
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono font-bold">
              {student.points} XP
            </span>
          </div>
        </div>

        {/* 4. ATTENDANCE & QUIZZES DETAILED TABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attendance Breakdown */}
          <div className="bg-slate-50 dark:bg-[#140b30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/30">
            <h4 className="font-extrabold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{lang === "ar" ? "سجل حضور الحصص الأخيرة" : "Recent Sessions Attendance"}</span>
            </h4>
            <div className="space-y-1.5">
              {attendance.records.length > 0 ? (
                attendance.records.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0b051c] border border-slate-200 dark:border-purple-900/30 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{r.sessionTitle}</span>
                      <span className="font-mono text-[10px] text-slate-400">{r.date}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === "present"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : r.status === "absent"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {r.status === "present" ? "حاضر" : r.status === "absent" ? "غائب" : "متأخر"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  {lang === "ar" ? "لا توجد سجلات حضور مسجلة" : "No attendance records"}
                </p>
              )}
            </div>
          </div>

          {/* Recent Quiz Scores */}
          <div className="bg-slate-50 dark:bg-[#140b30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/30">
            <h4 className="font-extrabold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "نتائج الاختبارات والكويزات" : "Recent Exam Results"}</span>
            </h4>
            <div className="space-y-1.5">
              {academic.recentExams.length > 0 ? (
                academic.recentExams.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0b051c] border border-slate-200 dark:border-purple-900/30 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{ex.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">{ex.date}</span>
                    </div>
                    <div className="text-right rtl:text-left">
                      <span className="font-mono font-black text-xs text-purple-600 dark:text-purple-300 block">
                        {ex.score}/{ex.total} ({ex.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  {lang === "ar" ? "لا توجد نتائج امتحانات مسجلة بعد" : "No exam submissions yet"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 5. PEDAGOGICAL INSIGHTS: MR. HABIB'S SMART ANALYSIS */}
        <div className="bg-gradient-to-r from-purple-950/40 via-[#160d38] to-purple-950/40 p-5 rounded-2xl border border-purple-800/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs md:text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>{lang === "ar" ? "تحليل مستر حبيب الرحمن التربوي وتوصيات التطوير" : "Mr. Habib's Pedagogical Analysis"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Strengths */}
            <div className="bg-black/30 p-3 rounded-xl border border-emerald-500/30">
              <span className="text-[11px] font-bold text-emerald-400 block mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "نقاط القوة والتميز:" : "Student Strengths:"}</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                {pedagogicalInsights.strengths.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-black/30 p-3 rounded-xl border border-amber-500/30">
              <span className="text-[11px] font-bold text-amber-400 block mb-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "خطة العمل والتوصيات:" : "Action Plan & Recommendations:"}</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                {pedagogicalInsights.habibRecommendations.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 6. OFFICIAL FOOTER SEAL */}
        <div className="pt-4 border-t border-slate-200 dark:border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left rtl:sm:text-right text-[11px] text-slate-500 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {lang === "ar"
                ? "تقرير رقمي معتمد رسميًا من إدارة منصة مستر حبيب الرحمن للغة الإنجليزية"
                : "Official certified performance report issued by Mr. Habib El Rahman Platform"}
            </span>
          </div>

          <div className="font-mono text-[10px] text-slate-400">
            Professional Academy • Thanawya Amma & Prep
          </div>
        </div>
      </div>
    </div>
  );
};
