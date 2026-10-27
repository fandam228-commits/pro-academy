"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { buildWhatsAppLink } from "@/config/platform";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Sparkles,
  Loader2,
  Printer,
  Share2,
  Users,
  Award,
  ClipboardCheck,
  NotebookPen,
  Gauge,
  ArrowLeft,
} from "lucide-react";

/* ---------- Lightweight SVG line chart ---------- */
const LineChart: React.FC<{ data: { label: string; percentage: number }[]; lang: string }> = ({ data, lang }) => {
  if (data.length === 0) {
    return (
      <p className="text-xs text-slate-400 text-center py-10">
        {lang === "ar" ? "لا توجد اختبارات بعد لرسم منحنى التقدم" : "No assessments yet to plot progress"}
      </p>
    );
  }

  const W = 640;
  const H = 200;
  const P = 28;
  const maxY = 100;
  const stepX = data.length > 1 ? (W - P * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => ({
    x: P + i * stepX,
    y: H - P - (d.percentage / maxY) * (H - P * 2),
    ...d,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${path} L ${pts[pts.length - 1].x} ${H - P} L ${pts[0].x} ${H - P} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = H - P - (v / maxY) * (H - P * 2);
        return (
          <g key={v}>
            <line x1={P} y1={y} x2={W - P} y2={y} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
            <text x={4} y={y + 3} fontSize="9" fill="currentColor" fillOpacity="0.45">{v}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill={p.percentage >= 60 ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth="2" />
          <text x={p.x} y={H - 8} fontSize="8" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{p.label}</text>
          <text x={p.x} y={p.y - 10} fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.8">{p.percentage}%</text>
        </g>
      ))}
    </svg>
  );
};

/* ---------- Circular gauge ---------- */
const Gauge2: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(value, 100) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
        />
      </svg>
      <div className="-mt-[74px] mb-[30px] text-center">
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}%</p>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase text-center">{label}</p>
    </div>
  );
};

