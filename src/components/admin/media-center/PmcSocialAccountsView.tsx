"use client";

import React, { useEffect, useState } from "react";
import {
  Share2,
  Radio,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  ExternalLink,
  Lock,
  Zap,
  Info,
  LogOut,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { YoutubeIcon } from "./icons";

interface SocialAccount {
  platform: string;
  accountName: string;
  accountId: string;
  pageId?: string;
  channelId?: string;
  avatarUrl?: string;
  isConnected: boolean;
  hasEncryptedToken: boolean;
  tokenExpiresAt: string | null;
  lastTestedAt: string | null;
  scopes: string[];
}

interface PmcSocialAccountsViewProps {
  lang?: "ar" | "en";
}

export const PmcSocialAccountsView: React.FC<PmcSocialAccountsViewProps> = ({
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [manualPackModalOpen, setManualPackModalOpen] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin/media-center/social-accounts");
      if (res.ok) {
        const json = await res.json();
        setAccounts(json.accounts || []);
      }
    } catch (e) {
      console.warn("Failed to fetch social accounts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();

    // Check for query parameters from OAuth callback
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const success = url.searchParams.get("oauth_success");
      const error = url.searchParams.get("oauth_error");

      if (success) {
        setActionMessage({
          type: "success",
          text: `تم ربط وتفويض حساب ${success} وحفظ التوكنز في Vault مشفر بنجاح!`,
        });
      } else if (error) {
        setActionMessage({
          type: "error",
          text: `فشل تفويض الـ OAuth: ${decodeURIComponent(error)}`,
        });
      }
    }
  }, []);

  const handleTestConnection = async (platform: string) => {
    setTestingPlatform(platform);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/media-center/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_connection", platform }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: data.isConnected ? "success" : "info",
          text: data.message || `تم اختبار اتصال ${platform} بنجاح.`,
        });
        fetchAccounts();
      } else {
        setActionMessage({
          type: "error",
          text: data.error || `فشل اختبار الاتصال بـ ${platform}.`,
        });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "فشل الاتصال بالخادم." });
    } finally {
      setTestingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من رغبتك في إلغاء ربط ${platform}؟` : `Disconnect ${platform}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/media-center/oauth/${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      if (res.ok) {
        setActionMessage({
          type: "info",
          text: `تم إلغاء ربط ${platform} وحذف التوكنز بأمان.`,
        });
        fetchAccounts();
      }
    } catch {}
  };

  const getAccount = (platform: string) => accounts.find((a) => a.platform === platform);

  const fb = getAccount("facebook");
  const yt = getAccount("youtube");
  const tt = getAccount("tiktok");

  const sampleTikTokCaption = `💡 الفرق بين Used to و Would مع مستر حبيب الرحمن!\n\n👇 حل امتحان الحصة التفاعلي مجاناً من الرابط في البايو!\n\n#ثانوية_عامة #انجليزي_ثانوية_عامة #مستر_حبيب_الرحمن #Professional_Academy`;

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
              {isAr ? "التكاملات الرسمية الثلاثية" : "Official Social Integrations"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3" />
              AES-256-GCM Vault
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "ربط وإدارة حسابات التواصل الاجتماعي" : "Social Media Accounts Gateway"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? "تفويض آمن للحسابات الرسمية الخاصة بأكاديمية مستر حبيب الرحمن عبر Meta Graph API و Google OAuth و TikTok Content Posting API. التوكنز مشفرة بالكامل ولا يتم تخزين أي كلمات مرور."
              : "Secure OAuth connections for Professional Academy channels. All tokens are encrypted at rest with zero plaintext exposure."}
          </p>
        </div>

        <button
          onClick={fetchAccounts}
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث حالة الحسابات" : "Refresh Status"}</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
            actionMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : actionMessage.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          }`}
        >
          {actionMessage.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {actionMessage.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
          {actionMessage.type === "info" && <Info className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 3 Major Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Facebook */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/20">
                <Share2 className="w-6 h-6" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  fb?.isConnected
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${fb?.isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span>{fb?.isConnected ? (isAr ? "متصل ومعتمد" : "Active") : (isAr ? "جاهز للتفويض" : "Inactive")}</span>
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              Facebook (Meta Graph API)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isAr ? "إدارة صفحة مستر حبيب الرحمن الرسمية ونشر البوستات والصور وReels التعليمية." : "Page management and automated post publishing."}
            </p>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "اسم الصفحة:" : "Page Name:"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{fb?.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "Page ID:" : "Page ID:"}</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{fb?.pageId || "108239485739201"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "الصلاحيات:" : "Permissions:"}</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">pages_manage_posts</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <a
              href="/api/admin/media-center/oauth/facebook?init=true"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{fb?.isConnected ? (isAr ? "إعادة تفويض OAuth" : "Re-authorize") : (isAr ? "تفويض الحساب عبر Meta" : "Connect via Meta OAuth")}</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestConnection("facebook")}
                disabled={testingPlatform === "facebook"}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === "facebook" ? "animate-spin" : ""}`} />
                <span>{isAr ? "اختبار الاتصال" : "Test"}</span>
              </button>

              {fb?.isConnected && (
                <button
                  onClick={() => handleDisconnect("facebook")}
                  className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold transition"
                  title={isAr ? "إلغاء الربط" : "Disconnect"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. YouTube */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/20">
                <YoutubeIcon className="w-6 h-6" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  yt?.isConnected
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${yt?.isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span>{yt?.isConnected ? (isAr ? "متصل ومعتمد" : "Active") : (isAr ? "جاهز للتفويض" : "Inactive")}</span>
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              YouTube (Data API v3)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isAr ? "رفع فيديوهات الشرح وحلول امتحانات الثانوية مع العنوان والوصف والـ Tags وصورة الـ Thumbnail." : "Video publishing, metadata & processing tracking."}
            </p>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "اسم القناة:" : "Channel:"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{yt?.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "معرف القناة:" : "Channel ID:"}</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                  {yt?.channelId || "UC_Habib_English"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "الصلاحيات:" : "Scopes:"}</span>
                <span className="font-mono text-red-600 dark:text-red-400">youtube.upload</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <a
              href="/api/admin/media-center/oauth/youtube?init=true"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{yt?.isConnected ? (isAr ? "إعادة تفويض Google" : "Re-authorize") : (isAr ? "تفويض القناة عبر Google" : "Connect via Google OAuth")}</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestConnection("youtube")}
                disabled={testingPlatform === "youtube"}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === "youtube" ? "animate-spin" : ""}`} />
                <span>{isAr ? "اختبار الاتصال" : "Test"}</span>
              </button>

              {yt?.isConnected && (
                <button
                  onClick={() => handleDisconnect("youtube")}
                  className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold transition"
                  title={isAr ? "إلغاء الربط" : "Disconnect"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. TikTok */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black shadow-md">
                <Radio className="w-6 h-6 text-pink-500" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  tt?.isConnected
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${tt?.isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span>{tt?.isConnected ? (isAr ? "متصل ومعتمد" : "Active") : (isAr ? "جاهز للتفويض" : "Inactive")}</span>
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              TikTok (Posting API v2)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isAr ? "نشر كبسولات الجرامر والترجمة السريعة 9:16، مع ميزة التصدير اليدوي الفوري في حال وضع التجربة." : "Vertical short video posting with fallback to manual packs."}
            </p>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "اليوزر نيم:" : "Handle:"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{tt?.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "وضع النشر:" : "Publish Mode:"}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">Direct + Manual Pack</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "الصلاحيات:" : "Scopes:"}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">video.publish</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <a
              href="/api/admin/media-center/oauth/tiktok?init=true"
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <KeyRound className="w-3.5 h-3.5 text-pink-400" />
              <span>{tt?.isConnected ? (isAr ? "إعادة تفويض TikTok" : "Re-authorize") : (isAr ? "تفويض الحساب عبر TikTok" : "Connect via TikTok OAuth")}</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setManualPackModalOpen(true)}
                className="flex-1 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? "باقة النشر اليدوي" : "Manual Pack"}</span>
              </button>

              <button
                onClick={() => handleTestConnection("tiktok")}
                disabled={testingPlatform === "tiktok"}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition"
                title={isAr ? "اختبار الاتصال" : "Test"}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === "tiktok" ? "animate-spin" : ""}`} />
              </button>

              {tt?.isConnected && (
                <button
                  onClick={() => handleDisconnect("tiktok")}
                  className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                  title={isAr ? "إلغاء الربط" : "Disconnect"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Publish Pack Modal */}
      {manualPackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" />
                <span>{isAr ? "باقة النشر اليدوي الآمنة — TikTok" : "Manual Publish Pack — TikTok"}</span>
              </h3>
              <button
                onClick={() => setManualPackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? "في حال كان حساب المطور في مرحلة المراجعة (Sandbox)، تمنحك هذه الباقة الكابشن المنسق وروابط الفيديو الجاهزة لنشرها يدوياً في 10 ثوانٍ دون مخالفة سياسات المنصة:"
                : "Safe fallback for unverified TikTok Sandbox apps. Download video and copy formatted captions with 1-click."}
            </p>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? "النص والهاشتاجات الجاهزة:" : "Ready Caption:"}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sampleTikTokCaption);
                    setCopiedCaption(true);
                    setTimeout(() => setCopiedCaption(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedCaption ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCaption ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ الكابشن" : "Copy")}</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {sampleTikTokCaption}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">{isAr ? "خطوات النشر على الموبايل:" : "Mobile Steps:"}</p>
              <p>1. افتح تطبيق TikTok واضغط على زر (+) لرفع الفيديو.</p>
              <p>2. الصق الكابشن المنسوخ أعلاه في خانة الوصف.</p>
              <p>3. اضغط 'نشر' (Post).</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setManualPackModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
