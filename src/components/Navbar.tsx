"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Moon,
  Sun,
  Globe,
  Flame,
  Award,
  Bell,
  Menu,
  X,
  BrainCircuit,
  Database,
  FileText,
  LogOut,
  LogIn,
  Trophy,
  CalendarDays,
  Search,
  NotebookPen,
  ClipboardCheck,
  BarChart3,
  Smartphone,
  BookMarked,
  FileCheck,
  Languages,
} from "lucide-react";

export const Navbar: React.FC<{ activeTab?: string; setActiveTab?: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, lang, toggleLang, theme, toggleTheme, notificationsCount, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-[#0d071d]/85 border-b border-purple-100/60 dark:border-purple-900/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (setActiveTab) setActiveTab("home");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && setActiveTab) setActiveTab("home");
            }}
            className="flex items-center gap-3 group cursor-pointer select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{lang === "ar" ? "أكاديمية المستر" : "Professional Academy"}</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border border-amber-300 shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {lang === "ar" ? "مع مستر حبيب الرحمن" : "Mr. Habib El Rahman Platform"}
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            <button
              onClick={() => setActiveTab && setActiveTab("home")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "home" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "الرئيسية" : "Home"}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("courses")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "courses" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "الكورسات والصفوف" : "Courses & Stages"}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("curriculum")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "curriculum" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookMarked className="w-4 h-4 text-purple-500" />
              <span>{lang === "ar" ? "المناهج والقصة" : "Curriculum & Story"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("translation")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "translation"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-md shadow-purple-600/30"
                  : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-300/40"
              }`}
            >
              <Languages className="w-4 h-4 text-amber-400" />
              <span>{lang === "ar" ? "أكاديمية الترجمة" : "Translation Academy"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("ministry_assessments")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "ministry_assessments" ? "bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-black shadow-sm border border-amber-300/40" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileCheck className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "تقييمات الوزارة" : "Ministry Assessments"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("homework")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "homework" ? "bg-sky-100/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <NotebookPen className="w-4 h-4 text-sky-500" />
              <span>{lang === "ar" ? "الواجبات" : "Homework"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("attendance")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "attendance" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-purple-500" />
              <span>{lang === "ar" ? "الحضور" : "Attendance"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("question_bank")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "question_bank" ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Database className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "بنك الأسئلة" : "Question Bank"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("pdfs")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "pdfs" ? "bg-sky-100/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4 text-sky-500" />
              <span>{lang === "ar" ? "مكتبة PDF" : "PDF Library"}</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab("grammar")}
              className={"px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 " + (activeTab === "grammar" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
            >
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>{lang === "ar" ? "شرح القواعد" : "Grammar Library"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("placement")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "placement" ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{lang === "ar" ? "اختبار المستوى" : "Placement Test"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("ai_assistant")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "ai_assistant" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              <span>{lang === "ar" ? "الذكاء الاصطناعي" : "AI Tutor"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("dashboard")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "dashboard" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("blog")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "blog" ? "bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "المدونة والنصائح" : "Blog & Tips"}
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* QUICK ACCESS: SEARCH / GAMIFICATION / CALENDAR */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab && setActiveTab("search")}
                className={`p-2 rounded-xl transition-all ${activeTab === "search" ? "bg-white dark:bg-slate-900 text-sky-500 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "البحث الشامل" : "Global Search"}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab("gamification")}
                className={`p-2 rounded-xl transition-all ${activeTab === "gamification" ? "bg-white dark:bg-slate-900 text-amber-500 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "الأوسمة والمتصدرون" : "Leaderboard & Badges"}
              >
                <Trophy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab("calendar")}
                className={`p-2 rounded-xl transition-all ${activeTab === "calendar" ? "bg-white dark:bg-slate-900 text-purple-500 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "التقويم والحصص المباشرة" : "Calendar & Live Sessions"}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab("analytics")}
                className={`p-2 rounded-xl transition-all ${activeTab === "analytics" ? "bg-white dark:bg-slate-900 text-purple-500 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "التقارير والتحليلات" : "Analytics & Reports"}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            {/* STREAK & POINTS (Gold Flame & Sky Points) */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-sky-500/15 dark:from-amber-950/30 dark:to-purple-950/30 border border-amber-300/40 dark:border-amber-700/40 px-3 py-1.5 rounded-full text-xs font-semibold">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Daily Streak">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{user.streak || 1}d</span>
                </div>
                <div className="w-px h-3 bg-amber-300 dark:bg-amber-700" />
                <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400" title="Gamification Points">
                  <Award className="w-4 h-4 text-sky-500" />
                  <span>{user.points || 150} pts</span>
                </div>
              </div>
            )}
            {/* DOWNLOAD APP CTA */}
            <button
              onClick={() => setActiveTab && setActiveTab("download")}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-all ${
                activeTab === "download"
                  ? "bg-purple-700 text-white"
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-purple-500/25"
              }`}
              title={lang === "ar" ? "تحميل التطبيق على الموبايل" : "Install mobile app"}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden lg:inline">{lang === "ar" ? "تحميل التطبيق" : "Get App"}</span>
            </button>

            {/* LANGUAGE TOGGLE */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 text-xs font-bold"
              title="Toggle Language (AR/EN)"
            >
              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{lang === "ar" ? "English" : "عربي"}</span>
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={() => setActiveTab && setActiveTab("notifications")}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {notificationsCount > 9 ? "9+" : notificationsCount}
                </span>
              )}
            </button>

            {/* USER CONTROLS: LOGGED-IN BADGE + LOGOUT OR SIGN-IN CTA */}
            {user ? (
              <>
                <div className="hidden xl:flex items-center gap-2 pr-1 border-r border-slate-200 dark:border-slate-700 mr-1">
                  <div className="max-w-[120px] text-end">
                    <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 transition-all font-bold text-xs whitespace-nowrap cursor-pointer"
                  title={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
                  aria-label={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{lang === "ar" ? "خروج" : "Log out"}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab && setActiveTab("auth")}
                className="inline-flex shrink-0 items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white shadow-md shadow-purple-600/20 font-extrabold text-xs whitespace-nowrap transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
              </button>
            )}

            {/* MOBILE MENU TRIGGER */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2">
          {user ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 mb-3">
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 transition-all font-bold text-xs"
                aria-label={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === "ar" ? "تسجيل الخروج" : "Log out"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveTab && setActiveTab("auth");
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg mb-3 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{lang === "ar" ? "تسجيل الدخول / إنشاء حساب جديد" : "Sign In / Register"}</span>
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab && setActiveTab("download");
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === "ar" ? "📱 تحميل التطبيق على تليفونك" : "📱 Install Mobile App"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("home");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200"
          >
            {lang === "ar" ? "الرئيسية" : "Home"}
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("curriculum");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <BookMarked className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "المناهج والقصة المقررة" : "Curriculum & Story"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("translation");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 border border-purple-400/30"
          >
            <Languages className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "أكاديمية الترجمة (Translation Academy)" : "Translation Academy"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("ministry_assessments");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2 border border-amber-400/30"
          >
            <FileCheck className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "تقييمات الوزارة الرسمية 2026/2027" : "Official Ministry Assessments"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("homework");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <NotebookPen className="w-4 h-4 text-sky-500" />
            <span>{lang === "ar" ? "الواجبات والتسليم" : "Homework"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("attendance");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "الحضور والغياب" : "Attendance"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("analytics");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "التقارير والتحليلات" : "Analytics & Reports"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("question_bank");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "بنك الأسئلة الذكي" : "Question Bank"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("pdfs");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-sky-500" />
            <span>{lang === "ar" ? "مكتبة ملفات PDF" : "PDF Library"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("grammar");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "شرح القواعد" : "Grammar Library"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("gamification");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "الأوسمة والمتصدرون" : "Leaderboard & Badges"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("calendar");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <CalendarDays className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "التقويم والحصص المباشرة" : "Calendar & Live Sessions"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("search");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-sky-500" />
            <span>{lang === "ar" ? "البحث الشامل" : "Global Search"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("faq");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{lang === "ar" ? "الأسئلة الشائعة والدعم" : "FAQ & Support"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("placement");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 text-amber-600 dark:text-amber-400"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "اختبار تحديد المستوى" : "Placement Test"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("ai_assistant");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Study Assistant"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200"
          >
            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
          </button>
        </div>
      )}

      {/* ALWAYS-VISIBLE LOGOUT ACTION: kept outside the crowded navigation row */}
      {user && (
        <button
          type="button"
          onClick={async () => {
            setMobileMenuOpen(false);
            await logout();
          }}
          className="fixed bottom-5 left-5 z-[100] inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-xl shadow-red-600/30 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
          title={lang === "ar" ? "تسجيل الخروج" : "Log out"}
          aria-label={lang === "ar" ? "تسجيل الخروج" : "Log out"}
        >
          <LogOut className="h-5 w-5" />
          <span>{lang === "ar" ? "تسجيل الخروج" : "Log out"}</span>
        </button>
      )}
    </header>
  );
};
