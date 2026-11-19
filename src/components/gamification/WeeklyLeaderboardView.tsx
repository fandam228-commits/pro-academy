"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  fetchWeeklyLeaderboard,
  fetchLeagueData,
  updateStudentLeagueProfile,
  LeaderboardStudent,
  LeaderboardResponse,
  LeagueResponse,
  GovernorateLeagueItem,
  SchoolLeagueItem,
  triggerGamificationToast,
} from "@/lib/gamification-service";
import { EGYPTIAN_GOVERNORATES } from "@/data/governorates-and-schools-data";
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
  Shield,
  MapPin,
  Building2,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
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

  // View Mode: Individual Students vs Governorates Cup vs Schools League
  const [activeTab, setActiveTab] = useState<"students" | "governorates" | "schools">("students");

  // Individual Students State
  const [selectedGrade, setSelectedGrade] = useState<string>(userGrade);
  const [studentsData, setStudentsData] = useState<LeaderboardResponse | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // League State (Governorates & Schools)
  const [leagueData, setLeagueData] = useState<LeagueResponse | null>(null);
  const [loadingLeague, setLoadingLeague] = useState(false);
  const [govRegionFilter, setGovRegionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Profile Editor
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedGovInput, setSelectedGovInput] = useState(user?.governorate || "الدقهلية");
  const [schoolInput, setSchoolInput] = useState(user?.schoolName || "مدرسة المنصورة الثانوية بنين");
  const [savingProfile, setSavingProfile] = useState(false);

  // Viral Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const gradeOptions = [
    { id: "all", labelAr: "كل المراحل", labelEn: "All Grades" },
    { id: "Third Secondary (Baccalaureate)", labelAr: "الثالث الثانوي", labelEn: "3rd Secondary" },
    { id: "Second Secondary", labelAr: "الثاني الثانوي", labelEn: "2nd Secondary" },
    { id: "First Secondary", labelAr: "الأول الثانوي", labelEn: "1st Secondary" },
    { id: "Third Prep", labelAr: "الثالث الإعدادي", labelEn: "3rd Prep" },
  ];

  const regionOptions = [
    { id: "all", label: "كل المحافظات (27)" },
    { id: "greater_cairo", label: "القاهرة الكبرى" },
    { id: "delta", label: "الدلتا" },
    { id: "canal", label: "مدن القناة" },
    { id: "upper_egypt", label: "الصعيد" },
    { id: "border", label: "المحافظات الحدودية" },
  ];

  // 1. Load Individual Students Leaderboard
  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await fetchWeeklyLeaderboard(selectedGrade, user?.id);
      setStudentsData(res);
    } catch (e) {
      console.error("loadStudents error:", e);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedGrade, user?.id]);

  // 2. Load League Data
  const loadLeague = useCallback(async () => {
    setLoadingLeague(true);
    try {
      const res = await fetchLeagueData(user?.id);
      if (res && res.success) {
        setLeagueData(res);
      }
    } catch (e) {
      console.error("loadLeague error:", e);
    } finally {
      setLoadingLeague(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStudents();
    loadLeague();
  }, [loadStudents, loadLeague]);

  // Handle Save League Profile
  const handleSaveProfile = async () => {
    if (!selectedGovInput.trim()) return;
    setSavingProfile(true);
    try {
      const res = await updateStudentLeagueProfile({
        governorate: selectedGovInput,
        schoolName: schoolInput,
        userId: user?.id,
      });

      if (res && res.success) {
        triggerGamificationToast({
          xp: res.bonusXp || 50,
          message: res.message || "تم تسجيلك في دوري المحافظات والمدارس!",
          actionType: "league_join",
        });
        await loadLeague();
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error("handleSaveProfile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Copy share message
  const handleCopyShare = () => {
    if (leagueData?.sharePayload?.fullMessageAr) {
      navigator.clipboard.writeText(leagueData.sharePayload.fullMessageAr);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filter Governorates
  const filteredGovernorates = (leagueData?.governorates || []).filter((g) => {
    const matchesRegion = govRegionFilter === "all" || g.region === govRegionFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      g.nameAr.includes(searchQuery.trim()) ||
      g.capitalAr.includes(searchQuery.trim()) ||
      g.topSchool.includes(searchQuery.trim());
    return matchesRegion && matchesSearch;
  });

  // Filter Schools
  const filteredSchools = (leagueData?.schools || []).filter((s) => {
    return (
      !searchQuery.trim() ||
      s.name.includes(searchQuery.trim()) ||
      s.governorateNameAr.includes(searchQuery.trim())
    );
  });

  const top3Students = studentsData?.topPodium;
  const listRanksStudents = (studentsData?.leaderboard || []).slice(3);
  const userRow = studentsData?.currentUserRank;

  const top3Govs = (leagueData?.governorates || []).slice(0, 3);
  const userLeague = leagueData?.currentUserLeague;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" dir="rtl">
      {/* 1. MASTER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#112240] to-[#0D3B66] border border-amber-500/30 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>دوري الجمهورية والتحدي الأسبوعي • 2026/2027</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 fill-amber-400/20" />
              <span>لوحة الشرف ودوري المحافظات والمدارس</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              كل نقطة خبرة (XP) تحصدها من حل الكويزات، نماذج المعاصر وجيم، وتمارين الترجمة تُرفع فوراً لرصيدك الشخصي ورصيد محافظتك ومدرستك!
            </p>
          </div>

          {/* ACTIONS: SHARE BADGE & REFRESH */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>كارت فخر محافظتي ومدرستي 🇪🇬</span>
            </button>

            <button
              onClick={() => {
                loadStudents();
                loadLeague();
              }}
              disabled={loadingStudents || loadingLeague}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStudents || loadingLeague ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* 2. 3-WAY SEGMENTED SWITCHER: STUDENTS vs GOVERNORATES vs SCHOOLS */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("students")}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "students"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-[1.01]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>ترتيب الطلاب (الأفراد)</span>
          </button>

          <button
            onClick={() => setActiveTab("governorates")}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "governorates"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.01]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>دوري المحافظات (27)</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px]">كأس الجمهورية</span>
          </button>

          <button
            onClick={() => setActiveTab("schools")}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "schools"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 scale-[1.01]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-300" />
            <span>دوري المدارس</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px]">STEM & عام</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW A: INDIVIDUAL STUDENTS LEADERBOARD (Original Classic View)
      ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* GRADE FILTER TABS */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#101b33] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">تصفية حسب الصف:</span>
            {gradeOptions.map((opt) => {
              const isSelected = selectedGrade === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedGrade(opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20 scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang === "ar" ? opt.labelAr : opt.labelEn}
                </button>
              );
            })}
          </div>

          {/* TOP 3 PODIUM */}
          {top3Students && (top3Students.first || top3Students.second || top3Students.third) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
              {/* #2 SILVER */}
              {top3Students.second && (
                <div className="order-2 md:order-1 bg-gradient-to-t from-slate-200/90 via-white to-slate-50 dark:from-slate-800/90 dark:via-[#101C33] dark:to-slate-800 rounded-3xl p-6 border border-slate-300 dark:border-slate-700 shadow-xl flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1">
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-black">
                    المركز #2
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-3 shadow-inner ring-4 ring-slate-300/50">
                    <Medal className="w-8 h-8 text-slate-500 fill-slate-300" />
                  </div>
                  <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                    {top3Students.second.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {top3Students.second.gradeLevel}
                  </span>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-800 dark:text-slate-200">
                      {top3Students.second.weeklyXp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{top3Students.second.currentStreak}d</span>
                    </span>
                  </div>
                </div>
              )}

              {/* #1 GOLD CROWN */}
              {top3Students.first && (
                <div className="order-1 md:order-2 bg-gradient-to-t from-amber-200/80 via-white to-amber-50 dark:from-amber-950/60 dark:via-[#132342] dark:to-[#0F1D38] rounded-3xl p-7 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1.5 md:-mt-4">
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md">
                    👑 المتصدر الأول
                  </div>
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mb-3 shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/40">
                    <Crown className="w-10 h-10 text-slate-950 fill-amber-100" />
                  </div>
                  <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white">
                    {top3Students.first.name}
                  </h3>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                    {top3Students.first.gradeLevel}
                  </span>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm shadow-md">
                      {top3Students.first.weeklyXp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-100 dark:bg-orange-950/60 px-2 py-1 rounded-xl">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>{top3Students.first.currentStreak} يوم</span>
                    </span>
                  </div>
                </div>
              )}

              {/* #3 BRONZE */}
              {top3Students.third && (
                <div className="order-3 bg-gradient-to-t from-amber-100/70 via-white to-orange-50 dark:from-amber-950/40 dark:via-[#101C33] dark:to-slate-800 rounded-3xl p-6 border border-amber-300 dark:border-amber-700/60 shadow-xl flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1">
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                    المركز #3
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 shadow-inner ring-4 ring-amber-400/30">
                    <Medal className="w-8 h-8 text-amber-600 fill-amber-500" />
                  </div>
                  <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                    {top3Students.third.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {top3Students.third.gradeLevel}
                  </span>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-800 dark:text-slate-200">
                      {top3Students.third.weeklyXp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{top3Students.third.currentStreak}d</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RANKS 4-20 */}
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

            {loadingStudents ? (
              <div className="py-12 text-center text-slate-400 font-bold text-sm animate-pulse">
                جاري تحميل لوحة المتصدرين...
              </div>
            ) : listRanksStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                لا يوجد طلاب إضافيون في هذا الصف حالياً.
              </div>
            ) : (
              <div className="space-y-2.5">
                {listRanksStudents.map((student) => {
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
                        <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          #{student.rank}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {student.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{student.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black">
                                أنت
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-400">{student.gradeLevel}</span>
                        </div>
                      </div>
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
        </div>
      )}

      {/* =========================================================================
          VIEW B: GOVERNORATES CUP (27 Egyptian Governorates League)
      ========================================================================= */}
      {activeTab === "governorates" && (
        <div className="space-y-6">
          {/* USER GOVERNORATE AFFILIATION CARD */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-3xl p-5 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-amber-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {userLeague?.governorateNameAr === "الدقهلية" ? "🌾" : "🏛️"}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black mb-1">
                  <UserCheck className="w-3 h-3" />
                  <span>أنت تمثل في الدوري:</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white">
                  محافظة {userLeague?.governorateNameAr || "الدقهلية"} • {userLeague?.schoolName || "مدرسة المنصورة الثانوية بنين"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  ترتيب محافظتك الآن: <span className="text-amber-300 font-black">المركز #{userLeague?.governorateRank || 1}</span> ({userLeague?.shieldNameAr})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
              >
                تغيير محافظتي أو مدرستي ✏️
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة فخر المحافظة</span>
              </button>
            </div>
          </div>

          {/* TOP 3 GOVERNORATES PODIUM (SHIELDS SHOWCASE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
            {/* #2 SILVER SHIELD */}
            {top3Govs[1] && (
              <div className="order-2 md:order-1 bg-gradient-to-t from-slate-200/90 via-white to-slate-50 dark:from-slate-800/90 dark:via-[#101C33] dark:to-slate-800 rounded-3xl p-6 border-2 border-slate-300 dark:border-slate-700 shadow-xl flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1">
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-black">
                  🥈 المركز #2
                </div>
                <div className="text-4xl mb-2">{top3Govs[1].emblemEmoji}</div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  محافظة {top3Govs[1].nameAr}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  عاصمتها: {top3Govs[1].capitalAr} • {top3Govs[1].regionAr}
                </span>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 text-right space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">نقاط الأسبوع:</span>
                    <span className="font-black text-slate-800 dark:text-slate-100">
                      {top3Govs[1].weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">الطلاب المتنافسون:</span>
                    <span className="font-black text-blue-500">{top3Govs[1].activeStudents} طالب</span>
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold truncate pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    سفير المحافظة: {top3Govs[1].topStudentAmbassador.name}
                  </div>
                </div>
              </div>
            )}

            {/* #1 GOLD NATIONAL EXCELLENCE SHIELD */}
            {top3Govs[0] && (
              <div className="order-1 md:order-2 bg-gradient-to-t from-amber-200/80 via-white to-amber-50 dark:from-amber-950/60 dark:via-[#132342] dark:to-[#0F1D38] rounded-3xl p-7 border-2 border-amber-400 shadow-2xl shadow-amber-500/30 flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1.5 md:-mt-4">
                <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md">
                  🏆 متصدر الجمهورية الحالي
                </div>
                <div className="text-5xl mb-2">{top3Govs[0].emblemEmoji}</div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">
                  محافظة {top3Govs[0].nameAr}
                </h3>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                  حامل درع التفوق الجمهوري الذهبي 🇪🇬
                </span>
                <div className="mt-4 w-full bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl p-3.5 border border-amber-500/30 text-right space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">إجمالي النقاط الأسبوعية:</span>
                    <span className="font-black text-amber-400 text-sm">
                      {top3Govs[0].weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">الفرسان النشطون:</span>
                    <span className="font-black text-white">{top3Govs[0].activeStudents} بطل</span>
                  </div>
                  <div className="text-xs text-amber-300 font-black truncate pt-1 border-t border-amber-500/20">
                    👑 السفير: {top3Govs[0].topStudentAmbassador.name} ({top3Govs[0].topStudentAmbassador.school})
                  </div>
                </div>
              </div>
            )}

            {/* #3 BRONZE SHIELD */}
            {top3Govs[2] && (
              <div className="order-3 bg-gradient-to-t from-amber-100/70 via-white to-orange-50 dark:from-amber-950/40 dark:via-[#101C33] dark:to-slate-800 rounded-3xl p-6 border-2 border-amber-600/40 shadow-xl flex flex-col items-center text-center relative overflow-hidden transition-all hover:-translate-y-1">
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-amber-600 text-white text-[11px] font-black">
                  🥉 المركز #3
                </div>
                <div className="text-4xl mb-2">{top3Govs[2].emblemEmoji}</div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  محافظة {top3Govs[2].nameAr}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  عاصمتها: {top3Govs[2].capitalAr} • {top3Govs[2].regionAr}
                </span>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 text-right space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">نقاط الأسبوع:</span>
                    <span className="font-black text-slate-800 dark:text-slate-100">
                      {top3Govs[2].weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">الطلاب المتنافسون:</span>
                    <span className="font-black text-blue-500">{top3Govs[2].activeStudents} طالب</span>
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold truncate pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    سفير المحافظة: {top3Govs[2].topStudentAmbassador.name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH & REGION FILTERS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-[#101b33] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن محافظتك أو مدرستك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {regionOptions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setGovRegionFilter(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    govRegionFilter === r.id
                      ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* FULL GOVERNORATES RANKING TABLE */}
          <div className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>جدول ترتيب محافظات مصر الـ 27 في دوري الإنجليزي</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                تُحدث النتائج تلقائياً مع كل كويز
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGovernorates.map((gov) => {
                const isUserGov = gov.isUserGovernorate;
                return (
                  <div
                    key={gov.id}
                    className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isUserGov
                        ? "bg-blue-50/90 dark:bg-blue-950/60 border-r-4 border-r-blue-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        gov.rank === 1
                          ? "bg-amber-400 text-slate-950 shadow-md"
                          : gov.rank === 2
                          ? "bg-slate-300 text-slate-950"
                          : gov.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}>
                        #{gov.rank}
                      </span>

                      <span className="text-2xl">{gov.emblemEmoji}</span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            محافظة {gov.nameAr}
                          </h4>
                          {isUserGov && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                              محافظتك 🇪🇬
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                            {gov.regionAr}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          المدرسة الأولى: <span className="font-bold text-slate-700 dark:text-slate-300">{gov.topSchool}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">الفرسان النشطون</span>
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{gov.activeStudents} طالب</span>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <span className="text-[10px] text-slate-400 block font-bold">نقاط الأسبوع</span>
                        <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                          {gov.weeklyXp.toLocaleString()} XP
                        </span>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {gov.shieldNameAr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: SCHOOLS LEAGUE (Top Secondary & Prep Schools Across Egypt)
      ========================================================================= */}
      {activeTab === "schools" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-blue-900/40 border border-emerald-500/30 rounded-3xl p-5 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🏫
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black mb-1">
                  <Building2 className="w-3 h-3" />
                  <span>دوري مدارس الجمهورية:</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white">
                  منافسة شريفة بين مدارس المتفوقين STEM والثانوي العام واللغات
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  اجعل مدرستك في قائمة الشرف البلاتينية وارفع اسم محافظتك عالياً!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              تسجيل أو تغيير اسم مدرستي 🏫
            </button>
          </div>

          {/* SCHOOLS TABLE */}
          <div className="bg-white dark:bg-[#101C33] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" />
                <span>أفضل 10 مدارس تفوقاً في دوري الأكاديمية</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                تصنيف بلاتيني • ذهبي • فضي
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchools.map((sch) => {
                const isUserSchool = sch.isUserSchool;
                return (
                  <div
                    key={sch.id}
                    className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isUserSchool
                        ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-r-4 border-r-emerald-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        sch.rank === 1
                          ? "bg-amber-400 text-slate-950 shadow-md"
                          : sch.rank === 2
                          ? "bg-slate-300 text-slate-950"
                          : sch.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}>
                        #{sch.rank}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            {sch.name}
                          </h4>
                          {isUserSchool && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                              مدرستك 🏫
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="text-blue-500 font-bold">{sch.governorateNameAr}</span>
                          <span>•</span>
                          <span>{sch.typeLabelAr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">الطلاب المسجلون</span>
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{sch.activeStudents} طالب</span>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="text-[10px] text-slate-400 block font-bold">نقاط الأسبوع</span>
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {sch.weeklyXp.toLocaleString()} XP
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                        sch.badge === "platinum"
                          ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30"
                          : sch.badge === "gold"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                        {sch.badgeLabelAr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STICKY FOOTER ACTION ROW */}
      <div className="sticky bottom-4 z-40 bg-gradient-to-r from-[#0E1E38] via-[#162D55] to-[#0E1E38] border-2 border-[#EABF58] rounded-3xl p-4 md:p-5 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shrink-0">
            {activeTab === "students" ? `#${userRow?.rank || 1}` : "🇪🇬"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 uppercase">
                {activeTab === "students" ? "ترتيبك في لوحة الشرف الأسبوعية" : "مشاركتك في دوري المحافظات"}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                ({(userRow?.weeklyXp || 740).toLocaleString()} XP هذا الأسبوع)
              </span>
            </div>
            <p className="text-xs md:text-sm font-bold text-white mt-0.5">
              {activeTab === "students" ? (
                userRow && userRow.rank <= 3 ? (
                  <span className="text-emerald-400 font-black">🎉 رائع جداً! أنت ضمن الثلاثة الأوائل على مستوى الدفعة.</span>
                ) : (
                  <span>
                    يفصلك <span className="text-amber-300 font-black">{userRow?.pointsToNextRank || 35} XP</span> فقط عن المركز السابق!
                  </span>
                )
              ) : (
                <span>
                  أنت تمثل <span className="text-amber-300 font-black">محافظة {userLeague?.governorateNameAr || "الدقهلية"}</span> في المركز #{userLeague?.governorateRank || 1}!
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
              <span>حل كويز لرفع نقاط محافظتك ومدرستك ⚡</span>
            </button>
          )}

          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>كارت الفخر</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: CHANGE LEAGUE PROFILE (GOVERNORATE & SCHOOL)
      ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101b33] rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>اختر محافظتك ومدرستك للمنافسة في الدوري</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
              <span>احصل على +50 XP هدية فورية تضاف لرصيدك عند الانضمام لدوري محافظتك ومدرستك!</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المحافظة (اختر من بين 27 محافظة):
                </label>
                <select
                  value={selectedGovInput}
                  onChange={(e) => setSelectedGovInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EGYPTIAN_GOVERNORATES.map((g) => (
                    <option key={g.id} value={g.nameAr}>
                      {g.emblemEmoji} محافظة {g.nameAr} ({g.regionAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المدرسة / الإدارة التعليمية:
                </label>
                <input
                  type="text"
                  placeholder="مثال: مدرسة المنصورة الثانوية بنين أو STEM المعادي..."
                  value={schoolInput}
                  onChange={(e) => setSchoolInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {savingProfile ? "جاري الحفظ..." : "تأكيد والانضمام للدوري 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VIRAL SOCIAL / WHATSAPP SHARE CARD
      ========================================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101b33] rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <span>كارت فخر المحافظة والمدرسة للمشاركة الفيروسية</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* PREVIEW DIGITAL BADGE CARD */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0F1D38] via-[#12284D] to-[#0A162B] text-white border-2 border-amber-400 shadow-xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  🇪🇬 دوري إنجليزي مستر حبيب الرحمن 2026
                </div>
                <span className="text-2xl">🏆</span>
              </div>

              <div>
                <h4 className="text-lg font-black text-white">
                  {user?.name || "طالب الأكاديمية"}
                </h4>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  بطل محافظة {userLeague?.governorateNameAr || "الدقهلية"} • {userLeague?.schoolName || "مدرسة المنصورة الثانوية"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">ترتيب المحافظة</span>
                  <span className="font-black text-amber-400 text-sm">المركز #{userLeague?.governorateRank || 1} 🥇</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">مساهمتي الأسبوعية</span>
                  <span className="font-black text-white text-sm">{(userRow?.weeklyXp || 740).toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            {/* SHARE ACTIONS */}
            <div className="space-y-3 pt-1">
              <a
                href={leagueData?.sharePayload?.whatsappUrl || `https://wa.me/?text=${encodeURIComponent("ادخل وتنافس في دوري مستر حبيب الرحمن")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>مشاركة مباشرة عبر واتساب (WhatsApp)</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleCopyShare}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-black">تم نسخ رسالة ورابط التحدي!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ نص الرسالة ورابط التحدي للمجموعات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyLeaderboardView;
