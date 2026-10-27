"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlacementTestHub } from "@/components/PlacementTestHub";
import { AiAssistantWorkspace } from "@/components/AiAssistantWorkspace";
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { CourseDetailView } from "@/components/CourseDetailView";
import { CommunityChat } from "@/components/CommunityChat";
import { BlogView } from "@/components/BlogView";
import { QuestionBankWorkspace } from "@/components/QuestionBankWorkspace";
import { PdfLibraryWorkspace } from "@/components/PdfLibraryWorkspace";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthScreen } from "@/components/AuthScreen";
import { GamificationCenter } from "@/components/GamificationCenter";
import { CalendarView } from "@/components/CalendarView";
import { InfoPages } from "@/components/InfoPages";
import { GlobalSearch } from "@/components/GlobalSearch";
import { PwaManager } from "@/components/PwaManager";
import { HomeworkWorkspace } from "@/components/HomeworkWorkspace";
import { AttendanceWorkspace } from "@/components/AttendanceWorkspace";
import { NotificationCenter } from "@/components/NotificationCenter";
import { WeeklyReport } from "@/components/WeeklyReport";
import { AnalyticsReports } from "@/components/AnalyticsReports";
import { DownloadAppPage } from "@/components/DownloadAppPage";
import { GrammarLibrary } from "@/components/GrammarLibrary";
import { QuizPlayer } from "@/components/QuizPlayer";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Award,
  Flame,
  ArrowRight,
  Database,
  CheckCircle,
  ChevronRight,
  Shuffle,
  BrainCircuit,
  Heart,
  Smartphone,
} from "lucide-react";

