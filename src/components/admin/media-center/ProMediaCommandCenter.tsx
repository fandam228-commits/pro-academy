"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Share2,
  Sparkles,
  Video,
  Calendar,
  FileCheck,
  Send,
  BarChart3,
  MessageSquare,
  Megaphone,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Languages,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { PmcOverviewDashboard } from "./PmcOverviewDashboard";
import { PmcSocialAccountsView } from "./PmcSocialAccountsView";
import { PmcApprovalCenterView } from "./PmcApprovalCenterView";

export type PmcTab =
  | "overview"
  | "social_accounts"
  | "content_studio"
  | "video_studio"
  | "calendar"
  | "approval_center"
  | "publishing_queue"
  | "analytics"
  | "community"
  | "campaigns"
  | "audit_logs";

interface ProMediaCommandCenterProps {
  onExitCommandCenter?: () => void;
  initialTab?: PmcTab;
}

export const ProMediaCommandCenter: React.FC<ProMediaCommandCenterProps> = ({
  onExitCommandCenter,
  initialTab = "overview",
}) => {
  const [activeTab, setActiveTab] = useState<PmcTab>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [lang, setLang] = useState<"ar" | "en">("ar");

  const isAr = lang === "ar";

  const navItems: { id: PmcTab; labelAr: string; labelEn: string; icon: any; badge?: string }[] = [
    { id: "overview", labelAr: "لوحة المتابعة العامة", labelEn: "Overview Dashboard", icon: LayoutDashboard },
    { id: "social_accounts", labelAr: "بوابات المنصات الثلاثية", labelEn: "Social Accounts", icon: Share2, badge: "OAuth" },
    { id: "approval_center", labelAr: "مركز الاعتماد البشري", labelEn: "Approval Center", icon: FileCheck, badge: "GATE" },
    { id: "content_studio", labelAr: "استوديو المحتوى الذكي", labelEn: "AI Content Studio", icon: Sparkles, badge: "AI" },
    { id: "video_studio", labelAr: "استوديو الفيديوهات 9:16", labelEn: "AI Video Studio", icon: Video },
    { id: "calendar", labelAr: "تقويم النشر الأسبوعي", labelEn: "Content Calendar", icon: Calendar },
    { id: "publishing_queue", labelAr: "محرك وطابور النشر", labelEn: "Publishing Queue", icon: Send },
    { id: "analytics", labelAr: "مركز الإحصائيات والأداء", labelEn: "Analytics Hub", icon: BarChart3 },
    { id: "community", labelAr: "إدارة التعليقات والمجتمع", labelEn: "Community Manager", icon: MessageSquare },
    { id: "campaigns", labelAr: "حملات تسجيل الطلاب", labelEn: "Academy Campaigns", icon: Megaphone },
    { id: "audit_logs", labelAr: "سجل الأمان والامتثال", labelEn: "Security & Audit", icon: ShieldAlert },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-cairo"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Top Bar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400 font-black text-xs">
                PMC
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs md:text-sm tracking-tight text-slate-900 dark:text-white">
                  PRO MEDIA COMMAND CENTER
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px] md:max-w-none">
                Professional Academy — Mr. Habib El Rahman
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>

          {/* Return to Core Academy Button */}
          {onExitCommandCenter && (
            <button
              onClick={onExitCommandCenter}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isAr ? "العودة للأكاديمية" : "Academy Portal"}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Sidebar Toggle */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isAr ? "طي / توسيع القائمة" : "Toggle Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={isAr ? item.labelAr : item.labelEn}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1 text-right">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Security Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin Gate Active</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Mr. Habib El Rahman</p>
            </div>
          )}
        </aside>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    PRO MEDIA COMMAND CENTER
                  </span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-right">{isAr ? item.labelAr : item.labelEn}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs font-bold text-slate-500">Mr. Habib El Rahman</p>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <PmcOverviewDashboard onNavigateTab={(tab) => setActiveTab(tab as PmcTab)} lang={lang} />
            )}
            {activeTab === "social_accounts" && <PmcSocialAccountsView lang={lang} />}
            {activeTab === "approval_center" && <PmcApprovalCenterView lang={lang} />}

            {/* Placeholder screens for Phases 3-6 */}
            {activeTab !== "overview" &&
              activeTab !== "social_accounts" &&
              activeTab !== "approval_center" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize">
                    {navItems.find((i) => i.id === activeTab)?.labelAr}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? "هذه الوحدة مبرمجة في خطة التنفيذ المعتمدة (المراحل القادمة). تم تأسيس قاعدة البيانات ونظام الأمان الخاص بها بالكامل وجاهز للربط الفوري."
                      : "This module is slated for subsequent phases according to the master plan. The database schema, security layer, and RBAC guards are already primed."}
                  </p>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
                  >
                    {isAr ? "العودة للوحة المتابعة" : "Back to Overview"}
                  </button>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};
