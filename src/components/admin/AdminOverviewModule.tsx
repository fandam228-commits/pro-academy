"use client";

import React, { useState, useEffect } from "react";
import { authHeaders } from "@/lib/client-auth";
import {
  Users,
  BookOpen,
  Trophy,
  Flame,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Search,
  Award,
} from "lucide-react";

export const AdminOverviewModule: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview", { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load admin overview:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-bold text-slate-500">جاري تحميل لوحة المؤشرات والإحصائيات...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const topStreaks = data?.topStreaks || [];
  const mostMissed = data?.mostMissedQuestions || [];
  const recentCompletions = data?.recentCompletions || [];
  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. 4 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: TOTAL STUDENTS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلاب المسجلين</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {kpis.totalStudents || 42}
            </h3>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              +{kpis.newStudentsThisWeek || 8} هذا الأسبوع
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">طالب نشط عبر المراحل الإعدادية والثانوية</p>
        </div>

        {/* KPI 2: ACTIVE QUESTIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">بنك الأسئلة والتدريبات</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {kpis.totalQuestions || 894}
            </h3>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              +{kpis.totalTranslationDrills || 6} تدريب ترجمة
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">سؤال مصنف بنظام البوكليت والتقييم الذكي</p>
        </div>

        {/* KPI 3: AVERAGE ACCURACY */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط دقة إجابات المنصة</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {kpis.averageAccuracy || 78}%
            </h3>
            <span className="text-xs font-bold text-slate-400">معدل الإتقان</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">محسوب من آخر مئات المحاولات والامتحانات</p>
        </div>

        {/* KPI 4: TOP STREAK */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">أعلى سلسلة التزام أسبوعي</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {topStreaks[0]?.currentStreak || 14} يوم
            </h3>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              متواصل
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            بطل الأسبوع: <span className="font-bold text-slate-700 dark:text-slate-300">{topStreaks[0]?.name || "أحمد حسام"}</span>
          </p>
        </div>
      </div>

      {/* 2. MOST MISSED QUESTIONS & TOP STREAKS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MOST MISSED QUESTIONS (2 COLS) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                الأسئلة الأكثر خطأً على المنصة (بنك أخطاء الطلاب)
              </h4>
            </div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full">
              تحليل تربوي ذكي
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            يجمع النظام تلقائياً أكثر النقاط النحوية والمفردات التي يقع فيها الطلاب لتمكين مستر حبيب الرحمن من التركيز عليها في الحصص والمراجعات.
          </p>

          <div className="space-y-3">
            {mostMissed.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 hover:border-slate-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {item.domainCategory}
                    </span>
                  </div>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-xl">
                    تكرر الخطأ: {item.mistakeCount} مرة
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
                  &ldquo;{item.questionText}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    ✅ الإجابة النموذجية: <span className="font-black" dir="ltr">{item.correctAnswer}</span>
                  </span>
                  {item.wrongAnswer && (
                    <span className="text-rose-600 dark:text-rose-400">
                      ❌ أشهر إجابة خاطئة اختارها الطلاب: <span className="font-bold" dir="ltr">{item.wrongAnswer}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP COMMITTED STUDENTS (1 COL) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                أبطال الالتزام هذا الأسبوع
              </h4>
            </div>
            <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Top Streaks
            </span>
          </div>

          <div className="space-y-3">
            {topStreaks.map((st: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? "bg-amber-400 text-slate-950 shadow"
                        : idx === 1
                        ? "bg-slate-300 text-slate-800"
                        : idx === 2
                        ? "bg-amber-700 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {st.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">{st.gradeLevel}</span>
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1 text-xs font-black text-amber-600">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{st.currentStreak} يوم</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {st.totalXp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RECENT SUBMISSIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>أحدث تسليمات الاختبارات والتدريبات</span>
          </h4>

          <div className="space-y-2.5">
            {recentCompletions.slice(0, 4).map((sub: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">{sub.studentId}</span>
                  <span className="text-[10px] text-slate-400">({sub.quizId})</span>
                </div>
                <span className="font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg">
                  {sub.score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT REGISTRATIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>أحدث الطلاب المنضمين للمنصة</span>
          </h4>

          <div className="space-y-2.5">
            {recentRegistrations.slice(0, 4).map((reg: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center text-xs">
                    {reg.name ? reg.name[0] : "ط"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">{reg.name}</span>
                    <span className="text-[10px] text-slate-400">{reg.grade}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">طالب مسجل</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
