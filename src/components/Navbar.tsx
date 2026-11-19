"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { HeaderGamificationPill } from "@/components/gamification/HeaderGamificationPill";
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
  FileCheck,
  Languages,
  Film,
  ChevronDown,
  Home,
  User,
  MessageSquare,
  AlertTriangle,
  Layers,
  QrCode,
  CreditCard,
  Swords,
  Compass,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = "home", setActiveTab }) => {
  const { user, lang, toggleLang, theme, toggleTheme, notificationsCount, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [unresolvedMistakes, setUnresolvedMistakes] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch mistakes count quietly for badge
  useEffect(() => {
    let isMounted = true;
    async function checkMistakes() {
      try {
        const res = await fetch("/api/mistakes?limit=1");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.stats?.totalUnresolved !== undefined) {
            setUnresolvedMistakes(data.stats.totalUnresolved);
          }
        }
      } catch {}
    }
    if (user) checkMistakes();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (tab: string, path?: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    if (path) {
      router.push(path);
      return;
    }

    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      router.push(tab === "home" ? "/" : `/?tab=${tab}`);
    }
  };

  // ---------------------------------------------------------------------------
  // INFORMATION ARCHITECTURE: 5 PRIMARY PILLARS & THEIR CATEGORIZED MODULES
  // ---------------------------------------------------------------------------

  // Pillar 2: التعلم (Learning)
  const learningItems = [
    {
      id: "curriculum",
      labelAr: "المناهج والصفوف الرسمية",
      labelEn: "Official Curriculum & Units",
      descAr: "وحدات المنهج، القواعد، الكلمات، وركن القصة للمراحل الست",
      descEn: "Standardized units, grammar, vocabulary & novel analysis",
      icon: BookOpen,
      badge: "2027",
    },
    {
      id: "courses",
      labelAr: "الكورسات والمحاضرات",
      labelEn: "Master Courses & Lectures",
      descAr: "تصفح باقات الثانوية والإعدادية وتفاصيل الوحدات",
      descEn: "Explore secondary and prep master lecture tracks",
      icon: Compass,
    },
    {
      id: "pdfs",
      labelAr: "مكتبة مذكرات PDF المحمية",
      labelEn: "Protected PDF Library",
      descAr: "تحميل مذكرات الشرح وبنوك الأسئلة المعتمدة",
      descEn: "Secure lecture notes, booklets and revision PDFs",
      icon: FileText,
      badge: "مذكرات",
    },
    {
      id: "calendar",
      labelAr: "قاعة البث المباشر (Google Meet)",
      labelEn: "Live Classroom & Schedule",
      descAr: "حصص الأونلاين التفاعلية وجدول مواعيد المجموعات",
      descEn: "Interactive live classes and group session schedule",
      icon: CalendarDays,
      badge: "مباشر",
    },
    {
      id: "grammar",
      labelAr: "شروحات القواعد التفاعلية",
      labelEn: "Grammar Video Master",
      descAr: "شرح تفصيلي لكل أزمنة وقواعد اللغة بالصوت والصورة",
      descEn: "Comprehensive video drills for all English grammar tenses",
      icon: BrainCircuit,
    },
  ];

  // Pillar 3: الاختبارات والتدريب (Exams & Training)
  const examsItems = [
    {
      id: "training_center",
      labelAr: "مركز التدريب والامتحانات",
      labelEn: "Professional Training Center",
      descAr: "أكثر من 894 سؤال مصنف بنظام التبديل الذكي ضد التسريب",
      descEn: "Standardized MCQ training powered by anti-leak shuffle engine",
      icon: Trophy,
      badge: "894+ سؤال",
    },
    {
      id: "question_bank",
      labelAr: "بنك الأسئلة ومولد الامتحانات",
      labelEn: "Smart Exam Generator",
      descAr: "توليد امتحان فوري مخصص حسب الوحدة ونسبة الصعوبة",
      descEn: "Instant customized tests by unit, grade and difficulty",
      icon: Database,
    },
    {
      id: "mistakes_bank",
      labelAr: "بنك أخطائي الذكي",
      labelEn: "Smart Mistakes Bank",
      descAr: "تسجيل الأخطاء تلقائياً وإعادة التدريب عليها حتى الإتقان",
      descEn: "Auto-logs mistakes and prompts smart retry until mastered",
      icon: AlertTriangle,
      badge: unresolvedMistakes > 0 ? `${unresolvedMistakes} خطأ` : "تلقائي",
      badgeVariant: "alert",
    },
    {
      id: "exam_simulator",
      labelAr: "محاكي الامتحانات الشامل",
      labelEn: "Exam Simulator (3 Hours)",
      descAr: "محاكاة واقعية لبوكليت الثانوية العامة بمؤقت رسمي 3 ساعات",
      descEn: "Real-time 3-hour exam simulation with automatic scoring",
      icon: GraduationCap,
      badge: "3 ساعات",
    },
    {
      id: "ministry_assessments",
      labelAr: "تقييمات الوزارة الرسمية 2026/2027",
      labelEn: "Official MOE Assessments",
      descAr: "الأداءات الصفية والواجبات المنزلية والتقييمات الأسبوعية",
      descEn: "Official weekly sheets and classroom ministry performance",
      icon: FileCheck,
      badge: "وزاري",
    },
    {
      id: "homework",
      labelAr: "الواجبات والتسليم الفوري",
      labelEn: "Homework & Tasks",
      descAr: "رفع إجابات الواجب والمتابعة والتصحيح الأكاديمي",
      descEn: "Submit homework sheets and review teacher evaluations",
      icon: NotebookPen,
    },
    {
      id: "attendance",
      labelAr: "حضور وغياب السنتر (QR)",
      labelEn: "Center Attendance (QR)",
      descAr: "تسجيل الحضور عبر كاميرا الباركود وتتبع الغياب",
      descEn: "Live camera QR check-in and attendance history",
      icon: ClipboardCheck,
    },
    {
      id: "placement",
      labelAr: "اختبار تحديد المستوى التكيفي",
      labelEn: "Adaptive Placement Test",
      descAr: "اختبار ذكي يحدد مستواك الدراسي الدقيق في دقائق",
      descEn: "Adaptive placement algorithm for instant CEFR benchmarking",
      icon: Sparkles,
    },
  ];

  // Pillar 4: عالم اللغة (Language World)
  const languageItems = [
    {
      id: "translation",
      labelAr: "أكاديمية الترجمة الاحترافية",
      labelEn: "Translation Academy",
      descAr: "8 مسارات تدريبية و14 نمط أسئلة مع تقييم بالمعايير الخمسة",
      descEn: "8 structured modules with rubric-based bilingual feedback",
      icon: Languages,
      badge: "PRO",
    },
    {
      id: "essay_lab",
      labelAr: "مختبر المقال والفقرة",
      labelEn: "Essay & Paragraph Lab",
      descAr: "بنك قوالب المقالات وروابط الجمل وتصحيح كتابي فوري",
      descEn: "Essay templates, transitional connectors & instant rubrics",
      icon: FileText,
      badge: "+30 XP",
    },
    {
      id: "dialogues",
      labelAr: "مركز المحادثة الإنجليزية",
      labelEn: "Dialogue Mastery Center",
      descAr: "94 محادثة وزارية معتمدة لجميع صفوف المرحلة الإعدادية",
      descEn: "94 authentic ministerial dialogues with AI practice",
      icon: MessageSquare,
      badge: "94 محادثة",
    },
    {
      id: "story_world",
      labelAr: "عالم القصص والروايات الأدبية",
      labelEn: "Literature & Story World",
      descAr: "العجوز والبحر، حول العالم، مونت كريستو، وThe Lost World",
      descEn: "Audio narrations, character maps & critical thinking drills",
      icon: Film,
      badge: "روايات",
    },
    {
      id: "vocabulary_bank",
      labelAr: "بنك المفردات والتعبيرات الأكاديمي",
      labelEn: "Vocabulary Master Bank",
      descAr: "قاموس كلمات المنهج، المتلازمات، وحروف الجر بدقة",
      descEn: "Master bank of collocations, prepositions and idioms",
      icon: BookOpen,
    },
    {
      id: "flashcards",
      labelAr: "فلاش كاردز التكرار المتباعد (SRS)",
      labelEn: "Spaced Repetition Flashcards",
      descAr: "تثبيت الكلمات الصعبة بالصوت والنطق البريطاني السليم",
      descEn: "SRS flashcard deck with native British pronunciation audio",
      icon: Layers,
      badge: "SRS",
    },
    {
      id: "ai_assistant",
      labelAr: "المساعد الذكي (Habib AI Tutor)",
      labelEn: "Habib AI Tutor",
      descAr: "اسأل أي سؤال في الإنجليزي واحصل على شرح فوري مبسط",
      descEn: "24/7 dedicated AI English tutor for instant explanations",
      icon: BrainCircuit,
    },
  ];

  // Pillar 5: حسابي (My Account)
  const accountItems = [
    {
      id: "dashboard",
      labelAr: "لوحة متابعة الطالب",
      labelEn: "Student Dashboard",
      descAr: "نظرة عامة على كورساتك الحالية وتقدمك التعليمي",
      descEn: "Your courses, current lecture and learning progress",
      icon: User,
    },
    {
      id: "leaderboard",
      labelAr: "لوحة الشرف والأوائل (XP)",
      labelEn: "Weekly Leaderboard & XP",
      descAr: "ترتيبك بين زملائك على مستوى الجمهورية ونقاط التميز",
      descEn: "Weekly top students, XP points and regional ranking",
      icon: Trophy,
      badge: "أوائل",
    },
    {
      id: "challenge",
      path: "/dashboard/challenge",
      labelAr: "تحدي الأصدقاء 1v1",
      labelEn: "1v1 Peer Challenge",
      descAr: "أنشئ رابط تحدي 5 أسئلة بـ 90 ثانية وشاركه على واتساب",
      descEn: "Create and share 5-question timed head-to-head battles",
      icon: Swords,
      badge: "تحدي",
    },
    {
      id: "my_qr",
      labelAr: "بطاقة الطالب الذكية (Digital QR ID)",
      labelEn: "Student Digital QR ID",
      descAr: "باركود الطالب الرقمي لتسجيل الحضور واستلام المذكرات",
      descEn: "Official digital student ID badge for center check-in",
      icon: QrCode,
      badge: "ID",
    },
    {
      id: "activate",
      labelAr: "شحن كروت المنصة الفورية",
      labelEn: "Redeem Voucher Card",
      descAr: "تفعيل اشتراك الكورس عبر إدخال كود الكارت أو مسحه",
      descEn: "Redeem prepaid course vouchers via scratch code or QR",
      icon: CreditCard,
      badge: "شحن",
    },
    {
      id: "report",
      labelAr: "تقرير درجات ولي الأمر الذكي",
      labelEn: "Smart Parent Report",
      descAr: "مؤشرات الحضور، نتائج الامتحانات، والتقرير الشامل للأسرة",
      descEn: "Attendance rates, exam scores and parent progress digests",
      icon: FileCheck,
    },
    {
      id: "notifications",
      labelAr: "مركز الإشعارات الفورية",
      labelEn: "Notifications Center",
      descAr: "تنبيهات الحصص الجديدة، نتائج الامتحانات، ورسائل المستر",
      descEn: "Live announcements, exam results and class alerts",
      icon: Bell,
      badge: notificationsCount > 0 ? String(notificationsCount) : undefined,
    },
  ];

  // Active pillar detection
  const isLearningActive = learningItems.some((i) => i.id === activeTab);
  const isExamsActive = examsItems.some((i) => i.id === activeTab);
  const isLanguageActive = languageItems.some((i) => i.id === activeTab);
  const isAccountActive =
    activeTab === "dashboard" ||
    activeTab === "leaderboard" ||
    activeTab === "my_qr" ||
    activeTab === "activate" ||
    activeTab === "report" ||
    activeTab === "parent_report" ||
    pathname?.startsWith("/dashboard");

  return (
    <>
      {/* =========================================================================
          DESKTOP & MOBILE TOP HEADER
      ========================================================================= */}
      <header
        ref={dropdownRef}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#0B1528]/95 border-b border-blue-100/80 dark:border-slate-800 transition-colors shadow-xs"
      >
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
              className="flex items-center gap-3 group cursor-pointer select-none shrink-0"
              aria-label="الرئيسية - Professional Academy"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0E1E38] dark:bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform border border-amber-400/40">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-[#EABF58]" />
              </div>
              <div>
                <div className="font-black text-lg sm:text-xl tracking-tight text-[#0E1E38] dark:text-white flex items-center gap-1.5 font-sans">
                  <span>{lang === "ar" ? "أكاديمية المستر" : "Professional Academy"}</span>
                  <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-[#EABF58] text-[#0E1E38] shadow-xs">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-[#718096] dark:text-slate-400">
                  {lang === "ar" ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}
                </p>
              </div>
            </div>

            {/* =====================================================================
                STREAMLINED 5-PILLAR NAVIGATION (DESKTOP)
                1. الرئيسية • 2. التعلم • 3. الاختبارات والتدريب • 4. عالم اللغة • 5. حسابي
            ===================================================================== */}
            <nav className="hidden xl:flex items-center gap-1.5 text-xs lg:text-sm font-bold text-[#243247] dark:text-slate-200">
              
              {/* 1. الرئيسية (Home) */}
              <button
                onClick={() => navigateTo("home")}
                className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "home" && !isLearningActive && !isExamsActive && !isLanguageActive && !isAccountActive
                    ? "bg-[#E8F3FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 font-black shadow-xs"
                    : "text-[#718096] dark:text-slate-300 hover:text-[#0E1E38] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
              </button>

              {/* 2. التعلم (Learning) — Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "learning" ? null : "learning")}
                  className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLearningActive || activeDropdown === "learning"
                      ? "bg-[#E8F3FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 font-black shadow-xs"
                      : "text-[#718096] dark:text-slate-300 hover:text-[#0E1E38] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                  aria-expanded={activeDropdown === "learning"}
                >
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <span>{lang === "ar" ? "التعلم" : "Learning"}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === "learning" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "learning" && (
                  <div className="absolute top-full start-0 mt-2 w-[420px] bg-white dark:bg-[#0D1829] rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-black text-[#2563EB] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {lang === "ar" ? "المناهج والمحاضرات الدراسية" : "Courses & Syllabus"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">5 خدمات</span>
                    </div>

                    <div className="space-y-1">
                      {learningItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full text-right rtl:text-right ltr:text-left p-2.5 rounded-xl transition flex items-start gap-3 cursor-pointer group ${
                              isCurrent
                                ? "bg-[#E8F3FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-200"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[#243247] dark:text-slate-200"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-[#2563EB]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-xs group-hover:text-[#2563EB] transition-colors truncate">
                                  {lang === "ar" ? item.labelAr : item.labelEn}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#EABF58] text-[#0E1E38] shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {lang === "ar" ? item.descAr : item.descEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. الاختبارات والتدريب (Exams & Practice) — Mega Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "exams" ? null : "exams")}
                  className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isExamsActive || activeDropdown === "exams"
                      ? "bg-[#E8F3FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 font-black shadow-xs"
                      : "text-[#718096] dark:text-slate-300 hover:text-[#0E1E38] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                  aria-expanded={activeDropdown === "exams"}
                >
                  <Trophy className="w-4 h-4 text-[#EABF58]" />
                  <span>{lang === "ar" ? "الاختبارات والتدريب" : "Exams & Practice"}</span>
                  {unresolvedMistakes > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="أخطاء غير محلولة" />
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === "exams" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "exams" && (
                  <div className="absolute top-full start-1/2 -translate-x-1/2 rtl:translate-x-1/2 mt-2 w-[540px] bg-white dark:bg-[#0D1829] rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-800 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-black text-[#2563EB] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-[#EABF58]" />
                        {lang === "ar" ? "منظومة التقييم والامتحانات الذكية" : "Testing & Assessments"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">8 أدوات تقييم</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {examsItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full text-right rtl:text-right ltr:text-left p-2.5 rounded-xl transition flex items-start gap-2.5 cursor-pointer group ${
                              isCurrent
                                ? "bg-[#E8F3FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-200"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[#243247] dark:text-slate-200"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-[#2563EB]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-xs group-hover:text-[#2563EB] transition-colors truncate">
                                  {lang === "ar" ? item.labelAr : item.labelEn}
                                </span>
                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-black shrink-0 ${
                                      item.badgeVariant === "alert"
                                        ? "bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-300"
                                        : "bg-[#EABF58] text-[#0E1E38]"
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {lang === "ar" ? item.descAr : item.descEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. عالم اللغة (Language World) — Mega Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "language" ? null : "language")}
                  className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLanguageActive || activeDropdown === "language"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-600/20"
                      : "text-[#243247] dark:text-slate-200 hover:bg-[#E8F3FF] dark:hover:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700"
                  }`}
                  aria-expanded={activeDropdown === "language"}
                >
                  <Languages className={`w-4 h-4 ${isLanguageActive ? "text-[#EABF58]" : "text-[#2563EB]"}`} />
                  <span>{lang === "ar" ? "عالم اللغة" : "Language World"}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#EABF58] text-[#0E1E38]">
                    PRO
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === "language" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "language" && (
                  <div className="absolute top-full start-1/2 -translate-x-1/2 rtl:translate-x-1/2 mt-2 w-[520px] bg-white dark:bg-[#0D1829] rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-800 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-black text-[#2563EB] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-[#EABF58]" />
                        {lang === "ar" ? "أكاديمية اللغة والمهارات الإنجليزية" : "Language Mastery Hub"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">7 أدوات لغوية</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {languageItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full text-right rtl:text-right ltr:text-left p-2.5 rounded-xl transition flex items-start gap-2.5 cursor-pointer group ${
                              isCurrent
                                ? "bg-[#E8F3FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-200"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[#243247] dark:text-slate-200"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-indigo-600 dark:text-indigo-400">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-xs group-hover:text-[#2563EB] transition-colors truncate">
                                  {lang === "ar" ? item.labelAr : item.labelEn}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#EABF58] text-[#0E1E38] shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {lang === "ar" ? item.descAr : item.descEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. حسابي (My Account) — User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "account" ? null : "account")}
                  className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAccountActive || activeDropdown === "account"
                      ? "bg-[#E8F3FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 font-black shadow-xs"
                      : "text-[#718096] dark:text-slate-300 hover:text-[#0E1E38] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                  aria-expanded={activeDropdown === "account"}
                >
                  <User className="w-4 h-4 text-[#2563EB]" />
                  <span>{user ? (user.name?.split(" ")[0] || (lang === "ar" ? "حسابي" : "Account")) : (lang === "ar" ? "حسابي" : "Account")}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === "account" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "account" && (
                  <div className="absolute top-full end-0 mt-2 w-80 bg-white dark:bg-[#0D1829] rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {user ? (
                      <>
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 mb-2 border border-blue-100/60 dark:border-slate-700">
                          <p className="font-black text-sm text-[#0E1E38] dark:text-white truncate">{user.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                              {user.role}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                              {user.grade || "الثانوية العامة"}
                            </span>
                          </div>
                        </div>

                        {/* Admin / Teacher direct button if applicable */}
                        {(user.role === "admin" || user.role === "teacher") && (
                          <a
                            href="/admin"
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-300 dark:border-amber-500/40 text-slate-900 dark:text-amber-200 text-xs font-black transition mb-2"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span>لوحة تحكم مستر حبيب الرحمن</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                          </a>
                        )}

                        <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
                          {accountItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => navigateTo(item.id, item.path)}
                                className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#243247] dark:text-slate-200 cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-[#2563EB]" />
                                  <span>{lang === "ar" ? item.labelAr : item.labelEn}</span>
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#EABF58] text-[#0E1E38]">
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                            <button
                              onClick={async () => {
                                setActiveDropdown(null);
                                await logout();
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>{lang === "ar" ? "تسجيل الخروج" : "Log out"}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#0E1E38] dark:text-white">
                            {lang === "ar" ? "مرحباً بك في الأكاديمية" : "Welcome to Pro Academy"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {lang === "ar" ? "سجل دخولك لمتابعة دروسك وامتحاناتك ونقاطك" : "Sign in to track lectures and exams"}
                          </p>
                        </div>
                        <button
                          onClick={() => navigateTo("auth")}
                          className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>{lang === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Register"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </nav>

            {/* =====================================================================
                RIGHT CONTROLS: SEARCH, XP PILL, NOTIFICATIONS, LANG, MOBILE TRIGGER
            ===================================================================== */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {/* SEARCH BUTTON */}
              <button
                onClick={() => navigateTo("search")}
                className={`p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                  activeTab === "search" ? "bg-[#E8F3FF] text-[#2563EB] border-blue-200" : "text-[#718096] dark:text-slate-300"
                }`}
                title={lang === "ar" ? "البحث الشامل في المنصة" : "Global Search"}
                aria-label="Global Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* USER STREAK & XP BADGE */}
              {user && (
                <div className="hidden lg:flex items-center gap-2">
                  <HeaderGamificationPill onOpenLeaderboard={() => navigateTo("leaderboard")} />
                </div>
              )}

              {/* STAFF LINK TO /admin */}
              {user && (user.role === "admin" || user.role === "teacher") && (
                <a
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition"
                  title="لوحة تحكم مستر حبيب الرحمن"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة التحكم</span>
                </a>
              )}

              {/* NOTIFICATIONS */}
              <button
                onClick={() => navigateTo("notifications")}
                className="relative p-2.5 rounded-xl bg-[#F7F9FC] dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#718096] dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title={lang === "ar" ? "الإشعارات" : "Notifications"}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </button>

              {/* LANGUAGE TOGGLE */}
              <button
                onClick={toggleLang}
                className="px-2.5 py-2 rounded-xl bg-[#F7F9FC] dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0E1E38] dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Toggle Language (AR/EN)"
              >
                <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{lang === "ar" ? "EN" : "عربي"}</span>
              </button>

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[#F7F9FC] dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#718096] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Toggle Dark/Light Mode"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? <Moon className="w-4 h-4 text-[#718096]" /> : <Sun className="w-4 h-4 text-[#EABF58]" />}
              </button>

              {/* LOGIN / AUTH CTA (WHEN GUEST) */}
              {!user && (
                <button
                  onClick={() => navigateTo("auth")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E1E38] dark:bg-[#2563EB] hover:bg-[#162744] text-white font-extrabold text-xs shadow-md shadow-blue-900/15 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#EABF58]" />
                  <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
                </button>
              )}

              {/* MOBILE HAMBURGER MENU TRIGGER */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2.5 rounded-xl bg-[#F7F9FC] dark:bg-slate-800 text-[#0E1E38] dark:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* =====================================================================
            MOBILE / TABLET EXPANDABLE NAVIGATION DRAWER (ACCORDION STYLE)
        ===================================================================== */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#0D1829]/98 backdrop-blur-xl px-4 pt-4 pb-10 space-y-3 max-h-[82vh] overflow-y-auto animate-in fade-in slide-in-from-top-3">
            
            {/* User Profile Banner in Mobile Menu */}
            {user ? (
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#E8F3FF] dark:bg-blue-950/60 border border-blue-200/80 dark:border-slate-700">
                <div className="min-w-0">
                  <p className="font-black text-sm text-[#0E1E38] dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-[#2563EB] font-bold">{user.grade || user.role}</p>
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "خروج" : "Logout"}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo("auth")}
                className="w-full py-3 rounded-2xl bg-[#0E1E38] dark:bg-[#2563EB] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "تسجيل الدخول / إنشاء حساب جديد" : "Sign In / Register"}</span>
              </button>
            )}

            {/* Quick 1-Click Home */}
            <button
              onClick={() => navigateTo("home")}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-[#0E1E38] dark:text-white"
            >
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#2563EB]" />
                <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" />
            </button>

            {/* 1. التعلم (Learning Category) */}
            <div className="space-y-1 pt-1">
              <div className="px-2 text-[11px] font-black text-[#2563EB] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "1. التعلم والمناهج" : "1. Learning"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {learningItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-bold text-xs text-[#243247] dark:text-slate-200 border border-slate-100 dark:border-slate-700/60 text-right"
                    >
                      <Icon className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="truncate">{lang === "ar" ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. الاختبارات والتدريب (Exams Category) */}
            <div className="space-y-1 pt-2">
              <div className="px-2 text-[11px] font-black text-[#EABF58] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "2. الاختبارات والتدريب" : "2. Exams & Practice"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {examsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-bold text-xs text-[#243247] dark:text-slate-200 border border-slate-100 dark:border-slate-700/60 text-right"
                    >
                      <Icon className="w-4 h-4 text-[#EABF58] shrink-0" />
                      <span className="truncate">{lang === "ar" ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. عالم اللغة (Language Category) */}
            <div className="space-y-1 pt-2">
              <div className="px-2 text-[11px] font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Languages className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "3. عالم اللغة والمهارات" : "3. Language World"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languageItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-bold text-xs text-[#243247] dark:text-slate-200 border border-slate-100 dark:border-slate-700/60 text-right"
                    >
                      <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{lang === "ar" ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. حسابي وخدمات الطالب (Account Category) */}
            <div className="space-y-1 pt-2">
              <div className="px-2 text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "4. حسابي والخدمات" : "4. My Account"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id, item.path)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-bold text-xs text-[#243247] dark:text-slate-200 border border-slate-100 dark:border-slate-700/60 text-right"
                    >
                      <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{lang === "ar" ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Quick Button in mobile menu */}
            {user && (user.role === "admin" || user.role === "teacher") && (
              <div className="pt-2">
                <a
                  href="/admin"
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول لوحة تحكم مستر حبيب الرحمن الإدارية</span>
                </a>
              </div>
            )}

          </div>
        )}

      </header>
    </>
  );
};
