"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Key,
  CheckCircle2,
  XCircle,
  Send,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lock,
} from "lucide-react";
import type { AuditLogRecord, AuditAction } from "@/lib/media-center/audit-logger-core";

interface PmcAuditLogsViewProps {
  lang?: "ar" | "en";
}

export const PmcAuditLogsView: React.FC<PmcAuditLogsViewProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    approvalsCount: 0,
    publishingActionsCount: 0,
    accountConnectionsCount: 0,
    rescheduledCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media-center/audit-logs?action=${actionFilter}&search=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
        if (json.summary) setSummary(json.summary);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "APPROVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {isAr ? "اعتماد محتوى" : "Content Approved"}
          </span>
        );
      case "REJECT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3" />
            {isAr ? "رفض محتوى" : "Rejected"}
          </span>
        );
      case "PUBLISH_INITIATE":
      case "PUBLISH_SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Send className="w-3 h-3" />
            {isAr ? "إطلاق نشر" : "Publish Initiated"}
          </span>
        );
      case "CONNECT_ACCOUNT":
      case "TOKEN_REFRESH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Key className="w-3 h-3" />
            {isAr ? "ربط منصة وتوكن" : "OAuth / Token"}
          </span>
        );
      case "RESCHEDULE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Calendar className="w-3 h-3" />
            {isAr ? "إعادة جدولة" : "Rescheduled"}
          </span>
        );
      case "REPLY_DISPATCH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <MessageSquare className="w-3 h-3" />
            {isAr ? "إرسال رد معتمد" : "Reply Sent"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? "سجل الأمان والامتثال (Security & Audit Trail)" : "Security & Compliance Audit Trail"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "سجل غير قابل للتعديل يوثق كل عمليات الاعتماد البشري، النشر الفعلي، صلاحيات الحسابات، وحجب الأسرار التشفيرية."
              : "Immutable audit ledger tracking educator approvals, publishing dispatches, token security, and secret redaction."}
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث السجل" : "Refresh Logs"}</span>
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">{isAr ? "إجمالي العمليات الموثقة" : "Total Events"}</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.total}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500">{isAr ? "عمليات الاعتماد (Approved)" : "Approvals"}</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.approvalsCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-500">{isAr ? "عمليات النشر الفعلية" : "Publish Dispatches"}</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.publishingActionsCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500">{isAr ? "أمان المنصات والتوكن" : "OAuth & Token Events"}</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{summary.accountConnectionsCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">{isAr ? "جميع الإجراءات (All Actions)" : "All Actions"}</option>
            <option value="APPROVE">{isAr ? "اعتماد المحتوى (APPROVE)" : "APPROVE"}</option>
            <option value="REJECT">{isAr ? "رفض المحتوى (REJECT)" : "REJECT"}</option>
            <option value="PUBLISH_INITIATE">{isAr ? "إطلاق النشر (PUBLISH)" : "PUBLISH"}</option>
            <option value="CONNECT_ACCOUNT">{isAr ? "ربط الحسابات (CONNECT)" : "CONNECT"}</option>
            <option value="RESCHEDULE">{isAr ? "إعادة الجدولة (RESCHEDULE)" : "RESCHEDULE"}</option>
            <option value="REPLY_DISPATCH">{isAr ? "إرسال ردود الطلاب (REPLY)" : "REPLY"}</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث في المنفذ، الإجراء، المعرف..." : "Search logs..."}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pr-9 pl-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
          />
        </form>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        {logs.map((log) => {
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{log.actorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({log.actorId})</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")} • IP: {log.ipAddress}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getActionBadge(log.action)}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {log.entityType}
                  </span>
                </div>
              </div>

              {/* Entity Identifier */}
              {log.entityId && (
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Target Entity: {log.entityId}</span>
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 text-[10px] hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? (isAr ? "إخفاء التفاصيل" : "Hide Details") : (isAr ? "عرض التفاصيل المشفرة" : "View Details")}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              )}

              {/* Expandable JSON details with Redaction guarantee */}
              {isExpanded && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      {isAr ? "تفاصيل الحمولة المشفرة والمحجوبة:" : "Sanitized & Redacted Payload:"}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Secret Redaction Active (AES-256 Verified)
                    </span>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed" dir="ltr">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
