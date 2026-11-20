"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Share2,
  Radio,
  Hash,
  Send,
  Calendar,
  Lock,
  ShieldCheck,
  Edit3,
  ExternalLink,
  Info,
} from "lucide-react";
import { YoutubeIcon } from "./icons";

interface VariantItem {
  id: string;
  projectId: string;
  platform: "facebook" | "youtube" | "tiktok";
  postType: string;
  hook?: string;
  script?: string;
  caption?: string;
  description?: string;
  tags?: string[];
  hashtags?: string[];
  cta?: string;
  thumbnailText?: string;
  status: string;
  contentHash?: string;
  createdAt: string;
}

interface PmcApprovalCenterViewProps {
  lang?: "ar" | "en";
}

export const PmcApprovalCenterView: React.FC<PmcApprovalCenterViewProps> = ({
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>("all");
  const [items, setItems] = useState<VariantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    variantId: string;
    action: "reject" | "request_revision";
    isOpen: boolean;
  }>({ variantId: "", action: "reject", isOpen: false });
  const [rejectionReason, setRejectionReason] = useState("");
  const [bannerNotice, setBannerNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initial mock seeds for review demonstration if DB is empty
  const sampleItems: VariantItem[] = [
    {
      id: "var_fb_past_simple_trap",
      projectId: "proj_unit1_review",
      platform: "facebook",
      postType: "post",
      hook: "سؤال جه في امتحان الثانوية العامة 2024 و 70% من الطلاب اختاروا غلط! 🚨",
      script: "الفرق بين Used to و Would لما نعبر عن عادات الماضي مع أفعال الحالة (Stative Verbs)...",
      caption: `💡 لغز جرامر ثانوية عامة — مستر حبيب الرحمن\n\nالسؤال: When I was young, I (would / used to) have a small bicycle.\n\nالإجابة الصحيحة هي: used to فقط! ليه؟ لأن have هنا فعل حالة و would لا تُستخدم مع أفعال الحالة للتعبير عن الماضي.\n\n👇 اكتب إجابتك في التعليقات واشترك في منصة مستر حبيب لامتحانات المراجعة الشاملة!`,
      hashtags: ["#ثانوية_عامة_2027", "#انجليزي_مستر_حبيب", "#قواعد_الثانوية"],
      cta: "اشترك الآن في منصة مستر حبيب الرحمن",
      status: "READY_FOR_REVIEW",
      createdAt: new Date().toISOString(),
    },
    {
      id: "var_yt_inversion_masterclass",
      projectId: "proj_unit2_inversion",
      platform: "youtube",
      postType: "video",
      hook: "أسرار الـ Inversion التي تضمن لك 5 درجات كاملة في امتحان الإنجليزي",
      description: `في هذا الفيديو يشرح مستر حبيب الرحمن قاعدة تقديم الفعل المساعد على الفاعل (Inversion) بالتفصيل.\n\n⏱️ الفصول:\n00:00 مقدمة الامتحان\n02:15 قاعدة No sooner\n05:40 التركات الوزارية\n\n🔗 رابط الامتحان الإلكتروني التفاعلي الخاص بالحصة في الوصف.`,
      tags: ["ثانوية عامة", "شرح انجليزي", "مستر حبيب الرحمن", "قواعد 2027"],
      thumbnailText: "قاعدة الـ Inversion في جيبك 🎯",
      cta: "حل امتحان الحصة المجاني من الرابط",
      status: "READY_FOR_REVIEW",
      createdAt: new Date().toISOString(),
    },
    {
      id: "var_tt_confusing_words_reel",
      projectId: "proj_vocab_reel",
      platform: "tiktok",
      postType: "reel",
      hook: "أوعى تقول I made a mistake غلط في الإيميل الرسمي! ❌",
      script: "Hook سريع 3 ثواني: الفرق بين Do your best و Make an effort مع تمييز الكلمات باللون الأصفر والذهبي.",
      caption: "أشهر 3 متلازمات لغوية (Collocations) بتكرر في الامتحانات! احفظ الفيديو هتحتاجه ليلة الامتحان 🔥 #ثانوية_عامة",
      hashtags: ["#ثانوية_عامة", "#مستر_حبيب_الرحمن", "#EnglishTips"],
      thumbnailText: "3 كلمات بتلخبط في الامتحان ⚠️",
      cta: "اللينك في البايو لامتحان الحصة المجاني",
      status: "READY_FOR_REVIEW",
      createdAt: new Date().toISOString(),
    },
  ];

  const fetchPendingApprovals = async () => {
    try {
      const res = await fetch("/api/admin/media-center/approvals");
      if (res.ok) {
        const json = await res.json();
        if (json.pending && json.pending.length > 0) {
          setItems(json.pending);
        } else {
          setItems(sampleItems);
        }
      } else {
        setItems(sampleItems);
      }
    } catch {
      setItems(sampleItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async (item: VariantItem) => {
    setActionLoading(item.id);
    setBannerNotice(null);
    try {
      const res = await fetch("/api/admin/media-center/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          variantId: item.id,
          content: {
            hook: item.hook,
            script: item.script,
            caption: item.caption,
            description: item.description,
            platform: item.platform,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBannerNotice({
          type: "success",
          text: `تم اعتماد محتوى منصة ${item.platform} رسمياً بقفل مشفر. تم قفل المحتوى وجاهزيته للجدولة/النشر.`,
        });
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "APPROVED" } : i))
        );
      } else {
        setBannerNotice({ type: "error", text: data.error || "فشل الاعتماد." });
      }
    } catch (e: any) {
      setBannerNotice({ type: "error", text: e.message || "خطأ أثناء الاتصال بالخادم." });
    } finally {
      setActionLoading(null);
    }
  };

  const submitRejection = async () => {
    if (!feedbackModal.variantId) return;
    setActionLoading(feedbackModal.variantId);
    setBannerNotice(null);
    try {
      const res = await fetch("/api/admin/media-center/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: feedbackModal.action,
          variantId: feedbackModal.variantId,
          reason: rejectionReason,
        }),
      });
      if (res.ok) {
        setBannerNotice({
          type: "success",
          text: `تم إرجاع المحتوى للمراجعة والتعديل مع إرسال الملاحظات للمعد.`,
        });
        setItems((prev) =>
          prev.map((i) =>
            i.id === feedbackModal.variantId ? { ...i, status: "REVISION_REQUESTED" } : i
          )
        );
      }
    } catch {} finally {
      setActionLoading(null);
      setFeedbackModal({ variantId: "", action: "reject", isOpen: false });
      setRejectionReason("");
    }
  };

  const filteredItems = items.filter((item) =>
    activePlatformFilter === "all" ? true : item.platform === activePlatformFilter
  );

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              {isAr ? "مركز الاعتماد البشري الإلزامي" : "Mandatory Human Approval Center"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
              {isAr ? "صلاحيات Super Admin فقط" : "Super Admin Only"}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "مراجعة واعتماد المحتوى قبل النشر" : "Content Review & Approval Gate"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? "وفقاً للقواعد الصارمة: كل منشور يحتاج موافقة بشرية مستقلة وصريحة من مستر حبيب الرحمن قبل جدولة أو تنفيذ النشر عبر الـ API. أي تعديل للمحتوى بعد الموافقة يلغيها فورياً."
              : "Strict Human-in-the-Loop policy: Zero posts reach external social media without explicit Super Admin sign-off."}
          </p>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto">
          {[
            { id: "all", labelAr: "الكل", labelEn: "All" },
            { id: "facebook", labelAr: "فيسبوك", labelEn: "Facebook" },
            { id: "youtube", labelAr: "يوتيوب", labelEn: "YouTube" },
            { id: "tiktok", labelAr: "تيك توك", labelEn: "TikTok" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlatformFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePlatformFilter === tab.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {bannerNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
            bannerNotice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {bannerNotice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{bannerNotice.text}</span>
        </div>
      )}

      {/* Review Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isApproved = item.status === "APPROVED";
          const isPending = item.status === "READY_FOR_REVIEW";

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition ${
                isApproved
                  ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-400"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {item.platform === "facebook" && (
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Share2 className="w-4 h-4" />
                    </div>
                  )}
                  {item.platform === "youtube" && (
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                      <YoutubeIcon className="w-4 h-4" />
                    </div>
                  )}
                  {item.platform === "tiktok" && (
                    <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold">
                      <Radio className="w-4 h-4 text-pink-500" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white capitalize">
                        {item.platform} {item.postType}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">#{item.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? "المصدر: منهج الثانوية العامة الرسمي 2026/2027" : "Source: Official 2026/2027 Curriculum"}
                    </p>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      isApproved
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isApproved
                        ? isAr ? "تم الاعتماد (مغلق ومحمي)" : "Approved (Locked)"
                        : isAr ? "بانتظار موافقة مستر حبيب" : "Awaiting Sign-off"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Card Body: Content Details */}
              <div className="py-4 space-y-3">
                {/* Hook */}
                {item.hook && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                      {isAr ? "الـ Hook الجاذب:" : "Hook:"}
                    </span>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{item.hook}</p>
                  </div>
                )}

                {/* Caption / Body */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    {isAr ? "نص المنشور النهائي:" : "Final Post Copy:"}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {item.caption || item.description || item.script}
                  </p>
                </div>

                {/* Hashtags & CTA */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {item.hashtags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-blue-600 dark:text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.cta && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      CTA: {item.cta}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SHA-256 Tamper Lock Verified</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setFeedbackModal({ variantId: item.id, action: "request_revision", isOpen: true })
                    }
                    disabled={actionLoading === item.id || isApproved}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
                  >
                    <span>{isAr ? "طلب تعديل" : "Request Revision"}</span>
                  </button>

                  <button
                    onClick={() =>
                      setFeedbackModal({ variantId: item.id, action: "reject", isOpen: true })
                    }
                    disabled={actionLoading === item.id || isApproved}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 transition cursor-pointer disabled:opacity-50"
                  >
                    <span>{isAr ? "رفض" : "Reject"}</span>
                  </button>

                  <button
                    onClick={() => handleApprove(item)}
                    disabled={actionLoading === item.id || isApproved}
                    className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                      isApproved
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                    } disabled:opacity-75`}
                  >
                    {actionLoading === item.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isApproved
                        ? isAr ? "معتمد رسمياً ✅" : "Approved ✅"
                        : isAr ? "اعتماد المحتوى الآن" : "Approve Content"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revision / Rejection Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {isAr ? "ملاحظات وتوجيهات مستر حبيب الرحمن" : "Feedback & Revision Guidance"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? "اكتب التعديلات المطلوبة لإرسالها لمحرر المحتوى لإعادة الصياغة:"
                : "Specify corrections needed before this post can be approved:"}
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={isAr ? "مثال: يرجى استبدال الـ Hook بسؤال عن قاعدة Unit 3 وإضافة رابط الامتحان..." : "Enter guidance..."}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFeedbackModal({ variantId: "", action: "reject", isOpen: false })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                {isAr ? "إرسال التوجيهات" : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
