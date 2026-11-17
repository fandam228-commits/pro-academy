"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  fetchWeeklyLeaderboard,
  LeaderboardStudent,
  LeaderboardResponse,
} from "@/lib/gamification-service";
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Zap,
  Target,
  GraduationCap,
} from "lucide-react";

interface WeeklyLeaderboardViewProps {
  onStartQuiz?: () => void;
  onOpenMistakesBank?: () => void;
}

export const WeeklyLeaderboardView: React.FC<WeeklyLeaderboardViewProps> = ({
  onStartQuiz,
  onOpenMistakesBank,
}) => {
  const { user, lang } = useApp();
  const userGrade = user?.grade || "Third Secondary (Baccalaureate)";

  const [selectedGrade, setSelectedGrade] = useState<string>(userGrade);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const gradeOptions = [
    { id: "all", labelAr: "كل المراحل", labelEn: "All Grades" },
    { id: "Third Secondary (Baccalaureate)", labelAr: "الثالث الثانوي", labelEn: "3rd Secondary" },
    { id: "Second Secondary", labelAr: "الثاني الثانوي", labelEn: "2nd Secondary" },
    { id: "First Secondary", labelAr: "الأول الثانوي", labelEn: "1st Secondary" },
    { id: "Third Prep", labelAr: "الثالث الإعدادي", labelEn: "3rd Prep" },
  ];

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWeeklyLeaderboard(selectedGrade, user?.id);
      setData(res);
    } catch (e) {
      console.error("loadLeaderboard error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, user?.id]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const top3 = data?.topPodium;
  const listRanks = (data?.leaderboard || []).slice(3);
  const userRow = data?.currentUserRank;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" dir="rtl">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1D38] via-[#12284D] to-[#0A162B] border border-amber-500/30 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black mb-3">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>لوحة الشرف الأسبوعية • العام الدراسي 2026/2027</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 fill-amber-400/20" />
              <span>أوائل الأسبوع (Weekly Leaderboard)</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              تُحسب نقاط الخبرة (XP) أسبوعياً من خلال حل الكويزات، إتقان أسئلة بنك الأخطاء، وحل تمارين الترجمة وفصول القصة. يتجدد الترتيب كل يوم أحد!
            </p>
          </div>

          {/* QUICK REFRESH BUTTON */}
          <button
            onClick={loadLeaderboard}
            disabled={loading}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث الترتيب</span>
          </button>
        </div>

        {/* GRADE FILTER TABS */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-300 ml-2">الصف الدراسي:</span>
          {gradeOptions.map((opt) => {
            const isSelected = selectedGrade === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedGrade(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                {lang === "ar" ? opt.labelAr : opt.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP 3 PODIUM SHOWCASE */}
      {top3 && (top3.first || top3.second || top3.third) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          
          {/* PODIUM #2 (SILVER MEDAL) */}
          {top3.second && (
            <div className="order-2 md:order-1 bg-gradient-to-t from-slate-200/90 via-white to-slate-50 dark:from-slate-800/90 dark:via-[#101C33] dark:to-slate-800 rounded-3xl p-6 border border-slate-300 dark:border-slate-700 shadow-xl flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1">
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-black">
                المركز #2
              </div>
              <div className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-3 shadow-inner ring-4 ring-slate-300/50">
                <Medal className="w-8 h-8 text-slate-500 fill-slate-300" />
              </div>
              <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                {top3.second.name}
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {top3.second.gradeLevel}
              </span>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-800 dark:text-slate-200">
                  {top3.second.weeklyXp.toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{top3.second.currentStreak}d</span>
                </span>
              </div>
            </div>
          )}

          {/* PODIUM #1 (GOLD CROWN - HIGHEST) */}
          {top3.first && (
            <div className="order-1 md:order-2 bg-gradient-to-t from-amber-200/80 via-white to-amber-50 dark:from-amber-950/60 dark:via-[#132342] dark:to-[#0F1D38] rounded-3xl p-7 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1.5 md:-mt-6">
              <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md">
                👑 المتصدر الأول
              </div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mb-3 shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/40">
                <Crown className="w-10 h-10 text-slate-950 fill-amber-100" />
              </div>
              <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white">
                {top3.first.name}
              </h3>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                {top3.first.gradeLevel}
              </span>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm shadow-md">
                  {top3.first.weeklyXp.toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-100 dark:bg-orange-950/60 px-2 py-1 rounded-xl">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>{top3.first.currentStreak} يوم</span>
                </span>
              </div>
            </div>
          )}

          {/* PODIUM #3 (BRONZE MEDAL) */}
          {top3.third && (
            <div className="order-3 bg-gradient-to-t from-amber-100/70 via-white to-orange-50 dark:from-amber-950/40 dark:via-[#101C33] dark:to-slate-800 rounded-3xl p-6 border border-amber-300 dark:border-amber-700/60 shadow-xl flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1">
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                المركز #3
              </div>
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 shadow-inner ring-4 ring-amber-400/30">
                <Medal className="w-8 h-8 text-amber-600 fill-amber-500" />
              </div>
              <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                {top3.third.name}
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {top3.third.gradeLevel}
              </span>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-800 dark:text-slate-200">
                  {top3.third.weeklyXp.toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{top3.third.currentStreak}d</span>
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RANKED LIST (RANKS 4-20) */}
      <div className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 md:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>قائمة المتفوقين (المراكز 4 إلى 20)</span>
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            ترتيب تصاعدي حسب نقاط الأسبوع
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm animate-pulse">
            جاري تحميل لوحة المتصدرين...
          </div>
        ) : listRanks.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            لا يوجد طلاب إضافيون في هذا الصف حالياً.
          </div>
        ) : (
          <div className="space-y-2.5">
            {listRanks.map((student) => {
              const isCurrent = student.isCurrentUser || student.userId === user?.id;
              return (
                <div
                  key={student.userId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 shadow-md ring-2 ring-blue-500/20"
                      : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Number Badge */}
                    <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                      #{student.rank}
                    </span>

                    {/* Initials Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {student.initials}
                    </div>

                    {/* Name & Grade */}
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{student.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black">
                            أنت
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {student.gradeLevel}
                      </span>
                    </div>
                  </div>

                  {/* Streak & XP */}
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{student.currentStreak}d</span>
                    </span>

                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs min-w-[75px] text-center">
                      {student.weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STICKY "YOUR RANK" FOOTER ROW */}
      {userRow && (
        <div className="sticky bottom-4 z-40 bg-gradient-to-r from-[#0E1E38] via-[#162D55] to-[#0E1E38] border-2 border-[#EABF58] rounded-3xl p-4 md:p-5 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shrink-0">
              #{userRow.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase">
                  ترتيبك الحالي في لوحة الشرف
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  ({userRow.weeklyXp.toLocaleString()} XP هذا الأسبوع)
                </span>
              </div>
              <p className="text-xs md:text-sm font-bold text-white mt-0.5">
                {userRow.rank <= 3 ? (
                  <span className="text-emerald-400 font-black">🎉 رائع جداً! أنت ضمن الثلاثة الأوائل على مستوى الدفعة.</span>
                ) : (
                  <span>
                    يفصلك <span className="text-amber-300 font-black">{userRow.pointsToNextRank} XP</span> فقط عن المركز السابق (#{userRow.nextRankTarget})!
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {onStartQuiz && (
              <button
                onClick={onStartQuiz}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>حل كويز الآن لرفع ترتيبك ⚡</span>
              </button>
            )}
            {onOpenMistakesBank && (
              <button
                onClick={onOpenMistakesBank}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
              >
                بنك أخطائي
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyLeaderboardView;
