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
  FileCheck,
  FileText,
  ChevronRight,
  GraduationCap,
  Star,
  Play,
  Heart,
  Calendar,
  Video,
  Layers,
  Search,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { LiveClassroomSection } from "@/components/LiveClassroomSection";

interface ModernHomePageProps {
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
    <div className="space-y-12 md:space-y-16 pb-20">
      {/* =========================================================================
          1. HERO SECTION WITH MR. HABIB EL RAHMAN'S ORIGINAL ANIMATED GIF
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E8F3FF] via-[#F7F9FC] to-[#F7F9FC] pt-8 pb-12 md:py-16 border-b border-blue-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Welcome & Tagline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              {/* Official Verified Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 text-[#2563EB] shadow-sm text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#EABF58]" />
                <span>
                  {lang === "ar"
                    ? "المنصة التعليمية الرسمية لمستر حبيب الرحمن • 2026/2027"
                    : "Official English Learning Platform • 2026/2027"}
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#243247] tracking-tight leading-tight">
                  {lang === "ar" ? (
                    <>
                      اتعلم الإنجليزي بذكاء مع{" "}
                      <span className="text-[#2563EB]">مستر حبيب الرحمن</span>
                    </>
                  ) : (
                    <>
                      Master English with{" "}
                      <span className="text-[#2563EB]">Mr. Habib El Rahman</span>
                    </>
                  )}
                </h1>
                <p className="text-base sm:text-lg font-bold text-[#EABF58]">
                  {lang === "ar"
                    ? "فكر بالإنجليزية، وترجم وتحدث بثقة."
                    : "Think in English. Translate with Confidence."}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {lang === "ar"
                  ? "شرح مبسط، ومراجعة مكثفة، وتدريب تفاعلي على أحدث مواصفات امتحانات الثانوية العامة والمرحلة الإعدادية. بنك أسئلة ذكي يضمن عدم تكرار النماذج، وعالم قصص أدبي غني بالنطق والتحديات."
                  : "Curriculum-aligned video lessons, a verified Thanawya Amma question bank, smart shuffle exams, and an immersive literary story world designed for top performance."}
              </p>

              {/* Action Buttons Grid */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("courses")}
                  className="px-6 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === "ar" ? "ابدأ التعلم الآن" : "Start Learning"}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>

                <button
                  onClick={() => setActiveTab("training_center")}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#2563EB] font-bold text-sm border border-blue-200/80 shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-[#EABF58]" />
                  <span>{lang === "ar" ? "مركز التدريب والامتحانات" : "Training Center"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("dialogues")}
                  className="px-6 py-3.5 rounded-2xl bg-[#E8F3FF] hover:bg-blue-100 text-[#2563EB] font-black text-sm border border-blue-300 shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                  <span>{lang === "ar" ? "مركز المحادثة (94 محادثة)" : "Dialogue Center"}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2563EB] text-white font-black">NEW</span>
                </button>

                <button
                  onClick={() => setActiveTab("translation")}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-blue-500/10 hover:from-amber-500/20 hover:to-blue-500/20 text-[#243247] font-bold text-sm border border-amber-300/60 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Languages className="w-4 h-4 text-[#EABF58]" />
                  <span>{lang === "ar" ? "أكاديمية الترجمة" : "Translation Academy"}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EABF58] text-slate-950 font-black">PRO</span>
                </button>

