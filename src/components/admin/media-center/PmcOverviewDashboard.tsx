"use client";

import React, { useEffect, useState } from "react";
import {
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Eye,
  Heart,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Radio,
  FileCheck,
  Send,
  Zap,
} from "lucide-react";
import { YoutubeIcon } from "./icons";

interface OverviewData {
  platforms: {
    facebook: { connected: boolean; accountName: string; lastTested: string | null };
    youtube: { connected: boolean; accountName: string; lastTested: string | null };
    tiktok: { connected: boolean; accountName: string; lastTested: string | null };
  };
  counts: {
    published: number;
    readyForReview: number;
    scheduled: number;
    failed: number;
    drafts: number;
  };
  metrics: {
    totalViews: number;
    totalReach: number;
    totalReactions: number;
    totalComments: number;
    totalShares: number;
  };
  timestamp?: string;
}

interface PmcOverviewDashboardProps {
  onNavigateTab: (tabId: string) => void;
  lang?: "ar" | "en";
}

export const PmcOverviewDashboard: React.FC<PmcOverviewDashboardProps> = ({
  onNavigateTab,
  lang = "ar",
}) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/media-center/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn("Failed to load PMC overview:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  const isAr = lang === "ar";

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner: Brand & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {isAr ? "مركز القيادة الإعلامي المعتمد" : "Official Media Command Center"}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? "الإصدار 2.0 • 2026/2027" : "v2.0 • 2026/2027"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {isAr ? "لوحة المتابعة الإستراتيجية — مستر حبيب الرحمن" : "Strategic Media Operations — Mr. Habib El Rahman"}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isAr
                ? "إدارة النشر التفاعلي، صناعة المحتوى بالذكاء الاصطناعي، ومراقبة تفاعل طلاب الثانوية العامة والشهادات الإعدادية عبر المنصات الثلاثة."
                : "Centralized marketing operations, AI content production, and student engagement monitoring across Facebook, YouTube, and TikTok."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>{isAr ? "تحديث البيانات" : "Refresh"}</span>
            </button>
            <button
              onClick={() => onNavigateTab("content_studio")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? "إنشاء محتوى بالذكاء الاصطناعي" : "Create with AI"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Platform Connectivity Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Facebook Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Facebook Page</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {data?.platforms.facebook.accountName || "Professional Academy"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  data?.platforms.facebook.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {data?.platforms.facebook.connected
                  ? isAr ? "متصل رسمياً" : "Connected"
                  : isAr ? "جاهز للربط" : "Ready"}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Meta Graph API v19+</span>
            <button
              onClick={() => onNavigateTab("social_accounts")}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>{isAr ? "إدارة الصلاحيات" : "Manage"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* YouTube Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
                <YoutubeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">YouTube Channel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {data?.platforms.youtube.accountName || "Mr. Habib El Rahman"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  data?.platforms.youtube.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {data?.platforms.youtube.connected
                  ? isAr ? "متصل رسمياً" : "Connected"
                  : isAr ? "جاهز للربط" : "Ready"}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>YouTube Data API v3</span>
            <button
              onClick={() => onNavigateTab("social_accounts")}
              className="text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>{isAr ? "إدارة الصلاحيات" : "Manage"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TikTok Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-black">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">TikTok Creator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {data?.platforms.tiktok.accountName || "@habib_academy"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  data?.platforms.tiktok.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {data?.platforms.tiktok.connected
                  ? isAr ? "متصل رسمياً" : "Connected"
                  : isAr ? "جاهز للربط" : "Ready"}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>TikTok Posting API v2</span>
            <button
              onClick={() => onNavigateTab("social_accounts")}
              className="text-slate-700 dark:text-slate-300 hover:underline font-bold flex items-center gap-1"
            >
              <span>{isAr ? "إدارة الصلاحيات" : "Manage"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Publication Status Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Published */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isAr ? "المنشورات المنشورة" : "Published Posts"}
            </p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {data?.counts.published ?? 0}
            </h4>
          </div>
        </div>

        {/* Ready for Review */}
        <div
          onClick={() => onNavigateTab("approval_center")}
          className="bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">
                {isAr ? "بانتظار موافقتك" : "Pending Approval"}
              </p>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {data?.counts.readyForReview ?? 0}
            </h4>
          </div>
        </div>

        {/* Scheduled */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isAr ? "منشورات مجدولة" : "Scheduled"}
            </p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {data?.counts.scheduled ?? 0}
            </h4>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {isAr ? "فشل النشر" : "Failed Jobs"}
            </p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {data?.counts.failed ?? 0}
            </h4>
          </div>
        </div>
      </div>

      {/* Row 3: Live Academic Content & Quick Workflow Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Launch Workflows */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isAr ? "مسارات الإنتاج الإعلامي السريع" : "Rapid Production Workflows"}</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {isAr ? "مناهج 2026/2027 المعتمدة" : "2026/2027 Syllabus"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => onNavigateTab("content_studio")}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-500 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isAr ? "فكرة درس &rarr; 3 بوستات للمنصات" : "Lesson Topic &rarr; 3 Multiplatform Posts"}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? "توليد Hook ذكي وسكريبت وكابشن مخصص لفيسبوك وتيك توك ويوتيوب مع التزام تام بقواعد المنهج."
                  : "Generate academic hooks, scripts, and captions customized for each platform."}
              </p>
            </div>

            <div
              onClick={() => onNavigateTab("video_studio")}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-500 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <Radio className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isAr ? "استوديو الفيديوهات التعليمية 9:16" : "Vertical Video Studio 9:16"}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? "إعداد ستوري بورد كامل، ترجمة ثنائية بكلمات ذهبية، وتطبيق علامة مستر حبيب الرحمن."
                  : "Generate full storyboards, bilingual subtitles with gold highlights, and brand outro."}
              </p>
            </div>

            <div
              onClick={() => onNavigateTab("approval_center")}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isAr ? "مركز الاعتماد والموافقة البشرية" : "Human Approval Center"}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? "مراجعة المحتوى والاعتماد الرسمي بنقرة واحدة قبل جدولة النشر عبر الـ API."
                  : "Review previews, approve or request revisions with guaranteed cryptographic locks."}
              </p>
            </div>

            <div
              onClick={() => onNavigateTab("calendar")}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-500 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isAr ? "تقويم خطة المحتوى الأسبوعية" : "Weekly Content Calendar"}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? "توزيع مراجعات الثانوية، أسئلة بنك الأسئلة، وفيديوهات شرح القواعد طوال الأسبوع."
                  : "Schedule Thanawya Amma reviews, question of the day, and grammar reels."}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Security & Human Gatekeeper Box */}
        <div className="bg-gradient-to-b from-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">
              {isAr ? "صمام الأمان المطلق (Human-in-the-Loop)" : "Zero Unintended Posts Policy"}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              <span>
                {isAr
                  ? "تم تصميم النظام بصرامة فائقة: لن يتم نشر أي حرف أو فيديو تلقائياً دون ضغط زر 'موافقة' صريح من مستر حبيب الرحمن."
                  : "Every generated post requires explicit human authorization. Direct publishing is physically locked behind Super Admin sign-off."}
              </span>
            </p>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? "صاحب صلاحية النشر:" : "Super Admin:"}</span>
                <span className="font-bold text-amber-300">Mr. Habib El Rahman</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? "تشفير التوكنز:" : "Token Storage:"}</span>
                <span className="font-mono text-emerald-400">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? "منع تكرار النشر:" : "Replay Protection:"}</span>
                <span className="font-mono text-emerald-400">SHA-256 Idempotency</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4">
            <button
              onClick={() => onNavigateTab("approval_center")}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>{isAr ? "عرض قائمة المراجعة الآن" : "Go to Approval Queue"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
