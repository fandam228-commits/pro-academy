"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Film,
  ChevronDown,
  Home,
  User,
  MessageSquare,
} from "lucide-react";

export const Navbar: React.FC<{ activeTab?: string; setActiveTab?: (tab: string) => void }> = ({
  activeTab = "home",
  setActiveTab,
}) => {
  const { user, lang, toggleLang, theme, toggleTheme, notificationsCount, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  const moreItems = [
    { id: "dialogues", labelAr: "مركز المحادثة الإنجليزية (94 محادثة)", labelEn: "Dialogue Center", icon: MessageSquare, badge: "جديد" },
    { id: "ministry_assessments", labelAr: "تقييمات الوزارة الرسمية", labelEn: "Ministry Assessments", icon: FileCheck, badge: "2027" },
    { id: "homework", labelAr: "الواجبات والتسليم", labelEn: "Homework & Tasks", icon: NotebookPen },
    { id: "attendance", labelAr: "الحضور والغياب (QR)", labelEn: "Attendance & QR", icon: ClipboardCheck },
    { id: "question_bank", labelAr: "بنك الأسئلة الذكي", labelEn: "Question Bank & Shuffle", icon: Database },
    { id: "pdfs", labelAr: "مكتبة مذكرات PDF", labelEn: "PDF Library", icon: FileText },
    { id: "grammar", labelAr: "شرح القواعد التفاعلي", labelEn: "Grammar Master", icon: BookOpen },
    { id: "placement", labelAr: "اختبار تحديد المستوى", labelEn: "Placement Test", icon: Sparkles },
    { id: "ai_assistant", labelAr: "المساعد الذكي (AI Tutor)", labelEn: "AI Tutor", icon: BrainCircuit },
    { id: "gamification", labelAr: "المتصدرون والأوسمة", labelEn: "Leaderboard & Badges", icon: Trophy },
    { id: "calendar", labelAr: "جدول الحصص والبث", labelEn: "Calendar & Live", icon: CalendarDays },
    { id: "analytics", labelAr: "التقارير والتحليلات", labelEn: "Analytics & Reports", icon: BarChart3 },
    { id: "blog", labelAr: "المدونة والنصائح", labelEn: "Blog & Tips", icon: FileText },
    { id: "faq", labelAr: "الأسئلة الشائعة والدعم", labelEn: "FAQ & Support", icon: ShieldCheck },
  ];

  const isMoreTabActive = moreItems.some((item) => item.id === activeTab);

  return (
    <>
      {/* =========================================================================
          DESKTOP & MOBILE TOP HEADER
      ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#0d1322]/95 border-b border-blue-100/80 dark:border-slate-800 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* BRAND LOGO */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigateTo("home")}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigateTo("home");
              }}
              className="flex items-center gap-3 group cursor-pointer select-none"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="font-black text-lg sm:text-xl tracking-tight text-[#243247] dark:text-white flex items-center gap-1.5">
                  <span>{lang === "ar" ? "أكاديمية المستر" : "Professional Academy"}</span>
                  <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-[#EABF58] text-[#243247] shadow-xs">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-[#718096] dark:text-slate-400">
                  {lang === "ar" ? "مع مستر حبيب الرحمن" : "Mr. Habib El Rahman"}
                </p>
              </div>
            </div>

            {/* STREAMLINED DESKTOP NAVIGATION (5 Primary Tabs + More Dropdown) */}
            <nav className="hidden xl:flex items-center gap-1.5 text-xs lg:text-sm font-bold text-[#243247] dark:text-slate-200">
              
              {/* 1. HOME */}
              <button
                onClick={() => navigateTo("home")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "home"
                    ? "bg-[#E8F3FF] text-[#2563EB] shadow-xs"
                    : "text-[#718096] hover:text-[#243247] hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
              </button>

              {/* 2. CURRICULUM & COURSES */}
              <button
                onClick={() => navigateTo("curriculum")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "curriculum" || activeTab === "courses"
                    ? "bg-[#E8F3FF] text-[#2563EB] shadow-xs"
                    : "text-[#718096] hover:text-[#243247] hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <span>{lang === "ar" ? "المناهج والكورسات" : "Courses & Syllabus"}</span>
              </button>

              {/* 3. TRANSLATION ACADEMY */}
              <button
                onClick={() => navigateTo("translation")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "translation"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20"
                    : "text-[#243247] hover:bg-[#E8F3FF] border border-blue-200/60"
                }`}
              >
                <Languages className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "أكاديمية الترجمة" : "Translation Academy"}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#EABF58] text-[#243247]">PRO</span>
              </button>

              {/* 4. TRAINING CENTER */}
              <button
                onClick={() => navigateTo("training_center")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "training_center"
                    ? "bg-[#E8F3FF] text-[#2563EB] shadow-xs"
                    : "text-[#718096] hover:text-[#243247] hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Trophy className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "التدريب والامتحانات" : "Training Center"}</span>
              </button>

              {/* 5. STORY WORLD */}
              <button
                onClick={() => navigateTo("story_world")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "story_world"
                    ? "bg-[#E8F3FF] text-[#2563EB] shadow-xs"
                    : "text-[#718096] hover:text-[#243247] hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Film className="w-4 h-4 text-indigo-500" />
                <span>{lang === "ar" ? "عالم القصص" : "Story World"}</span>
              </button>

              {/* 6. MORE DROPDOWN */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 font-bold ${
                    isMoreTabActive
                      ? "bg-[#E8F3FF] text-[#2563EB]"
                      : "text-[#718096] hover:text-[#243247] hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{lang === "ar" ? "المزيد" : "More"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {moreMenuOpen && (
                  <div className="absolute top-full end-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-800 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[11px] font-black text-[#718096] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                      {lang === "ar" ? "الأدوات والخدمات الإضافية" : "Academy Tools"}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-0.5 px-1.5">
                      {moreItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                              isCurrent
                                ? "bg-[#E8F3FF] text-[#2563EB]"
                                : "text-[#243247] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${isCurrent ? "text-[#2563EB]" : "text-[#718096]"}`} />
                              <span>{lang === "ar" ? item.labelAr : item.labelEn}</span>
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#EABF58] text-[#243247]">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </nav>

            {/* RIGHT ACTION CONTROLS */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* SEARCH */}
              <button
                onClick={() => navigateTo("search")}
                className={`p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                  activeTab === "search" ? "bg-[#E8F3FF] text-[#2563EB] border-blue-200" : "text-[#718096]"
                }`}
                title={lang === "ar" ? "البحث الشامل" : "Global Search"}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* USER STREAK & POINTS (WHEN LOGGED IN) */}
              {user && (
                <div className="hidden lg:flex items-center gap-2 bg-[#E8F3FF] border border-blue-200/80 px-3 py-1.5 rounded-full text-xs font-bold">
                  <div className="flex items-center gap-1 text-orange-500" title="Daily Streak">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                    <span>{user.streak || 1}d</span>
                  </div>
                  <div className="w-px h-3 bg-blue-200" />
                  <div className="flex items-center gap-1 text-[#2563EB]" title="Gamification Points">
                    <Award className="w-4 h-4 text-[#EABF58]" />
                    <span>{user.points || 150} pts</span>
                  </div>
                </div>
              )}

              {/* DOWNLOAD APP CTA */}
              <button
                onClick={() => navigateTo("download")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#F7F9FC] hover:bg-slate-100 text-[#243247] border border-slate-200 transition shadow-xs"
                title={lang === "ar" ? "تحميل التطبيق على هاتفك" : "Install mobile app"}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="hidden md:inline">{lang === "ar" ? "تطبيق الهاتف" : "Mobile App"}</span>
              </button>

              {/* LANGUAGE TOGGLE */}
              <button
                onClick={toggleLang}
                className="px-2.5 py-2 rounded-xl bg-[#F7F9FC] hover:bg-slate-100 text-[#243247] dark:text-slate-200 border border-slate-200 text-xs font-bold transition flex items-center gap-1"
                title="Toggle Language (AR/EN)"
              >
                <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{lang === "ar" ? "EN" : "عربي"}</span>
              </button>

              {/* THEME TOGGLE (OPTIONAL) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[#F7F9FC] hover:bg-slate-100 text-[#718096] border border-slate-200 transition"
                title="Toggle Dark/Light Mode"
              >
                {theme === "light" ? <Moon className="w-4 h-4 text-[#718096]" /> : <Sun className="w-4 h-4 text-[#EABF58]" />}
              </button>

              {/* NOTIFICATIONS */}
              <button
                onClick={() => navigateTo("notifications")}
                className="relative p-2.5 rounded-xl bg-[#F7F9FC] hover:bg-slate-100 text-[#718096] border border-slate-200 transition"
                title={lang === "ar" ? "الإشعارات" : "Notifications"}
              >
                <Bell className="w-4 h-4" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </button>

              {/* USER ACCOUNT BADGE / AUTH CTA */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo("dashboard")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E8F3FF] hover:bg-blue-100/80 text-[#2563EB] border border-blue-200 transition text-xs font-extrabold"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[90px] truncate hidden sm:inline">{user.name}</span>
                  </button>

                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                    }}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                    title={lang === "ar" ? "تسجيل الخروج" : "Log out"}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigateTo("auth")}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
                </button>
              )}

              {/* MOBILE HAMBURGER MENU TRIGGER */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2.5 rounded-xl bg-[#F7F9FC] text-[#243247] border border-slate-200"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* MOBILE FULL MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-8 space-y-2 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-3">
            {user ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#E8F3FF] border border-blue-200 mb-2">
                <div className="min-w-0">
                  <p className="font-black text-sm text-[#243247] truncate">{user.name}</p>
                  <p className="text-xs text-[#2563EB] font-bold">{user.role}</p>
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "خروج" : "Log out"}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo("auth")}
                className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md mb-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === "ar" ? "تسجيل الدخول / إنشاء حساب جديد" : "Sign In / Register"}</span>
              </button>
            )}

            {/* Core Links */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <button
                onClick={() => navigateTo("home")}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] font-bold text-xs text-[#243247]"
              >
                <Home className="w-4 h-4 text-[#2563EB]" />
                <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
              </button>

              <button
                onClick={() => navigateTo("curriculum")}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] font-bold text-xs text-[#243247]"
              >
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <span>{lang === "ar" ? "المناهج والقصة" : "Curriculum"}</span>
              </button>

              <button
                onClick={() => navigateTo("translation")}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 font-bold text-xs text-[#2563EB] border border-blue-200"
              >
                <Languages className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "أكاديمية الترجمة" : "Translation"}</span>
              </button>

              <button
                onClick={() => navigateTo("training_center")}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] font-bold text-xs text-[#243247]"
              >
                <Trophy className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "التدريب والامتحانات" : "Training"}</span>
              </button>

              <button
                onClick={() => navigateTo("story_world")}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] font-bold text-xs text-[#243247]"
              >
                <Film className="w-4 h-4 text-indigo-500" />
                <span>{lang === "ar" ? "عالم القصص" : "Story World"}</span>
              </button>

              <button
                onClick={() => navigateTo("ministry_assessments")}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] font-bold text-xs text-[#243247]"
              >
                <FileCheck className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "تقييمات الوزارة" : "Ministry Tests"}</span>
              </button>
            </div>

            {/* Extra items in drawer */}
            <div className="space-y-1 pt-1">
              {moreItems.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#243247] hover:bg-slate-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#718096]" />
                      <span>{lang === "ar" ? item.labelAr : item.labelEn}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          FIXED MOBILE BOTTOM NAVIGATION BAR (Home, Learning, Training, Translation, Account)
      ========================================================================= */}
      <nav
        aria-label="Mobile Navigation"
        className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 shadow-xl px-2 py-1.5 flex items-center justify-around safe-bottom"
      >
        {/* 1. HOME */}
        <button
          onClick={() => navigateTo("home")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === "home"
              ? "text-[#2563EB] font-black bg-[#E8F3FF] shadow-xs"
              : "text-[#718096] hover:text-[#243247]"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">{lang === "ar" ? "الرئيسية" : "Home"}</span>
        </button>

        {/* 2. LEARNING / CURRICULUM */}
        <button
          onClick={() => navigateTo("curriculum")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === "curriculum" || activeTab === "courses"
              ? "text-[#2563EB] font-black bg-[#E8F3FF] shadow-xs"
              : "text-[#718096] hover:text-[#243247]"
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">{lang === "ar" ? "المناهج" : "Learning"}</span>
        </button>

        {/* 3. TRAINING / PRACTICE */}
        <button
          onClick={() => navigateTo("training_center")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === "training_center" || activeTab === "question_bank"
              ? "text-[#2563EB] font-black bg-[#E8F3FF] shadow-xs"
              : "text-[#718096] hover:text-[#243247]"
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5 text-[#EABF58]" />
          <span className="text-[10px] leading-tight">{lang === "ar" ? "التدريب" : "Training"}</span>
        </button>

        {/* 4. TRANSLATION */}
        <button
          onClick={() => navigateTo("translation")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === "translation"
              ? "text-[#2563EB] font-black bg-[#E8F3FF] shadow-xs"
              : "text-[#718096] hover:text-[#243247]"
          }`}
        >
          <Languages className="w-5 h-5 mb-0.5 text-indigo-500" />
          <span className="text-[10px] leading-tight">{lang === "ar" ? "الترجمة" : "Translate"}</span>
        </button>

        {/* 5. MY ACCOUNT */}
        <button
          onClick={() => navigateTo(user ? "dashboard" : "auth")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === "dashboard" || activeTab === "auth"
              ? "text-[#2563EB] font-black bg-[#E8F3FF] shadow-xs"
              : "text-[#718096] hover:text-[#243247]"
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {user ? (lang === "ar" ? "حسابي" : "Account") : (lang === "ar" ? "دخول" : "Sign In")}
          </span>
        </button>
      </nav>
    </>
  );
};
