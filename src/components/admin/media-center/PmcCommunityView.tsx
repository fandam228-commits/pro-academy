"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  RotateCcw,
  Ban,
  Filter,
  User,
  Clock,
  HelpCircle,
  CreditCard,
  Award,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { FacebookIcon, YoutubeIcon, TiktokIcon } from "./icons";
import type { StudentCommentInteraction, CommentClassification, InteractionStatus } from "@/lib/media-center/community-engine";

interface PmcCommunityViewProps {
  lang?: "ar" | "en";
}

export const PmcCommunityView: React.FC<PmcCommunityViewProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";

  const [interactions, setInteractions] = useState<StudentCommentInteraction[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    replied: 0,
    grammarQuestions: 0,
    subscriptionInquiries: 0,
    examQueries: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [platformFilter, setPlatformFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inline reply editing
  const [activeReplyTexts, setActiveReplyTexts] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityData();
  }, [platformFilter, classificationFilter, statusFilter]);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media-center/community?platform=${platformFilter}&classification=${classificationFilter}&status=${statusFilter}`
      );
      if (res.ok) {
        const json = await res.json();
        setInteractions(json.interactions || []);
        if (json.summary) setSummary(json.summary);

        // Pre-fill reply textboxes with AI suggested reply
        const texts: Record<string, string> = {};
        (json.interactions || []).forEach((item: StudentCommentInteraction) => {
          texts[item.id] = item.approvedReply || item.aiSuggestedReply || "";
        });
        setActiveReplyTexts(texts);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReply = async (commentId: string) => {
    const replyText = activeReplyTexts[commentId];
    if (!replyText) return;

    setActionLoading(commentId);
    try {
      const res = await fetch("/api/admin/media-center/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_reply",
          commentId,
          replyText,
        }),
      });

      if (res.ok) {
        setNotification(
          isAr
            ? "تم اعتماد الرد وإرساله للطالب بنجاح!"
            : "Reply approved and sent to student!"
        );
        fetchCommunityData();
      } else {
        setNotification(isAr ? "فشل إرسال الرد." : "Failed to send reply.");
      }
    } catch {
      setNotification(isAr ? "خطأ في الشبكة." : "Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIgnore = async (commentId: string) => {
    setActionLoading(commentId);
    try {
      const res = await fetch("/api/admin/media-center/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ignore", commentId }),
      });
      if (res.ok) {
        setNotification(isAr ? "تم إخفاء/تجاهل التعليق." : "Comment ignored.");
        fetchCommunityData();
      }
    } catch {
      setNotification("Failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />;
      case "youtube":
        return <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />;
      case "tiktok":
        return <TiktokIcon className="w-3.5 h-3.5 text-slate-900 dark:text-white" />;
      default:
        return null;
    }
  };

  const getClassificationBadge = (cls: CommentClassification) => {
    switch (cls) {
      case "grammar_question":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <HelpCircle className="w-2.5 h-2.5" />
            {isAr ? "سؤال في المنهج والقواعد" : "Grammar Question"}
          </span>
        );
      case "subscription_inquiry":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <CreditCard className="w-2.5 h-2.5" />
            {isAr ? "استفسار حجز واشتراك" : "Enrollment Inquiry"}
          </span>
        );
      case "exam_query":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Award className="w-2.5 h-2.5" />
            {isAr ? "امتحان ودرجات" : "Exam Query"}
          </span>
        );
      case "praise":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-2.5 h-2.5" />
            {isAr ? "إشادة وشكر" : "Praise"}
          </span>
        );
      case "spam":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-2.5 h-2.5" />
            {isAr ? "سبام / إعلان" : "Spam"}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-blue-600 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-blue-600/20">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? "إدارة مجتمع واستفسارات الطلاب (Community Hub)" : "Student Community & Inquiries Manager"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "صندوق بريد تفاعلي موحد للرد على أسئلة الطلاب وحجوزات الكورسات مع صياغة ذكية وموافقة إجبارية من مستر حبيب."
              : "Unified social inbox for student comments, AI-assisted drafting, and mandatory educator approval."}
          </p>
        </div>

        <button
          onClick={fetchCommunityData}
          className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث التعليقات" : "Refresh Inbox"}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500">{isAr ? "بانتظار رد المدرس" : "Pending Reply"}</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.pending}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-500">{isAr ? "أسئلة المنهج والجرامر" : "Grammar Questions"}</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.grammarQuestions}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500">{isAr ? "استفسارات الحجز" : "Booking Inquiries"}</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{summary.subscriptionInquiries}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500">{isAr ? "تم الرد عليها" : "Replied"}</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.replied}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          {isAr ? "تصفية:" : "Filter:"}
        </span>

        {/* Platform Filter */}
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="all">{isAr ? "جميع المنصات" : "All Platforms"}</option>
          <option value="facebook">Facebook</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
        </select>

        {/* Classification Filter */}
        <select
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="all">{isAr ? "جميع التصنيفات" : "All Classifications"}</option>
          <option value="grammar_question">{isAr ? "أسئلة المنهج والجرامر" : "Grammar Questions"}</option>
          <option value="subscription_inquiry">{isAr ? "استفسارات الحجز" : "Booking Inquiries"}</option>
          <option value="exam_query">{isAr ? "استفسارات الامتحانات" : "Exam Queries"}</option>
          <option value="praise">{isAr ? "إشادات وشكر" : "Praise"}</option>
          <option value="spam">{isAr ? "إعلانات وسبام" : "Spam"}</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
          <option value="pending_review">{isAr ? "بانتظار الرد" : "Pending Review"}</option>
          <option value="approved_sent">{isAr ? "تم الرد" : "Replied"}</option>
          <option value="ignored">{isAr ? "تم التجاهل" : "Ignored"}</option>
        </select>
      </div>

      {/* Interactions Stream */}
      <div className="space-y-4">
        {interactions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
            {isAr ? "لا توجد تعليقات مطابقة للفلتر المحدد." : "No matching student interactions found."}
          </div>
        ) : (
          interactions.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition space-y-4 ${
                item.status === "pending_review"
                  ? "border-amber-500/30 dark:border-amber-500/20"
                  : "border-slate-200 dark:border-slate-800 opacity-90"
              }`}
            >
              {/* Comment Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{item.authorName}</span>
                      <span className="flex items-center gap-1">{getPlatformIcon(item.platform)}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getClassificationBadge(item.classification)}
                  {item.status === "approved_sent" && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {isAr ? "تم الإرسال" : "Sent"}
                    </span>
                  )}
                </div>
              </div>

              {/* Student Comment Body */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "{item.commentBody}"
              </div>

              {/* AI Suggested / Editable Reply Box */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {item.status === "approved_sent"
                        ? isAr
                          ? "الرد المعتمد والمرسل للطالب:"
                          : "Approved & Sent Reply:"
                        : isAr
                        ? "مسودة الرد المقترحة (صوت مستر حبيب الرحمن — خاضعة للتعديل والموافقة):"
                        : "AI Suggested Response (Teacher Approval Required):"}
                    </span>
                  </span>

                  {item.status === "pending_review" && (
                    <button
                      onClick={() => handleIgnore(item.id)}
                      disabled={actionLoading === item.id}
                      className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition"
                    >
                      {isAr ? "إخفاء / تجاهل التعليق" : "Ignore"}
                    </button>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={activeReplyTexts[item.id] || ""}
                  onChange={(e) =>
                    setActiveReplyTexts((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  disabled={item.status === "approved_sent"}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition leading-relaxed disabled:opacity-80"
                  placeholder={isAr ? "اكتب الرد هنا..." : "Type reply..."}
                />

                {item.status === "pending_review" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleApproveReply(item.id)}
                      disabled={actionLoading === item.id}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      {actionLoading === item.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{isAr ? "اعتماد وإرسال الرد للطالب 🚀" : "Approve & Send Reply"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
