"use client";

import React from "react";
import { useGamification } from "@/hooks/useGamification";
import { Flame, Star, Trophy, Sparkles } from "lucide-react";

interface HeaderGamificationPillProps {
  onOpenLeaderboard?: () => void;
}

export const HeaderGamificationPill: React.FC<HeaderGamificationPillProps> = ({ onOpenLeaderboard }) => {
  const { profile, loading, activeToast } = useGamification();

  if (loading && !profile) {
    return (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 animate-pulse">
        <div className="w-4 h-4 bg-amber-400/50 rounded-full" />
        <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded-md" />
      </div>
    );
  }

  const streak = profile?.currentStreak || 1;
  const totalXp = (profile?.totalXp || 150).toLocaleString();

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2">
      {/* CELEBRATION TOAST POPUP */}
      {activeToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-amber-300">
          <Sparkles className="w-4 h-4 fill-current animate-spin" />
          <span className="text-xs">{activeToast.message}</span>
        </div>
      )}

      {/* 1. DAILY STREAK PILL */}
      <div
        className="group relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 font-black text-xs cursor-help transition-all hover:scale-105"
        title="سلسلة التزامك اليومية — ادخل وحل سؤالاً واحداً على الأقل يومياً للحفاظ عليها"
      >
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
        <span>{streak} {streak === 1 ? "يوم" : "أيام"}</span>

        {/* Tooltip on hover */}
        <div className="absolute -bottom-10 right-0 hidden group-hover:block z-50 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none">
          سلسلة التزامك اليومية • حل نشاطاً يومياً للحفاظ عليها
        </div>
      </div>

      {/* 2. TOTAL XP PILL */}
      <div
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 font-black text-xs transition-all hover:scale-105"
        title={`إجمالي نقاط الخبرة: ${totalXp} XP`}
      >
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>{totalXp} XP</span>
      </div>

      {/* 3. CURRENT RANK PILL (CLICKABLE TO OPEN LEADERBOARD) */}
      <button
        onClick={onOpenLeaderboard}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 font-black text-xs transition-all hover:scale-105 cursor-pointer"
        title="عرض لوحة شرف أوائل الأسبوع"
      >
        <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">لوحة الشرف</span>
      </button>
    </div>
  );
};
