"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Ban,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { FacebookIcon, YoutubeIcon, TiktokIcon } from "./icons";
import type { QueueJobRecord, PublishingJobStatus } from "@/lib/media-center/publishing-queue-core";

interface PmcPublishQueueViewProps {
  lang?: "ar" | "en";
  onNavigateToCalendar?: () => void;
}

export const PmcPublishQueueView: React.FC<PmcPublishQueueViewProps> = ({
  lang = "ar",
  onNavigateToCalendar,
}) => {
  const isAr = lang === "ar";

  const [jobs, setJobs] = useState<QueueJobRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    queued: 0,
    publishing: 0,
    published: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | PublishingJobStatus>("all");
  const [activeRetryModal, setActiveRetryModal] = useState<QueueJobRecord | null>(null);
  const [retryInProgress, setRetryInProgress] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchQueueData();
  }, []);

  const fetchQueueData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media-center/queue");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setSummary(
          data.summary || { total: 0, queued: 0, publishing: 0, published: 0, failed: 0 }
        );
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySubmit = async () => {
    if (!activeRetryModal) return;
    setRetryInProgress(true);
    try {
      const res = await fetch(`/api/admin/media-center/queue/${activeRetryModal.id}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentPosts: [
            // Feed empty or recent mock posts for pre-retry safety
          ],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionNotification(data.message);
        fetchQueueData();
      } else {
        setActionNotification(data.error || "Retry failed.");
      }
    } catch (err: any) {
      setActionNotification(err?.message || "Retry failed.");
    } finally {
      setRetryInProgress(false);
      setActiveRetryModal(null);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/media-center/queue/${jobId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by instructor" }),
      });
      if (res.ok) {
        setActionNotification(isAr ? "تم إلغاء المهمة بنجاح." : "Job cancelled.");
        fetchQueueData();
      }
    } catch {
      setActionNotification("Failed to cancel job.");
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

  const getStatusBadge = (status: PublishingJobStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {isAr ? "تم النشر بنجاح" : "Published"}
          </span>
        );
      case "PUBLISHING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {isAr ? "جارٍ الإرسال الآن..." : "Publishing..."}
          </span>
        );
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3 h-3" />
            {isAr ? "في طابور الانتظار" : "Queued"}
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3" />
            {isAr ? "فشل النشر" : "Failed"}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Ban className="w-3 h-3" />
            {isAr ? "ملغي" : "Cancelled"}
          </span>
        );
      default:
        return null;
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filterStatus === "all") return true;
    return j.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionNotification && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-indigo-600/20">
          <span>{actionNotification}</span>
          <button
            onClick={() => setActionNotification(null)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? "محرك وطابور النشر المعتمد" : "Approved Publishing Queue"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "مراقبة النشر الآمن، منع المنشورات المكررة (Idempotency)، والتراجع الأسي عند انقطاع الاتصال (Backoff Retry)."
              : "Safe publishing monitor, idempotency deduplication, and exponential backoff retry."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchQueueData}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </button>

          {onNavigateToCalendar && (
            <button
              onClick={onNavigateToCalendar}
              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isAr ? "عرض التقويم" : "Calendar View"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">{isAr ? "إجمالي المهام" : "Total Jobs"}</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.total}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500">{isAr ? "في الانتظار" : "Queued"}</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{summary.queued}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-500">{isAr ? "جارٍ الإرسال" : "In Flight"}</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.publishing}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500">{isAr ? "تم النشر" : "Published"}</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.published}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-red-500">{isAr ? "فشل وتراجع" : "Failed / Retrying"}</span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{summary.failed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(["all", "QUEUED", "PUBLISHING", "PUBLISHED", "FAILED"] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === st
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {st === "all"
              ? isAr
                ? "جميع المهام"
                : "All Jobs"
              : st === "QUEUED"
              ? isAr
                ? "المنتظرة"
                : "Queued"
              : st === "PUBLISHING"
              ? isAr
                ? "جارية"
                : "Publishing"
              : st === "PUBLISHED"
              ? isAr
                ? "المنشورة"
                : "Published"
              : isAr
              ? "الفاشلة"
              : "Failed"}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
            {isAr ? "لا توجد مهام مطابقة في الطابور حالياً." : "No matching jobs in the queue."}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {getPlatformIcon(job.platform)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {job.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      JOB ID: {job.id} • Mode: {job.publishingMode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {isAr ? `المحاولات: ${job.attemptsCount}/${job.maxAttempts}` : `Attempts: ${job.attemptsCount}/${job.maxAttempts}`}
                  </span>
                </div>
              </div>

              {/* Idempotency & Diagnostics Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-400">Idempotency Key:</span>
                  <span className="truncate max-w-[280px]">{job.idempotencyKey}</span>
                </div>

                {job.scheduledAt && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isAr ? "موعد النشر:" : "Scheduled:"}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(job.scheduledAt).toLocaleString(isAr ? "ar-EG" : "en-US")}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Log (if failed) */}
              {job.errorLog && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">{isAr ? "تقرير الخطأ الصادر من المنصة:" : "Platform Error Report:"}</span>
                    <p className="font-mono text-[11px] leading-relaxed">{job.errorLog}</p>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">
                  {job.publishedAt
                    ? `${isAr ? "تاريخ النشر الفعلي:" : "Published at:"} ${new Date(job.publishedAt).toLocaleString(isAr ? "ar-EG" : "en-US")}`
                    : `${isAr ? "تاريخ الإنشاء:" : "Created:"} ${new Date(job.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")}`}
                </div>

                <div className="flex items-center gap-2">
                  {job.externalPostUrl && (
                    <a
                      href={job.externalPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{isAr ? "فتح المنشور" : "Open Post"}</span>
                    </a>
                  )}

                  {job.status === "FAILED" && job.attemptsCount < job.maxAttempts && (
                    <button
                      onClick={() => setActiveRetryModal(job)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isAr ? "إعادة المحاولة مع الفحص" : "Safe Retry"}</span>
                    </button>
                  )}

                  {job.status === "QUEUED" && (
                    <button
                      onClick={() => handleCancelJob(job.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      <span>{isAr ? "إلغاء المهمة" : "Cancel"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safe Retry Modal */}
      {activeRetryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isAr ? "فحص الأمان قبل إعادة المحاولة" : "Pre-Retry Safety Verification"}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? `سيقوم النظام أولاً باستعلام ${activeRetryModal.platform} للتأكد مما إذا كان المنشور قد نُشر بالفعل أثناء انقطاع الاتصال السابق، لمنع تكرار النشر المزدوج.`
                : `The system will query ${activeRetryModal.platform} to ensure the post was not already published before triggering a retry.`}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeRetryModal.title}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveRetryModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                disabled={retryInProgress}
                onClick={handleRetrySubmit}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-600/20"
              >
                {retryInProgress ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isAr ? "بدء الفحص وإعادة الإرسال" : "Verify & Retry"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
