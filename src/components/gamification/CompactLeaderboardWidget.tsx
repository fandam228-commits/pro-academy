"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { fetchWeeklyLeaderboard, LeaderboardStudent } from "@/lib/gamification-service";
import { Trophy, Crown, Medal, Flame, Star, ChevronLeft, ArrowRight } from "lucide-react";

interface CompactLeaderboardWidgetProps {
  onOpenLeaderboard?: () => void;
}

export const CompactLeaderboardWidget: React.FC<CompactLeaderboardWidgetProps> = ({
  onOpenLeaderboard,
}) => {
  const { user, lang } = useApp();
  const [topStudents, setTopStudents] = useState<LeaderboardStudent[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWeeklyLeaderboard(user?.grade, user?.id);
        if (res.success) {
          setTopStudents(res.leaderboard.slice(0, 5));
          setMyRank(res.currentUserRank);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.grade, user?.id]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-500/20 shadow-xl shadow-amber-950/5 relative overflow-hidden" dir="rtl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md">
            <Trophy className="w-5 h-5 fill-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                لوحة الشرف
              </span>
              <span className="text-xs text-slate-400 font-bold">أوائل الأسبوع</span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {user?.grade ? `أوائل ${user.grade}` : "المتصدرون هذا الأسبوع"}
            </h3>
          </div>
        </div>

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}
      </div>

      {/* TOP 5 LIST */}
      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse font-bold">
          جاري تحميل الترتيب...
        </div>
      ) : (
        <div className="space-y-2">
          {topStudents.map((st) => {
            const isMe = st.isCurrentUser || st.userId === user?.id;
            let rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center">
                #{st.rank}
              </span>
            );

            if (st.rank === 1) {
              rankBadge = (
                <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                  👑
                </span>
              );
            } else if (st.rank === 2) {
              rankBadge = (
                <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center">
                  🥈
                </span>
              );
            } else if (st.rank === 3) {
              rankBadge = (
                <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center">
                  🥉
                </span>
              );
            }

            return (
              <div
                key={st.userId}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                  isMe
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {rankBadge}
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    {st.initials}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {st.name} {isMe && "(أنت)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{st.currentStreak}d</span>
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {st.weeklyXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER USER RANK CALLOUT */}
      {myRank && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-300">
            ترتيبك الحالي: <span className="text-amber-600 dark:text-amber-400 font-black">المركز #{myRank.rank}</span>
          </span>
          {myRank.pointsToNextRank > 0 && (
            <span className="text-[11px] text-slate-400">
              باقي {myRank.pointsToNextRank} XP للمركز التالي
            </span>
          )}
        </div>
      )}
    </div>
  );
};
