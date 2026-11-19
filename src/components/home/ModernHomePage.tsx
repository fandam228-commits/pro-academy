"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Award,
  Trophy,
  Flame,
  ArrowRight,
  CheckCircle,
  BrainCircuit,
  Languages,
  Database,
  Film,
  FileText,
  ChevronRight,
  GraduationCap,
  Play,
  Calendar,
  Compass,
  ArrowUpRight,
  RotateCcw,
  Target,
  FileCheck,
  Video,
  Swords,
} from "lucide-react";
import { LiveClassroomSection } from "@/components/LiveClassroomSection";

export interface ModernHomePageProps {
  user: any;
  lang: "ar" | "en";
  setActiveTab: (tab: string) => void;
  setSelectedCourseId: (id: string | null) => void;
  stagesCourses: any[];
  favorites: any[];
  toggleFavorite: (course: any) => void;
}

export function ModernHomePage({
  user,
  lang,
  setActiveTab,
  setSelectedCourseId,
  stagesCourses,
  favorites,
  toggleFavorite,
}: ModernHomePageProps) {
  const [selectedStageTab, setSelectedStageTab] = useState<"all" | "secondary" | "preparatory">("all");

  const filteredCourses = stagesCourses.filter((c) => {
    if (selectedStageTab === "all") return true;
    if (selectedStageTab === "secondary") return c.grade?.includes("ثانوي") || c.grade?.includes("Secondary");
    if (selectedStageTab === "preparatory") return c.grade?.includes("إعدادي") || c.grade?.includes("Preparatory");
    return true;
  });

  return (
    <div className="space-y-10 sm:space-y-12 pb-20">
      
      {/* =========================================================================
          SECTION A: WELCOME HERO (REFINED, BALANCED, ELEGANT)
          Identity • Mr. Habib El Rahman • Motto Duaa
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F5FC] via-[#F8FAFC] to-white dark:from-[#0B1528] dark:via-[#080E1C] dark:to-[#070B14] pt-8 sm:pt-12 pb-10 sm:pb-14 border-b border-blue-100/60 dark:border-slate-800/80 transition-colors">
        {/* Subtle Ambient Radial Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-gradient-to-tr from-[#1E3A8A]/10 via-[#EABF58]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#1E3A8A_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] dark:opacity-[0.06] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          
          {/* 1. CENTRAL DUAA (ELEGANT & RESTFUL) */}
          <div className="inline-block animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-[#EABF58]/45 dark:border-[#EABF58]/30 shadow-md shadow-[#0E1E38]/5 text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-black text-[#0E1E38] dark:text-amber-100 tracking-wide font-serif leading-relaxed">
                « اللَّهُمَّ عَلِّمْنَا مَا يَنْفَعُنَا، وَانْفَعْنَا بِمَا عَلَّمْتَنَا »
              </p>
              <div className="mt-1 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-5 h-px bg-[#EABF58]/60 inline-block" />
                <span>مستر حبيب الرحمن</span>
                <span className="w-5 h-px bg-[#EABF58]/60 inline-block" />
              </div>
            </div>
          </div>

          {/* 2. MAIN BRAND TITLE & EDUCATIONAL MOTTO */}
          <div className="space-y-2 animate-in fade-in duration-500 delay-100">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0E1E38] dark:text-white tracking-tight font-sans">
                Professional Academy
              </h1>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#EABF58] text-[#0E1E38] shadow-xs">
                PRO
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EABF58]/15 dark:bg-[#EABF58]/10 text-[#92400E] dark:text-[#EABF58] text-xs font-black tracking-widest uppercase">
              <span>Learn</span>
              <span className="text-[#EABF58]">•</span>
              <span>Think</span>
              <span className="text-[#EABF58]">•</span>
              <span>Achieve</span>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto leading-relaxed pt-1">
              {lang === "ar"
                ? "رحلتك نحو التميز في اللغة الإنجليزية تبدأ من هنا."
                : "Your journey towards excellence in the English language starts here."}
            </p>
          </div>

          {/* =====================================================================
              SECTION B: QUICK START (EXACTLY 3 PRIMARY ACTIONS)
              1. ابدأ التعلم • 2. ابدأ التدريب • 3. تابع من حيث توقفت
          ===================================================================== */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
            
            {/* Action 1: ابدأ التعلم */}
            <button
              onClick={() => {
                const target = document.getElementById("courses-selection");
                if (target) target.scrollIntoView({ behavior: "smooth" });
                else setActiveTab("curriculum");
              }}
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-2xl bg-[#0E1E38] dark:bg-[#2563EB] hover:bg-[#162744] dark:hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-950/20 hover:-translate-y-0.5 transition-all cursor-pointer border border-[#EABF58]/40"
            >
              <BookOpen className="w-4 h-4 text-[#EABF58]" />
              <span>{lang === "ar" ? "ابدأ رحلتك التعليمية (ابدأ التعلم)" : "Start Learning"}</span>
            </button>

            {/* Action 2: ابدأ التدريب */}
            <button
              onClick={() => setActiveTab("training_center")}
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-2xl bg-[#EABF58] hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>{lang === "ar" ? "ابدأ التدريب" : "Start Practicing"}</span>
            </button>

            {/* Action 3: تابع من حيث توقفت */}
            <button
              onClick={() => setActiveTab(user ? "dashboard" : "auth")}
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0E1E38] dark:text-white font-extrabold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#2563EB] fill-current" />
              <span>{lang === "ar" ? "تابع من حيث توقفت" : "Resume Learning"}</span>
            </button>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION C: LEARNING OVERVIEW (FOCUS ON RELEVANT EDUCATIONAL PROGRESS)
          Current Course • Current Unit • Last Lesson • Completion %
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0D1829] rounded-3xl p-6 sm:p-7 border border-blue-100 dark:border-slate-800 shadow-md shadow-blue-900/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-3 flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 text-xs font-bold">
                <Compass className="w-3.5 h-3.5" />
                <span>{user ? `مسارك التعليمي: ${user.name}` : (lang === "ar" ? "مسار التعلم الموصى به" : "Recommended Learning Track")}</span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#0E1E38] dark:text-white truncate">
                  {user?.grade ? `منهج ${user.grade}` : (lang === "ar" ? "كورس الصف الثالث الثانوي 2026/2027 (الثانوية العامة)" : "Third Secondary Master Class 2026/2027")}
                </h2>
                <p className="text-xs sm:text-sm text-[#718096] dark:text-slate-400 mt-1">
                  {lang === "ar"
                    ? "الوحدة الحالية: Unit 1 — Inside the World of Care • مهارات القواعد والترجمة وركن القصة"
                    : "Current Unit: Unit 1 — Inside the World of Care • Grammar, Vocab & Story Analysis"}
                </p>
              </div>

              {/* Learning Progress Bar */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 max-w-md bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#2563EB] to-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${user?.completedLessons ? Math.min(100, user.completedLessons * 8) : 45}%` }}
                  />
                </div>
                <span className="text-xs font-black text-[#2563EB] dark:text-sky-400">
                  {user?.completedLessons ? `${Math.min(100, user.completedLessons * 8)}% مكتمل` : "45% مكتمل"}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setActiveTab("curriculum")}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === "ar" ? "متابعة الدرس الحالي" : "Resume Lesson"}</span>
              </button>

              <button
                onClick={() => setActiveTab("mistakes_bank")}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-300 dark:border-amber-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>{lang === "ar" ? "بنك أخطائي الذكي" : "Mistakes Bank"}</span>
              </button>
            </div>

              <button
                onClick={() => setActiveTab("arena")}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Swords className="w-4 h-4 text-purple-500" />
                <span>{lang === "ar" ? "حلبة التحدي 1v1" : "1v1 Quiz Arena"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: EXPLORE (SMALL, ORGANIZED SELECTION OF 4 CORE PILLARS)
          Not dumping all features — progressive disclosure with clear categories
      ========================================================================= */}
      <section id="courses-selection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {lang === "ar" ? "استكشف محاور الأكاديمية" : "Academy Pillars"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0E1E38] dark:text-white mt-0.5">
              {lang === "ar" ? "أهم بوابات التعلم والتدريب" : "Core Learning Destinations"}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab("courses")}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === "ar" ? "عرض جميع الكورسات" : "View All Courses"}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Pillar 1: المناهج والصفوف الرسمية */}
          <div
            onClick={() => setActiveTab("curriculum")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1829] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white group-hover:text-[#2563EB] transition-colors">
                {lang === "ar" ? "المناهج والصفوف الرسمية" : "Official Curriculum"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {lang === "ar"
                  ? "وحدات المنهج المعتمدة للمراحل الإعدادية والثانوية وتانية بكالوريا 2027."
                  : "All curriculum units for prep and secondary stages including Baccalaureate 2027."}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#2563EB] pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>{lang === "ar" ? "تصفح الوحدات" : "Open Units"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2: مركز التدريب وبنك الأسئلة */}
          <div
            onClick={() => setActiveTab("training_center")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1829] border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#EABF58] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white group-hover:text-amber-500 transition-colors">
                {lang === "ar" ? "مركز التدريب والامتحانات" : "Training Center"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {lang === "ar"
                  ? "أكثر من 894 سؤال مصنف مع نظام التبديل الذكي ضد التسريب وتصحيح فوري."
                  : "Over 894 categorized MCQs powered by the anti-leak Smart Shuffle Engine."}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>{lang === "ar" ? "ابدأ التدريب" : "Practice Now"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3: أكاديمية الترجمة وعالم اللغة */}
          <div
            onClick={() => setActiveTab("translation")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1829] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white group-hover:text-indigo-600 transition-colors">
                {lang === "ar" ? "أكاديمية الترجمة الاحترافية" : "Translation Academy"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {lang === "ar"
                  ? "8 مسارات تدريبية و14 نمط أسئلة وتقييم بالمعايير الخمسة مع تصحيح ذكي."
                  : "8 training modules and 14 question formats with rubric-based bilingual feedback."}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>{lang === "ar" ? "دخول الأكاديمية" : "Enter Academy"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 4: قاعة البث المباشر والمذكرات */}
          <div
            onClick={() => setActiveTab("calendar")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1829] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[#0E1E38] dark:text-white group-hover:text-emerald-600 transition-colors">
                {lang === "ar" ? "قاعة البث والمذكرات" : "Live Classes & Notes"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {lang === "ar"
                  ? "حصص جوجل ميت التفاعلية ومكتبة مذكرات الشرح بصيغة PDF قابلة للعرض."
                  : "Google Meet interactive live lectures and downloadable protected PDF notes."}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>{lang === "ar" ? "عرض الجدول" : "View Schedule"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          COURSES PREVIEW (SECONDARY & PREP SELECTION)
      ========================================================================= */}
      <section id="courses-selection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {lang === "ar" ? "الصفوف الدراسية" : "Grade Stages"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0E1E38] dark:text-white mt-0.5">
              {lang === "ar" ? "اختر مرحلتك وصفك الدراسي" : "Select Your Stage"}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedStageTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedStageTab === "all" ? "bg-[#2563EB] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {lang === "ar" ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setSelectedStageTab("secondary")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedStageTab === "secondary" ? "bg-[#2563EB] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {lang === "ar" ? "المرحلة الثانوية" : "Secondary"}
            </button>
            <button
              onClick={() => setSelectedStageTab("preparatory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedStageTab === "preparatory" ? "bg-[#2563EB] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {lang === "ar" ? "المرحلة الإعدادية" : "Preparatory"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="p-4 sm:p-5 space-y-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#2563EB] dark:text-blue-300">
                  {c.badge}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#0E1E38] dark:text-white group-hover:text-[#2563EB] transition-colors leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {c.price}
                  </span>
                  {c.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through mt-0.5">{c.originalPrice}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  <span>{lang === "ar" ? "تصفح الوحدات" : "Inspect"}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION E: ACHIEVEMENTS & STUDY STREAK (CALM, SECONDARY AREA)
          Points • Streaks • Level • Weekly Leaderboard
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F8FAFC] dark:bg-[#0A101D] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#EABF58] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-[#0E1E38] dark:text-white">
                {lang === "ar" ? "نقاط التميز والتتابع اليومي (Gamification)" : "Excellence Points & Daily Streak"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === "ar"
                  ? "حل التدريبات اليومية وشارك في تحديات 1v1 لزيادة نقاطك والتصدر في لوحة الشرف الأسبوعية."
                  : "Practice daily and compete in 1v1 challenges to climb the weekly leaderboard."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>{user?.streak || 1} {lang === "ar" ? "يوم تتابع" : "days"}</span>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <Trophy className="w-4 h-4 text-[#EABF58]" />
              <span>{user?.points || 150} XP</span>
            </div>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className="px-4 py-1.5 rounded-xl bg-[#0E1E38] dark:bg-[#2563EB] text-white font-bold text-xs hover:bg-[#162744] transition cursor-pointer"
            >
              {lang === "ar" ? "لوحة الأوائل ←" : "Leaderboard →"}
            </button>
          </div>
        </div>
      </section>

      {/* LIVE CLASSROOM DOCK (GOOGLE MEET SESSIONS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiveClassroomSection />
      </div>

    </div>
  );
}