                <button
                  onClick={() => setActiveTab("story_world")}
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#718096] hover:text-[#243247] font-semibold text-sm border border-slate-200 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Film className="w-4 h-4 text-indigo-500" />
                  <span>{lang === "ar" ? "عالم القصص" : "Story World"}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs font-semibold text-[#718096]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>{lang === "ar" ? "منهج الوزارة الرسمي 2026/2027" : "Official Ministry Syllabus"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>{lang === "ar" ? "894+ سؤال ثانوية عامة مصنف" : "894+ Verified Questions"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>{lang === "ar" ? "تبديل ذكي يمنع تسريب الإجابات" : "Anti-Leak Smart Shuffle"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Original Animated Teacher GIF Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-3 sm:p-4 border border-blue-100 shadow-xl shadow-blue-900/10 space-y-3 transition-transform hover:scale-[1.01]">
                {/* Visual Animated Hero Container */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[6/5] flex items-center justify-center shadow-inner">
                  <picture>
                    <source srcSet="/habib-hero-static.png" media="(prefers-reduced-motion: reduce)" />
                    <img
                      src="/habib-hero.gif"
                      alt="Mr. Habib El Rahman - English Educator"
                      className="w-full h-full object-cover object-center"
                      width={360}
                      height={300}
                      loading="eager"
                    />
                  </picture>

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#243247] text-[11px] font-black shadow flex items-center gap-1.5 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    <span>{lang === "ar" ? "مباشر وتفاعلي" : "Live & Interactive"}</span>
                  </div>

                  {/* Bottom Verification Label */}
                  <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-slate-200 flex items-center justify-between text-right">
                    <div>
                      <h4 className="text-xs font-black text-[#243247]">
                        {lang === "ar" ? "مستر / حبيب الرحمن" : "Mr. Habib El Rahman"}
                      </h4>
                      <p className="text-[10px] text-[#718096] font-medium">
                        {lang === "ar" ? "خبير لغة إنجليزية ومُعد أوائل الجمهورية" : "Senior English Expert & Mentor"}
                      </p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  </div>
                </div>

                {/* Sub-card Stats Line */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-[#F7F9FC] border border-slate-200/60">
                    <div className="text-xs font-extrabold text-[#2563EB]">10+</div>
                    <div className="text-[10px] text-[#718096]">{lang === "ar" ? "سنوات خبرة" : "Years Exp"}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F9FC] border border-slate-200/60">
                    <div className="text-xs font-extrabold text-[#EABF58]">100%</div>
                    <div className="text-[10px] text-[#718096]">{lang === "ar" ? "مواصفات الوزارة" : "Official Spec"}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F9FC] border border-slate-200/60">
                    <div className="text-xs font-extrabold text-[#10B981]">24/7</div>
                    <div className="text-[10px] text-[#718096]">{lang === "ar" ? "دعم ومتابعة" : "Active Study"}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CONTINUE LEARNING CARD (بطاقة متابعة التعلم)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-md shadow-blue-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3FF] text-[#2563EB] text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>{user ? `مرحباً بك، ${user.name}` : (lang === "ar" ? "مسارك التعليمي المخصص" : "Your Learning Path")}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#243247]">
              {user
                ? (lang === "ar" ? `متابعة دروس ${user.grade || "الصف الدراسي"}` : `Continue ${user.grade || "Your Grade"}`)
                : (lang === "ar" ? "ابدأ تجربة التعلم الذكي خطوة بخطوة" : "Start your smart learning journey today")}
            </h3>
            <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
              {lang === "ar"
                ? "تابع من حيث توقفت في آخر درس، واختبر استيعابك بأسئلة فورية مع شرح تفصيلي لكل قاعدة ومفردة."
                : "Pick up right where you left off. Practice with instant explanations and track your mastery."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {user ? (
              <button
                onClick={() => setActiveTab("curriculum")}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === "ar" ? "متابعة الدرس الحالي" : "Resume Lesson"}</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("auth")}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{lang === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Register"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}

            <button
              onClick={() => setActiveTab("placement")}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#F7F9FC] hover:bg-slate-100 text-[#243247] font-semibold text-sm border border-slate-200 transition"
            >
              {lang === "ar" ? "اختبار تحديد المستوى" : "Placement Test"}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STUDENT PROGRESS OVERVIEW (نظرة عامة على الإنجاز)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8F3FF] text-[#2563EB] flex items-center justify-center text-xl flex-shrink-0">
              📚
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#243247]">
                {user?.completedLessons || 12}
              </div>
              <div className="text-xs text-[#718096] font-medium">
                {lang === "ar" ? "دروس مكتملة" : "Completed Lessons"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#EABF58] flex items-center justify-center text-xl flex-shrink-0">
              📝
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#243247]">
                {user?.examsPassed || 8}
              </div>
              <div className="text-xs text-[#718096] font-medium">
                {lang === "ar" ? "امتحانات مجتازة" : "Passed Exams"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl flex-shrink-0">
              🔥
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#243247]">
                {user?.streak || 1} {lang === "ar" ? "يوم" : "days"}
              </div>
              <div className="text-xs text-[#718096] font-medium">
                {lang === "ar" ? "تتابع يومي مستمر" : "Daily Streak"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center text-xl flex-shrink-0">
              🏆
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#243247]">
                {user?.points || 150}
              </div>
              <div className="text-xs text-[#718096] font-medium">
                {lang === "ar" ? "نقاط التميز" : "Points"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. GRADE & COURSE SELECTION (صفوف المراحل الإعدادية والثانوية)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {lang === "ar" ? "المناهج الدراسية المعتمدة" : "Curriculum & Courses"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#243247] mt-1">
              {lang === "ar" ? "اختر مرحلتك وصفك الدراسي" : "Select Your Stage & Grade"}
            </h2>
          </div>

          {/* Stage Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/80">
            <button
              onClick={() => setSelectedStageTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedStageTab === "all" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#718096] hover:text-[#243247]"
              }`}
            >
              {lang === "ar" ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setSelectedStageTab("secondary")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedStageTab === "secondary" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#718096] hover:text-[#243247]"
              }`}
            >
              {lang === "ar" ? "المرحلة الثانوية" : "Secondary"}
            </button>
            <button
              onClick={() => setSelectedStageTab("preparatory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedStageTab === "preparatory" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#718096] hover:text-[#243247]"
              }`}
            >
              {lang === "ar" ? "المرحلة الإعدادية" : "Preparatory"}
            </button>
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-44 overflow-hidden relative bg-slate-100">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 start-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-white/90 text-[#243247] shadow backdrop-blur">
                    {c.badge}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(c);
                    }}
                    className={`absolute top-3 end-3 p-2 rounded-xl backdrop-blur-md shadow-sm border transition-all ${
                      favorites.find((f) => f.id === c.id)
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white/80 text-slate-400 hover:text-rose-500 border-white/60"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.find((f) => f.id === c.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-bold text-[#2563EB]">{c.grade}</span>
                  <h3 className="font-extrabold text-base text-[#243247] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#718096] line-clamp-2 leading-relaxed">{c.desc}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-sm font-black text-[#EABF58]">{c.price}</span>
                <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  <span>{lang === "ar" ? "تصفح المنهج" : "Inspect"}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. PROFESSIONAL TRAINING CENTER BANNER (مركز التدريب والامتحانات)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-blue-600/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4 text-center sm:text-start">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold inline-block">
              {lang === "ar" ? "بنك الأسئلة والتدريب الذكي" : "Smart Training Center"}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              {lang === "ar" ? "مركز التدريب والامتحانات التفاعلية" : "Interactive Training & Exam Arena"}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {lang === "ar"
                ? "أكثر من 894 سؤال ثانوية عامة مصنف بدقة، مع معيار الـ 4 اختيارات ونظام التبديل الذكي (Smart Shuffle Engine). لا توجد أسئلة مكررة أو مسربة."
                : "Standardized 4-option MCQs powered by the anti-leak Smart Shuffle Engine with instant grading and in-depth explanations."}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => setActiveTab("training_center")}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#2563EB] font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-[#EABF58]" />
                <span>{lang === "ar" ? "ابدأ التدريب الآن" : "Start Practicing"}</span>
              </button>
              <button
                onClick={() => setActiveTab("question_bank")}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition cursor-pointer"
              >
                {lang === "ar" ? "تصفح بنك الأسئلة الشامل" : "Question Bank"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5.1 PROFESSIONAL DIALOGUE CENTER (مركز المحادثة الإنجليزية التفاعلي)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-blue-200/80 shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-start max-w-2xl">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E8F3FF] text-[#2563EB] text-xs font-black">
                  {lang === "ar" ? "94 محادثة وزارية معتمدة" : "94 Authentic Dialogues"}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                  {lang === "ar" ? "استراتيجية 2025 لمستر حبيب الرحمن" : "2025 Exam Strategy"}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#243247]">
                {lang === "ar" ? "مركز المحادثة الإنجليزية التفاعلي (Professional Dialogue Center)" : "Professional English Dialogue Center"}
              </h3>

              <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
                {lang === "ar"
                  ? "تدريب شامل على السؤال الأول في الامتحان الرسمي لجميع صفوف المرحلة الإعدادية (أولى، ثانية، ثالثة إعدادي) مع محاكاة كاملة، تدريب فوري بالذكاء الاصطناعي، وقبول كافة البدائل الوزارية الصحيحة."
                  : "Complete interactive dialogue center for preparatory grades covering Question 1 in official Egyptian ministry exams with 4 learning modes."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {[
                  { title: "أولى إعدادي", count: "25 محادثة", file: "prep111" },
                  { title: "تانية إعدادي", count: "27 محادثة", file: "prep 2" },
                  { title: "تالتة إعدادي", count: "32 محادثة", file: "prep 3" },
                  { title: "مراجعة 2025", count: "10 امتحانات", file: "Revision" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F7F9FC] border border-slate-200/80 text-center">
                    <div className="text-xs font-black text-[#2563EB]">{item.title}</div>
                    <div className="text-[11px] text-[#718096] font-bold mt-0.5">{item.count}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => setActiveTab("dialogues")}
                  className="px-6 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>{lang === "ar" ? "ابدأ التدريب على المحادثات الآن" : "Start Practicing Dialogues"}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Illustration Card */}
            <div className="w-full lg:w-72 shrink-0 p-6 rounded-2xl bg-[#E8F3FF] border border-blue-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="text-base font-black text-[#243247]">مواصفات 2025 الرسمية</div>
              <div className="text-xs text-[#718096] leading-relaxed">
                5 درجات كاملة على سؤال المحادثة، مع شرح طريقة المقص ومعادلة Wh-Questions وقائمة الأفعال المساعدة.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. PROFESSIONAL STORY WORLD SHOWCASE (عالم القصص والروايات)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {lang === "ar" ? "الروايات الأدبية المقررة" : "Literary Story World"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#243247] mt-1">
              {lang === "ar" ? "عالم القصص والروايات التفاعلي" : "Professional Story World"}
            </h2>
          </div>

          <button
            onClick={() => setActiveTab("story_world")}
            className="text-xs font-bold text-[#2563EB] flex items-center gap-1 hover:underline"
          >
            <span>{lang === "ar" ? "دخول عالم القصص الكامل" : "Enter Story World"}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              titleAr: "العجوز والبحر",
              titleEn: "The Old Man and the Sea",
              author: "Ernest Hemingway",
              grade: "الصف الأول الثانوي",
              cover: "🌊",
              desc: "قصة الصبر والعزيمة ومواجهة تحديات البحر الكبرى لسانتياغو العجوز.",
            },
            {
              titleAr: "حول العالم في ثمانين يوماً",
              titleEn: "Around the World in Eighty Days",
              author: "Jules Verne",
              grade: "الصف الثاني الثانوي",
              cover: "🚂",
              desc: "رحلة فيلياس فوغ المدهشة لإثبات الدقة وحساب الوقت وتجاوز كل الصعاب.",
            },
            {
              titleAr: "كونت دي مونت كريستو",
              titleEn: "The Count of Monte Cristo",
              author: "Alexandre Dumas",
              grade: "الصف الثالث الثانوي",
              cover: "🏰",
              desc: "ملحمة إدموند دانتيس في الصبر والعدالة واكتشاف أسرار الحكمة والأمل.",
            },
          ].map((st, sIdx) => (
            <div
              key={sIdx}
              onClick={() => setActiveTab("story_world")}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl p-3 rounded-2xl bg-[#E8F3FF] flex items-center justify-center">
                  {st.cover}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-[#718096]">
                  {st.grade}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#243247] group-hover:text-[#2563EB] transition-colors">
                  {st.titleAr} ({st.titleEn})
                </h3>
                <p className="text-xs text-[#2563EB] font-medium">{st.author}</p>
                <p className="text-xs text-[#718096] leading-relaxed pt-1">{st.desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
                <span>{lang === "ar" ? "قراءة واستماع ومحادثة" : "Read & Listen"}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. LIVE CLASSROOM SECTION (GOOGLE MEET)
      ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiveClassroomSection />
      </div>

      {/* =========================================================================
          8. MORE EDUCATIONAL SERVICES (المزيد من الخدمات التعليمية)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            {lang === "ar" ? "خدمات مدمجة متقدمة" : "Additional Services"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#243247] mt-1">
            {lang === "ar" ? "كل ما تحتاجه للتفوق في مكان واحد" : "Everything You Need in One Place"}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setActiveTab("ministry_assessments")}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#EABF58] mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              📋
            </div>
            <div className="text-xs font-bold text-[#243247] group-hover:text-[#2563EB]">
              {lang === "ar" ? "تقييمات الوزارة" : "Ministry Exams"}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("pdfs")}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F3FF] text-[#2563EB] mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              📄
            </div>
            <div className="text-xs font-bold text-[#243247] group-hover:text-[#2563EB]">
              {lang === "ar" ? "مكتبة المذكرات" : "PDF Library"}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("grammar")}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🧠
            </div>
            <div className="text-xs font-bold text-[#243247] group-hover:text-[#2563EB]">
              {lang === "ar" ? "شروحات القواعد" : "Grammar Library"}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("ai_assistant")}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div className="text-xs font-bold text-[#243247] group-hover:text-[#2563EB]">
              {lang === "ar" ? "المساعد الذكي" : "AI Assistant"}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("homework")}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              ✏️
            </div>
            <div className="text-xs font-bold text-[#243247] group-hover:text-[#2563EB]">
              {lang === "ar" ? "الواجبات والتصحيح" : "Homework"}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("gamification")}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#EABF58] mx-auto flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🎖️
            </div>
            <div className="text-xs font-bold text-[#243247] group-hover:text-[#2563EB]">
              {lang === "ar" ? "لوحة الأوائل والشارات" : "Leaderboard"}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
