"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ShieldCheck,
  BrainCircuit,
  Languages,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Flame,
  Award,
  Star,
  Users,
  Video,
  Check,
  ChevronDown,
  X,
  Menu,
  Phone,
  Lock,
  Layers,
  TrendingUp,
  Clock,
  Sparkle,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { AuthScreen } from "@/components/AuthScreen";

interface LandingPageProps {
  onLoginSuccess?: () => void;
  defaultAuthMode?: "login" | "register" | null;
}

export function LandingPage({ onLoginSuccess, defaultAuthMode = null }: LandingPageProps) {
  // Auth Modal State
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "login" | "register";
  }>({
    isOpen: !!defaultAuthMode,
    mode: defaultAuthMode || "login",
  });

  // Video Tour Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mini-Quiz Widget State
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);

  // Check URL params on mount for ?auth=login or ?auth=register
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get("auth");
      if (authParam === "login" || authParam === "register") {
        setAuthModal({ isOpen: true, mode: authParam });
      }
    } catch {}
  }, []);

  const openAuth = (mode: "login" | "register") => {
    setAuthModal({ isOpen: true, mode });
    setMobileMenuOpen(false);
  };

  const closeAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#243247] antialiased selection:bg-[#2563EB] selection:text-white" dir="rtl">
      
      {/* =========================================================================
          A. STICKY NAVBAR
          Brand | Center Navigation Links | Action Buttons (Login / Register)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Right: Brand Logo & Title */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-100">
                <GraduationCap className="w-6 h-6 text-[#EABF58]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-[#0E1E38] tracking-tight font-inter">
                    Professional Academy
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#EABF58]/15 border border-[#EABF58]/40 text-[#92400E] text-[10px] font-black">
                    2026/2027
                  </span>
                </div>
                <span className="text-xs font-bold text-[#2563EB]">
                  Mr. Habib El Rahman
                </span>
              </div>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => scrollToSection("hero")}
                className="px-3 py-2 rounded-xl text-sm font-bold text-[#243247] hover:text-[#2563EB] hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="px-3 py-2 rounded-xl text-sm font-bold text-[#718096] hover:text-[#2563EB] hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                مميزات المنصة
              </button>
              <button
                onClick={() => scrollToSection("stages")}
                className="px-3 py-2 rounded-xl text-sm font-bold text-[#718096] hover:text-[#2563EB] hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                المراحل الدراسية
              </button>
              <button
                onClick={() => scrollToSection("quiz")}
                className="px-3 py-2 rounded-xl text-sm font-bold text-[#718096] hover:text-[#2563EB] hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                جرّب بنفسك
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="px-3 py-2 rounded-xl text-sm font-bold text-[#718096] hover:text-[#2563EB] hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                آراء الطلاب
              </button>
            </nav>

            {/* Left: Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => openAuth("login")}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black border border-slate-300 hover:border-[#2563EB] text-[#243247] hover:text-[#2563EB] hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => openAuth("register")}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#1E40AF] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                أنشئ حسابك مجاناً
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => openAuth("login")}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-blue-50 text-[#2563EB] border border-blue-200"
              >
                دخول
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#243247] hover:bg-slate-100 transition-colors"
                aria-label="القائمة الرئيسية"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-right px-3 py-2.5 rounded-xl text-sm font-bold text-[#243247] hover:bg-blue-50"
              >
                الرئيسية
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-right px-3 py-2.5 rounded-xl text-sm font-bold text-[#718096] hover:bg-blue-50"
              >
                مميزات المنصة
              </button>
              <button
                onClick={() => scrollToSection("stages")}
                className="text-right px-3 py-2.5 rounded-xl text-sm font-bold text-[#718096] hover:bg-blue-50"
              >
                المراحل الدراسية
              </button>
              <button
                onClick={() => scrollToSection("quiz")}
                className="text-right px-3 py-2.5 rounded-xl text-sm font-bold text-[#718096] hover:bg-blue-50"
              >
                جرّب بنفسك
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-right px-3 py-2.5 rounded-xl text-sm font-bold text-[#718096] hover:bg-blue-50"
              >
                آراء الطلاب
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => openAuth("register")}
                className="w-full py-3 rounded-2xl text-center text-sm font-black bg-[#2563EB] text-white shadow-md shadow-blue-600/20"
              >
                أنشئ حسابك مجاناً
              </button>
              <button
                onClick={() => openAuth("login")}
                className="w-full py-2.5 rounded-2xl text-center text-sm font-black border border-slate-200 text-[#243247]"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          B. HERO SECTION (2-Column Grid)
          Right Column: Copy & CTAs • Left Column: Interactive UI Dashboard Card
      ========================================================================= */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#F0F5FC] via-[#F8FAFC] to-white pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/70">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[480px] h-[480px] bg-[#EABF58]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Right Column (Content) */}
            <div className="lg:col-span-7 space-y-6 text-right">
              
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-[#1E40AF] text-xs sm:text-sm font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span>العام الدراسي 2026 / 2027 • للمرحلتين الإعدادية والثانوية</span>
              </div>

              {/* H1 Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-[#0E1E38] leading-[1.25] tracking-tight">
                اتقن اللغة الإنجليزية واضمن الدرجة النهائية بأحدث نظام تفاعلي
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                مع مستر حبيب الرحمن، ودّع الحفظ التقليدي. شرح مبسط، بنك أسئلة ذكي، أكاديمية متكاملة للترجمة، ومتابعة دورية تضعك في صدارة المتفوقين.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => openAuth("register")}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-base font-black shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <span>ابدأ رحلة التفوق الآن</span>
                  <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-[#243247] hover:text-[#2563EB] text-sm sm:text-base font-bold shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span>شاهد جولة داخل المنصة (دقيقتين)</span>
                </button>
              </div>

              {/* Trust Micro-bar */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm font-bold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>شرح مطابق لأحدث مواصفات الوزارة</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تصحيح فوري وشرح لكل إجابة</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تقارير متابعة لولي الأمر</span>
                </div>
              </div>

            </div>

            {/* Left Column (Visual - Interactive UI Dashboard Preview Card) */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-amber-300/20 rounded-3xl blur-2xl -z-10" />

              {/* Main Preview Card */}
              <div className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-900/10 space-y-5">
                
                {/* Mockup Header: Student Identity */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                      أ.م
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-[#0E1E38]">أحمد سامي</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-black text-[#2563EB]">
                          طالب PRO
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">الصف الثالث الثانوي • دفعة 2027</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#EABF58] bg-amber-50 px-2.5 py-1 rounded-xl text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>الأول على الشعبة</span>
                  </div>
                </div>

                {/* Progress Widget */}
                <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-[#0E1E38]">مؤشر الإتقان العام</span>
                    <span className="font-black text-[#2563EB] text-sm">نسبة الإتقان 94%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2563EB] to-emerald-500 rounded-full transition-all duration-1000 w-[94%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>تم حل 482 سؤالاً هذا الشهر</span>
                    <span className="text-emerald-600 font-bold">↑ +8% عن الأسبوع الماضي</span>
                  </div>
                </div>

                {/* Widgets Grid: Streak & Grammar Badge */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Streak Widget */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/70 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 block">سلسلة الالتزام</span>
                      <span className="text-sm font-black text-amber-950">15 يوم متواصل</span>
                    </div>
                  </div>

                  {/* Grammar Mastery Badge */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-900 block">شعار القواعد الأخير</span>
                      <span className="text-xs font-black text-blue-950">Inversion • متقن ⭐</span>
                    </div>
                  </div>

                </div>

                {/* Mini System Action Feed */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>امتحان الوحدة الثالثة: 49 / 50</span>
                    </div>
                    <span className="text-[10px] text-slate-400">اليوم 10:30 ص</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <Phone className="w-4 h-4 text-[#2563EB]" />
                      <span>إرسال التقرير الذكي لولي الأمر</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">تم الإرسال ✓</span>
                  </div>
                </div>

              </div>

              {/* Floating Floating Badges */}
              <div className="hidden sm:flex absolute -bottom-5 -right-5 items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-blue-100 text-xs font-black text-[#0E1E38] animate-bounce duration-1000">
                <Sparkles className="w-4 h-4 text-[#EABF58]" />
                <span>+10,000 سؤال بنظام التابلت</span>
              </div>

              <div className="hidden sm:flex absolute -top-5 -left-5 items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0E1E38] shadow-xl border border-slate-700 text-xs font-black text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>تشفير جلسات scrypt معتمد</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          C. SOCIAL PROOF STATS BAR
          4 High-Contrast Metrics
      ========================================================================= */}
      <section className="bg-gradient-to-r from-[#0E1E38] via-[#1E3A8A] to-[#0E1E38] text-white py-10 px-4 sm:px-6 lg:px-8 border-y border-[#EABF58]/30 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-blue-800/60">
            
            {/* Stat 1 */}
            <div className="pt-4 sm:pt-0 space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-[#EABF58] tracking-tight font-inter">
                +10,000
              </span>
              <span className="block text-sm sm:text-base font-bold text-white">
                سؤال تفاعلي بنظام الامتحان الحديث
              </span>
              <span className="block text-xs text-blue-200/80">
                مقسمة حسب نواتج التعلم
              </span>
            </div>

            {/* Stat 2 */}
            <div className="pt-4 sm:pt-0 space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-[#EABF58] tracking-tight font-inter">
                +500
              </span>
              <span className="block text-sm sm:text-base font-bold text-white">
                فيديو شرح عالي الجودة
              </span>
              <span className="block text-xs text-blue-200/80">
                بأحدث تقنيات التصوير والمونتاج
              </span>
            </div>

            {/* Stat 3 */}
            <div className="pt-4 sm:pt-0 space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-[#EABF58] tracking-tight font-inter">
                98%
              </span>
              <span className="block text-sm sm:text-base font-bold text-white">
                نسبة رضا الطلاب وأولياء الأمور
              </span>
              <span className="block text-xs text-blue-200/80">
                استبيانات الفصل الدراسي 2026
              </span>
            </div>

            {/* Stat 4 */}
            <div className="pt-4 sm:pt-0 space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-[#EABF58] tracking-tight font-inter">
                24/7
              </span>
              <span className="block text-sm sm:text-base font-bold text-white">
                دعم فني وأكاديمي مستمر
              </span>
              <span className="block text-xs text-blue-200/80">
                متابعة وإجابة فورية على الاستفسارات
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          D. CORE FEATURES GRID ("أركان المنصة")
          4 Cards (2x2 on desktop, 1 col on mobile)
      ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 text-[#2563EB] text-xs font-black border border-blue-200">
              أركان المنصة المتكاملة
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0E1E38] tracking-tight">
              كل ما تحتاجه للتفوق في مكان واحد
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              منظومة تعليمية متكاملة مصممة خصيصاً لتطوير مهاراتك خطوة بخطوة من التأسيس حتى الامتحانات النهائية.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Card 1: بنك الأسئلة الذكي */}
            <div className="p-8 rounded-3xl bg-[#F7F9FC] hover:bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0E1E38]">
                بنك الأسئلة الذكي
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                آلاف الأسئلة المتدرجة في الصعوبة على كل وحدة، مع بنك أخطاء تلقائي يجمع الأسئلة التي أخطأت فيها لتتدرب عليها حتى تتقنها تماماً.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#2563EB]">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50">توزيع غير نمطي للأجوبة</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50">تبديل ذكي يمنع التسريب</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50">شرح فوري لكل اختيار</span>
              </div>
            </div>

            {/* Card 2: أكاديمية الترجمة */}
            <div className="p-8 rounded-3xl bg-[#F7F9FC] hover:bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                <Languages className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0E1E38]">
                أكاديمية الترجمة
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                تدريبات مكثفة على مهارات الترجمة (من وإلى الإنجليزية) بأسلوب تفاعلي يعلمك بناء الجملة السليم واختيار المصطلحات الدقيقة.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-700">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50">قاموس ناطق مصاحب</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50">ترجمة قطاعات الصحف</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50">تحليل التراكيب الشائعة</span>
              </div>
            </div>

            {/* Card 3: عالم القصص الأدبي */}
            <div className="p-8 rounded-3xl bg-[#F7F9FC] hover:bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0E1E38]">
                عالم القصص الأدبي
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                تحليل شامل للأحداث والشخصيات، مع استماع صوتي للنصوص وأسئلة التفكير النقدي (Critical Thinking) التي تضمن لك درجات القصة كاملة.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-amber-800">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50">مطابقة كتب الوزارة 2027</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50">نطق صوتي بريطاني وأمريكي</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50">حوارات الشخصيات التفاعلية</span>
              </div>
            </div>

            {/* Card 4: متابعة دقيقة وتقارير */}
            <div className="p-8 rounded-3xl bg-[#F7F9FC] hover:bg-white border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#0E1E38]">
                متابعة دقيقة وتقارير
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                لوحة تحكم ذكية تقيس مستواك أسبوعياً، وتنبهك لنقاط الضعف، مع إمكانية إطلاع ولي الأمر على نتائج الاختبارات ونسب الحضور.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-sky-800">
                <span className="px-2.5 py-1 rounded-lg bg-sky-50">تقارير WhatsApp الآلية</span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-50">تتبع الحضور بكاميرا QR</span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-50">تحليل فوري للدرجات</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          E. ACADEMIC STAGES ("المراحل الدراسية")
          2 Rich Stage Cards (المرحلة الإعدادية & المرحلة الثانوية)
      ========================================================================= */}
      <section id="stages" className="py-16 sm:py-24 bg-[#F0F5FC] border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-100 text-[#1E40AF] text-xs font-black">
              المسارات الأكاديمية
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0E1E38] tracking-tight">
              اختر مرحلتك الدراسية
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              مناهج معتمدة وشاملة تضمن أعلى الدرجات لجميع صفوف الإعدادية والثانوية العامة.
            </p>
          </div>

          {/* 2 Rich Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Stage Card 1: المرحلة الإعدادية */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-black">
                    الأول • الثاني • الثالث الإعدادي
                  </span>
                  <span className="text-xs font-bold text-slate-400">تأسيس + امتحانات الشهادة</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#0E1E38]">
                  المرحلة الإعدادية
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                  تأسيس قوي في القواعد (Grammar) والمفردات، وتدريب مبكر على حل القطع والمحادثات بأسلوب ممتع.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>مركز المحادثات التفاعلي (94 محادثة استراتيجية للمحافظات)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>قصص الصفوف الإعدادية المقررة مع القاموس الصوتي</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>تدريبات دورية وتصحيح كتابة البراجراف والملاحظات</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openAuth("register")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-[#2563EB] text-white text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>استكشف مناهج الإعدادي</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <span className="hidden sm:inline-block text-xs text-slate-500 font-bold">
                  تشمل مذكرات PDF مجانية
                </span>
              </div>
            </div>

            {/* Stage Card 2: المرحلة الثانوية */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-blue-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden">
              {/* Highlight ribbon */}
              <div className="absolute top-5 left-5 bg-gradient-to-r from-[#EABF58] to-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xs">
                الشهادة الثانوية العامة 2027
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1E40AF] text-xs font-black">
                    الأول • الثاني • الثالث الثانوي
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#0E1E38]">
                  المرحلة الثانوية
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                  نظام الثانوية العامة الحديث، تركيز مكثف على نواتج التعلم، مهارات الكتابة (Essay)، والامتحانات الشاملة بنظام البابل شيت الإلكتروني.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>بنك أسئلة التابلت ونماذج الوزارة الاسترشادية 2026/2027</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>منهج البكالوريا المستقل وروايات The Lost World و Monte Cristo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>مولد امتحانات ذكي يمنع تكرار الأنماط ويضمن الإتقان الكامل</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openAuth("register")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1E40AF] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-sm font-black shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>استكشف مناهج الثانوي</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <span className="hidden sm:inline-block text-xs text-emerald-700 font-bold">
                  ✓ ضمان الدرجة النهائية
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          F. INTERACTIVE MINI-QUIZ WIDGET ("جرّب بنفسك قبل الاشتراك")
          Working Client-Side Interactive MCQ Card
      ========================================================================= */}
      <section id="quiz" className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
              تجربة تفاعلية مباشرة
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0E1E38] tracking-tight">
              جرّب نظام الأسئلة الذكي بنفسك
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              اختبر معلوماتك في هذا السؤال الفعلي من امتحانات الثانوية العامة، وشاهد كيف تشرح لك المنصة القاعدة فورياً:
            </p>
          </div>

          {/* Interactive MCQ Card */}
          <div className="bg-[#F7F9FC] rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
            
            {/* Question Header & Prompt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="px-3 py-1 rounded-full bg-[#0E1E38] text-white">
                  سؤال تفاعلي • تراكيب وقواعد
                </span>
                <span className="text-slate-500">مستوى ثانوية عامة (Advanced)</span>
              </div>

              {/* The English Question in LTR */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1E38] text-white font-mono text-base sm:text-lg dir-ltr text-left tracking-wide shadow-inner">
                &ldquo;Hardly _______ the station when the train left.&rdquo;
              </div>
            </div>

            {/* 4 Interactive Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 dir-ltr text-left">
              {[
                { id: "A", text: "he had reached", isCorrect: false },
                { id: "B", text: "had he reached", isCorrect: true },
                { id: "C", text: "he reached", isCorrect: false },
                { id: "D", text: "has he reached", isCorrect: false },
              ].map((opt) => {
                const isSelected = quizSelectedOption === opt.id;
                let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
                
                if (isSelected) {
                  if (opt.isCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200";
                  } else {
                    btnStyle = "bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setQuizSelectedOption(opt.id)}
                    className={`p-4 rounded-2xl border-2 font-mono text-sm sm:text-base font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt.id}) {opt.text}</span>
                    {isSelected && (
                      opt.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation / Result Feedback */}
            {quizSelectedOption && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {quizSelectedOption === "B" ? (
                  /* Correct Answer Feedback */
                  <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                    <div className="flex items-center gap-2 font-black text-sm sm:text-base text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>إجابة صحيحة وممتازة! 🎉</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-emerald-900 font-medium">
                      عند بدء الجملة بـ <span className="font-bold underline">Hardly</span> نستخدم صيغة الاستفهام (Inversion) في زمن الماضي التام، فيتقدم الفعل المساعد <span className="font-mono font-bold">had</span> على الفاعل <span className="font-mono font-bold">he</span> يليه التصريف الثالث. سجل حسابك مجاناً لفتح آلاف الأسئلة المشابهة مع الشرح الفوري.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => openAuth("register")}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                      >
                        سجل الآن لفتح باقي الاختبار والبنك الكامل
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Incorrect Answer Feedback & Hint */
                  <div className="p-5 sm:p-6 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-3">
                    <div className="flex items-center gap-2 font-black text-sm sm:text-base text-red-800">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>إجابة غير صحيحة، فكر مجدداً!</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-red-900 font-medium">
                      تذكر أن الكلمات الدالة على النفي مثل <span className="font-bold">Hardly / Scarcely / No sooner</span> في أول الجملة يتبعها تقديم الفعل المساعد على الفاعل (Inversion) في صيغة سؤال (had + subject + p.p). جرب اختيار <span className="font-bold font-mono">(B)</span>!
                    </p>
                    <button
                      onClick={() => setQuizSelectedOption(null)}
                      className="text-xs font-bold text-red-700 underline cursor-pointer hover:text-red-900"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          G. TESTIMONIALS ("قصص نجاح نفخر بها")
          3 Clean Cards
      ========================================================================= */}
      <section id="testimonials" className="py-16 sm:py-24 bg-[#F7F9FC] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-100 text-[#1E40AF] text-xs font-black">
              آراء وتجارب
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0E1E38] tracking-tight">
              قصص نجاح نفخر بها
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              شهادات نعتز بها من طلابنا وأولياء أمورهم عبر رحلة التعلم مع مستر حبيب الرحمن.
            </p>
          </div>

          {/* 3 Clean Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#EABF58]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                  &ldquo;المنصة نظمت لي المذاكرة جداً، خصوصاً جزء بنك الأخطاء وأكاديمية الترجمة فرقوا معايا في امتحان آخر السنة.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] font-black text-xs flex items-center justify-center">
                  أ.م
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0E1E38]">أحمد محمود</h4>
                  <span className="text-xs text-slate-500 font-bold">الصف الثالث الثانوي</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#EABF58]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                  &ldquo;أكثر شيء طمأنني كولي أمر هو المتابعة المستمرة ومعرفة مستوى ابني في كل امتحان أسبوعي.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                  و.أ
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0E1E38]">ولي أمر طالب</h4>
                  <span className="text-xs text-slate-500 font-bold">الصف الثاني الثانوي</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#EABF58]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                  &ldquo;شرح مستر حبيب الرحمن مبسط جداً وخلاني أحب مادة الإنجليزي وأقفل امتحان الترم.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                  س.ط
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0E1E38]">سارة طارق</h4>
                  <span className="text-xs text-slate-500 font-bold">الصف الثالث الإعدادي</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          H. FINAL CTA BANNER & FOOTER
          Gradient Banner • 3-Column Footer • Security Reassurance
      ========================================================================= */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Gradient Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0E1E38] via-[#1E3A8A] to-[#2563EB] text-white p-8 sm:p-14 overflow-hidden shadow-2xl text-center space-y-6">
            
            {/* Ambient Background Blur */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#EABF58]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#EABF58] text-xs font-black border border-white/15">
                العام الدراسي 2026/2027
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-snug">
                جاهز لكتابة قصة تفوقك هذا العام؟
              </h2>

              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-medium">
                انضم الآن لمنصة Professional Academy وابدأ المذاكرة بأحدث نظام ذكي وتفاعلي يضمن لك أعلى الدرجات.
              </p>

              <div className="pt-3">
                <button
                  onClick={() => openAuth("register")}
                  className="px-9 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#0E1E38] text-base font-black shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>أنشئ حسابك الآن مجاناً</span>
                  <ArrowRight className="w-5 h-5 rtl:rotate-180 text-[#2563EB]" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER (3 Columns) */}
      <footer className="bg-[#0E1E38] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            
            {/* Col 1: Brand & Bio & Social (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6 text-[#EABF58]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-inter">Professional Academy</h3>
                  <p className="text-xs text-[#EABF58] font-bold">Mr. Habib El Rahman</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                المنصة التعليمية الأولى لتعلم وتدريب اللغة الإنجليزية للمرحلتين الإعدادية والثانوية في مصر، بنظام تعليمي تفاعلي يجمع بين الفهم العميق والتدريب المستمر.
              </p>

              {/* Social & Contact Links */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/201006468384"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>دعم WhatsApp المباشر</span>
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-sm font-black text-white">روابط سريعة</h4>
              <ul className="space-y-2 text-xs font-bold">
                <li>
                  <button
                    onClick={() => openAuth("login")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openAuth("register")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    إنشاء حساب جديد
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("stages")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    المراحل الدراسية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    مميزات المنصة
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("quiz")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    جرّب بنفسك
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Security & Trust Badge (4 cols) */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-sm font-black text-white">الأمان والاعتماد الأكاديمي</h4>
              
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>حماية مشفرة ومصادقة آمنة</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  منصة محمية بأحدث تقنيات تشفير البيانات (scrypt) وحماية الجلسات لضمان خصوصية وأمان حسابات الطلاب.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>SSL 256-Bit</span>
                  <span>•</span>
                  <span>Scrypt Hashed</span>
                  <span>•</span>
                  <span>Anti-Brute Force</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 text-center text-xs text-slate-500 font-medium space-y-1">
            <p>© 2026/2027 Professional Academy — Mr. Habib El Rahman. All Rights Reserved.</p>
            <p className="text-[11px] text-slate-600">منصة مستر حبيب الرحمن الرسمية للغة الإنجليزية</p>
          </div>

        </div>
      </footer>

      {/* =========================================================================
          MODALS
          1. Auth Modal (Login / Register) with Backdrop Blur & X Close Button
          2. Platform Video Tour Modal (2-Minute Walkthrough)
      ========================================================================= */}

      {/* 1. Sleek Auth Modal */}
      {authModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuth();
          }}
        >
          <div className="relative w-full max-w-5xl my-4 animate-in zoom-in-95 duration-200">
            <AuthScreen
              isModal={true}
              initialMode={authModal.mode}
              onClose={closeAuth}
              onLoginSuccess={() => {
                closeAuth();
                if (onLoginSuccess) onLoginSuccess();
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Platform Video Tour Modal */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVideoModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-3xl bg-[#0E1E38] rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 border border-blue-900/60">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black">جولة سريعة داخل منصة Professional Academy</h3>
                  <p className="text-xs text-blue-300">استكشف بنك الأسئلة، أكاديمية الترجمة، وعالم القصص</p>
                </div>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Container (16:9) */}
            <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative flex items-center justify-center border border-white/10">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Professional Academy Platform Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-blue-200">
                جاهز للبدء؟ أنشئ حسابك الآن مجاناً وابدأ التدريب فوراً.
              </p>
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  openAuth("register");
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs shadow-md cursor-pointer"
              >
                أنشئ حسابك مجاناً
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