function MainAppContent() {
  const { lang, user, authLoading } = useApp();
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeGeneratedExam, setActiveGeneratedExam] = useState<any>(null);
  const [infoSection, setInfoSection] = useState<string>("about");
  const [favorites, setFavorites] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("pa_favorites") || "[]"); } catch { return []; }
  });

  const toggleFavorite = (course: any) => {
    const exists = favorites.find((f) => f.id === course.id);
    const next = exists ? favorites.filter((f) => f.id !== course.id) : [...favorites, course];
    setFavorites(next);
    try { localStorage.setItem("pa_favorites", JSON.stringify(next)); } catch {}
  };

  // Read PWA shortcut tabs from URL (?tab=pdfs etc.)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        // The URL query is the source of truth for PWA deep links on first load.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab(tab);
      }
    } catch {}
  }, []);

  const handleTabChange = (tab: string) => {
    const infoTabs: Record<string, string> = { about: "about", faq: "faq", contact: "contact", privacy: "privacy", terms: "terms" };
    if (infoTabs[tab]) {
      setInfoSection(infoTabs[tab]);
      setActiveTab("info");
    } else {
      setActiveTab(tab);
    }
    setSelectedCourseId(null);
    setActiveGeneratedExam(null);
  };

  // ===== SECURITY GATE: Session restoring spinner =====
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl animate-pulse">
          <GraduationCap className="w-9 h-9" />
        </div>
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-blue-200">
          {lang === "ar" ? "جاري التحقق من جلستك الآمنة..." : "Verifying your secure session..."}
        </p>
      </div>
    );
  }

  // ===== SECURITY GATE: Real login required to access the platform =====
  if (!user) {
    return <AuthScreen />;
  }

  // Home courses cards data
  const stagesCourses = [
    {
      id: "crs_sec_3",
      title: lang === "ar" ? "كورس الشهادة الثانوية العامة 2025/2026" : "Third Secondary Master Class 2025/2026",
      grade: lang === "ar" ? "الصف الثالث الثانوي (البوكليت)" : "Third Secondary (Baccalaureate)",
      desc: lang === "ar" ? "تغطية شاملة للقواعد، الكلمات المعقدة، قطع الفهم، والترجمة مع المستر" : "Comprehensive Thanawya Amma mastery: Grammar, Vocabulary, Translation & Novel Analysis.",
      price: "350.00 EGP",
      badge: "Thanawya Amma Core",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "crs_sec_2",
      title: lang === "ar" ? "كورس الصف الثاني الثانوي المكثف" : "Second Secondary Intensive English Program",
      grade: lang === "ar" ? "الصف الثاني الثانوي" : "Second Secondary",
      desc: lang === "ar" ? "المباشر والغير مباشر، الحالات الشرطية، وتنمية مهارات التعبير" : "Direct/Indirect speech, conditionals, passive voice & essay structures.",
      price: "280.00 EGP",
      badge: "Secondary Core",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "crs_sec_1",
      title: lang === "ar" ? "كورس تأسيس الصف الأول الثانوي" : "First Secondary Foundation & Grammar",
      grade: lang === "ar" ? "الصف الأول الثانوي" : "First Secondary",
      desc: lang === "ar" ? "الانتقال السلس من الإعدادي للثانوي وتأسيس قواعد الأزمنة" : "Smooth transition to secondary level with core tenses and vocab.",
      price: "250.00 EGP",
      badge: "Secondary Foundation",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "crs_prep_3",
      title: lang === "ar" ? "كورس الشهادة الإعدادية (الدرجة النهائية)" : "Third Prep High Score Booster",
      grade: lang === "ar" ? "الصف الثالث الإعدادي" : "Third Prep",
      desc: lang === "ar" ? "حل المحادثات، قطع القراءة، وأسرار امتحانات المحافظات" : "Complete preparation for final prep exams, dialogues & structural drills.",
      price: "200.00 EGP",
      badge: "Preparatory Excellence",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* NAVBAR */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* FLOATING WHATSAPP SUPPORT BUTTON */}
      <WhatsAppButton />

      {/* PWA: SERVICE WORKER + INSTALL PROMPT + OFFLINE STATUS */}
      <PwaManager />

      <main className="flex-1">
        
        {/* VIEW: ACTIVE GENERATED EXAM */}
        {activeGeneratedExam ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={() => setActiveGeneratedExam(null)}
              className="mb-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              ← {lang === "ar" ? "العودة لبنك الأسئلة" : "Back to Question Bank"}
            </button>

            <QuizPlayer
              quizId={activeGeneratedExam.id}
              title={activeGeneratedExam.title}
              durationMinutes={activeGeneratedExam.durationMinutes}
              questions={activeGeneratedExam.questionsData}
              submissionTarget="smart_exam"
              onExit={() => setActiveGeneratedExam(null)}
            />
          </div>
        ) : selectedCourseId ? (
          /* VIEW: COURSE DETAIL */
          <CourseDetailView
            courseId={selectedCourseId}
            onBack={() => setSelectedCourseId(null)}
          />
        ) : activeTab === "home" ? (
          
          /* VIEW: HOME LANDING PAGE */
          <div>
            
            {/* HERO SECTION — Mr. Habib El Rahman */}
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white">
              <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-violet-600 blur-3xl" />
              </div>
              <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-8 lg:py-20">
                <div className="order-2 space-y-6 text-center lg:order-1 lg:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-white/10 px-4 py-2 text-xs font-bold text-blue-100 shadow-lg backdrop-blur">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{lang === "ar" ? "منصة المستر الرسمية للثانوية العامة والإعدادية" : "Official Platform of Mr. Habib El Rahman"}</span>
                  </div>
                  <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {lang === "ar" ? <>اتعلم الإنجليزي مع <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">مستر حبيب الرحمن</span></> : <>Master English with <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">Mr. Habib El Rahman</span></>}
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm font-medium leading-8 text-blue-100/85 sm:text-base lg:mx-0">
                    {lang === "ar" ? "شرح ومراجعة وتدريب ذكي على منهجك، مع بنك أسئلة مصنف حسب الصف والوحدة، وامتحانات تفاعلية تتابع تقدمك خطوة بخطوة." : "Curriculum-aligned lessons, a carefully classified question bank, interactive exams, and progress tracking to help you improve step by step."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
                    <button onClick={() => setActiveTab("question_bank")} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-950/40 transition hover:-translate-y-0.5 hover:brightness-110">
                      <Database className="h-5 w-5 text-amber-300" />
                      <span>{lang === "ar" ? "ابدأ التدريب والامتحانات" : "Start Practicing"}</span>
                    </button>
                    <button onClick={() => setActiveTab("courses")} className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/15">
                      {lang === "ar" ? "تصفح الكورسات" : "Explore Courses"}
                    </button>
                    <Link href="/placement-test" className="rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-blue-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                      {lang === "ar" ? "اختبار تحديد المستوى" : "Placement Test"}
                    </Link>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs font-semibold text-blue-100/75 lg:justify-start">
                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-300" />{lang === "ar" ? "تدريب حسب منهجك" : "Curriculum-aligned practice"}</span>
                    <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-violet-300" />{lang === "ar" ? "امتحانات ذكية" : "Smart exams"}</span>
                    <span className="flex items-center gap-2"><Award className="h-4 w-4 text-amber-300" />{lang === "ar" ? "تابع تقدمك" : "Track your progress"}</span>
                  </div>
                </div>
                <div className="order-1 mx-auto w-full max-w-md lg:order-2">
                  <div className="relative mx-auto aspect-[4/5] max-h-[620px] overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-violet-500/20 p-2 shadow-2xl shadow-black/40">
                    <div className="absolute inset-2 overflow-hidden rounded-[1.55rem] bg-slate-900">
                      <img
                        src="/habib-hero.jpg"
                        alt="Mr. Habib El Rahman"
                        className="h-full w-full object-cover object-center"
                        onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-slate-950/65 p-4 text-right shadow-xl backdrop-blur-md">
                        <p className="text-xs font-semibold tracking-wide text-sky-200">PROFESSIONAL ACADEMY</p>
                        <p className="mt-1 text-xl font-black text-white sm:text-2xl">{lang === "ar" ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}</p>
                        <p className="mt-1 text-xs font-medium text-blue-100/80">Limitless Innovation</p>
                      </div>
                    </div>
                    <div className="absolute -left-2 top-8 rounded-2xl border border-white/15 bg-slate-900/80 px-4 py-3 shadow-xl backdrop-blur">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-white"><GraduationCap className="h-5 w-5 text-sky-300" />Professional Academy</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STAGES COURSES PREVIEW GRID */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {lang === "ar" ? "المناهج والكورسات المتاحة" : "Curriculum & Courses"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {lang === "ar" ? "كورسات المراحل الإعدادية والثانوية" : "Secondary & Preparatory Courses"}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTab("courses")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                >
                  <span>{lang === "ar" ? "عرض كل المناهج" : "View All Stages"}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stagesCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 rtl:right-3 rtl:left-auto text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white shadow">
                          {c.badge}
                        </span>
                        {/* FAVORITE HEART */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(c);
                          }}
                          className={`absolute top-2.5 right-2.5 rtl:left-2.5 rtl:right-auto p-2 rounded-xl backdrop-blur-md shadow-lg border transition-all hover:scale-110 ${
                            favorites.find((f) => f.id === c.id)
                              ? "bg-rose-500/90 border-rose-400 text-white"
                              : "bg-white/70 dark:bg-slate-900/70 border-white/40 text-rose-500"
                          }`}
                          title={lang === "ar" ? "إضافة للمفضلة" : "Add to favorites"}
                        >
                          <Heart className={`w-4 h-4 ${favorites.find((f) => f.id === c.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <div className="p-5">
                        <span className="text-[11px] font-bold text-slate-400">{c.grade}</span>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors leading-snug">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-4">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">{c.price}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{lang === "ar" ? "تصفح المنهج" : "Inspect"}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        ) : activeTab === "question_bank" ? (
          
          /* VIEW: QUESTION BANK WORKSPACE */
          <QuestionBankWorkspace
            onExamGenerated={(exam) => {
              setActiveGeneratedExam(exam);
            }}
          />
        ) : activeTab === "pdfs" ? (
          
          /* VIEW: PDF LIBRARY WORKSPACE */
          <PdfLibraryWorkspace />
        ) : activeTab === "grammar" ? (
          
          /* VIEW: GRAMMAR VIDEO LIBRARY */
          <GrammarLibrary />
        ) : activeTab === "courses" ? (
          
          /* VIEW: ALL COURSES FILTERABLE */
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
              {lang === "ar" ? "جميع الكورسات والصفوف المتاحة" : "All Available Courses & Stages"}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stagesCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl p-6 cursor-pointer hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {c.grade}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    <span>{c.price}</span>
                    <span>{lang === "ar" ? "تصفح الوحدات" : "Inspect Units"} →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "placement" ? (
          
          /* VIEW: PLACEMENT TEST */
          <PlacementTestHub />
        ) : activeTab === "ai_assistant" ? (
          
          /* VIEW: AI WORKSPACE */
          <div className="p-4">
            <AiAssistantWorkspace />
          </div>
        ) : activeTab === "dashboard" ? (
          
          /* VIEW: ROLE DASHBOARDS */
          <div>
            {user?.role === "admin" && <SuperAdminDashboard />}
            {user?.role === "teacher" && <TeacherDashboard onOpenLibrary={() => setActiveTab("pdfs")} />}
            {user?.role === "student" && <StudentDashboard onSelectCourse={(id) => setSelectedCourseId(id)} onOpenReport={() => setActiveTab("report")} onStartExam={(exam) => setActiveGeneratedExam(exam)} />}
            {user?.role === "parent" && <ParentDashboard onOpenReport={() => setActiveTab("report")} />}
          </div>
        ) : activeTab === "chat" ? (
          
          /* VIEW: COMMUNITY CHAT */
          <CommunityChat />
        ) : activeTab === "blog" ? (
          
          /* VIEW: BLOG */
          <BlogView />
        ) : activeTab === "notifications" ? (

          /* VIEW: NOTIFICATION CENTER (real + push) */
          <NotificationCenter />
        ) : activeTab === "gamification" ? (

          /* VIEW: GAMIFICATION CENTER */
          <GamificationCenter />
        ) : activeTab === "calendar" ? (

          /* VIEW: CALENDAR & LIVE SESSIONS */
          <CalendarView />
        ) : activeTab === "info" ? (

          /* VIEW: INFO PAGES (About/FAQ/Contact/Privacy/Terms) */
          <InfoPages initialSection={infoSection} />
        ) : activeTab === "search" ? (

          /* VIEW: GLOBAL SEARCH */
          <GlobalSearch onSelectCourse={(id) => setSelectedCourseId(id)} />
        ) : activeTab === "homework" ? (

          /* VIEW: HOMEWORK SYSTEM */
          <HomeworkWorkspace />
        ) : activeTab === "attendance" ? (

          /* VIEW: ATTENDANCE SYSTEM */
          <AttendanceWorkspace />
        ) : activeTab === "report" ? (

          /* VIEW: WEEKLY STUDENT REPORT */
          <WeeklyReport />
        ) : activeTab === "analytics" ? (

          /* VIEW: ANALYTICS & REPORTS */
          <AnalyticsReports />
        ) : activeTab === "download" ? (

          /* VIEW: DOWNLOAD / INSTALL APP */
          <DownloadAppPage />
        ) : null}

      </main>

      {/* FOOTER */}
      <Footer setActiveTab={handleTabChange} />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
