"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PwaManager } from "@/components/PwaManager";
import { authHeaders } from "@/lib/client-auth";

function TabLoadingSkeleton({ label }: { label?: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[350px] text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-purple-900/40 animate-pulse mb-3">
        <Sparkles className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-bold text-slate-700 dark:text-purple-200 animate-pulse">
        {label || "جاري التحميل الفوري..."}
      </p>
      <div className="w-44 h-1.5 bg-slate-200 dark:bg-purple-950/80 rounded-full mt-3 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-purple-500 to-sky-400 animate-pulse rounded-full" />
      </div>
    </div>
  );
}

// Dynamic Imports with ssr: false for fast initial load (< 1s)
const AdaptivePlacementTest = dynamic(
  () => import("@/components/AdaptivePlacementTest").then((m) => m.AdaptivePlacementTest),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل اختبار تحديد المستوى..." />, ssr: false }
);

const AiAssistantWorkspace = dynamic(
  () => import("@/components/AiAssistantWorkspace").then((m) => m.AiAssistantWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تشغيل المساعد الذكي..." />, ssr: false }
);

const SuperAdminDashboard = dynamic(
  () => import("@/components/SuperAdminDashboard").then((m) => m.SuperAdminDashboard),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز لوحة الإدارة العامة..." />, ssr: false }
);

const TeacherDashboard = dynamic(
  () => import("@/components/TeacherDashboard").then((m) => m.TeacherDashboard),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز لوحة المعلم..." />, ssr: false }
);

const StudentDashboard = dynamic(
  () => import("@/components/StudentDashboard").then((m) => m.StudentDashboard),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز لوحة الطالب والمقررات..." />, ssr: false }
);

const ParentDashboard = dynamic(
  () => import("@/components/ParentDashboard").then((m) => m.ParentDashboard),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز لوحة ولي الأمر..." />, ssr: false }
);

const CourseDetailView = dynamic(
  () => import("@/components/CourseDetailView").then((m) => m.CourseDetailView),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل تفاصيل الكورس..." />, ssr: false }
);

const CommunityChat = dynamic(
  () => import("@/components/CommunityChat").then((m) => m.CommunityChat),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل مجتمع الطلاب..." />, ssr: false }
);

const BlogView = dynamic(
  () => import("@/components/BlogView").then((m) => m.BlogView),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل المقالات والنصائح..." />, ssr: false }
);

const QuestionBankWorkspace = dynamic(
  () => import("@/components/QuestionBankWorkspace").then((m) => m.QuestionBankWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل بنك الأسئلة ومولد الامتحانات..." />, ssr: false }
);

const PdfLibraryWorkspace = dynamic(
  () => import("@/components/PdfLibraryWorkspace").then((m) => m.PdfLibraryWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل مكتبة المذكرات والـ PDF..." />, ssr: false }
);

const AuthScreen = dynamic(
  () => import("@/components/AuthScreen").then((m) => m.AuthScreen),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز بوابة الدخول الآمن..." />, ssr: false }
);

const GamificationCenter = dynamic(
  () => import("@/components/GamificationCenter").then((m) => m.GamificationCenter),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل مركز النقاط والشارات..." />, ssr: false }
);

const CalendarView = dynamic(
  () => import("@/components/CalendarView").then((m) => m.CalendarView),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل جدول الحصص والمواعيد..." />, ssr: false }
);

const LiveClassroomSection = dynamic(
  () => import("@/components/LiveClassroomSection").then((m) => m.LiveClassroomSection),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل قاعة البث المباشر..." />, ssr: false }
);

const InfoPages = dynamic(
  () => import("@/components/InfoPages").then((m) => m.InfoPages),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل الصفحة..." />, ssr: false }
);

const GlobalSearch = dynamic(
  () => import("@/components/GlobalSearch").then((m) => m.GlobalSearch),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز محرك البحث..." />, ssr: false }
);

const HomeworkWorkspace = dynamic(
  () => import("@/components/HomeworkWorkspace").then((m) => m.HomeworkWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل نظام الواجبات..." />, ssr: false }
);

const AttendanceWorkspace = dynamic(
  () => import("@/components/AttendanceWorkspace").then((m) => m.AttendanceWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل نظام الحضور والغياب وكاميرا الـ QR..." />, ssr: false }
);

const NotificationCenter = dynamic(
  () => import("@/components/NotificationCenter").then((m) => m.NotificationCenter),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل الإشعارات..." />, ssr: false }
);

const AnalyticsReports = dynamic(
  () => import("@/components/AnalyticsReports").then((m) => m.AnalyticsReports),
  { loading: () => <TabLoadingSkeleton label="جاري تحليل البيانات والتقارير..." />, ssr: false }
);

const DownloadAppPage = dynamic(
  () => import("@/components/DownloadAppPage").then((m) => m.DownloadAppPage),
  { loading: () => <TabLoadingSkeleton label="جاري تجهيز روابط تحميل التطبيق..." />, ssr: false }
);

const GrammarLibrary = dynamic(
  () => import("@/components/GrammarLibrary").then((m) => m.GrammarLibrary),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل مكتبة شروحات القواعد والأسئلة..." />, ssr: false }
);

const QuizPlayer = dynamic(
  () => import("@/components/QuizPlayer").then((m) => m.QuizPlayer),
  { loading: () => <TabLoadingSkeleton label="جاري إعداد واجهة الامتحان التفاعلي..." />, ssr: false }
);

const ParentSmartReportView = dynamic(
  () => import("@/components/ParentSmartReportView").then((m) => m.ParentSmartReportView),
  { loading: () => <TabLoadingSkeleton label="جاري استخراج تقرير ولي الأمر الذكي..." />, ssr: false }
);

const CurriculumWorkspace = dynamic(
  () => import("@/components/CurriculumWorkspace").then((m) => m.CurriculumWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل نظام المناهج والقصة المقررة..." />, ssr: false }
);

const MinistryAssessmentsHub = dynamic(
  () => import("@/components/assessments/MinistryAssessmentsHub").then((m) => m.MinistryAssessmentsHub),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل تقييمات الوزارة الرسمية 2026/2027..." />, ssr: false }
);

const TranslationAcademyWorkspace = dynamic(
  () => import("@/components/translation/TranslationAcademyWorkspace").then((m) => m.TranslationAcademyWorkspace),
  { loading: () => <TabLoadingSkeleton label="جاري تحميل أكاديمية الترجمة الاحترافية..." />, ssr: false }
);
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
  Ticket,
  AlertCircle,
  X,
  Languages,
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

  // 1-Click QR Code Voucher Activation Modal
  const [activationCodeModal, setActivationCodeModal] = useState<string | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [selectedCurriculumGrade, setSelectedCurriculumGrade] = useState<string>("sec_3");

  const toggleFavorite = (course: any) => {
    const exists = favorites.find((f) => f.id === course.id);
    const next = exists ? favorites.filter((f) => f.id !== course.id) : [...favorites, course];
    setFavorites(next);
    try { localStorage.setItem("pa_favorites", JSON.stringify(next)); } catch {}
  };

  // Read PWA shortcut tabs from URL (?tab=pdfs) and 1-Click QR Activation (?activate=CODE)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) setActiveTab(tab);

      const activateParam = params.get("activate");
      if (activateParam) {
        setActivationCodeModal(activateParam.trim().toUpperCase());
      }

      const tokenParam = params.get("token");
      if (tokenParam) {
        setReportToken(tokenParam);
        setActiveTab("parent_report");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDirectRedeem = async () => {
    if (!activationCodeModal) return;
    setRedeemLoading(true);
    setRedeemMessage(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "redeem_code",
          studentId: user?.id,
          code: activationCodeModal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemMessage({
          type: "success",
          text: lang === "ar"
            ? "🎉 تم تفعيل الكود بنجاح وإلغاء القفل! مرحباً بك في الكورس."
            : "🎉 Activation code accepted! Course unlocked successfully.",
        });
        setTimeout(() => {
          setActivationCodeModal(null);
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
          setActiveTab("dashboard");
        }, 2200);
      } else {
        setRedeemMessage({
          type: "error",
          text: data.error || (lang === "ar" ? "الكود غير صالح أو مستخدم مسبقاً" : "Code is invalid or already used"),
        });
      }
    } catch {
      setRedeemMessage({
        type: "error",
        text: lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم" : "Connection error",
      });
    } finally {
      setRedeemLoading(false);
    }
  };

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
      id: "crs_sec_2_bac",
      title: lang === "ar" ? "كورس تانية بكالوريا المصرية 2026/2027" : "Second Year Egyptian Baccalaureate 2026/2027",
      grade: lang === "ar" ? "تانية بكالوريا (Egyptian Baccalaureate)" : "Second Year Baccalaureate",
      desc: lang === "ar" ? "منهج البكالوريا المستقل: 10 وحدات، 5 مراجعات، ورواية The Lost World لآرثر كونان دويل" : "Independent Baccalaureate: 10 Units, 5 Consolidation Reviews & The Lost World novel.",
      price: "320.00 EGP",
      badge: "Egyptian Baccalaureate",
      image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0c071a] text-slate-900 dark:text-slate-100 transition-colors">
      
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
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0c071a] via-[#1a0f38] to-[#0b1528] text-white">
              <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
              </div>
              <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-8 lg:py-20">
                <div className="order-2 space-y-6 text-center lg:order-1 lg:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-900/30 px-4 py-2 text-xs font-bold text-sky-200 shadow-lg backdrop-blur">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>{lang === "ar" ? "منصة المستر الرسمية للثانوية العامة والإعدادية" : "Official Platform of Mr. Habib El Rahman"}</span>
                  </div>
                  <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {lang === "ar" ? <>اتعلم الإنجليزي مع <span className="bg-gradient-to-r from-sky-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">مستر حبيب الرحمن</span></> : <>Master English with <span className="bg-gradient-to-r from-sky-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">Mr. Habib El Rahman</span></>}
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm font-medium leading-8 text-purple-100/85 sm:text-base lg:mx-0">
                    {lang === "ar" ? "شرح ومراجعة وتدريب ذكي على منهجك، مع بنك أسئلة مصنف حسب الصف والوحدة، وامتحانات تفاعلية تتابع تقدمك خطوة بخطوة." : "Curriculum-aligned lessons, a carefully classified question bank, interactive exams, and progress tracking to help you improve step by step."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
                    <button onClick={() => setActiveTab("translation")} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-purple-950/60 transition hover:-translate-y-0.5 hover:brightness-110 cursor-pointer">
                      <Languages className="h-5 w-5 text-amber-300" />
                      <span>{lang === "ar" ? "أكاديمية الترجمة الاحترافية" : "Translation Academy"}</span>
                    </button>
                    <button onClick={() => setActiveTab("question_bank")} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-sky-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-purple-950/60 transition hover:-translate-y-0.5 hover:brightness-110">
                      <Database className="h-5 w-5 text-amber-300" />
                      <span>{lang === "ar" ? "ابدأ التدريب والامتحانات" : "Start Practicing"}</span>
                    </button>
                    <button onClick={() => setActiveTab("courses")} className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-6 py-4 text-sm font-extrabold text-sky-200 backdrop-blur transition hover:bg-sky-500/20">
                      {lang === "ar" ? "تصفح الكورسات" : "Explore Courses"}
                    </button>
                    <button onClick={() => setActiveTab("placement")} className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-6 py-4 text-sm font-bold text-amber-200 transition hover:bg-amber-500/20">
                      {lang === "ar" ? "اختبار تحديد المستوى" : "Placement Test"}
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-purple-500/20 pt-5 text-xs font-semibold text-purple-100/75 lg:justify-start">
                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-sky-300" />{lang === "ar" ? "تدريب حسب منهجك" : "Curriculum-aligned practice"}</span>
                    <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-purple-300" />{lang === "ar" ? "امتحانات ذكية" : "Smart exams"}</span>
                    <span className="flex items-center gap-2"><Award className="h-4 w-4 text-amber-300" />{lang === "ar" ? "تابع تقدمك" : "Track your progress"}</span>
                  </div>
                </div>
                <div className="relative order-1 mx-auto w-full max-w-md lg:order-2">
                  {/* Ambient Glow Orbs */}
                  <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-purple-600/35 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-amber-400/15 blur-2xl" />

                  {/* Outer Framed Card */}
                  <div className="group relative mx-auto aspect-[4/5] max-h-[640px] rounded-[2.5rem] p-[2px] bg-gradient-to-b from-purple-500/50 via-sky-400/40 to-amber-400/30 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.35)] transition-transform duration-500 hover:scale-[1.01]">
                    <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-gradient-to-b from-[#160b33] via-[#0d071e] to-[#080512]">
                      <img
                        src="/habib-hero.jpg"
                        alt="Mr. Habib El Rahman"
                        className="h-full w-full object-cover object-[center_12%] transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient Overlays for readable text and cinematic contrast */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c071a] via-[#0c071a]/30 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.4rem]" />

                      {/* Floating Top Badge - Verified / Leadership */}
                      <div className="absolute top-5 start-5 flex items-center gap-2 rounded-full border border-purple-400/40 bg-[#0c071a]/85 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-black text-purple-200">
                          {lang === "ar" ? "العام الدراسي 2026/2027" : "Academic Year 2026/2027"}
                        </span>
                      </div>

                      {/* Floating Quality Badge */}
                      <div className="absolute top-5 end-5 flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1.5 shadow-lg backdrop-blur-md text-amber-300">
                        <Award className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold">10+ {lang === "ar" ? "سنوات خبرة" : "Years"}</span>
                      </div>

                      {/* Main Bottom Glass Card with Habib El Rahman details */}
                      <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-purple-400/30 bg-[#0c071a]/85 p-5 text-right shadow-2xl backdrop-blur-xl transition hover:border-purple-400/50">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-extrabold text-sky-300">
                            <Sparkles className="h-3 w-3 text-sky-400" />
                            <span>Professional Academy</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                            <span>{lang === "ar" ? "معتمد ومُوثق" : "Verified Educator"}</span>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-end gap-2">
                            <span>{lang === "ar" ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}</span>
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-tr from-purple-600 to-sky-500 text-white text-xs font-bold shadow-sm">
                              ✓
                            </span>
                          </h3>
                          <p className="mt-1 text-xs font-bold text-purple-200/90 leading-relaxed">
                            {lang === "ar"
                              ? "خبير ومُعد أوائل الجمهورية في اللغة الإنجليزية للثانوية العامة والإعدادية"
                              : "Senior English Language Expert & National Top Achievers Mentor"}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-purple-500/20 pt-2.5 text-[11px] font-semibold text-purple-200/70">
                          <span className="flex items-center gap-1.5 text-amber-300">
                            <Flame className="h-3.5 w-3.5 text-amber-400" />
                            <span>Limitless Innovation</span>
                          </span>
                          <span className="text-sky-300">
                            {lang === "ar" ? "شرح مبسط • تدريب مكثف" : "Smart Prep • Exam Mastery"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LIVE CLASSROOM SECTION — GOOGLE MEET */}
            <LiveClassroomSection />

            {/* STAGES COURSES PREVIEW GRID */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {lang === "ar" ? "المناهج والكورسات المتاحة" : "Curriculum & Courses"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {lang === "ar" ? "كورسات المراحل الإعدادية والثانوية" : "Secondary & Preparatory Courses"}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTab("courses")}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:text-sky-500 hover:underline"
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
                    className="bg-white dark:bg-[#120a24] rounded-3xl border border-slate-200 dark:border-purple-950/60 overflow-hidden shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className={`absolute top-3 left-3 rtl:right-3 rtl:left-auto text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow ${
                          c.id === "crs_sec_3"
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black"
                            : "bg-gradient-to-r from-purple-600 to-sky-600 text-white"
                        }`}>
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
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-purple-900/40 mt-4">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">{c.price}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform group-hover:text-purple-600 dark:group-hover:text-sky-400">
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
                  className="bg-white dark:bg-[#120a24] rounded-3xl border border-slate-200 dark:border-purple-950/60 overflow-hidden shadow-xl p-6 cursor-pointer hover:border-purple-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                      {c.grade}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 group-hover:text-purple-600 transition-colors">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-purple-900/40 flex justify-between items-center text-xs font-extrabold">
                    <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{c.price}</span>
                    <span className="text-purple-600 dark:text-sky-400 font-extrabold">{lang === "ar" ? "تصفح الوحدات" : "Inspect Units"} →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "placement" ? (
          
          /* VIEW: PLACEMENT TEST */
          <AdaptivePlacementTest />
        ) : activeTab === "auth" ? (
          
          /* VIEW: AUTHENTICATION (LOGIN & REGISTRATION) */
          <AuthScreen onBack={() => setActiveTab("home")} />
        ) : activeTab === "ai_assistant" ? (
          
          /* VIEW: AI WORKSPACE */
          !user ? (
            <AuthScreen onBack={() => setActiveTab("home")} />
          ) : (
            <div className="p-4">
              <AiAssistantWorkspace />
            </div>
          )
        ) : activeTab === "dashboard" ? (
          
          /* VIEW: ROLE DASHBOARDS */
          authLoading ? (
            <TabLoadingSkeleton label={lang === "ar" ? "جاري استعادة جلستك الآمنة..." : "Restoring secure session..."} />
          ) : !user ? (
            <AuthScreen onBack={() => setActiveTab("home")} />
          ) : (
            <div>
              {user.role === "admin" && <SuperAdminDashboard />}
              {user.role === "teacher" && (
                <TeacherDashboard
                  onOpenLibrary={() => setActiveTab("pdfs")}
                  onOpenTranslation={() => setActiveTab("translation")}
                />
              )}
              {user.role === "student" && (
                <StudentDashboard
                  onSelectCourse={(id) => setSelectedCourseId(id)}
                  onOpenReport={() => setActiveTab("report")}
                  onStartExam={(exam) => setActiveGeneratedExam(exam)}
                  onOpenCurriculum={(code) => {
                    if (code) setSelectedCurriculumGrade(code);
                    setActiveTab("curriculum");
                  }}
                  onOpenMinistryAssessments={() => setActiveTab("ministry_assessments")}
                  onOpenTranslation={() => setActiveTab("translation")}
                />
              )}
              {user.role === "parent" && <ParentDashboard onOpenReport={() => setActiveTab("report")} />}
            </div>
          )
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
          !user ? (
            <AuthScreen onBack={() => setActiveTab("home")} />
          ) : (
            <HomeworkWorkspace />
          )
        ) : activeTab === "attendance" ? (

          /* VIEW: ATTENDANCE SYSTEM */
          !user ? (
            <AuthScreen onBack={() => setActiveTab("home")} />
          ) : (
            <AttendanceWorkspace />
          )
        ) : activeTab === "report" || activeTab === "parent_report" ? (

          /* VIEW: SMART PARENT & STUDENT REPORT */
          <ParentSmartReportView
            token={reportToken || undefined}
            studentId={user?.role === "parent" ? undefined : (user?.role === "student" ? user.id : undefined)}
            onBack={() => {
              setReportToken(null);
              setActiveTab(user ? "dashboard" : "home");
            }}
          />
        ) : activeTab === "analytics" ? (

          /* VIEW: ANALYTICS & REPORTS */
          <AnalyticsReports />
        ) : activeTab === "curriculum" ? (

          /* VIEW: SMART CURRICULUM ORGANIZATION SYSTEM (6 Units & Story Corner) */
          <CurriculumWorkspace
            initialGradeCode={selectedCurriculumGrade}
            onOpenExam={(exam) => setActiveGeneratedExam(exam)}
          />
        ) : activeTab === "ministry_assessments" ? (

          /* VIEW: OFFICIAL MINISTRY ASSESSMENTS LIBRARY 2026/2027 */
          <MinistryAssessmentsHub
            onBack={() => setActiveTab(user ? "dashboard" : "home")}
            initialGradeCode={user?.grade ? user.grade : selectedCurriculumGrade}
          />
        ) : activeTab === "translation" ? (

          /* VIEW: TRANSLATION ACADEMY — Mr. Habib El Rahman */
          <TranslationAcademyWorkspace />
        ) : activeTab === "download" ? (

          /* VIEW: DOWNLOAD / INSTALL APP */
          <DownloadAppPage />
        ) : null}

      </main>

      {/* FOOTER */}
      {/* 1-CLICK QR VOUCHER ACTIVATION MODAL */}
      {activationCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12082b] border-2 border-amber-400/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setActivationCodeModal(null);
                try {
                  window.history.replaceState({}, document.title, window.location.pathname);
                } catch {}
              }}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                <Ticket className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                Professional Academy
              </span>
              <h3 className="text-lg md:text-xl font-black mt-1">
                {lang === "ar" ? "تفعيل كارت الشحن الفوري" : "Redeem Voucher Card"}
              </h3>
              <p className="text-xs text-purple-200/80 mt-1">
                {lang === "ar"
                  ? "تم التعرف على كود التفعيل الممسوح بكاميرا الموبايل بنجاح"
                  : "Activation code detected via camera QR scan"}
              </p>
            </div>

            {/* Code Box Display */}
            <div className="bg-[#0b041c] border-2 border-dashed border-amber-400/60 rounded-2xl p-4 text-center mb-5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                {lang === "ar" ? "كود التفعيل المقروء:" : "Scanned Code:"}
              </span>
              <span className="font-mono font-black text-xl md:text-2xl text-amber-300 tracking-wider">
                {activationCodeModal}
              </span>
            </div>

            {/* Status Feedback Message */}
            {redeemMessage && (
              <div
                className={`p-3 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2 ${
                  redeemMessage.type === "success"
                    ? "bg-emerald-950/80 text-emerald-200 border border-emerald-500/50"
                    : "bg-red-950/80 text-red-200 border border-red-500/50"
                }`}
              >
                {redeemMessage.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{redeemMessage.text}</span>
              </div>
            )}

            {/* Action buttons depending on authentication state */}
            {!user ? (
              <div className="space-y-3">
                <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl">
                  {lang === "ar"
                    ? "لتفعيل هذا الكود على حسابك، يرجى تسجيل الدخول أو إنشاء حساب طالب أولاً."
                    : "To link this voucher to your account, please sign in or register as a student first."}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("auth");
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {lang === "ar" ? "تسجيل الدخول / إنشاء حساب جديد" : "Sign In / Register Student"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-purple-950/60 p-3 rounded-xl border border-purple-800/40">
                  <span className="text-slate-300">{lang === "ar" ? "الحساب المستفيد:" : "Beneficiary:"}</span>
                  <span className="font-bold text-amber-300">{user.name}</span>
                </div>
                <button
                  onClick={handleDirectRedeem}
                  disabled={redeemLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs md:text-sm shadow-xl shadow-amber-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {redeemLoading
                    ? (lang === "ar" ? "جارِ التحقق والتفعيل..." : "Redeeming...")
                    : (lang === "ar" ? "تأكيد شحن الكارت وتفعيل الكورس الآن" : "Confirm & Redeem Voucher Now")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
