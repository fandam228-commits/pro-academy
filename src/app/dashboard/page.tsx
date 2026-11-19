"use client";

import React, { useState } from "react";
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
  ChevronDown,
} from "lucide-react";

function DashboardContent() {
  const { user, authLoading, lang } = useApp();
  const router = useRouter();
  const [showAllTools, setShowAllTools] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0E1E38] flex items-center justify-center text-[#EABF58] shadow-xl animate-pulse mb-3">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 animate-pulse">
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

  // Pro Suite Quick Access Modules (Secondary Services)
  const proModules = [
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
      desc: "قراءة صوتية، خرائط شخصيات، وروايات المنهج",
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
      title: "فلاش كاردز المفردات",
      desc: "تكرار متباعد ونطق صوتي بريطاني",
      href: "/dashboard/flashcards",
      icon: Layers,
      color: "from-cyan-600 to-blue-600",
      badge: "SRS",
    },
    {
      title: "تحدي الأصدقاء 1v1",
      desc: "معركة 5 أسئلة بـ 90 ثانية وشارك الرابط على واتساب",
      href: "/dashboard/challenge",
      icon: Swords,
      color: "from-amber-500 to-yellow-500",
      badge: "تحدي",
    },
    {
      title: "محاكي الامتحانات الشامل",
      desc: "مؤقت 3 ساعات وتصحيح وزاري فوري",
      href: "/dashboard/exam-simulator",
      icon: GraduationCap,
      color: "from-rose-600 to-red-600",
      badge: "3 ساعات",
    },
    {
      title: "بطاقة الطالب الذكية QR",
      desc: "باركود الحضور في السنتر واستلام المذكرات",
      href: "/dashboard/my-qr",
      icon: QrCode,
      color: "from-purple-600 to-pink-600",
      badge: "ID",
    },
    {
      title: "شحن كروت المنصة",
      desc: "تفعيل اشتراكات الكورسات الفورية",
      href: "/dashboard/activate",
      icon: CreditCard,
      color: "from-slate-700 to-slate-900",
      badge: "شحن",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#070C16] flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="dashboard"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 pb-24 md:pb-10">
        
        {/* =====================================================================
            FULL STUDENT DASHBOARD (PRIORITIZED: CONTINUE LEARNING, EXAMS, MISTAKES, TASKS)
        ===================================================================== */}
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

        {/* =====================================================================
            SECONDARY SERVICES: PRO SUITE EXTENSION (ACCORDION / REFINED)
            Revealed cleanly without cluttering the primary learning flow
        ===================================================================== */}
        <section aria-label="أدوات الأكاديمية المتخصصة">
          <div className="bg-white dark:bg-[#0D1829] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#EABF58] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-[#0E1E38] dark:text-white">
                    {lang === "ar" ? "أدوات الأكاديمية التخصصية (Pro Suite)" : "Pro Suite Specialized Tools"}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === "ar"
                      ? "خدمات الترجمة، القصص الأدبية، المقال، وتحديات 1v1 مجمعة في مكان واحد"
                      : "Translation, literature, essay lab and 1v1 peer challenges"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAllTools(!showAllTools)}
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllTools ? (lang === "ar" ? "طي الأدوات" : "Collapse") : (lang === "ar" ? "عرض الكل" : "Show All")}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllTools ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${showAllTools ? "" : "max-h-36 overflow-hidden sm:max-h-none"}`}>
              {proModules.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-400 hover:shadow-sm transition-all text-right group flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-white dark:bg-slate-700 text-[#0E1E38] dark:text-white border border-slate-200/60 dark:border-slate-600">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-xs text-[#0E1E38] dark:text-white group-hover:text-[#2563EB] transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

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
