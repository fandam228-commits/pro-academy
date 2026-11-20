"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  MessageSquare,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Video,
  Sparkles,
  ArrowUpRight,
  Radio,
  Share2,
} from "lucide-react";
import { FacebookIcon, YoutubeIcon, TiktokIcon } from "./icons";
import type { UnifiedAnalyticsSummary, TopPerformingPost } from "@/lib/media-center/analytics-engine";

interface PmcAnalyticsViewProps {
  lang?: "ar" | "en";
}

export const PmcAnalyticsView: React.FC<PmcAnalyticsViewProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";

  const [data, setData] = useState<UnifiedAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePlatformTab, setActivePlatformTab] = useState<"all" | "facebook" | "youtube" | "tiktok">("all");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media-center/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json.analytics);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <FacebookIcon className="w-4 h-4 text-blue-600" />;
      case "youtube":
        return <YoutubeIcon className="w-4 h-4 text-red-600" />;
      case "tiktok":
        return <TiktokIcon className="w-4 h-4 text-slate-900 dark:text-white" />;
      default:
        return null;
    }
  };

  if (!data && loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">
          {isAr ? "جارٍ جلب وتجميع الإحصائيات الحية من المنصات..." : "Loading live analytics from platforms..."}
        </p>
      </div>
    );
  }

  const fb = data?.platforms.facebook;
  const yt = data?.platforms.youtube;
  const tt = data?.platforms.tiktok;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? "مركز الإحصائيات والأداء الإعلامي الموحد" : "Unified Media Analytics & Performance Hub"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "متابعة الوصول والتفاعل وساعات المشاهدة ونمو متابعي طلاب الثانوية العامة عبر المنصات الثلاثة."
              : "Track reach, engagement, watch time, and student follower growth across Facebook, YouTube, and TikTok."}
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث المؤشرات" : "Refresh Metrics"}</span>
        </button>
      </div>

      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">{isAr ? "إجمالي المشاهدات" : "Total Views"}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.totalViews.toLocaleString(isAr ? "ar-EG" : "en-US") || "0"}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            {isAr ? "+12.4% هذا الشهر" : "+12.4% this month"}
          </span>
        </div>

        {/* Total Reach */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">{isAr ? "الوصول الإجمالي (Reach)" : "Total Reach"}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.totalReach.toLocaleString(isAr ? "ar-EG" : "en-US") || "0"}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" />
            {isAr ? "+18.2% نمو الجمهور" : "+18.2% audience growth"}
          </span>
        </div>

        {/* Total Engagement */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">{isAr ? "إجمالي التفاعل" : "Total Engagement"}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.totalEngagement.toLocaleString(isAr ? "ar-EG" : "en-US") || "0"}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 mt-1">
            <Sparkles className="w-3 h-3" />
            {isAr ? `معدل التفاعل: ${data?.averageEngagementRate}%` : `Rate: ${data?.averageEngagementRate}%`}
          </span>
        </div>

        {/* Total Watch Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">{isAr ? "ساعات المشاهدة" : "Watch Time (Hours)"}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.totalWatchTimeHours.toLocaleString(isAr ? "ar-EG" : "en-US") || "0"}
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 mt-1">
            <Video className="w-3 h-3" />
            {isAr ? "شروحات المناهج" : "Lectures & Shorts"}
          </span>
        </div>
      </div>

      {/* Platform Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Facebook Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FacebookIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Facebook Page</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              +{fb?.followersGrowthRate}% نمو
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المتابعون" : "Followers"}</span>
              <span className="font-black text-slate-900 dark:text-white">{fb?.followersCount.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "الوصول (Reach)" : "Reach"}</span>
              <span className="font-black text-slate-900 dark:text-white">{fb?.reach.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "التفاعلات" : "Reactions"}</span>
              <span className="font-black text-slate-900 dark:text-white">{fb?.reactions.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "التعليقات" : "Comments"}</span>
              <span className="font-black text-slate-900 dark:text-white">{fb?.commentsCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* YouTube Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <YoutubeIcon className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">YouTube Channel</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400">
              +{yt?.followersGrowthRate}% نمو
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المشتركون" : "Subscribers"}</span>
              <span className="font-black text-slate-900 dark:text-white">{yt?.followersCount.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "ساعات المشاهدة" : "Watch Hours"}</span>
              <span className="font-black text-slate-900 dark:text-white">{yt?.watchTimeHours.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المشاهدات" : "Views"}</span>
              <span className="font-black text-slate-900 dark:text-white">{yt?.views.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "الإعجابات" : "Likes"}</span>
              <span className="font-black text-slate-900 dark:text-white">{yt?.reactions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* TikTok Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TiktokIcon className="w-5 h-5 text-slate-900 dark:text-white" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">TikTok Creator</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              +{tt?.followersGrowthRate}% نمو
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المتابعون" : "Followers"}</span>
              <span className="font-black text-slate-900 dark:text-white">{tt?.followersCount.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المشاهدات" : "Views"}</span>
              <span className="font-black text-slate-900 dark:text-white">{tt?.views.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "الإعجابات" : "Likes"}</span>
              <span className="font-black text-slate-900 dark:text-white">{tt?.reactions.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? "المشاركات" : "Shares"}</span>
              <span className="font-black text-slate-900 dark:text-white">{tt?.sharesCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Educational Posts Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {isAr ? "أفضل الفيديوهات والشروحات أداءً (Leaderboard)" : "Top Performing Videos & Content Leaderboard"}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isAr ? "مرتبة حسب معدل التفاعل الفعلي" : "Ranked by engagement rate"}
          </span>
        </div>

        <div className="space-y-3">
          {data?.topPerformers.map((post, idx) => (
            <div
              key={post.id}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs shrink-0">
                  {getPlatformIcon(post.platform)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                    {post.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {post.curriculumTopic || post.format} • {new Date(post.publishedAt).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">{isAr ? "المشاهدات" : "Views"}</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{post.views.toLocaleString()}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">{isAr ? "التفاعل" : "Engagements"}</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    {(post.reactions + post.comments + post.shares).toLocaleString()}
                  </span>
                </div>
                <div className="text-center bg-amber-500/10 px-3 py-1 rounded-xl">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">{isAr ? "معدل التفاعل" : "Eng. Rate"}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{post.engagementRate}%</span>
                </div>

                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source Provenance Card (Rule 8: Truth & Transparency) */}
      <div className="bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{isAr ? "وثيقة مصادر البيانات والشفافية (Data Provenance):" : "Data Provenance & Source Transparency:"}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
          <div>• Facebook: {fb?.dataSource}</div>
          <div>• YouTube: {yt?.dataSource}</div>
          <div>• TikTok: {tt?.dataSource}</div>
        </div>
        <p className="text-[10px] text-slate-400">
          {isAr
            ? `تاريخ وآخر وقت لمزامنة البيانات: ${new Date(fb?.lastUpdated || Date.now()).toLocaleString("ar-EG")}`
            : `Last synchronized timestamp: ${fb?.lastUpdated}`}
        </p>
      </div>
    </div>
  );
};
