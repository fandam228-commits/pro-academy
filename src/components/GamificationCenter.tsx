"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { buildWhatsAppLink } from "@/config/platform";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  Gift,
  Share2,
  Copy,
  Check,
  Heart,
  Users,
  Sparkles,
  Target,
  BrainCircuit,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";

export const GamificationCenter: React.FC = () => {
  const { user, lang } = useApp();
  const [tab, setTab] = useState<"leaderboard" | "badges" | "referral" | "favorites">("leaderboard");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/extras?userId=${user?.id || ""}`);
        const json = await res.json();
        setLeaderboard(json.leaderboard || []);
        setAffiliate(json.affiliate);
      } catch {}
      setLoading(false);
    })();
    try {
      const favs = JSON.parse(localStorage.getItem("pa_favorites") || "[]");
      setFavorites(favs);
    } catch {}
  }, [user?.id]);

  const badgeCatalog = [
    { icon: Flame, name: lang === "ar" ? "متوقد 7 أيام" : "7-Day Streak", desc: lang === "ar" ? "مذاكرة 7 أيام متتالية" : "Study 7 days in a row", unlocked: (user?.streak || 0) >= 7, color: "from-amber-500 to-orange-500" },
    { icon: Zap, name: lang === "ar" ? "صاعقة 30 يوم" : "30-Day Bolt", desc: lang === "ar" ? "تتابع 30 يوم كامل" : "30-day full streak", unlocked: (user?.streak || 0) >= 30, color: "from-yellow-400 to-amber-600" },
    { icon: Star, name: lang === "ar" ? "متفوق 500 نقطة" : "500 Points Star", desc: lang === "ar" ? "اجمع 500 نقطة تفوق" : "Collect 500 points", unlocked: (user?.points || 0) >= 500, color: "from-blue-500 to-indigo-600" },
    { icon: Crown, name: lang === "ar" ? "ملك 2000 نقطة" : "2000 Points King", desc: lang === "ar" ? "وصول لـ 2000 نقطة" : "Reach 2000 points", unlocked: (user?.points || 0) >= 2000, color: "from-purple-600 to-fuchsia-600" },
    { icon: Target, name: lang === "ar" ? "قناص الامتحانات" : "Exam Sniper", desc: lang === "ar" ? "درجة 90%+ في امتحان" : "Score 90%+ in an exam", unlocked: true, color: "from-emerald-500 to-teal-600" },
    { icon: BrainCircuit, name: lang === "ar" ? "صديق الذكاء الاصطناعي" : "AI Companion", desc: lang === "ar" ? "10 جلسات مع Habib AI" : "10 sessions with Habib AI", unlocked: true, color: "from-indigo-500 to-sky-500" },
    { icon: BookOpen, name: lang === "ar" ? "قارئ المكتبة" : "Library Reader", desc: lang === "ar" ? "قراءة 5 ملفات PDF" : "Read 5 PDF documents", unlocked: false, color: "from-sky-500 to-cyan-500" },
    { icon: Sparkles, name: lang === "ar" ? "اختبار المستوى الذهبي" : "Golden Placement", desc: lang === "ar" ? "إتمام اختبار المستوى" : "Complete placement test", unlocked: true, color: "from-rose-500 to-pink-600" },
  ];

  const copyReferral = () => {
    if (!affiliate) return;
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${affiliate.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rankStyle = (rank: number) =>
    rank === 1
      ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/30"
      : rank === 2
      ? "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800"
      : rank === 3
      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          {lang === "ar" ? "مركز التفوق والأوسمة" : "Gamification & Leaderboard Center"}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 mt-2">
          {lang === "ar"
            ? "نافس زملاءك، اجمع بالشارات المفتوحة، وادعُ أصدقاءك بنظام الإحالة واحصل على مكافآت!"
            : "Compete with peers, unlock badges, and earn rewards with the referral system!"}
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-md w-fit">
        {[
          { id: "leaderboard", labelAr: "المتصدرون", labelEn: "Leaderboard", icon: Trophy },
          { id: "badges", labelAr: "أوسمتي", labelEn: "My Badges", icon: Medal },
          { id: "referral", labelAr: "نظام الإحالة", labelEn: "Referrals", icon: Gift },
          { id: "favorites", labelAr: "المفضلة", labelEn: "Favorites", icon: Heart },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                tab === t.id ? "bg-amber-500 text-slate-950 shadow-lg" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {lang === "ar" ? t.labelAr : t.labelEn}
            </button>
          );
        })}
      </div>

      {/* LEADERBOARD */}
      {tab === "leaderboard" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
            {lang === "ar" ? "لوحة المتصدرين حسب نقاط التفوق" : "Top Learners by Points"}
          </h3>
          {loading ? (
            <p className="text-center text-slate-500 py-8 text-sm">Loading rankings...</p>
          ) : (
            <div className="space-y-2.5">
              {leaderboard.map((entry) => {
                const isMe = entry.id === user?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                      isMe
                        ? "bg-blue-50 dark:bg-blue-950/50 border-blue-400 shadow-lg"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow ${rankStyle(entry.rank)}`}>
                      {entry.rank}
                    </span>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {entry.name}
                        {entry.rank <= 3 && <Crown className="w-4 h-4 text-amber-500" />}
                        {isMe && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">{lang === "ar" ? "أنت" : "YOU"}</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">{entry.grade} • {entry.level}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-black text-lg text-blue-600 dark:text-blue-400">{entry.points}</p>
                      <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 justify-end">
                        <Flame className="w-3 h-3 text-amber-500" /> {entry.streak}d
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BADGES */}
      {tab === "badges" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badgeCatalog.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className={`p-5 rounded-3xl border text-center transition-all ${
                  b.unlocked
                    ? "bg-white dark:bg-slate-900 border-amber-400/60 shadow-xl shadow-amber-500/10"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 grayscale"
                }`}
              >
                <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{b.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{b.desc}</p>
                <span className={`mt-3 inline-block text-[10px] font-black px-2.5 py-1 rounded-full ${b.unlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                  {b.unlocked ? (lang === "ar" ? "مفتوح ✓" : "UNLOCKED ✓") : lang === "ar" ? "مقفل 🔒" : "LOCKED 🔒"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* REFERRAL */}
      {tab === "referral" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              {lang === "ar" ? "كود الإحالة الخاص بك" : "Your Referral Code"}
            </h3>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-dashed border-amber-400 text-center">
              <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300 tracking-widest">
                {affiliate?.code || "..."}
              </span>
            </div>
            <button
              onClick={copyReferral}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? (lang === "ar" ? "تم النسخ!" : "Copied!") : lang === "ar" ? "انسخ رابط الدعوة" : "Copy Invite Link"}
            </button>
            <a
              href={buildWhatsAppLink(
                lang === "ar"
                  ? `انضم لمنصة مستر حبيب الرحمن للإنجليزية بكود الإحالة الخاص بي: ${affiliate?.code} — منصة الثانوية العامة الأولى!`
                  : `Join Mr. Habib El Rahman's English platform with my referral code: ${affiliate?.code}`
              )}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              {lang === "ar" ? "شارك عبر واتساب" : "Share via WhatsApp"}
            </a>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {lang === "ar" ? "إحصائيات الإحالة" : "Referral Stats"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{affiliate?.totalReferrals || 0}</p>
                <p className="text-[10px] font-bold text-slate-500">{lang === "ar" ? "طالب انضم منك" : "Joined"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{affiliate?.earnings || "0"}</p>
                <p className="text-[10px] font-bold text-slate-500">{lang === "ar" ? "أرباح ج.م" : "EGP Earned"}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === "ar"
                ? "كل صديق يشترك بكودك في كورس مدفوع = 50 جنيه مكافأة رصيد، ويحصل هو على خصم 25 جنيه."
                : "Each friend who joins a paid course with your code = 50 EGP reward + 25 EGP discount for them."}
            </p>
          </div>
        </div>
      )}

      {/* FAVORITES */}
      {tab === "favorites" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            {lang === "ar" ? "كورساتي المفضلة" : "My Favorite Courses"}
          </h3>
          {favorites.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              {lang === "ar" ? "اضغط على القلب أعلى أي كورس في الصفحة الرئيسية لإضافته للمفضلة." : "Click the heart on any course card to add it here."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white">{f.title}</p>
                    <p className="text-[10px] text-slate-500">{f.grade} • {f.price}</p>
                  </div>
                  <Award className="w-5 h-5 text-rose-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