export const AnalyticsReports: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "teacher" || user?.role === "admin";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drillStudent, setDrillStudent] = useState<string | null>(null);

  const load = async (studentId?: string | null) => {
    setLoading(true);
    try {
      const url = studentId ? `/api/analytics?studentId=${studentId}` : "/api/analytics";
      const res = await fetch(url, {  });
      setData(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load(drillStudent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, drillStudent]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-sm">{lang === "ar" ? "جاري تحليل بيانات الأداء..." : "Analyzing performance data..."}</p>
      </div>
    );
  }

  /* ================= CLASS VIEW (teacher/admin) ================= */
  if (data?.scope === "class") {
    const k = data.classKpis;
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            {lang === "ar" ? "تقارير وتحليلات الفصل" : "Class Analytics & Reports"}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2">
            {lang === "ar" ? "مؤشرات أداء كل طالب، الطلاب المتعثرون، وأضعف مواضيع القواعد على مستوى الفصل." : "Per-student KPIs, at-risk learners, and weakest grammar topics class-wide."}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: lang === "ar" ? "عدد الطلاب" : "Students", value: k.totalStudents, icon: Users, color: "text-blue-600" },
            { label: lang === "ar" ? "متوسط الفصل" : "Class Average", value: `${k.classAvg}%`, icon: Award, color: "text-emerald-600" },
            { label: lang === "ar" ? "متوسط الحضور" : "Avg Attendance", value: k.classAtt == null ? (lang === "ar" ? "غير مسجل" : "Not recorded") : `${k.classAtt}%`, icon: ClipboardCheck, color: "text-teal-600" },
            { label: lang === "ar" ? "طلاب متعثرون" : "At Risk", value: k.atRiskCount, icon: AlertTriangle, color: "text-red-500" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5">
                <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* WEAKEST CLASS TOPICS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" />
            {lang === "ar" ? "أضعف المواضيع على مستوى الفصل (تحتاج مراجعة جماعية)" : "Weakest Class Topics"}
          </h3>
          {data.classTopics.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{lang === "ar" ? "لا بيانات كافية بعد" : "Not enough data yet"}</p>
          ) : (
            <div className="space-y-2.5">
              {data.classTopics.slice(0, 8).map((t: any) => (
                <div key={t.topic} className="flex items-center gap-3">
                  <span className="w-40 text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{t.topic}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${t.mastery >= 75 ? "bg-emerald-500" : t.mastery >= 55 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${t.mastery}%` }} />
                  </div>
                  <span className="w-20 text-end text-[11px] font-black text-slate-600 dark:text-slate-300">{t.mastery}% <span className="text-slate-400 font-medium">({t.total})</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STUDENT TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 overflow-x-auto">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
            {lang === "ar" ? "ترتيب الطلاب حسب مؤشر الأداء الشامل" : "Students by Performance Index"}
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                <th className="py-2 text-start">{lang === "ar" ? "الطالب" : "Student"}</th>
                <th className="py-2 text-center">{lang === "ar" ? "المؤشر" : "Index"}</th>
                <th className="py-2 text-center">{lang === "ar" ? "الدرجات" : "Score"}</th>
                <th className="py-2 text-center">{lang === "ar" ? "حضور" : "Att."}</th>
                <th className="py-2 text-center">{lang === "ar" ? "واجبات" : "HW"}</th>
                <th className="py-2 text-start">{lang === "ar" ? "أضعف موضوع" : "Weakest"}</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.students.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-extrabold text-slate-900 dark:text-white">{s.name}<span className="block text-[9px] text-slate-400 font-medium">{s.grade}</span></td>
                  <td className="py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-black text-[11px] ${s.performanceIndex >= 80 ? "bg-emerald-100 text-emerald-700" : s.performanceIndex >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                      {s.performanceIndex}
                    </span>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.avgScore}%</td>
                  <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.attRate == null ? "—" : `${s.attRate}%`}</td>
                  <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.hwCompletion}%</td>
                  <td className="py-3 text-[10px] text-red-500 font-bold">{s.weakestTopic || "-"}</td>
                  <td className="py-3 text-end">
                    <button onClick={() => setDrillStudent(s.id)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold">
                      {lang === "ar" ? "تقرير" : "Report"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ================= STUDENT / PARENT REPORT ================= */
  const k = data?.kpis;
  const s = data?.student;
  const isParent = data?.scope === "parent";

  const whatsappSummary = buildWhatsAppLink(
    `📊 تقرير أداء ${s?.name || ""} — منصة مستر حبيب الرحمن\n` +
      `• مؤشر الأداء: ${k?.performanceIndex}%\n` +
      `• متوسط الدرجات: ${k?.avgScore}%\n` +
      `• الحضور: ${k?.attRate}%\n` +
      `• إنجاز الواجبات: ${k?.hwCompletion}%\n` +
      `${data?.weaknesses?.length ? `• يحتاج مراجعة: ${data.weaknesses.map((w: any) => w.topic).join("، ")}` : ""}`
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          {isStaff && drillStudent && (
            <button onClick={() => setDrillStudent(null)} className="mb-2 text-[11px] font-bold text-blue-200 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> {lang === "ar" ? "عودة لتقرير الفصل" : "Back to class"}
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            {isParent ? (lang === "ar" ? "تقرير أداء ابنك" : "Child Performance Report") : lang === "ar" ? "تقرير أدائي التفصيلي" : "My Performance Report"}
          </h1>
          <p className="text-xs text-blue-100 mt-2">{s?.name} — {s?.grade}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 text-xs font-extrabold flex items-center gap-2">
            <Printer className="w-4 h-4" /> {lang === "ar" ? "طباعة" : "Print"}
          </button>
          <a href={whatsappSummary} target="_blank" rel="noreferrer" className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold flex items-center gap-2">
            <Share2 className="w-4 h-4" /> {lang === "ar" ? "إرسال واتساب" : "Share"}
          </a>
        </div>
      </div>

      {/* GAUGES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-slate-400">
        <Gauge2 value={k?.performanceIndex || 0} label={lang === "ar" ? "مؤشر الأداء الشامل" : "Performance Index"} color="#6366f1" />
        <Gauge2 value={k?.avgScore || 0} label={lang === "ar" ? "متوسط الاختبارات" : "Exam Average"} color="#2563eb" />
        {k?.attRate == null ? <div className="flex flex-col items-center justify-center min-h-[140px]"><ClipboardCheck className="w-8 h-8 text-slate-300 mb-3" /><p className="text-sm font-bold text-slate-500">{lang === "ar" ? "لا توجد بيانات حضور" : "No attendance data"}</p><p className="text-[10px] text-slate-400">{lang === "ar" ? "لم يتم تسجيل الحضور بعد" : "Attendance has not been recorded"}</p></div> : <Gauge2 value={k.attRate} label={lang === "ar" ? "نسبة الحضور" : "Attendance"} color="#10b981" />}
        <Gauge2 value={k?.hwCompletion || 0} label={lang === "ar" ? "إنجاز الواجبات" : "HW Completion"} color="#f59e0b" />
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: lang === "ar" ? "اختبارات محلولة" : "Assessments", value: k?.totalExams || 0, icon: Award },
          { label: lang === "ar" ? "واجبات مسلّمة" : "Homework Sent", value: k?.totalHomework || 0, icon: NotebookPen },
          { label: lang === "ar" ? "حصص مسجلة" : "Sessions Logged", value: k?.totalSessions || 0, icon: ClipboardCheck },
          {
            label: lang === "ar" ? "اتجاه الأداء" : "Trend",
            value: `${(k?.trend || 0) > 0 ? "+" : ""}${k?.trend || 0}%`,
            icon: (k?.trend || 0) >= 0 ? TrendingUp : TrendingDown,
            accent: (k?.trend || 0) >= 0 ? "text-emerald-600" : "text-red-500",
          },
        ].map((st, i) => {
          const Icon = st.icon as any;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5">
              <Icon className={`w-5 h-5 mb-2 ${st.accent || "text-blue-600"}`} />
              <p className={`text-2xl font-black ${st.accent || "text-slate-900 dark:text-white"}`}>{st.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{st.label}</p>
            </div>
          );
        })}
      </div>

      {/* PROGRESS CHART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 text-slate-500">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          {lang === "ar" ? "منحنى تطور الدرجات عبر الاختبارات" : "Score Progress Timeline"}
        </h3>
        <LineChart data={data?.timeline || []} lang={lang} />
      </div>

      {/* STRENGTHS & WEAKNESSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 shadow-xl p-6">
          <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {lang === "ar" ? "نقاط القوة 💪" : "Strengths 💪"}
          </h3>
          {data?.strengths?.length === 0 ? (
            <p className="text-xs text-slate-400">{lang === "ar" ? "حل مزيداً من الاختبارات لتحديد نقاط قوتك" : "Solve more exams to identify strengths"}</p>
          ) : (
            data?.strengths?.map((t: any) => (
              <div key={t.topic} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 mb-2">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.topic}</span>
                <span className="text-[11px] font-black text-emerald-600">{t.mastery}%</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xl p-6">
          <h3 className="font-extrabold text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {lang === "ar" ? "تحتاج مراجعة ⚠️" : "Needs Review ⚠️"}
          </h3>
          {data?.weaknesses?.length === 0 ? (
            <p className="text-xs text-slate-400">{lang === "ar" ? "لا نقاط ضعف واضحة — أداء ممتاز!" : "No clear weak spots — great job!"}</p>
          ) : (
            data?.weaknesses?.map((t: any) => (
              <div key={t.topic} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 mb-2">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.topic}</span>
                <span className="text-[11px] font-black text-red-500">{t.mastery}%</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FULL TOPIC MASTERY */}
      {data?.topicMastery?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-600" />
            {lang === "ar" ? "خريطة إتقان المواضيع" : "Topic Mastery Map"}
          </h3>
          <div className="space-y-2.5">
            {data.topicMastery.map((t: any) => (
              <div key={t.topic} className="flex items-center gap-3">
                <span className="w-36 text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{t.topic}</span>
                <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${t.mastery >= 75 ? "bg-emerald-500" : t.mastery >= 55 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${t.mastery}%` }} />
                </div>
                <span className="w-16 text-end text-[11px] font-black text-slate-600 dark:text-slate-300">{t.mastery}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl p-6 text-white">
        <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {lang === "ar" ? "توصيات مستر حبيب الذكية" : "Smart Recommendations"}
        </h3>
        <ul className="space-y-2">
          {data?.recommendations?.map((r: string, i: number) => (
            <li key={i} className="text-[11px] leading-relaxed bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15">
              ✅ {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
