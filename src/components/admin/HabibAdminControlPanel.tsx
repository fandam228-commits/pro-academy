"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AdminOverviewModule } from "./AdminOverviewModule";
import { AdminQuestionBankModule } from "./AdminQuestionBankModule";
import { AdminTranslationModule } from "./AdminTranslationModule";
import { AdminCurriculumModule } from "./AdminCurriculumModule";
import { AdminStudentsModule } from "./AdminStudentsModule";
import { AdminVouchersModule } from "./AdminVouchersModule";
import { AdminCenterAttendanceModule } from "./AdminCenterAttendanceModule";
import {
  BarChart3,
  BookOpen,
  Languages,
  Layers,
  Users,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronLeft,
  KeyRound,
  QrCode,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "question_bank"
  | "translation"
  | "curriculum"
  | "students"
  | "vouchers"
  | "center_attendance";

interface HabibAdminControlPanelProps {
  initialTab?: AdminTab;
  onExitAdmin?: () => void;
}

export const HabibAdminControlPanel: React.FC<HabibAdminControlPanelProps> = ({
  initialTab = "overview",
  onExitAdmin,
}) => {
  const { user, logout, lang } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigationItems = [
    {
      id: "overview" as AdminTab,
      labelAr: "نظرة عامة والإحصائيات",
      icon: BarChart3,
      badge: "LIVE",
    },
    {
      id: "question_bank" as AdminTab,
      labelAr: "إدارة بنك الأسئلة",
      icon: Layers,
      badge: "894+",
    },
    {
      id: "translation" as AdminTab,
      labelAr: "إدارة أكاديمية الترجمة",
      icon: Languages,
      badge: "PRO",
    },
    {
      id: "curriculum" as AdminTab,
      labelAr: "إدارة الدروس والقصص",
      icon: BookOpen,
      badge: "2027",
    },
    {
      id: "students" as AdminTab,
      labelAr: "متابعة الطلاب والاشتراكات",
      icon: Users,
    },
    {
      id: "vouchers" as AdminTab,
      labelAr: "إدارة الكروت والأكواد",
      icon: KeyRound,
      badge: "CARDS",
    },
    {
      id: "center_attendance" as AdminTab,
      labelAr: "حضور السنتر والواجب",
      icon: QrCode,
      badge: "SCAN",
    },
  ];

  const handlePreviewAsStudent = () => {
    if (onExitAdmin) {
      onExitAdmin();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* 1. TOP CONTROL BAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 font-black">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
                  Professional Academy
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 border border-amber-300">
                  لوحة التحكم
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                مستر حبيب الرحمن • العام الدراسي 2026/2027
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePreviewAsStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition cursor-pointer shadow-xs"
          >
            <span>معاينة المنصة كطالب</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={async () => {
              await logout();
              window.location.href = "/";
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-3 py-1">
              أقسام لوحة التحكم:
            </span>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.labelAr}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TEACHER INFO CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-[#121c38] rounded-3xl p-5 text-white border border-blue-500/20 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>صلاحيات الإدارة الكاملة</span>
            </div>
            <h4 className="font-black text-sm">{user?.name || "Mr. Habib El Rahman"}</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تحكم مباشر في بنك الأسئلة، أكاديمية الترجمة، ومتابعة الطلاب مع حماية RLS السحابية.
            </p>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
            <div className="bg-white dark:bg-slate-900 w-72 h-full p-5 shadow-2xl space-y-4 animate-slideRight">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-black text-sm text-slate-900 dark:text-white">أقسام لوحة التحكم</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.labelAr}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-200 dark:bg-slate-800 text-slate-600">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* MAIN MODULE CONTENT VIEWPORT */}
        <main className="flex-1 min-w-0">
          {activeTab === "overview" && <AdminOverviewModule />}
          {activeTab === "question_bank" && <AdminQuestionBankModule />}
          {activeTab === "translation" && <AdminTranslationModule />}
          {activeTab === "curriculum" && <AdminCurriculumModule />}
          {activeTab === "students" && <AdminStudentsModule />}
          {activeTab === "vouchers" && <AdminVouchersModule />}
          {activeTab === "center_attendance" && <AdminCenterAttendanceModule />}
        </main>
      </div>
    </div>
  );
};
