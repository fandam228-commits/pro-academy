"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StudentDashboard } from "@/components/StudentDashboard";
import { HabibAdminControlPanel } from "@/components/admin/HabibAdminControlPanel";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { AuthScreen } from "@/components/AuthScreen";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  AlertTriangle,
  Trophy,
  Languages,
  BookOpen,
  FileEdit,
  GraduationCap,
  Layers,
  QrCode,
  CreditCard,
  ArrowRight,
  Swords,
} from "lucide-react";

function DashboardContent() {
  const { user, authLoading, lang } = useApp();
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-purple-900/40 animate-pulse mb-3">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-purple-200 animate-pulse">
          {lang === "ar" ? "جاري تحميل لوحة التحكم الذكية..." : "Loading smart dashboard..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex items-center justify-center p-4">
        <AuthScreen
          returnUrl="/dashboard"
          onBack={() => router.push("/")}
          onLoginSuccess={() => router.refresh()}
        />
      </div>
    );
  }

  // Admin View
  if (user.role === "admin") {
    return <HabibAdminControlPanel onExitAdmin={() => router.push("/")} />;
  }

  // Teacher View
  if (user.role === "teacher") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans" dir="rtl">
        <Navbar activeTab="dashboard" setActiveTab={(tab) => router.push(tab === "home" ? "/" : `/?tab=${tab}`)} />
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <TeacherDashboard
            onOpenLibrary={() => router.push("/?tab=pdfs")}
            onOpenTranslation={() => router.push("/dashboard/translation")}
          />
        </main>
        <Footer setActiveTab={(tab) => router.push(tab === "home" ? "/" : `/?tab=${tab}`)} />
      </div>
    );
  }

  // Parent View
  if (user.role === "parent") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans" dir="rtl">
        <Navbar activeTab="dashboard" setActiveTab={(tab) => router.push(tab === "home" ? "/" : `/?tab=${tab}`)} />
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <ParentDashboard onOpenReport={() => router.push("/?tab=report")} />
        </main>
        <Footer setActiveTab={(tab) => router.push(tab === "home" ? "/" : `/?tab=${tab}`)} />
      </div>
    );
  }

  // Student Main Dashboard View
  const proModules = [
    {
      title: "بنك أخطائي الذكي",
      desc: "تتبع وحل أخطائك في الكويزات تلقائياً",
      href: "/dashboard/mistakes",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500",
      badge: "تلقائي",
    },
    {
      title: "لوحة الشرف والأوائل",
      desc: "تنافس واكسب نقاط XP أسبوعية",
      href: "/dashboard/leaderboard",
      icon: Trophy,
      color: "from-yellow-400 to-amber-500",
      badge: "XP",
    },
    {
      title: "أكاديمية الترجمة",
      desc: "تدريب تفاعلي وحر على الترجمة",
      href: "/dashboard/translation",
      icon: Languages,
      color: "from-blue-600 to-indigo-600",
      badge: "PRO",
    },
    {
      title: "عالم القصص والروايات",
      desc: "قراءة صوتية، خرائط شخصيات، وتفكير نقدي",
      href: "/dashboard/literature",
      icon: BookOpen,
      color: "from-indigo-600 to-purple-600",
      badge: "2027",
    },
    {
      title: "مختبر المقال والفقرة",
      desc: "بنك أفكار وروابط وتقييم فوري",
      href: "/dashboard/essay-lab",
      icon: FileEdit,
      color: "from-emerald-600 to-teal-600",
      badge: "+30 XP",
    },
    {
      title: "محاكي الامتحانات الشامل",
      desc: "مؤقت 3 ساعات وتصحيح وزاري فوري",
      href: "/dashboard/exam-simulator",
      icon: GraduationCap,
      color: "from-rose-600 to-red-600",
      badge: "وزاري",
    },
    {
      title: "فلاش كاردز المفردات",
      desc: "تكرار متباعد ونطق صوتي بريطاني",
      href: "/dashboard/flashcards",
      icon: Layers,
      color: "from-cyan-600 to-blue-600",
      badge: "SRS",
    },
    {
      title: "بطاقة الطالب الذكية QR",
      desc: "باركود الحضور في السنتر ومتابعة الواجب",
      href: "/dashboard/my-qr",
      icon: QrCode,
      color: "from-purple-600 to-pink-600",
      badge: "ID",
    },
    {
      title: "شحن كروت المنصة",
      desc: "تفعيل الاشتراكات عبر كود الكارت",
      href: "/dashboard/activate",
      icon: CreditCard,
      color: "from-slate-700 to-slate-900",
      badge: "شحن",
    },
    {
      title: "تحدي الأصدقاء 1v1",
      desc: "معركة 5 أسئلة بـ 90 ثانية وشارك الرابط عبر واتساب",
      href: "/dashboard/challenge",
      icon: Swords,
      color: "from-amber-500 to-yellow-500",
      badge: "1v1 جديد",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="dashboard"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 pb-24 md:pb-8">
        {/* PRO SUITE EXPANSION QUICK-ACCESS GRID */}
        <section aria-label="أدوات حزمة التميز Pro Suite">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>منظومة مستر حبيب الرحمن المتكاملة (Pro Suite)</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              9 أدوات متخصصة للثانوية العامة والإعدادية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {proModules.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 transition-all text-right group flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        </section>

        {/* FULL STUDENT DASHBOARD CORE (Curriculum, Mistakes widget, Leaderboard, Tasks) */}
        <StudentDashboard
          onSelectCourse={(id) => router.push(`/?tab=courses&courseId=${encodeURIComponent(id)}`)}
          onOpenReport={() => router.push("/?tab=report")}
          onStartExam={() => router.push("/dashboard/exam-simulator")}
          onOpenCurriculum={(code) => router.push(`/?tab=curriculum${code ? `&grade=${encodeURIComponent(code)}` : ""}`)}
          onOpenMinistryAssessments={() => router.push("/?tab=ministry_assessments")}
          onOpenTranslation={() => router.push("/dashboard/translation")}
          onOpenMistakesBank={() => router.push("/dashboard/mistakes")}
          onOpenLeaderboard={() => router.push("/dashboard/leaderboard")}
        />
      </main>

      <Footer
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
