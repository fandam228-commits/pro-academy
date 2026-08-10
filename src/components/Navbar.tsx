"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Role } from "@/context/AppContext";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  BookOpen,
  UserCheck,
  Users,
  Moon,
  Sun,
  Globe,
  Flame,
  Award,
  Bell,
  Menu,
  X,
  ChevronDown,
  BrainCircuit,
  Database,
  FileText,
  LogOut,
  Trophy,
  CalendarDays,
  Search,
  NotebookPen,
  ClipboardCheck,
  BarChart3,
  Smartphone,
} from "lucide-react";

export const Navbar: React.FC<{ activeTab?: string; setActiveTab?: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, lang, toggleLang, theme, toggleTheme, switchRole, notificationsCount, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const rolesList: { role: Role; labelEn: string; labelAr: string; icon: any; color: string }[] = [
    { role: "admin", labelEn: "Super Admin", labelAr: "المشرف العام (أدمن)", icon: ShieldCheck, color: "text-purple-600 dark:text-purple-400" },
    { role: "teacher", labelEn: "Teacher", labelAr: "المعلم (Mr. Habib)", icon: GraduationCap, color: "text-blue-600 dark:text-blue-400" },
    { role: "student", labelEn: "Student", labelAr: "طالب (عمر محمود)", icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400" },
    { role: "parent", labelEn: "Parent", labelAr: "ولي الأمر (أبو عمر)", icon: Users, color: "text-amber-600 dark:text-amber-400" },
  ];

  const currentRoleInfo = rolesList.find((r) => r.role === user?.role) || rolesList[2];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{lang === "ar" ? "أكاديمية المستر" : "Professional Academy"}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  PRO
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {lang === "ar" ? "مع مستر حبيب الرحمن" : "Mr. Habib El Rahman Platform"}
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            <button
              onClick={() => setActiveTab && setActiveTab("home")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "home" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "الرئيسية" : "Home"}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("courses")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "courses" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "الكورسات والصفوف" : "Courses & Stages"}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("homework")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "homework" ? "bg-blue-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <NotebookPen className="w-4 h-4 text-emerald-500" />
              <span>{lang === "ar" ? "الواجبات" : "Homework"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("attendance")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "attendance" ? "bg-blue-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-teal-500" />
              <span>{lang === "ar" ? "الحضور" : "Attendance"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("question_bank")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "question_bank" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Database className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "بنك الأسئلة" : "Question Bank"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("pdfs")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "pdfs" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4 text-sky-500" />
              <span>{lang === "ar" ? "مكتبة PDF" : "PDF Library"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("placement")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "placement" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{lang === "ar" ? "اختبار المستوى" : "Placement Test"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("ai_assistant")}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "ai_assistant" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-indigo-500" />
              <span>{lang === "ar" ? "الذكاء الاصطناعي" : "AI Tutor"}</span>
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("dashboard")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "dashboard" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
            </button>

            <button
              onClick={() => setActiveTab && setActiveTab("blog")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "blog" ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang === "ar" ? "المدونة والنصائح" : "Blog & Tips"}
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* QUICK ACCESS: SEARCH / GAMIFICATION / CALENDAR */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab && setActiveTab("search")}
                className={`p-2 rounded-xl transition-all ${activeTab === "search" ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "البحث الشامل" : "Global Search"}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab("gamification")}
                className={`p-2 rounded-xl transition-all ${activeTab === "gamification" ? "bg-white dark:bg-slate-900 text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "الأوسمة والمتصدرون" : "Leaderboard & Badges"}
              >
                <Trophy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab("calendar")}
                className={`p-2 rounded-xl transition-all ${activeTab === "calendar" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "التقويم والحصص المباشرة" : "Calendar & Live Sessions"}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab("analytics")}
                className={`p-2 rounded-xl transition-all ${activeTab === "analytics" ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                title={lang === "ar" ? "التقارير والتحليلات" : "Analytics & Reports"}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            {/* STREAK & POINTS */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 dark:from-amber-950/30 dark:to-emerald-950/30 border border-amber-200 dark:border-amber-800/40 px-3 py-1.5 rounded-full text-xs font-semibold">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Daily Streak">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{user.streak || 1}d</span>
                </div>
                <div className="w-px h-3 bg-amber-300 dark:bg-amber-700" />
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Gamification Points">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>{user.points || 150} pts</span>
                </div>
              </div>
            )}

            {/* ROLE SWITCHER DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all"
                title="Switch Role Demo"
              >
                <currentRoleInfo.icon className={`w-4 h-4 ${currentRoleInfo.color}`} />
                <span className="hidden sm:inline">
                  {lang === "ar" ? currentRoleInfo.labelAr : currentRoleInfo.labelEn}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === "ar" ? "تبديل الصلاحية (معاينة)" : "Switch Role Context"}
                    </p>
                  </div>
                  {rolesList.map((r) => {
                    const Icon = r.icon;
                    const isSelected = user?.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setRoleMenuOpen(false);
                          if (setActiveTab) setActiveTab("dashboard");
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${r.color}`} />
                          <span>{lang === "ar" ? r.labelAr : r.labelEn}</span>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DOWNLOAD APP CTA */}
            <button
              onClick={() => setActiveTab && setActiveTab("download")}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-all ${
                activeTab === "download"
                  ? "bg-emerald-700 text-white"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-500/25"
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
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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

            {/* LOGGED-IN USER CHIP + LOGOUT */}
            {user && (
              <div className="hidden xl:flex items-center gap-2 pr-1 border-r border-slate-200 dark:border-slate-700 mr-1">
                <div className="max-w-[120px] text-end">
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 transition-all"
              title={lang === "ar" ? "تسجيل الخروج" : "Log Out"}
            >
              <LogOut className="w-4 h-4" />
            </button>

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
          <button
            onClick={() => {
              setActiveTab && setActiveTab("download");
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
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
              setActiveTab && setActiveTab("homework");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <NotebookPen className="w-4 h-4 text-emerald-500" />
            <span>{lang === "ar" ? "الواجبات والتسليم" : "Homework"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("attendance");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4 text-teal-500" />
            <span>{lang === "ar" ? "الحضور والغياب" : "Attendance"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("analytics");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-violet-500" />
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
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span>{lang === "ar" ? "التقويم والحصص المباشرة" : "Calendar & Live Sessions"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab && setActiveTab("search");
              setMobileMenuOpen(false);
            }}
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-blue-500" />
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
            className="w-full text-start px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 text-blue-600 dark:text-blue-400"
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
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
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
    </header>
  );
};
